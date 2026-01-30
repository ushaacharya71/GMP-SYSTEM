import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = [
  "#3b82f6", // blue
  "#16a34a", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
];

const LeaveAnalytics = ({ data }) => {
  // ✅ ALWAYS normalize
  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map((d) => ({
      name: d._id || "Unknown",
      count: Number(d.count) || 0,
    }));
  }, [data]);

  if (chartData.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center">
        No leave analytics available
      </p>
    );
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="count"
            nameKey="name"
            outerRadius={100}
            label
          >
            {chartData.map((_, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LeaveAnalytics;
