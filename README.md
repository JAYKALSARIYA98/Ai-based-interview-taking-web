# AI-Based Interview Web Application

## Overview
This project is an AI-powered interview-taking web application that evaluates both **audio** and **video** responses. It consists of a **React + Vite** frontend and two backend services: **Python** and **Node.js**.

## Project Structure
- **Backend (Node.js)**: Handles API endpoints.  
- **Backend (Python)**: Processes AI-based evaluation of audio and video.  
- **Frontend (React + Vite)**: The client-side application.

## Installation & Setup

### Backend (Node.js)
1. Navigate to the Node.js backend folder.
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the server:
   ```sh
   npm run dev
   ```
   or  
   ```sh
   node index.js
   ```

### Backend (Python)
1. Navigate to the Python backend folder.
2. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
3. Download and install **FFmpeg**.  
   - Set its path in the **environment variables**.
4. Install **CUDA** for GPU acceleration. If you are on Windows, install **cuDNN** as well. While cuDNN is optional, it enhances performance. Without CUDA, the model will run in **FP16** (half precision), leading to less accurate results. With CUDA, the model runs in **FP32** (full precision) for better accuracy.
5. Start the Python server:
   ```sh
   python app.py
   ```

### Frontend (React + Vite)
1. Navigate to the frontend folder.
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```

## Features
- **AI-powered interview evaluation**  
- **Real-time analysis of audio and video responses**  
- **Simple and easy setup**  

## Demo Video
Watch the demo video here: [AI Interview Demo](https://youtu.be/cyTJttvtTn8)

---

Let me know if you need any modifications!
