// import express from "express";
// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";
// import User from "../models/User.js";
// import Revenue from "../models/Revenue.js";
// import { protect } from "../middleware/auth.js";
// import { authorizeRoles } from "../middleware/role.js";

// const router = express.Router();

// /* =====================================================
//    ADMIN → GET ALL USERS
// ===================================================== */
// router.get("/", protect, authorizeRoles("admin"), async (req, res) => {
//   try {
//     const users = await User.find()
//       .select("-password")
//       .populate("manager", "name email role");

//     res.json(users);
//   } catch (err) {
//     console.error("Fetch users error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// /* =====================================================
//    CREATE USER
// ===================================================== */
// router.post(
//   "/",
//   protect,
//   authorizeRoles("admin", "manager"),
//   async (req, res) => {
//     try {
//       const loggedInUser = req.user;
//       const {
//         name,
//         email,
//         phone,
//         role,
//         manager,
//         position,
//         teamName,
//         joiningDate,
//         password,
//         birthday,
//       } = req.body;

//       if (!name || !email || !role) {
//         return res.status(400).json({ message: "Required fields missing" });
//       }

//       const exists = await User.findOne({ email: email.toLowerCase() });
//       if (exists) {
//         return res.status(400).json({ message: "User already exists" });
//       }

//       /* ========== ADMIN FLOW ========== */
//       if (loggedInUser.role === "admin") {
//         if (["intern", "employee"].includes(role) && !manager) {
//           return res
//             .status(400)
//             .json({ message: "Intern/Employee must have a manager" });
//         }

//         const newUser = await User.create({
//           name,
//           email: email.toLowerCase(),
//           phone,
//           role,
//           manager: ["intern", "employee"].includes(role) ? manager : null,
//           position: role === "employee" ? position : "",
//           teamName,
//           joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
//           birthday: birthday ? new Date(birthday) : null,
//           password: password || "Glow@123",
//         });

//         if (["intern", "employee"].includes(role)) {
//           await User.findByIdAndUpdate(manager, {
//             $addToSet: { managedInterns: newUser._id },
//           });
//         }

//         const safe = newUser.toObject();
//         delete safe.password;

//         return res.status(201).json({ success: true, user: safe });
//       }

//       /* ========== MANAGER FLOW ========== */
//       if (loggedInUser.role === "manager") {
//         if (!["intern", "employee"].includes(role)) {
//           return res.status(403).json({
//             message: "Managers can only add interns or employees",
//           });
//         }

//         const newUser = await User.create({
//           name,
//           email: email.toLowerCase(),
//           phone,
//           role,
//           manager: loggedInUser._id,
//           position: role === "employee" ? position : "",
//           teamName,
//           joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
//           birthday: birthday ? new Date(birthday) : null,
//           password: password || "Glow@123",
//         });

//         await User.findByIdAndUpdate(loggedInUser._id, {
//           $addToSet: { managedInterns: newUser._id },
//         });

//         const safe = newUser.toObject();
//         delete safe.password;

//         return res.status(201).json({ success: true, user: safe });
//       }

//       return res.status(403).json({ message: "Unauthorized" });
//     } catch (err) {
//       console.error("Create user error:", err);
//       res.status(500).json({ message: "Server error" });
//     }
//   }
// );

// /* =====================================================
//    MANAGER → GET OWN TEAM
// ===================================================== */
// router.get(
//   "/manager/interns",
//   protect,
//   authorizeRoles("manager"),
//   async (req, res) => {
//     try {
//       const users = await User.find({ manager: req.user._id })
//         .select("name email role teamName joiningDate");

//       res.json(users);
//     } catch (err) {
//       console.error("Manager interns error:", err);
//       res.status(500).json({ message: "Server error" });
//     }
//   }
// );

// /* =====================================================
//    GET USER PROFILE
// ===================================================== */
// router.get("/:id", protect, async (req, res) => {
//   try {
//     const targetUser = await User.findById(req.params.id).select("-password");

//     if (!targetUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     if (req.user.role === "admin") return res.json(targetUser);

//     if (req.user._id.toString() === targetUser._id.toString()) {
//       return res.json(targetUser);
//     }

//     if (
//       req.user.role === "manager" &&
//       targetUser.manager?.toString() === req.user._id.toString()
//     ) {
//       return res.json(targetUser);
//     }

