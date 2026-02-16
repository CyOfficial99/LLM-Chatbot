import requests

BASE_URL = "http://localhost:11434"
MODEL_NAME = "qwen3-coder"

def setup_ollama():
    # 1. Check installed models
    res = requests.get(f"{BASE_URL}/api/tags")
    models = [m["name"].split(":")[0] for m in res.json().get("models", [])]

    if MODEL_NAME not in models:
        print("Model not found. Pulling...")
        requests.post(
            f"{BASE_URL}/api/pull",
            json={"name": MODEL_NAME}
        )
        print("Model pulled successfully.")
    else:
        print("Model already installed.")

    return {"status": "ready"}

def check_ollama_model():
    res = requests.get(f"{BASE_URL}/api/tags")
    models = [m["name"].split(":")[0] for m in res.json().get("models", [])]
    return models[0]

def ask_ollama(prompt):
    response = requests.post(
        f"{BASE_URL}/api/generate",
        json={
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": False
        }
    )

    return response.json()["response"]
