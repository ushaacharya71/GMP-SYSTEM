import mongoose from "mongoose";
const leaveSchema = new mongoose.Schema(
  {
    //  User who applied
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    //  Leave type
    type: {
      type: String,
      enum: ["sick", "casual"],
      required: true,
    },

    //  Leave duration
    fromDate: {
      type: Date,
      required: true,
    },

    toDate: {
      type: Date,
      required: true,
    },

    //  Reason
    reason: {
      type: String,
      required: true,
      trim: true,
    },

    //  Status flow
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    // Approver user
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: undefined,
    },

    // Approver role (NULL SAFE)
    approvedByRole: {
      type: String,
      enum: ["manager", "admin"],
      default: undefined, // 🔥 FIXES ENUM ERROR
    },

    // Total leave days (AUTO CALCULATED)
    totalDays: {
      type: Number,
      min: 1,
    },

    //  Leave year (CRITICAL for syncing)
    leaveYear: {
      type: Number,
      default: () => new Date().getFullYear(),
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * AUTO-CALCULATE totalDays (PREVENTS SYNC ISSUES)
 */
leaveSchema.pre("save", function (next) {
  const from = new Date(this.fromDate);
  const to = new Date(this.toDate);

  from.setHours(0, 0, 0, 0);
  to.setHours(0, 0, 0, 0);

  const diff =
    Math.floor((to - from) / (1000 * 60 * 60 * 24)) + 1;

  this.totalDays = diff;
  next();
});

// ⚡ Dashboard performance indexes
leaveSchema.index({ user: 1, status: 1, leaveYear: 1 });

export default mongoose.model("Leave", leaveSchema);
