
const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../ET/db");


const TABLES = [
  "TIZZ358_IDWRITER",
  "TITM318_OILLEAK",
  "TITM323_INJECTOR",
  "TITM319_WATERLEAK",
  "TIZZ330_OILFILLING",
  "TITM321_MTB1",
  "TITM325_MTB2",
  "TIZZ365_ENGINELABEL",
  "TIZZ365_ENGINELABEL"
];

function buildQuery() {
  let query = "";

  TABLES.forEach((table) => {
    query += `
      SELECT TOP 1 
        '${table}' AS table_name, 
        ENGINE_NO,
        ENGINE_CODE
      FROM [ENGINE_TESTING].[dbo].[${table}]
      WHERE ENGINE_NO IS NOT NULL
      ORDER BY ID DESC;
    `;
  });

  return query;
}
router.get("/et_top-engines", async (req, res) => {
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
