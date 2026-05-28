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

    // Detect if the student wants a long/detailed answer
    const q = newQuestion.toLowerCase();
    const wantsLong = q.includes("detail") || q.includes("explain") || q.includes("step by step") || 
                      q.includes("in brief") || q.includes("long") || q.includes("elaborate") || 
                      q.includes("in depth") || q.includes("thoroughly") || q.includes("comprehensive") ||
                      q.includes("tell me more") || q.includes("full answer") || q.includes("complete");
    
    const lengthInstruction = wantsLong 
      ? `\n\n[SYSTEM OVERRIDE]: The student has explicitly requested a LONG and DETAILED response. You MUST write AT LEAST 800-1500 words. Cover every sub-topic, include real-world examples, formulas, diagrams described in text, historical context, comparisons, and step-by-step breakdowns. Use ## headers, ### sub-headers, **bold key terms**, numbered lists, and bullet points extensively. DO NOT summarize. DO NOT cut short. Fill your entire response with rich, educational, valuable content.`
      : '';
    
    let answer = null;
    let fallbackToGemini = false;

    // --- ROUTE A: OPENAI DUAL-SUPPORT ---
    if (hasOpenAI) {
      try {
        const openAiMessages = [
          { 
            role: "system", 
            content: `You are "GPT Student Mentor", a warm, friendly, highly intelligent, and motivating study tutor.
Always start your responses in a welcoming, student-friendly tone.

RESPONSE LENGTH RULES:
- For simple questions ("what is X?"), give a clear 2-3 paragraph answer.
- For ANY request containing words like "explain", "detail", "step by step", "in brief", "long answer", "elaborate", "in depth", or "comprehensive": you MUST write an EXTREMELY LONG, THOROUGH response. Minimum 800 words. Cover every angle, sub-topic, example, formula, and real-world application.
- Use rich Markdown formatting: ## headers, ### sub-headers, **bold**, numbered lists, bullet points, code blocks, and LaTeX formulas.
- NEVER say "I'll keep it brief" or "In short" when the student wants detail. ALWAYS give MORE than expected.

Always end by asking if the student wants to explore further.`
          }
        ];

        // Convert chat history
        chatHistory.forEach(msg => {
          openAiMessages.push({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          });
        });

        // Add new question with length reinforcement
        openAiMessages.push({
          role: "user",
          content: newQuestion + lengthInstruction
        });

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          max_tokens: 16384,
          messages: openAiMessages
        });

        answer = response.choices[0].message.content;
      } catch (err) {
        console.warn("⚠️ OpenAI API Call Failed (e.g. out of credits). Falling back to Google Gemini... Error:", err.message || err);
        fallbackToGemini = true;
      }
    }

    // --- ROUTE B: GEMINI DUAL-SUPPORT / FALLBACK ---
    if (!answer || fallbackToGemini) {
      if (!geminiKey) {
        throw new Error("OpenAI call failed and no Gemini API Key is configured in backend/.env!");
      }
      
      if (!genAI) {
        genAI = new GoogleGenerativeAI(geminiKey);
      }

      const formattedHistory = chatHistory.map(msg => {
        return `${msg.sender === 'user' ? 'Student' : 'AI Tutor'}: ${msg.text}`;
      }).join('\n');
      
      const prompt = `
        You are "Gemini Student Mentor", a warm, friendly, highly intelligent, and motivating study tutor.
        Always start your responses in a welcoming, student-friendly tone.
        
        RESPONSE LENGTH RULES:
        - For simple questions ("what is X?"), give a clear 2-3 paragraph answer.
        - For ANY request containing words like "explain", "detail", "step by step", "in brief", "long answer", "elaborate", "in depth", or "comprehensive": you MUST write an EXTREMELY LONG, THOROUGH response. Minimum 800 words. Cover every angle, sub-topic, example, formula, and real-world application.
        - Use rich Markdown formatting: ## headers, ### sub-headers, **bold**, numbered lists, bullet points, code blocks, and LaTeX formulas.
        - NEVER say "I'll keep it brief" or "In short" when the student wants detail. ALWAYS give MORE than expected.
        
        Always end by asking if the student wants to explore further.
        
        Subject Context: ${subjectContext || "General"}
        
        Chat Log:
        ${formattedHistory}
        
        New Student Doubt: ${newQuestion}${wantsLong ? '\n\n[SYSTEM OVERRIDE]: The student has explicitly requested a LONG and DETAILED response. You MUST write AT LEAST 800-1500 words. Cover every sub-topic, include real-world examples, formulas, diagrams described in text, historical context, comparisons, and step-by-step breakdowns. Use ## headers, ### sub-headers, **bold key terms**, numbered lists, and bullet points extensively. DO NOT summarize. DO NOT cut short.' : ''}
        
        Response (as Gemini Student Mentor):
      `;
      
      answer = await generateWithModelFallback(prompt, false);
    }

    res.json({ answer });
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
