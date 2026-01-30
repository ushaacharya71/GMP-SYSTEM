import React, { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const ApplyLeave = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  /* 🔒 AUTH GUARD */
  useEffect(() => {
    if (!user?._id) {
      localStorage.clear();
      navigate("/");
    }
  }, [user, navigate]);

  const [form, setForm] = useState({
    type: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  const [rawSummary, setRawSummary] = useState({});
  const [loading, setLoading] = useState(false);

  /* ================= FETCH LEAVE SUMMARY ================= */
  const fetchSummary = async () => {
    try {
      const res = await api.get("/leaves/summary");

      // ✅ Normalize summary (production-safe)
      const normalized =
        res.data?.summary ||
        res.data?.data ||
        res.data ||
        {};

      setRawSummary(normalized);
    } catch (err) {
      console.error("Failed to load leave summary", err);
      setRawSummary({});
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  /* ❌ INTERN BLOCK (CLEAR UX) */
  if (user?.role === "intern") {
    return (
      <div className="bg-white p-6 rounded-xl shadow text-gray-600">
        🚫 Interns are not eligible to apply for leave.
      </div>
    );
  }

  /* ================= HANDLE INPUT ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= CALCULATE DAYS (SAFE) ================= */
  const totalDays = useMemo(() => {
    if (!form.fromDate || !form.toDate) return 0;

    const start = new Date(form.fromDate);
    const end = new Date(form.toDate);

    if (end < start) return 0;

    const diff =
      Math.ceil(
        (end.setHours(0,0,0,0) - start.setHours(0,0,0,0)) /
          (1000 * 60 * 60 * 24)
      ) + 1;

    return diff;
  }, [form.fromDate, form.toDate]);

  /* ================= BALANCE ================= */
  const remaining =
    form.type && rawSummary
      ? rawSummary?.[form.type]?.remaining ?? 0
      : null;

  const isExhausted =
    remaining !== null && totalDays > 0 && totalDays > remaining;

  /* ================= SUBMIT ================= */
  const submit = async () => {
    const { type, fromDate, toDate, reason } = form;

    if (!type || !fromDate || !toDate || !reason.trim()) {
      alert("All fields are required");
      return;
    }

    if (new Date(toDate) < new Date(fromDate)) {
      alert("To date cannot be before from date");
      return;
    }

    if (isExhausted) {
      alert("❌ Leave balance insufficient");
      return;
    }

    try {
      setLoading(true);

      await api.post("/leaves/apply", {
        type,
        fromDate,
        toDate,
        reason,
      });

      alert("✅ Leave applied successfully");

      setForm({
        type: "",
        fromDate: "",
        toDate: "",
        reason: "",
      });

      fetchSummary();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to apply leave"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="font-semibold mb-4">Apply Leave</h2>

      {/* LEAVE TYPE */}
      <select
        name="type"
        value={form.type}
        onChange={handleChange}
        className="border p-2 rounded w-full mb-3"
      >
        <option value="">Select Leave Type</option>
        <option value="sick">Sick Leave</option>
        <option value="casual">Casual Leave</option>
      </select>

      {/* BALANCE INFO */}
      {form.type && remaining !== null && (
        <p
          className={`text-sm mb-2 ${
            isExhausted ? "text-red-600" : "text-green-600"
          }`}
        >
          Remaining {form.type} leave: {remaining}
          {totalDays > 0 && ` | Requested: ${totalDays} days`}
        </p>
      )}

      {/* FROM DATE */}
      <input
        type="date"
        name="fromDate"
        min={new Date().toISOString().split("T")[0]}
        value={form.fromDate}
        onChange={handleChange}
        className="border p-2 rounded w-full mb-3"
      />

      {/* TO DATE */}
      <input
        type="date"
        name="toDate"
        min={form.fromDate || new Date().toISOString().split("T")[0]}
        value={form.toDate}
        onChange={handleChange}
        className="border p-2 rounded w-full mb-3"
      />

      {/* REASON */}
      <textarea
        name="reason"
        value={form.reason}
        onChange={handleChange}
        placeholder="Reason for leave"
        className="border p-2 rounded w-full mb-4"
      />

      <button
        onClick={submit}
        disabled={
          loading ||
          isExhausted ||
          !form.type ||
          !form.fromDate ||
          !form.toDate
        }
        className={`px-4 py-2 rounded w-full text-white transition ${
          loading || isExhausted
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Submitting..." : "Submit Leave"}
      </button>
    </div>
  );
};

export default ApplyLeave;
