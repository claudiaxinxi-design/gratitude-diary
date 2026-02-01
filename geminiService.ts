import { GoogleGenAI, Type } from "@google/genai";
import { Entry, Badge } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getWeeklyReflection(entries: Entry[]): Promise<Partial<Badge>> {
  const model = 'gemini-3-flash-preview';
  
  // Flatten all answers to give the model context
  const allAnswers = entries.flatMap(e => e.answers).join(' ');
  const entriesSummary = entries.map(e => `Date: ${e.date}, Answers: ${e.answers.join(' | ')}`).join('\n');
  
  const prompt = `You are a quiet observer of time. 
  Your task is to identify ONE specific, concrete object or situation explicitly mentioned in the user's records below. 
  
  Rules for selection:
  1. DO NOT invent objects. The object MUST be mentioned or directly implied by the text (e.g., if they mention "coffee", the object is "a cup of coffee").
  2. DO NOT be abstract. Pick a physical thing: a book, a lamp, a window, a pair of shoes, a specific flower, a piece of fruit.
  3. This object will serve as a "Memory Anchor" for the user.
  
  Do not judge, do not encourage, do not offer advice, and do not use words like 'growth', 'improvement', or 'success'.
  
  Return the result in JSON format with keys:
  - "emoji": a simple symbolic emoji representing the object.
  - "summary": A short sentence that explicitly connects the trace back to the user's words. Start with "You mentioned..." (max 20 words).
  - "title": A concrete 2-4 word phrase naming the specific object (e.g., "The Ceramic Mug", "The Open Book", "The Morning Window").
  - "anchorObject": A clear, descriptive prompt for an image of this specific object (e.g., "A simple wooden chair by a window").
  
  Records:
  ${entriesSummary}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: 0.2, // Lower temperature for stricter adherence to the text
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            emoji: { type: Type.STRING },
            summary: { type: Type.STRING },
            title: { type: Type.STRING },
            anchorObject: { type: Type.STRING }
          },
          required: ["emoji", "summary", "title", "anchorObject"]
        }
      }
    });
    
    const data = JSON.parse(response.text || "{}");

    // Generate a concrete, memory-anchoring illustration based ONLY on the identified object
    const imagePrompt = `A quiet, minimalist colored pencil sketch of ${data.anchorObject}. 
    Style: Hand-drawn on textured, off-white sketchbook paper with visible pencil strokes and gentle imperfections.
    Palette: Desaturated, warm earthy tones (beige, muted charcoal, soft ochre). 
    Composition: A single, clear, concrete object in the center with plenty of empty negative space. 
    Focus: Ensure the object is recognizable and clear. No abstract swirls, no people, no busy backgrounds.`;
    
    const imageResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: imagePrompt }] },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    let imageUrl = "";
    for (const part of imageResponse.candidates[0].content.parts) {
      if (part.inlineData) {
        imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        break;
      }
    }

    return {
      ...data,
      imageUrl
    };
  } catch (error) {
    console.error("AI Observation error:", error);
    return {
      emoji: "🔘",
      title: "Passing Time",
      summary: "The records remain as they were written.",
      imageUrl: ""
    };
  }
}
