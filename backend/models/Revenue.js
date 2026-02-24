
import mongoose from "mongoose";

/**
 * Normalize date to start of day (00:00:00)
 * This guarantees:
 * - Daily queries work
 * - No timezone confusion
 */
const normalizeDate = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const revenueSchema = new mongoose.Schema(
  {
    // 👤 Person who generated revenue (Intern / Employee / Manager)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 👔 Manager who added this revenue (null if admin/self)
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    // 💰 Revenue amount generated (ALWAYS ADDITIVE)
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // 📅 Revenue date (normalized, but NOT unique)
    date: {
      type: Date,
      required: true,
      index: true,
      default: () => normalizeDate(),
      set: normalizeDate,
    },

    // 📝 Optional note
    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * ❌ IMPORTANT CHANGE
 * Removed UNIQUE constraint on (user + date)
 * → Allows MULTIPLE revenue entries per day
 * → Prevents overwrite bug
 */

// ❌ REMOVED
// revenueSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model("Revenue", revenueSchema);
