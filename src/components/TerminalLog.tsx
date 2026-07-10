import { useEffect, useRef } from "react";

interface TerminalLogProps {
  logs: string[];
}

export default function TerminalLog({ logs }: TerminalLogProps) {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="bg-[#F9F7F2] p-4 rounded-sm border border-[#1A1A1A]/10 font-mono text-[11px] leading-relaxed text-[#1A1A1A]/85 h-36 overflow-y-auto relative shadow-xs">
      <div className="absolute top-2.5 right-3 text-[9px] px-2 py-0.5 bg-[#A64D32]/10 text-[#A64D32] animate-pulse border border-[#A64D32]/20 font-bold rounded-sm">
        TELEMETRY ACTIVE
      </div>
      <div className="mb-2.5 text-[#1A1A1A] border-b border-[#1A1A1A]/10 pb-1.5 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
        <span>//</span> NEURAL PROCESSING LOGS
      </div>
      <div className="space-y-1">
        {logs.map((log, index) => {
          const isError = log.includes("ERROR") || log.includes("FAILURE") || log.includes("MISSING") || log.includes("FAULT");
          const isSuccess = log.includes("SUCCESS") || log.includes("COMPLETED") || log.includes("READY") || log.includes("STABILIZED");
          return (
            <div
              key={index}
              className={`${
                isError
                  ? "text-red-700 font-bold"
                  : isSuccess
                  ? "text-[#A64D32] font-semibold"
                  : "text-[#1A1A1A]/75"
              }`}
            >
              <span className="text-[#A64D32]/60 mr-1.5 font-bold">»</span>
              {log}
            </div>
          );
        })}
        {logs.length === 0 && (
          <div className="text-[#1A1A1A]/40 italic">
            [Standing by for research stream request input...]
          </div>
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}
