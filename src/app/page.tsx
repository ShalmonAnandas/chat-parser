'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState, useRef } from 'react';
import { parseChatExport } from '@/lib/parser';
import LoginButton from '@/components/LoginButton';
import ThemeToggle from '@/components/ThemeToggle';

export default function HomePage() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith('.json')) {
        setError('Please upload a .json file');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const text = await file.text();
        const raw: unknown = JSON.parse(text);
        const session = parseChatExport(raw);
        sessionStorage.setItem('chat-session', JSON.stringify(session));
        router.push('/viewer');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to parse file');
        setLoading(false);
      }
    },
    [router]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <main className="app-shell relative overflow-hidden px-6 py-10">
      <div className="hero-orb hero-orb-indigo -left-12 top-6 h-56 w-56" />
      <div className="hero-orb hero-orb-cyan -right-10 bottom-10 h-64 w-64" />

      <div className="page-container relative">
        <div className="mb-10 flex items-center justify-end gap-3">
          <ThemeToggle />
          <LoginButton />
        </div>

        <div className="mx-auto w-full max-w-2xl">
          <div className="text-center mb-12">
            <div className="mb-6 inline-flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[1.75rem] border border-indigo-500/20 bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-cyan-500/20 shadow-[0_12px_40px_rgba(79,70,229,0.18)]">
              <svg className="h-9 w-9 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
              </svg>
            </div>
            <h1 className="mb-3 text-4xl font-bold tracking-tight text-primary">Chat Parser</h1>
            <p className="mx-auto max-w-xl text-base leading-7 text-secondary">
              Parse, browse, and share GitHub Copilot chat exports with cleaner timing, tool details, and code edit summaries.
            </p>
          </div>

          <div
            className={`surface-card-strong relative rounded-[2rem] p-12 text-center transition-all duration-200 ${
              isDragging
                ? 'border-2 border-indigo-500 bg-indigo-500/10 shadow-[0_18px_60px_rgba(79,70,229,0.18)]'
                : 'hover:-translate-y-0.5 hover:border-[color:var(--border-strong)]'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".json"
              onChange={onInputChange}
              className="hidden"
            />
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-primary">Parsing your chat session…</p>
                  <p className="text-sm text-secondary">Pulling out messages, timing, tool calls, and edit details.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl surface-subtle">
                  <svg className="h-7 w-7 text-secondary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-primary">Drop your JSON file here</p>
                  <p className="text-sm text-secondary">or click to browse your exported chat session</p>
                </div>
                <span className="rounded-full surface-subtle px-3 py-1 text-xs text-soft">
                  Supports VS Code Copilot chat exports (.json)
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-5 flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              {error}
            </div>
          )}

          <div className="surface-card mt-8 rounded-[1.75rem] p-7">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">
                How to export from VS Code
              </h2>
              <span className="rounded-full surface-subtle px-3 py-1 text-xs text-soft">4 quick steps</span>
            </div>
            <ol className="space-y-4 text-sm text-secondary">
              <li className="flex gap-3 items-start">
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-xs font-bold text-indigo-400">1</span>
                <span>Open the Copilot Chat panel in VS Code.</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-xs font-bold text-indigo-400">2</span>
                <span>Open the Command Palette (<kbd className="inline-code rounded-md px-1.5 py-0.5 text-xs font-mono">Ctrl+Shift+P</kbd>).</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-xs font-bold text-indigo-400">3</span>
                <span>Run <code className="inline-code rounded-md px-1.5 py-0.5 text-xs font-mono">Chat: Export Session…</code>.</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-xs font-bold text-indigo-400">4</span>
                <span>Save the JSON file, then upload it here to inspect the conversation.</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  );
}
