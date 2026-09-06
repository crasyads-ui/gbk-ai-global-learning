"use client";

import { useEffect, useRef, useState } from "react";

const languages = [
  "English","తెలుగు","हिन्दी","தமிழ்","ಕನ್ನಡ","മലയാളം","বাংলা",
  "Español","العربية","Français","Deutsch","Português","日本語","한국어","中文"
];

const scenarios = [
  {
    id: "meet",
    title: "Meet someone",
    icon: "👋",
    desc: "Introduce yourself and start a friendly conversation.",
    lessons: [
      ["Lesson 1 · Introduction", "Hello, my name is Alex. Nice to meet you.", "Introduce yourself simply."],
      ["Lesson 2 · Ask a question", "Hi! Where are you from?", "Ask a friendly question."],
      ["Lesson 3 · Continue", "That's nice! What do you do?", "Keep the conversation going."]
    ]
  },
  {
    id: "shopping",
    title: "Shopping",
    icon: "🛍️",
    desc: "Ask for prices, sizes and help in a shop.",
    lessons: [
      ["Lesson 1 · Ask the price", "Excuse me, how much is this?", "Ask the price politely."],
      ["Lesson 2 · Ask for a size", "Do you have this in a larger size?", "Ask about another size."],
      ["Lesson 3 · Buy it", "I'll take it, please. Thank you.", "Finish the purchase politely."]
    ]
  },
  {
    id: "directions",
    title: "Ask directions",
    icon: "🧭",
    desc: "Ask for and understand simple directions.",
    lessons: [
      ["Lesson 1 · Ask", "Excuse me, where is the bus station?", "Start with a polite question."],
      ["Lesson 2 · Understand", "Is it far from here?", "Check the distance."],
      ["Lesson 3 · Confirm", "So I go straight and turn left?", "Confirm the directions."]
    ]
  },
  {
    id: "work",
    title: "At work",
    icon: "💼",
    desc: "Speak clearly with coworkers and colleagues.",
    lessons: [
      ["Lesson 1 · Introduce", "Hi, I'm new here. Nice to meet you.", "Introduce yourself at work."],
      ["Lesson 2 · Ask for help", "Could you please help me with this?", "Ask politely for help."],
      ["Lesson 3 · Clarify", "Could you explain that one more time?", "Ask for clarification."]
    ]
  },
  {
    id: "interview",
    title: "Job interview",
    icon: "🎤",
    desc: "Practice confident answers for interviews.",
    lessons: [
      ["Lesson 1 · Introduce", "Thank you for the opportunity. I'm happy to be here.", "Start confidently."],
      ["Lesson 2 · Strength", "One of my strengths is that I learn quickly.", "Describe a strength."],
      ["Lesson 3 · Goal", "I want to grow my skills and contribute to the team.", "Explain your goal."]
    ]
  },
  {
    id: "friends",
    title: "Make friends",
    icon: "🤝",
    desc: "Start small talk and respond naturally.",
    lessons: [
      ["Lesson 1 · Small talk", "Hi! How are you today?", "Start a simple conversation."],
      ["Lesson 2 · Interests", "What do you like to do in your free time?", "Ask about interests."],
      ["Lesson 3 · Respond", "I like listening to music and watching movies.", "Talk about yourself."]
    ]
  }
];

