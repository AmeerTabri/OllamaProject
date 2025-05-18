from ollama import chat
from ollama import ChatResponse

response: ChatResponse = chat(model='gemma3:1b', messages=[
    {'role': 'system', 'content': 'You are a helpful assistant that identifies which image filter a user wants to apply. Just reply with the filter name like "blur", "rotate", "segment", "contour", "concat", "salt n pepper" or "detect".'},
    {'role': 'user', 'content': 'can you turn this image clockwise?'}
])
print(response['message']['content'])  # "rotate" is expected