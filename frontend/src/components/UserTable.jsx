import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const UserTable = ({ users = [], onEdit, onDelete }) => {
  const navigate = useNavigate();

  const loggedInUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  }, []);

  // ✅ Always array-safe
  const safeUsers = useMemo(
    () => (Array.isArray(users) ? users : []),
    [users]
  );

  /* --------------------------------
      HANDLE VIEW NAVIGATION (SAFE)
  -------------------------------- */
  const handleView = (user) => {
    if (!loggedInUser) {
      alert("Session expired. Please login again.");
      return;
    }

    // Admin → view anyone
    if (loggedInUser.role === "admin") {
      navigate(`/admin/user/${user._id}`);
      return;
    }

    // Manager → view only assigned users
    if (loggedInUser.role === "manager") {
      const managerId =
        typeof user.manager === "object"
          ? user.manager?._id
          : user.manager;

      if (managerId === loggedInUser._id) {
        navigate(`/manager/intern/${user._id}`);
        return;
      }
    }

    alert("You are not allowed to view this profile");
  };

  if (safeUsers.length === 0) {
    return (
      <div className="text-sm text-gray-500 text-center py-6">
        No users found.
      </div>
    );
  }

  return (
    <motion.table
      className="w-full border-collapse border border-gray-200 text-sm text-left"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <thead className="bg-gray-50 text-gray-600">
        <tr>
          <th className="p-3 border">Name</th>
          <th className="p-3 border">Email</th>
          <th className="p-3 border">Role</th>
          <th className="p-3 border">Team / Position</th>
          <th className="p-3 border">Joining Date</th>
          <th className="p-3 border">Actions</th>
        </tr>
      </thead>

      <tbody>
        {safeUsers.map((user) => (
          <tr
            key={user._id}
            className="hover:bg-gray-50 transition"
          >
            <td className="p-3 border">
              {user.name || "—"}
            </td>

            <td className="p-3 border">
              {user.email || "—"}
            </td>

            <td className="p-3 border capitalize">
              {user.role === "employee" ? "Probation" : user.role || "—"}
            </td>

            <td className="p-3 border">
              {user.role === "employee"
                ? user.position || "—"
                : user.teamName || "—"}
            </td>

            <td className="p-3 border">
              {user.joiningDate
                ? new Date(user.joiningDate).toLocaleDateString()
                : "—"}
            </td>

            <td className="p-3 border space-x-2">
              {/* VIEW */}
              <button
                onClick={() => handleView(user)}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                View
              </button>

              {/* EDIT (ADMIN ONLY) */}
              {loggedInUser?.role === "admin" && (
                <button
                  onClick={() => onEdit?.(user)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
              )}

              {/* DELETE (ADMIN ONLY) */}
              {loggedInUser?.role === "admin" && (
                <button
                  onClick={() => onDelete?.(user)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </motion.table>
  );
};

export default UserTable;
