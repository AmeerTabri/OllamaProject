import subprocess
from ollama import chat
import json

topic_descriptions = {
    "history": "about important historical events, famous figures, and major time periods.",
    "geography": "geographical facts and identifying the capital cities of countries.",
    "physics": "about motion, forces, energy, waves, and basic physics concepts.",
    "computer-science": "about programming, data structures, algorithms, and computer theory.",
    "soccer": "about soccer players, soccer teams, and soccer history.",
    "movies": "about popular films, actors, genres, and movie history.",
    "Astronomy": "about space, planets, stars, galaxies, and space missions.",
    "fashion": "about fashion trends, designers, styles, and fashion history."
}


def generate_quiz(topic="geography", count=5, difficulty="easy"):
    messages = [
        {
            "role": "system",
            "content": f"""
                You are a quiz question generator for the topic of {topic}.
                Generate {count} multiple-choice questions {topic_descriptions[topic]}
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
        response = chat(model="gemma3:4b-it-qat", messages=messages)
        # print("raw response: \n", response)
        return response['message']['content']
    except Exception as e:
        print("Error fetching Ollama response:", e)
        return ""


def parse_quiz_response(raw_response: str): 
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
    """Print multiple quiz questions."""
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
    raw = generate_quiz(topic="soccer", count=1, difficulty="hard")
    print("raw: \n", raw)
    parsed = parse_quiz_response(raw)
    print_quiz(parsed)
