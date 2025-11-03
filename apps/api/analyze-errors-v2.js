const fs = require('fs');

const content = fs.readFileSync('build_output3.txt', 'utf8');
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
sorted.forEach(([file, count]) => {
  console.log(`  ${count.toString().padStart(3)} - ${file}`);
});
console.log(`\nTotal: ${sorted.reduce((sum, [, count]) => sum + count, 0)} errors`);
