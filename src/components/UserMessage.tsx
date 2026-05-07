import { ParsedMessage } from '@/types/chat';

interface UserMessageProps {
  message: ParsedMessage;
}

function formatTime(ts?: number): string {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function UserMessage({ message }: UserMessageProps) {
  return (
    <div className="surface-card rounded-[1.75rem] p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/15">
          <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm font-medium text-primary">You</span>
            {message.timestamp && (
              <span className="text-xs text-soft">{formatTime(message.timestamp)}</span>
            )}
          </div>
          <p className="text-[15px] whitespace-pre-wrap leading-7 break-words text-primary">
            {message.content}
          </p>
        </div>
      </div>
    </div>
  );
}
