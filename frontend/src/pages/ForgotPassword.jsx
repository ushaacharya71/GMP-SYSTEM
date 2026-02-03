import { useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/auth/forgot-password", { email });
      toast.success("Reset link sent to your email");
      setEmail("");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: `
          linear-gradient(
            to bottom,
            #321300 0%,
            #5c2308 22%,
            #6b2a0a 38%,
            #3f1806 58%,
            #1b0c03 78%,
            #000000 100%
          )
        `,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-white rounded-[28px]
        shadow-[0_30px_90px_rgba(0,0,0,0.45)] p-10"
      >
        <h2 className="text-3xl font-bold text-gray-900">
          Forgot Password 🔐
        </h2>

        <p className="text-sm text-gray-500 mt-2 mb-8">
          Enter your registered email and we’ll send you a reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            placeholder="you@company.com"
            className="w-full border border-gray-300 rounded-xl
            px-4 py-3.5 text-sm
            focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl
              font-semibold text-white text-sm
              transition-all ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-lg"
              }`}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </motion.button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          Remembered your password?{" "}
          <Link
            to="/"
            className="text-orange-600 font-semibold hover:underline"
          >
            Back to Login
          </Link>
        </div>

        <div className="mt-10 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Glowlogics
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
