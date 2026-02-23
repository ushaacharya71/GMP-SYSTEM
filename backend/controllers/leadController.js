import Lead from "../models/Lead.js";
import User from "../models/User.js";
import ExcelJS from "exceljs";

/* =====================================================
   ➕ ADD / INCREMENT LEADS
===================================================== */
export const addLead = async (req, res) => {
  try {
    const { leads = 0, forms = 0 } = req.body;
    const userId = req.user._id;

    if (req.user.role !== "marketing") {
      return res.status(403).json({ message: "Only marketing can add leads" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    const updated = await Lead.findOneAndUpdate(
      { user: userId, date: today },
      {
        $inc: {
          leads: Number(leads),
          forms: Number(forms),
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Add lead error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   📊 GET MY LEADS
===================================================== */
export const getMyLeads = async (req, res) => {
  try {
    const data = await Lead.find({ user: req.user._id }).sort({ date: -1 });
    res.json(data);
  } catch (err) {
    console.error("Get my leads error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   👥 GET TEAM LEADS (MANAGER / ADMIN)
===================================================== */
export const getTeamLeads = async (req, res) => {
  try {
    if (!["admin", "manager"].includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    let users;

    if (req.user.role === "manager") {
      users = await User.find({ manager: req.user._id }).select("_id");
    } else {
      users = await User.find({ role: "marketing" }).select("_id");
    }

    const ids = users.map((u) => u._id);

    const data = await Lead.find({ user: { $in: ids } })
      .populate("user", "name email")
      .sort({ date: -1 });

    res.json(data);
  } catch (err) {
    console.error("Team leads error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   ✏️ EDIT LEAD (ADMIN / MANAGER)
===================================================== */
export const editLead = async (req, res) => {
  try {
    if (!["admin", "manager"].includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { leads, forms } = req.body;

    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          leads: Number(leads),
          forms: Number(forms),
        },
      },
      { new: true }
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Edit lead error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   📈 MONTHLY SUMMARY
===================================================== */
export const getMonthlySummary = async (req, res) => {
  try {
    const { month, year } = req.query;

    const match = {
      month: Number(month),
      year: Number(year),
    };

    if (req.user.role === "marketing") {
      match.user = req.user._id;
    }

    const data = await Lead.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$user",
          totalLeads: { $sum: "$leads" },
          totalForms: { $sum: "$forms" },
        },
      },
    ]);

    res.json(data);
  } catch (err) {
    console.error("Monthly summary error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   📤 EXPORT TO EXCEL
===================================================== */
export const exportLeadsExcel = async (req, res) => {
  try {
    if (!["admin", "manager"].includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const records = await Lead.find()
      .populate("user", "name email")
      .sort({ date: 1 });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Marketing Leads");

    sheet.columns = [
      { header: "Date", key: "date", width: 15 },
      { header: "Name", key: "name", width: 25 },
      { header: "Email", key: "email", width: 25 },
      { header: "Leads", key: "leads", width: 15 },
      { header: "Forms", key: "forms", width: 15 },
    ];

    records.forEach((r) => {
      sheet.addRow({
        date: r.date.toISOString().split("T")[0],
        name: r.user?.name,
        email: r.user?.email,
        leads: r.leads,
        forms: r.forms,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=marketing_leads.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Export error:", err);
    res.status(500).json({ message: "Server error" });
  }
};