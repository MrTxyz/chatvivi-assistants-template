// app/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";

type Msg = {
  id: string;
  role: "user" | "assistant";
  text: string;
  streaming?: boolean;
};

export default function Page() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "sys1",
      role: "assistant",
      text:
        "Chào mừng đến TP.HCM. Tôi là Trợ lý Sân bay T3. Anh/chị cần khách sạn, xe đưa đón hay ẩm thực?",
    },
  ]);
  const [input, setInput] = useState("");
  const [threadId, setThreadId] = useState<string | null>(null);
  const scrollingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // auto scroll
    scrollingRef.current?.scrollTo({ top: 999999, behavior: "smooth" });
  }, [messages]);

  async function sendMessageStream(text: string) {
    if (!text.trim()) return;

    // push message user
    const userMsg: Msg = {
      id: crypto.randomUUID(),
      role: "user",
      text,
    };
    setMessages((s) => [...s, userMsg]);

    // tạo placeholder assistant (streaming)
    const assistantMsgId = crypto.randomUUID();
    setMessages((s) => [
      ...s,
      { id: assistantMsgId, role: "assistant", text: "", streaming: true },
    ]);

    // gọi API streaming
    const resp = await fetch("/api/chat/stream", {
      method: "POST",
      body: JSON.stringify({ message: text, threadId }),
      headers: { "Content-Type": "application/json" },
    });

    if (!resp.body) {
      // lỗi mạng
      setMessages((s) =>
        s.map((m) =>
          m.id === assistantMsgId
            ? { ...m, text: "(Hệ thống bận. Vui lòng thử lại)", streaming: false }
            : m
        )
      );
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    const flushBuffer = () => {
      // xử lý theo từng dòng JSON
      let idx: number;
      while ((idx = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 1);

        if (!line) continue;
        try {
          const evt = JSON.parse(line) as
            | { event: "meta"; threadId: string }
            | { event: "delta"; value: string }
            | { event: "done" }
            | { event: "error"; message: string };

          if (evt.event === "meta") {
            setThreadId(evt.threadId);
          } else if (evt.event === "delta") {
            setMessages((s) =>
              s.map((m) =>
                m.id === assistantMsgId ? { ...m, text: m.text + evt.value } : m
              )
            );
          } else if (evt.event === "done") {
            setMessages((s) =>
              s.map((m) =>
                m.id === assistantMsgId ? { ...m, streaming: false } : m
              )
            );
          } else if (evt.event === "error") {
            setMessages((s) =>
              s.map((m) =>
                m.id === assistantMsgId
                  ? {
                      ...m,
                      text: "(Có lỗi khi sinh nội dung. Vui lòng thử lại)",
                      streaming: false,
                    }
                  : m
              )
            );
          }
        } catch {}
      }
    };

    // đọc từng chunk
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        flushBuffer();
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      flushBuffer();
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="p-4 text-lg font-semibold">ChatVivi_AI_Agent</div>

      <div ref={scrollingRef} className="flex-1 overflow-y-auto px-4 pb-24">
        {messages.map((m) => (
          <div key={m.id} className="mb-3 flex">
            <div
              className={`px-3 py-2 rounded-2xl max-w-[80%] ${
                m.role === "user"
                  ? "ml-auto bg-white text-black"
                  : "mr-auto bg-neutral-800"
              }`}
            >
              <span>{m.text}</span>
              {m.streaming && (
                <span className="inline-block w-2 h-4 ml-1 align-middle animate-pulse">
                  ▍
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <form
        className="fixed bottom-0 left-0 right-0 p-3 bg-black/60 backdrop-blur border-t border-neutral-800 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const v = input.trim();
          setInput("");
          sendMessageStream(v);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập câu hỏi (Enter để gửi)…"
          className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 outline-none"
        />
        <button
          type="submit"
          className="bg-white text-black px-4 py-2 rounded-xl"
        >
          Gửi
        </button>
      </form>
    </div>
  );
}
