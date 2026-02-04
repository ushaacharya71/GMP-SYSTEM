// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import api from "../api/axios";
// import { ArrowLeft } from "lucide-react";
// import RevenueChart from "../components/RevenueChart";
// import AttendanceChart from "../components/AttendanceChart";
// import { toast } from "react-toastify";


// const UserProfile = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");

//   const [user, setUser] = useState(null);
//   const [performance, setPerformance] = useState([]);
//   const [attendance, setAttendance] = useState([]);
//   const [salary, setSalary] = useState([]);

//   const [baseSalary, setBaseSalary] = useState("");
//   const [bonus, setBonus] = useState("");
//   const [deductions, setDeductions] = useState("");
//   const [month, setMonth] = useState("");

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   /* ================= FETCH ALL DATA ================= */
//   useEffect(() => {
//     let mounted = true;

//     const fetchAll = async () => {
//       try {
//         setLoading(true);
//         setError("");

//         const [u, p, a, s] = await Promise.all([
//           api.get(`/users/${id}`),
//           api.get(`/users/${id}/performance`),
//           api.get(`/attendance/summary/${id}`),
//           api.get(`/salary/${id}`),
//         ]);

//         if (!mounted) return;

//         setUser(u.data);
//         setPerformance(Array.isArray(p.data) ? p.data : []);
//         setAttendance(a.data?.summary || []);
//         setSalary(Array.isArray(s.data) ? s.data : []);
//       } catch (err) {
//         console.error(err);
//         if (mounted) setError("Failed to load user profile");
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     };

//     fetchAll();
//     return () => (mounted = false);
//   }, [id]);

//   /* ================= UPDATE SALARY ================= */
//   const handleSalarySubmit = async (e) => {
//     e.preventDefault();

//     if (!month) {
//       toast.error("Please select month");
//       return;
//     }

//     if (Number(baseSalary) <= 0) {
//       toast.error("Enter valid base amount");
//       return;
//     }

//     try {
//       await api.post("/salary/set", {
//         userId: id,
//         baseSalary: Number(baseSalary),
//         bonus: Number(bonus || 0),
//         deductions: Number(deductions || 0),
//         month,
//       });

//       toast.success("Salary updated successfully");

//       setBaseSalary("");
//       setBonus("");
//       setDeductions("");
//       setMonth("");

//       const res = await api.get(`/salary/${id}`);
//       setSalary(Array.isArray(res.data) ? res.data : []);
//     } catch {
//       toast.error("Failed to update salary");
//     }
//   };

//   /* ================= GUARDS ================= */
//   if (loading) {
//     return <div className="p-6 text-gray-500">Loading profile…</div>;
//   }

//   if (error) {
//     return <div className="p-6 text-red-600">{error}</div>;
//   }

//   if (!user) return null;

//   const canManageSalary =
//     loggedInUser?.role === "admin" || loggedInUser?.role === "manager";

//   const hideSalaryForUser = user.role === "intern" || user.role === "employee";

//   const joinedDate = user.joiningDate
//     ? new Date(user.joiningDate).toLocaleDateString()
//     : "—";

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       {/* BACK */}
//       <button
//         onClick={() => navigate(-1)}
//         className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
//       >
//         <ArrowLeft size={16} className="mr-2" /> Back to users
//       </button>

//       {/* PROFILE */}
//       <section className="bg-white border rounded-2xl p-6 shadow-sm mb-6">
//         <div className="flex flex-col sm:flex-row gap-6">
//         {/* avtar image need to update */}
//          <img
//   src={
//     user.avatarUrl ||
//     "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png"
//   }
//   alt={user.name}
//   className="w-32 h-32 rounded-full object-cover"
// />


//           <div className="flex-1">
//             <h2 className="text-xl font-semibold">{user.name}</h2>
//             <p className="text-sm text-gray-600">{user.email}</p>

//             <div className="flex flex-wrap gap-3 mt-2">
//               <span className="badge">{user.role}</span>
//               <span className="badge">
//                 {user.teamName || user.position || "—"}
//               </span>
//               <span className="badge">Joined {joinedDate}</span>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ANALYTICS */}
//       <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="bg-white border rounded-2xl p-5 shadow-sm">
//           <h3 className="text-sm font-semibold mb-3">Revenue Performance</h3>
//           <RevenueChart data={performance} />
//         </div>

