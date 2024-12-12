// pages/api/comments/index.js
import { PrismaClient } from '@prisma/client';
import withAuthentication, { AuthenticatedNextApiRequest } from '../../../middleware/authToken';
import { NextApiResponse } from 'next';

const prisma = new PrismaClient();

async function handler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
  
  const { contentId, contentType } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check if the user is an admin
  const isAdmin = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  });

  if (!isAdmin || !isAdmin.isAdmin) {
    return res.status(403).json({ error: 'Access denied' });
  }

  if (req.method === 'POST') {
    try {
      if (contentType === 'BlogPost') {
        await prisma.blogPost.update({
          where: { id: contentId },
          data: { isHidden: true },
        });
      } else if (contentType === 'Comment') {
        await prisma.comment.update({
          where: { id: contentId },
          data: { isHidden: true },
        });
      } else {
        return res.status(400).json({ error: 'Invalid content type' });
      }

      res.status(200).json({ message: 'Content hidden successfully' });
    } catch (err) {
      const error = err as Error; // Explicitly type the error
      console.error('Error hiding content:', error);
      res.status(500).json({ error: 'Failed to hide content', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuthentication(handler);
