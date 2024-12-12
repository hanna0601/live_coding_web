import { PrismaClient } from '@prisma/client';
import withAuthentication, { AuthenticatedNextApiRequest } from '../../../../middleware/authToken';
import { NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {

  let userId = null;

  const authHeader = req.headers['authorization'];

  if (authHeader) {
    try {
      await withAuthentication(async (req) => {
        userId = req.user?.userId;
      })(req, res);
    } catch (error) {
      // if error is 401, this is a visitor
      if (error.message === 'Access token is missing') {
        userId = null;
        console.log('Visitor mode, authentication skipped');
      } else {
        console.error('Authentication error:', error);
      }
    }
  }

  if (!userId) {
    return res.status(401).json({ error: 'Please login to vote!' });
  }

  const { id } = req.query; // Comment ID
  const { voteType } = req.body; // 'upvote' or 'downvote'


  if (req.method === 'POST') {
    try {
      const commentId = Number(id);

      // Check if the comment exists
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
      });

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      // Find existing vote by the user
      const existingVote = await prisma.commentVote.findUnique({
        where: {
          userId_commentId: {
            userId,
            commentId,
          },
        },
      });

      let updatedComment;

      if (existingVote) {
        if (existingVote.voteType === voteType) {
          // Withdraw the vote (same vote type clicked twice)
          await prisma.$transaction([
            prisma.commentVote.delete({
              where: {
                userId_commentId: {
                  userId,
                  commentId,
                },
              },
            }),
            prisma.comment.update({
              where: { id: commentId },
              data: {
                [voteType === 'upvote' ? 'upvotes' : 'downvotes']: {
                  decrement: 1,
                },
              },
            }),
          ]);
        } else {
          // Switch vote type (e.g., upvote to downvote)
          await prisma.$transaction([
            prisma.commentVote.update({
              where: {
                userId_commentId: {
                  userId,
                  commentId,
                },
              },
              data: {
                voteType,
              },
            }),
            prisma.comment.update({
              where: { id: commentId },
              data: {
                upvotes: voteType === 'upvote' ? { increment: 1 } : { decrement: 1 },
                downvotes: voteType === 'downvote' ? { increment: 1 } : { decrement: 1 },
              },
            }),
          ]);
        }
      } else {
        // Create a new vote
        await prisma.$transaction([
          prisma.commentVote.create({
            data: {
              userId,
              commentId,
              voteType,
            },
          }),
          prisma.comment.update({
            where: { id: commentId },
            data: {
              [voteType === 'upvote' ? 'upvotes' : 'downvotes']: { increment: 1 },
            },
          }),
        ]);
      }

      // Fetch the updated comment
      updatedComment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: {
          id: true,
          upvotes: true,
          downvotes: true,
          content: true,
          author: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      res.status(200).json(updatedComment);
    } catch (error) {
      console.error('Error updating vote:', error);
      res.status(500).json({ error: 'Failed to update vote' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}


