const express = require('express');
const axios = require('axios');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Judge0 Configuration
const JUDGE0_API = "https://judge0-ce.p.rapidapi.com/submissions";
const RAPIDAPI_KEY = "1ac6d75981msh80a21e7c5ff6a9dp18f155jsn216aa37e0e81";
const JUDGE0_HEADERS = {
  'Content-Type': 'application/json',
  'X-RapidAPI-Key': RAPIDAPI_KEY,
  'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
};

// Initialize Firebase Admin
try {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://dsa-challenge-default-rtdb.asia-southeast1.firebasedatabase.app",

 // Update with your project ID
  });
  console.log('✅ Firebase Admin initialized');
} catch (error) {
  console.error('❌ Firebase initialization error:', error.message);
  console.log('⚠️  Continuing without Firebase features');
}

// Language ID mapping
const LANGUAGE_IDS = {
  'cpp': 54,
  'java': 62,
  'python': 71,
  'javascript': 63
};

// Enhanced execution endpoint with Firebase logging
app.post('/execute', async (req, res) => {
  const { source_code, language, stdin, userId } = req.body;
  
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

  try {
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

    // Log execution to Firebase if available
    if (admin.apps.length) {
      try {
        const db = admin.firestore();
        await db.collection('code_executions').add({
          userId: userId || 'anonymous',
          code: source_code,
          language,
          result: response.data,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
      } catch (firebaseError) {
        console.error('Firebase logging failed:', firebaseError.message);
      }
    }

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

// Health check endpoint
app.get('/health', (req, res) => {
  const status = {
    server: 'running',
    firebase: admin.apps.length ? 'connected' : 'not connected',
    judge0: 'configured',
    timestamp: new Date().toISOString()
  };
  res.status(200).json(status);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n✅ Server running on port ${PORT}`);
  console.log(`🔌 Judge0 API configured`);
  console.log(`🔥 Firebase status: ${admin.apps.length ? 'connected' : 'not connected'}`);
  console.log(`\nEndpoints:`);
  console.log(`- POST http://localhost:${PORT}/execute`);
  console.log(`- GET  http://localhost:${PORT}/health\n`);
});
