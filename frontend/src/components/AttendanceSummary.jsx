import React, { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const AttendanceSummary = ({ userId }) => {
  const [rawData, setRawData] = useState([]);
  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const targetUserId = userId || loggedInUser?._id;

  useEffect(() => {
    if (!targetUserId) return;

    const fetchSummary = async () => {
      try {
        const res = await api.get(`/attendance/summary/${targetUserId}`);

        // ✅ Normalize response (production safe)
        const normalized = Array.isArray(res.data?.summary)
          ? res.data.summary
          : Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
          ? res.data
          : [];

        setRawData(normalized);
      } catch (err) {
        console.error("Error fetching attendance summary:", err);
        setRawData([]);
      }
    };

    fetchSummary();
  }, [targetUserId]);

  // ✅ Ensure recharts-safe structure
  const data = useMemo(
    () =>
      rawData.map((d) => ({
        date: d.date || d._id || "—",
        hours:
          Number(d.hours) ||
          Number(d.totalHours) ||
          Number(d.value) ||
          0,
      })),
    [rawData]
  );

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mt-6">
      <h3 className="text-gray-700 font-semibold mb-4">
        Attendance Summary
      </h3>

      {data.length === 0 ? (
        <p className="text-gray-500">No attendance data yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="hours"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default AttendanceSummary;
