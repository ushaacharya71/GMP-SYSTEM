
// import express from "express";
// import Revenue from "../models/Revenue.js";
// import User from "../models/User.js";
// import { protect } from "../middleware/auth.js";

// const router = express.Router();

// /* =====================================================
//    ADD / UPDATE DAILY REVENUE
//    Admin   → anyone
//    Manager → assigned interns / employees
//    HR      → ❌ NO ACCESS
// ===================================================== */
// router.post("/add", protect, async (req, res) => {
//   try {
//     const { userId, amount, description } = req.body;

//     if (!userId || amount === undefined) {
//       return res
//         .status(400)
//         .json({ message: "userId and amount are required" });
//     }

//     /* 🚫 HR BLOCK */
//     if (req.user.role === "hr") {
//       return res
//         .status(403)
//         .json({ message: "HR is not allowed to manage revenue" });
//     }

//     if (!["admin", "manager"].includes(req.user.role)) {
//       return res.status(403).json({ message: "Unauthorized" });
//     }

//     const targetUser = await User.findById(userId);
//     if (!targetUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     /* 🔐 MANAGER SCOPE */
//     if (
//       req.user.role === "manager" &&
//       targetUser.manager?.toString() !== req.user._id.toString()
//     ) {
//       return res
//         .status(403)
//         .json({ message: "Not your assigned user" });
//     }

//     /* 📅 TODAY (NORMALIZED) */
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     /* 🔁 UPSERT (SAFE) */
//     const updateData = {
//       amount: Number(amount),
//       description: description || "Daily revenue update",
//     };

//     // Manager only → attach manager field
//     if (req.user.role === "manager") {
//       updateData.manager = req.user._id;
//     }

//     const entry = await Revenue.findOneAndUpdate(
//       { user: userId, date: today },
//       { $set: updateData },
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

// /* =====================================================
//    GET USER REVENUE HISTORY
//    Admin   → anyone
//    Manager → assigned users
//    HR      → ❌ NO ACCESS
// ===================================================== */
// router.get("/:userId", protect, async (req, res) => {
//   try {
//     /* 🚫 HR BLOCK */
//     if (req.user.role === "hr") {
//       return res
//         .status(403)
//         .json({ message: "HR is not allowed to access revenue" });
//     }

//     if (!["admin", "manager"].includes(req.user.role)) {
//       return res.status(403).json({ message: "Unauthorized" });
//     }

//     const targetUser = await User.findById(req.params.userId);
//     if (!targetUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     /* 🔐 MANAGER SCOPE */
//     if (
//       req.user.role === "manager" &&
//       targetUser.manager?.toString() !== req.user._id.toString()
//     ) {
//       return res
//         .status(403)
//         .json({ message: "Not your assigned user" });
//     }

//     const entries = await Revenue.find({ user: req.params.userId })
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

// /* =====================================================
//    ➕ ADD REVENUE (ALWAYS ADD, NEVER REPLACE)
//    Admin   → anyone
//    Manager → assigned interns / employees
//    HR      → ❌ NO ACCESS
// ===================================================== */
// router.post("/add", protect, async (req, res) => {
//   try {
//     const { userId, amount, description } = req.body;

//     if (!userId || amount === undefined) {
//       return res
//         .status(400)
//         .json({ message: "userId and amount are required" });
//     }

//     /* 🚫 HR BLOCK */
//     if (req.user.role === "hr") {
//       return res
//         .status(403)
//         .json({ message: "HR is not allowed to manage revenue" });
//     }

//     if (!["admin", "manager"].includes(req.user.role)) {
//       return res.status(403).json({ message: "Unauthorized" });
//     }

//     const targetUser = await User.findById(userId);
//     if (!targetUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     /* 🔐 MANAGER SCOPE */
//     if (
//       req.user.role === "manager" &&
//       targetUser.manager?.toString() !== req.user._id.toString()
//     ) {
//       return res
//         .status(403)
//         .json({ message: "Not your assigned user" });
//     }

//     const revenueAmount = Number(amount);
//     if (isNaN(revenueAmount) || revenueAmount <= 0) {
//       return res.status(400).json({ message: "Invalid amount" });
//     }

//     /* ✅ CREATE NEW REVENUE LOG (NO UPSERT, NO OVERWRITE) */
//     const entry = await Revenue.create({
//       user: userId,
//       manager: req.user.role === "manager" ? req.user._id : null,
//       amount: revenueAmount,
//       description: description || "Revenue entry",
//     });

//     /* ✅ UPDATE USER CACHED TOTAL (ADD, NOT REPLACE) */
//     await User.findByIdAndUpdate(userId, {
//       $inc: { revenue: revenueAmount },
//     });

//     res.status(201).json({
//       success: true,
//       message: "Revenue added successfully",
//       entry,
//     });
//   } catch (err) {
//     console.error("❌ Revenue add error:", err);
//     res.status(500).json({
//       message: "Server error",
//       error: err.message,
//     });
//   }
// });

// /* =====================================================
//    📊 GET USER REVENUE HISTORY
//    Admin   → anyone
//    Manager → assigned users
//    HR      → ❌ NO ACCESS
// ===================================================== */
// router.get("/:userId", protect, async (req, res) => {
//   try {
//     /* 🚫 HR BLOCK */
//     if (req.user.role === "hr") {
//       return res
//         .status(403)
//         .json({ message: "HR is not allowed to access revenue" });
//     }

//     if (!["admin", "manager"].includes(req.user.role)) {
//       return res.status(403).json({ message: "Unauthorized" });
//     }

//     const targetUser = await User.findById(req.params.userId);
//     if (!targetUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     /* 🔐 MANAGER SCOPE */
//     if (
//       req.user.role === "manager" &&
//       targetUser.manager?.toString() !== req.user._id.toString()
//     ) {
//       return res
//         .status(403)
//         .json({ message: "Not your assigned user" });
//     }

//     const entries = await Revenue.find({ user: req.params.userId })
//       .sort({ createdAt: 1 })
//       .select("date amount description createdAt");

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
   ➕ ADD REVENUE (LOG-BASED, ALWAYS ADD)
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

    /* 🔐 ROLE CHECK */
    if (!["admin", "manager"].includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    /* 🔐 MANAGER → ONLY OWN USERS */
    if (
      req.user.role === "manager" &&
      targetUser.manager?.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not your assigned user" });
    }

    const revenueAmount = Number(amount);
    if (isNaN(revenueAmount) || revenueAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    /* ✅ CREATE NEW REVENUE ENTRY (NO UPDATE / NO UPSERT) */
    const entry = await Revenue.create({
      user: userId,
      manager: req.user.role === "manager" ? req.user._id : null,
      amount: revenueAmount,
      description: description?.trim() || "Revenue entry",
    });

    /* ✅ UPDATE USER CACHED TOTAL (ADD ONLY) */
    await User.findByIdAndUpdate(userId, {
      $inc: { revenue: revenueAmount },
    });

    return res.status(201).json({
      success: true,
      message: "Revenue added successfully",
      entry,
    });
  } catch (err) {
    console.error("❌ Revenue add error:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

/* =====================================================
   📊 GET USER REVENUE HISTORY
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

    /* 🔐 MANAGER → ONLY OWN USERS */
    if (
      req.user.role === "manager" &&
      targetUser.manager?.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not your assigned user" });
    }

    const entries = await Revenue.find({ user: req.params.userId })
      .sort({ createdAt: 1 })
      .select("date amount description createdAt");

    return res.json(entries);
  } catch (err) {
    console.error("❌ Revenue fetch error:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

export default router;
