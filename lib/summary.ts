export type Speaker = "linda" | "user";

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
export const SAMPLE_SESSION: Session = {
  transcript: [
    {
      speaker: "linda",
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
      speaker: "linda",
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
      speaker: "linda",
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
      speaker: "linda",
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
