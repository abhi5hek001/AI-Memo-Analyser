// ai-memo-analyser/backend/server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');
const { GoogleGenAI } = require('@google/genai'); // <-- 1. Import Gemini SDK

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, 
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const gemini = new GoogleGenAI({ // <-- 3. Initialize Gemini client
    apiKey: process.env.GEMINI_API_KEY,
});

// Helper function to extract and clean the JSON from model response
const extractAndCleanJson = (text) => {
    // LLMs often wrap JSON in markdown fences, so we remove them
    const match = text.match(/```json\s*([\s\S]*?)\s*```/);
    const cleanJson = match ? match[1].trim() : text.trim();
    return JSON.parse(cleanJson);
};


app.post('/api/analyze', async (req, res) => {
  try {
    // 3. Receive model_choice from frontend
    const { text, model_choice } = req.body; 
    let rawTextContent = '';

    const systemPrompt = "You are an expert investment analyst. Analyze this investment memo/pitch deck and provide a structured assessment in JSON format. Return ONLY valid JSON (no markdown, no preamble) that adheres strictly to the provided structure. Document text:";
    const userMessage = `${text}`; // The full prompt including the JSON structure request

    if (model_choice === 'claude') {
      if (!process.env.ANTHROPIC_API_KEY) {
         throw new Error("ANTHROPIC_API_KEY environment variable is not set.");
      }
      
      const message = await anthropic.messages.create({
        model: "claude-3.5-sonnet", // Using a modern Claude model
        max_tokens: 4000,
        messages: [{
            role: "user",
            content: userMessage
        }]
      });
      
      // Anthropic returns content in an array
      rawTextContent = message.content
        .filter(item => item.type === "text")
        .map(item => item.text)
        .join("\n");
        
    } else if (model_choice === 'openai') {
      // OpenAI API Call Logic
      if (!process.env.OPENAI_API_KEY) {
         throw new Error("OPENAI_API_KEY environment variable is not set.");
      }
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // Using a capable GPT model
        response_format: { type: "json_object" }, // Request JSON output natively
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        max_tokens: 4000,
      });

      // OpenAI returns content in a string when json_object is used
      rawTextContent = completion.choices[0].message.content;
      
    } else if (model_choice === 'gemini') { // <-- 4. ADD GEMINI LOGIC
        if (!process.env.GEMINI_API_KEY) {
           throw new Error("GEMINI_API_KEY environment variable is not set.");
        }

        const response = await gemini.models.generateContent({
            model: "gemini-2.5-pro", // Using Gemini Pro
            contents: [{ role: "user", parts: [{ text: userMessage }] }],
            config: {
                responseMimeType: "application/json",
                systemInstruction: systemPrompt
            }
        });
        
        // Gemini's response.text is a clean JSON string when responseMimeType is used
        rawTextContent = response.text;
    } else {
      return res.status(400).json({ error: "Invalid or missing model choice." });
    }

    // Attempt to parse the content
    const analysisResult = extractAndCleanJson(rawTextContent);

    // Send the final parsed JSON structure back to the client
    res.json(analysisResult);

  } catch (error) {
    // Handle specific API errors
    if (error.status === 401 && error.message.includes('Incorrect API key')) {
      return res.status(401).json({ error: "OpenAI: Incorrect API key provided." });
    }
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => console.log('Server running on port 3001'));