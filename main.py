# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.responses import JSONResponse
# from quiz_generator import generate_quiz, parse_quiz_response

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


# quiz_index = 0
# quizzes = [
#     {
#         "question": "What is the capital of France?",
#         "options": ["London", "Paris", "Berlin", "Madrid"],
#         "answer": 1
#     },
#     {
#         "question": "Which planet in our solar system has the most moons?",
#         "options": ["Venus", "Mars", "Jupiter", "Saturn"],
#         "answer": 3
#     },
#     {
#         "question": "Who is the Goat of Football?",
#         "options": ["Lionel Messi", "Cristiano Ronaldo", "Maradona", "Antony"],
#         "answer": 3
#     },
#     {
#         "question": "What is the largest mammal in the world?",
#         "options": ["African Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
#         "answer": 1
#     },
#     {
#         "question": "What is the chemical symbol for Silver?",
#         "options": ["Ag", "Au", "Cu", "Fe"],
#         "answer": 0
#     } 
# ]

# @app.get("/quiz")
# async def get_quiz():
#     global quiz_index
#     quiz = quizzes[quiz_index]
#     quiz_index = (quiz_index + 1) % len(quizzes)
#     return quiz
#     raw = generate_quiz() 
#     parsed = parse_quiz_response(raw)
#     return parsed


# # @app.get("/quiz")
# # async def get_quiz():
# #     try:
# #         print("Received request for quiz")
# #         quiz = generate_quiz()
# #         print("Generated quiz:", quiz)
        
# #         if not quiz:
# #             print("Quiz generation failed")
# #             return JSONResponse(
# #                 content={"error": "Failed to generate quiz - no questions returned"}, 
# #                 status_code=500
# #             )
        
# #         return quiz
# #     except Exception as e:
# #         print(f"Error in get_quiz endpoint: {str(e)}")
# #         return JSONResponse(
# #             content={"error": f"Failed to generate quiz: {str(e)}"}, 
# #             status_code=500
# #         )

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
    


from ollama import chat
from ollama import ChatResponse

response: ChatResponse = chat(
    model='gemma3:1b',
    messages=[
        {'role': 'system', 'content': 'Generate a quiz question asking about a country with 4 multiple choice answers to guess the corret capital. Mark the correct answer clearly.'},
        {'role': 'user', 'content': 'Generate a question now.'}
    ],
    options={'temperature': 0.8}
)

print(response['message']['content'])