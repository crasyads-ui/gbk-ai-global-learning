"use client";
import Link from "next/link";
import {useEffect,useState} from "react";

const languages=["English","తెలుగు","हिन्दी","தமிழ்","ಕನ್ನಡ","മലയാളം","বাংলা","Español","العربية","Français","Deutsch","Português","日本語","한국어","中文"];

export default function Header(){
 const [lang,setLang]=useState("English");
 useEffect(()=>setLang(localStorage.getItem("gbk_language")||"English"),[]);
 function changeLang(v){setLang(v);localStorage.setItem("gbk_language",v)}
 return <header className="siteHeader">
  <Link href="/" className="brand"><span className="logo">G</span><span><b>GBK AI</b><small>GLOBAL LEARNING</small></span></Link>
  <nav><Link href="/paths">Paths</Link><Link href="/tutor">AI Tutor</Link><Link href="/progress">Progress</Link></nav>
  <select aria-label="Learning language" value={lang} onChange={e=>changeLang(e.target.value)}>{languages.map(x=><option key={x}>{x}</option>)}</select>
 </header>
}
