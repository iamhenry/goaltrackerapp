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
          content: `Create work back timeline plan for the user query. Break up goal into detailed and actionable smaller tasks and subtasks. 
          
          Rules
          - ensure to start with day 1  
          - MUST break down every single day
          - only output the code. exclude any additional text
          - MANDATE: If no timeline or due date (ie 1 month) is specified, default to 2 weeks
          - MANDATE: Use SMART: Specific, Measurable, Achievable, Relevant, Time-bound goals framework to creating tasks/subtasks
          - MANDATE: Days should be in sequential order (ie: Day 1, Day 2, Day 3, etc) NEVER grouped (ie: Day 6-7 or 8-14)
          - MANDATE: Ensure goals are extremely relevant and actionable to the user input query
          - MANDATE: Focus on creating high impact tasks

          Output Example
          - Day 1: Set Up
            * Define personal goals for learning to draw cartoons (SMART: Specific, Measurable, Achievable, Relevant, Time-bound) 
            * Gather basic drawing supplies (pencils, erasers, sketchbook) 
            * Create a dedicated drawing workspace
           
          - Day 2: Basic Drawing Skills
            * Watch tutorials on basic drawing techniques (lines, shapes) 
            * Practice drawing basic shapes (circles, squares, triangles) 
            * Complete 30-minute practice session focusing on line control
             
          - Day 3: Understanding Cartoon Style
            * Research different cartoon styles (classic, modern, anime) 
            * Choose a cartoon style to focus on 
            * Create a mood board with examples of chosen style
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