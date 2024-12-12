import { PrismaClient } from '@prisma/client';
import withAuthentication, { AuthenticatedNextApiRequest } from '../../../middleware/authToken';
import { NextApiResponse } from 'next';

const prisma = new PrismaClient();

async function handler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
  // 验证用户身份
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    // 获取用户资料
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        username: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        isAdmin: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json(user);
  } else if (req.method === 'PUT') {
    // 更新用户资料
    const { firstName, lastName, phoneNumber, avatarUrl } = req.body;
    // 验证输入数据（可选）
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        phoneNumber,
        avatarUrl,
        updatedAt: new Date(),
      },
    });

    return res.status(200).json({ message: 'Profile updated successfully' });
  } else {
    // 仅允许GET和PUT方法
    res.setHeader('Allow', ['GET', 'PUT']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

export default withAuthentication(handler);
