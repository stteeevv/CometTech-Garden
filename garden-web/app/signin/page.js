"use client";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import Container from "../components/container";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
const jettBrains = localFont({
  src: "../fonts/JetBrainsMonoNL-Regular.ttf",
  display: "swap",
});


const inter = Inter({ subsets: ["latin"] });
export default function SignInPage() {
  const { data: session } = useSession();
  const router = useRouter();
  if (session)
    router.push('/profile');
  if (!session)
  return (
    <Container title={"Sign In"}>
      <div className="flex justify-center">
        <h1 className="font-jettBrains w-[80%] text-center text-lg">
          {/* TODO: reword 'harvesting log page' */}
          Welcome to the harvesting log page! Please sign in to record harvest data!
          <br />
        </h1>
      </div>
      <div className="p-8 flex justify-center flex-col">
        <h1 className={inter.className + " text-[1.5rem] font-[600] text-center"}>
          Sign in to GardenTech
        </h1>
        <h1 className={inter.className + " text-[.8rem] font-[400] text-center"}>
          Sign in using your Google or Microsoft account to start logging your harvests!
        </h1>
        <div className="flex justify-center p-4 flex-col items-center align-middle">
          {/* <button
            className="bg-black w-full max-w-[400px] text-white m-2 p-1 rounded-md px-4"
            onClick={() => signIn("azure-ad")}
          >Sign in</button> */}
          <button
            className="bg-white w-full max-w-[400px] text-black m-2 p-1 rounded-md px-4"
            onClick={() => signIn("google")}
          >Sign in with Google</button>
        </div>
        <div className="items-center flex flex-col">
          <span className="text-center text-gray-500 text-[.9rem] w-full max-w-[400px] mb-4">
            By signing in, you agree to our{" "}
            <a className="text-black" href="/terms">
              Terms of Service
            </a>{" "}
            and{" "}
            <a className="text-black" href="/privacy">
              Privacy Policy
            </a>
          </span>
        </div>
      </div>
    </Container>
  );
  else {
    return (
      <Container title={"Sign In"}>
        <div className="flex justify-center flex-col items-center">
          <h1 className="font-jettBrains w-[80%] text-center text-lg">
            Welcome {session.user.name.split(" ")[1]}! You are now signed in!
            <br />
          </h1>
          <button>
            <a href="/dashboard">Go to Dashboard</a>
          </button>
          <button onClick={() => signOut()}>
            Sign out
          </button>
        </div>
      </Container>
    )
  }
}
