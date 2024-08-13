#!/bin/bash
# Start the Flask app in the background
python app.py &

# Wait for the Flask app to start
sleep 5

# Serve the React app using a simple HTTP server
cd frontend/build
python -m http.server 3000