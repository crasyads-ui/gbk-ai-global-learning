"use client";
import Link from "next/link";
import {useEffect,useState} from "react";

const languages=["English","తెలుగు","हिन्दీ","தமிழ்","ಕನ್ನಡ","മലയാളം","বাংলা","Español","العربية","Français","Deutsch","Português","日本語","한국어","中文"];
const greeting={English:"Hello!","తెలుగు":"నమస్కారం!","हिन्दी":"नमस्कार!","தமிழ்":"வணக்கம்!","ಕನ್ನಡ":"ನಮಸ್ಕಾರ!","മലയാളം":"നമസ്കാരം!","বাংলা":"নমস্কার!",Español:"¡Hola!","العربية":"مرحبًا!",Français:"Bonjour!",Deutsch:"Hallo!",Português:"Olá!",日本語:"こんにちは!",한국어:"안녕하세요!",中文:"你好!"};

export default function Home(){
 const [lang,setLang]=useState("English");
 useEffect(()=>setLang(localStorage.getItem("gbk_language")||"English"),[]);
 return <main className="page">
  <section className="hero">
   <div className="eyebrow">🌍 ONE GLOBAL LEARNING PLATFORM</div>
   <h1>Learn in <span>your language.</span><br/>Build skills for the world.</h1>
   <p>{greeting[lang]} Learn languages, spoken English, AI, coding, digital marketing, business and careers — together with your personal GBK AI teacher.</p>
   <div className="actions"><Link className="btn primary" href="/paths">Start Learning →</Link><Link className="btn" href="/tutor">Ask AI Tutor</Link></div>
  </section>
  <section className="grid three"><div className="card mini"><b>🌐 Global languages</b><p>Choose your learning language.</p></div><div className="card mini"><b>🎙️ Voice learning</b><p>Listen, speak and repeat.</p></div><div className="card mini"><b>🤖 AI teacher</b><p>Ask, correct and improve.</p></div></section>
  <section className="card"><h2>How GBK AI helps</h2><div className="grid three"><div><b>1. Learn</b><p>Short, simple lessons.</p></div><div><b>2. Practice</b><p>Speak or type your answer.</p></div><div><b>3. Improve</b><p>Get correction, explanation and repeat practice.</p></div></div></section>
 </main>
}
