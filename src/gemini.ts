import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured. Configure it in the Secrets panel.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export interface ResearchFinding {
  source: string;
  keyPoint: string;
  excerpt: string;
}

export interface ResearchDigest {
  intro: string;
  bullets: string[];
  takeaway: string;
}

/**
 * AGENT 1 - Researcher:
 * Searches the web for the given topic and returns 3-5 structured findings.
 */
export async function runResearcher(topic: string): Promise<string> {
  const ai = getAI();
  
  const systemInstruction = `You are AGENT 1: Researcher.
Your mission is to perform deep information retrieval on the user's requested topic.
Use the Google Search tool to find 3-5 high-quality, recent facts or sources on this topic.
Extract exactly 3-5 structured findings.
For each finding, you must present:
1. Source: A readable citation name or URL of the source.
2. Key Point: A concise, highly-dense factual point discovered (1-2 sentences).
3. Excerpt: A short direct excerpt or supporting evidence from the source.

Provide these findings clearly in plain text. Format them as a list so they can be easily read and parsed.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Search and research the topic: "${topic}". Return the research findings.`,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
      },
    });

    return response.text || "";
  } catch (error) {
    console.error("Error running Researcher Agent:", error);
    throw error;
  }
}

/**
 * AGENT 2 - Editor:
 * Synthesizes research findings into a polished, readable Research Digest.
 */
export async function runEditor(
  rawFindings: string,
  topic: string
): Promise<{ researcherFindings: ResearchFinding[]; editorDigest: ResearchDigest }> {
  const ai = getAI();

  const systemInstruction = `You are AGENT 2: Editor.
Your mission is twofold:
1. Parse the raw text research findings gathered by the Researcher (Agent 1) into a structured array. For each finding, extract:
   - "source": Name or URL of the citation source.
   - "keyPoint": Concise key point or fact discovered.
   - "excerpt": Short direct quote or supporting excerpt.
2. Synthesize these findings into a polished, readable Research Digest for the topic: "${topic}". Do NOT simply repeat Agent 1's findings. Rewrite, condense, and synthesize them into a professional intelligence briefing.

Format your output strictly in JSON matching this schema:
{
  "researcherFindings": [
    {
      "source": "string",
      "keyPoint": "string",
      "excerpt": "string"
    }
  ],
  "editorDigest": {
    "intro": "A short, engaging, retro-futuristic introductory paragraph setting the context (2-3 sentences max).",
    "bullets": [
      "A condensed, highly-polished bullet point synthesizing a key finding. Make it impact-driven and professional."
    ],
    "takeaway": "A sharp, powerful one-line takeaway summing up the industry or technological direction."
  }
}
Do not include any extra text outside the JSON block. Do not wrap the JSON in markdown code fences like \`\`\`json.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Here are the raw research findings from Agent 1:\n\n${rawFindings}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            researcherFindings: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  source: { type: "STRING", description: "Name or URL of the citation source" },
                  keyPoint: { type: "STRING", description: "Concise key point or fact discovered" },
                  excerpt: { type: "STRING", description: "Short direct quote or supporting excerpt" }
                },
                required: ["source", "keyPoint", "excerpt"]
              }
            },
            editorDigest: {
              type: "OBJECT",
              properties: {
                intro: { type: "STRING", description: "Engaging, high-level briefing introduction" },
                bullets: {
                  type: "ARRAY",
                  items: { type: "STRING" },
                  description: "3-5 key polished findings synthesized and rewritten"
                },
                takeaway: { type: "STRING", description: "Powerful one-sentence technological or industry takeaway" }
              },
              required: ["intro", "bullets", "takeaway"]
            }
          },
          required: ["researcherFindings", "editorDigest"]
        },
        temperature: 0.3,
      },
    });

    const responseText = response.text || "";
    const cleanText = responseText.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    const data = JSON.parse(cleanText);

    if (
      data &&
      Array.isArray(data.researcherFindings) &&
      data.editorDigest &&
      typeof data.editorDigest.intro === "string" &&
      Array.isArray(data.editorDigest.bullets) &&
      typeof data.editorDigest.takeaway === "string"
    ) {
      return data;
    }
    throw new Error("Invalid response format from Editor Agent");
  } catch (error) {
    console.error("Error running Editor Agent:", error);
    throw error;
  }
}
