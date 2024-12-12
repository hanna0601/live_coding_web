import { PrismaClient } from '@prisma/client';
import withAuthentication, { AuthenticatedNextApiRequest } from '../../../middleware/authToken';
import { NextApiResponse } from 'next';

const prisma = new PrismaClient();

async function handler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { title, explanation, tags, codeContent, language, forkFromId } = req.body;
    const userId = req.user.userId;

    if (!title || !codeContent || !language) {
      return res.status(400).json({ error: 'Title, code content, and language are required' });
    }

    try {
      let forkFromTemplate = null;
      if (forkFromId) {
        forkFromTemplate = await prisma.template.findUnique({
          where: { id: forkFromId },
        });
        if (!forkFromTemplate) {
          return res.status(404).json({ error: 'Original template not found for forking' });
        }
      }

      const template = await prisma.template.create({
        data: {
          title,
          explanation,
          codeContent,
          language,
          authorId: userId,
          forkFromId: forkFromTemplate ? forkFromTemplate.id : null,
          tags: {
            connectOrCreate: tags.map((tag: string) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
        },
      });

      return res.status(201).json({
        data: template,
        message: forkFromTemplate ? 'Template saved as a forked version' : 'Template saved successfully',
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

export default withAuthentication(handler);