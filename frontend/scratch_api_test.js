const apiKey = "AIzaSyDIIEROtuEs2NwSyM7N9kIpkGxgSZlNkuc";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log("Fetching available models from Google API Gateway...");
try {
  const res = await fetch(url);
  const json = await res.json();
  console.log("HTTP STATUS:", res.status);
  if (json.models) {
    const geminiModels = json.models.filter(m => m.name.includes("gemini"));
    console.log("FOUND", geminiModels.length, "GEMINI MODELS:");
    geminiModels.forEach(m => {
      console.log(`- Name: ${m.name}`);
      console.log(`  Methods: ${m.supportedGenerationMethods.join(", ")}`);
    });
  } else {
    console.log("No models returned. Response:", json);
  }
} catch (e) {
  console.error("Fetch failed:", e);
}
