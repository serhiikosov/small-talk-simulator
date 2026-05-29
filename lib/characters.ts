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
    connectorVideo?: string;
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
    voice: "Algenib",
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
  {
    id: "jessica",
    name: "Jessica",
    age: 49,
    avatar: "🛗",
    portrait: "/images/jessica.png",
    shortDescription: "the VP whose project you've been dying to join",
    location:
      "Sleek corporate elevator — brushed steel walls, soft overhead light, glass panel above the doors showing floor numbers.",
    situation:
      "Tuesday morning in the office. You step into the elevator — eleven floors to go. A hand catches the closing doors and your stomach drops: it's Jessica, the VP two levels above you, the one whose team you've wanted to be on for months. The doors slide shut. Just the two of you.",
    fullDescription:
      "Jessica, 49. Dark shoulder-length hair, calm hazel eyes, navy tailored suit over a cream silk blouse. Sharp, time-conscious, but warmer than her reputation suggests when someone earns her attention.",
    firstLine:
      "Aren't you on the product team, leading the accessibility redesign? Your name keeps coming up in leadership reviews. Good to finally put a face to it.",
    optionPositive:
      "That's me, the accessibility redesign. It's been a ride, honestly. We just hit a number nobody saw coming. I'd love your read on it.",
    optionNegative:
      "Oh wow, thank you! Yeah, that's me – honestly it's been such a team effort, though. Everyone's put in so much work.",
    positiveReply:
      "A number nobody saw coming – okay, you have my attention. Which number are we talking about? I've heard the rumors, never the data.",
    negativeReply:
      "That's good to hear, sounds like a strong team. Pass along my congratulations to all of them. Ah, this is my floor. Take care.",
    systemPrompt: `You are Jessica, 49, a VP at a mid-sized tech company — two levels above the person you're talking to. You bumped into them in the elevator and recognized them as the lead on the accessibility redesign, whose name keeps coming up in leadership reviews. You're sharp, direct, time-conscious, but you engage genuinely when someone brings substance. You speak naturally in English.

Rules:
- Respond in 1-3 short sentences, like real elevator small talk.
- If they bring concrete numbers, a real opinion, or a sharp observation, you lean in and offer a real follow-up ("send it over", "come walk us through it", "I want my team to see this").
- If they deflect with humility, vagueness, or jargon, you stay polite but clipped — wrap up with a thank-you-to-the-team line and step off at your floor.
- If they try to angle for a role, a favor, or office gossip, you redirect firmly and politely.
- Always reply in English.`,
    gradient: "from-slate-500/40 via-indigo-500/30 to-blue-600/40",
    voice: "Charon",
    initialHints: [
      "That's me — and I'd actually love your read on a number we just hit.",
      "Oh, thank you — it's really been a team effort.",
    ],
    level2: {
      options: {
        positive:
          "Activation jumped forty percent in week one. And honestly, we don't fully know why yet. That's the fun part. Can I send you the breakdown?",
        negative:
          "Oh, it's complicated – a few things are moving: activation, retention, churn. We are not sure yet. I'd need more time to explain properly.",
      },
      replies: {
        positive:
          "Forty percent, and you don't know why – that's exactly what my team should see. Send it over, then come walk us through it.",
        negative:
          "Hm. Well, send it over once you've had a chance to dig in properly, my team will take a look. Anyway – this is me. Good to meet you.",
      },
      videos: { positive: "positive-l2-pos", negative: "positive-l2-neg" },
    },
    subtitles: {
      intro:
        "Aren't you on the product team, leading the accessibility redesign? Your name keeps coming up in leadership reviews. Good to finally put a face to it.",
      positive:
        "A number nobody saw coming – okay, you have my attention. Which number are we talking about? I've heard the rumors, never the data.",
      negative:
        "That's good to hear, sounds like a strong team. Pass along my congratulations to all of them. Ah, this is my floor. Take care.",
      "positive-l2-pos":
        "Forty percent, and you don't know why – that's exactly what my team should see. Send it over, then come walk us through it.",
      "positive-l2-neg":
        "Hm. Well, send it over once you've had a chance to dig in properly, my team will take a look. Anyway – this is me. Good to meet you.",
    },
    continueHints: {
      "positive-positive": [
        "Will do. Mind if I loop in our research lead on the note?",
        "Honestly, while I have you — any chance you'd back a small SMB pilot?",
      ],
      "positive-negative": [
        "Sorry — let me rephrase. The dollar figure was clear, but the customer story behind it wasn't.",
        "Yeah, you're right, I was overthinking it.",
      ],
      negative: [
        "Sorry — that was a weird answer. I did want to say I liked your framing on Monday.",
        "Anyway, have a good weekend.",
      ],
    },
  },
  {
    id: "sam",
    name: "Sam",
    age: 32,
    avatar: "📚",
    portrait: "/images/sam.jpg",
    shortDescription: "your old friend from college",
    location:
      "Saturday afternoon on a sunlit side street outside an independent bookshop — string lights in the window, people drifting past, the warm hum of a weekend.",
    situation:
      "Saturday afternoon. You're stepping out of the bookshop when you hear your name. You turn around – and see Sam, your old friend from college. You haven't seen them since Mike's wedding, four years ago.",
    fullDescription:
      "Sam, 32. Warm, easy-going energy, dark hair, a faded blue-grey tee, a backpack slung over one shoulder. The kind of friend who'd drop everything to hear how you've actually been.",
    firstLine:
      "No, no way! I didn't expect to run into you here either! What a pleasant surprise. How long has it been?!",
    optionPositive:
      "Leave it to me to make an entrance. Since Mike's wedding, right? I've missed you and thought about texting you so many times and never did...",
    optionNegative:
      "Oh my, I'm so sorry, I'm such a mess! Wow – you look incredible, it's been ages. How have you been?!",
    positiveReply:
      "Oh my god, SAME. I figured you got too important for the rest of us now. What are you up to these days?",
    negativeReply:
      "Aw, you too! Good, you know – busy, busy. We should totally catch up sometime!",
    systemPrompt: `You are Sam, 32, an old close friend from college. You're running into your friend by accident outside a bookshop on a Saturday afternoon. You haven't seen them since Mike's wedding, four years ago. You're warm, excited, genuine — but also a real human with a life now, so you'd notice if something felt off. You speak naturally in English.

Rules:
- Respond in 1-3 short sentences, like real spontaneous friend-energy.
- If they're warm, present, and trying to actually reconnect (specific dates, calling out the gap, suggesting a real meet-up), you match that — get excited, lock something in, joke about how easy it was to drift apart.
- If they're vague, performative, or just doing the "we should totally hang out!" dance, you stay friendly but cooler — you've heard that before. You'd wrap up politely.
- If they bring up real, harder topics (Mike's wedding, why you fell out of touch, life shake-ups), you go there honestly but kindly.
- Always reply in English.`,
    gradient: "from-amber-500/40 via-rose-400/30 to-orange-500/40",
    voice: "Puck",
    initialHints: [
      "Honestly? Mike's wedding. I think about texting you constantly.",
      "I've been good, busy — you know how it goes.",
    ],
    level2: {
      options: {
        positive:
          "Right now? Standing here refusing to let four more years go by. Are you free Thursday around 8 pm? Let's get actual dinner – I'll text you a place.",
        negative:
          "Heading home, but we HAVE to do this properly! Here, save my number – we'll grab dinner so soon, I promise. So good seeing you!",
      },
      replies: {
        positive:
          "Yes. Thursday. I'm putting it in my calendar right now so you can't escape.",
        negative:
          "Totally, yes – let's do it! Okay, I've really gotta run. So great to see you!",
      },
      videos: { positive: "positive-l2-pos", negative: "positive-l2-neg" },
    },
    subtitles: {
      intro:
        "No, no way! I didn't expect to run into you here either! What a pleasant surprise. How long has it been?!",
      positive:
        "Oh my god, SAME. I figured you got too important for the rest of us now. What are you up to these days?",
      negative:
        "Aw, you too! Good, you know – busy, busy. We should totally catch up sometime!",
      "positive-l2-pos":
        "Yes. Thursday. I'm putting it in my calendar right now so you can't escape.",
      "positive-l2-neg":
        "Totally, yes – let's do it! Okay, I've really gotta run. So great to see you!",
    },
    continueHints: {
      "positive-positive": [
        "Thursday it is. Also — be honest, why do you think we lost touch?",
        "Wait, before you go — are you still living in Brooklyn?",
      ],
      "positive-negative": [
        "Wait — I actually mean it. Pick a Thursday in the next two weeks.",
        "Okay, no pressure. Just — don't disappear for another four years, yeah?",
      ],
      negative: [
        "Honestly, can we not do the 'we should hang' thing? Let me pick a real day.",
        "Anyway, take care — go enjoy your Saturday.",
      ],
    },
  },
];

export function getCharacter(id: string): Character | undefined {
  return characters.find((c) => c.id === id);
}
