"use client";
import Link from "next/link";
export default function Home(){
  return <main className="page"><section className="hero">
    <span className="badge">🤖 GBK AI GLOBAL LEARNING V8</span>
    <h1>Learn simply.<br/><span>Practice every day.</span></h1>
    <p>Choose a skill, learn one small lesson, practice with AI, and improve step by step.</p>
    <div className="actions"><Link className="btn primary" href="/paths">Start Learning →</Link><Link className="btn" href="/tutor">Ask AI Tutor</Link></div>
  </section>
  <section className="grid three">
    <div className="card"><b>1. Learn</b><p>Short lessons made for beginners.</p></div>
    <div className="card"><b>2. Practice</b><p>Speak, write or answer a simple task.</p></div>
    <div className="card"><b>3. Improve</b><p>AI gives correction, explanation and a next step.</p></div>
  </section>
  <section className="card"><h2>🌍 Learn in your language</h2><p>Use your preferred language while learning English, AI, Coding, Digital Marketing and other useful skills.</p><Link className="textlink" href="/paths">Explore learning paths →</Link></section>
</main>}
