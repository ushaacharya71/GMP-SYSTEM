import React, { useEffect, useState, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import AttendancePanel from "../components/AttendancePanel";
import Announcements from "../components/Announcements";
import api from "../api/axios";
import TopPerformers from "../components/TopPerformers";
import BirthdayBanner from "../components/BirthdayBanner";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const InternDashboard = () => {
  const [user, setUser] = useState(null);
  const [performance, setPerformance] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* 🔒 AUTH GUARD */
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData?._id) {
      localStorage.clear();
      window.location.href = "/";
      return;
    }
    setUser(userData);
  }, []);

  /* ---------------- FETCH PERFORMANCE ---------------- */
  useEffect(() => {
    if (!user?._id) return;
    fetchPerformance(user._id);
  }, [user?._id]);

  const fetchPerformance = async (userId) => {
    try {
      const res = await api.get(`/users/${userId}/performance`);
      const normalized = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      setPerformance(normalized);
    } catch (err) {
      console.error("Error fetching performance:", err);
      setPerformance([]);
    }
  };

  /* ---------------- TOTAL REVENUE (DERIVED) ---------------- */
  const totalRevenue = useMemo(() => {
    return performance.reduce(
      (acc, item) => acc + Number(item.amount || 0),
      0
    );
  }, [performance]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-gray-100">
      {/* SIDEBAR */}
      <Sidebar
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* MAIN */}
      <div className="flex-1 md:ml-64 px-4 sm:px-6 py-6">
        {/* NAVBAR */}
        <Navbar user={user} onMenuClick={() => setSidebarOpen(true)} />

        {/* ================= HERO ================= */}
        <section
          className="relative mt-6 overflow-hidden rounded-[28px]
          bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400
          text-white p-6 sm:p-8 shadow-2xl"
        >
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Welcome, {user.name}
              </h1>
              <p className="text-sm text-white/85 mt-2 max-w-xl">
                Track your attendance, performance, and contribution.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <img
                src={user.avatar || "/avatar.png"}
                alt="Intern Avatar"
                className="w-10 h-10 rounded-full border-4 border-white/40 shadow-xl"
              />
              <div className="text-sm">
                <p className="font-semibold">{user.email}</p>
                <p className="text-white/80 capitalize">{user.role}</p>
              </div>
            </div>
          </div>

          <div
            className="absolute -top-24 -right-24 w-80 h-80
            bg-white/20 rounded-full blur-3xl"
          />
        </section>

        <BirthdayBanner />

        {/* ================= ATTENDANCE ================= */}
        <section className="mt-10 rounded-3xl bg-white border shadow-sm p-6">
          <h2 className="text-lg font-semibold text-orange-600 mb-4">
            Attendance Overview
          </h2>
          <AttendancePanel />
        </section>

        {/* ================= TOP PERFORMERS ================= */}
        <section className="mt-12">
          <h2 className="text-lg font-semibold text-orange-600 mb-4">
            Team Performance
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TopPerformers type="daily" title="Daily Leaders" />
            <TopPerformers type="weekly" title="Weekly Momentum" />
            <TopPerformers type="monthly" title="Monthly Champions" />
          </div>
        </section>

        {/* ================= PERFORMANCE ================= */}
        <section className="mt-12">
          <h2 className="text-lg font-semibold text-orange-600 mb-4">
            My Contribution
          </h2>

          <div
            className="rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500
            text-white p-6 shadow-xl mb-6"
          >
            <p className="text-sm text-white/80">
              Total Revenue Contributed
            </p>
            <p className="text-4xl font-bold mt-2">
              ₹ {totalRevenue.toLocaleString()}
            </p>
          </div>

          <div className="rounded-3xl bg-white border shadow-sm p-5">
            {performance.length === 0 ? (
              <p className="text-gray-500 text-center py-10">
                No performance data available
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={performance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="amount"
                    fill="#fb923c"
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* ================= ANNOUNCEMENTS ================= */}
        <section className="mt-12 rounded-3xl bg-white border shadow-sm p-6">
          <h2 className="text-lg font-semibold text-orange-600 mb-4">
            Announcements
          </h2>
          <Announcements />
        </section>
      </div>
    </div>
  );
};

export default InternDashboard;
