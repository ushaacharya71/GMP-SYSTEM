// import ExcelJS from "exceljs";
// import Attendance from "../models/Attendance.js";
// import User from "../models/User.js";

// /* =====================================================
//    📊 HR – EXPORT ALL ATTENDANCE (EXCEL)
// ===================================================== */
// export const exportAttendanceExcel = async (req, res) => {
//   try {
//     // 🔐 HR ONLY
//     if (req.user.role !== "hr") {
//       return res.status(403).json({
//         message: "Only HR can export attendance",
//       });
//     }

//     // 📥 Fetch attendance with user + manager
//     const records = await Attendance.find()
//       .populate({
//         path: "user",
//         select: "name role manager",
//         populate: {
//           path: "manager",
//           select: "name",
//         },
//       })
//       .sort({ date: 1 });

//     const workbook = new ExcelJS.Workbook();
//     const sheet = workbook.addWorksheet("Attendance");

//     // 🧾 Excel columns
//     sheet.columns = [
//       { header: "Date", key: "date", width: 14 },
//       { header: "Employee Name", key: "employee", width: 25 },
//       { header: "Role", key: "role", width: 15 },
//       { header: "Manager", key: "manager", width: 25 },
//       { header: "Check In", key: "checkIn", width: 18 },
//       { header: "Lunch Out", key: "lunchOut", width: 18 },
//       { header: "Lunch In", key: "lunchIn", width: 18 },
//       { header: "Break Out", key: "breakOut", width: 18 },
//       { header: "Break In", key: "breakIn", width: 18 },
//       { header: "Check Out", key: "checkOut", width: 18 },
//     ];

//     // 🧠 Helper to extract event time
//     const getTime = (events, type) => {
//       const e = events.find((ev) => ev.type === type);
//       return e ? new Date(e.time).toLocaleTimeString() : "—";
//     };

//     // ➕ Add rows
//     records.forEach((att) => {
//       sheet.addRow({
//         date: att.date,
//         employee: att.user?.name || "—",
//         role: att.role,
//         manager: att.user?.manager?.name || "—",
//         checkIn: getTime(att.events, "checkIn"),
//         lunchOut: getTime(att.events, "lunchOut"),
//         lunchIn: getTime(att.events, "lunchIn"),
//         breakOut: getTime(att.events, "breakOut"),
//         breakIn: getTime(att.events, "breakIn"),
//         checkOut: getTime(att.events, "checkOut"),
//       });
//     });

//     // 📤 Send file
//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );
//     res.setHeader(
//       "Content-Disposition",
//       "attachment; filename=attendance.xlsx"
//     );

//     await workbook.xlsx.write(res);
//     res.end();
//   } catch (error) {
//     console.error("❌ Attendance export error:", error);
//     res.status(500).json({ message: "Failed to export attendance" });
//   }
// };


import ExcelJS from "exceljs";
import Attendance from "../models/Attendance.js";
import User from "../models/User.js";

/* =====================================================
   📊 ADMIN + HR – EXPORT ALL ATTENDANCE (EXCEL)
===================================================== */
export const exportAttendanceExcel = async (req, res) => {
  try {
    // 🔐 ADMIN + HR ONLY
    if (!["admin", "hr"].includes(req.user.role)) {
      return res.status(403).json({
        message: "Only Admin or HR can export attendance",
      });
    }

    // 📥 Fetch attendance with user + manager
    const records = await Attendance.find()
      .populate({
        path: "user",
        select: "name role manager",
        populate: {
          path: "manager",
          select: "name",
        },
      })
      .sort({ date: 1 });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Attendance");

    // 🧾 Excel columns
    sheet.columns = [
      { header: "Date", key: "date", width: 14 },
      { header: "Employee Name", key: "employee", width: 25 },
      { header: "Role", key: "role", width: 15 },
      { header: "Manager", key: "manager", width: 25 },
      { header: "Check In", key: "checkIn", width: 18 },
      { header: "Lunch Out", key: "lunchOut", width: 18 },
      { header: "Lunch In", key: "lunchIn", width: 18 },
      { header: "Break Out", key: "breakOut", width: 18 },
      { header: "Break In", key: "breakIn", width: 18 },
      { header: "Check Out", key: "checkOut", width: 18 },
    ];

    // 🧠 Helper to extract event time
    const getTime = (events, type) => {
      const e = events.find((ev) => ev.type === type);
      return e ? new Date(e.time).toLocaleTimeString() : "—";
    };

    // ➕ Add rows
    records.forEach((att) => {
      sheet.addRow({
        date: att.date,
        employee: att.user?.name || "—",
        role: att.role,
        manager: att.user?.manager?.name || "—",
        checkIn: getTime(att.events, "checkIn"),
        lunchOut: getTime(att.events, "lunchOut"),
        lunchIn: getTime(att.events, "lunchIn"),
        breakOut: getTime(att.events, "breakOut"),
        breakIn: getTime(att.events, "breakIn"),
        checkOut: getTime(att.events, "checkOut"),
      });
    });

    // 📤 Send file
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=attendance.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("❌ Attendance export error:", error);
    res.status(500).json({ message: "Failed to export attendance" });
  }
};
