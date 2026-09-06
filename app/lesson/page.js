"use client";
import Link from "next/link";
export default function Lesson(){
  return <main className="page">
    <section className="hero">
      <span className="eyebrow">GBK AI • LESSON 1</span>
      <h1>Speak with confidence.</h1>
      <p>Learn one useful sentence, listen, say it, get correction, and repeat.</p>
    </section>
    <section className="card">
      <h2>Introduce yourself</h2>
      <p><strong>Listen:</strong> “Hello, my name is ___. I am learning English.”</p>
      <p><strong>Use it:</strong> Say the sentence aloud, then practice with the AI tutor.</p>
      <div className="actions">
        <Link className="button primary" href="/#practice">Practice now →</Link>
        <Link className="button" href="/tutor">Ask AI Tutor</Link>
      </div>
    </section>
  </main>
}