import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Admin123!', 10);

  // Check if admin exists
  const existingAdmin = await prisma.$queryRaw`
    SELECT id FROM users WHERE email = 'admin@oliver.com' LIMIT 1
  `;

  if ((existingAdmin as any[]).length > 0) {
    console.log('ℹ️  SUPER_ADMIN already exists');
    return;
  }

  // Create admin user using raw SQL
  const result = await prisma.$executeRaw`
    INSERT INTO users (id, email, username, "passwordHash", role, "createdAt", "updatedAt")
    VALUES (gen_random_uuid()::text, 'admin@oliver.com', 'superadmin', ${hashedPassword}, 'ADMIN', NOW(), NOW())
    RETURNING id
  `;

  // Get the created user ID
  const adminUser = await prisma.$queryRaw`
    SELECT id FROM users WHERE email = 'admin@oliver.com' LIMIT 1
  ` as any[];

  console.log('✅ ADMIN user créé: admin@oliver.com / Admin123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
