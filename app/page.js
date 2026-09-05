\"use client\";
import {useEffect,useRef,useState} from "react";

const languages=["English","తెలుగు","हिन्दी","தமிழ்","ಕನ್ನಡ","മലയാളം","বাংলা","Español","العربية","Français","Deutsch","Português","日本語","한국어","中文"];

const goals=[
["Spoken English","Listen, speak, correct and repeat with voice practice."],
["AI & Technology","Learn AI concepts, tools and practical technology skills."],
["Coding","Learn programming through explanations, examples and practice."],
["Digital Marketing","Practice SEO, content, social media and growth skills."],
["Business & Careers","Build communication, interview and workplace skills."],
["Finance","Learn financial concepts, budgeting and market fundamentals."],
["Creative Skills","Practice writing, design, ideas and creative problem solving."],
["Education","Learn subjects with simple explanations, examples and quizzes."],
["Local Language","Learn vocabulary, phrases, reading and speaking in your language."]
];

const steps=["Listen","Learn","Practice","Correction","Explain","Repeat","Progress"];

const greetings={
English:"Hello! Welcome to GBK AI Global Learning.",
"తెలుగు":"నమస్కారం! GBK AI Global Learning కు స్వాగతం.",
"हिन्दी":"नमस्कार! GBK AI Global Learning में आपका स्वागत है।",
தமிழ்:"வணக்கம்! GBK AI Global Learning-க்கு வரவேற்கிறோம்.",
ಕನ್ನಡ:"ನಮಸ್ಕಾರ! GBK AI Global Learning ಗೆ ಸ್ವಾಗತ.",
മലയാളം:"നമസ്കാരം! GBK AI Global Learning-ലേക്ക് സ്വാഗതം.",
বাংলা:"নমস্কার! GBK AI Global Learning-এ স্বাগতম.",
Español:"¡Hola! Bienvenido a GBK AI Global Learning.",
العربية:"مرحباً! أهلاً بك في GBK AI Global Learning.",
Français:"Bonjour ! Bienvenue sur GBK AI Global Learning.",
Deutsch:"Hallo! Willkommen bei GBK AI Global Learning.",
Português:"Olá! Bem-vindo ao GBK AI Global Learning.",
日本語:"こんにちは！GBK AI Global Learningへようこそ。",
한국어:"안녕하세요! GBK AI Global Learning에 오신 것을 환영합니다.",
中文:"你好！欢迎来到 GBK AI Global Learning。"
};

function starter(g){
return {
"Spoken English":"Say: Hello, my name is ___ and I am learning English.",
"AI & Technology":"Explain artificial intelligence in one simple sentence.",
"Coding":"Write one simple example of a variable in your favorite programming language.",
"Digital Marketing":"Give one simple idea to promote a new online product.",
"Business & Careers":"Give one strong sentence for introducing yourself in a job interview.",
"Finance":"Explain why saving money is important in one simple sentence.",
"Creative Skills":"Write one creative idea for a useful mobile app.",
"Education":"Explain one topic you know well in three simple sentences.",
"Local Language":"Write one useful everyday phrase you want to learn."
}[g]||"Ask GBK AI Tutor to teach you something useful."
}

export default function Home(){
const[lang,setLang]=useState("English"),[goal,setGoal]=useState("Spoken English"),[step,setStep]=useState(0),[input,setInput]=useState(""),[answer,setAnswer]=useState(null),[busy,setBusy]=useState(false),[listening,setListening]=useState(false),[progress,setProgress]=useState(0);
const rec=useRef(null);
const practiceRef=useRef(null);

useEffect(()=>{
setProgress(Number(localStorage.getItem("gbk_progress")||0));
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
if(SR){
const r=new SR();
r.lang="en-US";
r.interimResults=false;
r.maxAlternatives=1;
r.onresult=e=>setInput(e.results[0][0].transcript);
r.onend=()=>setListening(false);
rec.current=r;
}
},[]);

function goToPractice(){
requestAnimationFrame(()=>{
practiceRef.current?.scrollIntoView({behavior:"smooth",block:"start"});
});
}

function speak(t){
if("speechSynthesis"in window){
speechSynthesis.cancel();
speechSynthesis.speak(new SpeechSynthesisUtterance(t));
}
}

function listen(){
const p=starter(goal);
setInput(p);
speak(p);
setStep(goal==="Spoken English"?0:1);
goToPractice();
}

function voice(){
if(!rec.current)return alert("Voice input is not supported in this browser.");
if(listening)rec.current.stop();
else{rec.current.start();setListening(true)}
}

async function submit(){
if(!input.trim()||busy)return;
setBusy(true);
try{
const r=await fetch("/api/tutor",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:input,language:lang,goal,mode:goal==="Spoken English"?"spoken-english":"learning"})});
const d=await r.json();
setAnswer(d);
setStep(3);
if(d.corrected)speak(d.corrected);
else if(d.reply)speak(d.reply);
const n=Math.min(100,progress+10);
setProgress(n);
localStorage.setItem("gbk_progress",n);
}finally{setBusy(false)}
}

