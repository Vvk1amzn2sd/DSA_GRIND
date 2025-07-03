// Firebase Configuration using environment variables
const firebaseConfig = {
  apiKey: window.VITE_FIREBASE_API_KEY || "AIzaSyBxmE8mAJJ5pFkOWC00ct_pWK1Autr2PAo",
  authDomain: `${window.VITE_FIREBASE_PROJECT_ID || "dsa-challenge"}.firebaseapp.com`,
  databaseURL: `https://${window.VITE_FIREBASE_PROJECT_ID || "dsa-challenge"}-default-rtdb.asia-southeast1.firebasedatabase.app`,
  projectId: window.VITE_FIREBASE_PROJECT_ID || "dsa-challenge",
  storageBucket: `${window.VITE_FIREBASE_PROJECT_ID || "dsa-challenge"}.appspot.com`,
  messagingSenderId: "866070092409",
  appId: window.VITE_FIREBASE_APP_ID || "1:866070092409:web:49faada850b1b91bbf52a8",
  measurementId: "G-P3Y7XMJN2L"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

// Global variables
let currentUser = null;
let editor = null;
let seconds = 0;
let timer = null;
let testCasesData = [];

// DOM Elements
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const startTimerBtn = document.getElementById("startTimerBtn");
const submitBtn = document.getElementById("submitBtn");
const runButton = document.getElementById("runButton");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const datePicker = document.getElementById("datePicker");
const difficultySelect = document.getElementById("difficultySelect");
const problemSelect = document.getElementById("problemSelect");
const languageSelect = document.getElementById("languageSelect");
const editorDiv = document.getElementById("editor");
const runOutput = document.getElementById("runOutput");
const stdinInput = document.getElementById("stdinInput");
const timerDisplay = document.getElementById("timerDisplay");
const questionContent = document.getElementById("questionContent");
const attemptCountDisplay = document.getElementById("attemptCountDisplay");
const winnerBanner = document.getElementById("winnerBanner");
const challengeBanner = document.getElementById("challengeBanner");
const testResults = document.getElementById("testResults");
const testSummary = document.getElementById("testSummary");
const testCases = document.getElementById("testCases");
const authSection = document.getElementById("authSection");
const userInfo = document.getElementById("userInfo");
const userEmail = document.getElementById("userEmail");
const themeToggle = document.getElementById("themeToggle");
const submissionStatus = document.getElementById("submissionStatus");

// Language mapping for Judge0
const langMap = {
  java: 62,
  cpp: 54,
  c: 50,
  python: 71,
  javascript: 63,
  typescript: 74,
  ruby: 72,
  csharp: 51,
  go: 60,
  php: 68,
  swift: 83,
  rust: 73,
  kotlin: 78
};

// Template code for different languages
const languageTemplates = {
  javascript: `// Write your JavaScript solution here
function solution(input) {
    // Your code here
    return result;
}

// Example usage
console.log(solution("test input"));`,
  
  python: `# Write your Python solution here
def solution(input_str):
    # Your code here
    return result

# Example usage
print(solution("test input"))`,
  
  cpp: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

// Write your C++ solution here
string solution(string input) {
    // Your code here
    return result;
}

int main() {
    string input;
    getline(cin, input);
    cout << solution(input) << endl;
    return 0;
}`,
  
  java: `import java.util.*;
import java.io.*;

public class Solution {
    // Write your Java solution here
    public static String solution(String input) {
        // Your code here
        return result;
    }
    
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String input = br.readLine();
        System.out.println(solution(input));
    }
}`,
  
  c: `#include <stdio.h>
#include <string.h>

// Write your C solution here
int main() {
    char input[1000];
    fgets(input, sizeof(input), stdin);
    
    // Your code here
    
    return 0;
}`,
  
  csharp: `using System;

class Program {
    // Write your C# solution here
    static string Solution(string input) {
        // Your code here
        return result;
    }
    
    static void Main() {
        string input = Console.ReadLine();
        Console.WriteLine(Solution(input));
    }
}`,
  
  go: `package main

import (
    "bufio"
    "fmt"
    "os"
)

// Write your Go solution here
func solution(input string) string {
    // Your code here
    return result
}

func main() {
    scanner := bufio.NewScanner(os.Stdin)
    scanner.Scan()
    input := scanner.Text()
    fmt.Println(solution(input))
}`,
  
  rust: `use std::io;

// Write your Rust solution here
fn solution(input: &str) -> String {
    // Your code here
    result
}

fn main() {
    let mut input = String::new();
    io::stdin().read_line(&mut input).unwrap();
    let input = input.trim();
    println!("{}", solution(input));
}`,
  
  php: `<?php
// Write your PHP solution here
function solution($input) {
    // Your code here
    return $result;
}

$input = trim(fgets(STDIN));
echo solution($input);
?>`,
  
  ruby: `# Write your Ruby solution here
def solution(input)
    # Your code here
    result
end

input = gets.chomp
puts solution(input)`,
  
  swift: `import Foundation

// Write your Swift solution here
func solution(_ input: String) -> String {
    // Your code here
    return result
}

let input = readLine() ?? ""
print(solution(input))`,
  
  kotlin: `import java.util.*

// Write your Kotlin solution here
fun solution(input: String): String {
    // Your code here
    return result
}

fun main() {
    val input = readLine() ?: ""
    println(solution(input))
}`,
  
  typescript: `// Write your TypeScript solution here
function solution(input: string): string {
    // Your code here
    return result;
}

// Example usage
console.log(solution("test input"));`
};

// Initialize date picker with today's date
function initializeDatePicker() {
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];
  datePicker.value = formattedDate;
  updateChallengeBanner();
}

// Update challenge banner with current date
function updateChallengeBanner() {
  const selectedDate = new Date(datePicker.value);
  const options = { month: 'short', day: 'numeric' };
  const formattedDate = selectedDate.toLocaleDateString('en-US', options);
  challengeBanner.textContent = `Challenge for ${formattedDate} is live`;
}

// Initialize Monaco Editor
function initializeMonacoEditor() {
  require.config({ 
    paths: { 
      'vs': 'https://unpkg.com/monaco-editor@0.34.1/min/vs' 
    }
  });
  
  require(['vs/editor/editor.main'], function () {
    const isDark = document.body.classList.contains('dark');
    editor = monaco.editor.create(editorDiv, {
      value: languageTemplates.javascript,
      language: "javascript",
      theme: isDark ? "vs-dark" : "vs",
      fontSize: 14,
      minimap: { enabled: true },
      automaticLayout: true,
      wordWrap: 'on',
      scrollBeyondLastLine: false,
      renderLineHighlight: 'line',
      selectOnLineNumbers: true
    });
    
    updateLanguageIndicator();
  });
}

// Update language indicator color
function updateLanguageIndicator() {
  const indicator = document.getElementById('langIndicator');
  const langColors = {
    javascript: '#f7df1e',
    python: '#3776ab',
    cpp: '#00599c',
    java: '#ed8b00',
    c: '#a8b9cc',
    csharp: '#239120',
    go: '#00add8',
    rust: '#ce422b',
    php: '#777bb3',
    ruby: '#cc342d',
    swift: '#fa7343',
    kotlin: '#7f52ff',
    typescript: '#3178c6'
  };
  
  if (indicator) {
    indicator.style.background = langColors[languageSelect.value] || '#28a745';
  }
}

// Theme toggle functionality
function toggleTheme() {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  themeToggle.textContent = isDark ? '☀️ Light' : '🌙 Dark';
  
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  
  if (editor) {
    monaco.editor.setTheme(isDark ? 'vs-dark' : 'vs');
  }
}

// Initialize theme
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    themeToggle.textContent = '☀️ Light';
  }
}

// Authentication event handlers
signupBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  
  if (!email || !password) {
    alert('Please enter both email and password');
    return;
  }
  
  if (password.length < 6) {
    alert('Password must be at least 6 characters long');
    return;
  }
  
  try {
    signupBtn.textContent = 'Signing up...';
    signupBtn.disabled = true;
    
    await auth.createUserWithEmailAndPassword(email, password);
    alert('Signup successful! You are now logged in.');
  } catch (error) {
    console.error('Signup error:', error);
    alert(`Signup failed: ${error.message}`);
  } finally {
    signupBtn.textContent = 'Sign Up';
    signupBtn.disabled = false;
  }
});

loginBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  
  if (!email || !password) {
    alert('Please enter both email and password');
    return;
  }
  
  try {
    loginBtn.textContent = 'Logging in...';
    loginBtn.disabled = true;
    
    await auth.signInWithEmailAndPassword(email, password);
    alert('Login successful!');
  } catch (error) {
    console.error('Login error:', error);
    alert(`Login failed: ${error.message}`);
  } finally {
    loginBtn.textContent = 'Log In';
    loginBtn.disabled = false;
  }
});

logoutBtn.addEventListener('click', async () => {
  try {
    await auth.signOut();
    alert('Logged out successfully');
  } catch (error) {
    console.error('Logout error:', error);
    alert(`Logout failed: ${error.message}`);
  }
});

// Auth state observer
auth.onAuthStateChanged(user => {
  currentUser = user;
  
  if (user) {
    authSection.style.display = 'none';
    userInfo.style.display = 'flex';
    userEmail.textContent = user.email;
    
    passwordInput.value = '';
    
    loadQuestion();
    updateAttemptCount();
  } else {
    authSection.style.display = 'flex';
    userInfo.style.display = 'none';
    
    attemptCountDisplay.textContent = '';
  }
});

// Get date information
function getDateInfo() {
  const selectedDate = new Date(datePicker.value);
  const day = selectedDate.getDate();
  const month = selectedDate.toLocaleString('default', { month: 'long' }).toUpperCase();
  return { day, month };
}

// Check if user has already submitted for this question
async function checkSubmissionStatus() {
  if (!currentUser) return false;
  
  const { day, month } = getDateInfo();
  const difficulty = difficultySelect.value;
  const language = languageSelect.value;
  const username = currentUser.email.split('@')[0];
  
  try {
    const submissionRef = database.ref(`solutions/${month}/${day}/${difficulty}/${language}/${username}`);
    const snapshot = await submissionRef.once('value');
    
    if (snapshot.exists()) {
      const submission = snapshot.val();
      submissionStatus.innerHTML = `
        <div>✅ Already submitted in ${language}</div>
        <div>Time: ${submission.time}s | Result: ${submission.result}</div>
      `;
      submissionStatus.className = 'submission-status already-submitted';
      submissionStatus.style.display = 'block';
      
      submitBtn.disabled = true;
      submitBtn.textContent = 'Already Submitted';
      
      return true;
    } else {
      submissionStatus.style.display = 'none';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit';
      return false;
    }
  } catch (error) {
    console.error('Failed to check submission status:', error);
    return false;
  }
}

// Load question from GitHub repository
async function loadQuestion() {
  if (!currentUser) {
    questionContent.innerHTML = '<div class="loading-indicator">Please login to view questions</div>';
    return;
  }
  
  const { day, month } = getDateInfo();
  const difficulty = difficultySelect.value;
  
  const questionURL = `https://raw.githubusercontent.com/Vvk1amzn2sd/DSA_practise_vvk/main/Questions/${month}/${day}/${difficulty}.md`;
  const testCaseURL = `https://raw.githubusercontent.com/Vvk1amzn2sd/DSA_practise_vvk/main/Questions/${month}/${day}/${difficulty}_test_cases.json`;
  
  questionContent.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading question...</div>';
  
  try {
    const questionResponse = await fetch(questionURL);
    if (!questionResponse.ok) {
      throw new Error(`Question not found (${questionResponse.status})`);
    }
    
    const questionText = await questionResponse.text();
    questionContent.innerHTML = marked.parse(questionText);
    
    try {
      const testCaseResponse = await fetch(testCaseURL);
      if (testCaseResponse.ok) {
        testCasesData = await testCaseResponse.json();
        
        if (testCasesData.length > 0 && testCasesData[0].input) {
          stdinInput.value = testCasesData[0].input;
        }
        
        console.log(`Loaded ${testCasesData.length} test cases`);
      } else {
        console.warn('Test cases not found, using empty array');
        testCasesData = [];
      }
    } catch (testCaseError) {
      console.warn('Failed to load test cases:', testCaseError.message);
      testCasesData = [];
    }
    
    await checkSubmissionStatus();
    
  } catch (error) {
    console.error('Failed to load question:', error);
    questionContent.innerHTML = `
      <div style="text-align: center; color: #dc3545; padding: 2rem;">
        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
        <h3>Question Not Found</h3>
        <p>No question available for ${month} ${day} (${difficulty})</p>
        <p style="font-size: 0.9rem; color: #666; margin-top: 1rem;">
          Try selecting a different date or difficulty level.
        </p>
      </div>
    `;
  }
}

