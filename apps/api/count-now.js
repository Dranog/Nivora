const fs = require('fs');

const content = fs.readFileSync('build_wallet_fixed.txt', 'utf8');
const lines = content.split('\n');
const errors = {};

lines.forEach(line => {
  const match = line.match(/src\/.*?\.ts/);
  if (match) {
    const file = match[0];
    errors[file] = (errors[file] || 0) + 1;
  }
});

const sorted = Object.entries(errors).sort((a, b) => b[1] - a[1]);
console.log('=== CURRENT BREAKDOWN (110 errors) ===\n');
sorted.forEach(([file, count]) => {
  console.log(`  ${count.toString().padStart(3)} - ${file}`);
});
console.log(`\nTotal: ${sorted.reduce((sum, [, count]) => sum + count, 0)} errors`);
console.log(`\n✅ Fixed so far: audit (3), auth (4), categories (4), posts (14), account-lockout (9), wallet (9) = 43 errors`);
console.log(`🎯 Remaining: 110 errors`);
