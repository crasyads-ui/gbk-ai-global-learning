import "./globals.css";import Header from "./components/Header";
export const metadata={title:"GBK AI Global Learning",description:"Learn, practice, speak and build useful skills with GBK AI",manifest:"/manifest.webmanifest"};
export default function Layout({children}){return <><Header/>{children}<script dangerouslySetInnerHTML={{__html:`if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}))}`}}/></>}
