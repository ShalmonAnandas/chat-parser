'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ParsedSession } from '@/types/chat';
import SessionHeader from '@/components/SessionHeader';
import MessageList from '@/components/MessageList';
import ThemeToggle from '@/components/ThemeToggle';

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
      <main className="app-shell flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-secondary">Loading shared chat…</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="app-shell flex items-center justify-center px-6">
        <div className="surface-card-strong rounded-3xl px-8 py-10 text-center">
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
    <main className="app-shell">
      <div className="app-topbar sticky top-0 z-10">
        <div className="page-container flex items-center justify-between gap-4 py-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm text-secondary transition-colors hover:text-primary"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Chat Parser
          </button>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <span className="rounded-full border border-indigo-500/20 bg-indigo-500/15 px-3 py-1 text-xs text-indigo-400">
              Shared Chat
            </span>
            <span className="text-xs font-medium tracking-wide text-soft">Chat Parser</span>
          </div>
        </div>
      </div>

      <div className="page-container py-8">
        <SessionHeader session={session} />
        <div className="mt-8">
          <MessageList messages={session.messages} />
        </div>
      </div>
    </main>
  );
}
