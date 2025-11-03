import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Créer les catégories
  const categories = [
    { name: 'Gaming', slug: 'gaming', description: 'Gaming content creators' },
    { name: 'Fitness', slug: 'fitness', description: 'Fitness and health' },
    { name: 'Music', slug: 'music', description: 'Musicians and artists' },
    { name: 'Art', slug: 'art', description: 'Visual artists' },
    { name: 'Cooking', slug: 'cooking', description: 'Cooking and recipes' },
    { name: 'Tech', slug: 'tech', description: 'Technology and coding' },
    { name: 'Fashion', slug: 'fashion', description: 'Fashion and style' },
    { name: 'Travel', slug: 'travel', description: 'Travel and adventure' },
    { name: 'Education', slug: 'education', description: 'Educational content' },
    { name: 'Comedy', slug: 'comedy', description: 'Comedy and entertainment' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log('✅ Categories created');

  // 2. Créer un admin
  const adminPassword = await bcrypt.hash('Admin1234!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@oliver.test' },
    update: {},
    create: {
      email: 'admin@oliver.test',
      username: 'admin',
      passwordHash: adminPassword,
      role: 'SUPER_ADMIN',
      emailVerified: true,
      displayName: 'Administrator',
      bio: 'Platform administrator',
    },
  });
  console.log('✅ Admin created:', admin.email);

  // 3. Créer un creator
  const creatorPassword = await bcrypt.hash('Creator1234!', 12);
  const creator = await prisma.user.upsert({
    where: { email: 'creator@oliver.test' },
    update: {},
    create: {
      email: 'creator@oliver.test',
      username: 'testcreator',
      passwordHash: creatorPassword,
      role: 'CREATOR',
      emailVerified: true,
      displayName: 'Test Creator',
      bio: 'I create amazing content!',
    },
  });
  console.log('✅ Creator created:', creator.email);

  // 4. Créer un fan/user
  const fanPassword = await bcrypt.hash('Fan1234!', 12);
  const fan = await prisma.user.upsert({
    where: { email: 'fan@oliver.test' },
    update: {},
    create: {
      email: 'fan@oliver.test',
      username: 'testfan',
      passwordHash: fanPassword,
      role: 'USER',
      emailVerified: true,
      displayName: 'Test Fan',
      bio: 'Fan account for testing',
    },
  });
  console.log('✅ Fan created:', fan.email);

  console.log('\n🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });