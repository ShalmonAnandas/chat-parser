# Chat Parser – GitHub Copilot Chat Viewer

A Next.js 16+ application for parsing and displaying GitHub Copilot chat export JSON files.

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
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## GitHub Login Setup

GitHub OAuth must use a callback URL that exactly matches your deployed app.

1. Create a GitHub OAuth app in **GitHub Settings → Developer settings → OAuth Apps**.
2. Set the authorization callback URL to:

   ```text
   http://localhost:3000/api/auth/callback/github
   ```

   For production, replace `http://localhost:3000` with your public app URL.
3. Copy `.env.example` to `.env.local` and set `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and `AUTH_SECRET`.
4. Set `AUTH_URL` to the same public base URL you used in step 2 (for example, `https://yourapp.com`) so Auth.js generates the redirect URI that GitHub expects.

If you deploy preview builds on Vercel, the app will also reuse `VERCEL_PROJECT_PRODUCTION_URL` as the OAuth callback base so GitHub login can keep using one stable callback URL.

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

- [Next.js 16+](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [react-markdown](https://github.com/remarkjs/react-markdown)
- [remark-gfm](https://github.com/remarkjs/remark-gfm)
