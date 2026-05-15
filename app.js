const scenario = {
  name: "The Coffee Line",
  eyebrow: "Small Talk Module",
  setup: "Monday, 9am. Office kitchen. A familiar colleague picks the machine next to you.",
  tags: ["~4 min", "2 decisions", "Office"],
  character: "Sam, two desks over",
  transcript:
    "Honestly, I've been getting weirdly into bread baking lately — failing at sourdough mostly. You?",
  lessons: [
    {
      title: "Open the door",
      body: 'A specific hook beats a polite mirror. "Ceramics" is a thread. "Good" is a wall.',
    },
    {
      title: "Catch the thread",
      body: "When they give you a thread, pull it. Specifics invite specifics.",
    },
    {
      title: "Speak it yourself",
      body: "Specific, light, and bounced back in one breath.",
    },
  ],
  videoBeats: {
    intro: [
      {
        stage: "The coffee machine hums. Sam reaches for a mug beside you.",
        line: "Morning. How was the weekend?",
      },
      {
        stage: "He half-smiles, waiting just long enough for a real answer.",
        line: "No pressure. Just office-kitchen small talk.",
      },
    ],
    step2: [
      {
        stage: "Sam turns back toward the counter, still amused by the ceramics detail.",
        line: "Pottery, huh? Was at a class with my niece last summer.",
      },
      {
        stage: "He shakes his head like he still remembers the mess.",
        line: "Harder than it looks.",
      },
    ],
    step3: [
      {
        stage: "The coffee finishes. The conversation is still alive.",
        line: "You into anything outside work?",
      },
      {
        stage: "Sam leans against the counter, curious now.",
        line: "Like, real hobbies?",
      },
    ],
  },
  steps: [
    {
      id: 1,
      label: "Step 1 of 3 · Open the door",
      prompt: "How was the weekend?",
      attribution: "Sam, two desks over",
      videoKey: "intro",
      options: [
        {
          text: "Good, thanks. You?",
          kind: "closed",
          pathLabel: "Good, thanks. You?",
          reaction: [
            {
              stage: "He nods politely and watches the coffee pour.",
              line: "Yeah, mine too. Anyway — see you in standup.",
            },
            {
              stage: "The machine clicks. The moment ends cleanly.",
              line: "Nothing bad happened. Nothing opened either.",
            },
          ],
          insight: {
            tone: "warning",
            status: "Conversation closed",
            headline: "The mirror move kept it polite, but gave Sam nowhere to go.",
            quote: 'Sam: "Yeah, mine too. Anyway — see you in standup."',
            primary: "Try again",
            secondary: "Skip to Step 2",
          },
        },
        {
          text: "Honestly weird — got into ceramics for some reason. You?",
          kind: "alive",
          pathLabel: "Honestly weird — got into ceramics.",
          reaction: [
            {
              stage: "He laughs, surprised, and turns to face you.",
              line: "Wait — ceramics?",
            },
            {
              stage: "His coffee is suddenly not the main event.",
              line: "Like wheel ceramics or the painting kind?",
            },
          ],
          insight: {
            tone: "success",
            status: "Conversation alive",
            headline: "One concrete detail gave Sam a real thread to catch.",
            quote: 'Sam: "Wait — ceramics? Like wheel ceramics or the painting kind?"',
            primary: "Continue → Step 2",
          },
        },
      ],
    },
    {
      id: 2,
      label: "Step 2 of 3 · Catch the thread",
      prompt: "Pottery, huh? Was at a class with my niece last summer. Harder than it looks.",
      attribution: "Sam, two desks over",
      videoKey: "step2",
      options: [
        {
          text: "Yeah, I bet.",
          kind: "closed",
          pathLabel: "Yeah, I bet.",
          reaction: [
            {
              stage: "Sam nods once, friendly but out of runway.",
              line: "Yeah.",
            },
            {
              stage: "A small silence stretches between coffee drips.",
              line: "The topic stays on the surface.",
            },
          ],
          insight: {
            tone: "warning",
            status: "Surface stayed surface",
            headline: "You acknowledged the thread, but did not pull it.",
            quote: 'Sam: "Yeah."',
            primary: "Try again",
            secondary: "Skip to Step 3",
          },
        },
        {
          text: "Wait — how old is she?",
          kind: "alive",
          pathLabel: "Wait — how old is she?",
          reaction: [
            {
              stage: "He smiles and leans on the counter.",
              line: "She's seven.",
            },
            {
              stage: "The memory gets more specific as soon as you ask.",
              line: "Determined to make a mug for her dad.",
            },
          ],
          insight: {
            tone: "success",
            status: "Going deeper",
            headline: "You caught Sam's thread and invited the real story.",
            quote: 'Sam: "She\'s seven. Determined to make a mug for her dad."',
            primary: "Continue → Step 3",
          },
        },
      ],
    },
    {
      id: 3,
      label: "Step 3 of 3 · Speak it yourself",
      prompt: "You into anything outside work? Like, real hobbies?",
      attribution: "Sam, two desks over",
      videoKey: "step3",
      hints: ["Specific", "Light", "Bounce it back"],
      reaction: [
        {
          stage: "Sam looks up, genuinely caught by the answer.",
          line: "Oh — sourdough, really?",
        },
        {
          stage: "He laughs, curious instead of just polite.",
          line: "What's your fail rate?",
        },
      ],
    },
  ],
};

