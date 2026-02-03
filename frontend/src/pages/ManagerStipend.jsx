
// import React, { useEffect, useState } from "react";
// import api from "../api/axios";
// import Sidebar from "../components/Sidebar";
// import Navbar from "../components/Navbar";
// import { toast } from "react-toastify";

// const ManagerStipend = () => {
//   const [manager, setManager] = useState(null);
//   const [interns, setInterns] = useState([]);
//   const [stipends, setStipends] = useState({});
//   const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
//   const [loadingId, setLoadingId] = useState(null);
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   /* ================= AUTH GUARD ================= */
//   useEffect(() => {
//     const user = JSON.parse(localStorage.getItem("user"));
//     if (!user || user.role !== "manager") {
//       window.location.href = "/";
//       return;
//     }
//     setManager(user);
//   }, []);

//   /* ================= INIT STIPENDS (SAFE) ================= */
//   const initStipends = (list) => {
//     if (!Array.isArray(list)) return;

//     const data = {};
//     list.forEach((i) => {
//       if (i?._id) {
//         data[i._id] = {
//           baseSalary: "",
//           bonus: "",
//           deductions: "",
//         };
//       }
//     });
//     setStipends(data);
//   };

//   /* ================= FETCH INTERNS ================= */
//   const fetchInterns = async () => {
//     try {
//       const res = await api.get("/users/manager/interns");

//       const safeInterns =
//         Array.isArray(res.data)
//           ? res.data
//           : Array.isArray(res.data?.users)
//           ? res.data.users
//           : [];

//       setInterns(safeInterns);
//       initStipends(safeInterns);
//     } catch (err) {
//       console.error("Failed to load interns", err);
//       toast.error("Failed to load interns");
//       setInterns([]);
//       setStipends({});
//     }
//   };

//   useEffect(() => {
//     if (manager) fetchInterns();
//   }, [manager]);

//   /* ================= INPUT HANDLER ================= */
//   const updateField = (id, field, value) => {
//     setStipends((prev) => ({
//       ...prev,
//       [id]: {
//         ...prev[id],
//         [field]: value,
//       },
//     }));
//   };

//   /* ================= UPDATE STIPEND ================= */
//   const handleUpdate = async (internId) => {
//     const s = stipends[internId];

//     if (!s || Number(s.baseSalary) <= 0) {
//       toast.error("Enter valid stipend amount");
//       return;
//     }

//     try {
//       setLoadingId(internId);

//       await api.post("/salary/set", {
//         userId: internId,
//         baseSalary: Number(s.baseSalary),
//         bonus: Number(s.bonus || 0),
//         deductions: Number(s.deductions || 0),
//         month,
//       });

//       toast.success("Stipend updated");
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to update stipend");
//     } finally {
//       setLoadingId(null);
//     }
//   };

//   if (!manager) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-gray-500">
//         Loading…
//       </div>
//     );
//   }

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       <Sidebar
//         onLogout={() => {
//           localStorage.clear();
//           window.location.href = "/";
//         }}
//         isOpen={sidebarOpen}
//         setIsOpen={setSidebarOpen}
//       />

//       <div className="flex-1 md:ml-64 px-4 sm:px-6 py-6">
//         <Navbar user={manager} onMenuClick={() => setSidebarOpen(true)} />

//         <h1 className="text-2xl font-bold mb-6">
//           Intern Stipend Management
//         </h1>

//         {/* MONTH */}
//         <div className="mb-6 flex items-center gap-3">
//           <label className="font-medium">Month:</label>
//           <input
//             type="month"
//             value={month}
//             onChange={(e) => setMonth(e.target.value)}
//             className="border p-2 rounded-lg"
//           />
//         </div>

//         {interns.length === 0 ? (
//           <p className="text-gray-500">No interns assigned to you.</p>
//         ) : (
//           <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="p-3 text-left">Intern</th>
//                   <th className="p-3">Gross</th>
//                   <th className="p-3">Incentives</th>
//                   <th className="p-3">Deductions</th>
//                   <th className="p-3">Net</th>
//                   <th className="p-3">Action</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {interns.map((i) => {
//                   const s = stipends[i._id] || {};
//                   const net =
//                     Number(s.baseSalary || 0) +
//                     Number(s.bonus || 0) -
//                     Number(s.deductions || 0);

//                   return (
//                     <tr key={i._id} className="border-t">
//                       <td className="p-3 font-medium">{i.name}</td>

//                       <td className="p-3">
//                         <input
//                           type="number"
//                           className="border p-2 rounded w-28"
//                           value={s.baseSalary || ""}
//                           onChange={(e) =>
//                             updateField(i._id, "baseSalary", e.target.value)
//                           }
//                         />
//                       </td>

//                       <td className="p-3">
//                         <input
//                           type="number"
//                           className="border p-2 rounded w-28"
//                           value={s.bonus || ""}
//                           onChange={(e) =>
//                             updateField(i._id, "bonus", e.target.value)
//                           }
//                         />
//                       </td>

