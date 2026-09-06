"use client";
import {useState} from "react";
export default function Tutor(){
  const [input,setInput]=useState("");
  const [reply,setReply]=useState("");
  const [busy,setBusy]=useState(false);
  async function ask(){
    if(!input.trim()||busy)return;
    setBusy(true);
    try{
      const r=await fetch("/api/tutor",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:input,language:"English",goal:"Spoken English"})});
      const d=await r.json();
      setReply(d.reply||d.corrected||"Let's practice together.");
    }catch{setReply("Tutor request could not be processed.");}
    finally{setBusy(false)}
  }
  return <main className="page">
    <section className="hero"><span className="eyebrow">GBK AI • AI TUTOR</span><h1>Ask. Learn. Practice.</h1><p>Ask a question, write a sentence, or describe a real conversation you want to practice.</p></section>
    <section className="card">
      <textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="Example: How do I introduce myself at work?" rows={6}/>
      <button className="button primary" onClick={ask}>{busy?"Thinking…":"Ask AI →"}</button>
      {reply && <div className="result">{reply}</div>}
    </section>
  </main>
}
