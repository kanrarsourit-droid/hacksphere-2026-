/**
 * SkillSync AI - Google Gemini Generative AI Service
 * 
 * This service connects to the Google Gemini API (gemini-1.5-flash) in the cloud.
 * It is fully commented and features:
 * 1. Live Gemini Mode: Connects to your active API key and generates real-time results.
 * 2. Intelligent Simulation Fallback: Generates high-fidelity educational responses locally 
 *    in case of API key issues or offline environments.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini AI SDK
const initGemini = () => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE" || apiKey.includes("PLACEHOLDER")) {
      console.warn("Gemini API key is using placeholder. Defaulting to Local AI Simulator.");
      return null;
    }
    return new GoogleGenerativeAI(apiKey);
  } catch (e) {
    console.error("Failed to initialize Gemini AI client:", e);
    return null;
  }
};

const genAI = initGemini();

// ==========================================
// A. AI NOTE SUMMARIZER
// ==========================================

/**
 * Generates an academic summary and key takeaways from uploaded notes
 */
export const generateNoteSummary = async (fileName, subject, extractedText = "") => {
  const defaultText = extractedText || `This is a study note uploaded for the subject ${subject} named "${fileName}".`;
  
  if (genAI) {
    try {
      // Use gemini-1.5-flash for fast and cost-effective text generation
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
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
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return parseSummaryResponse(text);
    } catch (error) {
      console.error("Gemini Summary Error, loading simulated response: ", error);
      return generateSimulatedSummary(fileName, subject);
    }
  } else {
    return generateSimulatedSummary(fileName, subject);
  }
};

// Parser for Gemini's summary output
const parseSummaryResponse = (text) => {
  try {
    const parts = text.split('---TAKEAWAYS---');
    let summaryPart = parts[0].replace('---SUMMARY---', '').trim();
    let takeawaysPart = parts[1] ? parts[1].trim() : '';
    
    // Parse takeaways list
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

/**
 * Generates an interactive test containing MCQs, True/False, and Short questions
 */
export const generateQuizFromNote = async (fileName, subject, quizType, noteContent = "") => {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        // Force output to be structured JSON
        generationConfig: { responseMimeType: "application/json" }
      });
      
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
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const jsonText = response.text();
      
      const parsedQuestions = JSON.parse(jsonText);
      return parsedQuestions;
    } catch (error) {
      console.error("Gemini Quiz Error, loading simulated quiz: ", error);
      return generateSimulatedQuiz(subject, quizType);
    }
  } else {
    return generateSimulatedQuiz(subject, quizType);
  }
};

// ==========================================
// C. AI DOUBT SOLVER CHATBOT
// ==========================================

/**
 * Responds to student doubt-solving prompt based on chat history
 */
export const solveAcademicDoubt = async (chatHistory, newQuestion, subjectContext = "General") => {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Format chat history into a readable chat log for Gemini
      const formattedHistory = chatHistory.map(msg => {
        return `${msg.sender === 'user' ? 'Student' : 'AI Tutor'}: ${msg.text}`;
      }).join('\n');
      
      const prompt = `
        You are "SkillSync AI Mentor", a friendly, highly intelligent, and motivating study tutor.
        Help the student solve their doubts. Ensure your answers are clear, correct, and structured with Markdown. 
        If they ask for code, provide clean code blocks with comments. If they ask for math, explain step-by-step.
        
        Subject Context: ${subjectContext}
        
        Chat Log:
        ${formattedHistory}
        
        New Student Doubt: ${newQuestion}
        
        Response (as AI Tutor):
      `;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini Chat Error: ", error);
      return simulateChatReply(newQuestion, subjectContext);
    }
  } else {
    return simulateChatReply(newQuestion, subjectContext);
  }
};

// ==========================================
// D. AI ROADMAP GENERATOR
// ==========================================

/**
 * Generates a complete learning curriculum based on a career/academic goal
 */
