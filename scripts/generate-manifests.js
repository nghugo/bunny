
import fs from "fs";
import path from "path";
import yaml from "yaml";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configFile = path.resolve(__dirname, "../extensions.yaml");
const outputDir = path.resolve(__dirname, "../extensions");

// Read YAML config
const raw = fs.readFileSync(configFile, "utf-8");
const config = yaml.parse(raw);

// Delete old extensions folder if exists
if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true, force: true });
  console.log("Deleted old extensions folder.");
}


// Path to public icons directory
const publicDir = path.resolve(__dirname, "../public");
const defaultIcon = "bunny128.png";



// Helper to select the icon filename to use in manifest (no file copying)
function getIconForExtension(ext) {
  if (ext.pngIcon && typeof ext.pngIcon === "string") {
    const iconFile = `${ext.pngIcon}.png`;
    const customIconPath = path.join(publicDir, iconFile);
    if (fs.existsSync(customIconPath)) {
      return iconFile;
    } else {
      console.warn(`Icon '${iconFile}' not found in public/ for ${ext.keyword}, using default icon.`);
    }
  }
  return defaultIcon;
}


// Generate each extension
for (const ext of config.extensions) {
  const extDir = path.join(outputDir, ext.keyword);
  fs.mkdirSync(extDir, { recursive: true });

  // Get icon filename (must exist in public/)
  const iconFile = getIconForExtension(ext);

  // Create a command entry using the keyword and searchUrl/openUrl
  const replaceUrl = ext.searchUrl || ext.openUrl;
  const commands = {
    [ext.keyword]: {
      suggested_key: {
        default: "Alt+Shift+Y"
      },
      description: ext.keyword,
      replace: replaceUrl
    }
  };


  const content = `import { defineManifest } from '@crxjs/vite-plugin';
import { baseManifest } from '../../manifest.config.base.js';

export default defineManifest({
  ...baseManifest,
  name: '${ext.name}',
  omnibox: { keyword: '${ext.keyword}' },
  icons: { "128": "${iconFile}" },
  commands: ${JSON.stringify(commands, null, 2)},
  background: {
    service_worker: "src/omnibox-handler.ts"
  }
});`;

  fs.writeFileSync(path.join(extDir, "manifest.config.js"), content, "utf-8");
  console.log(`Generated manifest for ${ext.keyword}`);
}

console.log("All manifests generated successfully.");
