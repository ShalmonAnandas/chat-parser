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
      <main className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="text-[#58a6ff] hover:underline text-sm"
          >
            ← Go back
          </button>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#58a6ff] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0d1117] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm text-[#8b949e] hover:text-[#e6edf3] transition-colors"
          >
            ← Upload another file
          </button>
          <span className="text-xs text-[#6e7681]">Chat Parser</span>
        </div>

        <SessionHeader session={session} />

        <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-6">
          <MessageList messages={session.messages} />
        </div>
      </div>
    </main>
  );
}
