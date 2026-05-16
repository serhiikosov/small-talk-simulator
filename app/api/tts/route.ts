import { NextRequest, NextResponse } from "next/server";
import { GEMINI_TTS_MODEL, geminiUrl } from "@/lib/gemini";

export const runtime = "nodejs";

type Body = { text: string; voice?: string };

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not set" }, { status: 500 });
  }

  const { text, voice = "Aoede" } = (await req.json()) as Body;
  if (!text || !text.trim()) {
    return NextResponse.json({ error: "Empty text" }, { status: 400 });
  }

  const requestBody = {
    contents: [{ parts: [{ text }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice },
        },
      },
    },
  };

  const res = await fetch(`${geminiUrl(GEMINI_TTS_MODEL)}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const errText = await res.text();
    return NextResponse.json(
      { error: `Gemini TTS error: ${errText.slice(0, 300)}` },
      { status: 500 },
    );
  }

  const data = await res.json();
  const part = data?.candidates?.[0]?.content?.parts?.find(
    (p: { inlineData?: unknown }) => !!p.inlineData,
  );
  if (!part) {
    return NextResponse.json({ error: "No audio in response" }, { status: 500 });
  }

  const mime = part.inlineData.mimeType as string;
  const rateMatch = mime.match(/rate=(\d+)/);
  const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
  const pcm = Buffer.from(part.inlineData.data as string, "base64");
  const wav = pcmToWav(pcm, sampleRate);
  const blob = new Blob([new Uint8Array(wav)], { type: "audio/wav" });

  return new NextResponse(blob, {
    status: 200,
    headers: {
      "Content-Type": "audio/wav",
      "Cache-Control": "no-store",
    },
  });
}

function pcmToWav(pcm: Buffer, sampleRate: number): Buffer {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcm.length;
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);
  return Buffer.concat([header, pcm]);
}
