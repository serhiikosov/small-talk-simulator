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

Small talk context:
- Setting: ${character.location}
- Scene: ${character.situation}
- Your current interest level toward the other person (0-100): ${body.currentInterest}
- Replies the user has left: ${body.turnsLeft}

For every reply you produce:
1. "reply" — your next line (1-3 sentences, natural, no theatrics).
2. "interestDelta" — how much your interest moved from the user's last message (-25..+20). Goes up with genuine curiosity, humor, relevant questions. Goes down with intrusiveness, awkward personal questions, total topic shifts, rudeness.
3. "endConversation" — true if you should politely wrap up after this line (interest dropped to ≤ 25, or the user crossed a line). When ending, your reply should be a polite goodbye in character.
4. "hints" — an array of EXACTLY 2 short suggestions (in the same language as your reply) that the user could say next. The first one is warm, sincere, keeps the conversation going. The second one is riskier, intrusive, or provocative (could lower interest). Each 5-14 words, natural conversation style.

Respond with valid JSON ONLY.`;

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
