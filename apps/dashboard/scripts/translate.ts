import fs from 'fs/promises';
import path from 'path';
import OpenAI from 'openai';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });
// Also load from root API_KEYS.env
dotenv.config({ path: path.join(__dirname, '../../API_KEYS.env') });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const SOURCE_LOCALE = 'en';
const MESSAGES_DIR = path.join(__dirname, '../messages');

async function translate(targetLocale: string) {
    console.log(`Translating to ${targetLocale}...`);

    const sourcePath = path.join(MESSAGES_DIR, `${SOURCE_LOCALE}.json`);
    const targetPath = path.join(MESSAGES_DIR, `${targetLocale}.json`);

    const sourceContent = await fs.readFile(sourcePath, 'utf-8');
    const sourceJson = JSON.parse(sourceContent);

    let targetJson = {};
    try {
        const targetContent = await fs.readFile(targetPath, 'utf-8');
        targetJson = JSON.parse(targetContent);
    } catch (error) {
        // File doesn't exist, start fresh
    }

    const prompt = `
    You are a professional translator. Translate the following JSON content from English to ${targetLocale}.
    Maintain the same JSON structure. Do not translate keys, only values.
    If a value is already translated in the "Existing Translations" provided below, use it unless it is clearly incorrect.
    
    Source JSON:
    ${JSON.stringify(sourceJson, null, 2)}

    Existing Translations (if any):
    ${JSON.stringify(targetJson, null, 2)}

    Return ONLY the valid JSON of the translated content. Do not include markdown formatting (like \`\`\`json).
  `;

    const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
    });

    const translatedContent = completion.choices[0].message.content;

    if (!translatedContent) {
        throw new Error('No content in AI response');
    }

    const finalJson = JSON.parse(translatedContent);

    await fs.writeFile(targetPath, JSON.stringify(finalJson, null, 2));
    console.log(`Translation to ${targetLocale} completed!`);
}

const targetLocale = process.argv[2];
if (!targetLocale) {
    console.error('Please provide a target locale (e.g., uk, es, de)');
    process.exit(1);
}

translate(targetLocale).catch(console.error);