const app = document.querySelector("#app");
const timers = new Set();

const icons = {
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  mic: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 14.5a3.5 3.5 0 0 0 3.5-3.5V6a3.5 3.5 0 0 0-7 0v5a3.5 3.5 0 0 0 3.5 3.5Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M18.5 10.5a6.5 6.5 0 0 1-13 0M12 17v4M9 21h6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  replay: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7M3 4v6h6" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  redirect: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h7.5a4.5 4.5 0 0 1 0 9H4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 12 4 16l4 4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

const state = {
  screen: "intro",
  currentStep: 1,
  selected: {},
  elapsed: 0,
};

function clearTimers() {
  timers.forEach((timer) => clearTimeout(timer));
  timers.clear();
}

function setTimed(callback, delay) {
  const timer = setTimeout(() => {
    timers.delete(timer);
    callback();
  }, delay);
  timers.add(timer);
}

function navigate(screen, patch = {}) {
  clearTimers();
  Object.assign(state, patch, { screen });
  render();
}

function stepById(id) {
  return scenario.steps.find((step) => step.id === id);
}

function dots(currentStep) {
  return [1, 2, 3]
    .map((step) => {
      const className = step < currentStep ? "done" : step === currentStep ? "active" : "";
      return `<span class="dot ${className}"></span>`;
    })
    .join("");
}

function backButton(action = "intro") {
  return `<button class="icon-button" data-action="${action}" aria-label="Back">${icons.back}</button>`;
}

function header(step, backAction = "intro") {
  return `
    <header class="header-bar">
      ${backButton(backAction)}
      <div class="header-center">
        <p class="eyebrow">Small Talk · ${scenario.name}</p>
        <p class="step-label">${step.label}</p>
        <div class="dots" aria-label="Step ${step.id} of 3">${dots(step.id)}</div>
      </div>
      <span></span>
    </header>
  `;
}

function renderIntro() {
  app.innerHTML = `
    <section class="screen intro-screen">
      <div class="content intro-content">
        <p class="eyebrow">${scenario.eyebrow}</p>
        <h1 class="title">${scenario.name}</h1>
        <p class="subtitle">${scenario.setup}</p>
        <div class="tag-row">
          ${scenario.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
        </div>
        <div class="step-preview">
          ${scenario.lessons
            .map(
              (lesson, index) => `
                <article class="preview-card ${index === 2 ? "voice" : ""}">
                  <span class="badge">${index + 1}</span>
                  <span class="preview-label">
                    <strong>${lesson.title}</strong>
                    <span>${index === 0 ? "Recognize the pattern" : index === 1 ? "Apply it to a harder beat" : "Produce it in your own words"}</span>
                  </span>
                  ${index === 2 ? `<span class="preview-icon">${icons.mic}</span>` : ""}
                </article>
              `,
            )
            .join("")}
        </div>
        <button class="primary-button" data-action="begin">Begin</button>
      </div>
    </section>
  `;
}

function stillSvg(mood) {
  const warm = mood === "warm";
  const cool = mood === "cool";
  const purple = mood === "purple";
  const bgA = warm ? "#24110b" : purple ? "#141024" : "#071519";
  const bgB = warm ? "#e8895a" : purple ? "#7c5cfc" : "#3ba5b5";
  const skinHi = warm ? "#f2bb8d" : purple ? "#d8b3a6" : "#b88878";
  const skinMid = warm ? "#9c593d" : purple ? "#805774" : "#5e7478";
  const skinShadow = warm ? "#24100d" : purple ? "#151026" : "#071317";
  const shirt = warm ? "#163038" : purple ? "#201938" : "#0c2a31";

  return `
    <svg class="still" viewBox="0 0 430 760" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="bg" cx="38%" cy="32%" r="82%">
          <stop offset="0%" stop-color="${bgB}" stop-opacity="0.62"/>
          <stop offset="42%" stop-color="${bgA}"/>
          <stop offset="100%" stop-color="#020306"/>
        </radialGradient>
        <radialGradient id="face" cx="38%" cy="31%" r="62%">
          <stop offset="0%" stop-color="${skinHi}"/>
          <stop offset="48%" stop-color="${skinMid}"/>
          <stop offset="82%" stop-color="${skinShadow}"/>
          <stop offset="100%" stop-color="#030305"/>
        </radialGradient>
        <radialGradient id="faceShade" cx="68%" cy="44%" r="72%">
          <stop offset="0%" stop-color="#1d0e0d" stop-opacity="0"/>
          <stop offset="56%" stop-color="#130b0f" stop-opacity="0.26"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0.88"/>
        </radialGradient>
        <radialGradient id="vignette" cx="50%" cy="42%" r="75%">
          <stop offset="0%" stop-color="#000" stop-opacity="0"/>
          <stop offset="55%" stop-color="#000" stop-opacity="0"/>
          <stop offset="88%" stop-color="#000" stop-opacity="0.88"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0.94"/>
        </radialGradient>
        <filter id="bgBlur">
          <feGaussianBlur stdDeviation="10"/>
        </filter>
        <filter id="softFeature">
          <feGaussianBlur stdDeviation="4"/>
        </filter>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" stitchTiles="stitch"/>
          <feColorMatrix type="saturate" values="0"/>
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.055"/>
          </feComponentTransfer>
        </filter>
      </defs>
      <rect width="430" height="760" fill="url(#bg)"/>
      <g filter="url(#bgBlur)" opacity="0.66">
        <ellipse cx="100" cy="198" rx="92" ry="126" fill="#fff1d6" opacity="0.15"/>
        <ellipse cx="334" cy="184" rx="118" ry="150" fill="${cool ? "#7be5ff" : "#ffad76"}" opacity="0.14"/>
        <rect x="46" y="430" width="330" height="210" rx="70" fill="#1a2024" opacity="0.5"/>
      </g>
      <g transform="translate(0 18)">
        <path d="M124 703c10-112 42-187 96-187s91 75 102 187H124Z" fill="${shirt}" opacity="0.96"/>
        <ellipse cx="218" cy="328" rx="102" ry="137" fill="url(#face)"/>
        <ellipse cx="218" cy="328" rx="103" ry="138" fill="url(#faceShade)"/>
        <path d="M127 284c15-75 53-116 109-111 54 4 91 42 96 113-39-31-87-45-146-37-22 3-42 14-59 35Z" fill="#100908" opacity="0.76" filter="url(#softFeature)"/>
        <ellipse cx="181" cy="324" rx="28" ry="18" fill="#09070a" opacity="0.48" filter="url(#softFeature)"/>
        <ellipse cx="256" cy="319" rx="30" ry="20" fill="#07070a" opacity="0.56" filter="url(#softFeature)"/>
        <circle cx="191" cy="318" r="2.7" fill="#fff8dc" opacity="0.78"/>
        <circle cx="265" cy="313" r="2.2" fill="#fff8dc" opacity="0.7"/>
        <ellipse cx="220" cy="378" rx="18" ry="34" fill="#43251f" opacity="0.24" filter="url(#softFeature)"/>
        <ellipse cx="222" cy="428" rx="${warm ? 39 : 32}" ry="${warm ? 14 : 10}" fill="${warm ? "#5e2d29" : "#231518"}" opacity="0.58" filter="url(#softFeature)"/>
        <ellipse cx="165" cy="402" rx="26" ry="20" fill="#f8b983" opacity="${warm ? "0.16" : "0.08"}" filter="url(#softFeature)"/>
      </g>
      <rect width="430" height="760" filter="url(#grain)"/>
      <rect width="430" height="760" fill="url(#vignette)"/>
    </svg>
  `;
}

function renderVideo() {
  const step = stepById(state.currentStep);
  const beats = state.beats || scenario.videoBeats[step.videoKey] || step.reaction;
  const isReaction = Boolean(state.selected[step.id]) || state.isVoiceReaction;
  const duration = state.duration || 5800;
  const mood = state.mood || (isReaction ? "warm" : "cool");

  app.innerHTML = `
    <section class="screen video-screen">
      ${stillSvg(mood)}
      <div class="content video-content">
        <div>
          <div class="top-row">
            ${backButton(state.currentStep === 1 ? "intro" : `decision:${Math.max(1, state.currentStep - 1)}`)}
            <div class="header-center">
              <p class="eyebrow">${isReaction ? "His reaction" : `Small Talk · ${scenario.name}`}</p>
              <p class="step-label">${step.label}</p>
              <div class="dots">${dots(step.id)}</div>
            </div>
            <span></span>
            ${
              state.pathLabel
                ? `<div class="path-pill pill"><span class="icon-inline">${icons.check}</span><span>You said: "${state.pathLabel}"</span></div>`
                : ""
            }
          </div>
          <div class="progress-track"><span class="progress-fill" style="animation-duration: ${duration}ms"></span></div>
        </div>

        <div class="caption-wrap" id="caption"></div>
      </div>
      <button class="ghost-button skip-button" data-action="video-next">Skip ›</button>
    </section>
  `;

  runCaptions(beats, duration);
  setTimed(videoNext, duration);
}

function runCaptions(beats, duration) {
  const caption = document.querySelector("#caption");
  const beatDuration = duration / beats.length;
  const drawBeat = (beat) => {
    caption.innerHTML = `
      <p class="caption-stage">${beat.stage}</p>
      <p class="caption-line">${beat.line}</p>
    `;
  };
  beats.forEach((beat, index) => {
    if (index === 0) {
      drawBeat(beat);
    } else {
      setTimed(() => drawBeat(beat), Math.round(beatDuration * index + 240));
    }
  });
}

function videoNext() {
  const step = stepById(state.currentStep);

  if (state.isVoiceReaction) {
    navigate("result", { isVoiceReaction: false });
    return;
  }

  if (state.selected[step.id]) {
    navigate("insight");
    return;
  }

  if (step.id === 3) {
    navigate("voice");
    return;
  }

  navigate("decision");
}

function renderDecision() {
  const step = stepById(state.currentStep);

  app.innerHTML = `
    <section class="screen decision-screen">
      <div class="content decision-content">
        ${header(step, step.id === 1 ? "intro" : `video:${step.id}`)}
        <section class="decision-main">
          <span class="pill decision-pill">Decision Point</span>
          <h2 class="prompt-quote">"${step.prompt}"</h2>
          <p class="attribution">— ${step.attribution}</p>
          <button class="ghost-button replay-button" data-action="replay">
            <span class="icon-inline">${icons.replay}</span>
            Replay scene
          </button>
        </section>
        <div class="option-stack">
          ${step.options
            .map(
              (option, index) =>
                `<button class="option-card" data-action="choose" data-option="${index}">${option.text}</button>`,
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function chooseOption(index) {
  const step = stepById(state.currentStep);
  const option = step.options[index];
  state.selected[step.id] = option;
  navigate("video", {
    beats: option.reaction,
    pathLabel: option.pathLabel,
    mood: option.kind === "alive" ? "warm" : "cool",
    duration: 5700,
  });
}

function renderInsight() {
  const step = stepById(state.currentStep);
  const option = state.selected[step.id];
  const insight = option.insight;
  const success = insight.tone === "success";

  app.innerHTML = `
    <section class="screen insight-screen ${success ? "success" : "warning"}">
      <div class="content insight-content">
        <div>
          <div class="status-icon">${success ? icons.check : icons.redirect}</div>
          <p class="status-label">${insight.status}</p>
        </div>
        <h2 class="insight-headline">${insight.headline}</h2>
        <article class="quote-card">${insight.quote}</article>
        <article class="lesson-card">
          <p class="eyebrow">Lesson ${step.id}</p>
          <p class="lesson-body">${scenario.lessons[step.id - 1].body}</p>
        </article>
        <div class="button-stack">
          <button class="primary-button" data-action="${success ? "continue" : "try-again"}">${insight.primary}</button>
          ${
            insight.secondary
              ? `<button class="secondary-button" data-action="skip-step">${insight.secondary}</button>`
              : ""
          }
        </div>
      </div>
    </section>
  `;
}

function continueFromInsight() {
  if (state.currentStep === 1) {
    delete state.selected[2];
    navigate("video", {
      currentStep: 2,
      beats: null,
      pathLabel: null,
      mood: "warm",
      duration: 5700,
    });
  } else if (state.currentStep === 2) {
    navigate("video", {
      currentStep: 3,
      beats: scenario.videoBeats.step3,
      pathLabel: null,
      mood: "purple",
      duration: 5600,
    });
  }
}

function renderVoice() {
  const step = stepById(3);
  app.innerHTML = `
    <section class="screen voice-screen">
      <div class="content voice-content">
        ${header(step, "video:3")}
        <section class="voice-main">
          <span class="pill decision-pill purple">Speak up</span>
          <h2 class="prompt-quote">"${step.prompt}"</h2>
          <p class="attribution">— ${step.attribution}</p>
          <div class="hint-row">
            ${step.hints.map((hint) => `<span class="tag hint-chip">${hint}</span>`).join("")}
          </div>
          <div class="mic-wrap">
            <span class="mic-ring"></span>
            <span class="mic-ring second"></span>
            <button class="mic-button" data-action="record" aria-label="Start recording">${icons.mic}</button>
          </div>
          <p class="record-note">Tap to record · ~10 sec</p>
        </section>
      </div>
    </section>
  `;
}

function renderRecording() {
  const step = stepById(3);
  state.elapsed = 0;

  app.innerHTML = `
    <section class="screen recording-screen">
      <div class="content recording-content">
        ${header(step, "voice")}
        <article class="question-card">Sam asked: "${step.prompt}"</article>
        <section class="recording-main">
          <div class="mic-wrap">
            <span class="mic-ring"></span>
            <span class="mic-ring second"></span>
            <div class="mic-button recording-mic">${icons.mic}</div>
          </div>
          <div class="waveform" aria-hidden="true">
            ${Array.from({ length: 9 }, () => '<span class="bar"></span>').join("")}
          </div>
          <p class="listening">LISTENING</p>
          <p class="timer" id="timer">0:00</p>
        </section>
        <div class="stop-wrap">
          <button class="stop-button" data-action="stop-recording" aria-label="Stop recording">
            <span class="stop-square"></span>
          </button>
          <p class="hint-text">Tap to stop · Sam will react to what you say</p>
        </div>
      </div>
    </section>
  `;

  startTimer();
}

function startTimer() {
  const tick = () => {
    const timer = document.querySelector("#timer");
    if (!timer || state.screen !== "recording") {
      return;
    }
    timer.textContent = `0:0${state.elapsed}`;
    if (state.elapsed >= 8) {
      analyzeRecording();
      return;
    }
    state.elapsed += 1;
    setTimed(tick, 1000);
  };
  tick();
}

function analyzeRecording() {
  clearTimers();
  app.insertAdjacentHTML(
    "beforeend",
    `
      <div class="overlay">
        <div class="overlay-card">
          <span class="spinner"></span>
          <span>Reading your reply…</span>
        </div>
      </div>
    `,
  );
  setTimed(() => {
    const step = stepById(3);
    navigate("video", {
      currentStep: 3,
      beats: step.reaction,
      isVoiceReaction: true,
      pathLabel: "sourdough mostly. You?",
      mood: "warm",
      duration: 5600,
    });
  }, 1500);
}

function renderResult() {
  app.innerHTML = `
    <section class="screen result-screen">
      <div class="content result-content">
        <span class="pill completion-badge"><span class="icon-inline">${icons.check}</span>3 of 3 complete</span>
        <h2 class="result-headline">You held a real conversation.</h2>
        <div class="recap-list">
          ${scenario.lessons
            .map(
              (lesson, index) => `
                <article class="recap-card">
                  <span class="badge">${index + 1}</span>
                  <span>
                    <strong>${lesson.title}</strong>
                    <span>${lesson.body}</span>
                  </span>
                </article>
              `,
            )
            .join("")}
        </div>
        <article class="transcript-card">
          <p class="card-title"><span class="icon-inline">${icons.mic}</span>Your reply</p>
          <p>"${scenario.transcript}"</p>
        </article>
        <article class="insight-card">
          <p class="card-title">Why it landed</p>
          <p>Specific (sourdough), light (failing), bounced back (you?). All three lessons in one breath.</p>
        </article>
        <div class="button-stack result-actions">
          <button class="primary-button" data-action="restart">Try another scenario</button>
          <button class="secondary-button" data-action="done">Done</button>
        </div>
      </div>
    </section>
  `;
}

function render() {
  clearTimers();
  if (state.screen === "intro") renderIntro();
  if (state.screen === "video") renderVideo();
  if (state.screen === "decision") renderDecision();
  if (state.screen === "insight") renderInsight();
  if (state.screen === "voice") renderVoice();
  if (state.screen === "recording") renderRecording();
  if (state.screen === "result") renderResult();
}

app.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const action = button.dataset.action;
  if (action === "begin") {
    navigate("video", { currentStep: 1, beats: scenario.videoBeats.intro, mood: "cool", duration: 5700 });
  }
  if (action === "intro") {
    state.selected = {};
    navigate("intro", { currentStep: 1, beats: null, pathLabel: null, mood: null });
  }
  if (action.startsWith("decision:")) {
    navigate("decision", { currentStep: Number(action.split(":")[1]), beats: null, pathLabel: null });
  }
  if (action.startsWith("video:")) {
    const id = Number(action.split(":")[1]);
    navigate("video", {
      currentStep: id,
      beats: scenario.videoBeats[stepById(id).videoKey],
      pathLabel: null,
      mood: id === 3 ? "purple" : "warm",
      duration: 5600,
    });
  }
  if (action === "video-next") videoNext();
  if (action === "replay") {
    const step = stepById(state.currentStep);
    navigate("video", {
      beats: scenario.videoBeats[step.videoKey],
      pathLabel: null,
      mood: step.id === 3 ? "purple" : "warm",
      duration: 5600,
    });
  }
  if (action === "choose") chooseOption(Number(button.dataset.option));
  if (action === "continue") continueFromInsight();
  if (action === "try-again") {
    delete state.selected[state.currentStep];
    navigate("decision", { beats: null, pathLabel: null });
  }
  if (action === "skip-step") {
    if (state.currentStep === 1) {
      navigate("video", { currentStep: 2, beats: scenario.videoBeats.step2, pathLabel: null, mood: "warm" });
    } else {
      navigate("video", { currentStep: 3, beats: scenario.videoBeats.step3, pathLabel: null, mood: "purple" });
    }
  }
  if (action === "record") navigate("recording");
  if (action === "voice") navigate("voice");
  if (action === "stop-recording") analyzeRecording();
  if (action === "restart") {
    state.selected = {};
    navigate("intro", { currentStep: 1, beats: null, pathLabel: null, mood: null });
  }
  if (action === "done") navigate("intro", { currentStep: 1, beats: null, pathLabel: null, mood: null });
});

render();
