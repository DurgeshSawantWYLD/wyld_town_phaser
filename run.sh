#!/bin/bash

# Find an available port starting at 8000
PORT=8000
while lsof -i -P -n | grep -q ":$PORT (LISTEN)"; do
  PORT=$((PORT + 1))
done

URL="http://localhost:$PORT"

echo "========================================="
echo "🎮 Starting WYLD Interactive Town Map..."
echo "🔗 Local server: $URL"
echo "========================================="

# Open browser in the background after a 1-second delay
if [[ "$OSTYPE" == "darwin"* ]]; then
  (sleep 1 && open "$URL") &
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  (sleep 1 && xdg-open "$URL") &
else
  # Fallback for other systems / Git Bash on Windows
  (sleep 1 && start "$URL") &
fi

# Run the server
python3 -m http.server "$PORT"
