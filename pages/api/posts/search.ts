import { PrismaClient } from '@prisma/client';
import withAuthentication, { AuthenticatedNextApiRequest } from '../../../middleware/authToken';
import { NextApiResponse } from 'next';

const prisma = new PrismaClient();

async function handler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
  try {
    const { searchQuery = '', page = '1', limit = '10', sortBy = '' } = req.query;
    let userId: number | null = null;

    const authHeader = req.headers['authorization'];

    if (authHeader) {
      try {
        await withAuthentication((req) => {
          userId = req.user?.userId ?? null;
        })(req, res);
      } catch (error) {
        console.error('Authentication error:', error);
      }
    }

    if (req.method === 'GET') {
      const loweredQuery = (searchQuery as string).toLowerCase();
      const pageNumber = parseInt(page as string);
      const limitNumber = parseInt(limit as string);
      const offset = (pageNumber - 1) * limitNumber;

      const searchConditions = {
        OR: [
          { isHidden: false },
          { isHidden: true, authorId: userId },
        ],
        AND: [
          {
            OR: [
              { title: { contains: loweredQuery } },
              { description: {contains: loweredQuery}},
              { content: { contains: loweredQuery } },
              { tags: { some: { name: { contains: loweredQuery } } } },
              { templates: { some: { 
                codeContent: { contains: loweredQuery }, 
                title: { contains: loweredQuery }, 
                explanation: { contains: loweredQuery },
                language: { contains: loweredQuery }
              } } },
              {author: { firstName: { contains: loweredQuery }, lastName: { contains: loweredQuery } }},
              {comments: { some: { content: { contains: loweredQuery } } }}
            ],
          },
        ],
      };

      let allPosts = await prisma.blogPost.findMany({
        where: searchConditions,
        include: {
          author: true,
          tags: true,
          comments: true,
        },
      });

      if (sortBy === 'total_votes') {
        allPosts = allPosts.sort((a, b) => (b.upvotes + b.downvotes) - (a.upvotes + a.downvotes));
      }

      const paginatedPosts = allPosts.slice(offset, offset + limitNumber);

      const totalCount = allPosts.length;

      res.status(200).json({ posts: paginatedPosts, totalCount, page: pageNumber, limit: limitNumber });
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts', details: error.message });
  }
}

export default handler;
