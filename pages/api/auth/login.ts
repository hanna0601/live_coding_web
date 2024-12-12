import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { email, password } = req.body;
  // check if user exists
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(400).json({ error: 'User does not exist' });
  }

  // verify password
  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    return res.status(400).json({ error: 'Invalid password' });
  }

  console.log('JWT_SECRET:', process.env.JWT_SECRET);
  const refreshTokenId = uuidv4();

  // generate JWT token
  const token = jwt.sign(
    {
      userId: user.id,
      refreshTokenId,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: '2h' }
  );

  const refreshToken = jwt.sign(
    {
      userId: user.id,
      refreshTokenId,
    },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: '7d' }
  );

  res.setHeader(
    'Set-Cookie',
    `refreshToken=${refreshToken}; HttpOnly; Secure; Path=/; Max-Age=${7 * 24 * 60 * 60}`
  );
  res.status(200).json({ token });
}
