'use client'
import { useEffect, useRef, useState } from 'react'
import { ChatBubble } from '@/components/ChatBubble'
import { PromptBar } from '@/components/PromptBar'
import { QuickChips } from '@/components/QuickChips'
import type { ChatMessage } from '@/lib/types'

const WELCOME_VI = 'Chào mừng đến TP.HCM. Tôi là Trợ lý Sân bay T3. Anh/chị cần khách sạn, xe đưa đón hay ẩm thực?'
const WELCOME_EN = 'Welcome to Ho Chi Minh City. I am the T3 Airport Assistant. Do you need hotels, rides, or food?'

export default function Page(){
  const [threadId, setThreadId] = useState<string | null>(null)
  const [msgs, setMsgs] = useState<ChatMessage[]>([
    { role: 'assistant', content: (typeof navigator !== 'undefined' && navigator.language?.startsWith('vi')) ? WELCOME_VI : WELCOME_EN }
  ])
  const listRef = useRef<HTMLDivElement>(null)
  useEffect(()=>{ listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }) }, [msgs])

  async function send(text: string){
    setMsgs(m => [...m, { role: 'user', content: text }])
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, threadId })
    })
    if(!res.ok){
      setMsgs(m => [...m, { role: 'assistant', content: 'Hệ thống bận. Vui lòng thử lại.' }])
      return
    }
    const data = await res.json()
    setThreadId(data.threadId)
    setMsgs(m => [...m, { role: 'assistant', content: data.reply }])
  }

  const chips = [
    { label: 'Khách sạn gần tôi', value: 'Gợi ý khách sạn gần sân bay' },
    { label: 'Xe về Quận 1', value: 'Tôi cần xe về Quận 1' },
    { label: 'Ăn đêm', value: 'Quán ăn mở khuya quanh T3' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="container py-3 flex items-center justify-between">
          <div className="font-semibold">{process.env.NEXT_PUBLIC_APP_NAME || 'ChatVivi AI Agent'}</div>
          <div className="text-sm opacity-60">VTC × T&T Solutions</div>
        </div>
      </header>

      <main className="container flex-1 relative pb-40">
        <div className="py-4">
          <QuickChips items={chips} onPick={(v)=>send(v)} />
        </div>
        <div ref={listRef} className="space-y-2 pb-24">
          {msgs.map((m, i)=> (
            <div key={i}>
              <ChatBubble role={m.role}>{m.content}</ChatBubble>
            </div>
          ))}
        </div>
      </main>

      <PromptBar onSend={send} />
    </div>
  )
}
