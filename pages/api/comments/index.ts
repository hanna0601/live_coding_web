import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import withAuthentication, { AuthenticatedNextApiRequest } from '../../../middleware/authToken';

const prisma = new PrismaClient();

export default async function handler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {



  if (req.method === 'POST') {

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
      return res.status(401).json({ error: 'Please login to submit a comment!' });
    }

    const { content, postId, parentId } = req.body;


    console.log('Received content:', content);
    console.log('Received postId:', postId);
    console.log('User ID:', userId);


    if (!content || !postId) {
      return res.status(400).json({ error: 'Content and postId are required' });
    }

    try {
      const comment = await prisma.comment.create({
        data: {
          content,
          author: { connect: { id: userId } },
          post: { connect: { id: Number(postId) } },
          parent: parentId ? { connect: { id: Number(parentId) } } : undefined,
        },
        include: {
          author: {
            select: {
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      });

      console.log('Comment created successfully:', comment);
      res.status(201).json(comment);
    } catch (error) {
      console.error('Error creating comment:', error);
      res.status(500).json({ error: 'Failed to create comment' });
    }
  } else if (req.method === 'GET') {

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
    
    const { postId, page = 1, limit = 10, sortBy = '' } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const offset = (pageNumber - 1) * limitNumber;

    

    try {
      let allComments = await prisma.comment.findMany({
        where: {
          postId: Number(postId),
          OR: [
            { isHidden: false },
            { authorId: userId ?? undefined }
          ]
        },
        include: {
          author: {
            select: {
              firstName: true,
              lastName: true,
              avatarUrl: true,

            },
          },
        },
      });

      if (sortBy === 'upvotes') {
        allComments = allComments.sort((a, b) => b.upvotes - a.upvotes);
      } if (sortBy === 'downvotes') {
        allComments = allComments.sort((a, b) => b.downvotes - a.downvotes);
      } else if (sortBy === 'total_votes') {
        allComments = allComments.sort((a, b) => (b.upvotes + b.downvotes) - (a.upvotes + a.downvotes));
      }

      const paginatedComments = allComments.slice(offset, offset + limitNumber);
      const totalCount = allComments.length;

      res.status(200).json({ comments: paginatedComments, total: totalCount });
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: 'Failed to fetch comments', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}


