let selectedTopic = null;
let questionCount = 5;
let selectedDifficulty = null;

const topicButtons = document.querySelectorAll('.topic-btn');
const questionCountSlider = document.getElementById('questionCount');
const questionCountValue = document.getElementById('questionCountValue');
const startButton = document.getElementById('startQuiz');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');

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
    
    // Redirect to the quiz page
    window.location.href = 'quiz.html';
}); 