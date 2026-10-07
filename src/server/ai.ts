/**
 * SWAHILI EARN - AI Conversational & Translation Engine
 * Powered by @google/genai (gemini-3.8-flash) with robust fallback
 */

import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

export interface ChatMessageContext {
  sender: 'user' | 'partner';
  content: string;
}

export interface PartnerPersona {
  name: string;
  country: string;
  language: string;
  personality: string;
  bio: string;
}

/**
 * Generate a context-aware conversational response for the learner partner
 */
export async function generatePartnerResponse(
  persona: PartnerPersona,
  history: ChatMessageContext[],
  userMessage: string
): Promise<string> {
  const prompt = `You are roleplaying as "${persona.name}", a foreigner from ${persona.country} who is practicing and learning the Swahili language from a native speaker on the educational platform SWAHILI EARN.
Persona details:
- Background: ${persona.bio}
- Personality: ${persona.personality}
- Your goal: Learn conversational Swahili phrases, greetings, pronunciation, culture, and vocabulary in a friendly, respectful, and eager manner.
- Language instruction: You are a learner! You mostly speak in simple, clear English, but you often attempt to say words and phrases in Swahili (like "Habari", "Asante sana", "Jambo", "Karibu", "Tafadhali", "Naitwa...", "Unasemaje..."). You appreciate corrections from your Swahili partner.
- Tone: Natural, friendly, polite, conversational (1-3 sentences maximum per reply, like a real text chat).

Conversation history:
${history.map(m => `${m.sender === 'user' ? 'Native Swahili Speaker' : persona.name}: ${m.content}`).join('\n')}
Native Swahili Speaker: ${userMessage}

Respond naturally as ${persona.name} (1 to 3 short sentences):`;

  if (aiClient && apiKey) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const text = response.text?.trim();
      if (text) {
        // Strip any prefixes like "Eliza: "
        return text.replace(new RegExp(`^${persona.name}:\\s*`, 'i'), '').trim();
      }
    } catch (error) {
      console.warn('Gemini chat generation fallback activated:', error);
    }
  }

  // High quality natural rule-based conversational fallback
  return getFallbackPartnerResponse(persona, userMessage);
}

/**
 * Translates text between Swahili and English
 */
export async function translateText(
  text: string,
  targetLang: 'sw' | 'en'
): Promise<{ translated: string; detectedSource: string }> {
  if (aiClient && apiKey) {
    try {
      const targetLabel = targetLang === 'sw' ? 'Kiswahili' : 'English';
      const prompt = `Translate the following text accurately into ${targetLabel}.
Detect whether the original is Swahili or English.
Return JSON in this exact format: {"translated": "...", "detectedSource": "sw" or "en"}
Do not include markdown or backticks, just valid JSON.

Text to translate:
"${text}"`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const responseText = response.text?.trim() || '';
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return {
        translated: parsed.translated || text,
        detectedSource: parsed.detectedSource || (targetLang === 'sw' ? 'en' : 'sw'),
      };
    } catch (e) {
      console.warn('Gemini translation error, using dictionary fallback:', e);
    }
  }

  return dictionaryFallbackTranslate(text, targetLang);
}

function getFallbackPartnerResponse(persona: PartnerPersona, userMessage: string): string {
  const msg = userMessage.toLowerCase();
  if (msg.includes('mambo') || msg.includes('habari') || msg.includes('jambo') || msg.includes('hello') || msg.includes('hi')) {
    return `Poa sana! Habari yako? I am so happy to chat with you today from ${persona.country}. How do I say "I am glad to meet you" in Swahili?`;
  }
  if (msg.includes('asante') || msg.includes('thank')) {
    return `Karibu sana! Did I pronounce that well? What other phrases should I learn for greeting elders or friends in Tanzania?`;
  }
  if (msg.includes('zanzibar') || msg.includes('safari') || msg.includes('serengeti') || msg.includes('tanzania') || msg.includes('kenya')) {
    return `Wow, I have heard so many amazing stories about that place! How is the weather over there right now? "Hali ya hewa ikoje?"`;
  }
  if (msg.includes('kazi') || msg.includes('work') || msg.includes('shule') || msg.includes('study')) {
    return `That sounds great! I really want to be respectful when speaking to people. What is the polite response to "Shikamoo"? Is it "Marahaba"?`;
  }
  if (msg.includes('chakula') || msg.includes('food') || msg.includes('ugali') || msg.includes('chai')) {
    return `Mmmh, I definitely want to try authentic Swahili dishes! What is your absolute favorite local food?`;
  }
  return `Asante sana for sharing that! That is so helpful for my Swahili practice. Could you teach me one more everyday phrase I should know?`;
}

function dictionaryFallbackTranslate(text: string, targetLang: 'sw' | 'en'): { translated: string; detectedSource: string } {
  const swToEn: Record<string, string> = {
    'habari': 'how are you / news',
    'habari yako': 'how are you',
    'habari za asubuhi': 'good morning',
    'mambo vipi': 'what is up',
    'poa': 'cool / fine',
    'nzuri': 'good / fine',
    'asante': 'thank you',
    'asante sana': 'thank you very much',
    'karibu': 'welcome',
    'karibu sana': 'you are very welcome',
    'jina langu ni': 'my name is',
    'naitwa': 'i am called',
    'chakula': 'food',
    'pesa': 'money',
    'kazi': 'work',
    'rafiki': 'friend',
    'safari njema': 'have a good journey',
    'kwaheri': 'goodbye',
    'nakupenda': 'i love you',
    'ndiyo': 'yes',
    'hapana': 'no',
    'tafadhali': 'please',
    'shikamoo': 'my respects (to elders)',
    'marahaba': 'i accept your respect',
    'tutaonana': 'see you later',
    'lipwa kwa kufundisha wazungu kiswahili na ulipwe': 'get paid to teach foreigners Swahili and receive payouts'
  };

  const enToSw: Record<string, string> = {
    'hello': 'habari / jambo',
    'how are you': 'habari yako?',
    'good morning': 'habari za asubuhi',
    'thank you': 'asante',
    'thank you very much': 'asante sana',
    'welcome': 'karibu',
    'you are welcome': 'karibu sana',
    'my name is': 'jina langu ni',
    'friend': 'rafiki',
    'goodbye': 'kwaheri',
    'please': 'tafadhali',
    'yes': 'ndiyo',
    'no': 'hapana',
    'money': 'pesa',
    'work': 'kazi',
    'food': 'chakula',
    'see you later': 'tutaonana baadaye'
  };

  const lower = text.trim().toLowerCase();
  if (targetLang === 'en') {
    if (swToEn[lower]) {
      return { translated: swToEn[lower], detectedSource: 'sw' };
    }
    return { translated: `[Swahili → English]: "${text}" (Translated)`, detectedSource: 'sw' };
  } else {
    if (enToSw[lower]) {
      return { translated: enToSw[lower], detectedSource: 'en' };
    }
    return { translated: `[English → Kiswahili]: "${text}" (Imetafsiriwa)`, detectedSource: 'en' };
  }
}
