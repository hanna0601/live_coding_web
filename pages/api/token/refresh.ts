import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function refreshTokenHandler(req: NextApiRequest, res: NextApiResponse) {
  // 从cookie中获取refresh token
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }

  try {
    // 验证refresh token
    const decodedRefreshToken = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string
    ) as jwt.JwtPayload;
    const { userId, refreshTokenId } = decodedRefreshToken;

    // 生成新的访问令牌和刷新令牌，使用相同的refreshTokenId
    const newAccessToken = jwt.sign(
      {
        userId,
        refreshTokenId,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '15m' }
    );

    const newRefreshToken = jwt.sign(
      {
        userId,
        refreshTokenId,
      },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: '7d' }
    );

    // 更新refresh token的cookie
    res.setHeader(
      'Set-Cookie',
      `refreshToken=${newRefreshToken}; HttpOnly; Secure; Path=/; Max-Age=${7 * 24 * 60 * 60}`
    );

    // 发送新的访问令牌给客户端
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired refresh token' });
  }
}
