const fs = require('fs');
const path = require('path');

const userProfile = process.env.USERPROFILE || process.env.HOME;
const tempDir = path.join(userProfile, '.gemini', 'antigravity', 'brain', 'b5630da3-663c-424c-8ae3-94440c7cc8e1', '.tempmediaStorage');

if (!fs.existsSync(tempDir)) {
  console.error("Temp media storage does not exist at:", tempDir);
  process.exit(1);
}

const files = fs.readdirSync(tempDir)
  .filter(f => f.startsWith('media_') && f.endsWith('.png'))
  .map(f => ({
    name: f,
    time: fs.statSync(path.join(tempDir, f)).mtime.getTime()
  }))
  .sort((a, b) => b.time - a.time);

if (files.length === 0) {
  console.error("No png files found in temp media storage.");
  process.exit(1);
}

// Find the second latest or the one that represents the grid wave (not the screenshot of landing page!)
// Wait, the user just uploaded the grid wave. The screenshot of landing page was uploaded right before it, 
// so the very newest is actually the grid wave! Let's pick files[0].
const newest = files[0].name;
const srcPath = path.join(tempDir, newest);
const destPath = path.join(__dirname, 'public', 'wave.png');

fs.copyFileSync(srcPath, destPath);
console.log("Successfully copied", newest, "to", destPath);
