// app/api/chat/stream/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { openai } from "@/lib/openai";

const Body = z.object({
  message: z.string().min(1, "empty_message"),
  threadId: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => ({}));
    const { message, threadId } = Body.parse(json);

    const assistantId = process.env.OPENAI_ASSISTANT_ID!;
    if (!assistantId) {
      return NextResponse.json({ error: "no_assistant" }, { status: 500 });
    }

    // dùng thread cũ nếu có, không thì tạo mới
    const thread = threadId ? { id: threadId } : await openai.beta.threads.create();

    // add user message (bắt buộc chuỗi)
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message,
    });

    // tạo run stream
    const runStream = await openai.beta.threads.runs.stream(thread.id, {
      assistant_id: assistantId,
    });

    // stream ra client theo dạng "JSON Lines"
    // dòng đầu: {event:'meta', threadId}
    // các dòng token: {event:'delta', value:'...'}
    // kết thúc: {event:'done'}
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start(controller) {
        const write = (obj: any) =>
          controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));

        // gửi meta (threadId) trước
        write({ event: "meta", threadId: thread.id });

        runStream.on("textDelta", (delta: any) => {
          write({ event: "delta", value: delta.value });
        });

        // Khi có lỗi ở server OpenAI
        runStream.on("error", (err: any) => {
          write({ event: "error", message: String(err?.message ?? err) });
          controller.close();
        });

        // Khi stream kết thúc
        runStream.on("end", () => {
          write({ event: "done" });
          controller.close();
        });
      },
      cancel() {
        try {
          // nỗ lực đóng stream phía OpenAI (nếu SDK hỗ trợ)
          // @ts-ignore
          runStream?.abort?.();
        } catch {}
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (e: any) {
    console.error("STREAM_CHAT_ERROR", e?.message, e?.issues ?? (await e?.response?.text?.()));
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
