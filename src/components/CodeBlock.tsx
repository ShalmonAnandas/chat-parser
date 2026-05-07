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
    <div className="overflow-hidden rounded-xl border text-sm font-mono" style={{ borderColor: 'var(--border-color)' }}>
      {(collapsible || label) && (
        <div
          className={`flex items-center justify-between px-3 py-2 ${
            collapsible ? 'cursor-pointer hover:opacity-90' : ''
          } transition-colors`}
          style={{
            backgroundColor: 'var(--surface-3)',
            borderBottom: '1px solid var(--border-color)',
          }}
          onClick={collapsible ? () => setCollapsed(!collapsed) : undefined}
        >
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-soft">
            {label ?? language ?? 'code'}
          </span>
          {collapsible && (
            <svg
              className={`h-3 w-3 text-soft transition-transform ${collapsed ? '' : 'rotate-180'}`}
              fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          )}
        </div>
      )}
      {!collapsed && (
        <pre className="code-surface overflow-x-auto whitespace-pre-wrap break-words p-3 text-xs leading-relaxed text-secondary">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}
