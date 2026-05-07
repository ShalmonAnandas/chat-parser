'use client';

import { useState } from 'react';
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

function formatCount(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
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
      <code className="inline-code rounded px-1.5 py-0.5 font-mono text-[0.85em]">
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
    return <li className="text-primary">{children}</li>;
  },
  h1({ children }) {
    return <h1 className="mb-3 text-xl font-bold text-primary">{children}</h1>;
  },
  h2({ children }) {
    return <h2 className="mb-2 text-lg font-bold text-primary">{children}</h2>;
  },
  h3({ children }) {
    return <h3 className="mb-2 text-base font-semibold text-primary">{children}</h3>;
  },
  blockquote({ children }) {
    return (
      <blockquote className="mb-3 border-l-2 pl-4 italic text-secondary" style={{ borderColor: 'var(--border-color)' }}>
        {children}
      </blockquote>
    );
  },
  a({ href, children }) {
    return (
      <a href={href} className="tone-text tone-indigo hover:underline transition-opacity hover:opacity-80" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },
  table({ children }) {
    return (
      <div className="mb-3 overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border-color)' }}>
        <table className="w-full border-collapse text-sm">{children}</table>
      </div>
    );
  },
  th({ children }) {
    return (
      <th
        className="px-3 py-2 text-left font-semibold text-primary"
        style={{
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--surface-3)',
        }}
      >
        {children}
      </th>
    );
  },
  td({ children }) {
    return (
      <td className="px-3 py-2 text-secondary" style={{ borderBottom: '1px solid var(--border-color)' }}>
        {children}
      </td>
    );
  },
};

export default function AssistantMessage({ message }: AssistantMessageProps) {
  const [showProcess, setShowProcess] = useState(false);
  const duration = formatDuration(message.timeTaken);
  const firstProgress = formatDuration(message.firstProgressMs);
  const hasThinking = message.thinkingBlocks && message.thinkingBlocks.length > 0;
  const hasToolCalls = message.toolCalls && message.toolCalls.length > 0;
  const hasTextEdits = message.textEdits && message.textEdits.length > 0;
  const hasContent = !!message.content;
  const hasContext = message.usedContext && message.usedContext.length > 0;
  const hasReferences = message.inlineReferences && message.inlineReferences.length > 0;
  const hasProcess = hasThinking || hasToolCalls || hasTextEdits || hasReferences || hasContext;
  const processSummary = [
    hasThinking ? formatCount(message.thinkingBlocks!.length, 'thinking block') : null,
    hasToolCalls ? formatCount(message.toolCalls!.length, 'tool call') : null,
    hasTextEdits ? formatCount(message.textEdits!.length, 'edit') : null,
    hasReferences ? formatCount(message.inlineReferences!.length, 'reference') : null,
    hasContext ? formatCount(message.usedContext!.length, 'context file') : null,
  ].filter(Boolean).join(' · ');

  return (
    <div className="surface-card rounded-[1.9rem] p-6">
      <div className="flex items-start gap-3">
        <div className="tone-surface tone-emerald flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-primary">Copilot</span>
            {message.model && (
              <span className="surface-subtle rounded-full px-3 py-1 text-xs text-secondary">
                {message.model}
              </span>
            )}
            {duration && (
              <span className="tone-surface tone-cyan flex items-center gap-1 rounded-full px-3 py-1 text-xs">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                {duration}
              </span>
            )}
            {firstProgress && message.firstProgressMs !== message.timeTaken && (
              <span className="tone-surface tone-violet rounded-full px-3 py-1 text-xs">
                First output {firstProgress}
              </span>
            )}
            {message.timestamp && (
              <span className="ml-auto text-xs text-soft">{formatTime(message.timestamp)}</span>
            )}
          </div>

          {hasContent && (
            <div className="max-w-none text-[15px] text-primary">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {hasProcess && (
            <div className={`${hasContent ? 'mt-4' : ''}`}>
              <div className="overflow-hidden rounded-2xl surface-subtle">
                <button
                  type="button"
                  onClick={() => setShowProcess((current) => !current)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:text-primary"
                >
                  <div className="tone-surface tone-violet flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-primary">
                      {showProcess ? 'Hide process details' : 'Show process details'}
                    </p>
                    <p className="truncate text-xs text-secondary">{processSummary}</p>
                  </div>
                  <svg
                    className={`h-4 w-4 flex-shrink-0 text-soft transition-transform ${showProcess ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {showProcess && (
                  <div className="space-y-4 border-t px-4 pb-4 pt-4" style={{ borderColor: 'var(--border-color)' }}>
                    {hasThinking && <ThinkingBlock blocks={message.thinkingBlocks!} />}

                    {hasToolCalls && (
                      <div className="space-y-3">
                        {message.toolCalls!.map((tc, i) => (
                          <ToolCallBlock key={tc.id ?? i} toolCall={tc} />
                        ))}
                      </div>
                    )}

                    {hasTextEdits && <TextEditBlock edits={message.textEdits!} />}

                    {hasReferences && (
                      <div className="flex flex-wrap gap-2">
                        {message.inlineReferences!.map((ref, i) => {
                          const shortName = ref.name || ref.path.split('/').pop() || 'file';
                          return (
                            <span
                              key={i}
                              title={ref.path}
                              className="surface-card inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-secondary"
                            >
                              <svg className="h-3 w-3 text-soft" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                              </svg>
                              {shortName}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {hasContext && <ContextFiles files={message.usedContext!} />}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
