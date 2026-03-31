'use client';

import { useState } from 'react';
import { ParsedMessage, ToolCall } from '@/types/chat';
import CodeBlock from './CodeBlock';

interface CodeChangesViewProps {
  messages: ParsedMessage[];
}

interface FileChange {
  toolCall: ToolCall;
  messageIndex: number;
}

function extractFilePath(args: ToolCall['arguments']): string {
  if (!args) return 'Unknown file';
  if (typeof args === 'string') {
    try {
      const parsed = JSON.parse(args);
      return parsed.path ?? parsed.file ?? parsed.filePath ?? parsed.uri ?? 'Unknown file';
    } catch {
      return 'Unknown file';
    }
  }
  return String(
    args.path ?? args.file ?? args.filePath ?? args.uri ?? 'Unknown file'
  );
}

function extractCode(args: ToolCall['arguments']): { oldStr?: string; newStr?: string; content?: string } {
  if (!args) return {};
  if (typeof args === 'string') {
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(args);
    } catch {
      return { content: args };
    }
    return {
      oldStr: parsed.old_str as string | undefined,
      newStr: parsed.new_str as string | undefined,
      content: (parsed.file_text ?? parsed.content ?? parsed.text) as string | undefined,
    };
  }
  if (typeof args === 'object' && args !== null) {
    const obj = args as Record<string, unknown>;
    return {
      oldStr: obj.old_str as string | undefined,
      newStr: obj.new_str as string | undefined,
      content: (obj.file_text ?? obj.content ?? obj.text) as string | undefined,
    };
  }
  return {};
}

export default function CodeChangesView({ messages }: CodeChangesViewProps) {
  const [open, setOpen] = useState(false);

  // Collect all file-write tool calls
  const changes: FileChange[] = [];
  messages.forEach((msg, idx) => {
    if (msg.toolCalls) {
      msg.toolCalls
        .filter((tc) => tc.category === 'file-write')
        .forEach((tc) => {
          changes.push({ toolCall: tc, messageIndex: idx });
        });
    }
  });

  if (changes.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-colors print:hidden"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
        </svg>
        View Changes ({changes.length})
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-4xl max-h-[85vh] rounded-2xl border border-zinc-800 bg-[#0a0a0a] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <div>
                <h2 className="text-lg font-semibold text-white">Code Changes</h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {changes.length} file {changes.length === 1 ? 'operation' : 'operations'} in this session
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {changes.map((change, i) => {
                const filePath = extractFilePath(change.toolCall.arguments);
                const fileName = filePath.split('/').pop() ?? filePath;
                const code = extractCode(change.toolCall.arguments);
                const description =
                  change.toolCall.pastTenseDescription ??
                  change.toolCall.description ??
                  change.toolCall.name;

                // Detect language from file extension
                const ext = fileName.split('.').pop()?.toLowerCase();
                const langMap: Record<string, string> = {
                  ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
                  py: 'python', rs: 'rust', go: 'go', java: 'java', css: 'css',
                  html: 'html', json: 'json', md: 'markdown', yaml: 'yaml', yml: 'yaml',
                };
                const lang = (ext && langMap[ext]) || 'text';

                return (
                  <div key={i} className="rounded-xl border border-zinc-800 overflow-hidden">
                    {/* File header */}
                    <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900/50 border-b border-zinc-800">
                      <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                      </svg>
                      <span className="text-sm font-mono text-zinc-300 truncate" title={filePath}>
                        {fileName}
                      </span>
                      <span className="text-xs text-zinc-600 ml-auto">{description}</span>
                    </div>

                    {/* Code content */}
                    <div className="p-4 space-y-3">
                      {code.oldStr && (
                        <div>
                          <p className="text-[10px] text-red-400 mb-1 uppercase tracking-wider font-medium">Removed</p>
                          <div className="rounded-lg border border-red-500/20 overflow-hidden">
                            <CodeBlock code={code.oldStr} language={lang} />
                          </div>
                        </div>
                      )}
                      {code.newStr && (
                        <div>
                          <p className="text-[10px] text-emerald-400 mb-1 uppercase tracking-wider font-medium">Added</p>
                          <div className="rounded-lg border border-emerald-500/20 overflow-hidden">
                            <CodeBlock code={code.newStr} language={lang} />
                          </div>
                        </div>
                      )}
                      {code.content && !code.oldStr && !code.newStr && (
                        <div>
                          <p className="text-[10px] text-blue-400 mb-1 uppercase tracking-wider font-medium">Content</p>
                          <CodeBlock
                            code={code.content}
                            language="text"
                            collapsible
                            defaultCollapsed={code.content.length > 500}
                          />
                        </div>
                      )}
                      {!code.oldStr && !code.newStr && !code.content && (
                        <p className="text-xs text-zinc-600 italic">No code content available for this operation</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
