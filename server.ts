import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { runResearcher, runEditor } from "./src/gemini"; // Standard TypeScript path resolution

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsing middleware
  app.use(express.json());

  // API Route to run the multi-agent sequential research pipeline
  app.post("/api/generate", async (req, res) => {
    const { topic } = req.body;

    if (!topic || typeof topic !== "string" || topic.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "CRITICAL SYSTEM FAILURE: Topic text input required.",
      });
    }

    console.log(`[CORE PROCESS] Initiating research pipeline for: "${topic}"`);

    try {
      // Step 1: Agent 1 (Researcher) searches the web and gathers structured facts
      console.log("[AGENT 1] Researcher deployed...");
      const rawFindings = await runResearcher(topic.trim());
      console.log(`[AGENT 1] Completed research. Raw response length: ${rawFindings.length} characters.`);

      // Step 2: Agent 2 (Editor) synthesizes the findings into a polished digest
      console.log("[AGENT 2] Editor deployed...");
      const { researcherFindings, editorDigest } = await runEditor(rawFindings, topic.trim());
      console.log(`[AGENT 2] Completed synthesis. Found ${researcherFindings.length} findings.`);

      // Return both outputs to allow the user to inspect the multi-agent sequence step-by-step
      return res.json({
        success: true,
        topic: topic.trim(),
        researcherFindings,
        editorDigest,
      });
    } catch (error: any) {
      console.error("[PIPELINE CRASH]", error);
      
      // Determine if it's an API Key issue
      const isApiKeyMissing = !process.env.GEMINI_API_KEY;
      const errorMessage = isApiKeyMissing 
        ? "GEMINI_API_KEY IS MISSING: Configure your secret key in the Secrets panel to authorize the research agents."
        : (error.message || "An unexpected neural pipeline breakdown occurred.");

      return res.status(500).json({
        success: false,
        error: errorMessage,
      });
    }
  });

  // Serve static files / Vite SPA fallback
  if (process.env.NODE_ENV !== "production") {
    console.log("[SYSTEM] Mounting Vite development middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[SYSTEM] Starting production environment...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`====================================================`);
    console.log(`SYSTEM TERMINAL COMPLETED INTERFACE BOOTSTRAP`);
    console.log(`ADDR: http://0.0.0.0:${PORT}`);
    console.log(`MODE: ${process.env.NODE_ENV || "development"}`);
    console.log(`====================================================`);
  });
}

startServer().catch((err) => {
  console.error("CRITICAL SYSTEM BOOT FAILURE:", err);
  process.exit(1);
});
