import { ParsedMessage } from '@/types/chat';
import UserMessage from './UserMessage';
import AssistantMessage from './AssistantMessage';

interface MessageListProps {
  messages: ParsedMessage[];
}

export default function MessageList({ messages }: MessageListProps) {
  if (!messages || messages.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-500">
        <svg className="w-12 h-12 mx-auto mb-3 text-zinc-700" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
        </svg>
        No messages found in this session.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {messages.map((message) =>
        message.role === 'user' ? (
          <UserMessage key={message.id} message={message} />
        ) : (
          <AssistantMessage key={message.id} message={message} />
        )
      )}
    </div>
  );
}
