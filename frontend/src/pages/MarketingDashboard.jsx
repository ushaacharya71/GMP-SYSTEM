import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import AddLeadForm from "../components/marketing/AddLeadForm";
import LeadTable from "../components/marketing/LeadTable";
import MonthlySummary from "../components/marketing/MonthlySummary";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../api/axios";

const MarketingDashboard = () => {
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [summary, setSummary] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.replace("/");
  };

  /* ================= INIT ================= */
  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user"));
    if (!u) return;
    setUser(u);
    fetchLeads();
    fetchSummary();
  }, []);

  /* ================= FETCH LEADS ================= */
  const fetchLeads = async () => {
    try {
      const res = await api.get("/leads/me");
      setLeads(res.data || []);
    } catch (err) {
      console.error("Lead fetch error:", err);
    }
  };

  /* ================= FETCH SUMMARY ================= */
  const fetchSummary = async () => {
    try {
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();

      const res = await api.get(
        `/leads/monthly?month=${month}&year=${year}`
      );
      setSummary(res.data || null);
    } catch (err) {
      console.error("Summary error:", err);
    }
  };

  if (!user) return null;

  /* ================= STATS ================= */
  const totalLeads = leads.length;
  const totalRevenue = leads.reduce(
    (sum, l) => sum + (l.amount || 0),
    0
  );

  /* ================= CHART DATA ================= */
  const chartData = leads.map((l) => ({
    date: new Date(l.date).toLocaleDateString(),
    revenue: l.amount || 0,
  }));

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      <div className="flex-1 md:ml-64 p-6 space-y-8">
        <Navbar user={user} onMenuClick={() => setSidebarOpen(true)} />

        {/* ================= STATS CARDS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow">
            <h4 className="text-gray-500">Total Leads</h4>
            <p className="text-3xl font-bold text-blue-600">
              {totalLeads}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <h4 className="text-gray-500">Total Revenue</h4>
            <p className="text-3xl font-bold text-green-600">
              ₹ {totalRevenue}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <h4 className="text-gray-500">This Month</h4>
            <p className="text-3xl font-bold text-purple-600">
              {summary?.totalLeads || 0}
            </p>
          </div>
        </div>

        {/* ================= REVENUE CHART ================= */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="text-lg font-semibold mb-4">
            Revenue Trend
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ================= ADD LEAD ================= */}
        <AddLeadForm refresh={fetchLeads} />

        {/* ================= LEAD TABLE ================= */}
        <LeadTable leads={leads} />

        {/* ================= MONTHLY SUMMARY ================= */}
        <MonthlySummary summary={summary} />
      </div>
    </div>
  );
};

export default MarketingDashboard;
