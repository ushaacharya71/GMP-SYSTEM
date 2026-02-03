// import express from "express";
// import Revenue from "../models/Revenue.js";
// import User from "../models/User.js";
// import { protect } from "../middleware/auth.js";

// const router = express.Router();

// /**
//  * -----------------------------------
//  * 📌 ADD / UPDATE DAILY REVENUE
//  * -----------------------------------
//  * Admin   → anyone
//  * Manager → assigned interns / employees
//  *
//  * RULE:
//  * - Frontend NEVER sends date
//  * - Backend ALWAYS uses today's normalized date
//  */
// router.post("/add", protect, async (req, res) => {
//   try {
//     const { userId, amount, description } = req.body;

//     if (!userId || amount === undefined) {
//       return res
//         .status(400)
//         .json({ message: "userId and amount are required" });
//     }

//     const targetUser = await User.findById(userId);
//     if (!targetUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     /* ================= ROLE CHECK ================= */
//     if (req.user.role === "manager") {
//       if (
//         targetUser.manager?.toString() !== req.user._id.toString()
//       ) {
//         return res
//           .status(403)
//           .json({ message: "Not your assigned user" });
//       }
//     }

//     if (req.user.role !== "admin" && req.user.role !== "manager") {
//       return res.status(403).json({ message: "Unauthorized" });
//     }

//     /* ================= TODAY (NORMALIZED) ================= */
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     /* ================= UPSERT DAILY REVENUE ================= */
//     const entry = await Revenue.findOneAndUpdate(
//       {
//         user: userId,
//         date: today,
//       },
//       {
//         $set: {
//           amount: Number(amount),
//           manager:
//             req.user.role === "manager" ? req.user._id : null,
//           description: description || "Daily revenue update",
//         },
//       },
//       {
//         new: true,
//         upsert: true, // 🔥 create if not exists
//       }
//     );

//     res.status(200).json({
//       success: true,
//       message: "Revenue saved successfully",
//       entry,
//     });
//   } catch (err) {
//     console.error("❌ Revenue update error:", err);
//     res.status(500).json({
//       message: "Server error",
//       error: err.message,
//     });
//   }
// });

// /**
//  * -----------------------------------
//  * 📌 GET USER REVENUE (HISTORY)
//  * -----------------------------------
//  * Admin   → anyone
//  * Manager → assigned users
//  * User    → self (optional later)
//  */
// router.get("/:userId", protect, async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const targetUser = await User.findById(userId);
//     if (!targetUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     /* ================= ACCESS RULES ================= */
//     if (req.user.role === "manager") {
//       if (
//         targetUser.manager?.toString() !== req.user._id.toString()
//       ) {
//         return res
//           .status(403)
//           .json({ message: "Not your assigned user" });
//       }
//     }

//     if (req.user.role !== "admin" && req.user.role !== "manager") {
//       return res.status(403).json({ message: "Unauthorized" });
//     }

//     /* ================= FETCH REVENUE ================= */
//     const entries = await Revenue.find({ user: userId })
//       .sort({ date: 1 })
//       .select("date amount description");

//     res.json(entries);
//   } catch (err) {
//     console.error("❌ Revenue fetch error:", err);
//     res.status(500).json({
//       message: "Server error",
//       error: err.message,
//     });
//   }
// });

// export default router;

// import express from "express";
// import Revenue from "../models/Revenue.js";
// import User from "../models/User.js";
// import { protect } from "../middleware/auth.js";

// const router = express.Router();

// /**
//  * -----------------------------------
//  * 📌 ADD / UPDATE DAILY REVENUE
//  * -----------------------------------
//  * Admin   → anyone
//  * Manager → assigned interns / employees
//  * HR      → ❌ NO ACCESS
//  */
// router.post("/add", protect, async (req, res) => {
//   try {
//     const { userId, amount, description } = req.body;

//     if (!userId || amount === undefined) {
//       return res
//         .status(400)
//         .json({ message: "userId and amount are required" });
//     }

//     /* ================= ROLE BLOCK (HR) ================= */
//     if (req.user.role === "hr") {
//       return res
//         .status(403)
//         .json({ message: "HR is not allowed to access revenue" });
//     }

//     if (!["admin", "manager"].includes(req.user.role)) {
//       return res.status(403).json({ message: "Unauthorized" });
//     }

//     const targetUser = await User.findById(userId);
//     if (!targetUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     /* ================= MANAGER SCOPE ================= */
//     if (req.user.role === "manager") {
//       if (
//         targetUser.manager?.toString() !== req.user._id.toString()
//       ) {
//         return res
//           .status(403)
//           .json({ message: "Not your assigned user" });
//       }
//     }

