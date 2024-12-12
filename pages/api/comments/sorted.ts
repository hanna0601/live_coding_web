// pages/api/comments/sorted.ts
import { PrismaClient } from '@prisma/client';
import withAuthentication, { AuthenticatedNextApiRequest } from '../../../middleware/authToken';
import { NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
  try {
    const { postId, sortBy, page = 1, limit = 10 } = req.query;
    let userId = null;

    const authHeader = req.headers['authorization'];

    if (authHeader) {
      try {
        await withAuthentication(async (req) => {
          userId = req.user?.userId;
        })(req, res);
      } catch (error) {
        console.log('Visitor mode, authentication skipped');
      }
    }

    if (req.method === 'GET') {
      const postID = Number(postId);
      const pageNumber = Number(page);
      const limitNumber = Number(limit);
      const offset = (pageNumber - 1) * limitNumber;

      let whereClause: any = { postId: postID, isHidden: false };

      if (userId) {
        whereClause = {
          postId: postID,
          OR: [
            { isHidden: false },
            { authorId: userId },
          ],
        };
      }

      // Get the total count of comments for pagination
      const totalComments = await prisma.comment.count({
        where: whereClause,
      });

      // Fetch the comments with pagination
      let comments = await prisma.comment.findMany({
        where: whereClause,
        include: {
          author: true,
          replies: { include: { author: true } },
        },
        skip: offset,
        take: limitNumber,
      });

      // Sort the comments based on the provided sorting criteria
      if (sortBy === 'upvotes') {
        comments.sort((a, b) => b.upvotes - a.upvotes);
      } else if (sortBy === 'downvotes') {
        comments.sort((a, b) => b.downvotes - a.downvotes);
      } else if (sortBy === 'total_votes') {
        comments.sort((a, b) => (b.upvotes + b.downvotes) - (a.upvotes + a.downvotes));
      }

      // Return comments along with the total count
      res.status(200).json({ comments, total: totalComments });
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (err) {
    const error = err as Error;
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments', details: error.message });
  }
}
