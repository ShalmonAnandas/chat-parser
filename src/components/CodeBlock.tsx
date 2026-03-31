'use client';

import { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  label?: string;
}

export default function CodeBlock({
  code,
  language,
  collapsible = false,
  defaultCollapsed = false,
  label,
}: CodeBlockProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div className="rounded-lg border border-zinc-800 overflow-hidden text-sm font-mono">
      {(collapsible || label) && (
        <div
          className={`flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 ${
            collapsible ? 'cursor-pointer hover:bg-zinc-800/50' : ''
          } transition-colors`}
          onClick={collapsible ? () => setCollapsed(!collapsed) : undefined}
        >
          <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-medium">
            {label ?? language ?? 'code'}
          </span>
          {collapsible && (
            <svg
              className={`w-3 h-3 text-zinc-600 transition-transform ${collapsed ? '' : 'rotate-180'}`}
              fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          )}
        </div>
      )}
      {!collapsed && (
        <pre className="overflow-x-auto p-3 bg-[#0c0c0c] text-zinc-300 leading-relaxed whitespace-pre-wrap break-words text-xs">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}
