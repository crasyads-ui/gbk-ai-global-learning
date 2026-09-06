import "./globals.css";
import Header from "./components/Header";
export const metadata={title:"GBK AI Global Learning",description:"Simple multilingual AI learning"};
export default function Layout({children}){return <><Header/>{children}</>}