// Timer functionality
startTimerBtn.addEventListener('click', () => {
  seconds = 0;
  timerDisplay.textContent = '0 sec';
  
  if (timer) {
    clearInterval(timer);
  }
  
  timer = setInterval(() => {
    seconds++;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      timerDisplay.textContent = `${minutes}m ${remainingSeconds}s`;
    } else {
      timerDisplay.textContent = `${seconds} sec`;
    }
  }, 1000);
  
  startTimerBtn.textContent = 'Timer Running...';
  startTimerBtn.disabled = true;
  
  setTimeout(() => {
    startTimerBtn.textContent = 'Restart Timer';
    startTimerBtn.disabled = false;
  }, 3000);
});

// Run code functionality
runButton.addEventListener('click', async () => {
  if (!editor) {
    alert('Editor not initialized yet. Please wait a moment.');
    return;
  }
  
  const code = editor.getValue();
  const language = languageSelect.value;
  const languageId = langMap[language];
  const stdin = stdinInput.value;
  
  if (!code.trim()) {
    alert('Please write some code first');
    return;
  }
  
  if (!languageId) {
    alert('Unsupported language selected');
    return;
  }
  
  runOutput.textContent = 'Running code...';
  runButton.disabled = true;
  runButton.textContent = '⏳ Running...';
  
  try {
    const response = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
        'x-rapidapi-key': '1ac6d75981msh80a21e7c5ff6a9dp18f155jsn216aa37e0e81'
      },
      body: JSON.stringify({
        language_id: languageId,
        source_code: code,
        stdin: stdin,
        redirect_stderr_to_stdout: true
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    let output = 'No output';
    if (result.stdout) {
      output = result.stdout;
    } else if (result.stderr) {
      output = `Error: ${result.stderr}`;
    } else if (result.compile_output) {
      output = `Compilation Error: ${result.compile_output}`;
    }
    
    runOutput.textContent = output;
    
  } catch (error) {
    console.error('Code execution error:', error);
    runOutput.textContent = `Execution failed: ${error.message}`;
  } finally {
    runButton.disabled = false;
    runButton.textContent = '▶️ Compile & Run';
  }
});

// Submit code functionality
submitBtn.addEventListener('click', async () => {
  if (!currentUser) {
    alert('Please login to submit code');
    return;
  }
  
  if (!editor) {
    alert('Editor not initialized yet. Please wait a moment.');
    return;
  }
  
  const code = editor.getValue();
  if (!code.trim()) {
    alert('Please write some code first');
    return;
  }
  
  if (testCasesData.length === 0) {
    alert('No test cases available for this problem');
    return;
  }
  
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  
  const timeTaken = seconds;
  const language = languageSelect.value;
  const languageId = langMap[language];
  
  let passed = 0;
  let totalTests = testCasesData.length;
  
  testResults.style.display = 'block';
  testCases.innerHTML = '';
  testSummary.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Evaluating test cases...';
  
  submitBtn.disabled = true;
  submitBtn.textContent = 'Testing...';
  
  try {
    for (let i = 0; i < testCasesData.length; i++) {
      const testCase = testCasesData[i];
      
      const response = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
          'x-rapidapi-key': '1ac6d75981msh80a21e7c5ff6a9dp18f155jsn216aa37e0e81'
        },
        body: JSON.stringify({
          language_id: languageId,
          source_code: code,
          stdin: testCase.input
        })
      });
      
      const result = await response.json();
      const actualOutput = (result.stdout || '').trim();
      const expectedOutput = testCase.expected.trim();
      const isPass = actualOutput === expectedOutput;
      
      if (isPass) passed++;
      
      const testCaseDiv = document.createElement('div');
      testCaseDiv.className = `test-case ${isPass ? 'pass' : 'fail'}`;
      testCaseDiv.innerHTML = `
        <strong>Test Case ${i + 1}: ${isPass ? '✅ PASS' : '❌ FAIL'}</strong><br>
        <strong>Input:</strong> ${testCase.input || '(empty)'}<br>
        <strong>Expected:</strong> ${expectedOutput}<br>
        <strong>Got:</strong> ${actualOutput || '(empty)'}
        ${result.stderr ? `<br><strong>Error:</strong> ${result.stderr}` : ''}
      `;
      
      testCases.appendChild(testCaseDiv);
    }
    
    const resultStatus = passed === totalTests ? 'PASS' : 'FAIL';
    const passPercentage = Math.round((passed / totalTests) * 100);
    
    testSummary.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span>
          <strong>${passed}/${totalTests}</strong> test cases passed (${passPercentage}%)
        </span>
        <span style="color: ${resultStatus === 'PASS' ? '#28a745' : '#dc3545'}; font-weight: bold;">
          ${resultStatus}
        </span>
      </div>
    `;
    
    const { day, month } = getDateInfo();
    const username = currentUser.email.split('@')[0];
    const submission = {
      username,
      email: currentUser.email,
      time: timeTaken,
      passed,
      total: totalTests,
      code,
      language,
      result: resultStatus,
      timestamp: Date.now(),
      date: `${month}_${day}`,
      difficulty: difficultySelect.value
    };
    
    const submissionRef = database.ref(`solutions/${month}/${day}/${difficultySelect.value}/${language}/${username}`);
    await submissionRef.set(submission);
    
    updateAttemptCount();
    
    if (resultStatus === 'PASS') {
      const winnerRef = database.ref(`winners/${month}_${day}_${difficultySelect.value}_${language}`);
      const winnerSnapshot = await winnerRef.once('value');
      const currentWinner = winnerSnapshot.val();
      
      if (!currentWinner || timeTaken < currentWinner.time) {
        await winnerRef.set({
          username,
          email: currentUser.email,
          time: timeTaken,
          timestamp: Date.now()
        });
        
        const minutes = Math.floor(timeTaken / 60);
        const seconds = timeTaken % 60;
        const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
        
        winnerBanner.textContent = `🎉 ${username} is now leading in ${language} with ${timeStr}!`;
        winnerBanner.style.display = 'block';
        
        setTimeout(() => {
          winnerBanner.style.display = 'none';
        }, 10000);
      }
    }
    
    if (resultStatus === 'PASS') {
      alert(`🎉 Congratulations! All test cases passed in ${timeTaken} seconds!`);
    } else {
      alert(`${passed}/${totalTests} test cases passed. Keep trying!`);
    }
    
    await checkSubmissionStatus();
    
  } catch (error) {
    console.error('Submission error:', error);
    testSummary.innerHTML = `<span style="color: #dc3545;">❌ Submission failed: ${error.message}</span>`;
    alert('Submission failed. Please try again.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit';
  }
});

// Update attempt count
async function updateAttemptCount() {
  if (!currentUser) return;
  
  const today = new Date().toISOString().split('T')[0];
  const attemptRef = database.ref(`attempts/${currentUser.uid}/${today}`);
  
  try {
    const result = await attemptRef.transaction(currentCount => {
      return (currentCount || 0) + 1;
    });
    
    attemptCountDisplay.textContent = `Attempts: ${result.snapshot.val()}`;
  } catch (error) {
    console.error('Failed to update attempt count:', error);
  }
}

// Theme toggle event listener
themeToggle.addEventListener('click', toggleTheme);

// Language change handler - also check submission status
languageSelect.addEventListener('change', async () => {
  const selectedLang = languageSelect.value;
  
  if (editor && languageTemplates[selectedLang]) {
    monaco.editor.setModelLanguage(editor.getModel(), selectedLang);
    editor.setValue(languageTemplates[selectedLang]);
  }
  
  updateLanguageIndicator();
  
  if (currentUser) {
    await checkSubmissionStatus();
  }
});

// Date and difficulty change handlers
datePicker.addEventListener('change', () => {
  updateChallengeBanner();
  loadQuestion();
});

difficultySelect.addEventListener('change', loadQuestion);

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  initializeTheme();
  initializeDatePicker();
  initializeMonacoEditor();
  
  updateChallengeBanner();
});

// Handle page visibility change to pause/resume timer
document.addEventListener('visibilitychange', () => {
  if (document.hidden && timer) {
    // Page is hidden
  } else if (!document.hidden && timer) {
    // Page is visible again
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault();
    runButton.click();
  }
  
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'Enter') {
    event.preventDefault();
    submitBtn.click();
  }
});