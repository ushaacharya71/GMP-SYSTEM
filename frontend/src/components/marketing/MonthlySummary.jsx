import React from "react";

const MonthlySummary = ({ summary }) => {
  if (!summary) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow">
        <p className="text-gray-500">Loading monthly summary...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow mt-6">
      <h3 className="text-lg font-semibold mb-4">
        Monthly Summary
      </h3>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-gray-500">Total Leads</p>
          <p className="text-2xl font-bold text-blue-600">
            {summary.totalLeads || 0}
          </p>
        </div>

        <div>
          <p className="text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">
            ₹ {summary.totalRevenue || 0}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MonthlySummary;