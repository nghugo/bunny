

# Bunny 🐰

Define your own search shortcuts for Chrome’s address bar—just type a keyword and search any site instantly.

*Bunny works by generating a group of Chrome extensions, one for each shortcut you define.*

Type a keyword followed by your search term in the address bar to instantly search using your custom shortcuts.

[**Watch the demo video here**](https://youtu.be/yOgBvrRG9wo)

## What Problem Does It Solve?

Bunny lets you search more quickly:

- **Less typing:** Compared to traditional search, you skip steps—just type your shortcut keyword and search (e.g. `y cats` to search for cats on YouTube) right from the address bar, instead of navigating to the site and then searching.
- **No extra commands:** Unlike some extensions that require an extra command (e.g. `b y cats`), bunny uses just your keyword and search.
- **Private:** Your queries go directly to the search engine—not to a third-party bookmarking server.

**Example:** Type `y<space>cats` to search YouTube for "cats" directly from the address bar.

**Search as normal:** Regular search in Chrome is not affected by Bunny. You can continue to search as usual in the address bar—Bunny only activates when you use one of your defined shortcut keywords.


## Features

- 🎯 Define custom omnibox shortcuts in a simple YAML file
- 🔧 Generate Chrome extensions automatically
- 🚀 Quick setup and installation
- 🔄 Easy to change, rebuild and update

## Usage

Once installed, use your custom shortcuts in Chrome's address bar. These are included by default (you can customize them in `extensions.yaml`):

| Keyword | Extension    | Example Input        | Result Description                       |
|---------|--------------|----------------------|------------------------------------------|
| `y`     | YouTube      | `y cats`             | Searches YouTube for "cats"              |
| `m`     | Google Maps  | `m coffee near me`   | Searches Google Maps for "coffee near me"|
| `d`     | Google Drive | `d travel doc`       | Searches Google Drive for "travel doc"   |
| `a`     | Amazon UK    | `a laptops`          | Searches Amazon UK for "laptops"         |
| `g`     | Google Search| `g search query`     | Searches Google for "search query"       |
| `gh`    | GitHub       | `gh react hooks`     | Searches GitHub for "react hooks"        |
| `qq`    | ChatGPT      | `qq write me a haiku`| Prompts ChatGPT with "write me a haiku"  |

You can add, remove, or change these shortcuts by editing `extensions.yaml`.

## Prerequisites

- Node.js with version v, where 20.19.0 ≤ v < 21, or v ≥ 22.12.0
- npm or yarn
- Chrome browser
- Basic familiarity with Chrome extension management

## Installation & Setup

### Quick Start

1. **Clone the Project:**
   ```bash
   git clone <repository-url>
   ```

2. **One-liner setup (after fresh clone):**
   Then `cd` into your cloned `bunny` repository, then run
   ```bash
   npm run setup
   ```

   This will install dependencies, generate manifests, and build all extensions into the `dist/` folder.

Then see [Installing Extensions in Chrome](#installing-extensions-in-chrome) to install them manually.


### For Customizing

#### 1. Configure Your Shortcuts
Edit the `extensions.yaml` file to define your custom shortcuts. Each entry can include:
- `keyword`: The omnibox keyword (e.g., `y` for YouTube)
- `name`: Human-readable extension name (appears in Chrome extension settings and omnibox)
- `searchUrl`: The URL template where `%s` is replaced with the search query
- `pngIcon` (optional): Icon filename (without `.png`, must be in `public/`)

**Example:**
```yaml
- keyword: y
   name: "YouTube"
   searchUrl: "https://www.youtube.com/results?search_query=%s"
   pngIcon: youtube  # Looks for public/youtube.png; defaults to bunny128.png if missing
```
- All icons must be PNG files in the `public/` directory. If `pngIcon` is not specified or missing, `bunny128.png` is used.

#### 2. Generate and build
After making changes to `extensions.yaml`:

```bash
npm run dev
```

This rebuilds extensions under `extensions/` and `dist/`.



Then see [Installing Extensions in Chrome](#installing-extensions-in-chrome) to install them manually.

## Installing Extensions in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the folder for the extension you want from `dist/` (e.g., `dist/y/` for YouTube)
5. Repeat for each new extension you want to install
6. To update existing extensions after rebuilding, click the **Update** button in Chrome's extensions page.

## Generated Folders

- `extensions/` — Contains the generated source/config files for each extension (not installable in Chrome).
- `dist/` — Contains the final, built Chrome extensions. Use these folders when loading unpacked extensions in Chrome.

## Usage

Once installed, use your custom shortcuts in Chrome's address bar. 

**How it works:**
- All shortcuts and settings are defined in `extensions.yaml`.
- Running `npm run dev` or `npm run build` generates manifests and bundles each extension using Vite.
- When you use the omnibox, the service worker receives your query, looks up the URL template from the manifest, and opens the search URL with your query.



## Troubleshooting

- **Extensions not appearing:** Make sure you loaded from `dist/`, enabled Developer mode, and the extension is enabled in Chrome.
- **Search not working:** Check your `searchUrl` in `extensions.yaml`, rebuild with `npm run dev`, and reload the extension.
- **Build errors:** Ensure Node.js is the correct version, `extensions.yaml` is valid YAML, and all required fields are present.

## Technical Details

### Why One Extension Per Shortcut?

Chrome's Manifest V3 limits each extension to a single omnibox keyword. By generating one extension per shortcut, each keyword gets its own dedicated extension, allowing you to have multiple independent shortcuts. If we used only one extension, every search would need to start with that single keyword.

### Why Manual Installation?

Chrome requires unpacked extensions to be installed manually via `chrome://extensions/` with Developer mode enabled. This is by design, to prevent malicious scripts from auto-installing extensions. As a result, there is no way (or script) to auto-install extensions in Chrome.

### Service Worker

The `src/omnibox-handler.ts` service worker runs in the background and:
- Listens for omnibox input events
- Reads the search URL from the manifest
- Substitutes the user's query for `%s`
- Opens a new tab with the results
