"use client";
import Link from "next/link";
const paths=[
["Spoken English","Talk naturally in everyday situations."],
["AI & Technology","Understand AI and practical technology."],
["Coding","Learn programming step by step."],
["Digital Marketing","Learn SEO, content and growth."],
["Business & Careers","Improve interviews and workplace communication."],
["Finance","Learn money and financial basics."],
["Creative Skills","Build writing, design and creative thinking."],
["Education","Learn subjects with simple explanations."],
["Local Language","Learn useful words, phrases and speaking."]
];
export default function Paths(){
  return <main className="page">
    <section className="hero"><span className="eyebrow">GBK AI • LEARNING PATHS</span><h1>Choose one skill.</h1><p>Start small. Practice often. Improve every day.</p></section>
    <div className="grid">{paths.map(([name,desc])=><section className="card" key={name}><h2>{name}</h2><p>{desc}</p><Link className="button primary" href="/lesson">Start Lesson 1 →</Link></section>)}</div>
  </main>
}
