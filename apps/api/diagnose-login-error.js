const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function diagnose() {
  try {
    console.log('🔍 DIAGNOSTIC REPORT\n');
    console.log('='.repeat(60));

    // 1. Check if user exists
    console.log('\n1️⃣ CHECKING USER EXISTS...');
    const user = await prisma.user.findUnique({
      where: { email: 'admin@oliver.com' }
    });

    if (!user) {
      console.log('❌ CRITICAL: User admin@oliver.com NOT FOUND in database!');
      console.log('\n🔧 FIX: Run seed script:');
      console.log('   cd apps/api && npx prisma db seed');
      return;
    }

    console.log('✅ User found');
    console.log('   - ID:', user.id);
    console.log('   - Email:', user.email);
    console.log('   - Username:', user.username);
    console.log('   - Role:', user.role);
    console.log('   - Status:', user.status);
    console.log('   - Has passwordHash:', !!user.passwordHash);
    console.log('   - Password hash length:', user.passwordHash?.length);

    // 2. Check password hash validity
    console.log('\n2️⃣ CHECKING PASSWORD HASH...');
    const testPassword = 'Admin123!';

    try {
      const isValidFormat = user.passwordHash.startsWith('$2b$') || user.passwordHash.startsWith('$2a$');
      console.log('   - Hash format valid:', isValidFormat);

      const isPasswordCorrect = await bcrypt.compare(testPassword, user.passwordHash);
      console.log('   - Password "Admin123!" matches:', isPasswordCorrect);

      if (!isPasswordCorrect) {
        console.log('❌ CRITICAL: Password does not match!');
        console.log('   Expected password: Admin123!');
        console.log('   Stored hash:', user.passwordHash.substring(0, 30) + '...');
      }
    } catch (err) {
      console.log('❌ CRITICAL: Error comparing password:', err.message);
    }

    // 3. Check required fields
    console.log('\n3️⃣ CHECKING USER TABLE COLUMNS...');
    const requiredFields = [
      'id', 'email', 'username', 'passwordHash', 'role', 'status',
      'displayName', 'bio', 'avatar', 'emailVerified', 'lastLoginAt',
      'createdAt', 'updatedAt'
    ];

    for (const field of requiredFields) {
      const hasField = field in user;
      console.log(`   - ${field}: ${hasField ? '✅' : '❌ MISSING'}`);
    }

    // 4. Check environment variables
    console.log('\n4️⃣ CHECKING ENVIRONMENT VARIABLES...');
    console.log('   - JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ NOT SET');
    console.log('   - JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET ? '✅ Set' : '❌ NOT SET');
    console.log('   - DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ NOT SET');

    // 5. Test JWT generation
    console.log('\n5️⃣ TESTING JWT TOKEN GENERATION...');
    try {
      const jwt = require('jsonwebtoken');
      const testPayload = { sub: user.id, email: user.email, role: user.role };
      const secret = process.env.JWT_SECRET || 'test-secret';
      const token = jwt.sign(testPayload, secret, { expiresIn: '15m' });
      console.log('   - JWT generation: ✅ Working');
      console.log('   - Sample token:', token.substring(0, 40) + '...');
    } catch (err) {
      console.log('   - JWT generation: ❌ FAILED:', err.message);
    }

    // 6. Check session table
    console.log('\n6️⃣ CHECKING SESSION TABLE...');
    try {
      const sessionCount = await prisma.session.count();
      console.log('   - Session table accessible: ✅');
      console.log('   - Existing sessions:', sessionCount);
    } catch (err) {
      console.log('   - Session table: ❌ ERROR:', err.message);
    }

    // 7. Check audit log table
    console.log('\n7️⃣ CHECKING AUDIT LOG TABLE...');
    try {
      const auditCount = await prisma.auditLog.count();
      console.log('   - AuditLog table accessible: ✅');
      console.log('   - Existing audit entries:', auditCount);
    } catch (err) {
      console.log('   - AuditLog table: ❌ ERROR:', err.message);
    }

    console.log('\n' + '='.repeat(60));
    console.log('DIAGNOSTIC COMPLETE');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n💥 DIAGNOSTIC FAILED:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
