'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ParsedSession } from '@/types/chat';
import SessionHeader from '@/components/SessionHeader';
import MessageList from '@/components/MessageList';

export default function SharedChatPage() {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState<ParsedSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSharedChat() {
      try {
        const id = params.id as string;
        const res = await fetch(`/api/share/${id}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to load shared chat');
        }
        const data: ParsedSession = await res.json();
        setSession(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load shared chat');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchSharedChat();
    }
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm">Loading shared chat…</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
          >
            ← Go to Chat Parser
          </button>
        </div>
      </main>
    );
  }

  if (!session) return null;

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
            Chat Parser
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 px-2 py-1 rounded-md">
              Shared Chat
            </span>
            <span className="text-xs text-zinc-600 font-medium tracking-wide">Chat Parser</span>
          </div>
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
