import { UsedContext } from '@/types/chat';

interface ContextFilesProps {
  files: UsedContext[];
}

export default function ContextFiles({ files }: ContextFilesProps) {
  if (!files || files.length === 0) return null;

  return (
    <div className="mt-3 p-3 rounded-md border border-[#30363d] bg-[#161b22]">
      <p className="text-xs text-[#8b949e] mb-2 uppercase tracking-wide">Context Files</p>
      <div className="flex flex-wrap gap-2">
        {files.map((f, i) => {
          const name = f.fileName ?? f.uri ?? 'unknown';
          const shortName = name.split('/').pop() ?? name;
          return (
            <span
              key={i}
              title={f.uri ?? f.fileName}
              className="flex items-center gap-1 text-xs bg-[#0d1117] border border-[#30363d] text-[#8b949e] rounded px-2 py-1"
            >
              <span>📄</span>
              <span>{shortName}</span>
              {f.range && (
                <span className="text-[#6e7681]">
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
