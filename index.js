const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Judge0 Configuration
const JUDGE0_API = "https://judge0-ce.p.rapidapi.com/submissions";
const RAPIDAPI_KEY = "1ac6d75981msh80a21e7c5ff6a9dp18f155jsn216aa37e0e81"; // Direct API key
const JUDGE0_HEADERS = {
  'Content-Type': 'application/json',
  'X-RapidAPI-Key': RAPIDAPI_KEY,
  'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
};

// Language ID mapping
const LANGUAGE_IDS = {
  'cpp': 54,
  'java': 62,
  'python': 71,
  'javascript': 63,
  'c': 50,
  'csharp': 51,
  'ruby': 72,
  'swift': 83,
  'go': 60,
  'rust': 73
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Code execution endpoint
app.post('/execute', async (req, res) => {
  try {
    const { source_code, language, stdin } = req.body;
    
    // Validate input
    if (!source_code || !language) {
      return res.status(400).json({ 
        error: "Missing required fields: source_code and language" 
      });
    }

    const language_id = LANGUAGE_IDS[language.toLowerCase()];
    if (!language_id) {
      return res.status(400).json({ 
        error: "Unsupported language",
        supported_languages: Object.keys(LANGUAGE_IDS)
      });
    }

    // Execute code via Judge0
    const response = await axios.post(
      `${JUDGE0_API}?base64_encoded=false&wait=true`,
      {
        source_code,
        language_id,
        stdin: stdin || "",
        redirect_stderr_to_stdout: true
      },
      { headers: JUDGE0_HEADERS }
    );

    // Return execution results
    res.json({
      success: true,
      result: {
        stdout: response.data.stdout,
        stderr: response.data.stderr,
        compile_output: response.data.compile_output,
        time: response.data.time,
        memory: response.data.memory,
        status: response.data.status
      }
    });

  } catch (error) {
    console.error("Execution error:", error.message);
    res.status(500).json({ 
      error: "Code execution failed",
      details: error.response?.data || error.message 
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 Connected to Judge0 API`);
  console.log(`🌐 Supported languages: ${Object.keys(LANGUAGE_IDS).join(', ')}`);
});
