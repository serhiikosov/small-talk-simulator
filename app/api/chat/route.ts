import { NextRequest, NextResponse } from "next/server";
import { getCharacter } from "@/lib/characters";
import { GEMINI_TEXT_MODEL, geminiUrl } from "@/lib/gemini";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "model"; text: string };

type Body = {
  characterId: string;
  history: ChatMessage[];
  userMessage: string;
  currentInterest: number;
  turnsLeft: number;
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not set" }, { status: 500 });
  }

  const body = (await req.json()) as Body;
  const character = getCharacter(body.characterId);
  if (!character) {
    return NextResponse.json({ error: "Character not found" }, { status: 404 });
  }

  const systemInstruction = `${character.systemPrompt}

Контекст small talk:
- Локація: ${character.location}
- Ситуація: ${character.situation}
- Поточний рівень твого інтересу до співрозмовника (0-100): ${body.currentInterest}
- У користувача залишилось реплік: ${body.turnsLeft}

Твоя задача в кожному відповіді:
1. "reply" — твоя наступна репліка (1-3 речення, природно, без зайвої театральності).
2. "interestDelta" — на скільки змінився інтерес від останнього повідомлення користувача (-25..+20). Зростає при щирому інтересі, гуморі, релевантних запитаннях. Падає при нав'язливості, недоречних особистих запитаннях, повній зміні теми, грубості.
3. "endConversation" — true якщо після цієї репліки треба ввічливо завершити розмову (інтерес впав ≤ 25 або користувач явно переходить межу). При завершенні твоя репліка має бути ввічливою формою прощання.
4. "hints" — масив з ЕКЗАКТНО 2 короткими пропозиціями (тією самою мовою, що й reply) — це що користувач МІГ БИ сказати у відповідь на твою репліку. Перша — щира, тепла, конструктивна, що продовжує розмову. Друга — більш ризикована, нав'язлива або провокативна (потенційно може знизити інтерес). Кожна 5-14 слів, у стилі живої розмови, як реальний варіант відповіді.

Відповідай ЛИШЕ валідним JSON.`;

  const contents = [
    {
      role: "model" as const,
      parts: [{ text: character.firstLine }],
    },
    ...body.history.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    })),
    {
      role: "user" as const,
      parts: [{ text: body.userMessage }],
    },
  ];

  const requestBody = {
    systemInstruction: { parts: [{ text: systemInstruction }] },
    contents,
    generationConfig: {
      temperature: 0.9,
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          reply: { type: "string" },
          interestDelta: { type: "integer" },
          endConversation: { type: "boolean" },
          hints: {
            type: "array",
            items: { type: "string" },
            minItems: 2,
            maxItems: 2,
          },
        },
        required: ["reply", "interestDelta", "endConversation", "hints"],
      },
    },
  };

  const res = await fetch(`${geminiUrl(GEMINI_TEXT_MODEL)}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const errText = await res.text();
    return NextResponse.json(
      { error: `Gemini error: ${errText.slice(0, 300)}` },
      { status: 500 },
    );
  }

  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    return NextResponse.json({ error: "Empty response from Gemini" }, { status: 500 });
  }

  let parsed: {
    reply: string;
    interestDelta: number;
    endConversation: boolean;
    hints?: string[];
  };
  try {
    parsed = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Failed to parse Gemini response" }, { status: 500 });
  }

  const delta = Math.max(-25, Math.min(20, Math.round(parsed.interestDelta)));
  const hints =
    Array.isArray(parsed.hints) && parsed.hints.length >= 2
      ? [String(parsed.hints[0]), String(parsed.hints[1])]
      : null;
  return NextResponse.json({
    reply: parsed.reply,
    interestDelta: delta,
    endConversation: !!parsed.endConversation,
    hints,
  });
}
