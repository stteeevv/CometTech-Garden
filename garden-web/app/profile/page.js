"use client";

import { useSession, signOut, signIn } from "next-auth/react";
import Container from "../components/container";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Profile() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [userName, setUserName] = useState("");
  const router = useRouter();

  async function handleSignOut() {
    await signOut({ callbackUrl: "/" });
  }

  const fetchLogs = async () => {
    const res = await fetch("/api/harvest");
    const data = await res.json();
    setLogs(data.Items);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    if (session) setUserName(session.user?.name ?? "");
  }, [session]);

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleNameChange = async () => {
    let role = session.user.role;
    let plots = session.user.plots;
    let name = userName;
    const res = await fetch(`/api/users/${session.user.email}`, {
      method: "POST",
      body: JSON.stringify({ name, role, plots }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      alert("Name updated successfully!");
      setIsEditMode(false);
    } else {
      alert("Failed to update name.");
    }
  };

  const handleCancelClick = () => {
    setUserName(session?.user?.name || "");
    setIsEditMode(false);
  };

  if (!session) {
    return (
      <Container title="Profile">
        <div className="flex justify-center flex-col items-center">
          <h1 className="font-jettBrains text-lg md:text-2xl p-8">You are not signed in</h1>
          <button
            className="p-4 text-center text-md md:text-lg font-jettBrains bg-[#c2ccb5] rounded-lg cursor-pointer block"
            onClick={() => signIn()}
          >
            Sign In
          </button>
        </div>
      </Container>
    );
  }

  if (session && session.user === null) {
    router.push("/api/auth/signin");
  }

  return (
    <Container title="Profile">
      <div className="flex justify-center flex-col items-center space-y-4 md:space-y-8">
        {/* User Info Section */}
        <div className="flex flex-col md:flex-row justify-between text-lg md:text-2xl p-4 md:p-8 items-start bg-[#c2ccb5] rounded-lg w-[95%] sm:w-[90%]">
          <div className="flex items-center">
            {isEditMode ? (
              <>
                <input
                  className="border p-1 rounded-md"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
                <button
                  className="ml-2 bg-blue-500 text-white px-2 py-1 rounded-md"
                  onClick={handleNameChange}
                >
                  Save
                </button>
                <button
                  className="ml-2 bg-red-500 text-white px-2 py-1 rounded-md"
                  onClick={handleCancelClick}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <h1 className="font-jettBrains break-words">Hello, {userName}!</h1>
                <button
                  className="ml-2 cursor-pointer"
                  onClick={handleEditClick}
                  title="Edit Name"
                >
                  ✏️
                </button>
              </>
            )}
          </div>
          <h1 className="font-jettBrains break-words md:ml-4">Role: {session.user.role}</h1>
        </div>

        {/* Email and Plots Section */}
        <div className="flex flex-col md:flex-row justify-between text-sm md:text-lg p-4 md:p-8 items-start bg-[#c2ccb5] rounded-lg w-[95%] sm:w-[90%] gap-4 md:gap-6">
          <h1 className="font-jettBrains break-words w-full md:w-auto">Email: {session.user.email}</h1>
          <h1 className="font-jettBrains break-words w-full md:w-auto">
            Plots:
            {session.user.plots
              ? session.user.plots
                  .map((plot) => parseInt(plot, 10))
                  .sort((a, b) => a - b)
                  .join(", ")
              : null}
          </h1>
        </div>

        {/* Button Grid Section */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 w-full mt-4 md:w-[80%]">
          <a className="p-3 md:p-4 text-sm md:text-[1rem] font-jettBrains bg-[#c2ccb5] rounded-lg cursor-pointer block" href="/harvest-log">
            Harvest Log
          </a>
          <a className="p-3 md:p-4 text-sm md:text-[1rem] font-jettBrains bg-[#c2ccb5] rounded-lg cursor-pointer block" href="/my-logs">
            Log History
          </a>
          {(session.user.role === "admin" || session.user.role === "editor") && (
            <a className="p-3 md:p-4 text-sm md:text-[1rem] font-jettBrains bg-[#c2ccb5] rounded-lg cursor-pointer block" href="/requests">
              View Requests ({logs.filter((entry) => entry.status.S === "pending").length})
            </a>
          )}
          {(session.user.role === "admin") && (
            <a className="p-3 md:p-4 text-sm md:text-[1rem] font-jettBrains bg-[#c2ccb5] rounded-lg cursor-pointer block" href="/manage">
              Manage Users
            </a>
          )}
          <button
            className="p-3 md:p-4 text-sm md:text-[1rem] font-jettBrains bg-[#c2ccb5] rounded-lg cursor-pointer block"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>
      </div>
    </Container>
  );
}
