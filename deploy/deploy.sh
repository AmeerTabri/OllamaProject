#!/bin/bash

# Navigate to project directory
cd /home/ameertabri/OllamaProject

# Check if virtual environment exists, create if it doesn't
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install or update Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "Installing Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh
fi

# Start Ollama service if not running
if ! systemctl is-active --quiet ollama; then
    echo "Starting Ollama service..."
    sudo systemctl start ollama
fi

# Pull the required model if not already present
echo "Checking for required model..."
if ! ollama list | grep -q "gemma3:1b"; then
    echo "Pulling gemma3:1b model..."
    ollama pull gemma3:1b
fi

# Copy service file to systemd directory
echo "Setting up systemd service..."
sudo cp deploy/ollama_app.service /etc/systemd/system/
sudo systemctl daemon-reload

# Restart the application service
echo "Restarting application service..."
sudo systemctl restart ollama_app.service

# Wait for services to start
echo "Waiting for services to start..."
sleep 5

# Health check
echo "Performing health check..."
if systemctl is-active --quiet ollama && systemctl is-active --quiet ollama_app; then
    echo "✅ All services are running"
    echo "Ollama status:"
    systemctl status ollama
    echo "Application status:"
    systemctl status ollama_app
else
    echo "❌ Service health check failed"
    exit 1
fi
