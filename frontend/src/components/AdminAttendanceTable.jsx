import React, { useState, useEffect } from "react";
import api from "../api/axios";

const AdminAttendanceTable = () => {
  const [records, setRecords] = useState([]);
  const [role, setRole] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchAttendance = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (role) params.append("role", role);
      if (start && end) {
        params.append("start", start);
        params.append("end", end);
      }

      const res = await api.get(
        `/attendance/filter?${params.toString()}`
      );

      // ✅ normalize response
      const normalized = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.records)
        ? res.data.records
        : [];

      setRecords(normalized);
    } catch (err) {
      console.error("Error fetching filtered attendance:", err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mt-8">
      <h3 className="text-gray-700 font-semibold mb-4">
        Recent Attendance Records
      </h3>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <select
          className="border rounded-lg p-2"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="employee">Employee</option>
          <option value="intern">Intern</option>
        </select>

        <input
          type="date"
          className="border rounded-lg p-2"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
        <input
          type="date"
          className="border rounded-lg p-2"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />

        <button
          onClick={fetchAttendance}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Filter
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-gray-500 text-center py-4">Loading...</p>
      ) : records.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Events</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr
                  key={rec._id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="px-4 py-2">
                    {rec.user?.name || "—"}
                  </td>
                  <td className="px-4 py-2">
                    {rec.user?.email || "—"}
                  </td>
                  <td className="px-4 py-2 capitalize">
                    {rec.role || "—"}
                  </td>
                  <td className="px-4 py-2">
                    {rec.date
                      ? new Date(rec.date).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-2">
                    {(Array.isArray(rec.events)
                      ? rec.events
                      : []
                    ).map((e, idx) => (
                      <span
                        key={idx}
                        className="inline-block bg-blue-100 text-blue-700
                          px-2 py-1 rounded-lg text-xs mr-2 mb-1"
                      >
                        {e?.type
                          ? e.type.replace(/([A-Z])/g, " $1")
                          : "Event"}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">
          No attendance records found.
        </p>
      )}
    </div>
  );
};

export default AdminAttendanceTable;
