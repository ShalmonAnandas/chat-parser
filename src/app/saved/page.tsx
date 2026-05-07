'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

interface SavedChat {
  id: string;
  title: string;
  createdAt?: number;
  totalMessages: number;
  model?: string;
  savedAt: string;
}

function formatDate(ts?: number | string): string {
  if (!ts) return 'Unknown date';
  const date = typeof ts === 'string' ? new Date(ts) : new Date(ts);
  return date.toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function SavedChatsPage() {
  const router = useRouter();
  const [chats, setChats] = useState<SavedChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChats() {
      try {
        const res = await fetch('/api/chats');
        if (res.status === 401) {
          router.push('/');
          return;
        }
        if (!res.ok) throw new Error('Failed to load saved chats');
        const data = await res.json();
        setChats(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load chats');
      } finally {
        setLoading(false);
      }
    }
    fetchChats();
  }, [router]);

  if (loading) {
    return (
      <main className="app-shell flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-secondary">Loading saved chats…</p>
        </div>
      </main>
    );
  }

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
            Back
          </button>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <span className="text-xs font-medium tracking-wide text-soft">Chat Parser</span>
          </div>
        </div>
      </div>

      <div className="page-container py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-primary">Saved Chats</h1>
          <p className="text-sm text-secondary">Your previously saved chat sessions</p>
        </div>

        {error && (
          <div className="tone-surface tone-red mb-6 rounded-2xl p-4 text-sm">
            {error}
          </div>
        )}

        {chats.length === 0 ? (
          <div className="surface-card rounded-[1.75rem] py-16 text-center">
            <svg className="mx-auto mb-3 h-12 w-12 text-soft" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25-2.25M12 13.875V7.5M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            <p className="text-secondary">No saved chats yet</p>
            <p className="mt-1 text-sm text-soft">Upload a chat and click &quot;Save&quot; to keep it here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => {
                  fetch(`/api/chats/${chat.id}`)
                    .then((res) => {
                      if (!res.ok) throw new Error('Failed to load chat');
                      return res.json();
                    })
                    .then((data) => {
                      sessionStorage.setItem('chat-session', JSON.stringify(data));
                      router.push('/viewer');
                    })
                    .catch(() => {
                      setError('Failed to load chat. Please try again.');
                    });
                }}
                className="surface-card w-full rounded-[1.75rem] p-6 text-left transition-all hover:-translate-y-0.5 hover:border-[color:var(--border-strong)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-primary">{chat.title}</h3>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="text-xs text-secondary">{chat.totalMessages} messages</span>
                      {chat.model && (
                        <span className="surface-subtle rounded-full px-3 py-1 text-xs text-secondary">
                          {chat.model}
                        </span>
                      )}
                      <span className="text-xs text-soft">Saved {formatDate(chat.savedAt)}</span>
                    </div>
                  </div>
                  <svg className="mt-1 h-5 w-5 flex-shrink-0 text-soft" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
