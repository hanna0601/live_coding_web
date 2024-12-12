import formidable, { File } from 'formidable';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import withAuthentication, { AuthenticatedNextApiRequest } from '../../../../middleware/authToken';
import { NextApiResponse } from 'next';

const prisma = new PrismaClient();
const defaultAvatarUrl = '/uploads/avatars/hacker.png';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const uploadDir = path.join(process.cwd(), '/public/uploads/avatars');

  const parseForm = (): Promise<{ fields: formidable.Fields; files: formidable.Files }> =>
    new Promise((resolve, reject) => {
      const form = formidable({
        uploadDir: uploadDir,
        keepExtensions: true,
        maxFileSize: 2 * 1024 * 1024, // 2MB
        multiples: false,
      });

      form.parse(req, (err, fields, files) => {
        if (err) {
          if (
            err.code === 'LIMIT_FILE_SIZE' ||
            err.code === 1009 ||
            (err as any).httpCode === 413
          ) {
            return reject({ statusCode: 413, message: 'File size exceeds limit of 2MB' });
          }
          return reject({ statusCode: 400, message: 'Error parsing the files' });
        }
        resolve({ fields, files });
      });
    });

  try {
    const { files } = await parseForm();
    let file = files.avatar as File | File[];

    if (Array.isArray(file)) {
      file = file[0];
    }

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = file.filepath || (file as any).path;
    if (!filePath) {
      return res.status(400).json({ error: 'File path not found' });
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype || '')) {
      await fsPromises.unlink(filePath);
      return res.status(400).json({ error: 'Invalid file type' });
    }

    const fileExt = path.extname(file.originalFilename || '');
    const fileName = `avatar_${req.user?.userId}_${Date.now()}${fileExt}`;
    const newFilePath = path.join(uploadDir, fileName);

    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
      select: { avatarUrl: true },
    });

    const oldAvatarUrl = user?.avatarUrl;

    // 如果当前头像不是默认头像，则删除旧头像
    if (oldAvatarUrl && oldAvatarUrl !== defaultAvatarUrl) {
      const oldAvatarPath = path.join(process.cwd(), 'public', oldAvatarUrl);
      if (oldAvatarPath.startsWith(uploadDir)) {
        try {
          await fsPromises.unlink(oldAvatarPath);
        } catch (unlinkErr) {
          console.error('Error deleting old avatar:', unlinkErr);
        }
      }
    }

    // 移动新上传的文件到目标位置
    await fsPromises.rename(filePath, newFilePath);
    const avatarUrl = `/uploads/avatars/${fileName}`;

    // 更新用户头像URL
    await prisma.user.update({
      where: { id: req.user?.userId },
      data: { avatarUrl },
    });

    return res.status(200).json({ message: 'Avatar uploaded successfully', avatarUrl });
  } catch (error: any) {
    console.error('Error processing avatar upload:', error.message || error);
    return res.status(error.statusCode || 500).json({ error: error.message || 'Server error' });
  }
}

export default withAuthentication(handler);
