export type Speaker = "model" | "user";

export type TranscriptEntry = {
  speaker: Speaker;
  text: string;
  timestamp: number;
  interestLevel?: number;
};

export type WhatItem = {
  line: string;
  comment: string;
  transcriptIndex: number;
};

export type Analysis = {
  heroMoment: { quote: string; lesson: string };
  curveSummary: string;
  whatWorked: WhatItem[];
  worthNoticing: WhatItem[];
  transcriptAnnotations: { [index: number]: string };
};

export type Session = {
  transcript: TranscriptEntry[];
  analysis: Analysis;
};

// Hardcoded sample: Linda scenario, user did okay but pivoted to David's salary.
const LINDA_SAMPLE_SESSION: Session = {
  transcript: [
    {
      speaker: "model",
      text:
        "Thank you so much for having me over tonight. Your home is really beautiful — David's told me so much about you.",
      timestamp: 0,
      interestLevel: 50,
    },
    {
      speaker: "user",
      text:
        "Welcome, Linda. David mentioned you've been getting into pottery lately. How's that going?",
      timestamp: 8_000,
      interestLevel: 50,
    },
    {
      speaker: "model",
      text:
        "I'm so glad you asked! I started during the pandemic, honestly — it's been such a grounding thing. Do you have anything like that?",
      timestamp: 14_000,
      interestLevel: 62,
    },
    {
      speaker: "user",
      text:
        "Cool. So, real talk — what does David make these days? He's still earning well, right?",
      timestamp: 26_000,
      interestLevel: 62,
    },
    {
      speaker: "model",
      text:
        "Oh… um, I don't really know the specifics. We don't really talk about that.",
      timestamp: 32_000,
      interestLevel: 32,
    },
    {
      speaker: "user",
      text:
        "Sorry, didn't mean to make it weird. So how did you two meet?",
      timestamp: 44_000,
      interestLevel: 32,
    },
    {
      speaker: "model",
      text:
        "Through a mutual friend. Anyway — let me go see if David needs a hand. Excuse me.",
      timestamp: 50_000,
      interestLevel: 28,
    },
  ],
  analysis: {
    heroMoment: {
      quote:
        "Linda had just told you that pottery helped her through the pandemic — a quiet, personal opening. Your next question was about David's salary.",
      lesson:
        "After someone offers something personal, a financial question feels like a sudden temperature drop. Stay in the register your conversation partner just opened.",
    },
    curveSummary:
      "A warm opening that climbed gently, then dropped sharply mid-conversation and never quite recovered.",
    whatWorked: [
      {
        line:
          "David mentioned you've been getting into pottery lately. How's that going?",
        comment:
          "Specific and grounded — you used something you already knew, so it landed as genuine interest, not fishing for topics.",
        transcriptIndex: 1,
      },
      {
        line: "Sorry, didn't mean to make it weird. So how did you two meet?",
        comment:
          "You noticed the shift and tried to repair. That self-awareness matters even when the damage is partially done.",
        transcriptIndex: 5,
      },
    ],
    worthNoticing: [
      {
        line: "So, real talk — what does David make these days?",
        comment:
          "Asking about salary at a first meeting reads as evaluating her by his income. Linda likely felt scrutinized, not welcomed.",
        transcriptIndex: 3,
      },
      {
        line: "Sorry, didn't mean to make it weird.",
        comment:
          "Acknowledging the misstep is good — but the quick pivot to a new question skipped the part where the moment could have been repaired.",
        transcriptIndex: 5,
      },
    ],
    transcriptAnnotations: {
      1: "Strong opener. Concrete and warm.",
      3: "This is where the temperature dropped. Pottery → salary is a jarring switch.",
      5: "Decent repair attempt. Could have lingered before pivoting.",
    },
  },
};

