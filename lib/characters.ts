export type Character = {
  id: string;
  name: string;
  age: number;
  avatar: string;
  portrait: string;
  shortDescription: string;
  location: string;
  situation: string;
  fullDescription: string;
  firstLine: string;
  positiveReply: string;
  negativeReply: string;
  optionPositive: string;
  optionNegative: string;
  systemPrompt: string;
  gradient: string;
  voice: string;
  initialHints: [string, string];
  level2?: {
    connectorVideo: string;
    options: { positive: string; negative: string };
    replies: { positive: string; negative: string };
    videos: { positive: string; negative: string };
  };
  negativeFollowup?: {
    video: string;
    reply: string;
  };
  // Accurate per-scene subtitles. Keyed by scene id returned from
  // phaseToScene() (e.g. "intro", "positive", "positive-followup", etc.).
  subtitles?: Record<string, string>;
  // Hint pairs shown when the user lands in chat after the interactive
  // scenario. Keyed by branch state: "positive", "negative",
  // "positive-positive", "positive-negative".
  continueHints?: Record<string, [string, string]>;
};

export const characters: Character[] = [
  {
    id: "linda",
    name: "Linda",
    age: 27,
    avatar: "🍷",
    portrait: "/images/linda.jpg",
    shortDescription: "Your son's girlfriend — first meeting",
    location:
      "Cozy American suburban living room — warm evening light from a side lamp, beige sofa with throw pillows, family photos and bookshelf in the background.",
    situation:
      "Sunday evening, your living room. Your son David, 28, brought his girlfriend Linda over for the first time. They've been together for almost a year, and he's mentioned she might be \"the one.\" David's in the kitchen helping with dinner. You and Linda are alone in the living room.",
    fullDescription:
      "Linda, 27. American, shoulder-length auburn hair with soft waves, warm brown eyes, fair complexion. Wearing a soft cream cardigan over a beige top, small delicate necklace. Holding a glass of red wine — slightly nervous body language. She really wants to make a good impression.",
    firstLine:
      "Thank you so much for having me over tonight. Your home is really beautiful — David's told me so much about you.",
    optionPositive:
      "Oh, thank you! Yeah, I got hooked on woodworking tutorials a few years back. David mentioned you've been getting into pottery lately. How's that going?",
    optionNegative:
      "Yeah, a while back. So how are things going with you and David?",
    positiveReply:
      "I'm so glad you asked about pottery! I started during the pandemic, honestly — it's become such a grounding thing for me.",
    negativeReply:
      "Oh... um, almost a year now. I — I really care about him, if that's what you're asking. He means a lot to me.",
    systemPrompt: `You are Linda, a 27-year-old American woman. You're meeting your boyfriend David's parent for the very first time at their home. You and David have been together for almost a year. You're polite, warm, and slightly nervous — you really want to make a good impression. You speak naturally in English.

Rules:
- Respond in 1-3 short sentences, like real small talk.
- If the parent is warm and curious, you open up — share things about your work, how you met David, what you love about him.
- If the parent asks invasive, hostile, or weirdly personal questions (money, your past relationships, religion, politics), you stay polite but visibly uncomfortable.
- If the conversation gets way off-topic, rude, or crosses a line, you politely excuse yourself ("I should go see if David needs a hand in the kitchen...").
- Always reply in English.`,
    gradient: "from-amber-500/40 via-rose-400/30 to-orange-500/40",
    voice: "Leda",
    initialHints: [
      "Please, make yourself at home — we've been excited to meet you too.",
      "So, how serious is this thing with David exactly?",
    ],
    level2: {
      connectorVideo: "positive-followup",
      options: {
        positive:
          "Actually yes — I do woodworking. There's something meditative about working with your hands.",
        negative:
          "Not really, work eats all my time. So tell me — how serious is this thing with David?",
      },
      replies: {
        positive:
          "Oh that's so cool — I'd love to see something you made sometime. Working with your hands really does something for your head, doesn't it?",
        negative:
          "Almost a year now. I — I really care about him. He's been so kind, and his family clearly means a lot to him.",
      },
      videos: { positive: "positive-l2-pos", negative: "positive-l2-neg" },
    },
    negativeFollowup: {
      video: "negative-followup",
      reply:
        "You know what — let me go check if David needs a hand in the kitchen. Excuse me.",
    },
    subtitles: {
      intro:
        "You have such a beautiful home. David mentioned you restored that hutch over there.",
      positive:
        "I'm so glad you asked about pottery. It started as a hobby and now I even supply the café with mugs. It feels incredible.",
      negative: "Oh, um, we're doing really well. Everything's good.",
      "positive-followup":
        "I started during the pandemic. It's been so grounding for me. Do you have anything like that?",
      "positive-l2-pos":
        "Oh, that's so cool. I'd love to see something you made sometime.",
      "positive-l2-neg":
        "Almost a year. You know, I should go see if David needs a hand. Excuse me.",
      "negative-followup":
        "You know what? Let me go check if David needs a hand. Excuse me.",
    },
    continueHints: {
      "positive-positive": [
        "I'll bring some of my pieces next time. How did you two actually meet?",
        "Sounds great. Just curious — is David serious about you, or is this still casual?",
      ],
      "positive-negative": [
        "Sorry — I didn't mean to put you on the spot. What made you fall for David?",
        "I just want to know if you're in this for the long haul.",
      ],
      negative: [
        "Sorry, that came out wrong. Let me start over — tell me about your pottery.",
        "Okay but seriously — how do you two split rent?",
      ],
    },
  },
  {
    id: "mark",
    name: "Mark",
    age: 52,
    avatar: "☕",
    portrait: "/images/mark.jpg",
    shortDescription: "New senior on your team",
    location:
      "Modern American corporate office kitchen — soft morning light from a window, espresso machine and white cabinets in the background, small coffee mug shelf.",
    situation:
      "Monday, 9:15 AM. You're getting coffee in the office kitchen. Mark joined your team two weeks ago — a senior hire who moved over from another company. You've crossed paths but haven't really talked yet.",
    fullDescription:
      "Mark, 52. American, salt-and-pepper hair neatly cut, trimmed gray beard, warm blue-gray eyes with slight smile lines. Navy button-down over a white undershirt, sleeves rolled up once. Confident, approachable posture. Senior backend engineer with deep experience.",
    firstLine:
      "Morning. You doing the coffee run, too? I'm still figuring this machine out — I'm pretty sure I made tea by accident on Tuesday.",
    optionPositive:
      "Ha, takes everyone a while. Welcome aboard — how's the transition been so far?",
    optionNegative:
      "Just hit the espresso button. Pretty self-explanatory, mate.",
    positiveReply:
      "Honestly, it's a lot. 20 years at one company and now I'm relearning everything. But the team's been great. Worked with Linda on the Henderson proposal last week — she really knows her stuff.",
    negativeReply:
      "Right. Thanks.",
    systemPrompt: `You are Mark, a 52-year-old American senior backend engineer who joined this team two weeks ago. You moved over from another company. You're warm but direct, with a dry sense of humor and a lot of experience. You appreciate substantive conversations and genuine curiosity. You speak naturally in English.

Rules:
- Respond in 1-3 short sentences, casual and professional.
- If the colleague is friendly and asks good questions, you share stories about your work, your move, your past projects.
- If the colleague asks invasive or inappropriate questions (your salary, personal life, religion, politics, office gossip), you politely redirect or wrap things up.
- If the conversation goes badly off-topic, gets uncomfortable, or feels like a waste of time, you politely excuse yourself ("Anyway, I should grab this coffee and get going — nice catching up.").
- Always reply in English.`,
    gradient: "from-sky-500/40 via-indigo-500/30 to-violet-500/40",
    voice: "Charon",
    initialHints: [
      "Ha, takes everyone a while. How's the transition been so far?",
      "Just hit the espresso button. It's pretty straightforward.",
    ],
    subtitles: {
      intro:
        "Morning. You doing the coffee run, too? I'm still figuring this machine out, but I'm pretty sure I made tea by accident on Tuesday.",
      positive:
        "Honestly, it's a lot. 20 years at one company and now I'm relearning everything. But the team's been great. Worked with Linda on the Henderson proposal last week — she really knows her stuff.",
      negative: "Right, thanks.",
    },
    continueHints: {
      positive: [
        "20 years is a lot. What made you finally jump?",
        "Honestly, what's the comp like here vs your old place?",
      ],
      negative: [
        "Sorry, that came out wrong. Welcome aboard — what team are you on?",
        "Suit yourself. Just trying to be friendly.",
      ],
    },
  },
];

export function getCharacter(id: string): Character | undefined {
  return characters.find((c) => c.id === id);
}
