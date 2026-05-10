const recordBtn = document.getElementById('recordBtn');
const statusEl = document.getElementById('status');
const transcriptEl = document.getElementById('transcript');
const extractBtn = document.getElementById('extractBtn');
const taskListEl = document.getElementById('taskList');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
let isRecording = false;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    let text = '';
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      text += event.results[i][0].transcript;
    }
    transcriptEl.value = `${transcriptEl.value} ${text}`.trim();
  };

  recognition.onend = () => {
    isRecording = false;
    recordBtn.textContent = '🎙️ Start Recording';
    statusEl.textContent = 'Idle';
  };
} else {
  statusEl.textContent = 'Speech recognition not supported in this browser';
  recordBtn.disabled = true;
}

recordBtn.addEventListener('click', () => {
  if (!recognition) return;

  if (!isRecording) {
    recognition.start();
    isRecording = true;
    statusEl.textContent = 'Recording…';
    recordBtn.textContent = '⏹️ Stop Recording';
  } else {
    recognition.stop();
  }
});

function detectPriority(taskText) {
  const text = taskText.toLowerCase();
  if (/(urgent|asap|today|deadline|critical|important)/.test(text)) return 'high';
  if (/(soon|this week|follow up|prepare|plan)/.test(text)) return 'medium';
  return 'low';
}

function rankValue(priority) {
  return { high: 3, medium: 2, low: 1 }[priority] || 1;
}

extractBtn.addEventListener('click', () => {
  const text = transcriptEl.value.trim();
  taskListEl.innerHTML = '';

  if (!text) return;

  const rawTasks = text
    .split(/[\n\.!?]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 2);

  const tasks = rawTasks
    .map((task) => ({ text: task, priority: detectPriority(task) }))
    .sort((a, b) => rankValue(b.priority) - rankValue(a.priority));

  tasks.forEach((task) => {
    const li = document.createElement('li');
    li.className = 'task';
    li.innerHTML = `
      <span>${task.text}</span>
      <span class="badge ${task.priority}">${task.priority.toUpperCase()}</span>
    `;
    taskListEl.appendChild(li);
  });
});
