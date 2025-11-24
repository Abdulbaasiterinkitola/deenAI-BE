import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CustomHttpException } from '@shared/custom.exception';
import { ChatMessage, MessageRole } from '../models/chat-message.model';
import { AIResponseType, AIReference } from '../types';

/**
 * Islamic guidelines for the AI assistant
 */
const ISLAMIC_GUIDELINES = `
You are an Islamic AI assistant. Please follow these guidelines strictly:

1. Always provide responses that are respectful, accurate, and aligned with Islamic teachings
2. Never include any blasphemy, profanity, or inappropriate language
3. If asked about sensitive topics, respond with wisdom and respect
4. Base your answers on authentic Islamic sources when possible
5. Be helpful, kind, and patient in your responses
6. If you don't know something, admit it rather than guessing
7. Always maintain a respectful tone when discussing religious matters
8. REQUIRED: Every response MUST include at least one Quran verse or Hadith reference to support your answer. This is mandatory for all responses.
`;

const STRUCTURED_RESPONSE_INSTRUCTIONS = `
Respond ONLY in valid JSON that matches the schema below (no backticks or prose):
{
  "content": "the final answer for the user in markdown-safe plain text",
  "references": [
    {
      "type": "quran",
      "surah": 2,
      "startAyah": 153,
      "endAyah": 153
    },
    {
      "type": "hadith",
      "collection": "Sahih Bukhari",
      "hadithNumber": 1,
      "bookNumber": 2,
      "chapterNumber": 3
    }
  ]
}
REQUIRED: The "references" array MUST contain at least one Quran verse or Hadith reference. This is mandatory for every response.
- For Quran: always include surah (1-114), startAyah, and endAyah (can be the same if single verse)
- For Hadith: include collection name (e.g., "Sahih Bukhari", "Sahih Muslim", "Sunan Abu Dawud", "Jami' at-Tirmidhi", "Sunan an-Nasa'i", "Sunan Ibn Majah"), hadithNumber (number or string), and optionally bookNumber and chapterNumber if available
- Include all Quran verses and Hadiths cited in your response
- Never invent references. Only include authentic references that you actually cited in your response
- If you cannot find an appropriate reference, you must still provide one that is relevant to the topic, even if it's a general verse about seeking knowledge or guidance
`;

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private readonly apiKey: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!this.apiKey) {
      this.logger.warn(
        'GEMINI_API_KEY is not configured. AI chat features will be unavailable.',
      );
    } else {
      this.initializeGemini();
    }
  }

  /**
   * Initializes the Gemini AI client
   * @throws {CustomHttpException} If API key is not configured
   */
  private initializeGemini(): void {
    if (!this.apiKey) {
      throw new CustomHttpException(
        'Gemini API key is not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-001',
    });
  }

  /**
   * Checks if Gemini API is available
   * @returns true if API key is configured, false otherwise
   */
  private isAvailable(): boolean {
    if (!this.apiKey || !this.genAI || !this.model) {
      return false;
    }
    return true;
  }

  /**
   * Generates an AI response based on the conversation history
   * @param messages - Array of chat messages (last 4 messages for context)
   * @param userMessage - The current user message
   * @returns The AI-generated response
   * @throws {CustomHttpException} If API key is not configured
   */
  async generateResponse(
    messages: ChatMessage[],
    userMessage: string,
  ): Promise<AIResponseType> {
    if (!this.isAvailable()) {
      throw new CustomHttpException(
        'Gemini API key is not configured. Please configure GEMINI_API_KEY in your environment variables.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      // Build conversation history from previous messages
      const conversationHistory = messages.map((msg) => ({
        role: msg.role === MessageRole.USER ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      // Format system instruction correctly (must be an object with parts array)
      const systemInstruction = {
        parts: [{ text: ISLAMIC_GUIDELINES }],
      };

      // Start the chat with history and system instructions
      const chat = this.model.startChat({
        history: conversationHistory,
        systemInstruction: systemInstruction,
      });

      // Send the current user message with structured response instructions
      const prompt = this.buildStructuredPrompt(userMessage);
      const result = await chat.sendMessage(prompt);
      const rawText =
        typeof result.response?.text === 'function'
          ? result.response.text()
          : '';

      if (!rawText || rawText.trim().length === 0) {
        throw new CustomHttpException(
          'Empty response from AI',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const parsedResponse = this.parseAIResponse(rawText as string);
      return parsedResponse;
    } catch (error) {
      if (error instanceof CustomHttpException) {
        this.logger.error(
          `Custom error in Gemini service: ${error.message}`,
          error.stack,
        );
        throw error;
      }

      // Log the full error details
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to generate AI response';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(`Gemini API error: ${errorMessage}`, errorStack);

      // Log additional error details if available
      if (error && typeof error === 'object') {
        this.logger.error(
          `Error details: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`,
        );
      }

      throw new CustomHttpException(
        `AI service error: ${errorMessage}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Generates a title for a chat based on the first user message
   * @param userMessage - The first user message
   * @returns A short, descriptive title (max 50 characters)
   */
  async generateTitle(userMessage: string): Promise<string> {
    if (!this.isAvailable()) {
      // Fallback to a truncated version of the message if API is not available
      this.logger.warn(
        'Gemini API not available, using fallback title generation',
      );
      return userMessage.length > 50
        ? userMessage.substring(0, 47) + '...'
        : userMessage;
    }

    try {
      const prompt = `Based on this user message, generate a short, descriptive title (maximum 50 characters) for an Islamic chat conversation. The title should be concise and reflect the main topic. Only return the title, nothing else.

User message: "${userMessage}"

Title:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text() as string;

      if (!text || text.trim().length === 0) {
        // Fallback to a truncated version of the message
        return userMessage.length > 50
          ? userMessage.substring(0, 47) + '...'
          : userMessage;
      }

      let title = text.trim();
      // Remove quotes if present
      title = title.replace(/^["']|["']$/g, '');
      // Truncate if too long
      if (title.length > 50) {
        title = title.substring(0, 47) + '...';
      }

      return title;
    } catch (error) {
      this.logger.error(
        `Failed to generate title: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      // Fallback to a truncated version of the message
      return userMessage.length > 50
        ? userMessage.substring(0, 47) + '...'
        : userMessage;
    }
  }

  /**
   * Ensures the AI always receives the JSON instructions appended to the user prompt
   */
  private buildStructuredPrompt(userMessage: string): string {
    return `${userMessage.trim()}

${STRUCTURED_RESPONSE_INSTRUCTIONS.trim()}`;
  }

  /**
   * Parses the raw Gemini response, extracting the JSON payload and validating the shape
   */
  private parseAIResponse(rawText: string): AIResponseType {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new CustomHttpException(
        'AI response was not in the expected JSON format',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    let parsed: Record<string, any>;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (error) {
      this.logger.error(
        `Failed to parse AI response JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new CustomHttpException(
        'Unable to parse AI response',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const content = (parsed.content ?? '').toString().trim();

    if (!content) {
      throw new CustomHttpException(
        'AI response did not include content',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Parse references array - REQUIRED: at least one reference must be present
    const references: AIReference[] = [];
    if (Array.isArray(parsed.references)) {
      for (const ref of parsed.references) {
        if (!ref || typeof ref !== 'object') {
          continue;
        }

        if (ref.type === 'quran') {
          const surah = parseInt(ref.surah as string);
          const startAyah = parseInt(ref.startAyah as string);
          const endAyah = parseInt(ref.endAyah as string);

          if (
            !isNaN(surah) &&
            !isNaN(startAyah) &&
            !isNaN(endAyah) &&
            surah >= 1 &&
            surah <= 114 &&
            startAyah >= 1 &&
            endAyah >= startAyah
          ) {
            references.push({
              type: 'quran',
              surah,
              startAyah,
              endAyah,
            });
          } else {
            this.logger.warn(`Invalid Quran reference: ${JSON.stringify(ref)}`);
          }
        } else if (ref.type === 'hadith') {
          const collection = ref.collection?.toString().trim();
          const hadithNumber = ref.hadithNumber;

          if (collection && hadithNumber !== undefined) {
            const hadithRef: AIReference = {
              type: 'hadith',
              collection,
              hadithNumber:
                typeof hadithNumber === 'number'
                  ? hadithNumber
                  : hadithNumber.toString(),
            };

            if (ref.bookNumber !== undefined) {
              const bookNumber = parseInt(ref.bookNumber as string);
              if (!isNaN(bookNumber)) {
                hadithRef.bookNumber = bookNumber;
              }
            }

            if (ref.chapterNumber !== undefined) {
              const chapterNumber = parseInt(ref.chapterNumber as string);
              if (!isNaN(chapterNumber)) {
                hadithRef.chapterNumber = chapterNumber;
              }
            }

            references.push(hadithRef);
          } else {
            this.logger.warn(
              `Invalid Hadith reference: ${JSON.stringify(ref)}`,
            );
          }
        }
      }
    }

    // Validate that at least one reference is present (mandatory requirement)
    if (references.length === 0) {
      throw new CustomHttpException(
        'AI response must include at least one Quran verse or Hadith reference',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      content,
      references,
    };
  }
}
