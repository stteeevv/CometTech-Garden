"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Container from "../components/container";

export default function MyLogs() {
  const { data: session } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user logs
  async function getLogs() {
    const res = await fetch("/api/harvest");
    const data = await res.json();
    if (!res.ok) {
      console.error("Failed to fetch logs");
      return;
    }
    if (!data.Items) {
      console.error("No logs found");
      return;
    }

    setLogs(
      data.Items.reduce((acc, log) => {
        if (log.harvester.S === session.user.email) {
          acc.push(log);
        }
        return acc;
      }, [])
    );
    setLoading(false);
  }

  async function handleDelete(plot, timestamp, id) {
    const res = await fetch("/api/harvest", {
      method: "DELETE",
      body: JSON.stringify({ plot, timestamp, id }),
    });
    const data = await res.json();

    if (res.ok) {
      setLogs(logs.filter((entry) => entry.id !== id));
      getLogs();
    }
  }

  useEffect(() => {
    if (session) {
      getLogs();
    }
  }, [session]);

  if (!session) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg font-semibold">You are not signed in</div>
        <button
          onClick={() => signIn()}
          className="ml-4 px-4 py-2 bg-green-500 text-white rounded-md"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <Container title="My Logs">
      <div className="flex justify-center flex-col items-center bg-[#c2ccb5] rounded-lg p-4 md:p-8 w-full">
        {/* Page Header */}
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">My Logs</h1>
        
        {loading ? (
          <p className="text-sm md:text-lg">Loading...</p>
        ) : (
          <div className="overflow-x-auto w-full mt-4">
            {/* Table Container with Responsive Scrolling */}
            <table className="table-auto w-full border-collapse border border-gray-400">
              <thead>
                <tr>
                  <th className="px-2 md:px-4 py-2 text-sm md:text-base border border-gray-300">Plot</th>
                  <th className="px-2 md:px-4 py-2 text-sm md:text-base border border-gray-300">Crop</th>
                  <th className="px-2 md:px-4 py-2 text-sm md:text-base border border-gray-300">Quantity (lbs)</th>
                  <th className="px-2 md:px-4 py-2 text-sm md:text-base border border-gray-300">Notes</th>
                  <th className="px-2 md:px-4 py-2 text-sm md:text-base border border-gray-300">Timestamp</th>
                  <th className="px-2 md:px-4 py-2 text-sm md:text-base border border-gray-300">Status</th>
                  <th className="px-2 md:px-4 py-2 text-sm md:text-base border border-gray-300">Action</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="even:bg-[#aab39f]">
                    <td className="px-2 md:px-4 py-2 text-xs md:text-sm border border-gray-300">
                      {log.plot.N}
                    </td>
                    <td className="px-2 md:px-4 py-2 text-xs md:text-sm border border-gray-300">
                      {log.crop.S}
                    </td>
                    <td className="px-2 md:px-4 py-2 text-xs md:text-sm border border-gray-300">
                      {log.PoundsHarvested.N}
                    </td>
                    <td className="px-2 md:px-4 py-2 text-xs md:text-sm border border-gray-300">
                      {log.notes.S}
                    </td>
                    <td className="px-2 md:px-4 py-2 text-xs md:text-sm border border-gray-300">
                      {new Date(log.timestamp.N * 1000).toLocaleString()}
                    </td>
                    <td className="px-2 md:px-4 py-2 text-xs md:text-sm border border-gray-300">
                      {log.status.S}
                    </td>
                    <td className="px-2 md:px-4 py-2 border border-gray-300">
                      <button
                        onClick={() => handleDelete(log.plot.N, log.timestamp.N, log.id.S)}
                        className="bg-red-500 hover:bg-red-700 text-white px-2 py-1 m-0 rounded-lg text-xs md:text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Container>
  );
}
