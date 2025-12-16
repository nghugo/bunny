const params = new URLSearchParams(window.location.search);
const rawQ = params.get('q') || '';

if (rawQ) {
  // Get the manifest with commands
  const manifest = chrome.runtime.getManifest() as any;
  const commands = manifest.commands || {};

  // Extract the trigger (first word) and arguments (rest)
  const parts = rawQ.trim().split(/\s+/);
  const trigger = parts[0].toLowerCase();
  const args = parts.slice(1).join(' ');

  // Check if trigger matches a command
  let url = null;
  if (trigger in commands && commands[trigger].replace) {
    // Use the URL template from commands
    url = commands[trigger].replace.replace('%s', encodeURIComponent(args));
  }

  // If no command found, fallback to Google search
  if (!url) {
    url = `https://www.google.com/search?q=${encodeURIComponent(rawQ)}`;
  }

  // Navigate to the URL
  window.location.replace(url);
}