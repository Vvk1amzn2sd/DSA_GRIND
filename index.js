// index.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://dsa-challenge-default-rtdb.asia-southeast1.firebasedatabase.app'
});
const db = admin.database();

const app = express();
app.use(cors());
app.use(express.json());

const JUDGE0_API = "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true";
const RAPIDAPI_KEY = "1ac6d75981msh80a21e7c5ff6a9dp18f155jsn216aa37e0e81";

// Helper to map languages to Judge0 IDs
function getLanguageId(lang) {
  const map = { cpp: 54, java: 62, python: 71, javascript: 63 };
  return map[lang] || 63;
}

// Calculate day (YYYY-MM-DD) and ISO week (YYYY-W##)
function getKeys() {
  const now = new Date();
  const dayKey = now.toISOString().slice(0, 10);
  const weekNum = new Intl.DateTimeFormat('en-US', { week: 'numeric', year: 'numeric' })
    .formatToParts(now)
    .find(p => p.type === 'week').value;
  const year = now.getFullYear();
  return { dayKey, weekKey: `${year}-W${weekNum.padStart(2, '0')}` };
}

// Endpoint to run code + save results
app.post('/submit', async (req, res) => {
  const { userId, displayName, source_code, stdin, language, difficulty, startTime } = req.body;
  const language_id = getLanguageId(language);
  const subRes = await axios.post(JUDGE0_API, { source_code, stdin, language_id }, {
    headers: {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
    }
  });
  const result = subRes.data;
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000; // in seconds

  if (result.status && result.status.id === 3) {
    const { dayKey, weekKey } = getKeys();
    const entry = { time: duration, displayName, difficulty, timestamp: admin.database.ServerValue.TIMESTAMP };
    
    const updates = {};
    updates[`/leaderboards/${dayKey}/${difficulty}/${userId}`] = entry;
    updates[`/leaderboards/${weekKey}/${difficulty}/${userId}`] = entry;

    await db.ref().update(updates);
  }

  res.json({ judge0: result, duration });
});

// Fetch leaderboard: daily or weekly
app.get('/leaderboard/:period/:difficulty', async (req, res) => {
  const { period, difficulty } = req.params;
  if (!['daily', 'weekly'].includes(period)) return res.status(400).send('Invalid period');
  
  const { dayKey, weekKey } = getKeys();
  const key = period === 'daily' ? dayKey : weekKey;
  const snapshot = await db.ref(`leaderboards/${key}/${difficulty}`)
    .orderByChild('time')
    .limitToFirst(10)
    .once('value');
  
  const list = [];
  snapshot.forEach(child => {
    list.push({ uid: child.key, ...child.val() });
  });
  res.json({ period, difficulty, entries: list });
});

// Utility endpoint for timezone sync (optional)
app.get('/now', (req, res) => res.json({ serverTime: Date.now() }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
