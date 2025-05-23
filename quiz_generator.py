from ollama import chat
import json
import time

# Descriptions per topic used in the prompt
topic_descriptions = {
    "history": "about important historical events, famous figures, and major time periods.",
    "geography": "about geographical facts or identifying the capital cities of countries.",
    "physics": "about basic physics concepts, major physics figures and major laws",
    "computer-science": "about programming, data structures, algorithms, and computer history.",
    "soccer": "about soccer players, soccer teams, and soccer history.",
    "movies": "about popular films, actors, genres, and movie history.",
    "Astronomy": "about space, planets, stars, galaxies, and space missions.",
    "fashion": "about fashion trends, designers, styles, and fashion history."
}

def generate_quiz(topic="geography", count=5, difficulty="hard"):
    """Generate quiz questions from Ollama using topic, count, and difficulty."""
    messages = [
        {
            "role": "system",
            "content": f"""
                You are a quiz question generator for the topic of {topic}.
                Generate {count} multiple-choice questions {topic_descriptions.get(topic, '')}
                Each question must be in this exact format:
                Question text | Option A | Option B | Option C | Option D | Correct Option Index (0-3)

                Example:
                What is the capital of France? | London | Paris | Berlin | Madrid | 1

                Only return {count} questions — no explanations, no extra text, no numbering.
                The difficulty level of the questions should be: {difficulty}.
            """
        },
        {"role": "user", "content": f"Generate {count} questions."}
    ]

    try:
        response = chat(
            model="gemma3:4b-it-qat",
            messages=messages,
            options={"base_url": "http://localhost:11434"}
        )
        return response['message']['content']
    except Exception as e:
        print("Error fetching Ollama response:", e)
        return ""

def parse_quiz_response(raw_response: str):
    """Parse the raw Ollama response into a structured list of quiz questions."""
    try:
        lines = [line.strip() for line in raw_response.split('\n') if line.strip()]
        questions = []

        for line in lines:
            parts = [part.strip() for part in line.split('|')]
            if len(parts) != 6:
                print(f"Invalid format in line: {line}")
                continue

            questions.append({
                "question": parts[0],
                "options": parts[1:5],
                "answer": int(parts[5])
            })

        return questions
    except Exception as e:
        print("Error parsing response:", e)
        return []

def print_quiz(questions):
    """Print multiple quiz questions to the console."""
    if not questions or not isinstance(questions, list):
        print("No questions available.")
        return

    for idx, q in enumerate(questions, 1):
        print(f"\n=== QUIZ {idx} ===\n")
        print(f"Q: {q['question']}")
        for j, option in enumerate(q['options']):
            print(f"  {j+1}. {option}")
        print(f"Correct Answer: {q['options'][q['answer']]}")
        print("=" * 20)

if __name__ == "__main__":
    init_time = time.time()
    raw = generate_quiz(topic="fashion", count=5, difficulty="medium")
    print("Raw:\n", raw)
    parsed = parse_quiz_response(raw)
    print_quiz(parsed)
    finish_time = time.time()
    print(f"Time taken: {finish_time - init_time} seconds")