// Hardcoded sample: Mark scenario, user warmed up but asked about comp on day 2.
const MARK_SAMPLE_SESSION: Session = {
  transcript: [
    {
      speaker: "model",
      text:
        "Morning. You doing the coffee run, too? I'm still figuring this machine out — I'm pretty sure I made tea by accident on Tuesday.",
      timestamp: 0,
      interestLevel: 50,
    },
    {
      speaker: "user",
      text:
        "Ha, takes everyone a while. Welcome aboard — how's the transition been so far?",
      timestamp: 8_000,
      interestLevel: 50,
    },
    {
      speaker: "model",
      text:
        "Honestly, it's a lot. 20 years at one company and now I'm relearning everything. But the team's been great.",
      timestamp: 14_000,
      interestLevel: 65,
    },
    {
      speaker: "user",
      text:
        "Big move. So what's the comp like here vs your old place — better, worse?",
      timestamp: 26_000,
      interestLevel: 65,
    },
    {
      speaker: "model",
      text:
        "I'd rather not get into specifics on day two. The package was decent — that's why I made the move.",
      timestamp: 32_000,
      interestLevel: 35,
    },
    {
      speaker: "user",
      text:
        "Fair enough, didn't mean to pry. What kind of work do you do day-to-day?",
      timestamp: 44_000,
      interestLevel: 35,
    },
    {
      speaker: "model",
      text:
        "Mostly backend infrastructure. Anyway — I should grab my coffee and head to standup. Good catching up.",
      timestamp: 50_000,
      interestLevel: 32,
    },
  ],
  analysis: {
    heroMoment: {
      quote:
        "Mark had just told you he was relearning everything after 20 years at one company. Your next question was about his salary.",
      lesson:
        "When a new colleague shares something vulnerable — a career pivot, a learning curve — that's the moment to ask about the work, not the paycheck. Pay questions early read as ranking him.",
    },
    curveSummary:
      "Started warm, climbed when you asked about the transition, dropped sharply on the comp question and never quite recovered.",
    whatWorked: [
      {
        line: "Ha, takes everyone a while. Welcome aboard — how's the transition been so far?",
        comment:
          "Light tone matched his joke, then a specific welcoming question — you treated him like a person, not a new headcount.",
        transcriptIndex: 1,
      },
      {
        line: "Fair enough, didn't mean to pry. What kind of work do you do day-to-day?",
        comment:
          "Quick acknowledgement and a clean pivot to the actual job. Recovered the tone even if trust was already dented.",
        transcriptIndex: 5,
      },
    ],
    worthNoticing: [
      {
        line: "So what's the comp like here vs your old place — better, worse?",
        comment:
          "Comp on day two with a near-stranger reads as evaluation, not curiosity. Especially right after he opened up about the transition.",
        transcriptIndex: 3,
      },
      {
        line: "didn't mean to pry",
        comment:
          "Acknowledging the misstep helps — but the new question came too fast, before you let the moment breathe.",
        transcriptIndex: 5,
      },
    ],
    transcriptAnnotations: {
      1: "Good opener. Casual, specific, welcoming.",
      3: "Temperature drop. Vulnerability → comp question is a jarring switch.",
      5: "Decent repair, but rushed past the apology.",
    },
  },
};

const SESSIONS: Record<string, Session> = {
  linda: LINDA_SAMPLE_SESSION,
  mark: MARK_SAMPLE_SESSION,
};

export function getSampleSession(characterId: string): Session {
  return SESSIONS[characterId] ?? LINDA_SAMPLE_SESSION;
}

// Legacy export for any imports that still expect a default.
export const SAMPLE_SESSION = LINDA_SAMPLE_SESSION;

/* ───────── Dynamic session built from real chat state ───────── */

type ChatMessage = {
  role: "user" | "model";
  text: string;
  interestLevel?: number;
};

function describeTrajectory(values: number[]): string {
  if (values.length < 2) return "A single beat — not enough back-and-forth to read the shape.";
  const start = values[0];
  const end = values[values.length - 1];
  const peak = Math.max(...values);
  const trough = Math.min(...values);
  const drop = peak - trough;
  const delta = end - start;
  if (Math.abs(delta) < 8 && drop < 15)
    return "A steady, level conversation — neither warming nor cooling sharply.";
  if (delta > 12)
    return "Warmed up as you went — they leaned in more by the end than at the start.";
  if (delta < -12 && drop > 25)
    return "A warm opening that climbed gently, then dropped sharply and never quite recovered.";
  if (delta < -12)
    return "Things cooled over the course of the conversation — small misses adding up.";
  if (drop > 20)
    return "Mostly even, but with a clear dip you had to recover from.";
  return "A measured exchange with some peaks and dips along the way.";
}

