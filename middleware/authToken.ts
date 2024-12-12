import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

interface DecodedToken {
  refreshTokenId?: string;
  [key: string]: any;
}

export interface AuthenticatedNextApiRequest extends NextApiRequest {
  user?: DecodedToken;
}

function withAuthentication(
  handler: (req: AuthenticatedNextApiRequest, res: NextApiResponse) => Promise<void> | void
) {
  return async (req: AuthenticatedNextApiRequest, res: NextApiResponse) => {
    const authHeader = req.headers['authorization'] as string | undefined;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token is missing' });
    }

    try {
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
      }

      const decodedAccessToken = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;
      req.user = decodedAccessToken;

      // 从cookie中获取refresh token
      const refreshToken = req.cookies.refreshToken;
      if (refreshToken) {
        if (!process.env.JWT_REFRESH_SECRET) {
          throw new Error('JWT_REFRESH_SECRET is not defined');
        }

        const decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET) as DecodedToken;
        if (decodedAccessToken.refreshTokenId !== decodedRefreshToken.refreshTokenId) {
          return res.status(403).json({ error: 'Invalid refresh token' });
        }
      } else {
        return res.status(403).json({ error: 'Refresh token is missing' });
      }
    } catch (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    return handler(req, res);
  };
}

export default withAuthentication;
