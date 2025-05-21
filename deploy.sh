#!/bin/bash

cd ~/OllamaProject

# Step 1: Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
  echo "Creating virtual environment..."
  python3 -m venv .venv
fi

# Step 2: Activate venv and install dependencies
source .venv/bin/activate
pip install --upgrade pip

if [ -f requirements.txt ]; then
  pip install -r requirements.txt
fi

# Step 3: Install Ollama if not installed
if ! command -v ollama &> /dev/null; then
  echo "Installing Ollama..."
  curl -fsSL https://ollama.com/install.sh | sh
fi

# Step 4: Start Ollama service and pull model
echo "Starting Ollama service..."
sudo systemctl start ollama
sleep 2
ollama pull gemma3:1b

# Step 5: Copy your app's systemd service file
sudo cp ollama_app.service /etc/systemd/system/

# Step 6: Reload and restart the app service
sudo systemctl daemon-reload
sudo systemctl restart ollama_app.service
sudo systemctl enable ollama_app.service

# Step 7: Health check
for service in ollama ollama_app; do
  if ! systemctl is-active --quiet "$service.service"; then
    echo "❌ $service.service is not running."
    sudo systemctl status "$service.service" --no-pager
    exit 1
  else
    echo "✅ $service.service is running."
  fi
done