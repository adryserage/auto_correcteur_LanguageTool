<p align="center">
  <img src="public/icons/icon128.svg" width="80" height="80" alt="AutoCorrect Logo">
</p>

<h1 align="center">AutoCorrect</h1>

<p align="center">
  <strong>Real-time grammar & spelling correction for Chrome</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Chrome Extension">
  <img src="https://img.shields.io/badge/Manifest-V3-success?style=for-the-badge" alt="Manifest V3">
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
</p>

<p align="center">
  <img src="./demo-auto-correct.gif" alt="AutoCorrect Demo" width="700" />
</p>

---

## ✨ Features

🔍 **Real-time Detection** — Automatically detects spelling and grammar errors as you type

🎯 **Smart Underlines** — Visual indicators with color coding:

- 🔴 **Red** for spelling errors
- 🟠 **Orange** for grammar mistakes
- 🔵 **Blue** for style suggestions

⚡ **One-Click Fix** — Click any underlined word to see suggestions and apply corrections instantly

🚀 **Fix All** — A round ✓ icon in the bottom-right corner of the field shows the error count. One click applies the first suggestion for every error.

🌍 **Multi-language** — Supports French, English, and auto-detection

🖧 **Your own server** — Point the extension at any LanguageTool-compatible server from the popup

🔌 **Universal Compatibility** — Runs on every site:

- Standard inputs & textareas
- Rich text editors (CKEditor, TinyMCE, ProseMirror)
- Contenteditable elements, including editors mounted late by single-page apps
- Zendesk, Gmail, Notion, claude.ai, and more

---

## 🎯 How It Works

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   You type: "Je vais au marche aujourdui"              │
│                      ~~~~~~~  ~~~~~~~~~                 │
│                         │         │                     │
│                         ▼         ▼                     │
│                     [marché]  [aujourd'hui]             │
│                                                         │
│   Click the underline → See suggestions → Apply fix    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

1. **Detection** — The extension monitors text fields on any webpage, including fields it only notices when you focus or type in them
2. **Analysis** — Text is sent to the configured LanguageTool server for a grammar and spelling check, after typing or pasting
3. **Display** — Errors are highlighted with colored wavy underlines
4. **Correction** — Click an underline to see suggestions, or click the ✓ icon to fix everything at once

Corrections are never applied without a click.

> **Privacy:** the extension reads every text field on every site (password fields excluded) and sends its content to the server set in the popup. Use a server you trust, or disable the extension from the popup when you don't need it.

---

## 🖥️ Popup Interface

```
┌─────────────────────────────────────┐
│  Ac  AutoCorrect                    │
├─────────────────────────────────────┤
│  ● Active                    [ ●]   │
│  Langue           [ Auto      ▼ ]   │
│  Dictionnaire personnel       ▼     │
│  Regles de verification       ▼     │
│  Serveur LanguageTool               │
│  [ https://mon-serveur.com ][Save]  │
├─────────────────────────────────────┤
│  ● Connecte            ↻ Actualiser │
└─────────────────────────────────────┘
```

- **On/off** — Turns checking on or off everywhere
- **Langue** — Auto-detect, French, or English
- **Dictionnaire personnel** — Words added from the suggestion tooltip, removable here
- **Regles de verification** — Strict mode and individual rules
- **Serveur LanguageTool** — Custom server URL (see [API](#-api))
- **Footer** — Connection status for the current server

---

## 🛠️ Development

### Prerequisites

- Node.js 20.19+ or 22.12+ (required by Vite 8)
- npm

### Commands

```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build

# Unit tests (Vitest)
npm test

# Unit tests with UI
npm run test:ui

# E2E tests (Playwright)
npm run test:e2e

# Type check and lint
npm run typecheck
npm run lint
```

### Load the extension in Chrome

1. Run `npm run build`
2. Open `chrome://extensions` and turn on **Developer mode**
3. Click **Load unpacked** and select the `dist/` folder

Each build renames the files in `dist/`. Click ↻ (Reload) on the extension after every build, otherwise pages log `ERR_FILE_NOT_FOUND` and nothing gets checked.

### Project Structure

```
auto-correct/
├── src/
│   ├── content/              # Content scripts (injected into pages)
│   │   ├── text-field-manager.ts   # Field detection & correction
│   │   ├── underline-renderer.ts   # Visual underlines & tooltips
│   │   └── language-tool-client.ts # API client
│   ├── popup/                # Extension popup UI
│   │   └── Popup.tsx         # React component
│   ├── background/           # Service worker
│   └── shared/               # Shared types & utilities
│       ├── storage.ts        # Settings in chrome.storage.sync
│       └── api-url.ts        # Server URL validation
├── tests/
│   ├── unit/                 # Vitest tests
│   └── e2e/                  # Playwright tests
├── dist/                     # Built extension
└── docker/                   # LanguageTool server config
```

---

## 🌐 API

The extension uses [LanguageTool](https://languagetool.org/) for grammar checking.

**Default server:** `https://grammar-rs-autocorrect.fly.dev`

### Custom server

Open the popup, enter your server URL under **Serveur LanguageTool**, and click **Enregistrer** (or press Enter).

- Enter the base URL. A trailing `/v2` or `/` is removed, because the extension adds `/v2/check` itself. `https://my-server.com/v2` is saved as `https://my-server.com`.
- Only `http://` and `https://` URLs are accepted.
- The connection check runs again right after saving, and open pages switch to the new server without a reload.
- **Par defaut** restores the default server.

The extension already has access to all sites (`<all_urls>`), so any server works without an extra permission.

### Self-hosting

You can self-host your own LanguageTool server using the provided Docker configuration:

```bash
cd docker
fly launch  # Deploy to Fly.io
```

Or use the official LanguageTool API at `https://api.languagetool.org`

---

## 🧪 Tested Platforms

| Platform        | Status | Notes                       |
| --------------- | ------ | --------------------------- |
| Standard inputs | ✅     | Full support                |
| Textareas       | ✅     | Full support                |
| Contenteditable | ✅     | Full support                |
| CKEditor 5      | ✅     | Zendesk, etc.               |
| Gmail           | ✅     | Compose window              |
| Google Docs     | ⚠️     | Canvas-based, limited       |
| Notion          | ✅     | Works with contenteditable  |
| claude.ai       | ✅     | ProseMirror, paste included |

---

## 📄 License

MIT © [Stan Girard](https://github.com/StanGirard)

---

<p align="center">
  <sub>Built with ❤️ using TypeScript, React, and Tailwind CSS</sub>
</p>
