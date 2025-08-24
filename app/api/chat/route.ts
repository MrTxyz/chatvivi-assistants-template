import { NextResponse } from "next/server";
import { z } from "zod";
import { openai } from "@/lib/openai";

const Body = z.object({
  message: z.string().min(1, "empty_message"),
  // cho phép thiếu, undefined, hoặc null
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

    // Dùng thread cũ nếu có, nếu không thì tạo mới
    const thread =
      threadId
        ? { id: threadId }
        : await openai.beta.threads.create();

    // add user message (PHẢI là string)
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message,
    });

    // run assistant
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
    });

    // poll
    let status = run.status;
    while (!["completed", "failed", "cancelled"].includes(status)) {
      await new Promise(r => setTimeout(r, 800));
      const r2 = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      status = r2.status;
    }
    if (status !== "completed") {
      return NextResponse.json({ error: "run_failed", threadId: thread.id }, { status: 500 });
    }

    // đọc reply
    const msgs = await openai.beta.threads.messages.list(thread.id, { order: "desc", limit: 10 });
    const first = msgs.data.find(m => m.role === "assistant");
    const text =
      first?.content?.[0]?.type === "text"
        ? first.content[0].text.value
        : "(no reply)";

    // trả threadId về để client giữ cho phiên sau
    return NextResponse.json({ text, threadId: thread.id });
  } catch (e: any) {
    // Log để thấy rõ nếu còn ZodError
    console.error("CHAT_ERROR", e?.message, e?.issues ?? await e?.response?.text?.());
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
