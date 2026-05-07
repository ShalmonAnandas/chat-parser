'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ParsedSession } from '@/types/chat';
import SessionHeader from '@/components/SessionHeader';
import MessageList from '@/components/MessageList';
import ShareButton from '@/components/ShareButton';
import ExportPDFButton from '@/components/ExportPDFButton';
import SaveButton from '@/components/SaveButton';
import CodeChangesView from '@/components/CodeChangesView';
import LoginButton from '@/components/LoginButton';
import ThemeToggle from '@/components/ThemeToggle';

function readStoredSession(): { session: ParsedSession | null; error: string | null } {
  if (typeof window === 'undefined') {
    return { session: null, error: null };
  }

  try {
    const raw = window.sessionStorage.getItem('chat-session');
    if (!raw) return { session: null, error: null };
    return {
      session: JSON.parse(raw) as ParsedSession,
      error: null,
    };
  } catch {
    return {
      session: null,
      error: 'Failed to load session data',
    };
  }
}

export default function ViewerPage() {
  const router = useRouter();
  const [initialState] = useState(() => readStoredSession());
  const session = initialState.session;
  const error = initialState.error;

  useEffect(() => {
    if (!session && !error) {
      router.replace('/');
    }
  }, [error, router, session]);

  if (error) {
    return (
      <main className="app-shell flex items-center justify-center px-6">
        <div className="surface-card-strong rounded-3xl px-8 py-10 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="text-sm text-indigo-400 transition-colors hover:text-indigo-300"
          >
            ← Go back
          </button>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="app-shell flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-sm text-secondary">Loading your parsed chat…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <div className="app-topbar sticky top-0 z-10 print:hidden">
        <div className="page-container flex items-center justify-between gap-4 py-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm text-secondary transition-colors hover:text-primary"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Upload another
          </button>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LoginButton />
          </div>
        </div>
      </div>

      <div className="page-container py-8">
        <SessionHeader session={session} />

        <div className="mt-5 flex flex-wrap items-center gap-3 print:hidden">
          <ShareButton session={session} />
          <ExportPDFButton />
          <SaveButton session={session} />
          <CodeChangesView messages={session.messages} />
        </div>

        <div className="mt-8">
          <MessageList messages={session.messages} />
        </div>
      </div>
    </main>
  );
}
