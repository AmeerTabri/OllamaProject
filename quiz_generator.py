import os
import time
import json
from openai import OpenAI

# Create client with API key
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Descriptions per topic used in the prompt
topic_descriptions = {
    "history": "about important historical events, famous figures, and major time periods.",
    "geography": "about geographical facts or identifying the capital cities of countries.",
    "physics": "about basic physics concepts, major physics figures and major laws",
    "computer-science": "about programming, data structures, algorithms, and computer history.",
    "soccer": "about soccer players, soccer teams, and soccer history.",
    "movies": "about popular films, actors, genres, and movie history.",
    "Astronomy": "about space, planets, stars, galaxies, and space missions.",
    "fashion": "about fashion trends, brands, styles, and fashion history."
}

topic_examples = {
    "history": "Who was the first President of the United States? | George Washington | Abraham Lincoln | Thomas Jefferson | John Adams | 0",
    "geography": "What is the capital of France? | London | Paris | Berlin | Madrid | 1",
    "physics": "What is the unit of force? | Newton | Joule | Watt | Pascal | 0",
    "computer-science": "Which data structure uses LIFO? | Queue | Tree | Stack | Graph | 2",
    "soccer": "Who won the UEFA Champions League in 2007? | AC Milan | Liverpool | Barcelona | Real Madrid | 0",
    "movies": "Which movie won Best Picture in 1994? | Titanic | Forrest Gump | Pulp Fiction | The Shawshank Redemption | 1",
    "Astronomy": "Which planet has the most moons? | Earth | Mars | Jupiter | Saturn | 3",
    "fashion": "Which designer pioneered the 'New Look' in post-WWII fashion? | Coco Chanel | Christian Dior | Giorgio Armani | Yves Saint Laurent | 1"
}

def generate_quiz(topic="geography", count=5, difficulty="medium"):
    prompt = f"""
    You are a quiz generator for the topic of {topic}.
    Generate {count} multiple-choice questions {topic_descriptions.get(topic, '')}
    Each question must be in this exact format:
    Question text | Option A | Option B | Option C | Option D | Correct Option Index (0-3)

    Example:
    {topic_examples.get(topic)}

    Only return {count} questions — no explanations, no extra text, no numbering.
    The difficulty level of the questions should be: {difficulty}.
    """

    try:
        start = time.time()
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful quiz generator."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        elapsed = time.time() - start
        print(f"Time taken: {elapsed:.2f} seconds")

        return response.choices[0].message.content
    except Exception as e:
        print("Error fetching ChatGPT response:", e)
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
    start_time = time.time()
    raw = generate_quiz(topic="physics", count=5, difficulty="hard")
    print("Raw:\n", raw)
    parsed = parse_quiz_response(raw)
    print_quiz(parsed)
    print(f"Total time: {time.time() - start_time:.2f} seconds")
