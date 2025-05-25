cd ~/OllamaProject

# Step 1: Install Ollama if not installed
if ! command -v ollama &> /dev/null; then
  echo "Installing Ollama..."
  curl -fsSL https://ollama.com/install.sh | sh
fi

# Step 2: Configure Ollama to listen on all interfaces (optional but recommended)
sudo mkdir -p /etc/systemd/system/ollama.service.d
echo "[Service]
Environment=\"OLLAMA_HOST=0.0.0.0\"" | sudo tee /etc/systemd/system/ollama.service.d/override.conf > /dev/null

# Step 3: Start service and pull model
sudo systemctl daemon-reexec
sudo systemctl daemon-reload
sudo systemctl restart ollama
sleep 2
ollama pull mistral

# Step 4: Health check
if ! systemctl is-active --quiet ollama; then
  echo "❌ ollama.service is not running."
  sudo systemctl status ollama --no-pager
  exit 1
else
  echo "✅ ollama.service is running."
fi