//         <div className="bg-white border rounded-2xl p-5 shadow-sm">
//           <h3 className="text-sm font-semibold mb-3">Attendance Overview</h3>
//           <AttendanceChart data={attendance} />
//         </div>
//       </section>

//       {/* SALARY new commit change  */}
//       {canManageSalary && !hideSalaryForUser && (
//         <section className="bg-white border rounded-2xl p-6 shadow-sm mt-6">
//           <h3 className="text-lg font-semibold mb-4">
//             Salary / Stipend Management
//           </h3>

//           <form
//             onSubmit={handleSalarySubmit}
//             className="grid grid-cols-1 md:grid-cols-2 gap-4"
//           >
//             <input
//               type="number"
//               placeholder="Base Amount"
//               value={baseSalary}
//               onChange={(e) => setBaseSalary(e.target.value)}
//               className="input"
//             />
//             <input
//               type="number"
//               placeholder="Incentives"
//               value={bonus}
//               onChange={(e) => setBonus(e.target.value)}
//               className="input"
//             />
//             <input
//               type="number"
//               placeholder="Deductions"
//               value={deductions}
//               onChange={(e) => setDeductions(e.target.value)}
//               className="input"
//             />
//             <input
//               type="month"
//               value={month}
//               onChange={(e) => setMonth(e.target.value)}
//               className="input"
//             />

//             <button className="btn-primary col-span-1 md:col-span-2">
//               Update Salary
//             </button>
//           </form>

//           <div className="mt-6">
//             <h4 className="text-sm font-semibold mb-3">Salary History</h4>

//             {salary.length === 0 ? (
//               <p className="text-sm text-gray-500">No salary records found.</p>
//             ) : (
//               <ul className="space-y-3">
//                 {salary.map((s) => (
//                   <li key={s._id} className="border rounded-xl p-4 bg-gray-50">
//                     <div className="flex justify-between text-sm font-medium">
//                       <span>{s.month}</span>
//                       <span>₹{s.totalSalary}</span>
//                     </div>
//                     <div className="text-xs text-gray-600 mt-2 grid grid-cols-2 gap-y-1">
//                       <span>Base: ₹{s.baseSalary}</span>
//                       <span>Bonus: ₹{s.bonus}</span>
//                       <span>Deductions: ₹{s.deductions}</span>
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//         </section>
//       )}
//     </div>
//   );
// };

