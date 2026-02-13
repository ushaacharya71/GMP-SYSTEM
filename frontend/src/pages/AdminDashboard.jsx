import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import AnalyticsCards from "../components/AnalyticsCards";
import RevenueChart from "../components/RevenueChart";
import TeamPerformanceChart from "../components/TeamPerformanceChart";
import AnnouncementList from "../components/AnnouncementList";
import AddAnnouncement from "../components/AddAnnouncement";
import AdminLeaveApproval from "../components/AdminLeaveApproval";
import TopPerformers from "../components/TopPerformers";
import ManagerRevenue from "../components/ManagerRevenue";
import BirthdayBanner from "../components/BirthdayBanner";
import api from "../api/axios";

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [stats, setStats] = useState({});
  const [revenueData, setRevenueData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  /* ================= INIT ================= */
  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user"));
    if (!u) return;
    setUser(u);
    fetchAnalytics(u.role);
  }, []);

  /* ================= FETCH ANALYTICS ================= */
  const fetchAnalytics = async (role) => {
    try {
      const requests = [
        api.get("/analytics/overview"),
        api.get("/analytics/performance"),
      ];

      if (role === "admin") {
        requests.push(api.get("/analytics/revenue"));
      }

      const responses = await Promise.all(requests);

      setStats(responses[0]?.data || {});
      setPerformanceData(
        Array.isArray(responses[1]?.data) ? responses[1].data : []
      );
      setRevenueData(
        role === "admin" && Array.isArray(responses[2]?.data)
          ? responses[2].data
          : []
      );
    } catch (err) {
      console.error("Admin/HR analytics failed", err);
      setStats({});
      setRevenueData([]);
      setPerformanceData([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  /* ================= ✅ DOWNLOAD ATTENDANCE ================= */
  const downloadAttendance = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/attendance/hr/export", {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const blob = new Blob([res.data], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "attendance.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Attendance download failed", err);
      alert("Failed to download attendance");
    }
  };

  if (!user || loading) return null;

  const isAdmin = user.role === "admin";
  const isHR = user.role === "hr";

  return (
    <div className="flex min-h-screen bg-gray-200">
      <Sidebar
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div className="flex-1 md:ml-64 px-4 sm:px-6 py-6 space-y-8">
        <Navbar user={user} onMenuClick={() => setSidebarOpen(true)} />

        <BirthdayBanner />

        <AnalyticsCards data={stats} />

        {/* CHARTS */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {isAdmin && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="text-lg font-semibold mb-4">
                Revenue Overview
              </h3>
              <RevenueChart data={revenueData} />
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="text-lg font-semibold mb-4">
              Team Performance
            </h3>
            <TeamPerformanceChart data={performanceData} />
          </div>
        </section>

        {(isAdmin || isHR) && <ManagerRevenue />}

        {(isAdmin || isHR) && (
          <section>
            <h3 className="text-xl font-bold mb-4">Top Performers</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TopPerformers type="daily" title="🏅 Daily" />
              <TopPerformers type="weekly" title="🔥 Weekly" />
              <TopPerformers type="monthly" title="🏆 Monthly" />
            </div>
          </section>
        )}

        {/* LEAVE APPROVALS */}
        <section className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <h3 className="text-xl font-semibold">Leave Approvals</h3>

            <div className="flex flex-wrap gap-2">
              {/* ✅ ADMIN + HR DOWNLOAD */}
              {(isAdmin || isHR) && (
                <button
                  onClick={downloadAttendance}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md"
                >
                  ⬇ Download Attendance
                </button>
              )}

              <select
                value={month}
                onChange={(e) => setMonth(+e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i} value={i + 1}>
                    Month {i + 1}
                  </option>
                ))}
              </select>

              <select
                value={year}
                onChange={(e) => setYear(+e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                {[2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <AdminLeaveApproval />
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-6">
          <AddAnnouncement />
          <AnnouncementList />
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
