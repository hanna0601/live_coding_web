import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const saltRounds = 10;

  const userNames = [
    { firstName: 'Alice', lastName: 'Johnson', email: 'alice.johnson@example.com' },
    { firstName: 'Bob', lastName: 'Smith', email: 'bob.smith@example.com' },
    { firstName: 'Charlie', lastName: 'Brown', email: 'charlie.brown@example.com' },
    { firstName: 'David', lastName: 'Wilson', email: 'david.wilson@example.com' },
    { firstName: 'Eve', lastName: 'Davis', email: 'eve.davis@example.com' },
    { firstName: 'Frank', lastName: 'Miller', email: 'frank.miller@example.com' },
    { firstName: 'Grace', lastName: 'Lee', email: 'grace.lee@example.com' },
    { firstName: 'Hannah', lastName: 'Moore', email: 'hannah.moore@example.com' },
    { firstName: 'Ivy', lastName: 'Taylor', email: 'ivy.taylor@example.com' },
    { firstName: 'Jack', lastName: 'Anderson', email: 'jack.anderson@example.com' },
    { firstName: 'Kathy', lastName: 'White', email: 'kathy.white@example.com' },
    { firstName: 'Leo', lastName: 'Harris', email: 'leo.harris@example.com' },
    { firstName: 'Mia', lastName: 'Clark', email: 'mia.clark@example.com' },
    { firstName: 'Nina', lastName: 'Lewis', email: 'nina.lewis@example.com' },
    { firstName: 'Oscar', lastName: 'Walker', email: 'oscar.walker@example.com' },
    { firstName: 'Paul', lastName: 'Hall', email: 'paul.hall@example.com' },
    { firstName: 'Quinn', lastName: 'Allen', email: 'quinn.allen@example.com' },
    { firstName: 'Rachel', lastName: 'Young', email: 'rachel.young@example.com' },
    { firstName: 'Sam', lastName: 'King', email: 'sam.king@example.com' },
    { firstName: 'Tina', lastName: 'Scott', email: 'tina.scott@example.com' },
    { firstName: 'Uma', lastName: 'Green', email: 'uma.green@example.com' },
    { firstName: 'Victor', lastName: 'Adams', email: 'victor.adams@example.com' },
    { firstName: 'Wendy', lastName: 'Baker', email: 'wendy.baker@example.com' },
    { firstName: 'Xander', lastName: 'Carter', email: 'xander.carter@example.com' },
    { firstName: 'Yara', lastName: 'Mitchell', email: 'yara.mitchell@example.com' },
    { firstName: 'Zane', lastName: 'Perez', email: 'zane.perez@example.com' },
    { firstName: 'Amy', lastName: 'Roberts', email: 'amy.roberts@example.com' },
    { firstName: 'Brian', lastName: 'Evans', email: 'brian.evans@example.com' },
    { firstName: 'Cindy', lastName: 'Turner', email: 'cindy.turner@example.com' },
    { firstName: 'Derek', lastName: 'Phillips', email: 'derek.phillips@example.com' },
  ];

  for (const userName of userNames) {
    const passwordHash = await bcrypt.hash('password123', saltRounds);
    const user = await prisma.user.create({
      data: {
        firstName: userName.firstName,
        lastName: userName.lastName,
        email: userName.email,
        username: `${userName.firstName.toLowerCase()}${userName.lastName.toLowerCase()}`,
        passwordHash,
        isAdmin: Math.random() > 0.9, // 10% chance of being an admin
        phoneNumber: `+1-${Math.floor(1000000000 + Math.random() * 9000000000)}`, // Random US phone number
      },
    });
    console.log(`User created: ${user.email}`);
  }

  console.log('✨ 30 Users created successfully');
}

main()
  .catch((e) => {
    console.error('Error in user creation script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
