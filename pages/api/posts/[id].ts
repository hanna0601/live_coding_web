import { PrismaClient } from '@prisma/client';
import withAuthentication, { AuthenticatedNextApiRequest } from '../../../middleware/authToken';
import { NextApiResponse } from 'next';

const prisma = new PrismaClient();

async function handler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
  let userId: number | null = null;

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

      // Only check authentication for hidden posts
      if (post.isHidden) {
        const authHeader = req.headers['authorization'];
        if (authHeader) {
          try {
            await withAuthentication((req) => {
              userId = req.user?.userId ?? null;
            })(req, res);
          } catch (error) {
            return res.status(403).json({ error: 'You are not authorized to view this post' });
          }
        }

        if (post.authorId !== userId) {
          return res.status(403).json({ error: 'You are not authorized to view this post' });
        }
      }

      res.status(200).json(post);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve the post', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handler;
