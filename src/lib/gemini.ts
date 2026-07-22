import { GoogleGenAI } from '@google/genai';
import { RECRUITABLE_KEYWORDS } from '../constants/keywords';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

// Initialize without crashing if key is missing, handle errors at call time.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const extractKeywordsFromResume = async (resumeText: string): Promise<string[]> => {
  if (!ai) {
    console.error("Gemini API key is not configured.");
    return [];
  }

  const prompt = `Analyze the following resume text and return a JSON array containing ONLY the top matching skill keywords from our canonical list: ${JSON.stringify(RECRUITABLE_KEYWORDS)}. Resume text: ${resumeText}`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
        }
    });

    const textResponse = response.text;
    if (!textResponse) return [];

    // Parse the JSON array
    let keywords: string[] = [];
    try {
        keywords = JSON.parse(textResponse);
    } catch (e) {
        console.error("Failed to parse Gemini response as JSON", e);
        // Fallback: try to match keywords via regex if JSON parsing fails
        keywords = RECRUITABLE_KEYWORDS.filter(kw => textResponse.includes(kw));
    }

    // Ensure all returned keywords are actually in our canonical list
    return keywords.filter(kw => RECRUITABLE_KEYWORDS.includes(kw));
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return [];
  }
};

export const generateInterviewResponse = async (jobRole: string, chatHistory: {role: 'user' | 'model', parts: [{text: string}]}[]): Promise<string> => {
   if (!ai) return "I am unable to connect to the AI service right now.";

   const systemInstruction = `You are a professional hiring manager conducting an interview for the role of ${jobRole}. Ask relevant technical and behavioral questions. Be concise and professional.`;

   try {
     const response = await ai.models.generateContent({
         model: 'gemini-2.5-flash',
         contents: chatHistory,
         config: {
             systemInstruction: systemInstruction,
         }
     });

     return response.text || "Could you please elaborate on that?";
   } catch (error) {
       console.error("Interview API error:", error);
       return "I'm having trouble understanding you. Could you repeat that?";
   }
};

export const getCareerMentorResponse = async (userContext: any, message: string): Promise<string> => {
   if (!ai) return "Career mentor AI is offline.";

   const systemInstruction = `You are a helpful career mentor for "intern." platform. The user's details are: Name: ${userContext.name}, Role: ${userContext.role}, Skills: ${userContext.parsed_keywords?.join(', ')}. Provide concise, actionable advice.`;

   try {
       const response = await ai.models.generateContent({
           model: 'gemini-2.5-flash',
           contents: message,
           config: {
               systemInstruction: systemInstruction
           }
       });
       return response.text || "I'm here to help!";
   } catch (error) {
       console.error("Mentor API error:", error);
       return "I encountered an error providing advice.";
   }
}
