import fs from 'node:fs';
import path from 'node:path';

const sourceRoot = process.argv[2];
if (!sourceRoot) throw new Error('Usage: node scripts/import-finance-notes.mjs <交易投资目录>');
const notes = [
  ['短线交易/交易.md', 'trading-system', '投机', '交易系统：结构、风险与执行', '从盘前准备到入场、离场和复盘，整理我的短线交易规则。', '交易系统'],
  ['投资策略/资金分配.md', 'asset-allocation', '投资', '资金分配与再平衡笔记', '整理资金分层、资产配置、分批建仓与定期再平衡的思考。', '资产配置'],
  ['投资策略/财报分析指南.md', 'company-research', '投资', '公司研究与财报分析', '沿着商业模式、财务质量、现金流与估值建立研究流程。', '公司研究'],
  ['投资策略/投资策略.md', 'investment-framework', '投资', '长期投资框架与产业研究', '从能源、算力到机器人，记录长期产业观察与配置框架。', '投资框架'],
];
fs.mkdirSync('content/finance', { recursive: true });
let copiedImages = 0;
const missing = [];
for (const [relative, slug, section, title, description, topic] of notes) {
  const file = path.resolve(sourceRoot, relative);
  let content = fs.readFileSync(file, 'utf8').replace(/\r\n?/g, '\n');
  content = content.replace(/^# (.+)$/gm, '## $1');
  content = content.replace(/^>\s*\[!([^\]]+)\]\s*(.*)$/gm, (_, kind, label) => `> **${label || ({ abstract: '摘要', note: '笔记', tip: '要点', todo: '待研究' }[kind.toLowerCase()] || '笔记')}**`);
  content = content.replace(/<mark[^>]*>/g, '<mark>');
  content = content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (original, alt, imagePath) => {
    if (/^(https?:|\/)/.test(imagePath)) return original;
    const resolved = path.resolve(path.dirname(file), imagePath);
    if (!fs.existsSync(resolved)) { missing.push(`${relative}: ${imagePath}`); return '*原笔记附图暂缺。*'; }
    const destination = path.join('public/images/finance', slug, path.basename(resolved));
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(resolved, destination);
    copiedImages++;
    return `![${alt || `${title}附图`}](/images/finance/${slug}/${path.basename(resolved)})`;
  });
  const frontmatter = Object.entries({ title, description, section, topic, source: path.basename(relative) }).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join('\n');
  fs.writeFileSync(`content/finance/${slug}.md`, `---\n${frontmatter}\n---\n\n${content.trim()}\n`);
}
console.log(JSON.stringify({ notes: notes.length, copiedImages, missing }, null, 2));
