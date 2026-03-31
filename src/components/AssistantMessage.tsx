'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import { ParsedMessage } from '@/types/chat';
import ToolCallBlock from './ToolCallBlock';
import ContextFiles from './ContextFiles';
import CodeBlock from './CodeBlock';
import ThinkingBlock from './ThinkingBlock';
import TextEditBlock from './TextEditBlock';

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
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const mins = Math.floor(ms / 60000);
  const secs = Math.round((ms % 60000) / 1000);
  return `${mins}m ${secs}s`;
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
      <code className="bg-zinc-800 text-zinc-200 rounded px-1.5 py-0.5 font-mono text-[0.85em]">
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
    return <li className="text-zinc-200">{children}</li>;
  },
  h1({ children }) {
    return <h1 className="text-xl font-bold mb-3 text-white">{children}</h1>;
  },
  h2({ children }) {
    return <h2 className="text-lg font-bold mb-2 text-white">{children}</h2>;
  },
  h3({ children }) {
    return <h3 className="text-base font-semibold mb-2 text-white">{children}</h3>;
  },
  blockquote({ children }) {
    return (
      <blockquote className="border-l-2 border-zinc-700 pl-4 text-zinc-400 mb-3 italic">
        {children}
      </blockquote>
    );
  },
  a({ href, children }) {
    return (
      <a href={href} className="text-indigo-400 hover:text-indigo-300 hover:underline transition-colors" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },
  table({ children }) {
    return (
      <div className="overflow-x-auto mb-3 rounded-lg border border-zinc-800">
        <table className="w-full border-collapse text-sm">{children}</table>
      </div>
    );
  },
  th({ children }) {
    return (
      <th className="border-b border-zinc-800 bg-zinc-900 px-3 py-2 text-left font-semibold text-zinc-200">
        {children}
      </th>
    );
  },
  td({ children }) {
    return <td className="border-b border-zinc-800/50 px-3 py-2 text-zinc-300">{children}</td>;
  },
};

export default function AssistantMessage({ message }: AssistantMessageProps) {
  const duration = formatDuration(message.timeTaken);
  const hasThinking = message.thinkingBlocks && message.thinkingBlocks.length > 0;
  const hasToolCalls = message.toolCalls && message.toolCalls.length > 0;
  const hasTextEdits = message.textEdits && message.textEdits.length > 0;
  const hasContent = !!message.content;
  const hasContext = message.usedContext && message.usedContext.length > 0;
  const hasReferences = message.inlineReferences && message.inlineReferences.length > 0;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-sm font-medium text-white">Copilot</span>
            {message.model && (
              <span className="text-xs bg-zinc-800 border border-zinc-700/50 text-zinc-500 px-2 py-0.5 rounded-md">
                {message.model}
              </span>
            )}
            {duration && (
              <span className="text-xs bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-md flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                {duration}
              </span>
            )}
            {message.timestamp && (
              <span className="text-xs text-zinc-600 ml-auto">{formatTime(message.timestamp)}</span>
            )}
          </div>

          {/* Thinking blocks */}
          {hasThinking && (
            <div className="mb-3">
              <ThinkingBlock blocks={message.thinkingBlocks!} />
            </div>
          )}

          {/* Tool calls */}
          {hasToolCalls && (
            <div className="mb-3 space-y-2">
              {message.toolCalls!.map((tc, i) => (
                <ToolCallBlock key={tc.id ?? i} toolCall={tc} />
              ))}
            </div>
          )}

          {/* Text edits */}
          {hasTextEdits && (
            <div className="mb-3">
              <TextEditBlock edits={message.textEdits!} />
            </div>
          )}

          {/* Markdown content */}
          {hasContent && (
            <div className="prose prose-invert max-w-none text-zinc-200 text-[15px]">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {/* Inline references */}
          {hasReferences && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {message.inlineReferences!.map((ref, i) => {
                const shortName = ref.name || ref.path.split('/').pop() || 'file';
                return (
                  <span
                    key={i}
                    title={ref.path}
                    className="inline-flex items-center gap-1 text-xs bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 rounded-md px-2 py-1"
                  >
                    <svg className="w-3 h-3 text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                    </svg>
                    {shortName}
                  </span>
                );
              })}
            </div>
          )}

          {/* Context files */}
          {hasContext && (
            <ContextFiles files={message.usedContext!} />
          )}
        </div>
      </div>
    </div>
  );
}
