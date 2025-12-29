
import { GoogleGenAI, Type } from "@google/genai";
import { Book, SeriesBible, BookPage } from "../types";
import { MASTER_PROMPT_CONSTRAINTS } from "../constants";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  }

  async generateSeriesBible(): Promise<SeriesBible> {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Generate a comprehensive Series Bible for a 20-book Ramayana comic series for kids. Include character sheets for Rama, Sita, Lakshmana, Hanuman, and Ravana, a location bible for Ayodhya and Lanka, and a props bible for celestial weapons.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            characters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  visuals: { type: Type.STRING }
                },
                required: ["name", "description", "visuals"]
              }
            },
            locations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["name", "description"]
              }
            },
            props: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["name", "description"]
              }
            }
          },
          required: ["characters", "locations", "props"]
        }
      }
    });

    return JSON.parse(response.text);
  }

  async generateBookPages(book: Book): Promise<BookPage[]> {
    const prompt = `Generate a full 24-page comic script for Book ${book.id}: ${book.title}.
    Summary: ${book.summary}
    Key Beats: ${book.beats.join(", ")}
    ${MASTER_PROMPT_CONSTRAINTS}`;

    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              pageNumber: { type: Type.NUMBER },
              title: { type: Type.STRING },
              imageDescription: { type: Type.STRING },
              narration: { type: Type.STRING },
              dialogue: { type: Type.STRING },
              vocabularyNote: { type: Type.STRING }
            },
            required: ["pageNumber", "title", "imageDescription", "narration", "dialogue"]
          }
        }
      }
    });

    return JSON.parse(response.text);
  }

  async paintCover(book: Book): Promise<string> {
    const prompt = `A classic Indian comic book cover art for the Ramayana. Book Title: "${book.title}". 
    Scene: ${book.summary}. 
    Style: Hand-drawn lines, warm earthy palette (saffron, indigo, forest green), detailed jewelry, cinematic lighting, traditional architecture. No text, no 3D, no neon. High quality illustration.`;

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("Failed to generate image");
  }

  async generatePageImage(page: BookPage, bookTitle: string): Promise<string> {
    const prompt = `Classic Indian comic panel art for "${bookTitle}". Page ${page.pageNumber}: ${page.title}.
    Scene: ${page.imageDescription}.
    Style: Traditional Indian comic art, detailed outfits, warm tones, cinematic lighting, non-childish, respectful. High clarity.`;

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    return "https://picsum.photos/800/450"; // Fallback
  }
}
