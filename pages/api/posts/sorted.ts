import { PrismaClient } from '@prisma/client';
import withAuthentication, { AuthenticatedNextApiRequest } from '../../../middleware/authToken';  // Add the authentication middleware
import { NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
  try {
    const { sortBy, page = 1, limit = 10 } = req.query;
    let userId = null; // Default to null for visitors

    // Check if the request contains an Authorization header
    const authHeader = req.headers['authorization'];

    if (authHeader) {
      // If the Authorization header exists, try to authenticate the user
      try {
        await withAuthentication(async (req) => {
          userId = req.user?.userId; // Set the authenticated user ID
        })(req, res);
      } catch (error) {
        const err = error as Error;
        console.log('not user', err);
        // If token is invalid or expired, we treat the user as a visitor (userId stays null)
      }
    }

    if (req.method === 'GET') {
      const pageNumber = Number(page);
      const limitNumber = Number(limit);
      const offset = (pageNumber - 1) * limitNumber;

      // Build the where clause based on whether the user is authenticated
      let whereClause = { isHidden: false };  // Default to showing non-hidden posts for visitors

      if (userId) {
        // If user is authenticated, show both visible posts and user's own hidden posts
        whereClause = {
          // @ts-expect-error: need the or clause
          OR: [
            { isHidden: false },  // Show all visible posts
            { authorId: userId }  // Show the authenticated user's hidden posts
          ]
        };
      }

      // Fetch blog posts with author, tags, and comments included
      let posts = await prisma.blogPost.findMany({
        where: whereClause,
        include: {
          author: true,
          tags: true,
          comments: true
        },
        skip: offset,
        take: limitNumber,
      });

      // Handle sorting based on the `sortBy` query parameter
      if (posts.length > 0) {
        if (sortBy === 'upvotes') {
          posts = posts.sort((a, b) => {
            if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes;
            return b.downvotes - a.downvotes;
          });
        } else if (sortBy === 'downvotes') {
          posts = posts.sort((a, b) => {
            if (b.downvotes !== a.downvotes) return b.downvotes - a.downvotes;
            return b.upvotes - a.upvotes;
          });
        } else if (sortBy === 'total_votes') {
          posts = posts.sort((a, b) =>
            (b.upvotes + b.downvotes) - (a.upvotes + a.downvotes)
          );
        }
      }

      res.status(200).json(posts);
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (err) {
    const error = err as Error; // Explicitly type the error
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts', details: error.message });
  }
}
