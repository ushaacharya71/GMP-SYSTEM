import React, { useEffect, useState } from "react";
import api from "../api/axios";

const LeaveSummary = () => {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  /* ---------------- FETCH SUMMARY ---------------- */
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get("/leaves/summary");
        setSummary(res.data || null);
      } catch (err) {
        console.error("Failed to fetch leave summary", err);
        setError(true);
      }
    };

    fetchSummary();
  }, []);

  /* ❌ INTERN BLOCK */
  if (user?.role === "intern") {
    return (
      <div className="bg-white rounded-xl shadow p-6 text-gray-500">
        Leave system is not applicable for interns.
      </div>
    );
  }

  /* ❌ ERROR */
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow p-6 text-red-500">
        Failed to load leave summary.
      </div>
    );
  }

  /* ⏳ LOADING */
  if (!summary) {
    return (
      <div className="bg-white rounded-xl shadow p-6 text-gray-500">
        Loading leave summary…
      </div>
    );
  }

  /* SAFE ACCESS */
  const casual = summary.casual || { used: 0, total: 0, remaining: 0 };
  const sick = summary.sick || { used: 0, total: 0, remaining: 0 };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Leave Balance
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CASUAL */}
        <LeaveCard
          title="Casual Leave"
          used={casual.used}
          total={casual.total}
          remaining={casual.remaining}
          color="blue"
        />

        {/* SICK */}
        <LeaveCard
          title="Sick Leave"
          used={sick.used}
          total={sick.total}
          remaining={sick.remaining}
          color="red"
        />
      </div>
    </div>
  );
};

/* ---------------- REUSABLE CARD ---------------- */
const LeaveCard = ({ title, used, total, remaining, color }) => {
  const exhausted = remaining === 0;

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <p className="text-sm text-gray-600">{title}</p>

      <p
        className={`text-xl font-bold text-${color}-600`}
      >
        {used} / {total}
      </p>

      <p className="text-sm text-gray-500">
        Remaining: {remaining}
      </p>

      {exhausted && (
        <p className="text-xs text-red-500 mt-1">
          {title} exhausted
        </p>
      )}
    </div>
  );
};

export default LeaveSummary;
