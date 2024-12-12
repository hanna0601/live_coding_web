import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { firstName, lastName, email, password, phoneNumber, username} = req.body;

  // 检查邮箱是否已存在
  const existingUser = await prisma.user.findFirst({ 
    where: { 
      OR: [
        { email },
        { username }
      ]
    } 
  });
  if (existingUser) {
    if (existingUser.email === email) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    if (existingUser.username === username) {
      return res.status(400).json({ error: 'Username already taken' });
    }
  }

  // 密码哈希
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // 创建用户
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      passwordHash,
      phoneNumber,
      username,
    },
  });

  // 生成JWT令牌
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, {
    expiresIn: '2h',
  });
  res.status(201).json({ token });
}
