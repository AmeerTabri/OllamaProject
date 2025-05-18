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
