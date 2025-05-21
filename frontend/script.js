const TOTAL_QUESTIONS = 5;
let current = 0;
let score = 0;
let questions = [];
let canProceed = false;

const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const scoreContainer = document.getElementById("score-container");
const questionCounter = document.getElementById("question-counter");
const nextButton = document.getElementById("next-button");
const resultButtons = document.querySelector(".result-buttons");
const newQuizButton = document.getElementById("new-quiz-button");
const restartQuizButton = document.getElementById("restart-quiz-button");

async function fetchQuestion() {
    try {
        const response = await fetch('http://localhost:8000/quiz');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const quiz = await response.json();
        console.log('Received quiz:', quiz); // Debug log
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
    nextButton.style.display = 'none';
    resultButtons.style.display = 'none';
    nextButton.textContent = 'Next'; // Reset button text

    // Update question counter
    questionCounter.textContent = `Question ${index + 1}/${TOTAL_QUESTIONS}`;

    const q = questions[index];
    questionText.textContent = q.question;
    optionsContainer.innerHTML = "";

    q.options.forEach((opt, i) => {
        const div = document.createElement("div");
        div.className = "option";
        div.textContent = `${String.fromCharCode(65 + i)}. ${opt}`;
        div.onclick = () => checkAnswer(div, i === q.answer);
        optionsContainer.appendChild(div);
    });
}

function checkAnswer(element, isCorrect) {
    if (canProceed) return; // Prevent multiple selections

    const options = document.querySelectorAll('.option');
    options.forEach(opt => opt.onclick = null);

    element.classList.add(isCorrect ? 'correct' : 'incorrect');
    
    // If answer is incorrect, show the correct one
    if (!isCorrect) {
        options[questions[current].answer].classList.add('show-correct');
    }
    
    if (isCorrect) score++;

    canProceed = true;

    // Show appropriate button based on question number
    if (current === TOTAL_QUESTIONS - 1) {
        nextButton.textContent = 'Finish';
        nextButton.style.display = 'block';
    } else {
        nextButton.textContent = 'Next';
        nextButton.style.display = 'block';
    }
}

function showResults() {
    questionText.style.display = "none";
    optionsContainer.style.display = "none";
    questionCounter.style.display = "none";
    nextButton.style.display = "none";
    scoreContainer.style.display = "block";
    resultButtons.style.display = "flex";
    scoreContainer.textContent = `Your Score: ${score} / ${TOTAL_QUESTIONS}`;
}

nextButton.addEventListener('click', async () => {
    if (!canProceed) return;
    
    // If it's the last question and button says "Finish", show results
    if (current === TOTAL_QUESTIONS - 1 && nextButton.textContent === 'Finish') {
        showResults();
        return;
    }
    
    current++;
    if (current < TOTAL_QUESTIONS) {
        await loadNextQuestion();
    }
});

newQuizButton.addEventListener('click', () => {
    console.log('New Quiz button clicked');
});

restartQuizButton.addEventListener('click', () => {
    console.log('Restart Quiz button clicked');
});

// Start quiz
loadNextQuestion();
