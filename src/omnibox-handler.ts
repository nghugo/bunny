// Handle omnibox input
chrome.omnibox.onInputEntered.addListener((text: string, disposition) => {
  // Get the manifest to access the searchUrl from commands
  const manifest = chrome.runtime.getManifest() as any;
  const commands = manifest.commands || {};

  // Get the first (and should be only) command
  const commandKey = Object.keys(commands)[0];
  const searchUrl = commands[commandKey]?.replace || '';

  if (searchUrl) {
    // Replace %s with the user's input
    const url = searchUrl.replace('%s', encodeURIComponent(text));
    // Update the current tab instead of opening a new one
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id !== undefined) {
        chrome.tabs.update(tabs[0].id, { url });
      }
    });
  }
});
