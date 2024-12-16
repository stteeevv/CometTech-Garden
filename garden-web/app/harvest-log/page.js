"use client";
import Container from "../components/container";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

// This page displays all the harvest logs
export default function HarvestLog() {
  const { data: session, status } = useSession();
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch harvest logs
  async function fetchLog() {
    const res = await fetch("/api/harvest");
    const data = await res.json();
    setLog(data.Items);
    setLoading(false);
  }

  useEffect(() => {
    fetchLog();
  }, []);

  // Handle deletion of logs
  async function handleDelete(plot, timestamp, id) {
    const res = await fetch("/api/harvest", {
      method: "DELETE",
      body: JSON.stringify({ plot, timestamp, id }),
    });
    const data = await res.json();

    if (res.ok) {
      setLog(log.filter((entry) => entry.id !== id));
      fetchLog();
    }
  }

  // Loading state while session data is initializing
  if (status === "loading") {
    return (
        <Container title="Harvest Log">
            <p>Loading session...</p>
        </Container>
    );
  }

  return (
    <Container title="Harvest Log">
      <div className="flex justify-center flex-col items-center bg-[#c2ccb5] rounded-lg p-4 md:p-8">
        {/* Header */}
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Harvest Log</h1>

        {loading ? (
          <p className="text-sm md:text-lg">Loading...</p>
        ) : (
          <div className="overflow-x-auto w-full mt-4">
            {/* Responsive Table */}
            <table className="table-auto w-full border-collapse border border-gray-400">
              <thead>
                <tr>
                  <th className="px-2 md:px-4 py-2 text-sm md:text-base border border-gray-300">Plot</th>
                  <th className="px-2 md:px-4 py-2 text-sm md:text-base border border-gray-300">Crop</th>
                  <th className="px-2 md:px-4 py-2 text-sm md:text-base border border-gray-300">Quantity (lbs)</th>
                  <th className="px-2 md:px-4 py-2 text-sm md:text-base border border-gray-300">Timestamp</th>
                  {(session?.user?.role === "admin" || session?.user?.role === "editor") && (
                    <>
                      <th className="px-2 md:px-4 py-2 text-sm md:text-base border border-gray-300">Harvester</th>
                      <th className="px-2 md:px-4 py-2 text-sm md:text-base border border-gray-300">Notes</th>
                      <th className="px-2 md:px-4 py-2 text-sm md:text-base border border-gray-300">Status</th>
                      <th className="px-2 md:px-4 py-2 text-sm md:text-base border border-gray-300">Action</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {log != null &&
                  [...log]
                    .reverse()
                    .reduce((acc, entry) => {
                      if ((session?.user?.role !== "admin" || session?.user?.role !== "editor") && entry.status.S !== "approved") {
                        return acc;
                      }

                      return acc.concat(
                        <tr key={entry.id.S} className="even:bg-[#aab39f]">
                          <td className="px-2 md:px-4 py-2 text-xs md:text-sm border border-gray-300">{entry.plot.N}</td>
                          <td className="px-2 md:px-4 py-2 text-xs md:text-sm border border-gray-300">{entry.crop.S}</td>
                          <td className="px-2 md:px-4 py-2 text-xs md:text-sm border border-gray-300">{entry.PoundsHarvested.N}</td>
                          <td className="px-2 md:px-4 py-2 text-xs md:text-sm border border-gray-300">
                            {new Date(entry.timestamp.N * 1000).toLocaleString()}
                          </td>
                          {(session?.user?.role === "admin" || session?.user?.role === "editor") && (
                            <>
                              <td className="px-2 md:px-4 py-2 text-xs md:text-sm border border-gray-300">{entry.harvester.S}</td>
                              <td className="px-2 md:px-4 py-2 text-xs md:text-sm border border-gray-300">{entry.notes.S}</td>
                              <td className="px-2 md:px-4 py-2 text-xs md:text-sm border border-gray-300">{entry.status.S}</td>
                              <td className="px-2 md:px-4 py-2 border border-gray-300">
                                <button
                                  className="bg-red-500 rounded-md py-1 px-2 text-white text-xs md:text-sm"
                                  onClick={() => handleDelete(entry.plot.N, entry.timestamp.N, entry.id.S)}
                                >
                                  Delete
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    }, [])}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Container>
  );
}
