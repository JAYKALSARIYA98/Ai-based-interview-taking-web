import express from 'express';
import bodyParser from 'body-parser';
import { ChatGroq } from '@langchain/groq';
import { HumanMessage } from '@langchain/core/messages';
import cors from "cors";
// Initialize the Groq model
const model = new ChatGroq({
  apiKey: '', // Replace with your actual Groq API key
  model: 'llama-3.2-3b-preview',
});

// Create an Express application
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors())
// Middleware for parsing JSON
app.use(bodyParser.json());

// Endpoint for generating questions
app.post('/generate-questions', async (req, res) => {
  try {
    const { role, experience, industry, difficulty } = req.body;

    // Validate input
    if (!role || !experience || !industry || !difficulty) {
      return res
        .status(400)
        .json({ error: 'Missing required fields: role, experience, industry, difficulty' });
    }

    // Construct a prompt for the Groq model
    const prompt = `Generate 5 ${difficulty} level verbal , relevent and can be answered easily  questions for a mock interview for a ${role} with ${experience} years of experience in the ${industry} industry/domain/subject. The questions should focus on concepts, problem-solving, and best practices, and should not require writing code. Return only the questions, numbered and formatted clearly.
`;

    // Generate questions using the model
    const response = await model.invoke([new HumanMessage(prompt)]);

    // Extract only the questions from the response
    const questions = response.content
      .split('\n') // Split by new lines
      .filter(line => line.match(/^\d+\./)) // Filter lines that start with a number
      .map(line => line.replace(/^\d+\.\s*/, '')); // Remove the numbering

    // Return the questions to the client
    console.log(questions)
    res.json({ questions });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
