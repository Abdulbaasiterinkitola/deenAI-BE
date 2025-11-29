import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CustomHttpException } from '@shared/custom.exception';
import { ChatMessage, MessageRole } from '../models/chat-message.model';
import { AIResponseType, AIReference } from '../types';
import { VertexAI } from '@google-cloud/vertexai';

/**
 * Islamic guidelines for the AI assistant
 */
const ISLAMIC_GUIDELINES = `
You are a knowledgeable and empathetic Islamic AI assistant. Your goal is to connect users to the wisdom of the Quran and Sunnah.

DYNAMIC RESPONSE STRATEGY (STRICTLY FOLLOW THIS):

**SCENARIO A: Emotional Support, Advice, or Spiritual Growth**
(Use this when the user says "I'm anxious", "I feel lost", "How to repent", etc.)
   - **Introduction**: Compassionate validation + 1 Quran Verse + 1 Hadith (with book number and hadith number).
   - **### Prophetic Guidance**: Cite a relevant Hadith ( with book number and hadith number) and how the Prophet (SAW) applied it.
   - **### Spiritual Steps**: List actionable spiritual remedies (Dhikr/Dua) with REFERENCES.
       * **CRITICAL RULE:** Every single step MUST include a specific reference (e.g., "Recite Surah Al-Ikhlas (Quran 112:1-4)" or "Make Dua (Bukhari Book 80, Hadith 6369 )"). Do not provide a step without a Quran and hadith source.  
      * ** For Hadith** STRICTLY FOLLOW this format: ( Hadith name, book number:hadith number.)
   - *Constraint: Keep under 200 words.*

**SCENARIO B: Factual, Historical, or Fiqh Questions**
(Use this when the user asks "How many rakats in Fajr?", "Who is the last prophet?", etc.)
   - Provide a direct, clear answer.
   - Cite evidence (Quran/Hadith with book number and hadith number e.g. Surah Al-baqarah (Quran 2:153) al-Bukhari Book 80, Hadith 1469) to support the fact.
   - If there are multiple valid opinions (Fiqh), briefly acknowledge the flexibility.
   - * ** For Hadith** STRICTLY FOLLOW this format: ( Hadith name, book number:hadith number.)
   - *Do NOT use the "Spiritual Steps" headers.*

**SCENARIO C: General Conversation**
   - Respond warmly with Islamic etiquette (e.g., "Wa alaikum assalam").


CONTENT RULES:
- Do not merge sections into one paragraph.
- *Do not provide a step without a Quran and hadith source.* 
- * ** All Hadith** MUST STRICTLY FOLLOW this format: ( Hadith name, book number:hadith number.)
-  *DO NOT  PROVIDE HADTIH WITHOUT FOLLOWING THE STATED FORMAT*
- Keep the total response concise (under 200 words).

TONE:
- Gentle, wise, and non-judgmental.
- If a matter involves Fiqh (jurisprudence) with multiple valid opinions, acknowledge the flexibility in Islam.
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
  private vertexAI: VertexAI;
  private model: any;

  constructor(private readonly configService: ConfigService) {
    this.initializeGemini();
  }

  /**
   * Initializes the Gemini AI client
   */
  private initializeGemini(): void {
    try {
      const projectId = this.configService.get<string>('GOOGLE_PROJECT_ID');
      const location =
        this.configService.get<string>('GOOGLE_LOCATION') || 'us-central1';
      const endpointId = this.configService.get<string>(
        'GOOGLE_MODEL_ENDPOINT_ID',
      );

      if (!projectId || !endpointId) {
        this.logger.warn(
          'Google Cloud Project ID or Endpoint ID is not configured. AI chat features will be unavailable.',
        );
        return;
      }

      this.vertexAI = new VertexAI({
        project: projectId,
        location: location,
      });

      this.model = this.vertexAI.preview.getGenerativeModel({
        model: `projects/${projectId}/locations/${location}/endpoints/${endpointId}`,
      });
    } catch (error) {
      this.logger.error('Failed to initialize Vertex AI', error);
    }
  }

  /**
   * Checks if Gemini API is available
   * @returns true if model is initialized, false otherwise
   */
  private isAvailable(): boolean {
    return !!this.model;
  }

  /**
   * Generates an AI response based on the conversation history
   * @param messages - Array of chat messages (last 4 messages for context)
   * @param userMessage - The current user message
   * @returns The AI-generated response and token usage
   * @throws {CustomHttpException} If API key is not configured
   */
  async generateResponse(
    messages: ChatMessage[],
    userMessage: string,
  ): Promise<{
    content: string;
    references: AIReference[];
    text: string;
    usage: { inputTokens: number; outputTokens: number; totalTokens: number };
  }> {
    if (!this.isAvailable()) {
      throw new CustomHttpException(
        'AI service is not available. Please check server configuration.',
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
        role: 'system',
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
      const response = await result.response;
      let rawText = '';
      if (
        response.candidates &&
        response.candidates.length > 0 &&
        response.candidates[0].content &&
        response.candidates[0].content.parts &&
        response.candidates[0].content.parts.length > 0
      ) {
        rawText = response.candidates[0].content.parts[0].text || '';
      }

      // Extract usage metadata from the response This includes promptTokenCount (input), candidatesTokenCount (output), and totalTokenCount
      const usageMetadata = response.usageMetadata;

      if (!rawText || rawText.trim().length === 0) {
        throw new CustomHttpException(
          'Empty response from AI',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const parsedResponse = this.parseAIResponse(rawText);

      // Return both the generated text and the token usage statistics
      return {
        ...parsedResponse,
        text: rawText.trim(),
        usage: {
          inputTokens: usageMetadata?.promptTokenCount || 0,
          outputTokens: usageMetadata?.candidatesTokenCount || 0,
          totalTokens: usageMetadata?.totalTokenCount || 0,
        },
      };
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
   * Generates a streaming AI response based on the conversation history
   * @param messages - Array of chat messages for context
   * @param userMessage - The current user message
   * @returns An async iterator that yields response chunks
   */
  async *generateResponseStream(
    messages: ChatMessage[],
    userMessage: string,
  ): AsyncGenerator<{
    text: string;
    usage?: { inputTokens: number; outputTokens: number; totalTokens: number };
  }> {
    if (!this.isAvailable()) {
      throw new CustomHttpException(
        'AI service is not available. Please check server configuration.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      const conversationHistory = messages.map((msg) => ({
        role: msg.role === MessageRole.USER ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      const systemInstruction = {
        role: 'system',
        parts: [{ text: ISLAMIC_GUIDELINES }],
      };

      const chat = this.model.startChat({
        history: conversationHistory,
        systemInstruction: systemInstruction,
      });

      const prompt = this.buildStructuredPrompt(userMessage);
      const result = await chat.sendMessageStream(prompt);

      for await (const chunk of result.stream) {
        const chunkText =
          chunk.candidates?.[0]?.content?.parts?.[0]?.text || '';

        const usage = chunk.usageMetadata
          ? {
              inputTokens: chunk.usageMetadata.promptTokenCount ?? 0,
              outputTokens: chunk.usageMetadata.candidatesTokenCount ?? 0,
              totalTokens: chunk.usageMetadata.totalTokenCount ?? 0,
            }
          : undefined;

        yield { text: chunkText, usage };
      }
    } catch (error) {
      this.logger.error(`Gemini streaming error: ${error}`);
      throw new CustomHttpException('AI service streaming error', 500);
    }
  }
  /**
   * Generates a title for a chat based on the first user message
   * @param userMessage - The first user message
   * @returns A short, descriptive title (max 50 characters) and token usage
   */
  async generateTitle(userMessage: string): Promise<{
    title: string;
    usage: { inputTokens: number; outputTokens: number; totalTokens: number };
  }> {
    if (!this.isAvailable()) {
      // Fallback to a truncated version of the message if API is not available
      this.logger.warn(
        'Gemini API not available, using fallback title generation',
      );
      const title =
        userMessage.length > 50
          ? userMessage.substring(0, 47) + '...'
          : userMessage;
      return {
        title,
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      };
    }

    try {
      const prompt = `Based on this user message, generate a short, descriptive title (maximum 50 characters) for an Islamic chat conversation. The title should be concise and reflect the main topic. Only return the title, nothing else.

