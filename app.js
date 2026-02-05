// DevOps Quiz App (static)
// - Loads questions using fetch (data/questions.json)
// - Topic selection
// - Shows question + options
// - Checks answers
// - Shows feedback + explanation

let allQuestions = [];
let filteredQuestions = [];
let currentIndex = 0;
let currentTopic = "";
let hasSubmitted = false;

const topicSelect = document.getElementById("topicSelect");
const startBtn = document.getElementById("startBtn");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");
const resetBtn = document.getElementById("resetBtn");

const statusEl = document.getElementById("status");
const questionCard = document.getElementById("questionCard");
const questionText = document.getElementById("questionText");
const optionsForm = document.getElementById("optionsForm");

const feedbackBox = document.getElementById("feedbackBox");
const feedbackText = document.getElementById("feedbackText");
const explanationText = document.getElementById("explanationText");

init();

function init() {
  wireEvents();
  loadQuestions();
}

function wireEvents() {
  startBtn.addEventListener("click", startQuiz);
  nextBtn.addEventListener("click", nextQuestion);
  submitBtn.addEventListener("click", submitAnswer);
  resetBtn.addEventListener("click", resetQuiz);

  topicSelect.addEventListener("change", () => {
    currentTopic = topicSelect.value;
    statusEl.textContent = currentTopic
      ? `Topic selected: ${currentTopic}. Press Start.`
      : "Pick a topic and press Start.";
  });
}

async function loadQuestions() {
  try {
    statusEl.textContent = "Loading questions...";
    const res = await fetch("data/questions.json");
    if (!res.ok) throw new Error("Failed to load questions.json");

    const data = await res.json();
    allQuestions = Array.isArray(data) ? data : [];

    populateTopics(allQuestions);

    statusEl.textContent = "Choose a topic, then press Start.";
    submitBtn.disabled = true;
    nextBtn.disabled = true;
  } catch (err) {
    topicSelect.innerHTML = `<option value="">(Error loading topics)</option>`;
    statusEl.textContent = `Error: ${err.message}`;
    topicSelect.innerHTML = <option value="">(Error loading topics)</option>;
    statusEl.textContent = `Error: ${err.message};`
  }
}

function populateTopics(questions) {
  const topics = [...new Set(questions.map(q => q.topic).filter(Boolean))].sort();

  topicSelect.innerHTML = `<option value="">-- Select a topic --</option>`;
  for (const t of topics) {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    topicSelect.appendChild(opt);
  }
}

function startQuiz() {
  currentTopic = topicSelect.value;

  if (!currentTopic) {
    statusEl.textContent = "Select a topic first.";
    return;
  }

  filteredQuestions = allQuestions.filter(q => q.topic === currentTopic);
  currentIndex = 0;

  if (filteredQuestions.length === 0) {
    statusEl.textContent = "No questions found for this topic.";
    return;
  }

  questionCard.classList.remove("hidden");
  feedbackBox.classList.add("hidden");
  statusEl.textContent = `Topic: ${currentTopic} (${filteredQuestions.length} questions)`;

  nextBtn.disabled = filteredQuestions.length <= 1;
  submitBtn.disabled = false;

  showQuestion();
}

function showQuestion() {
  hasSubmitted = false;
  feedbackBox.classList.add("hidden");
  feedbackBox.classList.remove("correct", "wrong");

  const q = filteredQuestions[currentIndex];
  questionText.textContent = q.question;

  optionsForm.innerHTML = "";

  q.options.forEach((optText, idx) => {
    const label = document.createElement("label");
    label.className = "option";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "option";
    radio.value = String(idx);

    // enable submit only after choosing
    radio.addEventListener("change", () => {
      if (!hasSubmitted) submitBtn.disabled = false;
    });

    const span = document.createElement("span");
    span.textContent = optText;

    label.appendChild(radio);
    label.appendChild(span);
    optionsForm.appendChild(label);
  });

  // disable submit until user selects (but keep enabled if they already know)
  submitBtn.disabled = true;

  statusEl.textContent = `Question ${currentIndex + 1} of ${filteredQuestions.length}`;
}

function getSelectedIndex() {
  const selected = optionsForm.querySelector('input[name="option"]:checked');
  return selected ? Number(selected.value) : null;
}

function submitAnswer() {
  if (hasSubmitted) return;

  const selectedIndex = getSelectedIndex();
  if (selectedIndex === null) {
    statusEl.textContent = "Choose an answer first.";
    return;
  }

  const q = filteredQuestions[currentIndex];
  const correct = selectedIndex === q.answerIndex;

  hasSubmitted = true;
  feedbackBox.classList.remove("hidden");
  feedbackBox.classList.add(correct ? "correct" : "wrong");

  feedbackText.textContent = correct ? "Correct ✅" : "Wrong ❌";
  explanationText.textContent = q.explanation || "(No explanation provided)";

  // after submitting, allow next
  nextBtn.disabled = currentIndex >= filteredQuestions.length - 1;
  submitBtn.disabled = true;
}

function nextQuestion() {
  if (currentIndex < filteredQuestions.length - 1) {
    currentIndex += 1;
    showQuestion();
  } else {
    statusEl.textContent = "End of questions for this topic.";
    nextBtn.disabled = true;
  }
}

function resetQuiz() {
  filteredQuestions = [];
  currentIndex = 0;
  currentTopic = "";
  hasSubmitted = false;

  topicSelect.value = "";
  questionCard.classList.add("hidden");
  feedbackBox.classList.add("hidden");
  submitBtn.disabled = true;
  nextBtn.disabled = true;

  statusEl.textContent = "Pick a topic and press Start.";
}