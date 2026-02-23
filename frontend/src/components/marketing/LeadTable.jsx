import React from "react";

const LeadTable = ({ leads }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">My Leads</h2>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Date</th>
            <th className="p-2">Leads</th>
            <th className="p-2">Forms</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((item) => (
            <tr key={item._id} className="text-center border-t">
              <td className="p-2">
                {new Date(item.date).toLocaleDateString()}
              </td>
              <td className="p-2">{item.leads}</td>
              <td className="p-2">{item.forms}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeadTable;