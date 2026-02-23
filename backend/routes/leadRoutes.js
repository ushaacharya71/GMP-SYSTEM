import express from "express";
import { protect } from "../middleware/auth.js";
import {
  addLead,
  getMyLeads,
  getTeamLeads,
  editLead,
  getMonthlySummary,
  exportLeadsExcel,
} from "../controllers/leadController.js";

const router = express.Router();

/* =====================================================
   ➕ ADD / INCREMENT LEADS (MARKETING ONLY)
===================================================== */
router.post("/add", protect, addLead);

/* =====================================================
   📊 GET MY LEADS (MARKETING)
===================================================== */
router.get("/me", protect, getMyLeads);

/* =====================================================
   👥 GET TEAM LEADS (ADMIN / MANAGER)
===================================================== */
router.get("/team", protect, getTeamLeads);

/* =====================================================
   📈 MONTHLY SUMMARY
===================================================== */
router.get("/monthly", protect, getMonthlySummary);

/* =====================================================
   ✏️ EDIT LEAD (ADMIN / MANAGER)
===================================================== */
router.put("/:id", protect, editLead);

/* =====================================================
   📤 EXPORT TO EXCEL (ADMIN / MANAGER)
===================================================== */
router.get("/export", protect, exportLeadsExcel);

export default router;