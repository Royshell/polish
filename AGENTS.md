---
# 🤖 `AGENTS.md`

# Agents in Polish ✦

Polish uses a lightweight AI-assisted styling system to generate CSS based on natural language prompts.
---

## 🎯 Purpose of Agents

The AI agent in Polish is responsible for:

- Translating natural language → CSS
- Generating safe, non-destructive styles
- Enhancing user creativity without requiring CSS knowledge

---

## ⚙️ Architecture

- The extension sends a prompt to an external API:
  - `POST /api/generate`
- The API (polish-api) communicates with Groq
- The response is pure CSS
- The extension injects the CSS into the active page

---

## 🧠 Agent Behavior Guidelines

The agent should:

- Prefer **non-breaking styles**
- Avoid:
  - `display: none`
  - layout-breaking positioning
- Focus on:
  - colors
  - typography
  - spacing
  - subtle effects

---

## ✨ Good Prompts

- "dark mode with purple accents"
- "minimal clean blog style"
- "cyberpunk neon glow"

---

## ⚠️ Bad / Risky Prompts

- "hide everything except images"
- "restructure layout completely"
- "turn this into a grid layout"

These may break websites and should be handled carefully.

---

## 🛡️ Safety Constraints

- CSS should be scoped when possible
- Avoid overriding critical layout elements
- Keep styles reversible (important for UX)

---

## 🔄 Future Ideas

- Prompt templates
- Style validation layer
- Diff-based preview before applying
- Multi-step refinement ("make it softer", "more contrast")

---

## 🤝 Human + AI Philosophy

Polish is not meant to replace design skills —  
it augments them.

The user remains in control, the agent suggests and accelerates.

---

## 📌 Summary

- AI generates CSS
- Extension applies it instantly
- UX must stay fast, safe, and reversible

This balance is the core of Polish✦
