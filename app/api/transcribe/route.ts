import { NextRequest, NextResponse } from "next/server";
import { GEMINI_TEXT_MODEL, geminiUrl } from "@/lib/gemini";

export const runtime = "nodejs";

// Audio transcription via gemini-2.5-flash generateContent with inline_data.
export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not set" }, { status: 500 });
  }

  const formData = await req.formData();
  const file = formData.get("audio");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "No audio file" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const mimeType = file.type || "audio/webm";

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text:
              "Transcribe the following audio verbatim in the original language that is spoken. " +
              "Do NOT translate — keep the same language as the speaker. " +
              "Return ONLY the transcribed text, with no quotes, prefixes, or explanations.",
          },
          { inline_data: { mime_type: mimeType, data: base64 } },
        ],
      },
    ],
  };

  const res = await fetch(`${geminiUrl(GEMINI_TEXT_MODEL)}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    return NextResponse.json(
      { error: `Gemini error: ${errText.slice(0, 300)}` },
      { status: 500 },
    );
  }

  const data = await res.json();
  const text: string =
    data?.candidates?.[0]?.content?.parts?.[0]?.text?.toString().trim() || "";
  return NextResponse.json({ text });
}
