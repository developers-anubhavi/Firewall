const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../db");

const TABLES = [
  "COTTER_RETAINER_INSP",
  "COTTER_RETAINER_ASSEMBLY",
  "STEM_OIL_INSP",
  "STEM_OIL_ASSEMBLY",
  "ID_WRITING",
  "PLUG_TUBE_PRESS",
  "SPARK_PLUG_TIGHT",
  "PORT_LEAK_TESTER",
  "FUEL_LEAK_TESTER",
  "END_CAP_VISION"
];

function buildQuery() {
  let query = "";

  TABLES.forEach((table) => {
    query += `
      SELECT TOP 1 
        '${table}' AS table_name, 
        ENGINE_NO,
        ENGINE_CODE
      FROM [HEAD_TRACEABILITY].[dbo].[${table}]
      WHERE ENGINE_NO IS NOT NULL
      ORDER BY ID DESC;
    `;
  });

  return query;
}

router.get("/top-engines", async (req, res) => {
  try {
    const pool = await poolPromise;
    const query = buildQuery();

    const result = await pool.request().query(query);

    const response = result.recordsets.map((rs) => rs[0]);

    res.json({
      success: true,
      data: response
    });

  } catch (err) {
    console.error("❌ Error fetching top engines:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
