// Quiz Setup Variables
let selectedTopic = null;
let questionCount = 5;
let selectedDifficulty = null;

// Quiz State Variables
let current = 0;
let score = 0;
let canProceed = false;
let savedQuiz = [];

// DOM Elements
const quizSetup = document.getElementById('quiz-setup');
const quizSection = document.getElementById('quiz-section');
const topicButtons = document.querySelectorAll('.topic-btn');
const questionCountSlider = document.getElementById('questionCount');
const questionCountValue = document.getElementById('questionCountValue');
const startButton = document.getElementById('startQuiz');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const scoreContainer = document.getElementById("score-container");
const feedbackContainer = document.getElementById("feedback");
const questionCounter = document.getElementById("question-counter");
const nextButton = document.getElementById("next-button");
const resultButtons = document.querySelector(".result-buttons");
const newQuizButton = document.getElementById("new-quiz-button");
const restartQuizButton = document.getElementById("restart-quiz-button");
const loadingMessage = document.getElementById("loading-message");

questionCounter.style.display = 'none';

// Setup Event Listeners
topicButtons.forEach(button => {
  button.addEventListener('click', () => {
    topicButtons.forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    selectedTopic = button.dataset.topic;
    updateStartButton();
  });
});

questionCountSlider.addEventListener('input', () => {
  questionCount = parseInt(questionCountSlider.value);
  questionCountValue.textContent = questionCount;
  updateStartButton();
});

difficultyButtons.forEach(button => {
  button.addEventListener('click', () => {
    difficultyButtons.forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    selectedDifficulty = button.dataset.difficulty;
    updateStartButton();
  });
});

function updateStartButton() {
  startButton.disabled = !(selectedTopic && selectedDifficulty);
}

startButton.addEventListener('click', async () => {
  localStorage.setItem('quizConfig', JSON.stringify({
    topic: selectedTopic,
    count: questionCount,
    difficulty: selectedDifficulty
  }));

  quizSetup.style.display = 'none';
  quizSection.style.display = 'block';
  loadingMessage.style.display = "block";
  questionText.style.display = "none";
  optionsContainer.style.display = "none";

  current = 0;
  score = 0;
  canProceed = false;
  savedQuiz = [];

  for (let i = 0; i < questionCount; i++) {
    const quiz = await fetchQuestion();
    if (quiz) {
      savedQuiz.push(quiz);
    }
  }

  questionCounter.style.display = 'block';
  loadNextQuestion();
});

async function fetchQuestion() {
    try {
      const response = await fetch('http://10.0.0.107:8000/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedTopic,
          count: questionCount,
          difficulty: selectedDifficulty
        }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Expected an array of quiz questions.");
      return data;
    } catch (error) {
      console.error('Error fetching questions:', error);
      loadingMessage.textContent = "Error loading questions.";
      return [];
    }
}
  

function loadNextQuestion() {
  nextButton.style.display = "none";
  loadingMessage.style.display = "block";
  questionText.style.display = "none";
  optionsContainer.style.display = "none";

  const quiz = savedQuiz[current];
  if (quiz) {
    showQuestion(quiz);
  } else {
    loadingMessage.textContent = "No more questions.";
  }
}

function showQuestion(q) {
  loadingMessage.style.display = "none";
  questionText.style.display = "block";
  optionsContainer.style.display = "flex";
  optionsContainer.innerHTML = "";

  canProceed = false;
  nextButton.style.display = 'none';
  resultButtons.style.display = 'none';
  nextButton.textContent = (current === questionCount - 1) ? 'Finish' : 'Next';
  questionCounter.textContent = `Question ${current + 1}/${questionCount}`;

  questionText.textContent = q.question;
  optionsContainer.style.flexDirection = "column";
  optionsContainer.style.gap = "12px";

  q.options.forEach((opt, i) => {
    const div = document.createElement("div");
    div.className = "option";
    div.textContent = `${String.fromCharCode(65 + i)}. ${opt}`;
    div.onclick = () => checkAnswer(div, i === q.answer, q.answer);
    optionsContainer.appendChild(div);
  });
}

