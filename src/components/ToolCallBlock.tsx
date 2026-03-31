'use client';

import { useState } from 'react';
import { ToolCall, ToolCategory } from '@/types/chat';
import CodeBlock from './CodeBlock';

interface ToolCallBlockProps {
  toolCall: ToolCall;
}

function formatArgs(args: ToolCall['arguments']): string {
  if (args == null) return '';
  if (typeof args === 'string') return args;
  return JSON.stringify(args, null, 2);
}

function formatResult(result: unknown): string {
  if (result == null) return '';
  if (typeof result === 'string') return result;
  return JSON.stringify(result, null, 2);
}

/** Get icon, color, and label based on tool category */
function getCategoryStyle(category: ToolCategory): {
  icon: React.ReactNode;
  borderColor: string;
  bgColor: string;
  textColor: string;
  label: string;
} {
  switch (category) {
    case 'file-read':
      return {
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        ),
        borderColor: 'border-blue-500/20',
        bgColor: 'bg-blue-500/5',
        textColor: 'text-blue-400',
        label: 'Read',
      };
    case 'file-write':
      return {
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
        ),
        borderColor: 'border-emerald-500/20',
        bgColor: 'bg-emerald-500/5',
        textColor: 'text-emerald-400',
        label: 'Write',
      };
    case 'file-search':
      return {
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        ),
        borderColor: 'border-cyan-500/20',
        bgColor: 'bg-cyan-500/5',
        textColor: 'text-cyan-400',
        label: 'Search',
      };
    case 'terminal':
      return {
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        ),
        borderColor: 'border-amber-500/20',
        bgColor: 'bg-amber-500/5',
        textColor: 'text-amber-400',
        label: 'Terminal',
      };
    case 'subagent':
      return {
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
          </svg>
        ),
        borderColor: 'border-violet-500/20',
        bgColor: 'bg-violet-500/5',
        textColor: 'text-violet-400',
        label: 'Sub-agent',
      };
    case 'search':
      return {
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        ),
        borderColor: 'border-sky-500/20',
        bgColor: 'bg-sky-500/5',
        textColor: 'text-sky-400',
        label: 'Search',
      };
    default:
      return {
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
          </svg>
        ),
        borderColor: 'border-zinc-700/50',
        bgColor: 'bg-zinc-800/30',
        textColor: 'text-zinc-400',
        label: 'Tool',
      };
  }
}

/** Format a tool name for display (e.g. copilot_readFile → Read File) */
function formatToolName(name: string): string {
  // Remove common prefixes
  let clean = name.replace(/^copilot_/, '').replace(/^vscode_/, '');
  // camelCase to space-separated
  clean = clean.replace(/([a-z])([A-Z])/g, '$1 $2');
  // snake_case to space-separated
  clean = clean.replace(/_/g, ' ');
  // Capitalize first letter
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

export default function ToolCallBlock({ toolCall }: ToolCallBlockProps) {
  const [expanded, setExpanded] = useState(false);
  const argsStr = formatArgs(toolCall.arguments);
  const resultStr = formatResult(toolCall.result);
  const style = getCategoryStyle(toolCall.category);
  const hasDetails = !!(argsStr || resultStr);

  // Use pastTenseDescription if available, else the description, else format the name
  const displayName = toolCall.pastTenseDescription ?? toolCall.description ?? formatToolName(toolCall.name);

  return (
    <div className={`rounded-lg border ${style.borderColor} ${style.bgColor} overflow-hidden`}>
      <button
        className={`w-full flex items-center gap-2 px-3 py-2 text-left ${hasDetails ? 'hover:bg-white/5 cursor-pointer' : 'cursor-default'} transition-colors`}
        onClick={hasDetails ? () => setExpanded(!expanded) : undefined}
      >
        <span className={style.textColor}>{style.icon}</span>
        <span className={`text-xs font-medium ${style.textColor}`}>{style.label}</span>
        <span className="text-xs text-zinc-400 truncate flex-1">{displayName}</span>
        {toolCall.isError && (
          <span className="text-xs bg-red-500/15 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded">
            Error
          </span>
        )}
        {hasDetails && (
          <svg
            className={`w-3.5 h-3.5 text-zinc-600 transition-transform flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        )}
      </button>

      {expanded && hasDetails && (
        <div className="px-3 pb-3 space-y-2 border-t border-white/5">
          {argsStr && (
            <div className="pt-2">
              <p className="text-[10px] text-zinc-500 mb-1 uppercase tracking-wider font-medium">Arguments</p>
              <CodeBlock code={argsStr} language="json" />
            </div>
          )}
          {resultStr && (
            <div>
              <p className="text-[10px] text-zinc-500 mb-1 uppercase tracking-wider font-medium">Result</p>
              <CodeBlock
                code={resultStr}
                language="text"
                collapsible
                defaultCollapsed={resultStr.length > 500}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
