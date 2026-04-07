const express = require("express");
const router = express.Router();
const { poolPromise } = require("../Mainline/db");

router.get("/mk1-pitch", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT 
        MK1_PITCH1, MK1_PITCH2, MK1_PITCH3, MK1_PITCH4,
        MK1_PITCH5, MK1_PITCH6, MK1_PITCH7, MK1_PITCH8,
        MK1_PITCH9, MK1_PITCH10, MK1_PITCH11, MK1_PITCH12,
        MK1_PITCH13, MK1_PITCH14, MK1_PITCH15, MK1_PITCH16,
        MK1_PITCH17, MK1_PITCH18, MK1_PITCH19, MK1_PITCH20,
        MK1_PITCH21, MK1_PITCH22, MK1_PITCH23, MK1_PITCH24,
        MK1_PITCH25, MK1_PITCH26, MK1_PITCH27, MK1_PITCH28,
        MK1_PITCH29, MK1_PITCH30, MK1_PITCH31, MK1_PITCH32
      FROM [TNGA_MAINLINE_NUTRUNNER].[dbo].[ENGINE_DISPLAY]
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }

    res.json(result.recordset[0]); // ✅ MSSQL uses recordset

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/mk2-pitch", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT TOP 1
        MK2_PITCH41,
        MK2_PITCH42,
        MK2_PITCH43,
        MK2_PITCH44,
        MK2_PITCH45,
        MK2_PITCH46,
        MK2_PITCH47,
        MK2_PITCH48
      FROM [TNGA_MAINLINE_NUTRUNNER].[dbo].[ENGINE_DISPLAY]
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }

    res.json(result.recordset[0]);

  } catch (error) {
    console.error("MK2 ERROR:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/mk3-pitch", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT TOP 1
        MK3_PITCH51,
        MK3_PITCH52,
        MK3_PITCH53,
        MK3_PITCH54,
        MK3_PITCH55,
        MK3_PITCH56,
        MK3_PITCH57,
        MK3_PITCH58,
        MK3_PITCH59,
        MK3_PITCH60,
        MK3_PITCH61,
        MK3_PITCH62
      FROM [TNGA_MAINLINE_NUTRUNNER].[dbo].[ENGINE_DISPLAY]
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }

    res.json(result.recordset[0]);

  } catch (error) {
    console.error("MK3 ERROR:", error);
    res.status(500).json({ error: "Server error" });
  }
});



router.get("/main_blocksub", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT TOP 1
        [ENGINE_NO]
      FROM [TNGA_MAINLINE_NUTRUNNER].[dbo].[TIZZ354_MAINLINE_IDWRITE]
      order by PART_ENTRY_TIME desc
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }

    res.json(result.recordset[0]);

  } catch (error) {
    console.error("MK3 ERROR:", error);
    res.status(500).json({ error: "Server error" });
  }
});



router.get("/main_headsub", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT TOP 1
        [ENGINE_NO]
      FROM [TNGA_MAINLINE_NUTRUNNER].[dbo].[TIZZ355_HEADSUB_COLLATION]
      order by SUB_START_TIME desc
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }

    res.json(result.recordset[0]);

  } catch (error) {
    console.error("MK3 ERROR:", error);
    res.status(500).json({ error: "Server error" });
  }
});



router.get("/main_camhsg", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT TOP 1
        [ENGINE_NO]
      FROM [TNGA_MAINLINE_NUTRUNNER].[dbo].[TIZZ356_CAMHSG_COLLATION]
      order by SUB_START_TIME desc 
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }

    res.json(result.recordset[0]);

  } catch (error) {
    console.error("MK3 ERROR:", error);
    res.status(500).json({ error: "Server error" });
  }
});



module.exports = router;