function selectGoal(g){
setGoal(g);
setAnswer(null);
setInput("");
setStep(g==="Spoken English"?0:1);
if(typeof window!=="undefined")window.location.hash="practice";
goToPractice();
}

return <main>
<header>
<div className="brand"><span className="logo">G</span><div><b>GBK AI</b><small>GLOBAL LEARNING</small></div></div>
<nav><a href="#practice">Practice</a><a href="#paths">Learning</a><a href="#progress">Progress</a></nav>
<select value={lang} onChange={e=>setLang(e.target.value)}>{languages.map(x=><option key={x}>{x}</option>)}</select>
<button className="signin">Sign in</button>
</header>

<section className="hero">
<div><div className="pill">🤖 GBK AI GLOBAL LEARNING V5</div>
<h1>Learn in <span>your language.</span><br/>Build real skills.</h1>
<p>{greetings[lang]} Choose a learning path and practice with an AI tutor.</p>
<div className="buttons"><a className="primary" href="#paths">Start learning →</a><a className="secondary" href="#practice">Open AI Tutor</a></div></div>
<div className="mini"><b>Multilingual AI learning</b><span>✓ Learn in your language</span><span>✓ Ask and practice</span><span>✓ AI explanation + correction</span><span>✓ Repeat → recheck → progress</span></div>
</section>

<section className="practice" id="practice" ref={practiceRef}>
<div className="eyebrow">AI LEARNING LAB</div>
<div className="steps">{steps.map((x,i)=><button key={x} className={step===i?"active":""} onClick={()=>setStep(i)}><i>{i+1}</i>{x}</button>)}</div>
<div className="practiceGrid">
<div className="coach"><span className="tag">{goal}</span><h2>{goal==="Spoken English"?"Listen → Speak → Improve":"Learn → Practice → Improve"}</h2><p className="muted">{goals.find(x=>x[0]===goal)?.[1]}</p>
<div className="prompt"><small>{goal==="Spoken English"?"SPEAKING PRACTICE":"LEARNING PRACTICE"}</small><strong>{starter(goal)}</strong><button onClick={listen}>🔊 Listen / Start</button></div></div>
<div className="chatbox"><div className="languageNote">Tutor language: <b>{lang}</b></div>
{answer?<><div className="result"><span>Your input</span><p>{input}</p></div>{answer.corrected&&<div className="result good"><span>Improved English</span><p>{answer.corrected}</p></div>}<div className="explain"><b>{answer.label||"GBK AI Tutor"}</b><p>{answer.explanation||answer.reply}</p></div></>:<div className="bubble">{greetings[lang]} Choose a path, then use Listen / Start or type your question.</div>}
<div className="composer"><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder={goal==="Spoken English"?"Speak or type your English sentence...":"Ask or type your learning task..."}/><button onClick={voice}>{listening?"■":"🎤"}</button><button className="send" onClick={submit} disabled={busy}>{busy?"…":"Ask AI"}</button></div>
{answer&&<button className="recheck" onClick={()=>{setAnswer(null);setInput(starter(goal));setStep(4);goToPractice()}}>↻ Practice again</button>}
<small>Voice input/output uses browser speech APIs. AI provider can be connected securely with deployment environment variables.</small>
</div></div></section>

<section id="progress" className="progress"><div><div className="eyebrow">YOUR PROGRESS</div><h2>Small practice. Real improvement.</h2><p className="muted">Your browser stores a simple practice score on this device.</p></div><div className="meter"><strong>{progress}%</strong><div><span style={{width:`${progress}%`}}/></div><small>Practice progress</small></div></section>

<section id="paths" className="paths"><div className="eyebrow">LEARNING PATHS</div><h2>Every path is now interactive.</h2><div className="grid">{goals.map(([x,d])=><article key={x}><h3>{x}</h3><p>{d}</p><button onClick={()=>selectGoal(x)}>Start path →</button></article>)}</div></section>

<section className="cta"><h2>GBK AI — global skills, one learning platform.</h2><p>Multilingual learning, voice practice, AI tutoring and measurable progress — built as the foundation for a global learning ecosystem.</p></section>
<footer><b>GBK AI</b><span>Global Learning & Skills</span><span>V5 interactive learning paths</span></footer>
</main>
}
