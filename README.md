
# Conversational Image Recognition Chatbot

An Electron desktop app that uses AI to analyze images, identify objects, and answer questions with conversational follow-ups.

## Features
- Upload and preview images
- AI-powered image recognition using Groq
- Ask questions and follow-ups about images
- Chat history for the current conversation
- Input validation and error handling

## Tech Stack
HTML, CSS, JavaScript, Electron, Node.js, Groq API

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/sakshampaliwal21/image-recognition-chatbot.git
   cd image-recognition-chatbot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. Start the app:
   ```bash
   npm start
   ```


## How It Works
Upload an image, ask a question, and receive an AI-generated response. You can continue the conversation with follow-up questions about the image.
