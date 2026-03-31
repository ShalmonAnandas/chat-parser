'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState, useRef } from 'react';
import { parseChatExport } from '@/lib/parser';

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
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 mb-5">
            <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Chat Parser</h1>
          <p className="text-zinc-400 text-base">
            Parse and explore your GitHub Copilot chat exports
          </p>
        </div>

        {/* Drop Zone */}
        <div
          className={`relative rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-2 border-indigo-500 bg-indigo-500/5 shadow-lg shadow-indigo-500/10'
              : 'border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900'
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
              <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-zinc-400 text-sm">Parsing your chat session…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mb-1">
                <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium text-base mb-1">
                  Drop your JSON file here
                </p>
                <p className="text-zinc-500 text-sm">
                  or click to browse
                </p>
              </div>
              <span className="text-xs text-zinc-600 mt-1">
                Supports VS Code Copilot chat exports (.json)
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            {error}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
          <h2 className="text-xs font-semibold text-zinc-400 mb-4 uppercase tracking-widest">
            How to export from VS Code
          </h2>
          <ol className="space-y-3 text-sm text-zinc-400">
            <li className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-500/15 text-indigo-400 text-xs font-bold flex items-center justify-center mt-0.5">1</span>
              <span>Open the Copilot Chat panel in VS Code</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-500/15 text-indigo-400 text-xs font-bold flex items-center justify-center mt-0.5">2</span>
              <span>Open the Command Palette (<kbd className="bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded text-xs text-zinc-300 font-mono">Ctrl+Shift+P</kbd>)</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-500/15 text-indigo-400 text-xs font-bold flex items-center justify-center mt-0.5">3</span>
              <span>Run <code className="bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded text-xs text-zinc-300 font-mono">Chat: Export Session…</code></span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-500/15 text-indigo-400 text-xs font-bold flex items-center justify-center mt-0.5">4</span>
              <span>Save the JSON file and upload it here</span>
            </li>
          </ol>
        </div>
      </div>
    </main>
  );
}
