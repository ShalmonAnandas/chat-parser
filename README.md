# Chat Parser – GitHub Copilot Chat Viewer

A Next.js 14+ application for parsing and displaying GitHub Copilot chat export JSON files.

## Features

- **Drag & drop** or click-to-upload JSON export files
- Supports **V1 format** (`{ requests: [...] }`) and **V2 format** (`{ messages: [...] }`) as well as raw arrays
- Renders **Markdown** responses with syntax-highlighted code blocks
- Displays **tool calls** (arguments + results) in collapsible blocks
- Shows **context files** attached to each turn
- Displays **model name**, **response time**, and **timestamps**
- Dark theme matching GitHub's color palette

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How to Export from VS Code

1. Open the Copilot Chat panel in VS Code
2. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
3. Run **Chat: Export Session...**
4. Save the JSON file and upload it to this app

## Build

```bash
npm run build
npm start
```

## Tech Stack

- [Next.js 14+](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [react-markdown](https://github.com/remarkjs/react-markdown)
- [remark-gfm](https://github.com/remarkjs/remark-gfm)
