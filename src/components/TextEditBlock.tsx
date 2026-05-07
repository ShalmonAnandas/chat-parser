import { TextEdit } from '@/types/chat';
import CodeBlock from './CodeBlock';

interface TextEditBlockProps {
  edits: TextEdit[];
}

export default function TextEditBlock({ edits }: TextEditBlockProps) {
  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
      <div className="mb-3 flex items-center gap-2">
        <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
        </svg>
        <span className="text-xs font-medium text-emerald-300">
          File {edits.length === 1 ? 'Edit' : 'Edits'}
        </span>
      </div>
      <div className="space-y-3">
        {edits.map((edit, i) => (
          <div key={i} className="rounded-xl bg-black/10 px-3 py-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <svg className="h-3 w-3 flex-shrink-0 text-emerald-300/70" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              <span className="max-w-full truncate font-mono text-emerald-50" title={edit.uri}>
                {edit.fileName}
              </span>
              <span className="text-emerald-200/70">
                {edit.editCount} {edit.editCount === 1 ? 'change' : 'changes'}
              </span>
              {edit.done && (
                <svg className="h-3 w-3 flex-shrink-0 text-emerald-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              )}
            </div>
            {edit.patches && edit.patches.length > 0 && (
              <div className="mt-3 space-y-3">
                {edit.patches.slice(0, 2).map((patch, patchIndex) => (
                  <div key={patchIndex}>
                    <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-200/65">
                      Lines {patch.startLine}:{patch.startColumn}–{patch.endLine}:{patch.endColumn}
                    </p>
                    {patch.text ? (
                      <div className="overflow-hidden rounded-xl border border-emerald-400/15">
                        <CodeBlock
                          code={patch.text}
                          language="text"
                          collapsible={patch.text.length > 220}
                          defaultCollapsed={patch.text.length > 220}
                          label="Patch"
                        />
                      </div>
                    ) : (
                      <p className="rounded-lg bg-black/10 px-3 py-2 text-xs italic text-emerald-100/70">
                        Deleted content in this range
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
