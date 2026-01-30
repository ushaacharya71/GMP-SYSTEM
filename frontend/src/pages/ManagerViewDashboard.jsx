import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import RevenueChart from "../components/RevenueChart";
import AttendanceSummary from "../components/AttendanceSummary";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const ManagerViewDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [manager, setManager] = useState(null);
  const [user, setUser] = useState(null);
  const [performance, setPerformance] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ================= AUTH GUARD ================= */
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));

    if (!stored || stored.role !== "manager") {
      window.location.href = "/";
      return;
    }

    setManager(stored);
  }, []);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    if (!manager) return;

    const loadAll = async () => {
      try {
        const [u, r, a] = await Promise.all([
          api.get(`/users/${id}`),
          api.get(`/revenue/${id}`),
          api.get(`/attendance/summary/${id}`),
        ]);

        setUser(u.data);
        setPerformance(r.data || []);
        setAttendance(a.data?.summary || []);
      } catch (err) {
        console.error("Manager view load failed", err);
        alert("You are not allowed to view this profile");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [id, manager, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading dashboard…
      </div>
    );
  }

  if (!user) return null;

  /* ================= UI ================= */
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div className="flex-1 md:ml-64 p-4 sm:p-6">
        <Navbar user={manager} onMenuClick={() => setSidebarOpen(true)} />

        {/* BACK */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm
          text-gray-600 hover:text-orange-600 transition mb-5"
        >
          <ArrowLeft size={18} />
          Back to Manager Dashboard
        </button>

        {/* PROFILE */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl shadow p-6 mb-6
          border-l-4 border-orange-500"
        >
          <h2 className="text-2xl font-bold text-gray-800">
            {user.name}
          </h2>
          <p className="text-gray-600">{user.email}</p>
          <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full
            bg-orange-100 text-orange-700 capitalize">
            {user.role}
          </span>
        </motion.div>

        {/* DATA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* REVENUE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-xl shadow"
          >
            <h3 className="font-semibold text-gray-700 mb-3">
              💰 Revenue Performance
            </h3>
            <RevenueChart data={performance} />
          </motion.div>

          {/* ATTENDANCE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow"
          >
            <h3 className="font-semibold text-gray-700 mb-3">
              🕒 Attendance Summary
            </h3>
            <AttendanceSummary data={attendance} />
          </motion.div>
        </div>

        {/* NOTICE */}
        <div
          className="mt-6 text-xs text-gray-600 bg-orange-50
          border border-orange-200 p-3 rounded-lg"
        >
          🔒 This is a <strong>read-only view</strong>. Managers cannot
          edit revenue or attendance from this screen.
        </div>
      </div>
    </div>
  );
};

export default ManagerViewDashboard;
