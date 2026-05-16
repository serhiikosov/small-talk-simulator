export const GEMINI_TEXT_MODEL = "gemini-2.5-flash";
export const GEMINI_TTS_MODEL = "gemini-2.5-flash-preview-tts";
export const GEMINI_AUDIO_LIVE_MODEL = "gemini-2.5-flash-native-audio-preview-12-2025";

export const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

export function geminiUrl(model: string, method: "generateContent" = "generateContent") {
  return `${GEMINI_BASE_URL}/${model}:${method}`;
}
