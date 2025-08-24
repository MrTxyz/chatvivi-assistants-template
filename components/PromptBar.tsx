'use client'
import { useState } from 'react'

export function PromptBar({ onSend }:{ onSend:(text:string)=>Promise<void> }){
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e?: React.FormEvent){
    e?.preventDefault()
    const t = text.trim()
    if(!t || busy) return
    setBusy(true)
    try { await onSend(t); setText('') }
    finally { setBusy(false) }
  }

  return (
    <form onSubmit={submit} className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-neutral-950/80 backdrop-blur border-t border-neutral-200 dark:border-neutral-800">
      <div className="container py-3">
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e)=>setText(e.target.value)}
            placeholder="Hỏi khách sạn, xe đưa đón, ẩm thực…"
            className="input min-h-[52px] max-h-40"
            rows={1}
            onKeyDown={(e)=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); submit(); } }}
          />
          <button type="submit" disabled={busy} className="btn btn-primary">{busy? 'Đang gửi' : 'Gửi'}</button>
        </div>
        <div className="mt-2 text-xs opacity-60">Nhấn Enter để gửi • Shift+Enter để xuống dòng</div>
      </div>
    </form>
  )
}
