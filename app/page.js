"use client";

import Link from "next/link";
import Header from "./components/Header";

const languages = [
  "English", "తెలుగు", "हिन्दी", "தமிழ்", "ಕನ್ನಡ", "മലയാളം", "বাংলা",
  "Español", "العربية", "Français", "Deutsch", "Português", "日本語",
  "한국어", "中文"
];

const learningPaths = [
  ["Spoken English", "Listen, speak, get corrections, and repeat."],
  ["AI & Technology", "Understand AI tools and practical technology."],
  ["Coding", "Learn coding from simple concepts to real projects."],
  ["Digital Marketing", "Build practical marketing and online business skills."],
  ["Business & Careers", "Improve workplace, interview, and career skills."],
  ["Finance", "Learn money, markets, saving, and financial basics."],
  ["Creative Skills", "Develop writing, design, content, and creative skills."],
  ["Education", "Study smarter with guided AI learning."],
  ["Local Language", "Learn and practice useful everyday language."]
];

export default function Home() {
  return (
    <main className="page">
      <Header />

      <section className="hero">
        <div className="eyebrow">🤖 GBK AI GLOBAL LEARNING V9</div>
        <h1>Learn simply.<br /><span>Practice every day.</span></h1>
        <p>Learn in your language. Listen, speak, practice with AI, get clear corrections, and improve step by step.</p>
        <div className="actions">
          <Link className="button primary" href="/paths">Start Learning →</Link>
          <Link className="button secondary" href="/tutor">Ask AI Tutor</Link>
        </div>
      </section>

      <section className="grid three">
        <article className="card"><div className="number">1. Learn</div><p>Short, practical lessons made for beginners and busy learners.</p></article>
        <article className="card"><div className="number">2. Practice</div><p>Speak, write, answer questions, and practice with an AI tutor.</p></article>
        <article className="card"><div className="number">3. Improve</div><p>Get correction, explanation, a better example, and the next step.</p></article>
      </section>

      <section className="card feature">
        <div className="eyebrow">🌍 GLOBAL + YOUR LANGUAGE</div>
        <h2>One platform. Many languages. Real-world skills.</h2>
        <p>Choose your language and learning goal. GBK AI is designed to make difficult skills easier to understand and easier to practice.</p>
        <div className="language-list">
          {languages.map((language) => <span className="language-chip" key={language}>{language}</span>)}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div><div className="eyebrow">LEARNING PATHS</div><h2>Build skills for the real world.</h2></div>
          <Link className="text-link" href="/paths">View all →</Link>
        </div>
        <div className="grid three">
          {learningPaths.map(([title, description]) => (
            <Link className="card path-card" href="/paths" key={title}>
              <h3>{title}</h3><p>{description}</p><span className="text-link">Practice →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="card conversation">
        <div className="eyebrow">🗣️ SPOKEN ENGLISH</div>
        <h2>Talk to people more easily.</h2>
        <p>Listen to a question, answer aloud, receive pronunciation and grammar guidance, understand the correction in your language, then repeat the improved sentence.</p>
        <div className="actions">
          <Link className="button primary" href="/practice">Start Speaking →</Link>
          <Link className="button secondary" href="/lesson">Open Lesson</Link>
        </div>
      </section>

      <section className="card">
        <div className="eyebrow">🧠 AI TUTOR</div>
        <h2>Ask questions. Get a simple next step.</h2>
        <p>Use GBK AI as a learning coach for lessons, practice, explanations, corrections, and everyday skill-building.</p>
        <Link className="text-link" href="/tutor">Open AI Tutor →</Link>
      </section>

      <footer className="footer">
        <strong>GBK AI Global Learning V9</strong>
        <span>Learn • Practice • Improve</span>
      </footer>
    </main>
  );
}
