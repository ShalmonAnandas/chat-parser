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
    <div className="rounded-md border border-[#30363d] overflow-hidden text-sm font-mono">
      {(collapsible || label) && (
        <div
          className={`flex items-center justify-between px-3 py-2 bg-[#161b22] border-b border-[#30363d] ${
            collapsible ? 'cursor-pointer hover:bg-[#1c2128]' : ''
          }`}
          onClick={collapsible ? () => setCollapsed(!collapsed) : undefined}
        >
          <span className="text-[#8b949e] text-xs uppercase tracking-wide">
            {label ?? language ?? 'code'}
          </span>
          {collapsible && (
            <span className="text-[#8b949e]">{collapsed ? '▶' : '▼'}</span>
          )}
        </div>
      )}
      {!collapsed && (
        <pre className="overflow-x-auto p-4 bg-[#0d1117] text-[#e6edf3] leading-relaxed whitespace-pre-wrap break-words">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}