export const generateStudyRoadmap = async (goal, timeAvailable) => {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });
      
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
              "resources": "Google Scholar, YouTube crash courses, free coding resources"
            }
          ]
        }
        
        Limit your weekly breakdown to exactly 4-6 chronological milestone periods to keep it readable.
      `;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const jsonText = response.text();
      
      return JSON.parse(jsonText);
    } catch (error) {
      console.error("Gemini Roadmap Error: ", error);
      return generateSimulatedRoadmap(goal, timeAvailable);
    }
  } else {
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

  // DEFAULT MCQ
  return [
    {
      question: `Which of the following is considered a core foundational pillar of ${subject}?`,
      options: ["Theoretical Models", "Random Guessing", "Rote Memorization", "Passive Reading"],
      answer: "Theoretical Models",
      explanation: `Modern ${subject} relies heavily on establishing rigorous mathematical or scientific models to represent real occurrences.`
    },
    {
      question: "What is the most effective method to prepare for high-stakes examinations?",
      options: ["Reading notes repeatedly", "Highlighting full chapters", "Taking practice quizzes & spacing reviews", "Cramming the night before"],
      answer: "Taking practice quizzes & spacing reviews",
      explanation: "Practice testing and spaced repetition are clinically proven to be the most powerful methods for long-term memory retrieval."
    },
    {
      question: `How do practitioners of ${subject} validate a newly proposed scientific hypothesis?`,
      options: ["By posting on social media", "Through empirical peer-reviewed testing", "By writing a long essay", "By trusting intuition"],
      answer: "Through empirical peer-reviewed testing",
      explanation: "Peer review and empirical replication are the gold standards of scientific validity in academics."
    },
    {
      question: "What does the 'spacing effect' refer to in cognitive psychology?",
      options: ["Staring into space while studying", "Spreading study sessions out over time", "Putting spaces between paragraphs", "Studying in a quiet open room"],
      answer: "Spreading study sessions out over time",
      explanation: "Spreading reviews over several days allows the brain to forget slightly and reconstruct the memory, making it much stronger."
    },
    {
      question: `What is the ultimate goal of implementing AI-driven tutors like SkillSync in ${subject} studies?`,
      options: ["To replace human teachers", "To write essays for students", "To customize the learning path and explain doubts instantly", "To automate grading solely"],
      answer: "To customize the learning path and explain doubts instantly",
      explanation: "SkillSync AI aims to provide personalized guidance, resolving doubts at the student's own speed, 24/7."
    }
  ];
};

// 3. Simulated Chat Responder
const simulateChatReply = (question, subject) => {
  const q = question.toLowerCase();
  
  if (q.includes("hello") || q.includes("hi ") || q.includes("hey")) {
    return `### Hello! Welcome to SkillSync AI doubt solver! 👋\n\nI am your dedicated **${subject} Study Mentor**. How can I assist you in your learning journey today?\n\nYou can ask me: \n* Complex subject equations or theories.\n* Code debugging or structural programming inquiries.\n* High-efficiency revision strategies!`;
  }
  
  if (q.includes("code") || q.includes("program") || q.includes("react") || q.includes("function") || q.includes("javascript")) {
    return `### 💻 SkillSync AI Coding Assistant\n\nHere is a clean explanation and code structure to help you solve your coding doubt!\n\n#### Core Concept:\nIn modern programming (like React or JavaScript), we utilize **functional components** and **state management hooks** to construct interactive systems.\n\nHere is a clean React counter code example showcasing efficient state updates:\n\n\`\`\`javascript\nimport React, { useState } from 'react';\n\nfunction ElegantCounter() {\n  // 1. Declare a state variable called 'count'\n  const [count, setCount] = useState(0);\n\n  return (\n    <div className="p-6 bg-zinc-900 border border-purple-500/20 rounded-xl">\n      <p className="text-white text-lg font-bold">Count: {count}</p>\n      {/* Use functional state update to prevent race conditions */}\n      <button \n        onClick={() => setCount(prev => prev + 1)}\n        className="px-4 py-2 mt-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"\n      >\n        Increment Count\n      </button>\n    </div>\n  );\n}\n\nexport default ElegantCounter;\n\`\`\`\n\n#### Key Takeaways:\n1. Always utilize the functional updater form \`setCount(prev => prev + 1)\` when the new state relies on previous state to prevent stale state variables.\n2. Ensure all event handlers are cleanly declared. Let me know if you need help debugging a specific error!`;
  }

  if (q.includes("study") || q.includes("exam") || q.includes("learn") || q.includes("memorize") || q.includes("focus")) {
    return `### 🧠 High-Efficiency Study Advice\n\nTo master your **${subject}** exams, research recommends implementing the **Feynman Technique** and **Spaced Repetition**:\n\n#### 1. The Feynman Technique\n* **Step 1**: Pick a complex concept you are struggling with.\n* **Step 2**: Write down an explanation of that concept as if you were teaching it to a **10-year-old child** (use simple words, no jargon).\n* **Step 3**: Identify gaps in your explanation, return to your notes, and fill in those gaps.\n\n#### 2. Spaced Study Milestones:\n| Review Session | Timing | Objective |\n| :--- | :--- | :--- |\n| Session 1 | 24 Hours later | Core active recall (Quiz) |\n| Session 2 | 3 Days later | Draw a blank visual mindmap |\n| Session 3 | 1 Week later | Explain the doubt to an AI Mentor |`;
  }

  // DEFAULT RESPONSE
  return `### 💡 Study Mentor Resolution\n\nHere is a comprehensive breakdown to resolve your academic query regarding **"${question}"**:\n\n#### Conceptual Breakdown:\n1. **Core Premise**: Every problem in academic coursework can be broken down into structural variables and logical rules. By isolating what you *know* from what you are *solving for*, the answer becomes clear.\n2. **Theoretical Connection**: In **${subject}**, this directly relates to systemic research models and peer-reviewed methodologies.\n\n#### Step-by-Step Explanation:\n* **Step A**: Analyze the core terms of the question.\n* **Step B**: Structure your response beginning with the general definition, followed by specific formulas or historical dates, and conclude with practical correlations.\n* **Step C**: Test yourself using the **SkillSync AI Quiz Generator** to cement this concept permanently in your long-term memory!\n\n*Does this clear up your doubt? Please let me know if you want me to expand on any specific sub-equation or definition!*`;
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
