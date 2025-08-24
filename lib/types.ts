export type ChatMessage = { role: 'user'|'assistant', content: string, vendors?: any[] }
export type ChatResponse = { threadId: string, reply: string, vendors?: any[] }
