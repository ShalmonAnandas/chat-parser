import { ParsedMessage } from '@/types/chat';
import UserMessage from './UserMessage';
import AssistantMessage from './AssistantMessage';

interface MessageListProps {
  messages: ParsedMessage[];
}

export default function MessageList({ messages }: MessageListProps) {
  if (!messages || messages.length === 0) {
    return (
      <div className="text-center py-12 text-[#8b949e]">
        No messages found in this session.
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#21262d]">
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
