
const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../Block-firewall/db");


const TABLES = [
  "TIAS307_CRANK_NR",
  "TIZZ352_CHUTTER",
  "TIZZ325_ID_WRITING",
  "TIZZ322_ENGINE_LABEL",
  "TIZZ320_ENGRAVING",
  "TIZZ353_BLOCK_PISTON_COLLATION",
  "TIAS308_CONROD_NR",
  "TIAS309_COLLATION"
];

function buildQuery() {
  let query = "";

  TABLES.forEach((table) => {
    query += `
      SELECT TOP 1 
        '${table}' AS table_name, 
        ENGINE_NO,
        ENGINE_CODE
      FROM [BLOCK_PISTON_SUB].[dbo].[${table}]
      WHERE ENGINE_NO IS NOT NULL
      ORDER BY ID DESC;
    `;
  });

  return query;
}
router.get("/block_top-engines", async (req, res) => {
  try {
    const pool = await poolPromise;
    const query = buildQuery();

    const result = await pool.request().query(query);

    const response = result.recordsets.map((rs) => rs[0] || { table_name: null, ENGINE_NO: null, ENGINE_CODE: null });

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
