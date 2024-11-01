import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function generateQuestions(content: string, count: number = 5): Promise<string[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  
  const prompt = `Analyze the following content and generate ${count} challenging questions. 
    Detect the language of the content and generate questions in the same language.
    Make questions that test deep understanding and critical thinking.
    
    Content: ${content}
    
    Format each question on a new line without numbering.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text().split('\n').filter(q => q.trim());
}

export interface FeedbackResponse {
  isCorrect: boolean;
  feedback: string;
  improvement?: string;
}

export async function evaluateAnswer(
  question: string,
  answer: string,
  context: string
): Promise<FeedbackResponse> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  
  const prompt = `Question: ${question}
    User's Answer: ${answer}
    Context: ${context}
    
    Evaluate the answer and provide a response in this exact JSON format without any additional formatting or escape characters:
    {
      "isCorrect": boolean,
      "feedback": "detailed feedback here and the correct answer",
      "improvement": "improvement suggestion for the user for how to avoid making the same mistake here or null if the answer is correct"
    }
    
    Make sure the feedback explains what was good or what was missing.
    Respond in the same language as the question.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  
  try {
    // Remove code blocks
    const cleanedText = response.text()
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const parsedResponse = JSON.parse(cleanedText) as FeedbackResponse;

    return {
      isCorrect: Boolean(parsedResponse.isCorrect),
      feedback: String(parsedResponse.feedback),
      improvement: parsedResponse.improvement ? String(parsedResponse.improvement) : undefined
    };
  } catch (error) {
    console.error('Error parsing Gemini response:', error);

    return {
      isCorrect: false,
      feedback: "Impossible d'évaluer la réponse. Veuillez réessayer.",
      improvement: "Veuillez fournir une réponse claire et détaillée qui répond directement à la question."
    };
  }
}