const express = require("express");
const router = express.Router();
const { poolPromise } = require("../Mainline/db");

// ======================
// 🔹 TORQUE + JUDGE DETAILS
// ======================
router.get("/torque_nut_details", async (req, res) => {
  const { engineNo, table } = req.query;

  if (!engineNo || !table) {
    return res.status(400).json({ message: "engineNo and table are required" });
  }

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("engineNo", engineNo)
      .query(`
        SELECT TOP 1 *
        FROM [TNGA_MAINLINE_NUTRUNNER].[dbo].[${table}]
        WHERE ENGINE_NO = @engineNo
        ORDER BY PART_IN_TIME DESC
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }

    const row = result.recordset[0];

    // ✅ Build only rows that have values
    const data = [];

    for (let i = 1; i <= 28; i++) {
      const torque = row["TORQUE_NUT_" + i];
      const judge = row["JUDGE_NUT_" + i];

      // Only include rows where at least one value exists
      if (
  (torque !== null && torque !== undefined && torque !== 0 && torque !== "0") ||
  (judge !== null && judge !== undefined && judge !== "" && judge !== "0")
) {
        data.push({
          TORQUE_NUT: torque ?? "-",
          JUDGE_NUT: judge ?? "-"
        });
      }
    }

    res.json(data);

  } catch (err) {
    console.error("TORQUE DETAILS ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;