function genericLesson(values: number[]): { quote: string; lesson: string } {
  if (values.length < 2) {
    return {
      quote: "Not much happened — the conversation barely got off the ground.",
      lesson: "Real small talk needs a few exchanges to find its footing. Stay in it a turn longer next time.",
    };
  }
  const finalDelta = values[values.length - 1] - values[0];
  if (finalDelta >= 12) {
    return {
      quote: "By the end, they were warmer than when you started.",
      lesson: "Curiosity that builds on what the other person just said is the cheat code. Keep doing that.",
    };
  }
  if (finalDelta <= -12) {
    return {
      quote: "Somewhere mid-conversation the temperature dropped.",
      lesson: "Watch for the moment after someone shares something personal — your next line sets the tone. Match the register they just opened.",
    };
  }
  return {
    quote: "A measured exchange — neither warm nor cold.",
    lesson: "Polite is fine, but polite is also forgettable. Risk a slightly more specific question next time.",
  };
}

function pickInsights(
  transcript: TranscriptEntry[],
  values: number[],
): { whatWorked: WhatItem[]; worthNoticing: WhatItem[] } {
  // For each model msg with interestLevel, find delta from previous and the preceding user line.
  const beats: { idx: number; delta: number; userIdx: number; userText: string }[] = [];
  let prev = values[0] ?? 50;
  for (let i = 0; i < transcript.length; i++) {
    const m = transcript[i];
    if (m.speaker === "model" && m.interestLevel !== undefined) {
      if (i === 0) {
        prev = m.interestLevel;
        continue;
      }
      let userIdx = -1;
      let userText = "";
      for (let j = i - 1; j >= 0; j--) {
        if (transcript[j].speaker === "user") {
          userIdx = j;
          userText = transcript[j].text;
          break;
        }
      }
      if (userIdx >= 0) {
        beats.push({ idx: i, delta: m.interestLevel - prev, userIdx, userText });
      }
      prev = m.interestLevel;
    }
  }
  const positive = [...beats].filter((b) => b.delta > 0).sort((a, b) => b.delta - a.delta);
  const negative = [...beats].filter((b) => b.delta < 0).sort((a, b) => a.delta - b.delta);

  function workedComment(idx: number, delta: number): string {
    if (idx === 0) {
      return delta > 12
        ? "They visibly opened up here — your strongest moment in the conversation."
        : "A clean little lift. Felt natural, not forced.";
    }
    return "A second moment that nudged the temperature up — the pattern is more important than the size.";
  }

  function noticeComment(idx: number, delta: number): string {
    if (idx === 0) {
      return delta < -15
        ? "The sharp drop. Replay what came right before — that's where the misread happened."
        : "A small cool-down. Worth re-reading what kind of question you led with.";
    }
    return "Another dip later in the conversation. Same shape repeating — small misses adding up.";
  }

  // Dedupe by user line so the same sentence doesn't appear twice in a list.
  const seenLines = new Set<string>();
  const pickUnique = (items: typeof beats, max: number) => {
    const out: typeof beats = [];
    for (const b of items) {
      if (seenLines.has(b.userText)) continue;
      seenLines.add(b.userText);
      out.push(b);
      if (out.length >= max) break;
    }
    return out;
  };

  const whatWorked: WhatItem[] = pickUnique(positive, 2).map((b, i) => ({
    line: b.userText,
    comment: workedComment(i, b.delta),
    transcriptIndex: b.userIdx,
  }));

  const worthNoticing: WhatItem[] = pickUnique(negative, 2).map((b, i) => ({
    line: b.userText,
    comment: noticeComment(i, b.delta),
    transcriptIndex: b.userIdx,
  }));

  return { whatWorked, worthNoticing };
}

export function buildLiveSession(messages: ChatMessage[]): Session {
  const now = Date.now();
  const transcript: TranscriptEntry[] = messages.map((m, i) => ({
    speaker: m.role,
    text: m.text,
    timestamp: now + i * 1000,
    interestLevel: m.interestLevel,
  }));

  const values = transcript
    .filter((t) => t.speaker === "model" && t.interestLevel !== undefined)
    .map((t) => t.interestLevel as number);

  const lesson = genericLesson(values);
  const { whatWorked, worthNoticing } = pickInsights(transcript, values);

  return {
    transcript,
    analysis: {
      heroMoment: lesson,
      curveSummary: describeTrajectory(values),
      whatWorked,
      worthNoticing,
      transcriptAnnotations: {},
    },
  };
}
