# 🧠 AI Investment Memo Analyzer

Streamline due diligence with an AI-powered analyzer that reads, interprets, and scores investment memos, pitch decks, and long-form documents using state-of-the-art Large Language Models (LLMs).  
This full-stack platform delivers structured insights, consistent scoring, and enterprise-grade security for handling sensitive financial documents.

![Project Preview](https://raw.githubusercontent.com/abhi5hek001/AI-Memo-Analyser/main/ai-memo-analyser.png)

---

## ✨ Key Features

### 🔄 Multi-Model Support
Choose your preferred LLM for analysis:
- **Google Gemini** (default)
- **Anthropic Claude**
- **OpenAI GPT**

### 🏗 Structured JSON Output
Every analysis returns a consistent, machine-readable schema including:
- Opportunity Score  
- Risk Score  
- Key Strengths  
- Identified Weaknesses  
- Due Diligence Red Flags  
- Core Competitive Position

---

## 🏛 Architecture Overview

```
Frontend (React + Vite)
          ⬇
Backend Proxy (Node + Express)
          ⬇
AI Providers (Gemini / Claude / OpenAI)
```

---

## 💡 How the Analysis Pipeline Works

### **1. Frontend — `Analyser.jsx`**
- User uploads a memo  
- Chooses model  
- Frontend constructs strict JSON-extraction prompt  
- Sends POST → `http://localhost:3001/api/analyze`

---

### **2. Backend Proxy — `server.js`**

#### 🔑 Key Handling
Loads:
```
ANTHROPIC_API_KEY
OPENAI_API_KEY
GEMINI_API_KEY
```

#### 🔧 Model Routing
Initializes appropriate AI client based on `model_choice`.

#### 🧽 JSON Enforcement
- Gemini → `responseMimeType: "application/json"`  
- GPT → `response_format: { type: "json_object" }`  
- Claude → Strict JSON prompting  
- Output sanitized by `extractAndCleanJson()`

---

### **3. LLM Cognitive Workflow**

#### 🧠 Deep Reading
Understands:
- Company  
- Market  
- Team  
- Product  
- Financials  

#### 🧩 Structured Extraction
Maps content to predefined JSON fields.

#### 🎯 Risk/Opportunity Scoring
Acts as an *investment analyst*, producing:
- Opportunity score  
- Risk score  
- Strengths & weaknesses  
- Moat & competitive position  
- Red flags  

#### 🧾 Final Output
Always a clean JSON object.

---

### **4. Frontend Rendering**
Displays:
- Scores  
- Strengths & weaknesses  
- Diligence checklist  
- Summary fields  

---

## 🧪 Example Output

```json
{
  "companySummary": "...",
  "opportunityScore": 72,
  "riskScore": 38,
  "keyStrengths": [],
  "keyRisks": [],
  "diligenceChecklist": [],
  "competitivePosition": "..."
}
```
