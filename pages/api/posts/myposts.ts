import { PrismaClient } from '@prisma/client';
import withAuthentication, { AuthenticatedNextApiRequest } from '../../../middleware/authToken';
import { NextApiResponse } from 'next';

const prisma = new PrismaClient();

async function handler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
  let userId: number | null = null;

  // Extract userId from the authentication middleware
  try {
    await withAuthentication((req) => {
      userId = req.user?.userId ?? null;
    })(req, res);
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const { page = 1, limit = 9 } = req.query;
      const pageNumber = Number(page);
      const limitNumber = Number(limit);
      const offset = (pageNumber - 1) * limitNumber;

      // Fetch posts for the authenticated user
      const [posts, totalCount] = await Promise.all([
        prisma.blogPost.findMany({
          where: { authorId: userId },
          skip: offset,
          take: limitNumber,
          orderBy: { createdAt: 'desc' },
          include: {
            author: { select: { id: true, firstName: true, lastName: true } },
            tags: true,
            comments: true,
          },
        }),
        prisma.blogPost.count({ where: { authorId: userId } }),
      ]);

      return res.status(200).json({ posts, total: totalCount });
    } catch (error) {
      console.error('Error fetching posts:', error);
      return res.status(500).json({ error: 'Failed to fetch posts' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handler;
