'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import { ParsedMessage } from '@/types/chat';
import ToolCallBlock from './ToolCallBlock';
import ContextFiles from './ContextFiles';
import CodeBlock from './CodeBlock';

interface AssistantMessageProps {
  message: ParsedMessage;
}

function formatTime(ts?: number): string {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(ms?: number): string {
  if (!ms) return '';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

const markdownComponents: Components = {
  code(props) {
    const { children, className } = props;
    const match = /language-(\w+)/.exec(className ?? '');
    const lang = match?.[1];
    const codeStr = String(children).replace(/\n$/, '');
    const isBlock = codeStr.includes('\n') || (className ?? '').includes('language-');
    if (isBlock) {
      return <CodeBlock code={codeStr} language={lang} />;
    }
    return (
      <code className="bg-[#1c2128] text-[#e6edf3] rounded px-1.5 py-0.5 font-mono text-[0.85em]">
        {children}
      </code>
    );
  },
  p({ children }) {
    return <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>;
  },
  ul({ children }) {
    return <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>;
  },
  ol({ children }) {
    return <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>;
  },
  li({ children }) {
    return <li className="text-[#e6edf3]">{children}</li>;
  },
  h1({ children }) {
    return <h1 className="text-xl font-bold mb-3 text-[#e6edf3]">{children}</h1>;
  },
  h2({ children }) {
    return <h2 className="text-lg font-bold mb-2 text-[#e6edf3]">{children}</h2>;
  },
  h3({ children }) {
    return <h3 className="text-base font-semibold mb-2 text-[#e6edf3]">{children}</h3>;
  },
  blockquote({ children }) {
    return (
      <blockquote className="border-l-4 border-[#30363d] pl-4 text-[#8b949e] mb-3">
        {children}
      </blockquote>
    );
  },
  a({ href, children }) {
    return (
      <a href={href} className="text-[#58a6ff] hover:underline" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },
  table({ children }) {
    return (
      <div className="overflow-x-auto mb-3">
        <table className="w-full border-collapse border border-[#30363d] text-sm">{children}</table>
      </div>
    );
  },
  th({ children }) {
    return (
      <th className="border border-[#30363d] bg-[#161b22] px-3 py-2 text-left font-semibold text-[#e6edf3]">
        {children}
      </th>
    );
  },
  td({ children }) {
    return <td className="border border-[#30363d] px-3 py-2 text-[#e6edf3]">{children}</td>;
  },
};

export default function AssistantMessage({ message }: AssistantMessageProps) {
  const duration = formatDuration(message.timeTaken);

  return (
    <div className="flex gap-3 py-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1c2128] border border-[#30363d] flex items-center justify-center text-base">
        ✨
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-2 flex-wrap">
          <span className="text-sm font-semibold text-[#e6edf3]">Copilot</span>
          {message.model && (
            <span className="text-xs bg-[#1c2128] border border-[#30363d] text-[#8b949e] px-2 py-0.5 rounded-full">
              {message.model}
            </span>
          )}
          {duration && (
            <span className="text-xs bg-[#1c2128] border border-[#30363d] text-[#58a6ff] px-2 py-0.5 rounded-full">
              ⏱ {duration}
            </span>
          )}
          {message.timestamp && (
            <span className="text-xs text-[#6e7681] ml-auto">{formatTime(message.timestamp)}</span>
          )}
        </div>

        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mb-3">
            {message.toolCalls.map((tc, i) => (
              <ToolCallBlock key={tc.id ?? i} toolCall={tc} />
            ))}
          </div>
        )}

        {message.content && (
          <div className="prose prose-invert max-w-none text-[#e6edf3]">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {message.usedContext && message.usedContext.length > 0 && (
          <ContextFiles files={message.usedContext} />
        )}
      </div>
    </div>
  );
}
