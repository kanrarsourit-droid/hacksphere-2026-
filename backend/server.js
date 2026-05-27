import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// AI CLIENT INITIALIZATIONS
// ----------------------------------------------------

const geminiKey = process.env.GEMINI_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

const hasOpenAI = openaiKey && 
                  openaiKey !== "YOUR_OPENAI_API_KEY_HERE" && 
                  openaiKey.trim() !== "";

let genAI = null;
let openai = null;

if (hasOpenAI) {
  console.log("⚡ OpenAI Client Enabled (ChatGPT will be used!)");
  openai = new OpenAI({ apiKey: openaiKey });
} else {
  console.log("⚡ Google Gemini Client Enabled (Gemini will be used!)");
  if (geminiKey) {
    genAI = new GoogleGenerativeAI(geminiKey);
  } else {
    console.error("FATAL ERROR: Neither GEMINI_API_KEY nor OPENAI_API_KEY is defined in backend/.env!");
    process.exit(1);
  }
}

// Helper for Gemini model fallback
const generateWithModelFallback = async (prompt, forceJson = false) => {
  const models = ["gemini-flash-latest", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-pro", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
  let lastError = null;
  for (const modelName of models) {
    try {
      const config = forceJson ? { model: modelName, generationConfig: { responseMimeType: "application/json" } } : { model: modelName };
      const model = genAI.getGenerativeModel(config);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (e) {
      console.warn(`[Backend Fallback] Model ${modelName} failed. Error details:`, e.message || e);
      lastError = e;
    }
  }
  throw lastError;
};

// ----------------------------------------------------
// 1. CHATBOT ENDPOINT
// ----------------------------------------------------
app.post("/ask-ai", async (req, res) => {
  try {
    const { chatHistory, newQuestion, subjectContext } = req.body;
    
    // --- ROUTE A: OPENAI DUAL-SUPPORT ---
    if (hasOpenAI) {
      const openAiMessages = [
        { 
          role: "system", 
          content: `You are "GPT Student Mentor", a warm, friendly, highly intelligent, and motivating study tutor.
Always start your responses in a welcoming, student-friendly tone (e.g., "Hi student! How are you doing today? Let's tackle this query together!").
Provide a brief, high-impact explanation of the core concept first. 
Always end your response by actively asking if the student wants to learn more, using exactly or similar to:
"Would you further want me to explain this in more detail, or guide you through a specific sub-topic?"`
        }
      ];

      // Convert chat history
      chatHistory.forEach(msg => {
        openAiMessages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        });
      });

      // Add new question
      openAiMessages.push({
        role: "user",
        content: newQuestion
      });

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: openAiMessages
      });

      return res.json({ answer: response.choices[0].message.content });
    }

    // --- ROUTE B: GEMINI DUAL-SUPPORT ---
    const formattedHistory = chatHistory.map(msg => {
      return `${msg.sender === 'user' ? 'Student' : 'AI Tutor'}: ${msg.text}`;
    }).join('\n');
    
    const prompt = `
      You are "Gemini Student Mentor", a warm, friendly, highly intelligent, and motivating study tutor.
      Always start your responses in a welcoming, student-friendly tone (e.g., "Hi student! How are you doing today? Let's tackle this query together!").
      
      Provide a brief, high-impact explanation of the core concept first. 
      Always end your response by actively asking if the student wants to learn more, using exactly or similar to:
      "Would you further want me to explain this in more detail, or guide you through a specific sub-topic?"
      
      Subject Context: ${subjectContext || "General"}
      
      Chat Log:
      ${formattedHistory}
      
      New Student Doubt: ${newQuestion}
      
      Response (as Gemini Student Mentor):
    `;
    
    const text = await generateWithModelFallback(prompt, false);
    res.json({ answer: text });
  } catch (error) {
    console.error("Backend Chatbot Error:", error);
    res.status(500).json({ error: error.message || "Failed to process doubt" });
  }
});

