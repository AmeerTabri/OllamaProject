// Quiz Setup Variables
let selectedTopic = null;
let questionCount = 5;
let selectedDifficulty = null;

// Quiz Variables
let current = 0;
let score = 0;
let questions = [];
let canProceed = false;

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

startButton.addEventListener('click', () => {
    const quizConfig = {
        topic: selectedTopic,
        count: questionCount,
        difficulty: selectedDifficulty
    };
    
    // Store the configuration in localStorage
    localStorage.setItem('quizConfig', JSON.stringify(quizConfig));
    
    // Hide setup and show quiz
    quizSetup.style.display = 'none';
    quizSection.style.display = 'block';
    questionCounter.style.display = 'block';
    
    // Reset quiz state for new quiz
    current = 0;
    score = 0;
    questions = [];
    canProceed = false;
    
    // Start the quiz
    loadNextQuestion();
});

async function fetchQuestion() {
    try {
        const response = await fetch('http://localhost:8000/quiz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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
        console.log('Received quiz:', quiz);
        return quiz;
    } catch (error) {
        console.error('Error fetching question:', error);
        questionText.textContent = "Error loading question. Please make sure the backend server is running.";
        return null;
    }
}


async function loadNextQuestion() {
    const quiz = await fetchQuestion();
    if (quiz) {
        questions.push(quiz);
        showQuestion(current);
    } else {
        questionText.textContent = "Error loading question. Please try again.";
    }
}

function showQuestion(index) {
    if (index >= questions.length) {
        return;
    }

    // Reset state
    canProceed = false;
    nextButton.classList.remove('visible');
    resultButtons.classList.remove('visible');
    nextButton.textContent = 'Next';

    // Update question counter
    questionCounter.textContent = `Question ${index + 1}/${questionCount}`;

    const q = questions[index];
    questionText.textContent = q.question;
    
    // Clear and reset options container
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

    if (current === questionCount - 1) {
        nextButton.textContent = 'Finish';
        nextButton.classList.add('visible');
    } else {
        nextButton.textContent = 'Next';
        nextButton.classList.add('visible');
    }
}

function showResults() {
    questionText.style.display = "none";
    optionsContainer.style.display = "none";
    questionCounter.style.display = "none";
    nextButton.classList.remove('visible');
    scoreContainer.style.display = "block";
    resultButtons.classList.add('visible');
    scoreContainer.textContent = `Your Score: ${score} / ${questionCount}`;
}

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

newQuizButton.addEventListener('click', () => {
    // Reset quiz state
    current = 0;
    score = 0;
    questions = [];
    canProceed = false;
    
    // Reset setup state
    selectedTopic = null;
    questionCount = 5;
    selectedDifficulty = null;
    
    // Reset UI elements
    topicButtons.forEach(btn => btn.classList.remove('selected'));
    questionCountSlider.value = 5;
    questionCountValue.textContent = '5';
    difficultyButtons.forEach(btn => btn.classList.remove('selected'));
    startButton.disabled = true;
    
    // Reset quiz section
    questionText.style.display = "block";
    optionsContainer.style.display = "none";
    scoreContainer.style.display = "none";
    nextButton.classList.remove('visible');
    resultButtons.classList.remove('visible');
    
    // Clear any existing options
    optionsContainer.innerHTML = "";
    
    // Show setup and hide quiz
    quizSection.style.display = 'none';
    quizSetup.style.display = 'block';
    questionCounter.style.display = 'none';
});

restartQuizButton.addEventListener('click', () => {
    // Reset quiz state
    current = 0;
    score = 0;
    questions = [];
    canProceed = false;
    
    // Start new quiz with same config
    loadNextQuestion();
});