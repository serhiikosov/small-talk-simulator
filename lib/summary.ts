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
