# ChatVivi Assistants Template

Meta.ai style chat UI on Next.js (App Router) with OpenAI **Assistants API**.

## 1) Setup
```bash
npm i   # or pnpm i / yarn
cp .env.local.example .env.local
# Fill OPENAI_API_KEY and OPENAI_ASSISTANT_ID
```

## 2) Dev
```bash
npm run dev
# open http://localhost:3000
```

## 3) Deploy (Vercel)
- Add env vars: `OPENAI_API_KEY`, `OPENAI_ASSISTANT_ID`, `NEXT_PUBLIC_APP_NAME`.
- Add domain: `app.chatvivi.vn`.

## Notes
- API `/api/chat` uses Assistants API (threads → messages → run → poll → read).
- For streaming/tool-calling, extend later with SSE.
- Keep responses short for airport UX.
