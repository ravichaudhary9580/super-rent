const fs = require('fs');
const path = require('path');

// Directories to ignore
const IGNORED_DIRS = new Set([
  'node_modules',
  '.next',
  '.git',
  '.vscode',
  '.idea',
  'dist',
  'build',
  'out',
  'coverage',
  '.turbo',
  '.cache'
]);

// Specific files to ignore
const IGNORED_FILES = new Set([
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'tsconfig.tsbuildinfo',
  '.DS_Store',
  'count.js'
]);

// File extensions to include
const ALLOWED_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.css',
  '.scss',
  '.json',
  '.md',
  '.yml',
  '.yaml',
  '.html',
  '.sql'
]);

const statsByExt = {};
const fileDetails = [];
let totalFiles = 0;
let totalLines = 0;
let totalCodeLines = 0;
let totalBlankLines = 0;
let totalCommentLines = 0;

function isComment(line, ext) {
  const trimmed = line.trim();
  if (!trimmed) return false;

  if (['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.css', '.scss'].includes(ext)) {
    return trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.endsWith('*/');
  }
  if (['.yaml', '.yml'].includes(ext)) {
    return trimmed.startsWith('#');
  }
  if (['.html'].includes(ext)) {
    return trimmed.startsWith('<!--') || trimmed.endsWith('-->');
  }
  if (['.sql'].includes(ext)) {
    return trimmed.startsWith('--');
  }
  return false;
}

function processFile(filePath, rootDir) {
  const ext = path.extname(filePath).toLowerCase();
  const filename = path.basename(filePath);

  if (!ALLOWED_EXTENSIONS.has(ext) || IGNORED_FILES.has(filename)) {
    return;
  }

  let content;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch {
    return; // Skip binary or unreadable files
  }

  // Normalize line breaks
  const rawLines = content.split(/\r?\n/);
  // If file ends with empty line caused by trailing newline, handle appropriately
  const lines = (rawLines.length > 1 && rawLines[rawLines.length - 1] === '') 
    ? rawLines.slice(0, -1) 
    : rawLines;

  let fileBlankLines = 0;
  let fileCommentLines = 0;
  let fileCodeLines = 0;

  for (const line of lines) {
    if (line.trim() === '') {
      fileBlankLines++;
    } else if (isComment(line, ext)) {
      fileCommentLines++;
    } else {
      fileCodeLines++;
    }
  }

  const fileTotalLines = lines.length;

  // Extension aggregation
  if (!statsByExt[ext]) {
    statsByExt[ext] = {
      files: 0,
      totalLines: 0,
      codeLines: 0,
      commentLines: 0,
      blankLines: 0
    };
  }

  statsByExt[ext].files += 1;
  statsByExt[ext].totalLines += fileTotalLines;
  statsByExt[ext].codeLines += fileCodeLines;
  statsByExt[ext].commentLines += fileCommentLines;
  statsByExt[ext].blankLines += fileBlankLines;

  totalFiles += 1;
  totalLines += fileTotalLines;
  totalCodeLines += fileCodeLines;
  totalCommentLines += fileCommentLines;
  totalBlankLines += fileBlankLines;

  const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');
  fileDetails.push({
    path: relativePath,
    lines: fileTotalLines,
    code: fileCodeLines,
    blank: fileBlankLines,
    comments: fileCommentLines
  });
}

function scanDir(dir, rootDir) {
  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (err) {
    console.error(`Error reading ${dir}: ${err.message}`);
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        scanDir(fullPath, rootDir);
      }
    } else if (entry.isFile()) {
      processFile(fullPath, rootDir);
    }
  }
}

function run() {
  const rootDir = __dirname;
  console.log(`\n🔍 Scanning project lines in: ${rootDir}\n`);

  scanDir(rootDir, rootDir);

  if (totalFiles === 0) {
    console.log('No matching files found.');
    return;
  }

  // Extension summary table
  const extSummary = Object.entries(statsByExt)
    .sort((a, b) => b[1].totalLines - a[1].totalLines)
    .map(([ext, stats]) => ({
      'Extension': ext,
      'Files': stats.files.toLocaleString(),
      'Total Lines': stats.totalLines.toLocaleString(),
      'Code Lines': stats.codeLines.toLocaleString(),
      'Comment Lines': stats.commentLines.toLocaleString(),
      'Blank Lines': stats.blankLines.toLocaleString(),
      '% of Total': ((stats.totalLines / totalLines) * 100).toFixed(1) + '%'
    }));

  console.log('📊 Breakdown by File Extension:');
  console.table(extSummary);

  // Top 10 largest files
  fileDetails.sort((a, b) => b.lines - a.lines);
  const top10 = fileDetails.slice(0, 10).map((file, idx) => ({
    '#': idx + 1,
    'File Path': file.path,
    'Total Lines': file.lines.toLocaleString(),
    'Code': file.code.toLocaleString(),
    'Blank': file.blank.toLocaleString()
  }));

  console.log('\n📄 Top 10 Largest Files:');
  console.table(top10);

  // Overall summary
  console.log('='.repeat(50));
  console.log('✨ PROJECT TOTALS ✨');
  console.log(`📁 Total Files:        ${totalFiles.toLocaleString()}`);
  console.log(`📝 Total Lines:        ${totalLines.toLocaleString()}`);
  console.log(`💻 Code Lines:         ${totalCodeLines.toLocaleString()} (${((totalCodeLines / totalLines) * 100).toFixed(1)}%)`);
  console.log(`💬 Comment Lines:      ${totalCommentLines.toLocaleString()} (${((totalCommentLines / totalLines) * 100).toFixed(1)}%)`);
  console.log(`⬜ Blank Lines:        ${totalBlankLines.toLocaleString()} (${((totalBlankLines / totalLines) * 100).toFixed(1)}%)`);
  console.log('='.repeat(50) + '\n');
}

run();
