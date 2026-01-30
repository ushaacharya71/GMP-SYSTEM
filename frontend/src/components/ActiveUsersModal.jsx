import React, { useEffect, useState } from "react";
import api from "../api/axios";

const ActiveUsersModal = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchActiveUsers = async () => {
      try {
        const res = await api.get("/analytics/active-users");

        const normalized = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.users)
          ? res.data.users
          : [];

        setUsers(normalized);
      } catch (err) {
        console.error("Active users fetch failed", err);
        setUsers([]);
      }
    };

    fetchActiveUsers();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h3 className="font-semibold mb-4">Active Users Today</h3>

      {users.length === 0 ? (
        <p className="text-sm text-gray-500">No active users</p>
      ) : (
        users.map((u, i) => (
          <div
            key={u._id || i}
            className="flex justify-between py-2 border-b"
          >
            <span>{u.name || "—"}</span>
            <span>{u.team || u.teamName || "—"}</span>
          </div>
        ))
      )}
    </div>
  );
};

export default ActiveUsersModal;
