import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = "AIzaSyDIIEROtuEs2NwSyM7N9kIpkGxgSZlNkuc";
console.log("Initializing Gemini Client...");

try {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  console.log("Sending query 'Hello' to gemini-2.5-flash...");
  const result = await model.generateContent("Hello");
  const response = await result.response;
  console.log("\n🟢 SUCCESS! Gemini replied:\n", response.text());
} catch (error) {
  console.error("\n🔴 GEMINI API ERROR OCCURRED:\n", error);
}
