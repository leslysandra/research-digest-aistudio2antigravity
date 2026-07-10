import { useState } from "react";
import { SavedDigest } from "../firebase";
import { BookOpen, Layers, ExternalLink, Quote, Sparkles, CheckSquare } from "lucide-react";
import { motion } from "motion/react";

interface DigestViewerProps {
  digest: SavedDigest;
}

export default function DigestViewer({ digest }: DigestViewerProps) {
  const [showRawResearcher, setShowRawResearcher] = useState(false);

  const formattedDate = new Date(digest.timestamp).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-8"
    >
      {/* Active Digest Header */}
      <div className="border-b border-[#1A1A1A]/10 pb-6 relative">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A64D32] mb-1.5 italic">
          Grounded Intelligence Briefing — {formattedDate}
        </div>
        <h2 className="font-serif text-3xl md:text-4xl font-black text-[#1A1A1A] leading-tight tracking-tight">
          {digest.topic}
        </h2>
      </div>

      {/* Grid: Agent 2 (Editor Report) and Agent 1 (Researcher Source Data) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Agent 2: The Editor (Synthesized Report) - Takes 7 Cols on desktop */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-[#A64D32] text-white text-[9px] font-bold uppercase tracking-wider">
              Agent 2: Editor
            </span>
            <div className="h-px flex-1 bg-[#1A1A1A]/10"></div>
          </div>

          <div className="max-w-prose">
            {/* Intro */}
            <p className="text-base leading-relaxed text-[#1A1A1A]/90 font-serif italic mb-6 border-l-2 border-[#A64D32] pl-4 py-1">
              {digest.editorDigest.intro || "Synthesizing input streams..."}
            </p>

            {/* Bullets */}
            <div className="space-y-5 mb-8">
              {digest.editorDigest.bullets.map((bullet, idx) => {
                // Split strong part if exists
                const parts = bullet.split(":");
                const hasHeader = parts.length > 1;
                const headerText = hasHeader ? parts[0] : "";
                const bodyText = hasHeader ? parts.slice(1).join(":") : bullet;

                return (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    key={idx}
                    className="flex gap-3 items-start"
                  >
                    <span className="text-[#A64D32] font-serif text-lg leading-none select-none">•</span>
                    <p className="text-sm text-[#1A1A1A]/85 leading-relaxed">
                      {hasHeader ? (
                        <>
                          <strong className="font-bold uppercase text-[11px] text-[#1A1A1A] tracking-wide mr-1.5">
                            {headerText.trim()}:
                          </strong>
                          {bodyText.trim()}
                        </>
                      ) : (
                        bullet
                      )}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Takeaway Section */}
            <div className="p-5 border border-[#1A1A1A] bg-[#1A1A1A]/5 rounded-sm relative">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#A64D32] mb-1.5">
                The Takeaway
              </p>
              <p className="text-sm font-serif italic text-[#1A1A1A] leading-relaxed">
                {digest.editorDigest.takeaway || "No takeaway registered."}
              </p>
            </div>
          </div>
        </div>

        {/* Agent 1: The Researcher (Raw Grounded Data) - Takes 5 Cols on desktop */}
        <div className="lg:col-span-5 bg-[#F4F1EC] p-6 border border-[#1A1A1A]/10 rounded-sm space-y-6">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 border border-[#1A1A1A] text-[#1A1A1A] text-[9px] font-bold uppercase tracking-wider bg-white">
              Agent 1: Researcher
            </span>
            <div className="h-px flex-1 bg-[#1A1A1A]/10"></div>
          </div>

          <div className="space-y-6">
            {digest.researcherFindings.map((finding, index) => (
              <div
                key={index}
                className="border-l-2 border-[#A64D32]/60 pl-4 py-1 space-y-1.5"
              >
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-[#A64D32] tracking-wide">
                  <BookOpen className="w-3 h-3 shrink-0" />
                  Source: {finding.source}
                </div>
                <h4 className="text-xs font-bold leading-snug text-[#1A1A1A]">
                  {finding.keyPoint}
                </h4>
                <p className="text-[11px] italic text-[#1A1A1A]/65 leading-relaxed bg-white/40 p-2 border border-[#1A1A1A]/5 rounded-sm">
                  "{finding.excerpt}"
                </p>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#1A1A1A]/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#1A1A1A]/60">
              <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></div>
              WEB GROUNDING SECURED
            </div>
            <button
              onClick={() => setShowRawResearcher(!showRawResearcher)}
              className="text-[10px] font-bold uppercase tracking-wider text-[#A64D32] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Layers className="w-3 h-3" />
              {showRawResearcher ? "Hide Debug Logs" : "Inspect Sequence"}
            </button>
          </div>
        </div>

      </div>

      {/* Raw JSON Debug Sequence view */}
      {showRawResearcher && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border border-[#1A1A1A]/10 p-5 bg-[#F9F7F2] rounded-sm font-mono text-[11px] text-[#1A1A1A]/80 space-y-3"
        >
          <div className="flex items-center gap-1.5 text-xs text-[#A64D32] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Sequential Pipeline Log (Agent 1 Output Schema)
          </div>
          <p className="text-[11px] text-[#1A1A1A]/60 leading-relaxed font-sans">
            Inspect the exact payload successfully handed off from Agent 1 (the Researcher, utilizing Google Search tools) to Agent 2 (the Editorial Synthesizer).
          </p>
          <pre className="bg-white p-4 border border-[#1A1A1A]/10 rounded-sm overflow-x-auto text-[11px] max-h-60 overflow-y-auto leading-relaxed">
            {JSON.stringify(digest.researcherFindings, null, 2)}
          </pre>
        </motion.div>
      )}
    </motion.div>
  );
}
