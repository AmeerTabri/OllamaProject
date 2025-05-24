cd ~/OllamaProject

# Step 1: Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
  echo "Creating virtual environment..."
  sudo apt update
  sudo apt install python3.12-venv -y
  python3 -m venv .venv
fi

# Step 2: Activate venv and install dependencies
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Step 3: Copy your app's systemd service file
sudo cp app.service /etc/systemd/system/

# Step 4: Reload and restart the app service
sudo systemctl daemon-reload
sudo systemctl restart app.service
sudo systemctl enable app.service

# Step 5: Health check
if ! systemctl is-active --quiet app; then
  echo "❌ app.service is not running."
  sudo systemctl status app --no-pager
  exit 1
else
  echo "✅ app.service is running."
fi
