const { GoogleGenAI, HarmCategory, HarmBlockThreshold } = require('@google/genai');

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function createRoadmap(course, totalTime) {
  const result = await genAI.models.generateContent({
    contents: `Create a detailed learning roadmap for the topic "${course}" assuming a total available learning time of ${totalTime}. Separate the roadmap into beginner, intermediate, and advanced levels with appropriate topics and subtopics.
    IMPORTANT: Return ONLY valid JSON string without any explanatory text, markdown formatting, or code blocks. Do not include any text before or after the JSON.`,
    model: "gemini-2.0-flash",
    config: {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
      systemInstruction: `
You are an AI agent who provides good personalized learning paths based on user input.
You need to create a roadmap divided into three knowledge levels: beginner, intermediate, and advanced.
For each level, provide subtopics to learn telling what exactly to learn and how much time each subtopic will take.
Organize the roadmap into weekly chunks, for example: "week 1", "week 2", etc.
Weeks should be numbered sequentially across all levels: beginner weeks start at week 1, intermediate weeks continue after beginner weeks, and advanced weeks continue after intermediate weeks.
Give more time to subtopics that require more understanding.
One more important thing, make sure to keep every key lowercase.

IMPORTANT: Return ONLY valid JSON string without any explanatory text, markdown formatting, or code blocks. Do not include any text before or after the JSON.

Example output:
{
  "beginner": {
    "week 1": {
      "topic": "Fundamental JavaScript concepts and syntax.",
      "subtopics": [
        {
          "subtopic": "Introduction to JavaScript",
          "time": "30 minutes",
          "points": [
            "What is JavaScript?",
            "JavaScript vs. other languages",
            "Where to run JavaScript (browsers, Node.js)",
            "Setting up a development environment (text editor, browser console)"
          ]
        },
        {
          "subtopic": "Basic Syntax",
          "time": "30 minutes",
          "points": [
            "Variables (var, let, const)",
            "Data types (primitive and non-primitive)",
            "Operators (arithmetic, comparison, logical)",
            "Comments"
          ]
        }
      ]
    },
    "week 2": {
      "topic": "JavaScript control flow and functions",
      "subtopics": [
        {
          "subtopic": "DOM Manipulation",
          "time": "1.5 hours",
          "points": [
            "Introduction to the DOM",
            "Selecting elements (getElementById, getElementsByClassName, querySelector, querySelectorAll)",
            "Modifying element content (innerHTML, textContent)",
            "Modifying element attributes",
            "Adding and removing elements"
          ]
        },
        {
          "subtopic": "Events",
          "time": "1.5 hours",
          "points": [
            "Introduction to events",
            "Event listeners (addEventListener)",
            "Common events (click, mouseover, keypress)",
            "Event handling"
          ]
        }
      ]
    }
  },
  "intermediate": {
    "week 3": {
      "topic": "Deeper understanding of JavaScript concepts and practical application.",
      "subtopics": [
        {
          "subtopic": "Asynchronous JavaScript",
          "time": "1.5 hours",
          "points": [
            "Callbacks",
            "Promises",
            "Async/Await",
            "setTimeout and setInterval",
            "Handling errors with Promises and Async/Await"
          ]
        },
        {
          "subtopic": "JSON",
          "time": "1.5 hours",
          "points": [
            "JSON syntax",
            "Parsing JSON (JSON.parse)",
            "Stringifying JSON (JSON.stringify)",
            "Working with JSON data from APIs"
          ]
        }
      ]
    }
  },
  "advanced": {
    "week 4": {
      "topic": "Expert-level JavaScript knowledge and application to complex scenarios.",
      "subtopics": [
        {
          "subtopic": "Server-Side JavaScript (Node.js)",
          "time": "1.5 hours",
          "points": [
            "Introduction to Node.js",
            "NPM (Node Package Manager)",
            "Express.js (web framework)",
            "Databases (MongoDB, PostgreSQL)",
            "REST APIs",
            "Authentication and authorization"
          ]
        }
      ]
    }
  }
}
Make sure every key is lowercase like subtopics, topic, time, week 1, week 2, etc.but all values like topic names, subtopic titles, and points must use Title Case — where each word starts with a capital letter.`
    },
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE }
    ]
  });

  // const response = result.response;
  // console.log(result.text);
  const rawText = result.text;
  const cleanText = rawText.replace(/```json\n?|```\n?/g, '').trim();
  
  const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
  const jsonText = jsonMatch ? jsonMatch[0] : cleanText;
  
  return JSON.parse(jsonText);
}

module.exports = { createRoadmap };
