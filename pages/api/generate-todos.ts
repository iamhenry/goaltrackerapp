import { NextApiRequest, NextApiResponse } from 'next';
import Groq from 'groq-sdk';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  try {
    const stream = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Create work back time line accomplish the goal. Break up goal into detailed smaller actionable tasks and subtasks. Use SMART (Specific, Measurable, Achievable, Relevant, Time-bound) goals framework to guide you in creating tasks/subtasks
          
          Rules
          - ensure to start with day 1 
          - Split into individual days 
          - Break down the goal into smaller tasks and subtasks
          - Each task should be specific and measurable
          - Each task should be achievable and relevant
          `,
        },
        { role: "user", content: `Generate a todo list for the following goal: ${prompt}` },
      ],
      model: "llama-3.1-70b-versatile",
      stream: true,
    });

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    for await (const chunk of stream) {
      if (chunk.choices[0]?.delta?.content) {
        res.write(`data: ${JSON.stringify(chunk.choices[0].delta.content)}\n\n`);
      }
    }

    res.end();
  } catch (error) {
    console.error('Error generating todos:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}