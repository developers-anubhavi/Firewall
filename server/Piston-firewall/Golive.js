const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../Piston-firewall/db");

const TABLES = [
  "TIAS311_VISION_SYSTEM",
  "TIAS311_PISTON_RANK",
  "TIAS311_PISTON_PIN_ASSY",
  "TIAS312_SNAPRING_VISION",
  "TIAS313_RING_ASSY",
  "TIAS313_RING_ASSY"
];

function buildQuery() {
  let query = "";

  TABLES.forEach((table) => {
    query += `
      SELECT TOP 1 
        '${table}' AS table_name, 
        PALLET_NO,
        ENGINE_CODE
      FROM [BLOCK_PISTON_SUB].[dbo].[${table}]
      WHERE PALLET_NO IS NOT NULL
      ORDER BY ID DESC;
    `;
  });

  return query;
}

router.get("/piston_top-engines", async (req, res) => {
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
