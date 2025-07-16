const { GoogleGenAI, HarmCategory, HarmBlockThreshold } = require('@google/genai');

const genAI = new GoogleGenAI({apiKey: process.env.API_KEY});

async function generateResources(subtopic, points) {
  const result = await genAI.models.generateContent({
    contents: `The user is learning the subtopic "${subtopic}".The points to be covered in the subtopic are "${points}". Now 
    Please provide a list of 4-5 best resources (video, article, interactive) that each fully cover all the points. For each resource, include the type, title, url, source(titl of the site), a "covers" array listing which points from above it covers (should be all points), and a "recommendedFor" phrase describing the learner type best suited for the resource.
`,
    model: 'gemini-2.0-flash',
    config: {
      temperature: 0.9,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
      systemInstruction: `You are an expert educational content curator. Your job is to provide, for each given subtopic in a learning roadmap, a list of resources (videos, articles, interactive tutorials) that **each fully cover all the key learning points of that subtopic**.

For every resource, include:
- type (video, article, interactive, etc.)
- title
- url
- source: the title of the site
- covers: a list of the main learning points from the subtopic that this resource covers. This list must include all points in the subtopic (the resource fully covers the subtopic).
- recommendedFor: a short phrase describing which learner type the resource is best suited for (e.g., visual learners, hands-on learners, readers, etc.).

If you cannot find one resource covering all points, try to find resources that cover the maximum points possible, but always aim for resources that cover **all** points.

Format the output as a JSON array of resource objects as shown in the example.

---

Example:

Subtopic:
{
  "subtopic": "basic syntax and data types",
  "time": "3 hours",
  "points": [
    "variables (var, let, const)",
    "data types (numbers, strings, booleans, null, undefined, symbols)",
    "operators (arithmetic, comparison, logical, assignment)",
    "comments and best practices"
  ]
}

Output resources JSON:
{
  "resources": [
    {
      "type": "video",
      "title": "JavaScript Basics for Beginners",
      "url": "https://www.youtube.com/watch?v=W6NZfCO5SIk",
      "source": "YouTube",
      "covers": [
        "variables",
        "data types",
        "operators",
        "comments"
      ],
      "recommendedFor": "visual learners"
    },
    {
      "type": "article",
      "title": "JavaScript Syntax and Data Types - MDN",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types",
      "source": "MDN Web Docs",
      "covers": [
        "variables",
        "data types",
        "operators",
        "comments"
      ],
      "recommendedFor": "readers / quick reference"
    },
    {
      "type": "interactive",
      "title": "JavaScript Basics - freeCodeCamp",
      "url": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/basic-javascript/",
      "source": "Freecodecamp",
      "covers": [
        "variables",
        "data types",
        "operators",
        "comments"
      ],
      "recommendedFor": "hands-on learners"
    }
  ]
}
`,
    },
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ]
  });

  const rawText = result.text;
  const cleanText = rawText.replace(/```json\n?|```\n?/g, '').trim();

  const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
  const jsonText = jsonMatch ? jsonMatch[0] : cleanText;

  return JSON.parse(jsonText);
}

module.exports = { generateResources };

