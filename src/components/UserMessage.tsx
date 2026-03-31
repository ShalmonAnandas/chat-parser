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
    <div className="flex gap-3 py-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#388bfd] flex items-center justify-center text-white font-bold text-sm">
        U
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-sm font-semibold text-[#e6edf3]">You</span>
          {message.timestamp && (
            <span className="text-xs text-[#6e7681]">{formatTime(message.timestamp)}</span>
          )}
        </div>
        <p className="text-[#e6edf3] whitespace-pre-wrap leading-relaxed break-words">
          {message.content}
        </p>
      </div>
    </div>
  );
}
