import { useState } from "react";
import { SavedDigest } from "../firebase";
import { Search, RefreshCw, Calendar, ChevronRight, FileText } from "lucide-react";
import { motion } from "motion/react";

interface SidebarProps {
  history: SavedDigest[];
  onSelectDigest: (digest: SavedDigest) => void;
  selectedDigestId?: string;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function Sidebar({
  history,
  onSelectDigest,
  selectedDigestId,
  onRefresh,
  isLoading,
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredHistory = history.filter((item) =>
    item.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#F9F7F2] border border-[#1A1A1A]/10 rounded-sm p-6 shadow-sm">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-4 mb-5">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#A64D32]" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]/60">
            Research Archive
          </h2>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-1.5 hover:bg-[#1A1A1A]/5 border border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30 rounded-sm text-[#1A1A1A]/70 transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center"
          title="Refresh Archive"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Search Input */}
      <div className="relative mb-5">
        <input
          type="text"
          placeholder="Filter archives..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/70 border border-[#1A1A1A]/10 focus:border-[#A64D32] focus:bg-white text-[#1A1A1A] font-sans text-xs py-2 pl-8 pr-3 outline-none transition-all rounded-sm placeholder:italic placeholder:opacity-50"
        />
        <Search className="w-3.5 h-3.5 text-[#1A1A1A]/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-[220px]">
        {filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-[#1A1A1A]/10 rounded-sm bg-white/30">
            <span className="font-serif italic text-xs text-[#1A1A1A]/50">
              {searchTerm ? "No matching records" : "Archive empty"}
            </span>
            <span className="font-sans text-[10px] text-[#A64D32] mt-2 uppercase tracking-wider">
              [Compile new digest]
            </span>
          </div>
        ) : (
          filteredHistory.map((item) => {
            const isSelected = item.id === selectedDigestId;
            return (
              <motion.button
                key={item.id || item.timestamp}
                whileHover={{ x: 2 }}
                onClick={() => onSelectDigest(item)}
                className={`w-full text-left p-4 rounded-sm border transition-all relative flex flex-col gap-1.5 ${
                  isSelected
                    ? "bg-white border-[#1A1A1A] shadow-md"
                    : "bg-white/40 border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30 hover:bg-white/80"
                }`}
              >
                {/* Highlight left border line */}
                {isSelected && (
                  <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-[#A64D32]"></div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] text-[#A64D32] font-bold uppercase italic tracking-wide">
                    <Calendar className="w-3 h-3" />
                    {formatDate(item.timestamp)}
                  </div>
                  {isSelected && (
                    <span className="text-[9px] px-2 py-0.2 bg-[#A64D32] text-white font-bold uppercase tracking-wider rounded-sm scale-90">
                      CURRENT
                    </span>
                  )}
                </div>

                <div className="font-serif font-bold text-sm text-[#1A1A1A] line-clamp-2 leading-snug group-hover:underline">
                  {item.topic}
                </div>

                <div className="text-[11px] text-[#1A1A1A]/60 line-clamp-1 mt-0.5 pt-2 border-t border-[#1A1A1A]/5">
                  {item.editorDigest.intro}
                </div>
              </motion.button>
            );
          })
        )}
      </div>

      {/* Database connection badge */}
      <div className="mt-6 pt-4 border-t border-[#1A1A1A]/10">
        <div className="p-3 bg-white border border-[#1A1A1A]/10 rounded-sm shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/40 font-bold">STABLE PERSISTENCE</p>
            <p className="text-xs text-[#1A1A1A]/80 font-serif italic">Connected to Cloud Firestore</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
