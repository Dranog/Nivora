/**
 * Create test users for testing role filters
 * Run with: node create-test-users.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🎬 Creating test users...\n');

  // Hash password
  const hashedPassword = await bcrypt.hash('Test123!', 10);

  try {
    // 1. Create Creator user
    console.log('Creating CREATOR user...');
    const creator = await prisma.user.upsert({
      where: { email: 'creator@test.com' },
      update: {},
      create: {
        email: 'creator@test.com',
        username: 'test_creator',
        displayName: 'Test Creator',
        passwordHash: hashedPassword,
        role: 'CREATOR',
        emailVerified: true,
        verified: true,
        bio: 'This is a test creator account for testing role filters',
      },
    });
    console.log('✅ Creator created:', creator.id, '-', creator.username);

    // 2. Create Creator Profile
    console.log('Creating creator profile...');
    const creatorProfile = await prisma.creatorProfile.upsert({
      where: { userId: creator.id },
      update: {},
      create: {
        userId: creator.id,
        displayName: 'Test Creator',
        bio: 'Test creator for role filtering',
        subscriptionPrice: 999, // $9.99
        isPublic: true,
      },
    });
    console.log('✅ Creator profile created');

    // 3. Create Fan user
    console.log('\nCreating FAN user...');
    const fan = await prisma.user.upsert({
      where: { email: 'fan@test.com' },
      update: {},
      create: {
        email: 'fan@test.com',
        username: 'test_fan',
        displayName: 'Test Fan',
        passwordHash: hashedPassword,
        role: 'USER',
        emailVerified: true,
        verified: false,
        bio: 'This is a test fan account for testing role filters',
      },
    });
    console.log('✅ Fan created:', fan.id, '-', fan.username);

    console.log('\n✨ Test users created successfully!\n');
    console.log('Login credentials:');
    console.log('━'.repeat(50));
    console.log('Creator:');
    console.log('  Email: creator@test.com');
    console.log('  Password: Test123!');
    console.log('  Role: CREATOR');
    console.log('');
    console.log('Fan:');
    console.log('  Email: fan@test.com');
    console.log('  Password: Test123!');
    console.log('  Role: USER');
    console.log('━'.repeat(50));
    console.log('\nYou can now test the role filter dropdown!');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
