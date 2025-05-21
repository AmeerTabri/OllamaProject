from ollama import chat
import json


def generate_quiz(topic="geography"):
    messages = [
        {
            "role": "system",
            "content": f'Generate a multiple-choice question in {topic}. '
                    'Format your response in this exact format: '
                    'question | optionA | optionB | optionC | optionD | the index of the correct option (0-based)'
                    'Example: What is the capital of France? | London | Paris | Berlin | Madrid | 1'
        },
        {"role": "user", "content": "Generate one question."}
    ] 

    try:
        response = chat(model="gemma3:1b", messages=messages)
        return response['message']['content']
    except Exception as e:
        print("Error fetching Ollama response:", e)
        return ""


def parse_quiz_response(raw_response: str): 
    try:
        # Split by pipe and strip whitespace
        parts = [part.strip() for part in raw_response.split('|')]
        
        if len(parts) != 6:
            print("Invalid format: expected 6 parts separated by |")
            return {}
            
        return {
            "question": parts[0],
            "options": parts[1:5],
            "answer": int(parts[5])
        }
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
    raw = generate_quiz()
    print("raw: \n", raw)
    parsed = parse_quiz_response(raw)
    print("parsed: \n", parsed)
    print_quiz(parsed)