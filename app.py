import os
import subprocess
import sys
from threading import Thread

def run_frontend():
    os.chdir('./frontend')
    subprocess.run(['npm', 'start'], check=True)

def run_backend():
    os.chdir('./backend')
    subprocess.run(['python', 'app.py'], check=True)

if __name__ == '__main__':
    # Start the backend
    backend_thread = Thread(target=run_backend)
    backend_thread.start()

    # Start the frontend
    frontend_thread = Thread(target=run_frontend)
    frontend_thread.start()

    try:
        # Wait for both threads to complete (which they won't, unless there's an error)
        backend_thread.join()
        frontend_thread.join()
    except KeyboardInterrupt:
        print("Shutting down...")
        sys.exit(0)
    