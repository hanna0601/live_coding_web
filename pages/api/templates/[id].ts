import { PrismaClient } from '@prisma/client';
import withAuthentication, { AuthenticatedNextApiRequest } from '../../../middleware/authToken';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const templateId = parseInt(req.query.id as string);

  if (req.method === 'GET') {
    // Public access for GET requests
    try {
      const template = await prisma.template.findUnique({
        where: { id: templateId },
        include: {
          tags: true,
        }
      });

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      return res.status(200).json({ data: template });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'PUT' || req.method === 'DELETE') {
    // Protected access for PUT and DELETE requests
    return withAuthentication(async (authReq: AuthenticatedNextApiRequest, res: NextApiResponse) => {
      const userId = authReq.user.userId;

      if (req.method === 'PUT') {
        const { title, explanation, tags, codeContent, language } = req.body;

        try {
          const template = await prisma.template.findUnique({
            where: { id: templateId },
          });

          if (!template || template.authorId !== userId) {
            return res.status(404).json({ error: 'Template not found or unauthorized' });
          }

          const updatedTemplate = await prisma.template.update({
            where: { id: templateId },
            data: {
              title,
              explanation,
              codeContent,
              language,
              authorId: userId,
              tags: {
                connectOrCreate: tags.map((tag: string) => ({
                  where: { name: tag },
                  create: { name: tag },
                })),
              },
            },
          });

          return res.status(200).json({ data: updatedTemplate });
        } catch (error) {
          return res.status(500).json({ error: 'Internal server error' });
        }
      } else if (req.method === 'DELETE') {
        try {
          const template = await prisma.template.findUnique({
            where: { id: templateId },
          });

          if (!template || template.authorId !== userId) {
            return res.status(404).json({ error: 'Template not found or unauthorized' });
          }

          await prisma.template.delete({ where: { id: templateId } });

          return res.status(200).json({ message: 'Template deleted successfully' });
        } catch (error) {
          return res.status(500).json({ error: 'Internal server error' });
        }
      }
    })(req, res);
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

export default handler;
