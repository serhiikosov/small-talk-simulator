# Small Talk Simulator

Тренажер світської бесіди на базі Google Gemini.

## Стек

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS 3**
- **Google Gemini API**
  - `gemini-2.5-flash` — текстова розмова + транскрипція аудіо
  - `gemini-2.5-flash-native-audio-preview-12-2025` — заплановано для real-time голосу через Live API (TODO)
- Деплой: **Vercel**

## Локальний запуск

```bash
cp .env.example .env.local   # додай свій GEMINI_API_KEY
npm install
npm run dev
```

Відкрий [http://localhost:3000](http://localhost:3000).

## Структура

```
app/
  page.tsx                              # головна — 2 картки персонажів
  character/[id]/page.tsx               # деталі персонажа + перемикач формату + Start
  simulation/[id]/interactive/page.tsx  # відео-сценарій з вибором
  simulation/[id]/text-voice/page.tsx   # чат з аналізом інтересу
  api/chat/route.ts                     # POST → Gemini text + JSON-схема
  api/transcribe/route.ts               # POST audio → Gemini транскрипція
components/
  CharacterCard / FormatSelector / InteractiveScene
  TextVoiceChat / InterestBar / VoiceRecorder
lib/
  characters.ts                         # дані і system prompts
  gemini.ts                             # ID моделей + URL helper
```

## Як працює

### Інтерактивне відео

Програється `intro` → з'являються 2 варіанти відповіді → програється
`positive.mp4` або `negative.mp4`. Файли треба покласти у
`public/videos/{characterId}/{intro,positive,negative}.mp4`. Якщо файлів немає, рендериться анімований текстовий fallback.

### Текст / голос

- Користувач може відповідати текстом або голосом (запис через MediaRecorder API → транскрипція через Gemini).
- Усього **до 3 реплік** від користувача.
- Кожна відповідь надсилається на `/api/chat` разом з історією та поточним інтересом.
- Gemini повертає структурований JSON: `reply`, `interestDelta` (-25..+20), `endConversation`.
- Шкала зацікавленості (0–100) оновлюється в шапці.
- Якщо запитання нав'язливі / не по темі — інтерес падає, персонаж ввічливо завершує розмову.

## Деплой на Vercel

```bash
vercel
```

У налаштуваннях проєкту на Vercel додай env-змінну `GEMINI_API_KEY`.

## TODO

- Real-time bidirectional голос через Live API (`gemini-2.5-flash-native-audio-preview-12-2025`).
- Реальні відеофайли для інтерактивного режиму.
- Збереження результатів сесій.
