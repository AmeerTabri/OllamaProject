from flask import Flask, jsonify, send_from_directory
from ollama import chat
import os
import random

app = Flask(__name__, static_folder="frontend")

def generate_question():
    response = chat(model='gemma3:1b', messages=[
        {'role': 'system', 'content': 'Generate a geography quiz question with 4 multiple choice answers. Return only JSON with keys: question, options (list of 4), and answer (correct option).'},
        {'role': 'user', 'content': 'Create a question.'}
    ])
    try:
        data = eval(response['message']['content'])
        return {
            "question": data["question"],
            "options": data["options"],
            "answer": data["answer"]
        }
    except:
        return {
            "question": "What is the capital of France?",
            "options": ["Berlin", "Madrid", "Paris", "Rome"],
            "answer": "Paris"
        }

@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(app.static_folder, path)

@app.route("/api/question")
def api_question():
    question = generate_question()
    random.shuffle(question["options"])
    return jsonify(question)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
