const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
const match = envContent.match(/GEMINI_API_KEY=(.+)/);
if (!match) {
  console.error("No key found in .env.local");
  process.exit(1);
}
const apiKey = match[1].trim();

const payload = {
  contents: [
    {
      parts: [
        { text: "Respond in one word: Hello!" }
      ]
    }
  ]
};

fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload)
})
.then(async (res) => {
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text);
})
.catch((err) => {
  console.error("Error:", err);
});
