import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import ts from 'typescript';

const compiled = ts.transpileModule(fs.readFileSync('src/modules/content/file-collection.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
const moduleRecord = { exports: {} };
new Function('require', 'module', 'exports', compiled)(createRequire(import.meta.url), moduleRecord, moduleRecord.exports);
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'alpaca-content-cache-'));
const file = path.join(directory, 'note.md');
let parses = 0;
const collection = moduleRecord.exports.createFileCollection(directory, (name) => { parses++; return fs.readFileSync(path.join(directory, name), 'utf8'); });
try {
  fs.writeFileSync(file, 'first');
  assert.deepEqual(collection(), ['first']);
  collection();
  assert.equal(parses, 1, 'Unchanged files must not be reparsed');
  fs.writeFileSync(file, 'updated content');
  assert.deepEqual(collection(), ['updated content']);
  assert.equal(parses, 2, 'Edited files must refresh');
  fs.unlinkSync(file);
  assert.deepEqual(collection(), [], 'Deleted files must disappear');
  fs.writeFileSync(path.join(directory, 'new.md'), 'new note');
  assert.deepEqual(collection(), ['new note'], 'New files must appear');
  console.log('Content cache: unchanged, edited, deleted and new files passed.');
} finally {
  for (const name of fs.readdirSync(directory)) fs.unlinkSync(path.join(directory, name));
  fs.rmdirSync(directory);
}