const translations = {
  English: "Speak naturally. Don't worry about mistakes. GBK AI will correct you and explain why.",
  "తెలుగు": "సహజంగా మాట్లాడండి. తప్పుల గురించి ఆందోళన పడకండి. GBK AI మీ వాక్యాన్ని సరిచేసి ఎందుకు అని వివరిస్తుంది.",
  "हिन्दी": "स्वाभाविक रूप से बोलें। गलतियों की चिंता न करें। GBK AI आपकी गलती सुधारकर कारण समझाएगा।",
  "தமிழ்": "இயல்பாக பேசுங்கள். தவறுகளைப் பற்றி கவலைப்பட வேண்டாம். GBK AI திருத்தி காரணத்தையும் விளக்கும்.",
  "ಕನ್ನಡ": "ಸಹಜವಾಗಿ ಮಾತನಾಡಿ. ತಪ್ಪುಗಳ ಬಗ್ಗೆ ಚಿಂತಿಸಬೇಡಿ. GBK AI ಸರಿಪಡಿಸಿ ಕಾರಣವನ್ನು ವಿವರಿಸುತ್ತದೆ.",
  "മലയാളം": "സ്വാഭാവികമായി സംസാരിക്കുക. തെറ്റുകളെക്കുറിച്ച് വിഷമിക്കേണ്ട. GBK AI തിരുത്തുകയും കാരണം വിശദീകരിക്കുകയും ചെയ്യും.",
  "বাংলা": "স্বাভাবিকভাবে কথা বলুন। ভুল নিয়ে চিন্তা করবেন না। GBK AI সংশোধন করে কারণ ব্যাখ্যা করবে."
};

function localCorrection(text, scenarioTitle) {
  const original = text.trim().replace(/\s+/g, " ");
  let corrected = original;
  let explanation = "Your sentence is understandable. Keep practicing and say it again.";
  let tip = "Speak slowly, use short sentences, and focus on being clear.";

  const rules = [
    [/\bi am agree\b/gi, "I agree", "Say “I agree”, not “I am agree”."],
    [/\bmyself ([a-z]+)/gi, "I am $1", "For an introduction, say “I am …”, not “Myself …”."],
    [/\bi have went\b/gi, "I have gone", "After “have”, use the past participle “gone”."],
    [/\bhe go\b/gi, "he goes", "With “he”, use “goes” in the present simple."],
    [/\bshe go\b/gi, "she goes", "With “she”, use “goes” in the present simple."],
    [/\bi am come\b/gi, "I have come", "Use “I have come” when talking about arriving."],
    [/\bwhere you are from\b/gi, "Where are you from?", "Use the question order “Where are you from?”."]
  ];

  for (const [pattern, replacement, why] of rules) {
    if (pattern.test(corrected)) {
      corrected = corrected.replace(pattern, replacement);
      explanation = why;
      break;
    }
  }

  if (scenarioTitle === "Meet someone") tip = "Smile, make eye contact, and ask one simple question.";
  if (scenarioTitle === "Job interview") tip = "Pause before answering. A short clear answer sounds confident.";
  if (scenarioTitle === "At work") tip = "Use “Could you please…?” when you need help.";
  if (scenarioTitle === "Shopping") tip = "Use “Excuse me” and “please” to sound polite.";
  if (scenarioTitle === "Make friends") tip = "Ask a question after answering so the conversation continues.";

  return {
    corrected: corrected || original,
    explanation,
    tip,
    reply: `Correction: ${corrected || original}`,
    mode: "local-practice"
  };
}

