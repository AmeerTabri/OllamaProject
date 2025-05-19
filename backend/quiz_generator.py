from ollama import chat
import json


def generate_quiz(topic="geography", count=1):
    messages = [
        {
            "role": "system",
            "content": (
                f"Generate multiple-choice questions in {topic}. "
                "The question must include 4 answer options and the correct answer index (0-based). "
                "Format your response strictly as a JSON array: "
                '[{"question": "...", "options": ["...", "...", "...", "..."], "answer": 1}, ...]'
            )
        },
        {"role": "user", "content": f"Generate {count} questions."}
    ] 

    try:
        response = chat(model="gemma3:1b", messages=messages)
        return response['message']['content']
    except Exception as e:
        print("Error fetching Ollama response:", e)
        return "[]"


def parse_quiz_response(raw_response: str): 
    try:
        return json.loads(raw_response)
    except json.JSONDecodeError as e:
        print("Initial JSON parsing failed, attempting to fix common issues...")
        
        # Try to clean up the response
        cleaned_response = raw_response.strip('` \n')  # remove backticks, newlines, spaces
        
        # Try to find JSON array content
        start = cleaned_response.find('[')
        end = cleaned_response.rfind(']') + 1
        if start != -1 and end != 0:
            json_str = cleaned_response[start:end]
            try:
                return json.loads(json_str)
            except json.JSONDecodeError as e2:
                print("Failed to parse extracted JSON:", e2)
                print("Extracted content was:", json_str)
         
        return []


def print_quiz(questions):
    if not questions:
        print("No questions available.")
        return
    
    print("\n=== QUIZ ===")
    for i, q in enumerate(questions, 1):
        print(f"\nQuestion {i}:")
        print(f"Q: {q['question']}")
        for j, option in enumerate(q['options']):
            print(f"  {j+1}. {option}")
        print(f"Correct Answer: {q['options'][q['answer']]}")
        print("\n" + "="*12) 



if __name__ == "__main__":
    raw = generate_quiz()
    print("raw: \n", raw)
    parsed = parse_quiz_response(raw)
    print("parsed: \n", parsed)
    print_quiz(parsed)