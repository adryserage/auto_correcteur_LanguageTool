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

<p align="center">
  <a href="https://github.com/adryserage/auto_correcteur_LanguageTool/releases/latest">
    <img src="https://img.shields.io/badge/⬇️_Download_Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Download">
  </a>
</p>

---

## 📦 Install

1. Download `autocorrect-vX.Y.Z.zip` from the [latest release](https://github.com/adryserage/auto_correcteur_LanguageTool/releases/latest) and unzip it
2. Open `chrome://extensions` and turn on **Developer mode**
3. Click **Load unpacked** and select the unzipped folder
4. Open the extension popup and enter your server URL under **Serveur LanguageTool** (see [API](#-api))

---

## ✨ Features

🔍 **Real-time Detection** — Automatically detects spelling and grammar errors as you type or paste

🎯 **Smart Underlines** — Visual indicators with color coding:

- 🔴 **Red** for spelling errors
- 🟠 **Orange** for grammar mistakes
- 🔵 **Blue** for style suggestions

⚡ **One-Click Fix** — Click any underlined word to see suggestions and apply corrections instantly

🚀 **Fix All** — A round ✓ icon in the bottom-right corner of the field shows the error count. One click applies the first suggestion for every error.

🔄 **Rephrase** — A second round icon, next to the ✓, rewrites the whole field with a small AI model you host. Ctrl+Z restores the original text.

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
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   You type: "Je vais au marche aujourdui"             [✓ 2]  │
│                         ~~~~~~ ~~~~~~~~~                     │
│                           │        │                         │
│                           ▼        ▼                         │
│                     [marché]      [aujourd'hui]              │
│                                                              │
│   One error:  click the underline → pick a suggestion        │
│   All errors: click [✓ 2] → "Je vais au marché aujourd'hui"  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
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
│  Serveur de reformulation (IA)      │
│  [ https://mon-llm.com            ] │
│  [ Cle API         ][Enregistrer]   │
├─────────────────────────────────────┤
│  ● Connecte            ↻ Actualiser │
└─────────────────────────────────────┘
```

- **On/off** — Turns checking on or off everywhere
- **Langue** — Auto-detect, French, or English
- **Dictionnaire personnel** — Words added from the suggestion tooltip, removable here
- **Regles de verification** — Strict mode and individual rules
- **Serveur LanguageTool** — Custom server URL (see [API](#-api))
- **Serveur de reformulation (IA)** — URL and API key of the rephrase server (see [Rephrase server](#rephrase-server)). Leave the URL empty to hide the icon
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

### Release

1. Set the same version in `package.json`, `package-lock.json` and `public/manifest.json` (`npm version X.Y.Z --no-git-tag-version` updates the first two) and merge it to `main`
2. Tag the merge commit and push the tag:

```bash
git tag -a vX.Y.Z -m "Release vX.Y.Z"
git push origin vX.Y.Z
```

The Release workflow builds `dist/`, zips it as `autocorrect-vX.Y.Z.zip` and publishes a GitHub release with generated notes.

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
├── scripts/                  # Release script
└── dist/                     # Built extension (not committed)
```

---

## 🌐 API

The extension uses [LanguageTool](https://languagetool.org/) for grammar checking.

**Default server:** `https://grammar-rs-autocorrect.fly.dev`. This host no longer resolves, so set your own server in the popup.

### Custom server

Open the popup, enter your server URL under **Serveur LanguageTool**, and click **Enregistrer** (or press Enter).

- Enter the base URL. A trailing `/v2` or `/` is removed, because the extension adds `/v2/check` itself. `https://my-server.com/v2` is saved as `https://my-server.com`.
- Only `http://` and `https://` URLs are accepted.
- The connection check runs again right after saving, and open pages switch to the new server without a reload.
- **Par defaut** restores the default server.

The extension already has access to all sites (`<all_urls>`), so any server works without an extra permission.

### Which server to use

Any server that speaks the LanguageTool HTTP API (`/v2/check`, `/v2/languages`) works:

- a self-hosted [LanguageTool HTTP server](https://dev.languagetool.org/http-server), for example on Railway or in Docker
- the public LanguageTool API at `https://api.languagetool.org` (rate limited)

### Rephrase server

LanguageTool has no rephrase endpoint, so rephrasing goes to a separate server that speaks the OpenAI chat API (`/v1/chat/completions`). The extension sends the whole field (up to 3,000 characters) and replaces it with the answer.

A small model on CPU is enough. Example with the [llama.cpp server](https://github.com/ggml-org/llama.cpp/tree/master/tools/server) Docker image `ghcr.io/ggml-org/llama.cpp:server`, configured with environment variables:

```
LLAMA_ARG_HF_REPO=Qwen/Qwen2.5-1.5B-Instruct-GGUF:Q4_K_M
LLAMA_ARG_PORT=8080
LLAMA_ARG_CTX_SIZE=4096
LLAMA_ARG_THREADS=8          # match the container's vCPU limit
LLAMA_API_KEY=<random key>   # paste the same key in the popup
LLAMA_CACHE=/models          # mount a volume here so the model downloads once
```

Set the API key: without one, anyone who finds the URL can use your server. Ollama and other OpenAI-compatible servers work too.

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
