/**
 * SkillSync AI - Hybrid Generative AI Service (Google Gemini + OpenAI ChatGPT)
 * 
 * This service connects to either Google Gemini or OpenAI in the cloud.
 * It features:
 * 1. Hybrid Routing: Automatically routes key starting with "sk-" to OpenAI, 
 *    and keys starting with "AIzaSy" to Google Gemini!
 * 2. Auto Model Fallback: Cycles through gemini-1.5-flash, gemini-1.5-pro, and gemini-pro 
 *    if a model is not found or restricted in your region, preventing 404 errors.
 * 3. Stateful Offline Simulator: High-fidelity study assistant for science/coding.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Helper for timing out fetch requests if the backend is stopped or sleeping
const fetchWithTimeout = async (url, options = {}, timeoutMs = 3000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5001";

// ----------------------------------------------------
// MODEL FALLBACK ENGINE (FOR GEMINI)
// ----------------------------------------------------
// Cycles through available model variations to handle regional or API-version blocks dynamically.
const generateWithModelFallback = async (apiKey, prompt, forceJson = false) => {
  const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-flash-latest"];
  const genAI = new GoogleGenerativeAI(apiKey);
  
  let lastError = null;
  for (const modelName of models) {
    try {
      const config = forceJson ? { model: modelName, generationConfig: { responseMimeType: "application/json" } } : { model: modelName };
      const model = genAI.getGenerativeModel(config);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (e) {
      console.warn(`Model ${modelName} failed or is not available. Trying next fallback... Error details:`, e);
      lastError = e;
      
      // Stop looping early if the key itself is explicitly invalid or blocked
      const msg = (e.message || String(e)).toLowerCase();
      if (msg.includes("api key not valid") || msg.includes("api_key_invalid") || msg.includes("blocked")) {
        break;
      }
    }
  }
  throw lastError;
};

// Direct client-side AI caller supporting both Google Gemini and OpenAI
const callDirectAI = async (prompt, forceJson = false) => {
  const apiKey = localStorage.getItem('skillsync_gemini_api_key') || "";
  if (!apiKey) throw new Error("No API key available");

  if (apiKey.startsWith("sk-")) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: forceJson ? { type: "json_object" } : undefined
      })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI API error ${response.status}`);
    }
    const data = await response.json();
    return data.choices[0].message.content;
  } else {
    return await generateWithModelFallback(apiKey, prompt, forceJson);
  }
};

// ==========================================
// A. AI NOTE SUMMARIZER
// ==========================================

export const generateNoteSummary = async (fileName, subject, extractedText = "") => {
  const defaultText = extractedText || `This is a study note uploaded for the subject ${subject} named "${fileName}".`;
  const apiKey = localStorage.getItem('skillsync_gemini_api_key') || "";
  
  if (apiKey) {
    try {
      const prompt = `
        You are an expert academic research assistant. 
        Analyze the following student study material and generate a detailed academic summary:
        
        Subject: ${subject}
        Document Title: ${fileName}
        Document Text/Content: ${defaultText}
        
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
      const text = await callDirectAI(prompt, false);
      return parseSummaryResponse(text);
    } catch (e) {
      console.error("Direct AI Summary Error, loading simulated response: ", e);
      return generateSimulatedSummary(fileName, subject);
    }
  }

  try {
    const response = await fetchWithTimeout(`${BACKEND_URL}/generate-summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName, subject, extractedText: defaultText })
    }, 30000);
    
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const data = await response.json();
    return parseSummaryResponse(data.text);
  } catch (error) {
    console.error("Backend Summary Error, loading simulated response: ", error);
    return generateSimulatedSummary(fileName, subject);
  }
};

const parseSummaryResponse = (text) => {
  try {
    const parts = text.split('---TAKEAWAYS---');
    let summaryPart = parts[0].replace('---SUMMARY---', '').trim();
    let takeawaysPart = parts[1] ? parts[1].trim() : '';
    
    const takeaways = takeawaysPart
      .split('\n')
      .map(line => line.replace(/^[\s-*+]+/, '').trim())
      .filter(line => line.length > 0);
      
    if (takeaways.length === 0) {
      takeaways.push("Critical definition review", "Key formula derivations", "Syllabus correlation guidelines");
    }
    
    return {
      summary: summaryPart,
      keyTakeaways: takeaways
    };
  } catch (e) {
    return {
      summary: text,
      keyTakeaways: ["Review standard workbook problems", "Key term definitions", "Core conceptual map"]
    };
  }
};

// ==========================================
// B. AI QUIZ GENERATOR
// ==========================================

export const generateQuizFromNote = async (fileName, subject, quizType, noteContent = "") => {
  const apiKey = localStorage.getItem('skillsync_gemini_api_key') || "";
  
  if (apiKey) {
    try {
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
        ${apiKey.startsWith("sk-") ? "Please output pure raw JSON only. Do not wrap in markdown tags." : ""}
      `;
      const jsonText = await callDirectAI(prompt, true);
      let cleaned = jsonText.trim();
      if (cleaned.startsWith("```json")) {
        cleaned = cleaned.substring(7);
      } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.substring(3);
      }
      if (cleaned.endsWith("```")) {
        cleaned = cleaned.substring(0, cleaned.length - 3);
      }
      return JSON.parse(cleaned.trim());
    } catch (e) {
      console.error("Direct AI Quiz Error, loading simulated quiz: ", e);
      return generateSimulatedQuiz(subject, quizType);
    }
  }

  try {
    const response = await fetchWithTimeout(`${BACKEND_URL}/generate-quiz`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName, subject, quizType, noteContent })
    }, 30000);
    
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const data = await response.json();
    return JSON.parse(data.jsonText);
  } catch (error) {
    console.error("Backend Quiz Error, loading simulated quiz: ", error);
    return generateSimulatedQuiz(subject, quizType);
  }
};

// ==========================================
// C. AI DOUBT SOLVER CHATBOT
// ==========================================

export const solveAcademicDoubt = async (chatHistory, newQuestion, subjectContext = "General") => {
  const apiKey = localStorage.getItem('skillsync_gemini_api_key') || "";
  
  if (apiKey) {
    try {
      const q = newQuestion.toLowerCase();
      const wantsLong = q.includes("detail") || q.includes("explain") || q.includes("step by step") || 
                        q.includes("in brief") || q.includes("long") || q.includes("elaborate") || 
                        q.includes("in depth") || q.includes("thoroughly") || q.includes("comprehensive") ||
                        q.includes("tell me more") || q.includes("full answer") || q.includes("complete");
      
      const formattedHistory = chatHistory.map(msg => {
        return `${msg.sender === 'user' ? 'Student' : 'AI Tutor'}: ${msg.text}`;
      }).join('\n');
      
      const isGemini = !apiKey.startsWith("sk-");
      
      const systemInstruction = isGemini 
        ? `You are "Gemini Student Mentor", a warm, friendly, highly intelligent, and motivating study tutor.
Always start your responses in a welcoming, student-friendly tone.

RESPONSE LENGTH RULES:
- For simple questions ("what is X?"), give a clear 2-3 paragraph answer.
- For ANY request containing words like "explain", "detail", "step by step", "in brief", "long answer", "elaborate", "in depth", or "comprehensive": you MUST write an EXTREMELY LONG, THOROUGH response. Minimum 800 words. Cover every angle, sub-topic, example, formula, and real-world application.
- Use rich Markdown formatting: ## headers, ### sub-headers, **bold**, numbered lists, bullet points, code blocks, and LaTeX formulas.
- NEVER say "I'll keep it brief" or "In short" when the student wants detail. ALWAYS give MORE than expected.

Always end by asking if the student wants to explore further.`
        : `You are "GPT Student Mentor", a warm, friendly, highly intelligent, and motivating study tutor.
Always start your responses in a welcoming, student-friendly tone.

RESPONSE LENGTH RULES:
- For simple questions ("what is X?"), give a clear 2-3 paragraph answer.
- For ANY request containing words like "explain", "detail", "step by step", "in brief", "long answer", "elaborate", "in depth", or "comprehensive": you MUST write an EXTREMELY LONG, THOROUGH response. Minimum 800 words. Cover every angle, sub-topic, example, formula, and real-world application.
- Use rich Markdown formatting: ## headers, ### sub-headers, **bold**, numbered lists, bullet points, code blocks, and LaTeX formulas.
- NEVER say "I'll keep it brief" or "In short" when the student wants detail. ALWAYS give MORE than expected.

Always end by asking if the student wants to explore further.`;

      const prompt = `
        ${systemInstruction}
        
        Subject Context: ${subjectContext || "General"}
        
        Chat Log:
        ${formattedHistory}
        
        New Student Doubt: ${newQuestion}${wantsLong ? '\n\n[SYSTEM OVERRIDE]: The student has explicitly requested a LONG and DETAILED response. You MUST write AT LEAST 800-1500 words. Cover every sub-topic, include real-world examples, formulas, diagrams described in text, historical context, comparisons, and step-by-step breakdowns. Use ## headers, ### sub-headers, **bold key terms**, numbered lists, and bullet points extensively. DO NOT summarize. DO NOT cut short.' : ''}
        
        Response (as ${isGemini ? 'Gemini' : 'GPT'} Student Mentor):
      `;
      
      const answer = await callDirectAI(prompt, false);
      return answer;
    } catch (e) {
      console.error("Direct AI Chatbot Error, loading simulated response: ", e);
      return simulateChatReply(chatHistory, newQuestion, subjectContext);
    }
  }

  try {
    const response = await fetchWithTimeout(`${BACKEND_URL}/ask-ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatHistory, newQuestion, subjectContext })
    }, 30000);
    
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const data = await response.json();
    return data.answer;
  } catch (error) {
    console.error("Backend Chatbot Error, loading simulated response: ", error);
    return simulateChatReply(chatHistory, newQuestion, subjectContext);
  }
};

// ==========================================
// D. AI ROADMAP GENERATOR
// ==========================================

export const generateStudyRoadmap = async (goal, timeAvailable) => {
  const apiKey = localStorage.getItem('skillsync_gemini_api_key') || "";
  
  if (apiKey) {
    try {
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
        ${apiKey.startsWith("sk-") ? "Output pure raw JSON only. Do not wrap in markdown tags." : ""}
      `;
      const jsonText = await callDirectAI(prompt, true);
      let cleaned = jsonText.trim();
      if (cleaned.startsWith("```json")) {
        cleaned = cleaned.substring(7);
      } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.substring(3);
      }
      if (cleaned.endsWith("```")) {
        cleaned = cleaned.substring(0, cleaned.length - 3);
      }
      return JSON.parse(cleaned.trim());
    } catch (e) {
      console.error("Direct AI Roadmap Error, loading simulated roadmap: ", e);
      return generateSimulatedRoadmap(goal, timeAvailable);
    }
  }

  try {
    const response = await fetchWithTimeout(`${BACKEND_URL}/generate-roadmap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal, timeAvailable })
    }, 30000);
    
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const data = await response.json();
    return JSON.parse(data.jsonText);
  } catch (error) {
    console.error("Backend Roadmap Error, loading simulated roadmap: ", error);
    return generateSimulatedRoadmap(goal, timeAvailable);
  }
};

// ==========================================
// E. LOCAL AI SIMULATION ENGINES
// ==========================================

// 1. Simulated Summarizer
const generateSimulatedSummary = (fileName, subject) => {
  return {
    summary: `### Study Review: ${fileName}\n\nThis study document provides an in-depth exploration of **${subject}** concepts. \n\n#### Core Theories Covered:\n* **Theoretical Foundation**: Examines the core tenets of ${subject}, establishing a baseline framework for advanced studies.\n* **Methodological Frameworks**: Details critical processes, active equations, and investigative procedures commonly evaluated in exams.\n* **Syllabus Integration**: Maps out how these concepts interrelate with structural textbooks and previous board/hackathon exam questions.\n\n#### Review Guidelines:\nTo maximize learning retention, students are advised to sketch visual mindmaps of these concepts, practice drawing related structures, and cross-reference these topics with their respective question pools.`,
    keyTakeaways: [
      "Master the fundamental definitions and structural relationships.",
      "Understand the logical steps involved in equations and methodologies.",
      "Practice previous exam questions related to this syllabus chunk.",
      "Relate theoretical models to practical, real-world examples."
    ]
  };
};

// 2. Simulated Quiz Generator
const generateSimulatedQuiz = (subject, quizType) => {
  if (quizType === 'true_false') {
    return [
      {
        question: `True or False: The fundamental theories of ${subject} remain completely unchanged under extreme environmental conditions.`,
        options: ["True", "False"],
        answer: "False",
        explanation: `Most foundational rules in ${subject} are models that have limitations and undergo transformations in edge-case or high-pressure environments.`
      },
      {
        question: `True or False: Quantitative data collection is the primary driver of modern advances in ${subject}.`,
        options: ["True", "False"],
        answer: "True",
        explanation: "Empirical proof and computational analysis are critical to establishing theories in modern academic studies."
      },
      {
        question: `True or False: Collaborative research plays almost no role in the development of ${subject} principles.`,
        options: ["True", "False"],
        answer: "False",
        explanation: "Almost all major academic breakthroughs are the result of cumulative, global collaborative efforts."
      },
      {
        question: `True or False: Active recall is proven to double study retention speeds.`,
        options: ["True", "False"],
        answer: "True",
        explanation: "Testing yourself (active recall) forces the brain to retrieve information, strengthening neural pathways."
      },
      {
        question: `True or False: Memorizing textbooks word-for-word is the most efficient study practice.`,
        options: ["True", "False"],
        answer: "False",
        explanation: "Conceptual mapping and active problem solving are significantly more effective than rote memorization."
      }
    ];
  }

  if (quizType === 'short_answer') {
    return [
      {
        question: `Explain the core purpose of studying ${subject} in 2 sentences.`,
        options: [],
        answer: "To understand active laws and solve complex conceptual problems.",
        explanation: `Grading Rubric: Students should identify that ${subject} builds structured frameworks to analyze, measure, and solve physical or systemic occurrences.`
      },
      {
        question: `Define what constitutes a 'valid empirical proof' in this subject area.`,
        options: [],
        answer: "Repetitive, documented observations that yield uniform results.",
        explanation: "A proof requires rigorous variables controls, clear documentation, and peer reproducibility."
      },
      {
        question: "Explain the difference between active recall and passive reading.",
        options: [],
        answer: "Active recall forces retrieval; passive reading is just looking.",
        explanation: "Active testing constructs long-term memories; passive review creates a false sense of familiarity."
      },
      {
        question: `Name one major technological breakthrough powered by discoveries in ${subject}.`,
        options: [],
        answer: "Modern computational models and automated machinery.",
        explanation: "Almost all modern automated tools rely directly on mathematical models built in this discipline."
      },
      {
        question: "What is the Pomodoro technique and why does it help focus?",
        options: [],
        answer: "25 minutes of work followed by 5 minutes of rest.",
        explanation: "By keeping working periods short and focused, it prevents cognitive fatigue and procrastination."
      }
    ];
  }

  return [
    {
      question: `Which of the following is considered a core foundational pillar of ${subject}?`,
      options: ["Theoretical Models", "Random Guessing", "Rote Memorization", "Passive Reading"],
      answer: "Theoretical Models",
      explanation: `Modern ${subject} relies heavily on establishing rigorous mathematical or scientific models to represent real occurrences.`
    }
  ];
};

// 3. Stateful simulated chat conversation solver
const simulateChatReply = (chatHistory, question, subject) => {
  const q = question.toLowerCase();
  
  // Find past bot responses to determine ongoing topic states!
  let lastTopic = "";
  for (let i = chatHistory.length - 1; i >= 0; i--) {
    const msg = chatHistory[i];
    if (msg.sender === 'ai') {
      const txt = msg.text.toLowerCase();
      if (txt.includes("photosynthesis")) {
        lastTopic = "photosynthesis";
        break;
      }
      if (txt.includes("schrödinger") || txt.includes("schrodinger")) {
        lastTopic = "schrodinger";
        break;
      }
      if (txt.includes("newton")) {
        lastTopic = "newton";
        break;
      }
    }
  }

  // --- STATE A: USER GREETINGS ---
  if (q.includes("hello") || q.includes("hi ") || q.includes("hey") || q.includes("how are you")) {
    return `Hi student! How are you doing today? 👋

I am **Gemini Student Mentor**, your dedicated study guide. How can I assist you with your academic goals today? 

Feel free to ask me about:
* **Photosynthesis** or **Schrödinger's Equation**
* Complex mathematical formulas and physics equations
* Code reviews and C, Python, or Java programming tutorials!`;
  }

  // --- STATE B: INTERACTION CONFIRMATIONS (e.g. Yes/No to expanding on topics) ---
  if (q === "yes" || q === "sure" || q.includes("explain more") || q.includes("want to know") || q.includes("yes please")) {
    if (lastTopic === "photosynthesis") {
      return `Hi student! Let's explore **Photosynthesis** in deep detail! 🌿

#### **The Chloroplast Structures & Light Harvesting:**
Photosynthesis occurs inside specialized organelles called **chloroplasts**. Within these, green chlorophyll pigments are packed inside flat disk structures called **thylakoids**. 

#### **The Complete Molecular Stages:**
* **1. Light Reactions (Thylakoids)**: Sunlight energy splits water molecules ($H_2O$), releasing Oxygen gas ($O_2$) and charging energy carrier compounds (**ATP** and **NADPH**).
* **2. The Calvin Cycle (Stroma)**: A light-independent carbon-fixation reaction. The plant uses the enzyme **RuBisCO** to capture Carbon Dioxide ($CO_2$) and utilize the energy from ATP/NADPH to assemble rich **Glucose sugars ($C_6H_{12}O_6$)**.

Would you further want me to explain this in more detail, or guide you through a specific sub-topic?`;
    }
    
    if (lastTopic === "schrodinger") {
      return `Hi student! Let's dive deeper into **Schrödinger's Equation**! 🌌

#### **Time-Dependent vs Time-Independent Equations:**
Schrödinger actually formulated two equations:

* **1. Time-Dependent**: Governs the evolution of a particle's wave function over time.
  $$i\hbar\frac{\partial}{\partial t}\Psi(\mathbf{r}, t) = \hat{H}\Psi(\mathbf{r}, t)$$
* **2. Time-Independent**: Used when the potential energy of a particle doesn't depend on time (static boundary states like electrons trapped inside atoms).
  $$\hat{H}\psi(\mathbf{r}) = E\psi(\mathbf{r})$$
  *(Here, $E$ is a constant representing the precise energy level of the particle).*

#### **The Wave Function Collapse:**
In quantum mechanics, a wave function represents a range of multiple possibilities (**superposition**). When an scientist performs a physical measurement, the wave function instantly "collapses" into a single definite point of location!

Would you further want me to explain this in more detail, or guide you through a specific sub-topic?`;
    }

    if (lastTopic === "newton") {
      return `Hi student! Let's expand on **Newton's Laws** in deep detail! 🍎

#### **Focusing on the 2nd Law ($F=ma$):**
This equation proves that Force ($F$) is the rate of change of momentum. If you apply the same force to objects with different masses, the lighter object accelerates faster.
* Force is measured in **Newtons (N)** ($1\text{ N} = 1\text{ kg}\cdot\text{m/s}^2$).

#### **Action & Reaction Deep Dive:**
Many students mistake the 3rd law. The action and reaction forces **never cancel each other out** because they act on **different objects**! For example, when a rocket launches, the engines push gas downwards (action), and the gas pushes the rocket upwards (reaction).

Would you further want me to explain this in more detail, or guide you through a specific sub-topic?`;
    }

    return `Hi student! I'm glad you're interested. Let me know what academic subject or equation you would like to explore next! Would you further want me to explain this in more detail, or guide you through a specific sub-topic?`;
  }

  if (q === "no" || q === "no thanks" || q === "stop") {
    return `No problem, student! Let me know whenever you're ready to tackle another doubt. Have a great study session! 📚`;
  }

  // --- STATE C: PHOTOSYNTHESIS (Brief vs Detailed) ---
  if (q.includes("photosynthesis") || q.includes("calvin cycle")) {
    const isBrief = q.includes("brief") || q.includes("short") || q.includes("summary") || q.includes("summarize");
    
    if (isBrief) {
      return `Hi student! How are you doing today? Let's take a quick, brief look at **Photosynthesis**! 🌿

**Photosynthesis** is the process where green plants convert sunlight, carbon dioxide, and water into chemical energy (glucose) and release oxygen as a byproduct. 

* **The Quick Formula**: $6\text{CO}_2 + 6\text{H}_2\text{O} \longrightarrow \text{C}_6\text{H}_{12}\text{O}_6 + 6\text{O}_2$
* **The Main Takeaway**: Sunlight splits water to create energy, which is used to combine carbon dioxide into glucose food.

Would you further want me to explain this in more detail, or guide you through a specific sub-topic?`;
    }

    return `Hi student! How are you doing today? Let's explain **Photosynthesis**! 🌿

**Photosynthesis** is the chemical process used by plants to convert light energy from the sun into glucose food, releasing oxygen.

#### **The Balanced Equation:**
$$6\text{CO}_2 + 6\text{H}_2\text{O} + \text{sunlight} \longrightarrow \text{C}_6\text{H}_{12}\text{O}_6 + 6\text{O}_2$$

#### **The Chemical Phases:**
* **Light-Dependent Phase**: Sunlight is absorbed by chlorophyll, splitting water to release oxygen and generating energy (ATP).
* **Calvin Cycle Phase**: The plant captures carbon dioxide and uses ATP energy to manufacture glucose.

*Do you want to know about the enzymes involved (like RuBisCO) and the chloroplast structure?*
Would you further want me to explain this in more detail, or guide you through a specific sub-topic?`;
  }

  // --- STATE D: SCHRÖDINGER'S EQUATION (Brief vs Detailed) ---
  if (q.includes("schrodinger") || q.includes("schrödinger")) {
    const isBrief = q.includes("brief") || q.includes("short") || q.includes("summary") || q.includes("summarize");
    
    if (isBrief) {
      return `Hi student! How are you doing today? Let's look at **Schrödinger's Equation** in brief! 🌌

The **Schrödinger Equation** is the fundamental equation of quantum mechanics. It calculates how wave-like quantum particles (like electrons) behave over time:

#### **i ℏ (∂/∂t) Ψ = Ĥ Ψ**

Instead of predicting an exact path, it calculates a **probability wave** that describes the statistical likelihood of where a particle exists upon measurement.

Would you further want me to explain this in more detail, or guide you through a specific sub-topic?`;
    }

    return `Hi student! How are you doing today? Let's look at **Schrödinger's Equation**! 🌌

The **Schrödinger Equation** describes how the quantum state of a subatomic particle (like an electron) evolves over time:

#### **i ℏ (∂/∂t) Ψ(r, t) = Ĥ Ψ(r, t)**

#### **Term Guide:**
* **Ψ** (Wave Function): Calculates the wave of probability.
* **Ĥ** (Hamiltonian): The total energy operator (kinetic + potential).
* **ℏ** (hbar): The reduced Planck's constant.

*Do you want to know about the differences between the Time-Dependent and Time-Independent equations?*
Would you further want me to explain this in more detail, or guide you through a specific sub-topic?`;
  }

  // --- STATE E: NEWTON'S LAWS (Brief vs Detailed) ---
  if (q.includes("newton") || q.includes("force = mass") || q.includes("f = ma")) {
    const isBrief = q.includes("brief") || q.includes("short") || q.includes("summary") || q.includes("summarize");
    
    if (isBrief) {
      return `Hi student! How are you doing today? Let's review **Newton's Laws** in brief! 🍎

* **1st Law**: An object stays at rest or in constant motion unless pushed (Inertia).
* **2nd Law ($F=ma$)**: Force equals Mass multiplied by Acceleration.
* **3rd Law**: Every action has an equal and opposite reaction force.

Would you further want me to explain this in more detail, or guide you through a specific sub-topic?`;
    }

    return `Hi student! How are you doing today? Let's explore **Newton's Laws of Motion**! 🍎

Formulated in 1687, Sir Isaac Newton's three laws describe classical physical dynamics:

* **1. Inertia**: Objects resist changes in their movement state.
* **2. Dynamics ($F=ma$)**: Acceleration of mass requires net proportional force.
* **3. Forces Interaction**: Every action force triggers an equal and opposite reaction force.

*Do you want to know how force is measured in Newtons and see a practice calculation?*
Would you further want me to explain this in more detail, or guide you through a specific sub-topic?`;
  }

  // --- STATE F: PROGRAMMING & CODE GENERATOR (C, Python, Java, JS, C++) ---
  if (q.includes("code") || q.includes("program") || q.includes("function") || q.includes("write a") || q.includes("print a") || q.includes("javascript") || q.includes("python") || q.includes("java") || q.includes("c++") || q.includes("c ") || q.includes("develop") || q.includes("fibonacci")) {
    
    // Determine language
    let lang = "javascript";
    let langDisplay = "JavaScript";
    const isC = /\bc\b/i.test(q) || q.includes("c program") || q.includes("program in c") || q.includes("c code") || q.includes("c-program") || q.includes("language c");
    const isCpp = q.includes("c++") || q.includes("cpp");
    const isPython = q.includes("python") || q.includes("py ");
    const isJava = q.includes("java") && !q.includes("javascript");
    
    if (isPython) { lang = "python"; langDisplay = "Python"; }
    else if (isCpp) { lang = "cpp"; langDisplay = "C++"; }
    else if (isJava) { lang = "java"; langDisplay = "Java"; }
    else if (isC) { lang = "c"; langDisplay = "C Programming"; }
    else if (q.includes("html")) { lang = "html"; langDisplay = "HTML"; }
    else if (q.includes("css")) { lang = "css"; langDisplay = "CSS"; }
    else if (q.includes("sql")) { lang = "sql"; langDisplay = "SQL"; }

    // Check for specific algorithms: FIBONACCI
    if (q.includes("fibonacci")) {
      if (lang === "c") {
        return `Hi student! How are you doing today? Let's write a **C Program to print the Fibonacci Series**! 💻

Here is the clean, standard C code to print the Fibonacci series up to a specified number of terms ($n$):

\`\`\`c
#include <stdio.h>

int main() {
    int i, n = 10;
    int t1 = 0, t2 = 1;
    int nextTerm = t1 + t2;

    printf("Fibonacci Series up to %d terms:\\n", n);
    
    // Print the first two terms
    printf("%d, %d, ", t1, t2);

    // Calculate and print the remaining terms
    for (i = 3; i <= n; ++i) {
        printf("%d, ", nextTerm);
        t1 = t2;
        t2 = nextTerm;
        nextTerm = t1 + t2;
    }
    printf("\\n");

    return 0;
}
\`\`\`

#### **How it works:**
1. **Initialization**: We start with the first two terms of the series, **0** and **1**.
2. **Loop Iteration**: The \`for\` loop calculates the \`nextTerm\` by summing the previous two terms (\`t1 + t2\`).
3. **Variable Update**: We then shift the variables: \`t1\` becomes \`t2\`, and \`t2\` becomes the newly calculated \`nextTerm\` for the next loop run.

Would you further want me to explain this in more detail, or guide you through a specific sub-topic?`;
      }

      if (lang === "python") {
        return `Hi student! How are you doing today? Let's write a **Python Program to print the Fibonacci Series**! 💻

Here is the highly pythonic way to generate the Fibonacci series up to $n$ terms:

\`\`\`python
def fibonacci_series(n):
    t1, t2 = 0, 1
    series = []
    
    for _ in range(n):
        series.append(t1)
        # Swap values efficiently in a single line
        t1, t2 = t2, t1 + t2
        
    return series

# Generate and print first 10 terms
terms = 10
print(f"Fibonacci Series up to {terms} terms:")
print(fibonacci_series(terms))
\`\`\`

Would you further want me to explain this in more detail, or guide you through a specific sub-topic?`;
      }

      if (lang === "cpp") {
        return `Hi student! How are you doing today? Let's write a **C++ Program to print the Fibonacci Series**! 💻

\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    int n = 10;
    int t1 = 0, t2 = 1, nextTerm = 0;

    cout << "Fibonacci Series: ";

    for (int i = 1; i <= n; ++i) {
        // Print the active term
        cout << t1 << ", ";
        nextTerm = t1 + t2;
        t1 = t2;
        t2 = nextTerm;
    }
    cout << endl;
    return 0;
}
\`\`\`

Would you further want me to explain this in more detail, or guide you through a specific sub-topic?`;
      }

      if (lang === "java") {
        return `Hi student! How are you doing today? Let's write a **Java Program to print the Fibonacci Series**! 💻

Here is the robust, standard object-oriented Java code:

\`\`\`java
public class Fibonacci {
    public static void main(String[] args) {
        int n = 10, t1 = 0, t2 = 1;
        System.out.print("Fibonacci Series of " + n + " terms: ");

        for (int i = 1; i <= n; ++i) {
            System.out.print(t1 + ", ");

            int sum = t1 + t2;
            t1 = t2;
            t2 = sum;
        }
        System.out.println();
    }
}
\`\`\`

#### **Key Java OOP Concepts:**
1. **Class Definition**: Everything in Java must be defined inside a class, in this case named \`Fibonacci\`.
2. **Main Method**: The entry point where execution begins: \`public static void main(String[] args)\`.
3. **Loop Control**: A standard \`for\` loop controls the sequence summation.

Would you further want me to explain this in more detail, or guide you through a specific sub-topic?`;
      }

      return `Hi student! How are you doing today? Let's write a **JavaScript function to print the Fibonacci Series**! 💻

Here is the clean JS recursive and iterative approach:

\`\`\`javascript
function getFibonacciSeries(terms) {
  let t1 = 0, t2 = 1, nextTerm;
  let result = [];

  for (let i = 0; i < terms; i++) {
    result.push(t1);
    nextTerm = t1 + t2;
    t1 = t2;
    t2 = nextTerm;
  }
  return result;
}

// Example call
console.log(getFibonacciSeries(10)); // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
\`\`\`

Would you further want me to explain this in more detail, or guide you through a specific sub-topic?`;
    }

    return `Hi student! How are you doing? Let's tackle your coding query in **${langDisplay}**! 💻

Here is a clean, structured example showing best-practices in **${langDisplay}**:

${lang === 'cpp' ? `\`\`\`cpp
#include <iostream>

void greetStudent() {
    std::cout << "Hi student! Keep coding!" << std::endl;
}

int main() {
    greetStudent();
    return 0;
}
\`\`\`` : lang === 'c' ? `\`\`\`c
#include <stdio.h>

void greetStudent() {
    printf("Hi student! Keep coding!\\n");
}

int main() {
    greetStudent();
    return 0;
}
\`\`\`` : lang === 'python' ? `\`\`\`python
def greet_student():
    print("Hi student! Keep coding!")

greet_student()
\`\`\`` : lang === 'java' ? `\`\`\`java
public class Main {
    public static void greetStudent() {
        System.out.println("Hi student! Keep coding!");
    }

    public static void main(String[] args) {
        greetStudent();
    }
}
\`\`\`` : lang === 'html' ? `\`\`\`html
<div class="card bg-zinc-900 border border-purple-500/25 p-6 rounded-xl">
  <h3 class="text-white text-lg font-bold">Hi Student!</h3>
  <p class="text-slate-300">Keep up the great study work!</p>
</div>
\`\`\`` : `\`\`\`javascript
// Dynamic greeting function
const greetStudent = () => {
  console.log("Hi student! Keep coding!");
};

greetStudent();
\`\`\``}

Would you further want me to explain this in more detail, or guide you through a specific sub-topic?`;
  }

  // --- STATE G: STUDY ADVICE ---
  if (q.includes("study") || q.includes("exam") || q.includes("learn") || q.includes("focus")) {
    return `Hi student! How are you doing today? Let's look at a brief study trick! 🧠

Try using the **Feynman Technique**: Explain your doubt out loud as if you were teaching it to a **10-year-old child**. If you hit a gap or stutter, you know exactly which textbook pages to review!

Would you further want me to explain this in more detail, or guide you through a specific sub-topic?`;
  }

  // DEFAULT RESOLUTION
  // Extract clean topic name
  // Remove questions phrases to get the core noun (e.g. "what is javascript in brief" -> "Javascript")
  let topicNoun = question
    .replace(/what is/i, "")
    .replace(/explain/i, "")
    .replace(/in brief/i, "")
    .replace(/in short/i, "")
    .replace(/briefly/i, "")
    .replace(/summary of/i, "")
    .replace(/[?.]/g, "")
    .trim();
    
  if (!topicNoun) topicNoun = "this concept";
  const capitalizedTopic = topicNoun.charAt(0).toUpperCase() + topicNoun.slice(1);

  const isBrief = q.includes("brief") || q.includes("short") || q.includes("summary") || q.includes("summarize");

  if (isBrief) {
    return `Hi student! How are you doing today? Let's take a comprehensive, high-density look at **"${capitalizedTopic}"**! 💡

#### **1. Fundamental Academic Overview:**
**${capitalizedTopic}** represents one of the most critical structural pillars in modern academic curricula. At its core molecular and systemic level, it functions as a highly sophisticated, unified operational framework designed to streamline multidimensional processes, standardize complex variables, and optimize resource distribution. By establishing standardized baseline criteria, it allows scientists, researchers, and professional developers to model extreme real-world conditions, construct highly predictable simulations, and eliminate structural inefficiencies that commonly compromise large-scale scientific systems.

#### **2. Analytical Depth & Structural Mechanics:**
When analyzing the core dynamics of **${capitalizedTopic}**, it becomes evident that its operational success relies on the tight integration of empirical metrics and automated control feedback loops. The system dynamically measures inputs, applies mathematical boundaries to minimize error margins, and translates quantitative data into highly readable dashboards. Because of this high-density processing capability, modern academic institutions and commercial enterprises prioritize mastering **${capitalizedTopic}** to ensure their computational models remain resilient under immense query loads, strict compliance audits, and advanced developmental challenges.

#### **3. Advanced Research & Best Practices:**
To master this discipline effectively, students are strongly encouraged to go beyond basic definitions. Start by mapping out a complete hierarchical dependency graph connecting **${capitalizedTopic}** to related structural algorithms, schedule dedicated active-recall testing sessions to lock the concepts into long-term memory, and build simple computational sandboxes to experiment with boundary constraints. This deep-dive study methodology guarantees you will not only pass your exams with distinction but also acquire practical, ready-to-deploy architectural expertise for your professional career.

Would you further want me to explain this in more detail, or guide you through a specific sub-topic?`;
  }

  return `Hi student! How are you doing today? Let's talk about **"${capitalizedTopic}"**! 💡

Here is a high-level academic overview of this concept to help you study:

#### **1. Core Concept & Definition:**
**${capitalizedTopic}** is a fundamental pillar within this subject area. It represents a key concept that is widely utilized by academics, researchers, and professional developers to build structured, efficient, and robust systems.

#### **2. Real-World Applications & Importance:**
* **Efficiency & Standardisation**: Helps professionals maximize productivity by offering standard design principles and structuring complex data.
* **Scale & Security**: Engineered to support high volumes of concurrent usage, transactions, or computations safely.
* **Modern Integration**: Seamlessly interfaces with state-of-the-art analysis dashboards and quantitative research methodologies.

#### **3. Step-by-Step Study Guide:**
* **Analyze**: Identify the primary definitions and how **${capitalizedTopic}** interfaces with the rest of your course curriculum.
* **Recall & Practice**: Sketch out a conceptual mind-map from memory, or set up a simple digital sandbox to test related terms.

Would you further want me to explain this in more detail, or guide you through a specific sub-topic?`;
};

// 4. Simulated Roadmap Generator
const generateSimulatedRoadmap = (goal, duration) => {
  return {
    goal,
    duration,
    targetAudience: "Beginner to Advanced Hackathon Competitor",
    weeks: [
      {
        week: "Milestone 1 (Start)",
        topic: `Foundations and Fundamentals of ${goal}`,
        tasks: [
          `Read high-level overviews of ${goal} methodologies.`,
          "Set up your local developer sandbox or study binder.",
          "Identify the top 3 core books or free crash courses."
        ],
        resources: "MDN Web Docs, freeCodeCamp, YouTube Crash Courses"
      },
      {
        week: "Milestone 2",
        topic: "Core Skills Drills and Active Recalls",
        tasks: [
          "Practice medium-difficulty exercises daily.",
          "Test your knowledge using SkillSync AI chatbot.",
          "Re-sketch conceptual layouts from memory."
        ],
        resources: "LeetCode, W3Schools, Subject Specific Exam archives"
      },
      {
        week: "Milestone 3",
        topic: "Intermediate Milestones and Small Projects",
        tasks: [
          "Construct small end-to-end sandbox programs or write detailed review assays.",
          "Learn to debug your own errors step-by-step.",
          "Focus heavily on time-restricted practice exams."
        ],
        resources: "GitHub repos, Stack Overflow, SkillSync mock exams"
      },
      {
        week: "Milestone 4 (Wrap-up)",
        topic: "Capstone Masterclass and Final Reviews",
        tasks: [
          `Build a complex capstone project compiling all aspects of ${goal}.`,
          "Simulate a real-time board exam or final project presentation.",
          "Optimize your workflow for speed and clarity."
        ],
        resources: "Official documentation, peer-review circles"
      }
    ]
  };
};
