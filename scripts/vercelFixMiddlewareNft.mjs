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

  // Remove package.json from server dir if it exists (causes ES module conflicts)
  const serverPkgPath = path.join(serverDir, 'package.json');
  if (await fileExists(serverPkgPath)) {
    await fs.unlink(serverPkgPath);
  }

  const manifestPath = path.join(serverDir, 'middleware-manifest.json');
  const nestedManifestPath = path.join(serverDir, 'middleware', 'middleware-manifest.json');
  const proxyManifestPath = path.join(serverDir, 'proxy-manifest.json');

  // Check if middleware/proxy manifest exists
  if (
    !(await fileExists(manifestPath)) &&
    !(await fileExists(nestedManifestPath)) &&
    !(await fileExists(proxyManifestPath))
  )
    return;

  // Next.js 16 може генерувати proxy.js замість middleware.js
  const middlewareEntrypoint = path.join(serverDir, 'middleware.js');
  const proxyEntrypoint = path.join(serverDir, 'proxy.js');
  
  // Check what exists
  const hasMiddlewareJs = await fileExists(middlewareEntrypoint);
  const hasProxyJs = await fileExists(proxyEntrypoint);
  
  // If proxy exists but middleware doesn't, create middleware as wrapper
  if (hasProxyJs && !hasMiddlewareJs) {
    await fs.writeFile(
      middlewareEntrypoint,
      [
        '// Auto-generated wrapper for Vercel compatibility',
        '// Next.js 16 uses proxy.js but Vercel expects middleware.js',
        "const proxy = require('./proxy.js');",
        'module.exports = proxy;',
        '',
      ].join('\n'),
    );
  }
  
  // If neither exists, check for nested structure
  if (!hasMiddlewareJs && !hasProxyJs) {
    // Check if there's a nested middleware or proxy
    const nestedMiddlewareDir = path.join(serverDir, 'middleware');
    const nestedProxyDir = path.join(serverDir, 'proxy');
    const nestedMiddlewareJs = path.join(nestedMiddlewareDir, 'middleware.js');
    const nestedProxyJs = path.join(nestedProxyDir, 'proxy.js');
    
    if (await fileExists(nestedProxyJs)) {
      // Create a re-export wrapper for proxy as CommonJS
      await fs.writeFile(
        middlewareEntrypoint,
        [
          '// Auto-generated wrapper for Vercel compatibility',
          '// This file re-exports the actual proxy from the nested directory',
          "const proxy = require('./proxy/proxy.js');",
          'module.exports = proxy;',
          '',
        ].join('\n'),
      );
    } else if (await fileExists(nestedMiddlewareJs)) {
      // Create a re-export wrapper as CommonJS
      await fs.writeFile(
        middlewareEntrypoint,
        [
          '// Auto-generated wrapper for Vercel compatibility',
          '// This file re-exports the actual middleware from the nested directory',
          "const middleware = require('./middleware/middleware.js');",
          'module.exports = middleware;',
          '',
        ].join('\n'),
      );
    } else {
      // Create minimal middleware as CommonJS
      await fs.writeFile(
        middlewareEntrypoint,
        [
          '// Auto-generated for Vercel build compatibility.',
          "const { NextResponse } = require('next/server');",
          '',
          'function middleware(request) {',
          '  return NextResponse.next();',
          '}',
          '',
          'const config = {',
          "  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],",
          '};',
          '',
          'module.exports = { middleware, config };',
          '',
        ].join('\n'),
      );
    }
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
    files: uniq(['middleware.js', ...files]).filter(Boolean),
  };

  await fs.writeFile(target, JSON.stringify(payload));
}

await main();
