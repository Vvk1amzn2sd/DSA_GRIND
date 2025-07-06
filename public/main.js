// ===== CONFIGURATION =====
const JUDGE0_API_KEY = '1ac6d75981msh80a21e7c5ff6a9dp18f155jsn216aa37e0e81'; 
const JUDGE0_ENDPOINT = 'https://judge0-ce.p.rapidapi.com/submissions';
const LANGUAGE_ID = 63; // JavaScript
const POLL_RETRIES = 10;
const POLL_INTERVAL = 1000; // 1 second

// ===== INITIALIZATION =====
const codeEditor = CodeMirror.fromTextArea(document.getElementById('codeEditor'), {
  lineNumbers: true,
  mode: 'javascript',
  theme: 'dracula',
  indentUnit: 4,
  extraKeys: {
    'Ctrl-Enter': executeCode,
    'Cmd-Enter': executeCode
  }
});

// Initialize UI
const datePicker = document.getElementById('datePicker');
datePicker.value = new Date().toISOString().split('T')[0];
document.getElementById('currentDate').textContent = new Date().toLocaleDateString();

// ===== CORE FUNCTIONALITY =====
async function loadQuestion() {
  const difficulty = document.getElementById('difficultySelect').value;
  const date = datePicker.value;
  const questionContent = document.getElementById('questionContent');
  
  try {
    // Parallel loading of question and test cases
    const [question, tests] = await Promise.all([
      loadFile(`questions/${difficulty}/${date}.md`),
      loadFile(`questions/${difficulty}/${date}.json`, true)
    ]);
    
    questionContent.innerHTML = marked.parse(question);
    window.testCases = tests || [];
    
  } catch (error) {
    questionContent.innerHTML = `
      <div class="error-message">
        <h3>No question found for ${date}</h3>
        <p>Create: <code>questions/${difficulty}/${date}.md</code></p>
        ${error.message ? `<p>Error: ${error.message}</p>` : ''}
      </div>
    `;
    window.testCases = [];
  }
}

async function executeCode() {
  const outputElement = document.getElementById('output');
  outputElement.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Executing...</div>';
  
  try {
    const submission = await submitToJudge0(
      codeEditor.getValue(),
      document.getElementById('stdinInput').value
    );
    
    const result = await pollJudge0(submission.token);
    outputElement.innerHTML = formatOutput(result);
    
  } catch (error) {
    outputElement.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i> ${error.message}
      </div>
    `;
  }
}

// ===== JUDGE0 INTEGRATION =====
async function submitToJudge0(code, stdin = '') {
  const response = await axios.post(
    JUDGE0_ENDPOINT,
    {
      source_code: code,
      language_id: LANGUAGE_ID,
      stdin: stdin,
      wait: false
    },
    {
      headers: {
        'X-RapidAPI-Key': JUDGE0_API_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      }
    }
  );
  return response.data;
}

async function pollJudge0(token) {
  for (let i = 0; i < POLL_RETRIES; i++) {
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
    const response = await axios.get(`${JUDGE0_ENDPOINT}/${token}`, {
      headers: {
        'X-RapidAPI-Key': JUDGE0_API_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      }
    });
    
    const { status, stdout, stderr, compile_output } = response.data;
    if (status.id > 2) { // Status > 2 means execution completed
      return {
        status: status.description,
        output: stdout || stderr || compile_output || 'No output'
      };
    }
  }
  throw new Error('Execution timeout');
}

// ===== UTILITIES =====
async function loadFile(path, parseJson = false) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`File not found: ${path}`);
  return parseJson ? response.json() : response.text();
}

function formatOutput(result) {
  if (result.status === 'Accepted') {
    return `
      <div class="success-message">
        <i class="fas fa-check-circle"></i> Execution successful
        <pre>${result.output}</pre>
      </div>
    `;
  }
  return `
    <div class="error-message">
      <i class="fas fa-times-circle"></i> ${result.status}
      <pre>${result.output}</pre>
    </div>
  `;
}

// ===== EVENT LISTENERS =====
document.getElementById('difficultySelect').addEventListener('change', loadQuestion);
document.getElementById('datePicker').addEventListener('change', loadQuestion);
document.getElementById('runButton').addEventListener('click', executeCode);
document.getElementById('submitBtn').addEventListener('click', async () => {
  if (!window.testCases?.length) {
    alert('No test cases available for this question');
    return;
  }
  // Add your test case validation logic here
});

// Initial load
loadQuestion();