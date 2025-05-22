// Quiz Setup Variables
let selectedTopic = null;
let questionCount = 5;
let selectedDifficulty = null;

// Quiz State Variables
let current = 0;
let score = 0;
let questions = [];
let canProceed = false;
let savedQuiz = [];  // Stores the last quiz set for restart

// DOM Elements - Setup
const quizSetup = document.getElementById('quiz-setup');
const quizSection = document.getElementById('quiz-section');
const topicButtons = document.querySelectorAll('.topic-btn');
const questionCountSlider = document.getElementById('questionCount');
const questionCountValue = document.getElementById('questionCountValue');
const startButton = document.getElementById('startQuiz');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');

// DOM Elements - Quiz
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const scoreContainer = document.getElementById("score-container");
const feedbackContainer = document.getElementById("feedback");
const questionCounter = document.getElementById("question-counter");
const nextButton = document.getElementById("next-button");
const resultButtons = document.querySelector(".result-buttons");
const newQuizButton = document.getElementById("new-quiz-button");
const restartQuizButton = document.getElementById("restart-quiz-button");

// Hide question counter initially
questionCounter.style.display = 'none';

// Topic selection
topicButtons.forEach(button => {
    button.addEventListener('click', () => {
        topicButtons.forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        selectedTopic = button.dataset.topic;
        updateStartButton();
    });
});

// Question count slider
questionCountSlider.addEventListener('input', () => {
    questionCount = parseInt(questionCountSlider.value);
    questionCountValue.textContent = questionCount;
    updateStartButton();
});

// Difficulty selection
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

// Start Quiz
startButton.addEventListener('click', () => {
    const quizConfig = {
        topic: selectedTopic,
        count: questionCount,
        difficulty: selectedDifficulty
    };

    localStorage.setItem('quizConfig', JSON.stringify(quizConfig));

    quizSetup.style.display = 'none';
    quizSection.style.display = 'block';
    questionCounter.style.display = 'block';

    current = 0;
    score = 0;
    questions = [];
    canProceed = false;

    loadNextQuestion();
});

// Fetch Question from Backend
async function fetchQuestion() {
    try {
        const response = await fetch('http://localhost:8000/quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                topic: selectedTopic,
                count: questionCount,
                difficulty: selectedDifficulty
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const quiz = await response.json();
        return quiz;
    } catch (error) {
        console.error('Error fetching question:', error);
        questionText.textContent = "Error loading question. Please make sure the backend server is running.";
        return null;
    }
}

// Load the next question
async function loadNextQuestion() {
    if (savedQuiz.length < questionCount) {
        const quiz = await fetchQuestion();
        if (quiz) {
            savedQuiz.push(quiz);
            questions.push(quiz);
            showQuestion(current);
        }
    } else {
        const quiz = savedQuiz[current];
        questions.push(quiz);
        showQuestion(current);
    }
}

// Display question
function showQuestion(index) {
    if (index >= questions.length) return;

    canProceed = false;
    nextButton.classList.remove('visible');
    resultButtons.classList.remove('visible');
    nextButton.textContent = 'Next';

    questionCounter.textContent = `Question ${index + 1}/${questionCount}`;

    const q = questions[index];
    questionText.textContent = q.question;
    optionsContainer.innerHTML = "";
    optionsContainer.style.display = "flex";
    optionsContainer.style.flexDirection = "column";
    optionsContainer.style.gap = "12px";

    q.options.forEach((opt, i) => {
        const div = document.createElement("div");
        div.className = "option";
        div.textContent = `${String.fromCharCode(65 + i)}. ${opt}`;
        div.onclick = () => checkAnswer(div, i === q.answer);
        optionsContainer.appendChild(div);
    });
}

// Handle answer selection
function checkAnswer(element, isCorrect) {
    if (canProceed) return;

    const options = document.querySelectorAll('.option');
    options.forEach(opt => opt.onclick = null);

    element.classList.add(isCorrect ? 'correct' : 'incorrect');

    if (!isCorrect) {
        options[questions[current].answer].classList.add('show-correct');
    }

    if (isCorrect) score++;

    canProceed = true;
    nextButton.textContent = (current === questionCount - 1) ? 'Finish' : 'Next';
    nextButton.classList.add('visible');
}

// Get result feedback message
function getFeedback(score, total) {
    const percentage = (score / total) * 100;
    if (percentage <= 40) return "You're trash 😬";
    if (percentage <= 60) return "meh";
    if (percentage <= 70) return "Not bad 👍";
    if (percentage <= 90) return "Excellent! 🔥";
    return "Perfect score! You're a QuizMaster 🏆";
}

// Display final score and feedback
function showResults() {
    questionText.style.display = "none";
    optionsContainer.style.display = "none";
    questionCounter.style.display = "none";
    nextButton.classList.remove('visible');
    scoreContainer.style.display = "block";
    resultButtons.classList.add('visible');

    scoreContainer.textContent = `Your Score: ${score} / ${questionCount}`;
    feedbackContainer.textContent = getFeedback(score, questionCount);
    feedbackContainer.style.display = "block";
}

// Next button logic
nextButton.addEventListener('click', async () => {
    if (!canProceed) return;

    if (current === questionCount - 1 && nextButton.textContent === 'Finish') {
        showResults();
        return;
    }

    current++;
    if (current < questionCount) {
        await loadNextQuestion();
    }
});

// Restart Quiz
restartQuizButton.addEventListener('click', async () => {
    current = 0;
    score = 0;
    questions = [];
    canProceed = false;

    questionText.style.display = "block";
    optionsContainer.style.display = "flex";
    scoreContainer.style.display = "none";
    feedbackContainer.style.display = "none";
    feedbackContainer.textContent = "";
    nextButton.classList.remove('visible');
    resultButtons.classList.remove('visible');
    questionCounter.style.display = 'block';

    await loadNextQuestion();
});

// Start a brand new quiz
newQuizButton.addEventListener('click', () => {
    savedQuiz = [];
    current = 0;
    score = 0;
    questions = [];
    canProceed = false;

    selectedTopic = null;
    questionCount = 5;
    selectedDifficulty = null;

    topicButtons.forEach(btn => btn.classList.remove('selected'));
    questionCountSlider.value = 5;
    questionCountValue.textContent = '5';
    difficultyButtons.forEach(btn => btn.classList.remove('selected'));
    startButton.disabled = true;

    questionText.style.display = "block";
    optionsContainer.style.display = "none";
    scoreContainer.style.display = "none";
    feedbackContainer.style.display = "none";
    feedbackContainer.textContent = "";
    nextButton.classList.remove('visible');
    resultButtons.classList.remove('visible');
    optionsContainer.innerHTML = "";

    quizSection.style.display = 'none';
    quizSetup.style.display = 'block';
    questionCounter.style.display = 'none';
});
