/**
 * Create test users using raw SQL
 * Run with: node create-test-users-sql.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🎬 Creating test users with raw SQL...\n');

  // Hash password
  const hashedPassword = await bcrypt.hash('Test123!', 10);

  try {
    // 1. Create Creator user
    console.log('Creating CREATOR user...');
    const creatorResult = await prisma.$queryRaw`
      INSERT INTO users (id, email, username, "passwordHash", role, "displayName", "emailVerified", verified, bio, "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid(),
        'creator@test.com',
        'test_creator',
        ${hashedPassword},
        'CREATOR'::"Role",
        'Test Creator',
        true,
        true,
        'This is a test creator account for testing role filters',
        NOW(),
        NOW()
      )
      ON CONFLICT (email) DO UPDATE
        SET "displayName" = 'Test Creator',
            "emailVerified" = true,
            verified = true
      RETURNING id, username, email, role
    `;
    console.log('✅ Creator created:', creatorResult[0]?.id, '-', creatorResult[0]?.username);

    // Note: Creator profile creation skipped (not needed for role filter testing)

    // 3. Create Fan user
    console.log('\nCreating FAN (USER role) user...');
    const fanResult = await prisma.$queryRaw`
      INSERT INTO users (id, email, username, "passwordHash", role, "displayName", "emailVerified", verified, bio, "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid(),
        'fan@test.com',
        'test_fan',
        ${hashedPassword},
        'USER'::"Role",
        'Test Fan',
        true,
        false,
        'This is a test fan account for testing role filters',
        NOW(),
        NOW()
      )
      ON CONFLICT (email) DO UPDATE
        SET "displayName" = 'Test Fan',
            "emailVerified" = true
      RETURNING id, username, email, role
    `;
    console.log('✅ Fan created:', fanResult[0]?.id, '-', fanResult[0]?.username);

    console.log('\n✨ Test users created successfully!\n');
    console.log('Login credentials:');
    console.log('━'.repeat(50));
    console.log('Creator:');
    console.log('  Email: creator@test.com');
    console.log('  Password: Test123!');
    console.log('  Role: CREATOR');
    console.log('');
    console.log('Fan (USER role):');
    console.log('  Email: fan@test.com');
    console.log('  Password: Test123!');
    console.log('  Role: USER');
    console.log('━'.repeat(50));
    console.log('\nYou can now test the role filter dropdown!');
    console.log('\nTest scenarios:');
    console.log('  • Select "Tous les rôles" → Shows 3 users (admin, creator, fan)');
    console.log('  • Select "Créateur" → Shows 1 user (test_creator)');
    console.log('  • Select "Utilisateur" → Shows 1 user (test_fan)');
    console.log('  • Select "Admin" → Shows 1 user (superadmin)');
    console.log('  • Select "Modérateur" → Shows 0 users (empty state)');

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
