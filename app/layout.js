import "./globals.css";
import Link from "next/link";
export const metadata={title:"GBK AI Global Learning",description:"Simple multilingual AI learning"};
export default function Layout({children}){return <><header><Link href="/">GBK AI <small>GLOBAL LEARNING</small></Link><nav><a href="/paths">Paths</a><a href="/tutor">AI Tutor</a><a href="/progress">Progress</a></nav></header>{children}</>}