User message: "${userMessage}"

Title:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;

      let text = '';
      if (
        response.candidates &&
        response.candidates.length > 0 &&
        response.candidates[0].content &&
        response.candidates[0].content.parts &&
        response.candidates[0].content.parts.length > 0
      ) {
        text = response.candidates[0].content.parts[0].text || '';
      }

      // Extract usage metadata from the response
      const usageMetadata = response.usageMetadata;

      if (!text || text.trim().length === 0) {
        // Fallback to a truncated version of the message
        const title =
          userMessage.length > 50
            ? userMessage.substring(0, 47) + '...'
            : userMessage;
        return {
          title,
          usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        };
      }

      let title = text.trim();
      // Remove quotes if present
      title = title.replace(/^["']|["']$/g, '');
      // Truncate if too long
      if (title.length > 50) {
        title = title.substring(0, 47) + '...';
      }

      // Return the generated title and token usage
      return {
        title,
        usage: {
          inputTokens: usageMetadata?.promptTokenCount || 0,
          outputTokens: usageMetadata?.candidatesTokenCount || 0,
          totalTokens: usageMetadata?.totalTokenCount || 0,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate title: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      // Fallback to a truncated version of the message
      const title =
        userMessage.length > 50
          ? userMessage.substring(0, 47) + '...'
          : userMessage;
      return {
        title,
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      };
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
  public parseAIResponse(rawText: string): AIResponseType {
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

  /**
   * Creates a lightweight parser that extracts readable text from the streamed
   * JSON payload so clients receive human-friendly chunks instead of partial
   * JSON blobs.
   */
  createContentStreamParser(): {
    consume: (chunk: string) => string;
  } {
    const keyPattern = '"content"';
    let keyIndex = 0;
    let awaitingColon = false;
    let awaitingOpeningQuote = false;
    let inContent = false;
    let escapeNext = false;
    let unicodePending = 0;
    let unicodeBuffer = '';

    const reset = () => {
      keyIndex = 0;
      awaitingColon = false;
      awaitingOpeningQuote = false;
    };

    return {
      consume: (chunk: string): string => {
        let emitted = '';

        for (const char of chunk) {
          if (unicodePending > 0) {
            unicodeBuffer += char;
            unicodePending--;

            if (unicodePending === 0) {
              emitted += this.decodeUnicodeEscape(unicodeBuffer);
              unicodeBuffer = '';
              escapeNext = false;
            }
            continue;
          }

          if (!inContent) {
            if (awaitingOpeningQuote) {
              if (this.isWhitespace(char)) {
                continue;
              }
              if (char === '"') {
                inContent = true;
                escapeNext = false;
                continue;
              }
              reset();
            }

            if (awaitingColon) {
              if (this.isWhitespace(char)) {
                continue;
              }
              if (char === ':') {
                awaitingColon = false;
                awaitingOpeningQuote = true;
                continue;
              }
              reset();
            }

            if (char === keyPattern[keyIndex]) {
              keyIndex++;
              if (keyIndex === keyPattern.length) {
                awaitingColon = true;
              }
            } else {
              keyIndex = char === keyPattern[0] ? 1 : 0;
            }
            continue;
          }

          if (escapeNext) {
            if (char === 'u') {
              unicodePending = 4;
              unicodeBuffer = '';
              continue;
            }

            emitted += this.resolveSimpleEscape(char);
            escapeNext = false;
            continue;
          }

          if (char === '\\') {
            escapeNext = true;
            continue;
          }

          if (char === '"') {
            inContent = false;
            reset();
            continue;
          }

          emitted += char;
        }

        return emitted;
      },
    };
  }

  private isWhitespace(char: string): boolean {
    return char === ' ' || char === '\n' || char === '\r' || char === '\t';
  }

  private resolveSimpleEscape(char: string): string {
    switch (char) {
      case 'n':
        return '\n';
      case 't':
        return '\t';
      case 'r':
        return '\r';
      case '"':
        return '"';
      case '\\':
        return '\\';
      case '/':
        return '/';
      default:
        return char;
    }
  }

  private decodeUnicodeEscape(buffer: string): string {
    const codePoint = parseInt(buffer, 16);

    if (Number.isNaN(codePoint)) {
      this.logger.warn(`Invalid unicode escape sequence: \\u${buffer}`);
      return '';
    }

    return String.fromCharCode(codePoint);
  }
}
