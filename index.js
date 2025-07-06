const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const JUDGE0_API = "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true";
const RAPIDAPI_KEY = "1ac6d75981msh80a21e7c5ff6a9dp18f155jsn216aa37e0e81"; // api key

app.post('/judge0Execute', async (req, res) => {
  const { source_code, stdin, language } = req.body;
  try {
    const response = await axios.post(JUDGE0_API, {
      source_code,
      stdin,
      language_id: getLanguageId(language)
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function getLanguageId(lang) {
  const map = {
    'cpp': 54, 'java': 62, 'python': 71, 'javascript': 63
  };
  return map[lang] || 71;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
