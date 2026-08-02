# Sovereign

**Local-first collaborative knowledge workspace with on-device AI.**

![License](https://img.shields.io/badge/license-AGPL--3.0-blue)
![Version](https://img.shields.io/badge/version-v0.1.0-emerald)

---

## What's Being Built

Sovereign is a privacy-first Progressive Web App (PWA) that operates entirely in the browser with zero server dependencies. All data stays on your device — documents are persisted locally using the Origin Private File System (OPFS) and IndexedDB, ensuring complete ownership and offline-first availability. The rich document editor is powered by Tiptap v3 with Yjs CRDTs, enabling real-time collaborative editing via peer-to-peer WebRTC connections — no central server required.

Beyond editing, Sovereign provides a 2D knowledge graph rendered with Cytoscape.js, giving users a visual map of how their documents interconnect through wiki-style bidirectional links. Hybrid search — combining full-text and semantic vector search via Orama — lets users find information by meaning, not just keywords.

What sets Sovereign apart is its on-device AI pipeline. Using WebGPU acceleration, Sovereign runs embedding models locally via `@huggingface/transformers` and large language models via `@mlc-ai/web-llm` to power RAG-based AI chat and inline writing assistance — all without sending a single byte to external servers. The entire application is deployed as a static site on Cloudflare Workers at $0 hosting cost.

## Tech Stack

| Category | Technology |
|---|---|
| **Framework** | React 19 |
| **Build Tool** | Vite 8 |
| **Styling** | Tailwind CSS v4 |
| **Components** | shadcn/ui v4 |
| **Editor** | Tiptap v3 |
| **CRDTs** | Yjs |
| **Database** | Dexie.js v4 (IndexedDB) |
| **File Storage** | OPFS (Origin Private File System) |
| **Embeddings** | @huggingface/transformers |
| **LLM Inference** | @mlc-ai/web-llm |
| **Search** | Orama |
| **Knowledge Graph** | Cytoscape.js |
| **State Management** | Zustand |
| **Routing** | React Router v7 |
| **Compression** | fflate |

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See [LICENSE](LICENSE) for details.
