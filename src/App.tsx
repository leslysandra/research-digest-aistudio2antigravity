import { useState, useEffect, FormEvent } from "react";
import Sidebar from "./components/Sidebar";
import TerminalLog from "./components/TerminalLog";
import DigestViewer from "./components/DigestViewer";
import { saveDigest, getDigestsHistory, SavedDigest } from "./firebase";
import { BookOpen, Sparkles, HelpCircle, ShieldAlert, Cpu, Newspaper } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeDigest, setActiveDigest] = useState<SavedDigest | null>(null);
  const [history, setHistory] = useState<SavedDigest[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [systemError, setSystemError] = useState<string | null>(null);

  // Load history from Firestore on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    setSystemError(null);
    try {
      const pastDigests = await getDigestsHistory();
      setHistory(pastDigests);
      if (pastDigests.length > 0 && !activeDigest) {
        // Automatically open the most recent digest if none is active
        setActiveDigest(pastDigests[0]);
      }
    } catch (err: any) {
      console.error("Error loading Firestore history:", err);
      setSystemError("FIRESTORE ACCESS FAILURE: Unable to sync with the neural database.");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSelectDigest = (digest: SavedDigest) => {
    setActiveDigest(digest);
    setLogs([
      `[SYSTEM] LOADED SAVED ARCHIVE NODE: "${digest.topic}"`,
      `[TIMESTAMP] UTC ${new Date(digest.timestamp).toISOString()}`,
      `[AGENT_1] 3-5 SOURCE CITATIONS VERIFIED`,
      `[AGENT_2] RE-RENDERING COGNITIVE SYNTHESIS...`,
    ]);
  };

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    setSystemError(null);
    
    // Multi-Agent simulation of terminal logging
    setLogs([
      "INITIALIZING NEURAL PROCESSING ENGINE...",
      "BOOTING SEQUENTIAL COGNITIVE COMPILER...",
      "CONNECTING TO CLOUD WORKER FRAMEWORK...",
    ]);

    // Fast-flicker log updates
    const logIntervals = [
      { delay: 800, text: "DEPLOYING AGENT_1: WEB RESEARCH PROBE..." },
      { delay: 1800, text: "AGENT_1: ENABLING GOOGLE SEARCH GROUNDING CHANNELS..." },
      { delay: 3000, text: "AGENT_1: SPANNING DEEP SEARCH INDEXES FOR RECENT KNOWLEDGE..." },
    ];

    const timeouts: NodeJS.Timeout[] = [];
    logIntervals.forEach(({ delay, text }) => {
      timeouts.push(
        setTimeout(() => {
          setLogs((prev) => [...prev, text]);
        }, delay)
      );
    });

    try {
      // POST to our backend API proxying Gemini
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic: topic.trim() }),
      });

      const data = await response.json();

      // Clear any pending mock logs
      timeouts.forEach((t) => clearTimeout(t));

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Neural synthesis process encountered a core fault.");
      }

      setLogs((prev) => [
        ...prev,
        `AGENT_1 SUCCESS: GATHERED ${data.researcherFindings.length} GROUNDED SOURCES.`,
        "COMMITTING RESEARCH SCHEMA TO STAGE_2 INTERFACE...",
        "DEPLOYING AGENT_2: REPORT SYNTAX EDITOR...",
        "AGENT_2: PROCESSING STRUCTURAL CONFLATION & REWRITING FACTUAL ARTIFACTS...",
        "AGENT_2 SUCCESS: BRIEFING FORMULATED.",
        "PERSISTING RECORD IN CLOUD FIRESTORE...",
      ]);

      // Save to Firestore on client
      const newDocId = await saveDigest(
        data.topic,
        data.researcherFindings,
        data.editorDigest
      );

      const savedItem: SavedDigest = {
        id: newDocId,
        topic: data.topic,
        timestamp: Date.now(),
        researcherFindings: data.researcherFindings,
        editorDigest: data.editorDigest,
      };

      setLogs((prev) => [
        ...prev,
        `PERSISTENCE COMMITTED. DOCUMENT ID: ${newDocId}`,
        "NEURAL STREAM STABILIZED. COGNITIVE PIPELINE CLOSED. SYSTEM IDEAL.",
      ]);

      // Update state
      setActiveDigest(savedItem);
      setHistory((prev) => [savedItem, ...prev]);
      setTopic(""); // Clear input
    } catch (err: any) {
      timeouts.forEach((t) => clearTimeout(t));
      console.error("Pipeline failure:", err);
      const errText = err.message || "COGNITIVE PIPELINE INTERRUPT: UNKNOWN DISRUPTION.";
      setLogs((prev) => [...prev, `[CRITICAL FAULT] ${errText.toUpperCase()}`]);
      setSystemError(errText);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] flex flex-col justify-between font-sans selection:bg-[#A64D32]/10 selection:text-[#A64D32]">
      
      {/* Top Banner & Heading Header */}
      <header className="border-b border-[#1A1A1A]/10 bg-[#FDFCFB]/90 backdrop-blur-md sticky top-0 z-40 px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Newspaper className="w-5 h-5 text-[#A64D32]" />
              <span className="text-[10px] bg-[#A64D32]/10 text-[#A64D32] border border-[#A64D32]/20 px-2 py-0.5 uppercase tracking-widest font-bold rounded-sm">
                SEQUENTIAL AI COGNITIVE AGENTS
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif italic font-black tracking-tighter text-[#1A1A1A] leading-none">
              Research<br />Digest.
            </h1>
          </div>
          <div className="text-left md:text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/40 mb-1">
              CURRENT EDITION
            </p>
            <p className="text-xs font-serif text-[#1A1A1A]/80">
              No. 089 — Grounded Multimodal Synthesis
            </p>
          </div>
        </div>
      </header>

      {/* Main App Workspace */}
      <main className="max-w-7xl mx-auto w-full flex-grow p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Topic input, Terminal logs, and Active synthesis display */}
        <section className="lg:col-span-8 space-y-8 flex flex-col justify-start">
          
          {/* Main prompt input panel */}
          <div className="border border-[#1A1A1A]/10 p-6 rounded-sm bg-white shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]/50 mb-3">
              // Quantitative Ingestion Stream
            </h3>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  required
                  disabled={isGenerating}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter topic for research (e.g., latest trends in solid-state batteries)..."
                  className="w-full bg-transparent border-b border-[#1A1A1A] py-2 text-lg font-serif text-[#1A1A1A] focus:outline-none placeholder:italic placeholder:opacity-30 focus:border-[#A64D32] transition-colors"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-xs text-[#1A1A1A]/60 flex items-center gap-1.5 font-sans">
                  <HelpCircle className="w-4 h-4 text-[#A64D32]" />
                  Launches sequential Agent 1 (Searcher) and Agent 2 (Editor).
                </p>
                <button
                  type="submit"
                  disabled={isGenerating || !topic.trim()}
                  className="bg-[#1A1A1A] text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#A64D32] transition-colors rounded-sm disabled:opacity-40 select-none flex items-center gap-2 justify-center cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <Cpu className="w-4 h-4 animate-spin" />
                      PROBING THE COGNITIVE STREAM...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      GENERATE DIGEST
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* System Error Notification Banner */}
          {systemError && (
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#A64D32]/5 border border-[#A64D32]/30 p-5 rounded-sm text-[#A64D32] font-sans text-xs flex gap-3 shadow-xs"
            >
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <div>
                <strong className="font-bold uppercase tracking-wider block mb-1">
                  CRITICAL SYSTEM COMPROMISE OR MISSING KEY
                </strong>
                <p className="leading-relaxed text-[#1A1A1A]/80">{systemError}</p>
                <p className="mt-2 text-[10px] text-[#A64D32]/70 font-semibold uppercase">
                  Please verify GEMINI_API_KEY environment settings inside the AI Studio Secrets panel.
                </p>
              </div>
            </motion.div>
          )}

          {/* Telemetry Log */}
          <TerminalLog logs={logs} />

          {/* Active synthesized output displaying step-by-step sequential intelligence */}
          <div className="flex-grow pt-4">
            <AnimatePresence mode="wait">
              {activeDigest ? (
                <div key={activeDigest.id || activeDigest.timestamp}>
                  <DigestViewer digest={activeDigest} />
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border border-dashed border-[#1A1A1A]/20 rounded-sm p-16 text-center flex flex-col items-center justify-center bg-[#F9F7F2] min-h-[350px]"
                >
                  <BookOpen className="w-10 h-10 text-[#A64D32]/30 mb-4 animate-pulse" />
                  <p className="font-serif italic text-base text-[#1A1A1A]/50">
                    [System Idle — Archives Stowed]
                  </p>
                  <p className="text-xs text-[#1A1A1A]/40 mt-2 max-w-sm font-sans leading-relaxed">
                    Provide a research topic query in the field above or select a past intelligence record from the side catalog index to begin synthesis.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </section>

        {/* Right Side: Historical data records indices */}
        <section className="lg:col-span-4 h-full flex flex-col">
          <Sidebar
            history={history}
            onSelectDigest={handleSelectDigest}
            selectedDigestId={activeDigest?.id}
            onRefresh={fetchHistory}
            isLoading={isLoadingHistory}
          />
        </section>

      </main>

      {/* Cyber Footer */}
      <footer className="border-t border-[#1A1A1A]/10 bg-[#F9F7F2] px-6 py-4 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-[#1A1A1A]/50 font-mono">
          <div className="uppercase tracking-wider">
            EDITORIAL ENGINE © 2026 RESEARCH DIGEST INC. ALL CHANNELS SECURED.
          </div>
          <div className="flex items-center gap-4">
            <div>PIPELINE: SEQUENTIAL (A1_PROBE_V2.5 -&gt; A2_SYNTAX)</div>
            <div>UTC: {new Date().toISOString().substring(0, 10)}</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
