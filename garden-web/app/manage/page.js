"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Container from "../components/container";
import { useState, useEffect } from "react";
import UserModal from "../components/user-modal";
import { filter } from "ionicons/icons";

export default function ManagePage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(users);
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session.user.role !== "admin") {
      router.push("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated" && session.user.role === "admin") {
      const fetchUsers = async () => {
        const response = await fetch("/api/users/all");
        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data);
      };
      fetchUsers();
    }
  }, [status, session]);

  function handleSearchChange(event) {
    setSearch(event.target.value);
    if (event.target.value === "") {
      setFilteredUsers(users);
      return;
    }
    setFilteredUsers(
      users.filter((user) => user.email.S.toLowerCase().includes(event.target.value.toLowerCase()))
    );
  }

  // Handle loading while session is being fetched
  if (status === "loading") {
    return (
      <Container title="Manage">
        <p>Loading session...</p>
      </Container>
    );
  }

  if (status === "authenticated" && session.user.role !== "admin") {
    return <p>Redirecting...</p>;
  }

  return (
    <Container title={"Manage"}>
      {/* Search Bar */}
      <div className="m-4">
        <input
          type="text"
          placeholder="Search users..."
          className="p-2 m-2 md:m-4 rounded-lg border border-gray-300 focus:outline-none"
          onChange={(e) => handleSearchChange(e)}
        />
      </div>
      <div className="flex flex-col items-center justify-center bg-[#c2ccb5] rounded-lg p-6 md:p-8 w-full">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Manage Users</h1>
        {/* Scrollable Table Section */}
        <div className="overflow-x-auto w-full mt-4">
          <table className="table-auto w-full border-collapse border border-gray-400">
            <thead>
              <tr>
                <th className="px-4 py-2 text-sm md:text-base border border-gray-300">Email</th>
                <th className="px-4 py-2 text-sm md:text-base border border-gray-300">Role</th>
                <th className="px-4 py-2 text-sm md:text-base border border-gray-300">Plots</th>
                <th className="px-4 py-2 text-sm md:text-base border border-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr
                  key={user.email.S}
                  className={index % 2 === 0 ? "even:bg-[#aab39f]" : "odd:bg-white"}
                >
                  <td className="px-4 py-2 text-xs md:text-sm text-center border border-gray-300">
                    {user.email.S}
                  </td>
                  <td className="px-4 py-2 text-xs md:text-sm text-center border border-gray-300">
                    {user.role.S}
                  </td>
                  <td className="px-4 py-2 text-xs md:text-sm text-center border border-gray-300">
                    {user.plots.L.length > 0
                      ? user.plots.L
                          .map((plot) => parseInt(plot.N, 10))
                          .sort((a, b) => a - b)
                          .join(", ")
                      : "None"}
                  </td>
                  <td className="px-4 py-2 text-xs md:text-sm text-center border border-gray-300">
                    <UserModal user={user} />
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
