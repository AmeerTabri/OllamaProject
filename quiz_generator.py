import subprocess
from ollama import chat
import json

topic_descriptions = {
    "history": "Generate questions about important historical events, famous leaders, ancient civilizations, and world-changing moments.",
    "geography": "Generate questions about countries, continents, landmarks, world maps, and physical geography such as rivers and mountains.",
    "physics": "Generate conceptual and factual questions related to physics topics such as motion, forces, energy, electricity, and famous physicists.",
    "computer-science": "Generate questions related to programming, algorithms, data structures, computer architecture, and basic theory.",
    "soccer": "Generate football-related questions about players, teams, World Cups, leagues, and game rules.",
    "capitals": "Generate questions that ask for the capital cities of countries from all around the world.",
    "Astronomy": "Generate questions about planets, stars, galaxies, space exploration, and basic astrophysics.",
    "fashion": "Generate questions about clothing styles, fashion history, designers, trends, and global fashion capitals."
}


def generate_quiz(topic="geography", count=5):
    messages = [
        {
            "role": "system",
            "content": f"""
                You are a quiz question generator in the topic of {topic}.
                Generate {count} multiple-choice questions.
                Each question should be on a **new line** in the following format:
                Question text | Option A | Option B | Option C | Option D | Correct Option Index (0-3)

                Example:
                What is the capital of France? | London | Paris | Berlin | Madrid | 1

                Only return {count} lines — no explanations, no numbering, no extra text.
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
        # Split response into lines and filter out empty lines
        lines = [line.strip() for line in raw_response.split('\n') if line.strip()]
        
        questions = []
        for line in lines:
            # Split by pipe and strip whitespace
            parts = [part.strip() for part in line.split('|')]
            
            if len(parts) != 6:
                print(f"Invalid format in line: {line}")
                continue
                
            questions.append({
                "question": parts[0],
                "options": parts[1:5],
                "answer": int(parts[5])
            })
        
        # Return the first question if any were parsed successfully
        return questions[0] if questions else {}
        
    except Exception as e:
        print("Error parsing response:", e)
        return {}


def print_quiz(question):
    """Print the quiz question in a nicely formatted way."""
    if not question or not isinstance(question, dict):
        print("No question available.")
        return

    print("\n=== QUIZ ===\n")
    print(f"Q: {question['question']}")
    for j, option in enumerate(question['options']):
        print(f"  {j+1}. {option}")
    print(f"Correct Answer: {question['options'][question['answer']]}")
    print("\n" + "="*12)


if __name__ == "__main__":
    raw = generate_quiz(topic="soccer", count=5)
    print("raw: \n", raw)
    # parsed = parse_quiz_response(raw)
    # print("parsed: \n", parsed)
    # print_quiz(parsed)