const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, 'client/src/data/exercises');
const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.md') && !f.includes('README'));

files.forEach(file => {
  const mdPath = path.join(sourceDir, file);
  const content = fs.readFileSync(mdPath, 'utf-8');

  const varName = file.replace('.md', '').replace(/^\d+-/, '').replace(/-/g, '_') + 'Md';
  const tsContent = `export const ${varName} = \`${content.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;\n`;

  const tsPath = mdPath.replace('.md', '.ts');
  fs.writeFileSync(tsPath, tsContent, 'utf-8');

  console.log(`✅ ${file} → ${path.basename(tsPath)}`);
});

console.log('\n🎉 변환 완료!');
