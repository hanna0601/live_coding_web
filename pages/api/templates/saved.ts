import { PrismaClient } from '@prisma/client';
import withAuthentication, { AuthenticatedNextApiRequest } from '../../../middleware/authToken';
import { NextApiResponse } from 'next';

const prisma = new PrismaClient();

async function handler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
  const userId = req.user.userId;

  if (req.method === 'POST') {
    const { templateId } = req.body;

    if (!templateId) {
      return res.status(400).json({ error: 'Template ID is required' });
    }

    try {
      const template = await prisma.template.findUnique({
        where: { id: parseInt(templateId) },
      });

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          savedTemplates: {
            connect: { id: template.id },
          },
        },
      });

      return res.status(200).json({ message: 'Template added to saved templates' });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'GET') {
    const { title, tags, language, page = '1', limit = '10' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {
      usersSaved: { some: { id: userId } },
    };

    if (title) {
      where.title = { contains: title as string };
    }

    if (tags) {
      where.tags = {
        some: { name: { in: (tags as string).split(',') } },
      };
    }

    if (language) {
      where.language = language as string;
    }

    try {
      const savedTemplates = await prisma.template.findMany({
        where,
        select: {
          id: true,
          title: true,
          explanation: true,
          tags: { select: { name: true } },
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      });

      const totalSavedTemplates = await prisma.template.count({ where });
      const totalPages = Math.ceil(totalSavedTemplates / take);

      return res.status(200).json({
        data: savedTemplates,
        pagination: {
          currentPage: parseInt(page as string),
          totalPages,
          totalSavedTemplates,
        },
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    const { templateId } = req.body;

    if (!templateId) {
      return res.status(400).json({ error: 'Template ID is required' });
    }

    try {
      const template = await prisma.template.findUnique({
        where: { id: parseInt(templateId) },
      });

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          savedTemplates: {
            disconnect: { id: template.id },
          },
        },
      });

      return res.status(200).json({ message: 'Template removed from saved templates' });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

export default withAuthentication(handler);