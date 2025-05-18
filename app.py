from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from ollama import chat
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def generate_quiz_questions(topic="geography", count=3):
    messages = [
        {
            "role": "system",
            "content": (
                f"Generate {count} multiple-choice questions in {topic}. "
                "Each question must include 4 answer options and the correct answer index (0-based). "
                "Format your response strictly as a JSON array: "
                '[{"question": "...", "options": ["...", "...", "...", "..."], "answer": 1}, ...]'
            )
        },
        {"role": "user", "content": f"Generate {count} questions."}
    ]
    response = chat(model='gemma3:1b', messages=messages)
    try:
        return json.loads(response['message']['content'])
    except Exception:
        return []

@app.get("/quiz")
async def get_quiz():
    quiz = generate_quiz_questions()
    if not quiz:
        return JSONResponse(content={"error": "Failed to generate quiz"}, status_code=500)
    return quiz

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
