import { PrismaClient } from '@prisma/client';
import withAuthentication, { AuthenticatedNextApiRequest } from '../../../middleware/authToken';
import { NextApiResponse } from 'next';

const prisma = new PrismaClient();

async function handler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
  let userId: number | null = null;

  const authHeader = req.headers['authorization'];

  if (authHeader) {
    try {
      await withAuthentication((req) => {
        userId = req.user?.userId ?? null;
      })(req, res);
    } catch (error) {
      console.error('Authentication error:', error);
      userId = null;
    }
  }

  
  if (req.method === 'GET') {
    try {
      const { page = 1, limit = 10, sortBy = '' } = req.query;
      const pageNumber = Number(page);
      const limitNumber = Number(limit);
      const offset = (pageNumber - 1) * limitNumber;

      let allPosts = await prisma.blogPost.findMany({
        where: {
          OR: [
            { isHidden: false },
            { authorId: userId ?? undefined },
          ],
        },
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

      res.status(200).json({ posts: paginatedPosts, total: totalCount });
      
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  } else if (req.method === 'POST') {
    const { title, description, content, tags, templateIds } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const post = await prisma.blogPost.create({
        data: {
          title,
          description,
          content,
          author: { connect: { id: userId } },
          tags: {
            connectOrCreate: tags.map((tag: string) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
          templates: {
            connect: templateIds.map((id: number) => ({ id })),
          },
        },
      });
      res.status(201).json(post);
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ error: 'Failed to create blog post' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handler;

