"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Container from "../components/container";

export default function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState([]);

  const fetchLogs = async () => {
    const res = await fetch("/api/harvest");
    const data = await res.json();
    setLogs(data.Items);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    if (status !== "loading") {
      const redirectTimer = setTimeout(() => {
        if (!session || (session.user.role == "student")) {
          router.push("/profile");
        }
      }, 3000);

      return () => clearTimeout(redirectTimer);
    }
  }, [session, status, router]);

  async function handleApprove(plot, timestamp, id) {
    const res = await fetch("/api/harvest", {
      method: "PUT",
      body: JSON.stringify({ plot, timestamp, id }),
    });
    const data = await res.json();
    if (res.ok) {
      setLogs(
        logs.map((entry) =>
          entry.id.S === id
            ? { ...entry, status: { S: "approved" } }
            : entry
        )
      );
    }
  }

  async function handleDelete(plot, timestamp, id) {
    const res = await fetch("/api/harvest", {
      method: "DELETE",
      body: JSON.stringify({ plot, timestamp, id }),
    });
    const data = await res.json();
    if (res.ok) {
      setLogs(logs.filter((entry) => entry.id.S !== id));
    }
  }

  if (status === "loading" || logs == null) {
    return (
      <Container title="Loading">
        <p>Loading...</p>
      </Container>
    );
  }

  if (!session) {
    return (
      <Container title="Access Denied">
        <p>Access denied, redirecting...</p>
      </Container>
    );
  }

  if (session.user.role == "student") {
    return (
      <Container title="Access Denied">
        <p>Access denied, redirecting...</p>
      </Container>
    );
  }

  return (
    <Container title="Log Requests">
      <div className="flex justify-center flex-col items-center bg-[#c2ccb5] rounded-lg p-4 md:p-8 w-full">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Log Requests</h1>
        <div className="overflow-x-auto w-full mt-4">
          {/* Scrollable Table */}
          <table className="table-auto w-full border-collapse border border-gray-400">
            <thead>
              <tr>
                <th className="px-2 md:px-4 py-2 text-sm md:text-base border border-gray-300">Plot</th>
                <th className="px-2 md:px-4 py-2 text-sm md:text-base border border-gray-300">Crop</th>
                <th className="px-2 md:px-4 py-2 text-sm md:text-base border border-gray-300">Quantity (lbs)</th>
                <th className="px-2 md:px-4 py-2 text-sm md:text-base border border-gray-300">Timestamp</th>
                {/* <th className="px-2 md:px-4 py-2 text-sm md:text-base border border-gray-300">Name</th> */}
                <th className="px-2 md:px-4 py-2 text-sm md:text-base border border-gray-300">Email</th>
                <th className="px-2 md:px-4 py-2 text-sm md:text-base border border-gray-300">Notes</th>
                <th className="px-2 md:px-4 py-2 text-sm md:text-base border border-gray-300">Status</th>
                <th className="px-2 md:px-4 py-2 text-sm md:text-base border border-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 &&
                logs.filter((entry) => entry.status.S === "pending").map((entry, index) => (
                  <tr
                    key={entry.id.S}
                    className={index % 2 === 0 ? "even:bg-[#aab39f]" : "odd:bg-white"}
                  >
                    <td className="px-2 md:px-4 py-2 text-xs md:text-sm border border-gray-300">
                      {entry.plot.N}
                    </td>
                    <td className="px-2 md:px-4 py-2 text-xs md:text-sm border border-gray-300">
                      {entry.crop.S}
                    </td>
                    <td className="px-2 md:px-4 py-2 text-xs md:text-sm border border-gray-300">
                      {entry.PoundsHarvested.N}
                    </td>
                    <td className="px-2 md:px-4 py-2 text-xs md:text-sm border border-gray-300">
                      {new Date(entry.timestamp.N * 1000).toLocaleString()}
                    </td>
                    <td className="px-2 md:px-4 py-2 text-xs md:text-sm border border-gray-300">
                      {entry.harvester.S}
                    </td>
                    <td className="px-2 md:px-4 py-2 text-xs md:text-sm border border-gray-300">
                      {entry.notes.S}
                    </td>
                    <td className="px-2 md:px-4 py-2 text-xs md:text-sm border border-gray-300">
                      {entry.status.S}
                    </td>
                    <td className="px-2 md:px-4 py-2 border boreder-gray-300">
                      <div className="flex flex-row">
                        <button
                          onClick={() => handleApprove(entry.plot.N, entry.timestamp.N, entry.id.S)}
                          className="bg-green-500 hover:bg-green-700 text-white px-2 py-1 rounded-lg text-xs md:text-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleDelete(entry.plot.N, entry.timestamp.N, entry.id.S)}
                          className="bg-red-500 hover:bg-red-700 text-white px-2 py-1 ml-2 rounded-lg text-xs md:text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </Container>
  );
}
