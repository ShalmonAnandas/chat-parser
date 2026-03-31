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
    <main className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">✨</div>
          <h1 className="text-3xl font-bold text-[#e6edf3] mb-2">Chat Parser</h1>
          <p className="text-[#8b949e] text-lg">
            Parse and explore your GitHub Copilot chat exports
          </p>
        </div>

        {/* Drop Zone */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-[#58a6ff] bg-[#58a6ff]/10'
              : 'border-[#30363d] bg-[#161b22] hover:border-[#58a6ff]/50 hover:bg-[#161b22]'
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
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[#58a6ff] border-t-transparent rounded-full animate-spin" />
              <p className="text-[#8b949e]">Parsing your chat session...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="text-4xl">📂</div>
              <div>
                <p className="text-[#e6edf3] font-semibold text-lg mb-1">
                  Drop your JSON file here
                </p>
                <p className="text-[#8b949e] text-sm">
                  or click to browse files
                </p>
              </div>
              <p className="text-xs text-[#6e7681] mt-2">
                Accepts .json files exported from GitHub Copilot
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-lg bg-red-900/20 border border-red-800 text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 rounded-xl border border-[#30363d] bg-[#161b22] p-6">
          <h2 className="text-sm font-semibold text-[#e6edf3] mb-3 uppercase tracking-wide">
            How to export from VS Code
          </h2>
          <ol className="space-y-2 text-sm text-[#8b949e]">
            <li className="flex gap-2">
              <span className="text-[#58a6ff] font-bold">1.</span>
              <span>Open the Copilot Chat panel in VS Code</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#58a6ff] font-bold">2.</span>
              <span>Open the Command Palette (<kbd className="bg-[#0d1117] border border-[#30363d] px-1.5 py-0.5 rounded text-xs">Ctrl+Shift+P</kbd>)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#58a6ff] font-bold">3.</span>
              <span>Run <code className="bg-[#0d1117] border border-[#30363d] px-1.5 py-0.5 rounded text-xs">Chat: Export Session...</code></span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#58a6ff] font-bold">4.</span>
              <span>Save the JSON file and upload it here</span>
            </li>
          </ol>
        </div>

        {/* Sample file link */}
        <p className="text-center text-xs text-[#6e7681] mt-6">
          Want to try it out?{' '}
          <a
            href="/sample.json"
            download
            className="text-[#58a6ff] hover:underline"
            onClick={(e) => {
              e.preventDefault();
              fetch('/sample.json')
                .then((r) => r.json())
                .then((data: unknown) => {
                  const session = parseChatExport(data);
                  sessionStorage.setItem('chat-session', JSON.stringify(session));
                  router.push('/viewer');
                });
            }}
          >
            Load the sample file
          </a>
        </p>
      </div>
    </main>
  );
}
