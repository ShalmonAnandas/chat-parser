'use client';

import { ToolCall } from '@/types/chat';
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

export default function ToolCallBlock({ toolCall }: ToolCallBlockProps) {
  const argsStr = formatArgs(toolCall.arguments);
  const resultStr = formatResult(toolCall.result);

  return (
    <div className="rounded-lg border border-[#30363d] bg-[#161b22] overflow-hidden my-3">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#30363d] bg-[#1c2128]">
        <span className="text-base">🔧</span>
        <span className="font-semibold text-[#58a6ff] text-sm">{toolCall.name}</span>
        {toolCall.isError && (
          <span className="ml-auto text-xs bg-red-900/40 text-red-400 border border-red-800 px-2 py-0.5 rounded-full">
            Error
          </span>
        )}
        {!toolCall.isError && resultStr && (
          <span className="ml-auto text-xs bg-green-900/40 text-green-400 border border-green-800 px-2 py-0.5 rounded-full">
            Success
          </span>
        )}
      </div>
      <div className="p-4 space-y-3">
        {argsStr && (
          <div>
            <p className="text-xs text-[#8b949e] mb-1 uppercase tracking-wide">Arguments</p>
            <CodeBlock code={argsStr} language="json" collapsible defaultCollapsed={false} />
          </div>
        )}
        {resultStr && (
          <div>
            <p className="text-xs text-[#8b949e] mb-1 uppercase tracking-wide">Result</p>
            <CodeBlock
              code={resultStr}
              language="text"
              collapsible
              defaultCollapsed={resultStr.length > 500}
            />
          </div>
        )}
      </div>
    </div>
  );
}
