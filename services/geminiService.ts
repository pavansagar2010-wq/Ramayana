
import { GoogleGenAI, Type } from "@google/genai";
import { Book, SeriesLore, BookPage } from "../types";
import { MASTER_PROMPT_CONSTRAINTS } from "../constants";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  }

  async generateSeriesLore(): Promise<SeriesLore> {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Generate a comprehensive Series Lore and Reference Guide for a 20-book Ramayana comic series for kids. Include character sheets for Rama, Sita, Lakshmana, Hanuman, and Ravana, a location guide for Ayodhya and Lanka, and a props repository for celestial weapons.",
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
    // Transform title to uppercase to ensure casing consistency across all books
    const displayTitle = book.title.toUpperCase();
    
    // Standardized Prompt for Unified Style and Strict Typography
    const prompt = `A professional, high-end classical Indian comic book cover.
    MANDATORY TYPOGRAPHY: 
    - The text "${displayTitle}" must be rendered at the VERY TOP CENTER.
    - FONT: Use a LARGE, BOLD, HEAVY-WEIGHT, ALL-CAPS, CLASSICAL SERIF COMIC-BOOK FONT.
    - TEXT STYLE: The font size, weight, and style must be exactly consistent with a 20-volume series.
    - TEXT COLOR: White or Pale Cream with a thin black or gold outline for high readability.
    
    ART STYLE: "Amar Chitra Katha" hand-painted aesthetic. Warm, divine palette (Saffron, Gold, Royal Indigo, Deep Forest Green).
    TECHNIQUE: Thick ink outlines, detailed traditional clothing and jewelry, traditional Indian architecture.
    SCENE: ${book.summary}.
    VIBE: Heroic, epic, and divine.
    NO OTHER TEXT: Only the title "${displayTitle}" should be visible.`;

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
    const prompt = `Inside panel for Indian comic "${bookTitle}". Page ${page.pageNumber}: ${page.title}.
    Scene: ${page.imageDescription}.
    Style: Traditional Indian comic art, consistent with Amar Chitra Katha, detailed outfits, warm tones, cinematic lighting. Respectful and epic. English comic aesthetic.`;

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
