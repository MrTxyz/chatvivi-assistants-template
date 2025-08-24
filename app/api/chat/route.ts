// app/api/chat/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const assistantId = process.env.OPENAI_ASSISTANT_ID!;
    if (!assistantId) return NextResponse.json({ error: "no_assistant" }, { status: 500 });

    // 1) create thread
    const thread = await openai.beta.threads.create();

    // 2) add user message
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message ?? "",
    });

    // 3) run assistant
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
    });

    // 4) poll until completed
    let status = run.status;
    while (!["completed", "failed", "cancelled"].includes(status)) {
      await new Promise(r => setTimeout(r, 1000));
      const r2 = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      status = r2.status;
    }
    if (status !== "completed") {
      console.error("RUN_STATUS", status);
      return NextResponse.json({ error: "run_failed" }, { status: 500 });
    }

    // 5) read assistant message
    const msgs = await openai.beta.threads.messages.list(thread.id, { order: "desc", limit: 10 });
    const first = msgs.data.find(m => m.role === "assistant");
    const text =
      first?.content?.[0]?.type === "text" ? first.content[0].text.value : "(no reply)";

    return NextResponse.json({ text });
  } catch (e: any) {
    console.error("CHAT_ERROR", e?.status, e?.message, await e?.response?.text?.());
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
