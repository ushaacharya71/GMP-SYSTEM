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
