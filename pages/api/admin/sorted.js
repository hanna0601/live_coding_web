import { PrismaClient } from '@prisma/client';
import withAuthentication from '../../../middleware/authToken';

const prisma = new PrismaClient();

async function handler(req, res) {
  const { page = 1, limit = 10, type } = req.query;
  const userId = req.user.userId;

  // Check if the user is an admin
  const isAdmin = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  });

  if (!isAdmin.isAdmin) {
    return res.status(403).json({ error: 'Access denied' });
  }

  if (req.method === 'GET') {
    try {
      let allResults;

      if (type === 'posts') {
        // Fetch all blog posts
        allResults = await prisma.blogPost.findMany({
          include: {
            author: true,
            tags: true,
            comments: true,
            _count: {
              select: { reports: true },
            },
          },
        });
      } else if (type === 'comments') {
        // Fetch all comments
        allResults = await prisma.comment.findMany({
          include: {
            author: true,
            post: true,
            _count: {
              select: { reports: true },
            },
          },
        });
      } else {
        return res.status(400).json({ error: 'Invalid type parameter' });
      }

      // Sort all results by the number of reports
      allResults.sort((a, b) => b._count.reports - a._count.reports);

      // Paginate the sorted results
      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
      const offset = (pageNumber - 1) * limitNumber;
      const paginatedResults = allResults.slice(offset, offset + limitNumber);

      res.status(200).json({ results: paginatedResults, total: allResults.length });
      res.status(200).json(paginatedResults);
    } catch (error) {
      console.error('Error fetching sorted content:', error);
      res.status(500).json({ error: 'Failed to fetch sorted content', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuthentication(handler);
