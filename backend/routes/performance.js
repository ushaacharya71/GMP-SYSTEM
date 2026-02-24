import express from "express";
import mongoose from "mongoose";
import Revenue from "../models/Revenue.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

/* =====================================================
   📊 PERFORMANCE OVERVIEW
   -----------------------------------------------------
   Admin   → Company performance
   HR      → Company performance
   Manager → Own team performance
   GET /api/performance
===================================================== */
router.get("/", protect, async (req, res) => {
  try {
    if (!["admin", "manager", "hr"].includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    let matchStage = {};

    // Manager → only own team
    if (req.user.role === "manager") {
      matchStage.manager = new mongoose.Types.ObjectId(req.user._id);
    }

    const data = await Revenue.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" },
          },
          amount: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(
      data.map((d) => ({
        date: d._id,
        amount: d.amount,
      }))
    );
  } catch (error) {
    console.error("Performance overview error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   📊 MANAGER-WISE REVENUE
   -----------------------------------------------------
   Admin + HR → All managers
   Manager    → Self only
   GET /api/performance/manager-revenue?type=daily|monthly
===================================================== */
router.get("/manager-revenue", protect, async (req, res) => {
  try {
    if (!["admin", "manager", "hr"].includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { type = "daily" } = req.query;

    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    if (type === "monthly") {
      startDate.setDate(1);
    }

    let matchStage = {
      date: { $gte: startDate },
      manager: { $ne: null },
    };

    // Manager → only self
    if (req.user.role === "manager") {
      matchStage.manager = new mongoose.Types.ObjectId(req.user._id);
    }

    const data = await Revenue.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$manager",
          revenue: { $sum: "$amount" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "manager",
        },
      },
      { $unwind: "$manager" },
      {
        $project: {
          _id: 0,
          managerId: "$manager._id",
          managerName: "$manager.name",
          revenue: 1,
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    res.json(data);
  } catch (error) {
    console.error("Manager revenue error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// /* =====================================================
//    🏆 TOP PERFORMERS
//    -----------------------------------------------------
//    Admin + HR → Company-wide
//    Manager    → Own team only
//    GET /api/performance/top?type=daily|weekly|monthly
// ===================================================== */
// router.get("/top", protect, async (req, res) => {
//   try {
//     if (!["admin", "manager", "hr"].includes(req.user.role)) {
//       return res.status(403).json({ message: "Unauthorized" });
//     }

//     const { type = "daily" } = req.query;

//     let startDate = new Date();
//     startDate.setHours(0, 0, 0, 0);

//     if (type === "weekly") {
//       startDate.setDate(startDate.getDate() - 6);
//     }

//     if (type === "monthly") {
//       startDate = new Date(
//         startDate.getFullYear(),
//         startDate.getMonth(),
//         1
//       );
//     }

//     let matchStage = { date: { $gte: startDate } };

//     // Manager → only own team
//     if (req.user.role === "manager") {
//       matchStage.manager = new mongoose.Types.ObjectId(req.user._id);
//     }

//     const limit = type === "monthly" ? 5 : 3;

//     const top = await Revenue.aggregate([
//       { $match: matchStage },
//       {
//         $group: {
//           _id: "$user",
//           total: { $sum: "$amount" },
//         },
//       },
//       { $sort: { total: -1 } },
//       { $limit: limit },
//     ]);

//     const populated = await User.populate(top, {
//       path: "_id",
//       select: "name role avatar",
//     });

//     res.json(
//       populated.map((p, index) => ({
//         rank: index + 1,
//         userId: p._id._id,
//         name: p._id.name,
//         role: p._id.role,
//         avatar: p._id.avatar,
//         total: p.total,
//       }))
//     );
//   } catch (error) {
//     console.error("Top performers error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });
/* =====================================================
   🏆 TOP PERFORMERS
===================================================== */
router.get("/top", protect, async (req, res) => {
  try {
    if (!["admin", "manager", "hr", "intern", "employee"].includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { type = "daily" } = req.query;

    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    if (type === "weekly") {
      startDate.setDate(startDate.getDate() - 6);
    }

    if (type === "monthly") {
      startDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        1
      );
    }

    let matchStage = { date: { $gte: startDate } };

    // Manager → only own team
    if (req.user.role === "manager") {
      matchStage.manager = new mongoose.Types.ObjectId(req.user._id);
    }

    const limit = type === "monthly" ? 5 : 3;

    const top = await Revenue.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$user",
          total: { $sum: "$amount" },
        },
      },
      { $sort: { total: -1 } },
      { $limit: limit },
    ]);

    const populated = await User.populate(top, {
      path: "_id",
      select: "name role avatar",
    });

    // ✅ FILTER NULL USERS + MAP SAFELY
    const safeResult = populated
      .filter((p) => p._id) // <-- THIS FIXES THE CRASH
      .map((p, index) => ({
        rank: index + 1,
        userId: p._id._id,
        name: p._id.name,
        role: p._id.role,
        avatar: p._id.avatar,
        total: p.total,
      }));

    return res.json(safeResult);
  } catch (error) {
    console.error("Top performers error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});


export default router;
