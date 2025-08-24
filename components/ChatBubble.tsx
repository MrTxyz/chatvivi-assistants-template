import { ReactNode } from 'react'
import clsx from 'clsx'

export function ChatBubble({ role, children }: { role: 'user' | 'assistant'; children: ReactNode }) {
  const isUser = role === 'user'
  return (
    <div className={clsx('w-full flex mb-3', isUser ? 'justify-end' : 'justify-start')}>
      <div className={clsx('max-w-[80%] px-4 py-3 rounded-2xl whitespace-pre-wrap leading-relaxed',
        isUser ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'bg-neutral-100 dark:bg-neutral-800')}>
        {children}
      </div>
    </div>
  )
}