// ----------------------------------------------------
// 2. NOTE SUMMARIZER ENDPOINT
// ----------------------------------------------------
app.post("/generate-summary", async (req, res) => {
  try {
    const { fileName, subject, extractedText } = req.body;
    
    const prompt = `
      You are an expert academic research assistant. 
      Analyze the following student study material and generate a detailed academic summary:
      
      Subject: ${subject}
      Document Title: ${fileName}
      Document Text/Content: ${extractedText}
      
      Please format your response EXACTLY as a structured output with two parts:
      1. A comprehensive, beautifully formatted Markdown summary (using headers, bold terms, bullet points).
      2. A section of exactly 4-5 major "Key Takeaways" or formula sheets that are critical for exams. Separated by | character or listed as a JSON array in your prompt.
      
      Format the entire response like this:
      ---SUMMARY---
      (Place the detailed markdown summary here)
      ---TAKEAWAYS---
      * Takeaway 1
      * Takeaway 2
      * Takeaway 3
    `;
    
    // --- ROUTE A: OPENAI DUAL-SUPPORT ---
    if (hasOpenAI) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }]
      });
      return res.json({ text: response.choices[0].message.content });
    }

    // --- ROUTE B: GEMINI DUAL-SUPPORT ---
    const text = await generateWithModelFallback(prompt, false);
    res.json({ text });
  } catch (error) {
    console.error("Backend Summarizer Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate summary" });
  }
});

// ----------------------------------------------------
// 3. QUIZ GENERATOR ENDPOINT
// ----------------------------------------------------
app.post("/generate-quiz", async (req, res) => {
  try {
    const { fileName, subject, quizType, noteContent } = req.body;
    
    const prompt = `
      You are a high school and college professor. Create a study quiz based on this student note:
      
      Subject: ${subject}
      Document: ${fileName}
      Document Text: ${noteContent || "General academic overview"}
      Quiz Category Type: ${quizType} (e.g. "mcq", "true_false", or "short_answer")
      
      Generate exactly 5 questions of this type. 
      You MUST return the output in a strict JSON array format.
      
      For "mcq" type:
      [
        {
          "question": "The question content here?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "answer": "Option B",
          "explanation": "Detailed explanation of why Option B is correct."
        }
      ]
      
      For "true_false" type:
      [
        {
          "question": "Statement of facts?",
          "options": ["True", "False"],
          "answer": "True",
          "explanation": "Detailed explanation of why this statement is True."
        }
      ]
      
      For "short_answer" type:
      [
        {
          "question": "What is theory X?",
          "options": [],
          "answer": "A short answer key containing core terms that should be matched.",
          "explanation": "Grading rubric and detailed explanation of theory X."
        }
      ]
      
      Ensure questions are intellectually stimulating and match the academic level of the subject.
    `;
    
    // --- ROUTE A: OPENAI DUAL-SUPPORT ---
    if (hasOpenAI) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt + " Please output pure raw JSON only. Do not wrap in markdown tags." }]
      });
      return res.json({ jsonText: response.choices[0].message.content });
    }

    // --- ROUTE B: GEMINI DUAL-SUPPORT ---
    const jsonText = await generateWithModelFallback(prompt, true);
    res.json({ jsonText });
  } catch (error) {
    console.error("Backend Quiz Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate quiz" });
  }
});

// ----------------------------------------------------
// 4. ROADMAP GENERATOR ENDPOINT
// ----------------------------------------------------
app.post("/generate-roadmap", async (req, res) => {
  try {
    const { goal, timeAvailable } = req.body;
    
    const prompt = `
      You are a professional educational curriculum designer and career advisor.
      Generate a detailed week-by-week study roadmap based on:
      
      Goal: ${goal}
      Time Available: ${timeAvailable} (e.g., "6 months", "30 days")
      
      Provide a chronological schedule. Return the output in strict JSON format like this:
      {
        "goal": "${goal}",
        "duration": "${timeAvailable}",
        "targetAudience": "Beginner to Intermediate",
        "weeks": [
          {
            "week": "Week 1-2",
            "topic": "Fundamentals of Goal X",
            "tasks": ["Read articles on core theory", "Complete lab exercises", "Build simple practice sandbox"],
            "resources": "Google Scholar, YouTube crash resources, free coding resources"
          }
        ]
      }
      
      Limit your weekly breakdown to exactly 4-6 chronological milestone periods to keep it readable.
    `;
    
    // --- ROUTE A: OPENAI DUAL-SUPPORT ---
    if (hasOpenAI) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt + " Output pure raw JSON only. Do not wrap in markdown tags." }]
      });
      return res.json({ jsonText: response.choices[0].message.content });
    }

    // --- ROUTE B: GEMINI DUAL-SUPPORT ---
    const jsonText = await generateWithModelFallback(prompt, true);
    res.json({ jsonText });
  } catch (error) {
    console.error("Backend Roadmap Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate roadmap" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🟢 Dual-AI Proxy Server running on port ${PORT}`);
});
