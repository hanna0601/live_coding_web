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


  const { id } = req.query; // Get the post ID from the request
  const { voteType } = req.body; // Expect either 'upvote' or 'downvote'

  console.log(req.user);

  // Ensure user is authenticated
  if (!req.user) {
    return res.status(401).json({ error: 'Please login to vote on posts!' });
  }


  if (req.method === 'POST') {
    try {
      // Ensure id is a valid number
      const postId = Number(id);
      if (isNaN(postId)) {
        return res.status(400).json({ error: 'Invalid post ID' });
      }

      // Validate voteType
      if (!['upvote', 'downvote'].includes(voteType)) {
        return res.status(400).json({ error: 'Invalid vote type' });
      }

      // Check if the post exists and is not hidden
      const post = await prisma.blogPost.findUnique({
        where: { id: postId },
        select: { isHidden: true },
      });

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      if (post.isHidden) {
        return res.status(403).json({ error: 'Voting on hidden posts is not allowed' });
      }

      // Check if the user has already voted on this post
      const existingVote = await prisma.postVote.findUnique({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

      if (existingVote) {
        if (existingVote.voteType === voteType) {
          // Withdraw vote
          await prisma.$transaction([
            prisma.postVote.delete({
              where: {
                userId_postId: {
                  userId,
                  postId,
                },
              },
            }),
            prisma.blogPost.update({
              where: { id: postId },
              data: {
                [voteType === 'upvote' ? 'upvotes' : 'downvotes']: { decrement: 1 },
              },
            }),
          ]);
          const updatedPost = await prisma.blogPost.findUnique({
            where: { id: postId },
            select: {
              id: true,
              upvotes: true,
              downvotes: true,
              title: true,
              description: true,
            },
          });

          return res.status(200).json(updatedPost);
        } else {
          // Switch vote type
          await prisma.$transaction([
            prisma.postVote.update({
              where: {
                userId_postId: {
                  userId,
                  postId,
                },
              },
              data: {
                voteType,
              },
            }),
            prisma.blogPost.update({
              where: { id: postId },
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
          prisma.postVote.create({
            data: {
              userId,
              postId,
              voteType,
            },
          }),
          prisma.blogPost.update({
            where: { id: postId },
            data: {
              [voteType === 'upvote' ? 'upvotes' : 'downvotes']: { increment: 1 },
            },
          }),
        ]);
      }

      // Return the updated post
      const updatedPost = await prisma.blogPost.findUnique({
        where: { id: postId },
        select: {
          id: true,
          upvotes: true,
          downvotes: true,
          title: true,
          description: true,
        },
      });

      res.status(200).json(updatedPost);
    } catch (err: any) {
      console.error('Error updating blog post vote:', err);
      res.status(500).json({ error: 'Failed to update vote', details: err.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}


