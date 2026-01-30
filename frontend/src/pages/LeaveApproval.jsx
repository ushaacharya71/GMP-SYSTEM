import React, { useEffect, useState } from "react";
import api from "../api/axios";

const LeaveApproval = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  /* ---------------- FETCH PENDING LEAVES ---------------- */
  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const res = await api.get("/leave/pending");
        setLeaves(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch pending leaves", err);
        setLeaves([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, []);

  /* ---------------- APPROVE / REJECT ---------------- */
  const action = async (id, status) => {
    try {
      setProcessingId(id);
      await api.post(`/leave/${id}/action`, { action: status });

      // ✅ remove from list safely
      setLeaves((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      console.error("Leave action failed", err);
      alert("Failed to update leave status");
    } finally {
      setProcessingId(null);
    }
  };

  /* ---------------- UI STATES ---------------- */
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow text-sm text-gray-500">
        Loading pending leaves…
      </div>
    );
  }

  if (leaves.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow text-sm text-gray-500">
        No pending leave requests 🎉
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="font-semibold mb-4 text-gray-800">
        Pending Leave Requests
      </h2>

      <div className="space-y-3">
        {leaves.map((l) => (
          <div
            key={l._id}
            className="flex items-center justify-between
            border border-gray-200 rounded-lg p-3"
          >
            {/* LEFT */}
            <div>
              <p className="font-medium text-gray-800">
                {l.user?.name || "—"}
              </p>
              <p className="text-sm text-gray-500">
                {l.type} ·{" "}
                {l.fromDate
                  ? new Date(l.fromDate).toLocaleDateString()
                  : "—"}{" "}
                →{" "}
                {l.toDate
                  ? new Date(l.toDate).toLocaleDateString()
                  : "—"}
              </p>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-3">
              <button
                onClick={() => action(l._id, "approved")}
                disabled={processingId === l._id}
                className="text-green-600 hover:text-green-800
                disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Approve
              </button>

              <button
                onClick={() => action(l._id, "rejected")}
                disabled={processingId === l._id}
                className="text-red-600 hover:text-red-800
                disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaveApproval;
