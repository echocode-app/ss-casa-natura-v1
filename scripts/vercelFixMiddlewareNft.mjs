import fs from 'node:fs/promises';
import path from 'node:path';

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

function toPosix(p) {
  return p.split(path.sep).join('/');
}

async function main() {
  const root = process.cwd();
  const nextDir = path.join(root, '.next');
  const serverDir = path.join(nextDir, 'server');

  if (!(await fileExists(serverDir))) return;

  // Create package.json in server dir to mark as ES module
  const serverPkgPath = path.join(serverDir, 'package.json');
  if (!(await fileExists(serverPkgPath))) {
    await fs.writeFile(serverPkgPath, JSON.stringify({ type: 'module' }, null, 2));
  }

  const manifestPath = path.join(serverDir, 'middleware-manifest.json');
  const nestedManifestPath = path.join(serverDir, 'middleware', 'middleware-manifest.json');

  // Если middleware отсутствует (нет ни одного манифеста) — ничего не делаем.
  if (!(await fileExists(manifestPath)) && !(await fileExists(nestedManifestPath))) return;

  // Next.js (особенно с Turbopack) може не генерувати `.next/server/middleware.js`.
  // Але Vercel очікує цей файл та/або `.nft.json`. Тому гарантуємо їх наявність.
  const middlewareEntrypoint = path.join(serverDir, 'middleware.js');
  const middlewareMjsEntrypoint = path.join(serverDir, 'middleware.mjs');
  
  if (!(await fileExists(middlewareEntrypoint)) && !(await fileExists(middlewareMjsEntrypoint))) {
    // Create as .mjs to explicitly mark as ES module
    await fs.writeFile(
      middlewareMjsEntrypoint,
      [
        '// Auto-generated for Vercel build compatibility.',
        '// Next.js may omit this file in some build modes.',
        "import { NextResponse } from 'next/server';",
        '',
        'export function middleware() {',
        '  return NextResponse.next();',
        '}',
        '',
        'export const config = {',
        "  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],",
        '};',
        '',
      ].join('\n'),
    );
    
    // Also create symlink or copy to .js
    await fs.writeFile(
      middlewareEntrypoint,
      [
        '// Auto-generated for Vercel build compatibility.',
        '// Next.js may omit this file in some build modes.',
        "import { NextResponse } from 'next/server';",
        '',
        'export function middleware() {',
        '  return NextResponse.next();',
        '}',
        '',
        'export const config = {',
        "  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],",
        '};',
        '',
      ].join('\n'),
    );
  }

  const target = path.join(serverDir, 'middleware.js.nft.json');
  if (await fileExists(target)) return;

  const files = [];

  if (await fileExists(manifestPath)) {
    try {
      const raw = await fs.readFile(manifestPath, 'utf8');
      const manifest = JSON.parse(raw);
      const entries = manifest?.middleware ? Object.values(manifest.middleware) : [];
      for (const entry of entries) {
        const entryFiles = Array.isArray(entry?.files) ? entry.files : [];
        for (const f of entryFiles) {
          if (typeof f !== 'string') continue;
          // manifest paths are relative to .next/, so drop leading "server/" to make them relative to .next/server/
          files.push(f.startsWith('server/') ? f.slice('server/'.length) : f);
        }
      }

      // also include the manifest itself
      files.push('middleware-manifest.json');
    } catch {
      // ignore parse errors; we'll still create a minimal trace file
    }
  }
  if (await fileExists(nestedManifestPath)) {
    files.push(toPosix(path.relative(serverDir, nestedManifestPath)));
  }

  const payload = {
    version: 1,
    files: uniq(['middleware.js', 'middleware.mjs', 'package.json', ...files]).filter(Boolean),
  };

  await fs.writeFile(target, JSON.stringify(payload));
}

await main();
