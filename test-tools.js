// 临时测试文件：验证工具分类
const fs = require('fs');
const content = fs.readFileSync('./src/data/allTools.tsx', 'utf-8');

// 提取所有工具的 title 和 category
const tools = [];
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("title: '")) {
    const title = lines[i].match(/title: '([^']+)'/)?.[1];
    // 查找后面的 category
    for (let j = i; j < i + 10 && j < lines.length; j++) {
      if (lines[j].includes("category: '")) {
        const category = lines[j].match(/category: '([^']+)'/)?.[1];
        if (title && category) {
          tools.push({ title, category });
        }
        break;
      }
    }
  }
}

console.log('📊 工具分类统计：\n');

const categories = {};
tools.forEach(tool => {
  if (!categories[tool.category]) {
    categories[tool.category] = [];
  }
  categories[tool.category].push(tool.title);
});

Object.keys(categories).sort().forEach(category => {
  console.log(`\n【${category}】(${categories[category].length}个工具):`);
  categories[category].forEach((title, index) => {
    console.log(`  ${index + 1}. ${title}`);
  });
});

console.log('\n\n🔍 查找 XML 相关工具：');
const xmlTools = tools.filter(t => t.title.includes('XML'));
xmlTools.forEach(tool => {
  console.log(`  ✓ ${tool.title} -> 分类：${tool.category}`);
});

console.log('\n✅ 验证完成！');