//     /* ================= TODAY (NORMALIZED) ================= */
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     /* ================= UPSERT ================= */
//     const entry = await Revenue.findOneAndUpdate(
//       { user: userId, date: today },
//       {
//         $set: {
//           amount: Number(amount),
//           manager:
//             req.user.role === "manager" ? req.user._id : null,
//           description: description || "Daily revenue update",
//         },
//       },
//       { new: true, upsert: true }
//     );

//     res.status(200).json({
//       success: true,
//       message: "Revenue saved successfully",
//       entry,
//     });
//   } catch (err) {
//     console.error("❌ Revenue update error:", err);
//     res.status(500).json({
//       message: "Server error",
//       error: err.message,
//     });
//   }
// });

// /**
//  * -----------------------------------
//  * 📌 GET USER REVENUE (HISTORY)
//  * -----------------------------------
//  * Admin   → anyone
//  * Manager → assigned users
//  * HR      → ❌ NO ACCESS
//  */
// router.get("/:userId", protect, async (req, res) => {
//   try {
//     const { userId } = req.params;

//     /* ================= ROLE BLOCK (HR) ================= */
//     if (req.user.role === "hr") {
//       return res
//         .status(403)
//         .json({ message: "HR is not allowed to access revenue" });
//     }

//     if (!["admin", "manager"].includes(req.user.role)) {
//       return res.status(403).json({ message: "Unauthorized" });
//     }

//     const targetUser = await User.findById(userId);
//     if (!targetUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     /* ================= MANAGER SCOPE ================= */
//     if (req.user.role === "manager") {
//       if (
//         targetUser.manager?.toString() !== req.user._id.toString()
//       ) {
//         return res
//           .status(403)
//           .json({ message: "Not your assigned user" });
//       }
//     }

//     const entries = await Revenue.find({ user: userId })
//       .sort({ date: 1 })
//       .select("date amount description");

//     res.json(entries);
//   } catch (err) {
//     console.error("❌ Revenue fetch error:", err);
//     res.status(500).json({
//       message: "Server error",
//       error: err.message,
//     });
//   }
// });

// export default router;


import express from "express";
import Revenue from "../models/Revenue.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

/* =====================================================
   ADD / UPDATE DAILY REVENUE
   Admin   → anyone
   Manager → assigned interns / employees
   HR      → ❌ NO ACCESS
===================================================== */
router.post("/add", protect, async (req, res) => {
  try {
    const { userId, amount, description } = req.body;

    if (!userId || amount === undefined) {
      return res
        .status(400)
        .json({ message: "userId and amount are required" });
    }

    /* 🚫 HR BLOCK */
    if (req.user.role === "hr") {
      return res
        .status(403)
        .json({ message: "HR is not allowed to manage revenue" });
    }

    if (!["admin", "manager"].includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    /* 🔐 MANAGER SCOPE */
    if (
      req.user.role === "manager" &&
      targetUser.manager?.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not your assigned user" });
    }

    /* 📅 TODAY (NORMALIZED) */
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    /* 🔁 UPSERT (SAFE) */
    const updateData = {
      amount: Number(amount),
      description: description || "Daily revenue update",
    };

    // Manager only → attach manager field
    if (req.user.role === "manager") {
      updateData.manager = req.user._id;
    }

    const entry = await Revenue.findOneAndUpdate(
      { user: userId, date: today },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Revenue saved successfully",
      entry,
    });
  } catch (err) {
    console.error("❌ Revenue update error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

/* =====================================================
   GET USER REVENUE HISTORY
   Admin   → anyone
   Manager → assigned users
   HR      → ❌ NO ACCESS
===================================================== */
router.get("/:userId", protect, async (req, res) => {
  try {
    /* 🚫 HR BLOCK */
    if (req.user.role === "hr") {
      return res
        .status(403)
        .json({ message: "HR is not allowed to access revenue" });
    }

    if (!["admin", "manager"].includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const targetUser = await User.findById(req.params.userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    /* 🔐 MANAGER SCOPE */
    if (
      req.user.role === "manager" &&
      targetUser.manager?.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not your assigned user" });
    }

    const entries = await Revenue.find({ user: req.params.userId })
      .sort({ date: 1 })
      .select("date amount description");

    res.json(entries);
  } catch (err) {
    console.error("❌ Revenue fetch error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

export default router;
