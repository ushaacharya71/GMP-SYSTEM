import React, { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import UserTable from "../components/UserTable";
import UserModal from "../components/UserModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Eye, EyeOff, Search } from "lucide-react";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user"));

  /* ================= ROLE GUARD ================= */
  useEffect(() => {
    if (
      !storedUser ||
      !["admin", "manager", "marketing"].includes(storedUser.role)
    ) {
      window.location.href = "/unauthorized";
      return;
    }
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  /* ================= FETCH USERS ================= */
  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = ["manager", "marketing"].includes(storedUser.role)
        ? await api.get("/users/manager/interns")
        : await api.get("/users");

      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER USERS ================= */
  const filteredUsers = useMemo(() => {
    return users.filter((u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [users, search]);

  /* ================= HANDLERS ================= */
  const handleAdd = () => {
    setSelectedUser(null);
    setIsEdit(false);
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEdit(true);
    setShowModal(true);
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDelete(true);
  };

  /* ================= RESET PASSWORD ================= */
  const handleResetPassword = (user) => {
    if (storedUser.role !== "admin") return;
    setSelectedUser(user);
    setNewPassword("");
    setShowPassword(false);
    setShowResetPassword(true);
  };

  const submitResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setSaving(true);
      await api.post(`/users/${selectedUser._id}/reset-password`, {
        password: newPassword,
      });
      toast.success("Password updated successfully");
      closeResetModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    } finally {
      setSaving(false);
    }
  };

  const closeResetModal = () => {
    setShowResetPassword(false);
    setSelectedUser(null);
    setNewPassword("");
    setShowPassword(false);
  };

  const confirmDelete = async () => {
    try {
      setSaving(true);
      await api.delete(`/users/${selectedUser._id}`);
      toast.success("User deleted");
      setShowDelete(false);
      fetchUsers();
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setSaving(false);
    }
  };

  /* ================= SAVE USER ================= */
  const handleSave = async (data) => {
    try {
      setSaving(true);

      const payload = { ...data };

      // Managers & Marketing cannot change manager manually
      if (["manager", "marketing"].includes(storedUser.role)) {
        delete payload.manager;
      }

      if (payload.manager === "") payload.manager = null;

      // Only intern & employee can have manager
      if (!["intern", "employee"].includes(payload.role)) {
        payload.manager = null;
      }

      if (isEdit) {
        await api.put(`/users/${selectedUser._id}`, payload);
        toast.success("User updated");
      } else {
        await api.post("/users", payload);
        toast.success("User created");
      }

      setShowModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-white shadow-xl rounded-2xl p-6"
      >
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              👥{" "}
              {["manager", "marketing"].includes(storedUser.role)
                ? "My Team"
                : "Manage Users"}
            </h2>
            <p className="text-sm text-gray-500">
              Manage users, roles & credentials
            </p>
          </div>

          <button
            onClick={handleAdd}
            disabled={saving}
            className="bg-gradient-to-r from-orange-500 to-orange-600
              text-white px-5 py-2 rounded-xl font-semibold
              hover:shadow-lg transition"
          >
            + Add User
          </button>
        </div>

        {/* SEARCH */}
        <div className="relative mb-6 max-w-sm">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-200 via-orange-100 to-orange-200 blur-sm opacity-70"></div>

          <div className="relative flex items-center rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-300">
            <Search size={18} className="ml-3 text-orange-500" />
            <input
              type="text"
              placeholder="Search by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent px-3 py-2.5
                text-sm text-gray-700 placeholder-gray-400
                rounded-xl focus:outline-none"
            />
          </div>
        </div>

        {/* TABLE */}
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading users…</div>
        ) : (
          <UserTable
            users={filteredUsers}
            showSerialNo
            onEdit={storedUser.role === "admin" ? handleEdit : null}
            onDelete={storedUser.role === "admin" ? handleDelete : null}
            onResetPassword={
              storedUser.role === "admin" ? handleResetPassword : null
            }
          />
        )}
      </motion.div>

      {/* USER MODAL */}
      {showModal && (
        <UserModal
          user={selectedUser}
          isEdit={isEdit}
          allUsers={users}
          onClose={() => !saving && setShowModal(false)}
          onSave={handleSave}
        />
      )}

      {/* DELETE MODAL */}
      {showDelete && (
        <ConfirmDeleteModal
          user={selectedUser}
          loading={saving}
          onClose={() => !saving && setShowDelete(false)}
          onConfirm={confirmDelete}
        />
      )}

      {/* RESET PASSWORD MODAL */}
      {showResetPassword && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">Reset Password</h3>
            <p className="text-sm text-gray-500 mb-4">
              Set new password for <b>{selectedUser.email}</b>
            </p>

            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={closeResetModal} className="text-sm">
                Cancel
              </button>
              <button
                onClick={submitResetPassword}
                disabled={saving}
                className="btn-primary"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
