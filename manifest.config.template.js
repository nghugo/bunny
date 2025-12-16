import { defineManifest } from '@crxjs/vite-plugin';
import { baseManifest } from '../../manifest.config.base.js';

// Commands will be injected here by the build script
const commands = __COMMANDS__;

export default defineManifest({
  ...baseManifest,
  name: '__NAME__',
  omnibox: { keyword: '__KEYWORD__' },
  action: {
    default_popup: "router.html"
  },
  background: {
    service_worker: "src/router/router.ts"
  },
  commands,
  web_accessible_resources: [
    { resources: ["router.html"], matches: ["<all_urls>"] }
  ],
  declarative_net_request: {
    rule_resources: [
      { id: "ruleset_1", enabled: true, path: "rules.json" }
    ]
  }
});
