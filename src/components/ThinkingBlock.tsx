'use client';

import { useState } from 'react';
import { ThinkingBlock as ThinkingBlockType } from '@/types/chat';

interface ThinkingBlockProps {
  blocks: ThinkingBlockType[];
}

export default function ThinkingBlock({ blocks }: ThinkingBlockProps) {
  const [expanded, setExpanded] = useState(false);

  const totalChars = blocks.reduce((sum, b) => sum + b.content.length, 0);
  const preview = (blocks[0]?.content.slice(0, 150).replace(/\s+\S*$/, '').trim()) ?? '';

  return (
    <div className="tone-surface tone-purple overflow-hidden rounded-2xl">
      <button
        className="flex w-full items-center gap-2 px-4 py-3 text-left transition-opacity hover:opacity-90"
        onClick={() => setExpanded(!expanded)}
      >
        <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
        </svg>
        <span className="text-xs font-medium">
          Thinking
          <span className="ml-1 opacity-70">
            ({blocks.length} {blocks.length === 1 ? 'block' : 'blocks'} · {totalChars.toLocaleString()} chars)
          </span>
        </span>
        <svg
          className={`ml-auto h-3.5 w-3.5 opacity-70 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {!expanded && preview && (
        <div className="px-4 pb-3">
          <p className="text-xs italic opacity-75 truncate">{preview}…</p>
        </div>
      )}

      {expanded && (
        <div className="max-h-96 space-y-3 overflow-y-auto px-4 pb-4">
          {blocks.map((block, i) => (
            <div key={block.id ?? i} className="surface-subtle whitespace-pre-wrap rounded-xl px-3 py-2 font-mono text-xs leading-relaxed text-primary">
              {block.content}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
