import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    /* ================= OWNER ================= */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* ================= DATE INFO ================= */
    date: {
      type: Date,
      required: true,
    },

    month: {
      type: Number,
      required: true,
    },

    year: {
      type: Number,
      required: true,
    },

    /* ================= PERFORMANCE DATA ================= */
    leads: {
      type: Number,
      default: 0,
    },

    forms: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

/* =====================================================
    UNIQUE PER USER PER DAY
   (We will increment instead of duplicate)
===================================================== */
leadSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model("Lead", leadSchema);