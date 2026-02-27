import { build } from 'esbuild';
import { execSync } from 'child_process';

// Build frontend with Vite
execSync('vite build', { stdio: 'inherit' });

// Build backend with esbuild
await build({
  entryPoints: ['server/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: 'dist/index.cjs',
  packages: 'external',
  banner: {
    js: '#!/usr/bin/env node',
  },
});

console.log('✅ Build complete');