// export default UserProfile;

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { ArrowLeft } from "lucide-react";
import RevenueChart from "../components/RevenueChart";
import AttendanceChart from "../components/AttendanceChart";
import { toast } from "react-toastify";

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");

  const [user, setUser] = useState(null);
  const [performance, setPerformance] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [salary, setSalary] = useState([]);

  const [baseSalary, setBaseSalary] = useState("");
  const [bonus, setBonus] = useState("");
  const [deductions, setDeductions] = useState("");
  const [month, setMonth] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      try {
        const [u, p, a, s] = await Promise.all([
          api.get(`/users/${id}`),
          api.get(`/users/${id}/performance`),
          api.get(`/attendance/summary/${id}`),
          api.get(`/salary/${id}`),
        ]);

        if (!mounted) return;

        setUser(u.data);
        setPerformance(Array.isArray(p.data) ? p.data : []);
        setAttendance(a.data?.summary || []);
        setSalary(Array.isArray(s.data) ? s.data : []);
      } catch {
        setError("Failed to load user profile");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAll();
    return () => (mounted = false);
  }, [id]);

  /* ================= SALARY UPDATE ================= */
  const handleSalarySubmit = async (e) => {
    e.preventDefault();

    if (!month) return toast.error("Please select month");
    if (Number(baseSalary) <= 0) return toast.error("Enter valid base amount");

    try {
      await api.post("/salary/set", {
        userId: id,
        baseSalary: Number(baseSalary),
        bonus: Number(bonus || 0),
        deductions: Number(deductions || 0),
        month,
      });

      toast.success("Salary updated successfully");

      setBaseSalary("");
      setBonus("");
      setDeductions("");
      setMonth("");

      const res = await api.get(`/salary/${id}`);
      setSalary(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Failed to update salary");
    }
  };

  /* ================= GUARDS ================= */
  if (loading) return <div className="p-6 text-gray-500">Loading profile…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!user) return null;

  const canManageSalary =
    loggedInUser?.role === "admin" || loggedInUser?.role === "manager";

  const hideSalaryForUser = user.role === "intern" || user.role === "employee";

  const joinedDate = user.joiningDate
    ? new Date(user.joiningDate).toLocaleDateString()
    : "—";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* BACK */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={16} className="mr-2" /> Back
      </button>

      {/* ================= PROFILE HEADER ================= */}
      <section className="relative overflow-hidden rounded-3xl p-8 mb-8
        bg-white/70 backdrop-blur-xl
        border border-white/40
        shadow-[0_20px_60px_rgba(0,0,0,0.12)]">

        <div className="absolute inset-0 bg-gradient-to-br
          from-orange-400/10 via-transparent to-purple-500/10" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          {/* AVATAR */}
          <div className="relative group">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr
              from-orange-500 to-pink-500 blur opacity-40
              group-hover:opacity-70 transition" />

            <img
              src={
                user.avatarUrl ||
                "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png"
              }
              alt={user.name}
              className="relative w-32 h-32 rounded-full object-cover
                ring-4 ring-white shadow-xl
                transition-transform duration-300 group-hover:scale-105"
            />

            <span className="absolute bottom-2 right-2 w-4 h-4 rounded-full
              bg-green-500 ring-2 ring-white" />
          </div>

          {/* INFO */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              {user.name}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{user.email}</p>

            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
              <span className="px-4 py-1.5 text-xs font-semibold rounded-full
                bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow">
                {user.role.toUpperCase()}
              </span>

              <span className="px-4 py-1.5 text-xs rounded-full bg-gray-100">
                {user.teamName || user.position || "—"}
              </span>

              <span className="px-4 py-1.5 text-xs rounded-full bg-gray-100">
                Joined {joinedDate}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= QUICK STATS ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          ["Role", user.role],
          ["Team", user.teamName || user.position || "—"],
          ["Joined", joinedDate],
          ["Status", "Active"],
        ].map(([label, value]) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-md">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="font-semibold text-gray-900 capitalize">{value}</p>
          </div>
        ))}
      </div>

      {/* ================= ANALYTICS ================= */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6
          shadow-[0_20px_40px_rgba(0,0,0,0.08)]
          hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)]
          transition-shadow">
          <h3 className="text-sm font-semibold uppercase tracking-wide mb-4">
            Revenue Performance
          </h3>
          <RevenueChart data={performance} />
        </div>

        <div className="bg-white rounded-3xl p-6
          shadow-[0_20px_40px_rgba(0,0,0,0.08)]
          hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)]
          transition-shadow">
          <h3 className="text-sm font-semibold uppercase tracking-wide mb-4">
            Attendance Overview
          </h3>
          <AttendanceChart data={attendance} />
        </div>
      </section>

      {/* ================= SALARY ================= */}
      {canManageSalary && !hideSalaryForUser && (
        <section className="bg-white rounded-3xl p-8 mt-8
          shadow-[0_25px_60px_rgba(0,0,0,0.1)]">
          <h3 className="text-lg font-semibold mb-6">
            Salary / Stipend Management
          </h3>

          <form
            onSubmit={handleSalarySubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <input type="number" placeholder="Base Amount" value={baseSalary}
              onChange={(e) => setBaseSalary(e.target.value)} className="input" />
            <input type="number" placeholder="Incentives" value={bonus}
              onChange={(e) => setBonus(e.target.value)} className="input" />
            <input type="number" placeholder="Deductions" value={deductions}
              onChange={(e) => setDeductions(e.target.value)} className="input" />
            <input type="month" value={month}
              onChange={(e) => setMonth(e.target.value)} className="input" />

            <button className="btn-primary col-span-1 md:col-span-2">
              Update Salary
            </button>
          </form>

          <div className="mt-6">
            <h4 className="text-sm font-semibold mb-3">Salary History</h4>

            {salary.length === 0 ? (
              <p className="text-sm text-gray-500">No salary records found.</p>
            ) : (
              <ul className="space-y-3">
                {salary.map((s) => (
                  <li key={s._id}
                    className="rounded-2xl p-4 bg-gradient-to-br
                      from-gray-50 to-white border shadow-sm">
                    <div className="flex justify-between font-medium">
                      <span>{s.month}</span>
                      <span className="text-orange-600">
                        ₹{s.totalSalary}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mt-2 grid grid-cols-2 gap-y-1">
                      <span>Base: ₹{s.baseSalary}</span>
                      <span>Bonus: ₹{s.bonus}</span>
                      <span>Deductions: ₹{s.deductions}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default UserProfile;
