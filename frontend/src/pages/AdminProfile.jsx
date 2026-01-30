import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminProfile = () => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));

  // 🔒 Guard: no user → logout
  useEffect(() => {
    if (!storedUser?._id) {
      localStorage.clear();
      navigate("/");
    }
  }, [storedUser, navigate]);

  const [form, setForm] = useState({
    name: storedUser?.name || "",
    email: storedUser?.email || "",
    phone: storedUser?.phone || "",
    avatar: storedUser?.avatar || "",
  });

  const [saving, setSaving] = useState(false);

  /* -------------------------------
      INPUT HANDLER
  -------------------------------- */
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /* -------------------------------
      SAVE PROFILE (SAFE)
  -------------------------------- */
  const handleSave = async () => {
    if (!storedUser?._id) return;

    try {
      setSaving(true);

      const res = await api.put(`/users/${storedUser._id}`, form);

      // ✅ Normalize response
      const updatedUser =
        res.data?.user ||
        res.data?.data ||
        res.data ||
        null;

      if (!updatedUser) {
        throw new Error("Invalid response");
      }

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      alert("✅ Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert(
        err.response?.data?.message ||
          "❌ Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  if (!storedUser) return null;

  return (
    <div className="p-8 bg-gray-50 min-h-screen flex justify-center items-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          My Profile
        </h2>

        {/* AVATAR */}
        <div className="flex flex-col items-center gap-4 mb-4">
          <img
            src={
              form.avatar ||
              "https://via.placeholder.com/100"
            }
            alt="avatar"
            className="w-24 h-24 rounded-full border"
          />

          <input
            type="text"
            name="avatar"
            placeholder="Avatar URL"
            value={form.avatar}
            onChange={handleChange}
            className="border rounded-lg p-2 w-full"
          />
        </div>

        {/* FIELDS */}
        <div className="flex flex-col gap-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="border rounded-lg p-2"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="border rounded-lg p-2 bg-gray-100"
            disabled
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
            className="border rounded-lg p-2"
          />

          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg transition
              ${
                saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