//     return res.status(403).json({ message: "Unauthorized" });
//   } catch (error) {
//     console.error("User fetch error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// /* =====================================================
//    UPDATE USER (FIXED)
// ===================================================== */
// router.put("/:id", protect, async (req, res) => {
//   try {
//     // 🔐 Permission check
//     if (
//       req.user.role !== "admin" &&
//       req.user._id.toString() !== req.params.id
//     ) {
//       return res.status(403).json({ message: "Unauthorized" });
//     }

//     /* ================= SANITIZATION ================= */

//     // ❌ Never allow password update here
//     delete req.body.password;
//     delete req.body.resetPasswordToken;
//     delete req.body.resetPasswordExpires;

//     // 🧹 FIX: empty manager breaks MongoDB
//     if (
//       req.body.manager === "" ||
//       req.body.manager === undefined
//     ) {
//       delete req.body.manager;
//     }

//     // 🧠 If role does NOT require manager → force null
//     if (!["intern", "employee"].includes(req.body.role)) {
//       req.body.manager = null;
//     }

//     /* ================= UPDATE ================= */
//     const updatedUser = await User.findByIdAndUpdate(
//       req.params.id,
//       { $set: req.body },
//       {
//         new: true,
//         runValidators: true,
//       }
//     ).select("-password");

//     if (!updatedUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.json({ success: true, user: updatedUser });
//   } catch (err) {
//     console.error("Update user error:", err);
//     res.status(500).json({
//       message: "Failed to update user",
//       error: err.message,
//     });
//   }
// });


// /* =====================================================
//    DELETE USER (ADMIN ONLY)
// ===================================================== */
// router.delete(
//   "/:id",
//   protect,
//   authorizeRoles("admin"),
//   async (req, res) => {
//     try {
//       const user = await User.findByIdAndDelete(req.params.id);
//       if (!user) return res.status(404).json({ message: "User not found" });

//       if (user.manager) {
//         await User.findByIdAndUpdate(user.manager, {
//           $pull: { managedInterns: user._id },
//         });
//       }

//       res.json({ success: true });
//     } catch (err) {
//       console.error("Delete error:", err);
//       res.status(500).json({ message: "Server error" });
//     }
//   }
// );

// /* =====================================================
//    USER PERFORMANCE
// ===================================================== */
// router.get("/:id/performance", protect, async (req, res) => {
//   try {
//     const targetUser = await User.findById(req.params.id);
//     if (!targetUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const isAllowed =
//       req.user.role === "admin" ||
//       req.user._id.toString() === targetUser._id.toString() ||
//       (req.user.role === "manager" &&
//         targetUser.manager?.toString() === req.user._id.toString());

//     if (!isAllowed) {
//       return res.status(403).json({ message: "Unauthorized" });
//     }

//     const data = await Revenue.aggregate([
//       { $match: { user: new mongoose.Types.ObjectId(req.params.id) } },
//       {
//         $group: {
//           _id: {
//             $dateToString: { format: "%Y-%m-%d", date: "$date" },
//           },
//           amount: { $sum: "$amount" },
//         },
//       },
//       { $sort: { _id: 1 } },
//     ]);

//     res.json(
//       data.map((d) => ({
//         date: d._id,
//         amount: d.amount,
//       }))
//     );
//   } catch (err) {
//     console.error("Performance error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });
// /* =====================================================
//    ADMIN → RESET USER PASSWORD (FINAL FIX)
// ===================================================== */
// router.post(
//   "/:id/reset-password",
//   protect,
//   authorizeRoles("admin"),
//   async (req, res) => {
//     try {
//       const { password } = req.body;

//       if (!password || password.length < 6) {
//         return res
//           .status(400)
//           .json({ message: "Password must be at least 6 characters" });
//       }

//       const user = await User.findById(req.params.id);
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }

//       // ✅ IMPORTANT: set plain password
//       user.password = password;

//       // ✅ pre("save") will hash ONCE
//       await user.save();

//       res.json({
//         success: true,
//         message: "Password updated successfully",
//       });
//     } catch (err) {
//       console.error("Admin reset password error:", err);
//       res.status(500).json({ message: "Server error" });
//     }
//   }
// );


// export default router;

import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Revenue from "../models/Revenue.js";
import { protect } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";

const router = express.Router();

