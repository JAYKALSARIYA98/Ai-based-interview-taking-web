import os
import whisper
import torch
from groq import Groq
import json
# Groq API key
GROQ_API_KEY = ""  # Replace with your Groq API key

# Initialize Groq client
groq_client = Groq(api_key=GROQ_API_KEY)

def transcribe_audio(audio_path):
    """Transcribe audio using OpenAI's Whisper model."""
    try:
        print("Starting transcription...")

        # Load the Whisper model
        device = "cuda" if torch.cuda.is_available() else "cpu"
        model = whisper.load_model("base").to(device)  # Use "small", "medium", or "large" for better accuracy

        # Transcribe the audio
        result = model.transcribe(audio_path)
        transcript = result["text"]

        print("Transcription successful")
        return transcript

    except Exception as e:
        print(f"Error during transcription: {e}")
        raise

def analyze_text(question, answer):
    """Analyze the transcribed text using Groq and return a JSON response."""
    try:
        print("Starting text analysis...")

        # Construct the prompt
        prompt = f"""
        
       Note:  If Nothing is given with question just give score :0 and feedback : u Didnt answered the question" , you strictly have to follow this rule.
        You are evaluating a response in a real interview. Please analyze the response for the following criteria:
1. **Relevance**: Does the answer directly address the question or topic? Is it focused and on-topic?
2. **Clarity**: Is the answer easy to understand? Is the response structured in a way that makes sense?
3. **Depth**: Does the answer provide adequate detail or context for the situation, whether technical or non-technical?
4. **Professionalism**: Is the tone and language appropriate for a professional setting? Does the candidate communicate effectively and respectfully?
#Caution: this answer is converted from an audio to text so whatever you are evaluating consider that user is answering verbally and not typing the quesion.
Provide your evaluation in JSON format with the following keys:
- "score": A score out of 10, where 10 is excellent and 1 is poor.
- "feedback": "A concise 10-15 words feedback or evaluation, focusing on the most critical aspects of the response."

Guidelines for scoring:
- **10/10**: Exceptional response that fully addresses the question, is clear, detailed, and professional.
- **7-9/10**: Good response with minor issues in clarity, relevance, or depth.
- **4-6/10**: Average response with significant issues in clarity, relevance, or depth.
- **1-3/10**: Poor response that fails to address the question, is unclear, lacks detail, or is unprofessional.
#ignore all spelling mistakes


Question: {question}
Answer: {answer}"""


        # Send the prompt to Groq
        response = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.2-3b-preview",
        )

        # Extract the content from the response
        if hasattr(response, 'choices'):
            print("----------------------------------------------------------------")
            print(response)
            print("----------------------------------------------------------------")
            analysis_content = response.choices[0].message.content  # Access the message content directly
            print("Analysis Content:", analysis_content)
        else:
            print("Error: Invalid response format")
            return {"score": "0", "feedback": "No feedback provided."}

        # Extract the JSON part from the response
        try:
            # Find the start and end of the JSON object
            json_start = analysis_content.find("{")
            json_end = analysis_content.rfind("}") + 1

            # Extract the JSON part
            json_part = analysis_content[json_start:json_end]
            print("Extracted JSON Part:", json_part)

            # Parse the JSON response
            analysis_json = json.loads(json_part)
            print("Parsed JSON:", analysis_json)

            # Extract score and feedback
            score = analysis_json.get("score", "0")
            score = min(max(score, 0), 10)
            # Default to "0" if score is missing
            feedback = analysis_json.get("feedback", "No feedback provided.")  # Default if feedback is missing
        except (json.JSONDecodeError, ValueError) as e:
            print(f"Error parsing JSON response: {e}. Using default values.")
            score = "0"
            feedback = "No feedback provided."

        return {
            "score": score,
            "feedback": feedback,
        }

    except Exception as e:
        print(f"Error during text analysis: {e}")
        return {"score": "0", "feedback": "No feedback provided."}

def process_audio(video_path, question_text):
    """Process the audio from a video file and return analysis results."""
    try:
        print("Processing audio...")

        # Create the audio directory if it doesn't exist
        audio_dir = os.path.join("uploads", "audio")
        os.makedirs(audio_dir, exist_ok=True)

        # Define the path for the converted audio file
        audio_filename = os.path.splitext(os.path.basename(video_path))[0] + ".wav"
        audio_path = os.path.join(audio_dir, audio_filename)

        # Extract audio using FFmpeg (ensure FFmpeg is installed)
        os.system(f"ffmpeg -i {video_path} -q:a 0 -map a {audio_path} -y")

        # Transcribe the audio
        transcript = transcribe_audio(audio_path)
        print("Transcript:", transcript)

        # Analyze the transcript
        analysis_result = analyze_text(question_text, transcript)
        print("Analysis Result:", analysis_result)

        # Extract the score and feedback from the analysis result
        score = analysis_result["score"]
        feedback = analysis_result["feedback"]

        # Return the results
        return {
            "transcript": transcript,
            "score": score,
            "feedback": feedback,
        }

    except Exception as e:
        print(f"Error during audio processing: {e}")
        raise

    finally:
        # Clean up: Delete the temporary audio file
        if os.path.exists(audio_path):
            os.remove(audio_path)