function checkAnswer(element, isCorrect, correctIndex) {
  if (canProceed) return;

  const options = document.querySelectorAll('.option');
  options.forEach(opt => opt.onclick = null);

  element.classList.add(isCorrect ? 'correct' : 'incorrect');
  if (!isCorrect) {
    options[correctIndex].classList.add('show-correct');
  }

  if (isCorrect) score++;
  canProceed = true;
  nextButton.style.display = 'block';
}

function getFeedback(score, total) {
  const percent = (score / total) * 100;
  if (percent <= 40) return "You're trash 😬";
  if (percent <= 50) return "meh";
  if (percent <= 70) return "Not bad 👍";
  if (percent <= 90) return "Excellent! 🔥";
  return "Perfect score! You're a QuizMaster 🏆";
}

function showResults() {
  questionText.style.display = "none";
  optionsContainer.style.display = "none";
  questionCounter.style.display = "none";
  nextButton.style.display = "none";
  scoreContainer.style.display = "block";
  resultButtons.style.display = "flex";

  scoreContainer.textContent = `Your Score: ${score} / ${questionCount}`;
  feedbackContainer.textContent = getFeedback(score, questionCount);
  feedbackContainer.style.display = "block";
}

nextButton.addEventListener('click', () => {
  if (!canProceed) return;
  if (current === questionCount - 1 && nextButton.textContent === 'Finish') {
    showResults();
    return;
  }
  current++;
  if (current < questionCount) loadNextQuestion();
});

startButton.addEventListener('click', async () => {
    localStorage.setItem('quizConfig', JSON.stringify({
      topic: selectedTopic,
      count: questionCount,
      difficulty: selectedDifficulty
    }));
  
    quizSetup.style.display = 'none';
    quizSection.style.display = 'block';
    loadingMessage.style.display = "block";
    questionText.style.display = "none";
    optionsContainer.style.display = "none";
  
    current = 0;
    score = 0;
    canProceed = false;
    savedQuiz = [];
  
    const quizzes = await fetchQuestion();
    if (quizzes.length > 0) {
      savedQuiz = quizzes;
      questionCounter.style.display = 'block';
      loadNextQuestion();
    } else {
      loadingMessage.textContent = "Failed to load quiz.";
    }
});


restartQuizButton.addEventListener('click', () => {
    current = 0;
    score = 0;
    canProceed = false;
  
    questionText.style.display = "block";
    optionsContainer.style.display = "flex";
    scoreContainer.style.display = "none";
    feedbackContainer.style.display = "none";
    feedbackContainer.textContent = "";
    nextButton.style.display = 'none';
    resultButtons.style.display = 'none';
    questionCounter.style.display = 'block';
  
    loadNextQuestion(); // reuse savedQuiz
}); 


newQuizButton.addEventListener('click', () => {
  selectedTopic = null;
  selectedDifficulty = null;
  questionCount = 5;
  current = 0;
  score = 0;
  canProceed = false;
  savedQuiz = [];

  topicButtons.forEach(btn => btn.classList.remove('selected'));
  difficultyButtons.forEach(btn => btn.classList.remove('selected'));
  questionCountSlider.value = 5;
  questionCountValue.textContent = '5';
  startButton.disabled = true;

  questionText.style.display = "block";
  optionsContainer.style.display = "none";
  scoreContainer.style.display = "none";
  feedbackContainer.style.display = "none";
  feedbackContainer.textContent = "";
  nextButton.style.display = 'none';
  resultButtons.style.display = 'none';
  optionsContainer.innerHTML = "";

  quizSection.style.display = 'none';
  quizSetup.style.display = 'block';
  questionCounter.style.display = 'none';
});