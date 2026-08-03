<div align="center">

# Sovereign

**Your Knowledge. Your Device. Your Rules.**

A privacy-first, zero-server knowledge workspace that runs entirely inside your browser — local-first editing, peer-to-peer sync, a bidirectional knowledge graph, and on-device AI, with nothing ever sent to a server you don't control.

[![License](https://img.shields.io/badge/license-AGPL--3.0-blue)](LICENSE)
[![CI](https://github.com/WantedChip/Sovereign/actions/workflows/ci.yml/badge.svg)](https://github.com/WantedChip/Sovereign/actions/workflows/ci.yml)
![Deployed on Cloudflare Workers](https://img.shields.io/badge/Deployed%20on-Cloudflare%20Workers-F38020?logo=cloudflare)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)

[**Live Demo**](https://sovereign.sohamlabs.workers.dev) · [Features](#features) · [Tech Stack](#tech-stack) · [Getting Started](#getting-started)

</div>

---

## Why Sovereign

Most "AI-powered notes" apps hand your writing to a cloud API, sync through a company's database, and stop working the moment your subscription lapses or their servers go down.

Sovereign takes the opposite bet: **everything runs on your hardware.** Your documents live in the browser's Origin Private File System, not someone else's Postgres instance. Collaboration happens directly between peers over WebRTC, not through a relay that can read your data. Search, embeddings, and LLM inference all run on-device via WebGPU. There is no account to create and no server that could be breached, subpoenaed, or shut down — because there isn't one.

> [!NOTE]
> AI features (semantic search, RAG chat, writing co-pilot) require a WebGPU-capable browser. The editor, storage, sync, and knowledge graph work everywhere.

## Screenshots

<!-- TODO: add screenshot/GIF of the editor + knowledge graph -->

## Features

#### 📝 Editing & Content
- **Local-First Editor** — a rich-text editor built on Tiptap v3, with slash commands, Markdown serialization, and `[[wiki-style]]` bidirectional links.
- **Bi-Directional Knowledge Graph** — an interactive graph view (Cytoscape.js) that maps backlinks and document relationships as you write, not after the fact.

#### 🔄 Collaboration
- **Real-Time P2P Sync** — multi-user editing and live presence, powered by Yjs CRDTs over WebRTC data channels. No relay server sees your content, ever.

#### 🧠 Intelligence
- **Hybrid Semantic Search** — BM25 keyword search fused with 384-dimensional vector similarity, via Orama, entirely client-side.
- **On-Device LLM + RAG Chat** — retrieval-augmented chat over your own notes, running 4-bit quantized local models on your GPU via WebGPU (`@mlc-ai/web-llm`).
- **AI Writing Co-Pilot** — inline suggestions and text transforms from the same local inference stack, with CRDT mutation isolation so AI edits never corrupt collaborative state.

#### 📴 Platform
- **Full Offline PWA** — installable, and fully usable offline after first load: app shell, WASM binaries, and model weights are all cached by the service worker.
- **Own Your Data** — one-click Markdown ZIP export/import (`fflate`), so your knowledge base is never locked into Sovereign.

## Architecture

No backend. Every subsystem below runs client-side, in your browser:

```
                         ┌──────────────────────────┐
                         │      Browser Client      │
                         └────────────┬─────────────┘
          ┌──────────────┬────────────┼─────────────┬──────────────┐
          │              │            │             │              │
    ┌─────▼─────┐  ┌─────▼─────┐ ┌────▼────┐  ┌─────▼─────┐  ┌─────▼─────┐
    │  Tiptap   │  │    Yjs    │ │  OPFS   │  │  WebGPU   │  │ Cytoscape │
    │  Editor   │  │  P2P Sync │ │ Storage │  │  AI/LLM   │  │   Graph   │
    └───────────┘  └───────────┘ └─────────┘  └───────────┘  └───────────┘
```

No cloud servers. No telemetry. No hosting cost beyond the static shell.

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | React 19 (`react` ^19.2.8, `vite` ^8.2.0) |
| **Editor** | Tiptap v3 (`@tiptap/react` ^3.29.2) |
| **CRDT / Sync** | Yjs (`yjs` ^13.6.31, `y-webrtc` ^10.3.0, `y-indexeddb` ^9.0.12) |
| **Local Storage** | OPFS (Origin Private File System) + Dexie.js v4 (`dexie` ^4.4.4) |
| **Search** | Orama (`@orama/orama` ^3.1.18) |
| **On-Device AI** | WebGPU + `@huggingface/transformers` (^4.2.0) & `@mlc-ai/web-llm` (^0.2.84) |
| **Styling** | Tailwind CSS v4 (`tailwindcss` ^4.3.3) & shadcn/ui v4 |
| **Hosting** | Cloudflare Workers (`@cloudflare/vite-plugin` ^1.50.0, `wrangler` ^4.118.0) |

## Getting Started

### Prerequisites
- Node.js 20+ and npm
- A Chromium-based browser (Chrome, Edge, Brave) for full WebGPU AI support

### Clone and Install

```bash
git clone https://github.com/WantedChip/Sovereign.git
cd Sovereign
npm install
```

### Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and build for production (`tsc -b && vite build`) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project (`--max-warnings 0`) |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Verify formatting without writing changes |

## Project Structure

```
src/
├── App.tsx
├── index.css
├── main.tsx
├── router.tsx
├── components/
│   ├── ai/            # RAG chat, inline suggestions, model download UI
│   ├── collaboration/  # Presence avatars, connection status
│   ├── editor/         # Tiptap wrapper, toolbar, slash menu, wiki-links
│   ├── graph/           # Cytoscape.js knowledge graph
│   ├── landing/         # Marketing site
│   ├── search/          # Command palette, search results
│   ├── ui/              # shadcn/ui primitives
│   └── workspace/       # App shell, sidebar, document list
├── hooks/               # useAI, useDocument, useSearch, usePWAInstall, ...
├── lib/
│   ├── ai/              # Embedding + LLM workers, RAG pipeline
│   ├── crdt/            # Yjs provider, y-webrtc sync
│   ├── db/               # Dexie schema + operations
│   ├── editor/
│   ├── export/           # Markdown ZIP import/export
│   ├── graph/             # Link extraction, backlink index
│   ├── search/            # Orama index, hybrid search
│   └── storage/           # OPFS worker
├── pages/                 # LandingPage, WorkspacePage
├── stores/                 # Zustand stores (document, chat, settings, UI)
└── types/
```

## Contributing

Issues and pull requests are welcome. If you're proposing a larger change, please open an issue first to discuss direction.

## License

Licensed under the [GNU Affero General Public License v3.0 (AGPL-3.0)](LICENSE).

<div align="center">

*No servers. No telemetry. No accounts. All data lives on your device.*

</div>