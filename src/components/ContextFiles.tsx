import { UsedContext } from '@/types/chat';

interface ContextFilesProps {
  files: UsedContext[];
}

export default function ContextFiles({ files }: ContextFilesProps) {
  if (!files || files.length === 0) return null;

  return (
    <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2">
      <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wider font-medium">Context Files</p>
      <div className="flex flex-wrap gap-1.5">
        {files.map((f, i) => {
          const name = f.fileName ?? f.uri ?? 'unknown';
          const shortName = name.split('/').pop() ?? name;
          return (
            <span
              key={i}
              title={f.uri ?? f.fileName}
              className="flex items-center gap-1 text-xs bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 rounded-md px-2 py-1"
            >
              <svg className="w-3 h-3 text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              <span>{shortName}</span>
              {f.range && (
                <span className="text-zinc-600">
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
