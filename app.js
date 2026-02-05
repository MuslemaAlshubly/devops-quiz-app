let allQuestions = [];
let filteredQuestions = [];
let currentIndex = 0;
let currentTopic = "";
let hasSubmitted = false;

const topicSelect = document.getElementById("topicSelect");
const startBtn = document.getElementById("startBtn");
const nextBtn = document.getElementById("nextBtn");
const resetBtn = document.getElementById("resetBtn");
const submitBtn = document.getElementById("submitBtn");

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
  resetBtn.addEventListener("click", resetQuiz);
  submitBtn.addEventListener("click", submitAnswer);

  topicSelect.addEventListener("change", () => {
    currentTopic = topicSelect.value;
    statusEl.textContent = currentTopic
      ? `Topic selected: ${currentTopic}. Press Start.`
      : "Select a topic to begin.";
  });
}

async function loadQuestions() {
  try {
    statusEl.textContent = "Loading questions…";

    const res = await fetch("data/questions.json");
    if (!res.ok) throw new Error("Could not load data/questions.json");

    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("questions.json must be an array");

    allQuestions = data;
    populateTopics(allQuestions);

    statusEl.textContent = "Select a topic to begin.";
  } catch (err) {
    statusEl.textContent = `Error: ${err.message}`;
    topicSelect.innerHTML = `<option value="">(Error loading topics)</option>`;
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
    statusEl.textContent = "Please select a topic first.";
    return;
  }

  filteredQuestions = allQuestions.filter(q => q.topic === currentTopic);
  if (filteredQuestions.length === 0) {
    statusEl.textContent = "No questions found for this topic.";
    return;
  }

  currentIndex = 0;
  questionCard.classList.remove("hidden");
  nextBtn.disabled = filteredQuestions.length <= 1;

  showQuestion();
}

function showQuestion() {
  hasSubmitted = false;
  submitBtn.disabled = true;

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

    radio.addEventListener("change", () => {
      if (!hasSubmitted) submitBtn.disabled = false;
    });

    const span = document.createElement("span");
    span.textContent = optText;

    label.appendChild(radio);
    label.appendChild(span);
    optionsForm.appendChild(label);
  });

  statusEl.textContent = `Topic: ${currentTopic} — Question ${currentIndex + 1} of ${filteredQuestions.length}`;
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
  submitBtn.disabled = true;

  feedbackBox.classList.remove("hidden");
  feedbackBox.classList.add(correct ? "correct" : "wrong");

  feedbackText.textContent = correct ? "Correct ✅" : "Wrong ❌";
  explanationText.textContent = q.explanation || "(No explanation provided)";

  nextBtn.disabled = currentIndex >= filteredQuestions.length - 1;
}

function nextQuestion() {
  if (currentIndex < filteredQuestions.length - 1) {
    currentIndex++;
    showQuestion();
  } else {
    statusEl.textContent = "End of topic questions.";
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

  statusEl.textContent = "Select a topic to begin.";
}