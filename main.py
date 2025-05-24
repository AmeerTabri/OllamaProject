from flask import Flask, jsonify, render_template, request
from flask_cors import CORS
from quiz_generator import generate_quiz, parse_quiz_response

app = Flask(__name__)
CORS(app)

quiz_index = 0
quizzes = [
    {
        "question": "What is the capital of France?",
        "options": ["London", "Paris", "Berlin", "Madrid"],
        "answer": 1
    },
    {
        "question": "Which planet in our solar system has the most moons?",
        "options": ["Venus", "Mars", "Jupiter", "Saturn"],
        "answer": 3
    },
    {
        "question": "Who is the Goat of Football?",
        "options": ["Lionel Messi", "Cristiano Ronaldo", "Maradona", "Antony"],
        "answer": 3
    },
    {
        "question": "What is the largest mammal in the world?",
        "options": ["African Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
        "answer": 1
    },
    {
        "question": "What is the chemical symbol for Silver?",
        "options": ["Ag", "Au", "Cu", "Fe"],
        "answer": 0
    }
]

@app.route("/")
def index():
    return render_template("index.html")


# @app.route("/quiz", methods=["POST"])
# def get_quiz():
#     data = request.get_json()
#     count = int(data.get("count", 5))

#     # Loop back to start if count exceeds available questions
#     result = [quizzes[(quiz_index + i) % len(quizzes)] for i in range(count)]

#     global quiz_index
#     quiz_index = (quiz_index + count) % len(quizzes)

#     return jsonify(result) 


@app.route("/quiz", methods=["POST"])
def get_quiz():
    data = request.get_json()
    topic = data.get("topic")
    difficulty = data.get("difficulty")
    count = int(data.get("count", 5))

    raw = generate_quiz(topic=topic, count=count, difficulty=difficulty)
    parsed = parse_quiz_response(raw)
    return jsonify(parsed)  # parsed should be a list of question dicts
 

@app.get("/health")
def health(): 
    return {"status": "ok"}
 

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8000)

