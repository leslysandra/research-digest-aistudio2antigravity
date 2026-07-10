# Research Digest — AI Studio → Antigravity Test Project

A two-agent research digest app, originally built in Google AI Studio and exported to
Google Antigravity using the new one-click **Export to Antigravity** feature (I/O 2026).

This repo is the companion project to the blog post
**["The One-Click Exporter: AI Studio → Antigravity, Probed to Its Limits"](https://dev.to/gde/the-one-click-exporter-ai-studio-antigravity-probed-to-its-limits-171e)**
— a hands-on account of exactly what transfers, what doesn't, and what breaks when you
move a real multi-agent prototype from AI Studio's web UI to a local Antigravity workspace.

> This code reflects the **post-fix, working state** — after a bug in the AI
> Studio–generated code was diagnosed and patched locally using Antigravity's agent.
> See [What Changed After Export](#what-changed-after-export) below.

---

## What it does

- **Agent 1 (Researcher):** takes a topic as input, uses grounded web search to gather
  3–5 relevant, recent sources.
- **Agent 2 (Editor):** synthesizes those findings into a short, readable digest — intro,
  bullet points, one-line takeaway.
- **Persistence:** each digest is saved to Firestore, with a history archive of past
  digests viewable in the sidebar.

## Run locally

**Prerequisites:** Node.js

```bash
npm install
```

Set `GEMINI_API_KEY` in `.env` to your Gemini API key.

```bash
npm run dev
```

Open the local URL shown in the terminal (defaults to `http://localhost:3000`).

## What changed after export

The version originally exported from AI Studio failed at runtime with:

```
{"error":{"code":400,"message":"Tool use with a response mime type: 'application/json' is unsupported","status":"INVALID_ARGUMENT"}}
```

This is a real Gemini API constraint: tool use (web search) and forced JSON-mode output
can't be combined in the same call. Agent 1's original implementation tried to do both.

**Fix, applied via Antigravity's agent panel** (not manual debugging):
- `src/gemini.ts` — Agent 1 now returns plain text findings instead of forced JSON
- `server.ts` — Agent 2 parses that plain text into the structured digest, preserving
  the original frontend response shape

Diff: 2 files changed, ~59 insertions / 53 deletions.

## Origin

Built from a single prompt in **AI Studio → Build**, requesting an explicit two-agent
sequential architecture with Firestore persistence. Exported via
**Code tab → Export → Export to Antigravity**.

## Notes on the export process

- **Secrets transferred correctly** — `GEMINI_API_KEY` arrived in `.env`, pre-populated
  and working.
- **Conversation history did not visibly transfer** — despite AI Studio's export dialog
  claiming it would, the imported project showed no conversation history in Antigravity.
- **The exported project isn't placed anywhere obvious** — it landed inside an internal
  Antigravity folder, not Downloads, with no path surfaced in the UI. Full details in the
  blog post linked above.

## License

MIT (or update as preferred).



<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>
