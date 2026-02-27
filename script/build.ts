import { build } from 'esbuild';
import { execSync } from 'child_process';

// Build frontend with Vite
execSync('npx vite build', { stdio: 'inherit' });

// Build backend with esbuild (use npx to get the right version)
const { build: esbuild } = await import('esbuild');
await esbuild({
  entryPoints: ['server/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: 'dist/index.cjs',
  packages: 'external',
});

console.log('✅ Build complete');
