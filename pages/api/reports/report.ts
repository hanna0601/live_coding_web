import { PrismaClient } from '@prisma/client';
import withAuthentication, { AuthenticatedNextApiRequest } from '../../../middleware/authToken';
import { NextApiResponse } from 'next';

const prisma = new PrismaClient();

async function handler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { contentId, contentType, explanation } = req.body;
    const reporterId = req.user?.userId;

    if (!contentId || !contentType || !explanation || !reporterId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      // Check if the content is hidden
      let isHidden = false;
      if (contentType === 'BlogPost') {
        const post = await prisma.blogPost.findUnique({
          where: { id: Number(contentId) },
          select: { isHidden: true },
        });

        if (!post) {
          return res.status(404).json({ error: 'Blog post not found' });
        }

        isHidden = post.isHidden;
      } else if (contentType === 'Comment') {
        const comment = await prisma.comment.findUnique({
          where: { id: Number(contentId) },
          select: { isHidden: true },
        });

        if (!comment) {
          return res.status(404).json({ error: 'Comment not found' });
        }

        isHidden = comment.isHidden;
      } else {
        return res.status(400).json({ error: 'Invalid content type' });
      }

      if (isHidden) {
        return res.status(403).json({ error: 'Reporting on hidden content is not allowed' });
      }

      // Create the report
      let report;
      if (contentType === 'BlogPost') {
        report = await prisma.postReport.create({
          data: {
            contentId,
            contentType,
            explanation,
            reporterId,
          },
        });
      } else if (contentType === 'Comment') {
        report = await prisma.commentReport.create({
          data: {
            contentId,
            contentType,
            explanation,
            reporterId,
          },
        });
      }

      res.status(201).json(report);
    } catch (err) {
      const error = err as Error; // Explicitly type the error
      console.error('Error creating report:', error);
      res.status(500).json({ error: 'Failed to create report', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuthentication(handler);
