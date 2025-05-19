#!/bin/bash

# Update the repository
git pull

# Install/update Python dependencies
pip install -r requirements.txt

# Restart the service
sudo systemctl restart ollama_app.service

# Check service status
sudo systemctl status ollama_app.service 