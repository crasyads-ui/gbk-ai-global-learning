'use client';
import {useState} from "react";

const languages=["English","తెలుగు","हिन्दी","தமிழ்","ಕನ್ನಡ","മലയാളം","বাংলা","Español","العربية","Français","Deutsch","Português","日本語","한국어","中文"];
const tracks=[
["🗣️","Languages","Local-language learning, spoken English and global languages"],
["🤖","AI & Technology","AI basics, prompting, automation and AI agents"],
["💻","Coding","Web development, Python, apps, APIs and databases"],
["📣","Digital Marketing","SEO, social media, content, advertising and analytics"],
["💼","Business & Careers","Entrepreneurship, jobs, CVs and interviews"],
["💰","Finance","Financial literacy, markets and money skills"],
["🎨","Creative Skills","Design, video, branding and content creation"],
["📚","Education","Academic support and practical lifelong learning"]
];

export default function Home(){
 const [lang,setLang]=useState("English"),[open,setOpen]=useState(false),[goal,setGoal]=useState("");
 return <main>
  <header><div className="brand"><span className="logo">G</span><div><b>GBK AI</b><small>GLOBAL LEARNING</small></div></div>
   <div className="navlinks"><a href="#learn">Learn</a><a href="#languages">Languages</a><a href="#skills">Skills</a></div>
   <select value={lang} onChange={e=>setLang(e.target.value)}>{languages.map(x=><option key={x}>{x}</option>)}</select>
   <button className="signin">Sign in</button>
  </header>

  <section className="hero">
   <div><div className="pill">🌍 ONE GLOBAL LEARNING PLATFORM</div>
    <h1>Learn in <span>your language.</span><br/>Build skills for the world.</h1>
    <p>Languages, spoken English, AI, coding, digital marketing, business and careers — together with your personal GBK AI teacher.</p>
    <div className="buttons"><button className="primary" onClick={()=>setOpen(true)}>Start Learning →</button><a className="secondary" href="#skills">Explore Skills</a></div>
    <div className="trust"><span>🌐 Global languages</span><span>🎤 Voice learning</span><span>🤖 AI teacher</span></div>
   </div>
   <div className="teacher"><div className="teacher-top"><span className="status">● Online</span><span>GBK AI Teacher</span></div><div className="avatar">🤖</div><h2>Hello! 👋</h2><p>What would you like to learn today?</p><div className="chat"><button onClick={()=>setGoal("Spoken English")}>🎤 Practice spoken English</button><button onClick={()=>setGoal("Coding")}>💻 Learn coding</button><button onClick={()=>setGoal("Local language")}>🗣️ Learn a local language</button></div>{goal&&<div className="reply">Great choice! <b>{goal}</b> is ready for your learning path.</div>}</div>
  </section>

  <section className="language-box" id="languages"><div><div className="eyebrow">YOUR LANGUAGE MATTERS</div><h2>Learn and teach across languages</h2><p>Choose your home language. GBK AI can teach skills and other languages through it.</p></div><div className="language-grid">{languages.slice(0,12).map(x=><button key={x} onClick={()=>setLang(x)} className={lang===x?"active":""}>{x}</button>)}</div></section>

  <section id="learn"><div className="section-head"><div><div className="eyebrow">LEARNING PATHS</div><h2>Everything in one place</h2></div><p>Start with one goal and grow into the next skill.</p></div>
   <div className="grid" id="skills">{tracks.map(([i,t,d])=><article key={t}><div className="icon">{i}</div><h3>{t}</h3><p>{d}</p><button onClick={()=>{setGoal(t);setOpen(true)}}>Start path →</button></article>)}</div>
  </section>

  <section className="steps"><div className="eyebrow">SIMPLE LEARNING LOOP</div><h2>Choose. Learn. Practice. Grow.</h2><div className="stepgrid"><div><b>01</b><h3>Choose</h3><p>Select language, skill and level.</p></div><div><b>02</b><h3>Learn</h3><p>Get clear AI explanations and examples.</p></div><div><b>03</b><h3>Practice</h3><p>Speak, write, quiz and build projects.</p></div><div><b>04</b><h3>Grow</h3><p>Track progress and prove your skills.</p></div></div></section>

  <section className="cta"><h2>One account. Global learning.</h2><p>Designed to grow from the first learners toward the GBK AI 100-million-user vision.</p><button className="primary" onClick={()=>setOpen(true)}>Start with {lang} →</button></section>
  <footer><b>GBK AI</b><span>Global Learning & Skills</span><span>Languages • AI • Coding • Careers</span></footer>

  {open&&<div className="modal"><div className="modal-card"><button className="close" onClick={()=>setOpen(false)}>×</button><div className="eyebrow">GBK AI LEARNING</div><h2>Start your learning journey</h2><p>Your current language: <b>{lang}</b>{goal&&<> · Goal: <b>{goal}</b></>}</p><label>What do you want to learn?</label><select value={goal} onChange={e=>setGoal(e.target.value)}><option value="">Choose a goal</option>{tracks.map(x=><option key={x[1]}>{x[1]}</option>)}</select><button className="primary wide" onClick={()=>setOpen(false)}>Continue →</button><small>Authentication, AI, voice and course APIs will be connected in the production phase.</small></div></div>}
 </main>
}