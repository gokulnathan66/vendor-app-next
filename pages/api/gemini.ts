import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { prompt, userText } = req.body;

    if (!userText) {
      return res.status(400).json({ error: 'Text input is required' });
    }

    // Get the Gemini Pro model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    // Combine the system prompt with the user's text
    const fullPrompt = `${prompt}\n\nInput text:\n${userText}`;

    // Generate content
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse the response as JSON
    try {
      const parsedResponse = JSON.parse(text);
      return res.status(200).json({ result: parsedResponse });
    } catch (parseError) {
      // If parsing fails, return the raw text
      return res.status(200).json({ result: text });
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return res.status(500).json({ 
      error: 'Failed to process the request',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 