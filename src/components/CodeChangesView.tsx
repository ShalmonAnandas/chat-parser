'use client';

import { useState } from 'react';
import { ParsedMessage, ToolCall, TextEdit } from '@/types/chat';
import CodeBlock from './CodeBlock';

interface CodeChangesViewProps {
  messages: ParsedMessage[];
}

interface FileChange {
  kind: 'tool-call' | 'text-edit';
  toolCall?: ToolCall;
  textEdit?: TextEdit;
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

  const changes: FileChange[] = [];
  messages.forEach((msg, idx) => {
    if (msg.toolCalls) {
      msg.toolCalls
        .filter((tc) => tc.category === 'file-write')
        .forEach((tc) => {
          changes.push({ kind: 'tool-call', toolCall: tc, messageIndex: idx });
        });
    }
    if (msg.textEdits) {
      msg.textEdits.forEach((textEdit) => {
        changes.push({ kind: 'text-edit', textEdit, messageIndex: idx });
      });
    }
  });

  if (changes.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="button-success print:hidden flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm transition-opacity hover:opacity-90"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
        </svg>
        View Changes ({changes.length})
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div className="surface-card-strong relative flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem]">
            <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: 'var(--border-color)' }}>
              <div>
                <h2 className="text-lg font-semibold text-primary">Code Changes</h2>
                <p className="mt-0.5 text-xs text-secondary">
                  {changes.length} file {changes.length === 1 ? 'operation' : 'operations'} in this session
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="surface-subtle flex h-9 w-9 items-center justify-center rounded-xl text-secondary transition-colors hover:text-primary"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              {changes.map((change, i) => {
                const filePath =
                  change.kind === 'tool-call' && change.toolCall
                    ? extractFilePath(change.toolCall.arguments)
                    : change.textEdit?.uri ?? 'Unknown file';
                const fileName = filePath.split('/').pop() ?? filePath;
                const code =
                  change.kind === 'tool-call' && change.toolCall ? extractCode(change.toolCall.arguments) : undefined;
                const description =
                  change.kind === 'tool-call' && change.toolCall
                    ? change.toolCall.pastTenseDescription ?? change.toolCall.description ?? change.toolCall.name
                    : 'Applied text edit';

                // Detect language from file extension
                const ext = fileName.split('.').pop()?.toLowerCase();
                const langMap: Record<string, string> = {
                  ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
                  py: 'python', rs: 'rust', go: 'go', java: 'java', css: 'css',
                  html: 'html', json: 'json', md: 'markdown', yaml: 'yaml', yml: 'yaml',
                };
                const lang = (ext && langMap[ext]) || 'text';

                return (
                  <div key={i} className="overflow-hidden rounded-[1.5rem] border" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--surface-3)' }}>
                      <svg className="tone-text tone-emerald h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                      </svg>
                      <span className="truncate text-sm font-mono text-primary" title={filePath}>
                        {fileName}
                      </span>
                      <span className="ml-auto text-xs text-soft">{description}</span>
                    </div>

                    <div className="p-4 space-y-3">
                      {change.kind === 'tool-call' && code?.oldStr && (
                        <div>
                          <p className="tone-text tone-red mb-1 text-[10px] font-medium uppercase tracking-[0.2em]">Removed</p>
                          <div className="tone-surface tone-red overflow-hidden rounded-lg">
                            <CodeBlock code={code.oldStr} language={lang} />
                          </div>
                        </div>
                      )}
                      {change.kind === 'tool-call' && code?.newStr && (
                        <div>
                          <p className="tone-text tone-emerald mb-1 text-[10px] font-medium uppercase tracking-[0.2em]">Added</p>
                          <div className="tone-surface tone-emerald overflow-hidden rounded-lg">
                            <CodeBlock code={code.newStr} language={lang} />
                          </div>
                        </div>
                      )}
                      {change.kind === 'tool-call' && code?.content && !code?.oldStr && !code?.newStr && (
                        <div>
                          <p className="tone-text tone-blue mb-1 text-[10px] font-medium uppercase tracking-[0.2em]">Content</p>
                          <CodeBlock
                            code={code.content}
                            language="text"
                            collapsible
                            defaultCollapsed={code.content.length > 500}
                          />
                        </div>
                      )}
                      {change.kind === 'text-edit' && change.textEdit?.patches && change.textEdit.patches.length > 0 && (
                        <div className="space-y-3">
                          {change.textEdit.patches.map((patch, patchIndex) => (
                            <div key={patchIndex}>
                              <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.2em] text-soft">
                                Lines {patch.startLine}:{patch.startColumn}–{patch.endLine}:{patch.endColumn}
                              </p>
                              {patch.text ? (
                                <CodeBlock
                                  code={patch.text}
                                  language={lang}
                                  collapsible={patch.text.length > 240}
                                  defaultCollapsed={patch.text.length > 240}
                                  label="Patch"
                                />
                              ) : (
                                <p className="rounded-lg px-3 py-2 text-xs italic text-soft" style={{ backgroundColor: 'var(--surface-3)' }}>
                                  Deleted content in this range
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {((change.kind === 'tool-call' && !code?.oldStr && !code?.newStr && !code?.content) ||
                        (change.kind === 'text-edit' && (!change.textEdit?.patches || change.textEdit.patches.length === 0))) && (
                        <p className="text-xs italic text-soft">No patch content available for this operation</p>
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
