import { ParsedSession } from '@/types/chat';

interface SessionHeaderProps {
  session: ParsedSession;
}

function formatDate(ts?: number): string {
  if (!ts) return 'Unknown date';
  return new Date(ts).toLocaleDateString([], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function countToolCalls(session: ParsedSession): number {
  return session.messages.reduce((sum, m) => sum + (m.toolCalls?.length ?? 0), 0);
}

export default function SessionHeader({ session }: SessionHeaderProps) {
  const toolCallCount = countToolCalls(session);
  const userMessages = session.messages.filter((m) => m.role === 'user').length;

  return (
    <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-6 mb-6">
      <div className="flex items-start gap-3">
        <div className="text-2xl mt-0.5">💬</div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-[#e6edf3] mb-1 truncate">
            {session.title ?? 'Copilot Chat Session'}
          </h1>
          {session.createdAt && (
            <p className="text-sm text-[#8b949e] mb-4">{formatDate(session.createdAt)}</p>
          )}
          <div className="flex flex-wrap gap-3 text-sm">
            <Stat icon="💬" label="Turns" value={userMessages} />
            <Stat icon="📨" label="Messages" value={session.totalMessages} />
            {toolCallCount > 0 && (
              <Stat icon="🔧" label="Tool Calls" value={toolCallCount} />
            )}
            {session.model && (
              <div className="flex items-center gap-1.5 bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-1.5">
                <span>🤖</span>
                <span className="text-[#8b949e]">{session.model}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5 bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-1.5">
      <span>{icon}</span>
      <span className="font-semibold text-[#e6edf3]">{value}</span>
      <span className="text-[#8b949e]">{label}</span>
    </div>
  );
}
