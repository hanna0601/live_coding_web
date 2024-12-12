import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const saltRounds = 10;
  const adminPassword = 'admin123!@#';
  const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

  try {
    await prisma.user.create({
      data: {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@pp1.com',
        username: 'admin',
        passwordHash,
        isAdmin: true,
      },
    });

    console.log('\n✨ Admin user created successfully');
    console.log('📧 Email: admin@pp1.com');
    console.log('🔑 Password: admin123!@#\n');

  } catch (error) {
    const err = error as Prisma.PrismaClientKnownRequestError;
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      console.log('\n⚠️ Admin user or other unique constraint already exists\n');
    } else {
      console.error('Error seeding data:', err);
    }
  }
}

main()
  .catch((e) => {
    console.error('Error in seed script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