export default function Home() {
  const [lang, setLang] = useState("English");
  const [scenario, setScenario] = useState(scenarios[0]);
  const [lessonIndex, setLessonIndex] = useState(0);
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState(null);
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [progress, setProgress] = useState(0);
  const [started, setStarted] = useState(false);
  const practiceRef = useRef(null);
  const rec = useRef(null);

  const lesson = scenario.lessons[lessonIndex];

  useEffect(() => {
    setProgress(Number(localStorage.getItem("gbk_progress") || 0));
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const r = new SR();
      r.lang = "en-US";
      r.interimResults = false;
      r.maxAlternatives = 1;
      r.onresult = (e) => setInput(e.results[0][0].transcript);
      r.onend = () => setListening(false);
      rec.current = r;
    }
  }, []);

  function scrollToPractice() {
    requestAnimationFrame(() =>
      practiceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  }

  function speak(text) {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      speechSynthesis.speak(u);
    }
  }

  function startScenario(s) {
    setScenario(s);
    setLessonIndex(0);
    setAnswer(null);
    setInput("");
    setStarted(true);
    setTimeout(scrollToPractice, 50);
  }

  function startLesson() {
    setInput(lesson[1]);
    setAnswer(null);
    setStarted(true);
    speak(lesson[1]);
    scrollToPractice();
  }

  function nextLesson() {
    const next = Math.min(lessonIndex + 1, scenario.lessons.length - 1);
    setLessonIndex(next);
    setAnswer(null);
    setInput("");
    setTimeout(scrollToPractice, 50);
  }

  function voiceInput() {
    if (!rec.current) {
      alert("Voice input is not supported in this browser. You can type instead.");
      return;
    }
    if (listening) {
      rec.current.stop();
    } else {
      rec.current.start();
      setListening(true);
    }
  }

  async function askAI() {
    if (!input.trim() || busy) return;
    setBusy(true);
    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          language: lang,
          goal: "Spoken English",
          scenario: scenario.title,
          lesson: lesson[0],
          mode: "conversation-practice"
        })
      });
      const data = await response.json();
      const result = data?.corrected
        ? { ...data, tip: data.tip || "Say the corrected sentence again." }
        : localCorrection(input, scenario.title);
      setAnswer(result);
      speak(result.corrected || result.reply);
      const nextProgress = Math.min(100, progress + 10);
      setProgress(nextProgress);
      localStorage.setItem("gbk_progress", String(nextProgress));
    } catch {
      const result = localCorrection(input, scenario.title);
      setAnswer(result);
    } finally {
      setBusy(false);
    }
  }

  const styles = {
    page: { minHeight: "100vh", background: "#f5f7fb", color: "#17233d", fontFamily: "Arial, sans-serif" },
    header: { position: "sticky", top: 0, zIndex: 10, background: "#fff", borderBottom: "1px solid #e2e6ee", padding: "18px 5%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 },
    logo: { display: "flex", alignItems: "center", gap: 12, fontWeight: 800, fontSize: 22 },
    badge: { width: 48, height: 48, borderRadius: 14, background: "#14223d", color: "#fff", display: "grid", placeItems: "center", fontSize: 24 },
    select: { padding: "12px 16px", borderRadius: 12, border: "1px solid #d7dce6", background: "#fff", fontSize: 16 },
    wrap: { width: "min(1050px, 92%)", margin: "0 auto", padding: "44px 0 80px" },
    hero: { background: "#edf4ff", borderRadius: 28, padding: "42px 6%", marginBottom: 24 },
    h1: { fontSize: "clamp(40px, 8vw, 72px)", lineHeight: 1.03, margin: "12px 0 20px", letterSpacing: -2 },
    sub: { fontSize: 20, lineHeight: 1.6, color: "#657084", maxWidth: 760 },
    card: { background: "#fff", border: "1px solid #e1e5ec", borderRadius: 24, padding: 28, marginBottom: 20, boxShadow: "0 4px 18px rgba(20,34,61,.04)" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 },
    title: { fontSize: 28, margin: "0 0 8px" },
    button: { border: 0, borderRadius: 14, padding: "14px 20px", background: "#eaf2ff", color: "#285a9f", fontWeight: 800, fontSize: 16, cursor: "pointer" },
    primary: { background: "#14223d", color: "#fff" },
    input: { width: "100%", boxSizing: "border-box", padding: 16, borderRadius: 14, border: "1px solid #d8dde7", fontSize: 17, margin: "14px 0" },
    pill: { display: "inline-block", padding: "8px 12px", borderRadius: 999, background: "#eaf2ff", color: "#285a9f", fontWeight: 800, fontSize: 14 }
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div style={styles.logo}><div style={styles.badge}>G</div><div>GBK AI<div style={{fontSize:11,letterSpacing:3,color:"#7b8494"}}>GLOBAL LEARNING</div></div></div>
        <select style={styles.select} value={lang} onChange={e => setLang(e.target.value)}>
          {languages.map(x => <option key={x}>{x}</option>)}
        </select>
      </header>

      <div style={styles.wrap}>
        <section style={styles.hero}>
          <span style={styles.pill}>🤖 GBK AI GLOBAL LEARNING V7</span>
          <h1 style={styles.h1}>Learn to <span style={{color:"#2f70d0"}}>talk</span> with confidence.</h1>
          <p style={styles.sub}>{translations[lang] || translations.English}</p>
          <div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:22}}>
            <button style={{...styles.button,...styles.primary}} onClick={() => { setStarted(true); scrollToPractice(); }}>Start speaking →</button>
            <button style={styles.button} onClick={() => { setStarted(true); scrollToPractice(); }}>Open AI Tutor</button>
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.title}>🎯 Real-life speaking practice</h2>
          <p style={styles.sub}>Choose one situation. GBK AI gives you a short lesson, listens to you, corrects your English, explains the correction, and asks you to repeat.</p>
          <div style={styles.grid}>
            {scenarios.map(s => (
              <div key={s.id} style={{...styles.card,margin:0,borderRadius:18}}>
                <div style={{fontSize:30}}>{s.icon}</div>
                <h3 style={{fontSize:22,margin:"10px 0 8px"}}>{s.title}</h3>
                <p style={{color:"#6b7585",lineHeight:1.5,minHeight:48}}>{s.desc}</p>
                <button style={styles.button} onClick={() => startScenario(s)}>Start path →</button>
              </div>
            ))}
          </div>
        </section>

        <section ref={practiceRef} style={styles.card}>
          <span style={styles.pill}>{scenario.icon} {scenario.title}</span>
          <h2 style={{fontSize:32,margin:"14px 0 8px"}}>{lesson[0]}</h2>
          <p style={{fontSize:18,color:"#687385"}}>{lesson[2]}</p>
          <div style={{background:"#f1f5fc",padding:22,borderRadius:18,margin:"18px 0"}}>
            <div style={{fontSize:13,fontWeight:800,letterSpacing:2,color:"#748095"}}>SAY THIS</div>
            <div style={{fontSize:24,fontWeight:750,lineHeight:1.45,marginTop:8}}>{lesson[1]}</div>
            <button style={{...styles.button,marginTop:16}} onClick={startLesson}>🔊 Listen / Start</button>
          </div>

          <div style={{fontSize:16,color:"#697487",marginBottom:8}}>Your turn — speak or type:</div>
          <input style={styles.input} value={input} onChange={e => setInput(e.target.value)} placeholder="Type what you would say..." />
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <button style={styles.button} onClick={voiceInput}>{listening ? "⏹ Stop listening" : "🎙️ Speak"}</button>
            <button style={{...styles.button,...styles.primary}} onClick={askAI} disabled={busy}>{busy ? "Checking..." : "✨ Ask AI"}</button>
          </div>

          {answer && (
            <div style={{marginTop:22,background:"#f5f8ff",borderRadius:18,padding:22}}>
              <h3 style={{marginTop:0}}>✅ AI correction</h3>
              <p><b>Better sentence:</b> {answer.corrected}</p>
              <p><b>Why:</b> {answer.explanation}</p>
              <p><b>Easy speaking tip:</b> {answer.tip}</p>
              <button style={styles.button} onClick={() => speak(answer.corrected)}>🔊 Listen again</button>
              {lessonIndex < scenario.lessons.length - 1 && (
                <button style={{...styles.button,marginLeft:8}} onClick={nextLesson}>Next lesson →</button>
              )}
            </div>
          )}
        </section>

        <section style={styles.card}>
          <h2 style={styles.title}>🔁 The simple GBK AI method</h2>
          <p style={{fontSize:19,lineHeight:1.8,color:"#5f6b7c"}}>1. <b>Listen</b> → 2. <b>Speak</b> → 3. <b>AI corrects</b> → 4. <b>Understand why</b> → 5. <b>Repeat</b> → 6. <b>Speak more confidently</b></p>
          <div style={{marginTop:18,fontWeight:800}}>Progress: {progress}%</div>
          <div style={{height:10,background:"#e5e9f0",borderRadius:99,marginTop:8,overflow:"hidden"}}><div style={{height:"100%",width:`${progress}%`,background:"#2f70d0",borderRadius:99}} /></div>
        </section>

        <p style={{textAlign:"center",color:"#8791a0",padding:"10px 0"}}>GBK AI Global Learning V7 · Learn in your language · Practice real conversations</p>
      </div>
    </main>
  );
}
