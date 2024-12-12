import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { title, tags, language, page = '1', limit = '10' } = req.query;

  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const take = parseInt(limit as string);

  const where: any = {};

  const totalCount = await prisma.template.count({ where });

  if (title) {
    where.title = { contains: title as string };
  }

  if (tags) {
    where.tags = {
      some: {
        name: { in: (tags as string).split(',') },
      },
    };
  }

  if (language) {
    where.language = language as string;
  }

  try {
    const templates = await prisma.template.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true },
        },
        tags: true,
      },
    });

    res.status(200).json({ data: templates, totalCount });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default handler;