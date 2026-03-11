# AIOS Platform — AI Operating System for Work

A modular, API-centric, plugin-based AI workspace platform.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Web Frontend                      │
│  (React + Vite + TailwindCSS + Framer Motion)       │
├─────────┬──────────┬────────────┬───────────────────┤
│  Docs   │   IDE    │   Paint    │  Workflow Builder  │
│ (TipTap)│(Monaco)  │(Excalidraw)│  (Node Canvas)     │
├─────────┴──────────┴────────────┴───────────────────┤
│               Plugin / Module System                 │
│     Tools │ Suites │ Agents │ Connectors │ Apps      │
├─────────────────────────────────────────────────────┤
│                   API Gateway                        │
├────────┬──────────┬──────────────┬──────────────────┤
│  API   │ AI Gate  │ Agent Runner │ Workflow Engine   │
│ Server │  way     │              │                   │
├────────┴──────────┴──────────────┴──────────────────┤
│  PostgreSQL  │  Redis  │  Docker  │  Object Storage  │
└──────────────┴─────────┴──────────┴──────────────────┘
```

## Monorepo Structure

```
/apps
  web/              — React frontend
  api/              — Express API server
  agent-runner/     — Agent execution service
  workflow-engine/  — Workflow orchestration service
  ai-gateway/       — AI model routing gateway

/packages
  ui/               — Shared React components
  design-system/    — Theme, tokens, Tailwind config
  sdk/              — Developer SDK for building tools
  tool-runtime/     — Universal tool execution engine
  workflow-core/    — Workflow data structures & logic
  agent-core/       — Agent runtime & memory
  mcp-core/         — MCP connector protocol
  plugin-system/    — Module loader & registry
  database/         — Schema, migrations, models
  auth/             — Authentication & authorization
  utils/            — Shared utilities

/modules
  tools/            — Installable AI tools
  suites/           — Tool suite bundles
  agent-packs/      — Agent pack bundles
  connectors/       — MCP connectors
  apps/             — Built-in & installable apps
```

## Quick Start

```bash
pnpm install
pnpm dev
```

## Tech Stack

| Layer      | Technology                                  |
|------------|---------------------------------------------|
| Frontend   | React, TypeScript, Vite, TailwindCSS        |
| UI         | Shadcn UI, Framer Motion, Three.js          |
| Editors    | Monaco Editor, TipTap, Excalidraw           |
| Backend    | Node.js, Express, TypeScript                |
| Database   | PostgreSQL, Redis                           |
| Auth       | Clerk / Auth0                               |
| Infra      | Docker, Turborepo, pnpm workspaces          |
