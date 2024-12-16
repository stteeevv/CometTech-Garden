import Image from "next/image"; 
import Test from "./components/Test.js"
import { redirect } from "next/dist/server/api-utils/index.js";

export default function Home() {
  // redirect to /home
  if (typeof window !== 'undefined') {
    window.location.href = '/home';

  }
  return
}
