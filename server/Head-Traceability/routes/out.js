 const express = require("express");
 const router = express.Router();
 const { poolPromise } = require("../routes/db");

 router.get("/shiftoutdup", async (req, res) => {
   try {
     const pool = await poolPromise;

     const result = await pool.request().query(`
      SELECT TOP 1
   HS_ACTUAL
 FROM COMMON_TABLE
     `);

     const row = result.recordset[0] || {};

     res.status(200).json({
       hs_hs_actual_data: row.HS_ACTUAL
     });
   } catch (error) {
   console.error("HS API ERROR:", error);
   res.status(500).json({
     message: error.message,
     stack: error.stack
   });
 }
 });

 module.exports = router;