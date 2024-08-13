# Terraform UI Generator

## Table of Contents
1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Docker Setup](#docker-setup)
5. [Usage](#usage)
6. [API Endpoints](#api-endpoints)
7. [Troubleshooting](#troubleshooting)
8. [Contributing](#contributing)

## Introduction

The Terraform UI Generator is a web application that allows users to generate Terraform configurations through an intuitive user interface. It scrapes Terraform documentation to provide up-to-date resource options and generates Terraform code based on user selections.

## Prerequisites

- Python 3.11+
- Node.js 16+
- Redis (for caching)
- Git

## Installation

### Backend Setup

1. Clone the repository:
   ```
   git clone https://github.com/your-username/terraform-ui-generator.git
   cd terraform-ui-generator
   ```

2. Set up a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   ```

3. Install the required Python packages:
   ```
   pip install -r requirements.txt
   ```

4. Start the Redis server:
   ```
   redis-server
   ```

5. Run the Flask application:
   ```
   python app.py
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install the required npm packages:
   ```
   npm install
   ```

3. Start the React development server:
   ```
   npm start
   ```

The application should now be running at `http://localhost:3000`.

## Docker Setup

To run the application using Docker, follow these steps:

1. Create a `Dockerfile` in the root directory of your project:

```dockerfile
# Use an official Python runtime as the base image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy the backend requirements file into the container
COPY requirements.txt .

# Install the backend dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code into the container
COPY app.py .

# Install Node.js and npm
RUN apt-get update && apt-get install -y nodejs npm

# Copy the frontend code into the container
COPY frontend ./frontend

# Install the frontend dependencies
WORKDIR /app/frontend
RUN npm install

# Build the frontend
RUN npm run build

# Move back to the app root
WORKDIR /app

# Copy the start script
COPY start.sh .
RUN chmod +x start.sh

# Expose the port the app runs on
EXPOSE 5000

# Start the application
CMD ["./start.sh"]
```

2. Create a `start.sh` script in the root directory:

```bash
#!/bin/bash
# Start the Flask app in the background
python app.py &

# Wait for the Flask app to start
sleep 5

# Serve the React app using a simple HTTP server
cd frontend/build
python -m http.server 3000
```

3. Build the Docker image:
   ```
   docker build -t terraform-ui-generator .
   ```

4. Run the Docker container:
   ```
   docker run -p 5000:5000 -p 3000:3000 terraform-ui-generator
   ```

The application should now be accessible at `http://localhost:3000`.

## Usage

1. Open a web browser and navigate to `http://localhost:3000`.
2. Select a Terraform resource from the dropdown menu.
3. Choose the desired options for the selected resource.
4. Click the "Generate Terraform" button.
5. The generated Terraform code will appear in the output section.

## Multi-Provider Support

The Terraform UI Generator now supports multiple cloud providers:

- Amazon Web Services (AWS)
- Microsoft Azure
- Google Cloud Platform (GCP)

### Usage with Multiple Providers

1. Open the application in your web browser.
2. Select a cloud provider from the dropdown menu.
3. Choose a Terraform resource specific to the selected provider.
4. Select the desired options for the chosen resource.
5. Click the "Generate Terraform" button to create the Terraform code.

The generated code will be specific to the selected provider and resource.

### API Changes

- The `/api/resources` endpoint now returns resources for all supported providers.
- The `/api/generate` endpoint expects a `provider` field in the request JSON, in addition to the `resource` and `options` fields.

## Troubleshooting

- If you encounter CORS issues, ensure that the backend allows requests from the frontend's origin.
- If the Redis cache is not working, check that the Redis server is running and accessible.
- For any "Module not found" errors in the frontend, try running `npm install` again.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



### Note on Resource Coverage

The availability and completeness of resources may vary between providers. This tool scrapes the official Terraform documentation for each provider, so the available resources and options reflect the current state of that documentation.