import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Cake } from "lucide-react";

const BirthdayBanner = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchBirthdays();
  }, []);

  const fetchBirthdays = async () => {
    try {
      const res = await api.get("/birthday/today");

      // ✅ Normalize response (important)
      const normalized = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.users)
        ? res.data.users
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      setUsers(normalized);
    } catch (err) {
      console.error("Birthday fetch failed", err);
      setUsers([]); // ✅ always keep array
    }
  };

  // ✅ Safe guard (no crash)
  if (!Array.isArray(users) || users.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-xl p-5 mb-6 shadow-lg">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
        <Cake /> 🎉 Today’s Birthdays
      </h3>

      <div className="space-y-2">
        {users.map((u) => (
          <div
            key={u._id}
            className="flex items-center justify-between bg-white/20 rounded-lg p-3"
          >
            <div>
              <p className="font-semibold">{u.name}</p>
              <p className="text-xs opacity-90">
                {u.role} • {u.teamName || "—"}
              </p>
            </div>
            <span className="text-xl">🎂</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BirthdayBanner;
