import OpenAI from 'openai'
export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
if (!process.env.OPENAI_API_KEY) console.warn('Missing OPENAI_API_KEY')
if (!process.env.OPENAI_ASSISTANT_ID) console.warn('Missing OPENAI_ASSISTANT_ID')
