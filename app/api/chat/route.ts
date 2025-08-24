import { NextRequest } from 'next/server'
import { openai } from '@/lib/openai'
import { z } from 'zod'

const Body = z.object({
  message: z.string().min(1),
  threadId: z.string().optional()
})

export async function POST(req: NextRequest){
  const body = await req.json()
  const { message, threadId } = Body.parse(body)
  const assistantId = process.env.OPENAI_ASSISTANT_ID as string
  if(!assistantId) return new Response(JSON.stringify({ error: 'Missing OPENAI_ASSISTANT_ID' }), { status: 500 })

  const thread = threadId ? { id: threadId } : await openai.beta.threads.create()

  await openai.beta.threads.messages.create(thread.id, { role: 'user', content: message })

  const run = await openai.beta.threads.runs.create(thread.id, { assistant_id: assistantId })

  let status = run.status
  const sleep = (ms:number)=> new Promise(r=>setTimeout(r, ms))
  let tries = 50
  while(!['completed','failed','cancelled'].includes(status) && tries-- > 0){
    await sleep(800)
    const r = await openai.beta.threads.runs.retrieve(thread.id, run.id)
    status = r.status
    if(status === 'requires_action'){
      await openai.beta.threads.runs.cancel(thread.id, run.id)
      status = 'cancelled'
    }
  }

  const msgs = await openai.beta.threads.messages.list(thread.id, { order: 'desc', limit: 10 })
  const assistantMsg = msgs.data.find(m => m.role === 'assistant')
  let reply = ''
  if(assistantMsg){
    const parts = assistantMsg.content.map((c:any)=> c.type === 'text' ? c.text.value : '').filter(Boolean)
    reply = parts.join('\n').trim()
  }

  return new Response(JSON.stringify({ threadId: thread.id, reply }), { headers: { 'Content-Type': 'application/json' } })
}
