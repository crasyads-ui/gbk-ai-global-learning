"use client";
import {useState} from "react";
export default function Practice(){
  const [text,setText]=useState("");
  const [result,setResult]=useState("");
  async function check(){
    if(!text.trim()) return;
    try{
      const r=await fetch("/api/tutor",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:text,language:"English",goal:"Spoken English"})});
      const d=await r.json();
      setResult(d.explanation ? `${d.corrected||d.reply}\n\n${d.explanation}` : d.reply||"Keep practicing.");
    }catch{setResult("Please try again.")}
  }
  return <main className="page">
    <section className="hero"><span className="eyebrow">GBK AI • PRACTICE</span><h1>Speak. Correct. Repeat.</h1><p>Type what you would say to another person, then ask the AI to help.</p></section>
    <section className="card">
      <h2>Try this</h2><p>Hello, how are you? I am fine. Thank you.</p>
      <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Type your sentence here..." rows={5}/>
      <button className="button primary" onClick={check}>Ask AI →</button>
      {result && <div className="result"><strong>GBK AI:</strong><br/>{result}</div>}
    </section>
  </main>
}