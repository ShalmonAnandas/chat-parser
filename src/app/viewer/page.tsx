'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ParsedSession } from '@/types/chat';
import SessionHeader from '@/components/SessionHeader';
import MessageList from '@/components/MessageList';

export default function ViewerPage() {
  const router = useRouter();
  const [session, setSession] = useState<ParsedSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('chat-session');
      if (!raw) {
        router.replace('/');
        return;
      }
      const parsed: ParsedSession = JSON.parse(raw) as ParsedSession;
      setSession(parsed);
    } catch {
      setError('Failed to load session data');
    }
  }, [router]);

  if (error) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
          >
            ← Go back
          </button>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Upload another
          </button>
          <span className="text-xs text-zinc-600 font-medium tracking-wide">Chat Parser</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <SessionHeader session={session} />

        <div className="mt-6">
          <MessageList messages={session.messages} />
        </div>
      </div>
    </main>
  );
}
