import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { performance } from 'node:perf_hooks';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const modules = new Map();
function load(file) {
  if (modules.has(file)) return modules.get(file).exports;
  const moduleRecord = { exports: {} };
  modules.set(file, moduleRecord);
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const localRequire = (name) => name.startsWith('.') ? load(path.resolve(path.dirname(file), `${name}.ts`)) : require(name);
  new Function('require', 'module', 'exports', source)(localRequire, moduleRecord, moduleRecord.exports);
  return moduleRecord.exports;
}
const blog = load(path.resolve('src/modules/content/index.ts'));
const finance = load(path.resolve('src/modules/content/finance.ts'));
const originalRead = fs.readFileSync;
let reads = 0;
fs.readFileSync = function (file, ...args) {
  if (typeof file === 'string' && /content[\\/](blog|finance)[\\/].*\.mdx?$/.test(file)) reads++;
  return originalRead.call(this, file, ...args);
};
function request() { blog.getAllArticles(); blog.searchArticles('AI'); finance.getFinanceNotes(); }
try {
  const start = performance.now();
  request();
  const cold = performance.now() - start;
  const coldReads = reads;
  reads = 0;
  const warmStart = performance.now();
  for (let i = 0; i < 20; i++) request();
  console.log(JSON.stringify({ coldMs: +cold.toFixed(2), coldReads, warmAverageMs: +((performance.now() - warmStart) / 20).toFixed(2), warmReads: reads, iterations: 20 }, null, 2));
} finally { fs.readFileSync = originalRead; }
