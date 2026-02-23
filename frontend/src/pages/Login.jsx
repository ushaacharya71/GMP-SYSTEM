// import React, { useState, useEffect } from "react";
// import api from "../api/axios";
// import { useNavigate, useLocation } from "react-router-dom";
// import { toast } from "react-toastify";
// import { motion } from "framer-motion";
// import { Eye, EyeOff } from "lucide-react";

// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false); //
//   const [loading, setLoading] = useState(false);

//   const navigate = useNavigate();
//   const location = useLocation();

//   /* ================= SAFETY GUARD ================= */
//   useEffect(() => {
//     if (location.pathname === "/") {
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//     }
//   }, [location.pathname]);

//   /* ================= LOGIN ================= */
//   const handleLogin = async (e) => {
//     e.preventDefault();

//     if (!email || !password) {
//       toast.error("Email and password are required");
//       return;
//     }

//     try {
//       setLoading(true);

//       const { data } = await api.post("/auth/login", {
//         email,
//         password,
//       });

//       localStorage.setItem("token", data.token);
//       localStorage.setItem("user", JSON.stringify(data.user));

//       toast.success(`Welcome ${data.user.name}!`);

//       switch (data.user.role) {
//         case "admin":
//         case "hr":
//           navigate("/admin", { replace: true });
//           break;
//         case "manager":
//           navigate("/manager", { replace: true });
//           break;
//         case "employee":
//           navigate("/employee", { replace: true });
//           break;
//         default:
//           navigate("/intern", { replace: true });
//       }
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       className="min-h-screen flex items-center justify-center px-4"
//       style={{
//         background: `
//           linear-gradient(
//             to bottom,
//             #321300 0%,
//             #5c2308 22%,
//             #6b2a0a 38%,
//             #3f1806 58%,
//             #1b0c03 78%,
//             #000000 100%
//           )
//         `,
//       }}
//     >
//       <motion.div
//         initial={{ opacity: 0, scale: 0.95, y: 24 }}
//         animate={{ opacity: 1, scale: 1, y: 0 }}
//         transition={{ duration: 0.7, ease: "easeOut" }}
//         className="relative w-full max-w-6xl min-h-[520px]
//         grid grid-cols-1 md:grid-cols-2
//         rounded-[32px] overflow-hidden
//         shadow-[0_40px_120px_rgba(0,0,0,0.6)]"
//       >
//         {/* LEFT BRAND */}
//         <div className="relative z-10 hidden md:flex flex-col justify-center items-center bg-cover bg-center"
//           style={{
//             backgroundImage:
//               "url('https://img.freepik.com/premium-photo/diverse-team-working-together-modern-office-space_1282444-209487.jpg?w=1400')",
//           }}
//         >
//           <div className="absolute inset-0 bg-gradient-to-br from-orange-900/70 to-orange-600/70" />
//          <div className="relative z-10 flex flex-col items-center justify-center text-center px-10">
//   <h1
//     className="
//       text-2xl md:text-2xl lg:text-4xl
//       font-extrabold tracking-tight
//       text-white leading-tight
//       max-w-2xl
//     "
//   >
//     Glowlogics <br />
//     <span className="text-orange-200">
//       Management Portal
//     </span>
//   </h1>

//   <p
//     className="
//       mt-5 text-sm md:text-base
//       text-orange-100/90
//       max-w-md leading-relaxed
//     "
//   >
//     Manage the grind without the chaos.
//   </p>
// </div>

//         </div>

//         {/* RIGHT LOGIN FORM */}
//         <div className="relative z-10 flex flex-col justify-center bg-white p-10 sm:p-14">
//           <h2 className="text-3xl font-bold text-gray-900">
//             Welcome back 👋
//           </h2>
//           <p className="text-gray-500 mt-2 text-sm mb-10">
//             Login to access your dashboard
//           </p>

//           <form onSubmit={handleLogin} className="space-y-6">
//             {/* EMAIL */}
//             <input
//               type="email"
//               placeholder="you@company.com"
//               className="w-full border border-gray-300 rounded-xl
//               px-4 py-3.5 text-sm
//               focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />

