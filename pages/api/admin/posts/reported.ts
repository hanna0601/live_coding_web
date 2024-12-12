// pages/api/comments/index.js
import { PrismaClient } from '@prisma/client';
import withAuthentication, { AuthenticatedNextApiRequest } from '../../../../middleware/authToken';
import { NextApiResponse } from 'next';

const prisma = new PrismaClient();

async function handler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
  const { page = 1, limit = 10 } = req.query;

  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = req.user.userId;

  // Check if the user is an admin
  const isAdmin = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  });

  if (!isAdmin) {
    return res.status(403).json({ error: 'Access denied' });
  }

  if (req.method === 'GET') {
    try {
      const pageNumber = Number(page);
      const limitNumber = Number(limit);
      const offset = (pageNumber - 1) * limitNumber;

      // Fetch blog posts sorted by the number of reports
      const posts = await prisma.blogPost.findMany({
        include: {
          author: true,
          tags: true,
          comments: true,
          _count: {
            select: { reports: true },
          },
        },
        orderBy: {
          reports: {
            _count: 'desc',
          },
        },
        skip: offset,
        take: limitNumber,
      });

      res.status(200).json(posts);
    } catch (err) {
      const error = err as Error; // Explicitly type the error
      console.error('Error fetching reported posts:', error);
      res.status(500).json({ error: 'Failed to fetch reported posts', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuthentication(handler);