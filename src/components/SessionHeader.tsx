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

function countThinkingBlocks(session: ParsedSession): number {
  return session.messages.reduce((sum, m) => sum + (m.thinkingBlocks?.length ?? 0), 0);
}

function countTextEdits(session: ParsedSession): number {
  return session.messages.reduce((sum, m) => sum + (m.textEdits?.length ?? 0), 0);
}

function totalResponseTime(session: ParsedSession): number {
  return session.messages.reduce((sum, m) => sum + (m.timeTaken ?? 0), 0);
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const mins = Math.floor(ms / 60000);
  const secs = Math.round((ms % 60000) / 1000);
  return `${mins}m ${secs}s`;
}

export default function SessionHeader({ session }: SessionHeaderProps) {
  const toolCallCount = countToolCalls(session);
  const thinkingCount = countThinkingBlocks(session);
  const textEditCount = countTextEdits(session);
  const userMessages = session.messages.filter((m) => m.role === 'user').length;
  const totalTime = totalResponseTime(session);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      {/* Title section */}
      <div className="px-6 py-5 border-b border-zinc-800/50">
        <h1 className="text-lg font-semibold text-white truncate">
          {session.title ?? 'Copilot Chat Session'}
        </h1>
        {session.createdAt && (
          <p className="text-sm text-zinc-500 mt-1">{formatDate(session.createdAt)}</p>
        )}
      </div>

      {/* Stats row */}
      <div className="px-6 py-4 flex flex-wrap gap-4">
        <Stat
          icon={
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
            </svg>
          }
          label="Turns"
          value={userMessages}
          color="indigo"
        />
        <Stat
          icon={
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
            </svg>
          }
          label="Messages"
          value={session.totalMessages}
          color="blue"
        />
        {toolCallCount > 0 && (
          <Stat
            icon={
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
              </svg>
            }
            label="Tool Calls"
            value={toolCallCount}
            color="amber"
          />
        )}
        {thinkingCount > 0 && (
          <Stat
            icon={
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
              </svg>
            }
            label="Thinking"
            value={thinkingCount}
            color="purple"
          />
        )}
        {textEditCount > 0 && (
          <Stat
            icon={
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            }
            label="File Edits"
            value={textEditCount}
            color="emerald"
          />
        )}
        {totalTime > 0 && (
          <Stat
            icon={
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            }
            label="Total Time"
            valueStr={formatDuration(totalTime)}
            color="cyan"
          />
        )}
        {session.model && (
          <div className="flex items-center gap-1.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-1.5 text-sm">
            <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
            </svg>
            <span className="text-zinc-400 text-xs">{session.model}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  valueStr,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value?: number;
  valueStr?: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    indigo: 'text-indigo-400',
    blue: 'text-blue-400',
    amber: 'text-amber-400',
    purple: 'text-purple-400',
    emerald: 'text-emerald-400',
    cyan: 'text-cyan-400',
  };

  return (
    <div className="flex items-center gap-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-1.5 text-sm">
      <span className={colorMap[color] ?? 'text-zinc-400'}>{icon}</span>
      <span className="font-semibold text-white">{valueStr ?? value}</span>
      <span className="text-zinc-500">{label}</span>
    </div>
  );
}
