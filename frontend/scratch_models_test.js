import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = "AIzaSyBv6CW9XZkj5h2XbyWBC11dWmViGO2LcaY";
const models = [
  "gemini-2.5-flash", 
  "gemini-2.5-pro", 
  "gemini-2.0-flash", 
  "gemini-flash-latest", 
  "gemini-pro-latest",
  "gemini-1.5-flash",
  "gemini-pro"
];

console.log("Starting model diagnostic test with active key...");
const genAI = new GoogleGenerativeAI(apiKey);

for (const modelName of models) {
  console.log(`\n--------------------------------------------`);
  console.log(`Testing model: "${modelName}"...`);
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Say 'Active' and nothing else.");
    const response = await result.response;
    console.log(`🟢 SUCCESS! "${modelName}" replied:`, response.text().trim());
  } catch (error) {
    console.log(`🔴 FAILED! "${modelName}" threw error:`, error.message || error);
  }
}
