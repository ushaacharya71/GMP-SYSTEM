import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from "../api/axios";

const ManagerRevenue = () => {
  const [type, setType] = useState("daily");
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRevenue = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/performance/manager-revenue?type=${type}`
      );

      // ✅ Normalize response (bullet-proof)
      const normalized = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data?.revenue)
        ? res.data.revenue
        : [];

      setRawData(normalized);
    } catch (err) {
      console.error("Manager revenue fetch error", err);
      setRawData([]);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchRevenue();
  }, [fetchRevenue]);

  // ✅ Always map-safe
  const data = useMemo(
    () => (Array.isArray(rawData) ? rawData : []),
    [rawData]
  );

  const rankAccent = [
    "border-emerald-500",
    "border-blue-500",
    "border-orange-500",
  ];

  return (
    <section className="mt-10 bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Manager-wise Revenue
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {type === "daily"
              ? "Today's team revenue by manager"
              : "This month's team revenue by manager"}
          </p>
        </div>

        {/* TOGGLE */}
        <div className="flex bg-gray-100 rounded-xl p-1 w-fit">
          {["daily", "monthly"].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition
                ${
                  type === t
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="text-sm text-gray-500">
          Loading revenue performance…
        </div>
      ) : data.length === 0 ? (
        <div className="text-sm text-gray-500 bg-gray-50 border rounded-xl p-4">
          No revenue data available.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {data.map((row, index) => (
            <div
              key={row.managerId ?? row._id ?? index}
              className={`relative bg-white border border-gray-200 rounded-xl p-5
                shadow-sm hover:shadow-md transition
                border-l-4 ${rankAccent[index] || "border-gray-300"}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-500 uppercase">
                  Rank #{index + 1}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  Manager
                </span>
              </div>

              <h3 className="text-base font-semibold text-gray-900">
                {row.managerName || "—"}
              </h3>

              <div className="mt-4">
                <p className="text-3xl font-semibold text-gray-900 tracking-tight">
                  ₹ {Number(row.revenue ?? 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Team revenue ({type})
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ManagerRevenue;