//             {/* PASSWORD WITH 👁️ */}
//             <div className="relative">
//               <input
//                 type={showPassword ? "text" : "password"}
//                 placeholder="••••••••"
//                 className="w-full border border-gray-300 rounded-xl
//                 px-4 py-3.5 pr-11 text-sm
//                 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />

//               <button
//                 type="button"
//                 onClick={() => setShowPassword((prev) => !prev)}
//                 className="absolute right-4 top-1/2 -translate-y-1/2
//                 text-gray-500 hover:text-orange-600 transition"
//                 aria-label="Toggle password visibility"
//               >
//                 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//               </button>
//             </div>

//             {/* FORGOT PASSWORD */}
//             {/* <div className="text-right">
//               <button
//                 type="button"
//                 onClick={() => navigate("/forgot-password")}
//                 className="text-sm font-medium text-orange-600 hover:text-orange-700 hover:underline transition"
//               >
//                 Forgot password?
//               </button>
//             </div> */}

//             {/* SUBMIT */}
//             <motion.button
//               whileHover={{ scale: 1.03 }}
//               whileTap={{ scale: 0.97 }}
//               type="submit"
//               disabled={loading}
//               className={`w-full py-3.5 rounded-xl
//                 font-semibold text-white text-sm
//                 transition-all ${
//                   loading
//                     ? "bg-gray-400 cursor-not-allowed"
//                     : "bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-lg"
//                 }`}
//             >
//               {loading ? "Signing in..." : "Sign In"}
//             </motion.button>
//           </form>

//           <div className="mt-12 text-center text-xs text-gray-400">
//             © {new Date().getFullYear()} Glowlogics — All rights reserved
//           </div>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default Login;

import React, { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

const Login = ({ setUser }) => {
  // ✅ receive setUser
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  /* ================= LOGIN ================= */
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const { data } = await api.post("/auth/login", {
        email,
        password,
      });

      // ✅ Save token & user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ Update App state immediately (VERY IMPORTANT)
      if (setUser) {
        setUser(data.user);
      }

      toast.success(`Welcome ${data.user.name}!`);

      // ✅ Role-based redirect
      switch (data.user.role) {
        case "admin":
        case "hr":
          navigate("/admin", { replace: true });
          break;

        case "manager":
          navigate("/manager", { replace: true });
          break;

        case "employee":
          navigate("/employee", { replace: true });
          break;

        case "marketing":
          navigate("/marketing", { replace: true });
          break;

        case "intern":
          navigate("/intern", { replace: true });
          break;

        default:
          navigate("/", { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
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
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative w-full max-w-6xl min-h-[520px]
        grid grid-cols-1 md:grid-cols-2
        rounded-[32px] overflow-hidden
        shadow-[0_40px_120px_rgba(0,0,0,0.6)]"
      >
        {/* LEFT BRAND */}
        <div
          className="relative z-10 hidden md:flex flex-col justify-center items-center bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://img.freepik.com/premium-photo/diverse-team-working-together-modern-office-space_1282444-209487.jpg?w=1400')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-900/70 to-orange-600/70" />

          <div className="relative z-10 flex flex-col items-center justify-center text-center px-10">
            <h1 className="text-2xl md:text-2xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight max-w-2xl">
              Glowlogics <br />
              <span className="text-orange-200">Management Portal</span>
            </h1>

            <p className="mt-5 text-sm md:text-base text-orange-100/90 max-w-md leading-relaxed">
              Manage the grind without the chaos.
            </p>
          </div>
        </div>

        {/* RIGHT LOGIN FORM */}
        <div className="relative z-10 flex flex-col justify-center bg-white p-10 sm:p-14">
          <h2 className="text-3xl font-bold text-gray-900">Welcome back 👋</h2>
          <p className="text-gray-500 mt-2 text-sm mb-10">
            Login to access your dashboard
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* EMAIL */}
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

            {/* PASSWORD */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-xl
                px-4 py-3.5 pr-11 text-sm
                focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2
                text-gray-500 hover:text-orange-600 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* SUBMIT */}
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
              {loading ? "Signing in..." : "Sign In"}
            </motion.button>
          </form>

          <div className="mt-12 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Glowlogics — All rights reserved
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
