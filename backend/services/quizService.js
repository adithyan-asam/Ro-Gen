const { GoogleGenAI, HarmCategory, HarmBlockThreshold } = require('@google/genai');

const genAI = new GoogleGenAI({apiKey: process.env.API_KEY});

async function getQuiz(subtopic, points) {
  const result = await genAI.models.generateContent({
    contents: `In a course the user is learning subtopic "${subtopic}". Create quiz on subtopic ${subtopic}. The points to be covered in the subtopic is "${points}".`,
    model: "gemini-2.0-flash",
    config: {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 20000,
      responseMimeType: 'application/json',
      systemInstruction: `You are an AI agent who provides quizzes to test understanding of user on a topic. The quiz will be based on subtopic and the points to be covered in this subtopic. Output questions in JSON format. The questions must be Multiple Choice Questions, can include calculation if necessary. Decide the number of questions based on points of the subtopic. Try to make as many questions as possible. Include questions that require deep thinking. output in format {questions:[ {question: "...", options:[...], answerIndex:"...", reason:"..."}]`,
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

module.exports = { getQuiz };