//                       <td className="p-3">
//                         <input
//                           type="number"
//                           className="border p-2 rounded w-28"
//                           value={s.deductions || ""}
//                           onChange={(e) =>
//                             updateField(i._id, "deductions", e.target.value)
//                           }
//                         />
//                       </td>

//                       <td className="p-3 font-semibold">₹ {Math.max(net, 0)}</td>

//                       <td className="p-3">
//                         <button
//                           onClick={() => handleUpdate(i._id)}
//                           disabled={loadingId === i._id}
//                           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
//                         >
//                           {loadingId === i._id ? "Saving…" : "Update"}
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ManagerStipend;

import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

const ManagerStipend = () => {
  const [manager, setManager] = useState(null);
  const [interns, setInterns] = useState([]);
  const [stipends, setStipends] = useState({});
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loadingId, setLoadingId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ================= AUTH GUARD ================= */
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "manager") {
      window.location.href = "/";
      return;
    }
    setManager(user);
  }, []);

  /* ================= INIT STIPENDS ================= */
  const initStipends = (list) => {
    if (!Array.isArray(list)) return;
    const data = {};
    list.forEach((i) => {
      if (i?._id) {
        data[i._id] = {
          baseSalary: "",
          bonus: "",
          deductions: "",
        };
      }
    });
    setStipends(data);
  };

  /* ================= FETCH INTERNS ================= */
  const fetchInterns = async () => {
    try {
      const res = await api.get("/users/manager/interns");
      const safeInterns = Array.isArray(res.data) ? res.data : [];
      setInterns(safeInterns);
      initStipends(safeInterns);
    } catch (err) {
      toast.error("Failed to load interns");
      setInterns([]);
      setStipends({});
    }
  };

  useEffect(() => {
    if (manager) fetchInterns();
  }, [manager]);

  /* ================= INPUT HANDLER ================= */
  const updateField = (id, field, value) => {
    setStipends((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  /* ================= UPDATE STIPEND ================= */
  const handleUpdate = async (internId) => {
    const s = stipends[internId];
    if (!s || Number(s.baseSalary) <= 0) {
      toast.error("Enter valid stipend amount");
      return;
    }

    try {
      setLoadingId(internId);
      await api.post("/salary/set", {
        userId: internId,
        baseSalary: Number(s.baseSalary),
        bonus: Number(s.bonus || 0),
        deductions: Number(s.deductions || 0),
        month,
      });
      toast.success("Stipend updated");
    } catch {
      toast.error("Failed to update stipend");
    } finally {
      setLoadingId(null);
    }
  };

  if (!manager) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar
        onLogout={() => {
          localStorage.clear();
          window.location.href = "/";
        }}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div className="flex-1 md:ml-64 px-4 sm:px-6 py-6">
        <Navbar user={manager} onMenuClick={() => setSidebarOpen(true)} />

        <h1 className="text-2xl font-bold mb-6">
          Intern Stipend Management
        </h1>

        {/* MONTH */}
        <div className="mb-6 flex items-center gap-3">
          <label className="font-medium">Month:</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border p-2 rounded-lg"
          />
        </div>

        {interns.length === 0 ? (
          <p className="text-gray-500">No interns assigned to you.</p>
        ) : (
          <div className="bg-white rounded-2xl shadow overflow-x-auto">
            <table className="min-w-[900px] w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-4 text-left">Intern</th>
                  <th className="p-4 text-right">Gross (₹)</th>
                  <th className="p-4 text-right">Incentives (₹)</th>
                  <th className="p-4 text-right">Deductions (₹)</th>
                  <th className="p-4 text-right">Net (₹)</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {interns.map((i) => {
                  const s = stipends[i._id] || {};
                  const net =
                    Number(s.baseSalary || 0) +
                    Number(s.bonus || 0) -
                    Number(s.deductions || 0);

                  return (
                    <tr
                      key={i._id}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="p-4 font-medium">{i.name}</td>

                      <td className="p-4 text-right">
                        <input
                          type="number"
                          className="border p-2 rounded w-28 text-right"
                          value={s.baseSalary || ""}
                          onChange={(e) =>
                            updateField(i._id, "baseSalary", e.target.value)
                          }
                        />
                      </td>

                      <td className="p-4 text-right">
                        <input
                          type="number"
                          className="border p-2 rounded w-28 text-right"
                          value={s.bonus || ""}
                          onChange={(e) =>
                            updateField(i._id, "bonus", e.target.value)
                          }
                        />
                      </td>

                      <td className="p-4 text-right">
                        <input
                          type="number"
                          className="border p-2 rounded w-28 text-right"
                          value={s.deductions || ""}
                          onChange={(e) =>
                            updateField(i._id, "deductions", e.target.value)
                          }
                        />
                      </td>

                      <td className="p-4 text-right font-semibold">
                        ₹ {Math.max(net, 0)}
                      </td>

                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleUpdate(i._id)}
                          disabled={loadingId === i._id}
                          className="bg-blue-600 hover:bg-blue-700
                          text-white px-4 py-2 rounded-lg min-w-[90px]"
                        >
                          {loadingId === i._id ? "Saving…" : "Update"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerStipend;
