import { UsedContext } from '@/types/chat';

interface ContextFilesProps {
  files: UsedContext[];
}

export default function ContextFiles({ files }: ContextFilesProps) {
  if (!files || files.length === 0) return null;

  return (
    <div className="mt-4 rounded-2xl surface-subtle px-4 py-3">
      <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-soft">Context Files</p>
      <div className="flex flex-wrap gap-2">
        {files.map((f, i) => {
          const name = f.fileName ?? f.uri ?? 'unknown';
          const shortName = name.split('/').pop() ?? name;
          return (
            <span
              key={i}
              title={f.uri ?? f.fileName}
              className="inline-flex items-center gap-1.5 rounded-full surface-card px-3 py-1.5 text-xs text-secondary"
            >
              <svg className="h-3 w-3 text-soft" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              <span>{shortName}</span>
              {f.range && (
                <span className="text-soft">
                  :{f.range.startLine}–{f.range.endLine}
                </span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
