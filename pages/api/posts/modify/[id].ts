import { PrismaClient } from '@prisma/client';
import withAuthentication from '../../../../middleware/authToken';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends NextApiRequest {
  user?: { userId: number };
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
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

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const post = await prisma.blogPost.findUnique({
        where: { id: parseInt(id as string) },
        include: {
          tags: true,
          author: true,
          templates: {
            include: {
              tags: true,
              author: true,
            },
          },
        },
      });

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // If the post is hidden, ensure the requesting user is the author
      if (post.isHidden && post.authorId !== userId) {
        return res.status(403).json({ error: 'You are not authorized to view this post' });
      }

      res.status(200).json(post);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve the post', details: error.message });
    }
  } else if (req.method === 'PUT') {
    const { title, description, content, tags, templates } = req.body;

    try {
      const post = await prisma.blogPost.findUnique({
        where: { id: parseInt(id as string) },
      });

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Only allow updates if the user is the author
      if (post.authorId !== userId) {
        return res.status(403).json({ error: 'You are not authorized to edit this post' });
      }

      if (post.isHidden) {
        return res.status(403).json({ error: 'You are not authorized to edit this post' });
      }

      const updatedPost = await prisma.blogPost.update({
        where: { id: parseInt(id as string) },
        data: {
          title,
          description,
          content,
          tags: {
            set: [],
            connectOrCreate: tags.map((tag: string) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
          templates: {
            set: [],
            connect: templates.map((templateId: number) => ({ id: templateId })),
          },
        },
      });
      res.status(200).json(updatedPost);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update the blog post', details: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const post = await prisma.blogPost.findUnique({
        where: { id: parseInt(id as string) },
      });

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Only allow deletion if the user is the author
      if (post.authorId !== userId) {
        return res.status(403).json({ error: 'You are not authorized to delete this post' });
      }

      if (post.isHidden) {
        return res.status(403).json({ error: 'You are not authorized to delete this post' });
      }

      await prisma.blogPost.delete({
        where: { id: parseInt(id as string) },
      });
      return res.status(200).json({ message: 'Post deleted successfully.' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete the blog post', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuthentication(handler);