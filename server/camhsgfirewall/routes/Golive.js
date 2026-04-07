
const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../db");


const TABLES = [
      "TIZZ350_ID_WRITING",
      "TIAS314_GREASE_APPLICATION",
      "TIZZ366_PISTON_COLLATION",
      "TITM310_VVT_COIL"
];

function buildQuery() {
  let query = "";

  TABLES.forEach((table) => {
    query += `
      SELECT TOP 1 
        '${table}' AS table_name, 
        SERIAL_NO,
        ENGINE_CODE
      FROM [CAM_HOUSING].[dbo].[${table}]
      WHERE SERIAL_NO IS NOT NULL
      ORDER BY ID DESC;
    `;
  });

  return query;
}
router.get("/cam_top-engines", async (req, res) => {
  try {
    const pool = await poolPromise;
    const query = buildQuery();

    const result = await pool.request().query(query);

    const response = result.recordsets.map((rs) => rs[0] || { table_name: null, SERIAL_NO: null, ENGINE_CODE: null });

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
