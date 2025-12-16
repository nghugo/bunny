import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const extensionsDir = path.join(projectRoot, 'extensions');
const distDir = path.join(projectRoot, 'dist');

async function buildExtensions() {

  // Ensure the extensions directory exists
  if (!fs.existsSync(extensionsDir)) {
    fs.mkdirSync(extensionsDir, { recursive: true });
  }

  // Get all extension keywords
  const dirs = fs.readdirSync(extensionsDir).filter(f => 
    fs.statSync(path.join(extensionsDir, f)).isDirectory()
  );

  // Clean dist directory
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  fs.mkdirSync(distDir, { recursive: true });

  // Build each extension
  for (const keyword of dirs) {
    console.log(`\nBuilding extension: ${keyword}`);
    
    // Create a temporary vite config for this extension
    const tempConfig = path.join(projectRoot, `.vite.config.${keyword}.js`);
    const configContent = `import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import manifest from './extensions/${keyword}/manifest.config.js';

export default defineConfig({
  plugins: [crx({ manifest })],
  build: {
    outDir: 'dist/${keyword}',
    emptyOutDir: ${keyword === dirs[0]},
    rollupOptions: {
      input: ['public/router.html', 'src/omnibox-handler.ts']
    }
  }
});`;
    
    fs.writeFileSync(tempConfig, configContent);
    
    try {
      await execAsync(`cd "${projectRoot}" && npx vite build --config "${tempConfig}"`);
      
      // Post-process: Fix router.html script src to point to the bundled router.ts
      const routerHtmlPath = path.join(projectRoot, `dist/${keyword}/router.html`);
      const manifestPath = path.join(projectRoot, `dist/${keyword}/.vite/manifest.json`);
      
      if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        if (manifest['public/router.html']) {
          const routerFile = manifest['public/router.html'].file;
          let html = fs.readFileSync(routerHtmlPath, 'utf-8');
          html = html.replace(
            /src="\.\/router\.ts"/,
            `src="${routerFile}"`
          );
          fs.writeFileSync(routerHtmlPath, html, 'utf-8');
        }
      }
      
      console.log(`✓ Built ${keyword}`);
    } catch (error) {
      console.error(`✗ Failed to build ${keyword}:`, error.message);
      throw error;
    } finally {
      fs.unlinkSync(tempConfig);
    }
  }

  console.log('\n✓ All extensions built successfully');
}

buildExtensions().catch(error => {
  console.error('Build failed:', error);
  process.exit(1);
});
