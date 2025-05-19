#!/bin/bash

# Navigate to project directory
PROJECT_DIR="/home/ameertabri/OllamaProject"
cd "$PROJECT_DIR" || { echo "❌ Project directory not found: $PROJECT_DIR"; exit 1; }

# Ensure required packages are installed
echo "Installing system dependencies..."
sudo apt update
sudo apt install -y python3-venv python3-pip

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Install Ollama if not installed
if ! command -v ollama &> /dev/null; then
    echo "Installing Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh
fi

# Start Ollama service if not running
if ! systemctl is-active --quiet ollama; then
    echo "Starting Ollama service..."
    sudo systemctl start ollama
fi

# Pull model if not present
if ! ollama list | grep -q "gemma3:1b"; then
    echo "Pulling gemma3:1b model..."
    ollama pull gemma3:1b
fi

# Set up and restart systemd service
echo "Setting up systemd service..."
sudo cp deploy/ollama_app.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl restart ollama_app.service
sudo systemctl enable ollama_app.service

# Health check
echo "Performing health check..."
if systemctl is-active --quiet ollama && systemctl is-active --quiet ollama_app; then
    echo "✅ All services are running"
else
    echo "❌ Service health check failed"
    systemctl status ollama
    systemctl status ollama_app
    exit 1
fi
