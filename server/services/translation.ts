import OpenAI from 'openai';

// Next.js automatically loads environment variables from .env.local
const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

export async function translateContent(
    content: string,
    targetLocales: string[] = ['en', 'uk', 'es', 'de', 'fr']
): Promise<Record<string, string>> {
    if (!content || !targetLocales.length) return {};

    const prompt = `
    Translate the following text into the following languages: ${targetLocales.join(', ')}.
    Return a JSON object where keys are language codes (e.g., "en", "uk") and values are the translations.
    Text: "${content}"
  `;

    try {
        if (!openai) {
            console.warn('OpenAI API key not found. Skipping translation.');
            return {};
        }

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: 'You are a professional translator. Return only valid JSON.' },
                { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' },
        });

        const result = JSON.parse(response.choices[0].message.content || '{}');
        return result;
    } catch (error) {
        console.error('Translation error:', error);
        // Return empty object on error, or maybe just the original text for all?
        // For now, return empty so we fall back to original.
        return {};
    }
}