/* =====================================================
   ADMIN → GET ALL USERS
===================================================== */
router.get("/", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("manager", "name email role");

    res.json(users);
  } catch (err) {
    console.error("Fetch users error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   CREATE USER
===================================================== */
router.post(
  "/",
  protect,
  authorizeRoles("admin", "manager"),
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const {
        name,
        email,
        phone,
        role,
        manager,
        position,
        teamName,
        joiningDate,
        password,
        birthday,
      } = req.body;

      if (!name || !email || !role) {
        return res.status(400).json({ message: "Required fields missing" });
      }

      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists) {
        return res.status(400).json({ message: "User already exists" });
      }

      /* ========== ADMIN FLOW ========== */
      if (loggedInUser.role === "admin") {
        if (["intern", "employee", "marketing"].includes(role) && !manager) {
          return res
            .status(400)
            .json({ message: "Intern/Employee/Marketing must have a manager" });
        }

        const newUser = await User.create({
          name,
          email: email.toLowerCase(),
          phone,
          role,
          manager: ["intern", "employee", "marketing"].includes(role)
            ? manager
            : null,
          position: role === "employee" ? position : "",
          teamName,
          joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
          birthday: birthday ? new Date(birthday) : null,
          password: password || "Glow@123",
        });

        if (["intern", "employee", "marketing"].includes(role)) {
          await User.findByIdAndUpdate(manager, {
            $addToSet: { managedInterns: newUser._id },
          });
        }

        const safe = newUser.toObject();
        delete safe.password;

        return res.status(201).json({ success: true, user: safe });
      }

      /* ========== MANAGER FLOW ========== */
      if (loggedInUser.role === "manager") {
        if (!["intern", "employee", "marketing"].includes(role)) {
          return res.status(403).json({
            message: "Managers can only add interns, employees, or marketing",
          });
        }

        const newUser = await User.create({
          name,
          email: email.toLowerCase(),
          phone,
          role,
          manager: loggedInUser._id,
          position: role === "employee" ? position : "",
          teamName,
          joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
          birthday: birthday ? new Date(birthday) : null,
          password: password || "Glow@123",
        });

        await User.findByIdAndUpdate(loggedInUser._id, {
          $addToSet: { managedInterns: newUser._id },
        });

        const safe = newUser.toObject();
        delete safe.password;

        return res.status(201).json({ success: true, user: safe });
      }

      return res.status(403).json({ message: "Unauthorized" });
    } catch (err) {
      console.error("Create user error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* =====================================================
   MANAGER → GET OWN TEAM
===================================================== */
router.get(
  "/manager/interns",
  protect,
  authorizeRoles("manager"),
  async (req, res) => {
    try {
      const users = await User.find({ manager: req.user._id })
        .select("name email role teamName joiningDate");

      res.json(users);
    } catch (err) {
      console.error("Manager interns error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* =====================================================
   GET USER PROFILE
===================================================== */
router.get("/:id", protect, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id).select("-password");

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.user.role === "admin") return res.json(targetUser);

    if (req.user._id.toString() === targetUser._id.toString()) {
      return res.json(targetUser);
    }

    if (
      req.user.role === "manager" &&
      targetUser.manager?.toString() === req.user._id.toString()
    ) {
      return res.json(targetUser);
    }

    return res.status(403).json({ message: "Unauthorized" });
  } catch (error) {
    console.error("User fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   UPDATE USER
===================================================== */
router.put("/:id", protect, async (req, res) => {
  try {
    if (
      req.user.role !== "admin" &&
      req.user._id.toString() !== req.params.id
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    delete req.body.password;
    delete req.body.resetPasswordToken;
    delete req.body.resetPasswordExpires;

    if (req.body.manager === "" || req.body.manager === undefined) {
      delete req.body.manager;
    }

    if (!["intern", "employee", "marketing"].includes(req.body.role)) {
      req.body.manager = null;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({
      message: "Failed to update user",
      error: err.message,
    });
  }
});

/* =====================================================
   DELETE USER (ADMIN ONLY)
===================================================== */
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (user.manager) {
        await User.findByIdAndUpdate(user.manager, {
          $pull: { managedInterns: user._id },
        });
      }

      res.json({ success: true });
    } catch (err) {
      console.error("Delete error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* =====================================================
   USER PERFORMANCE
===================================================== */
router.get("/:id/performance", protect, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isAllowed =
      req.user.role === "admin" ||
      req.user._id.toString() === targetUser._id.toString() ||
      (req.user.role === "manager" &&
        targetUser.manager?.toString() === req.user._id.toString());

    if (!isAllowed) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const data = await Revenue.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.params.id) } },
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
  } catch (err) {
    console.error("Performance error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   ADMIN → RESET USER PASSWORD
===================================================== */
router.post(
  "/:id/reset-password",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { password } = req.body;

      if (!password || password.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters" });
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.password = password;
      await user.save();

      res.json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (err) {
      console.error("Admin reset password error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;