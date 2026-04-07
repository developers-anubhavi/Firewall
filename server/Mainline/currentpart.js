const express = require("express");
const router = express.Router();
const { poolPromise } = require("../Mainline/db");

router.get("/main_currentpart", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT TOP 1
        ENGINE_NO,
        ENGINE_CODE
      FROM [TNGA_MAINLINE_NUTRUNNER].[dbo].[MAINLINE_RESULT]
      ORDER BY DATE_TIME DESC
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }

    res.json(result.recordset[0]);

  } catch (error) {
    console.error("MAIN CURRENT ERROR:", error);
    res.status(500).json({ error: "Server error" });
  }
});


router.get("/main_full_data", async (req, res) => {
  try {
    const pool = await poolPromise;
    
    const mainResult = await pool.request().query(`
      SELECT TOP 1 
        ENGINE_NO,
        ROW_JUDGEMENT_1_MAIN,
        ROW_JUDGEMENT_2_MAIN,
        ROW_JUDGEMENT_3_MAIN,
        ROW_JUDGEMENT_4_MAIN,
        ROW_JUDGEMENT_5_MAIN,
        ROW_JUDGEMENT_6_MAIN,
        ROW_JUDGEMENT_7_MAIN,
        ROW_JUDGEMENT_8_MAIN,
        ROW_JUDGEMENT_9_MAIN,
        ROW_JUDGEMENT_10_MAIN,
        ROW_JUDGEMENT_11_MAIN,
        ROW_JUDGEMENT_12_MAIN,
        ROW_JUDGEMENT_13_MAIN,
        ROW_JUDGEMENT_14_MAIN,
        ROW_JUDGEMENT_15_MAIN,
        ROW_JUDGEMENT_16_MAIN
      FROM [TNGA_MAINLINE_NUTRUNNER].[dbo].[MAINLINE_RESULT]
      ORDER BY DATE_TIME DESC
    `);

    if (mainResult.recordset.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }

    const engineNo = mainResult.recordset[0].ENGINE_NO;
    const rowJudgements = mainResult.recordset[0];

   const getData = async (
  table,
  judgementField = "OVERALL_JUDGEMENT",
  timeColumn
) => {
  const result = await pool.request()
    .input("engineNo", engineNo)
    .query(`
      SELECT TOP 1 
        TIME_DEVIATION,
        ${judgementField}
      FROM ${table}
      WHERE ENGINE_NO = @engineNo
        AND ${judgementField} IS NOT NULL
      ORDER BY ${timeColumn} DESC
    `);

  return result.recordset[0] || {};
};

    const [
      t1, t2, t3, t4, t5, t6,t7,
      f1, f2, f3, f4,
      spark,
      rockerResult
    ] = await Promise.all([

      getData("[TNGA_MAINLINE_NUTRUNNER].[dbo].[TIAS323_REAROILSEAL]", "OVERALL_JUDGEMENT", "PART_IN_TIME"),
      getData("[TNGA_MAINLINE_NUTRUNNER].[dbo].[TIAS324_FLYWHEEL]", "OVERALL_JUDGEMENT", "PART_IN_TIME"),
      getData("[TNGA_MAINLINE_NUTRUNNER].[dbo].[TIAS325_HEADBOLT]", "OVERALL_JUDGEMENT", "PART_IN_TIME"),
      getData("[TNGA_MAINLINE_NUTRUNNER].[dbo].[TIAS327_CAMHOSING]", "OVERALL_JUDGEMENT", "PART_IN_TIME"),
      getData("[TNGA_MAINLINE_NUTRUNNER].[dbo].[TIAS329_TCC1]", "OVERALL_JUDGEMENT", "PART_IN_TIME"),
      getData("[TNGA_MAINLINE_NUTRUNNER].[dbo].[TIAS331_TCC2]", "OVERALL_JUDGEMENT", "PART_IN_TIME"),
      getData("[TNGA_MAINLINE_NUTRUNNER].[dbo].[TIAS341_HEADCOVER]", "OVERALL_JUDGEMENT", "PART_IN_TIME"),

      getData("[TNGA_MAINLINE_NUTRUNNER].[dbo].[TIAS322_OILPAN_FIPG]", "JUDGEMENT_1", "PART_ENTRY_TIME"),
      getData("[TNGA_MAINLINE_NUTRUNNER].[dbo].[TIAS326_CAMHSG_FIPG]", "JUDGEMENT_1", "PART_ENTRY_TIME"),
      getData("[TNGA_MAINLINE_NUTRUNNER].[dbo].[TIAS328_TCC1_FIPG]", "JUDGEMENT_1", "PART_ENTRY_TIME"),
      getData("[TNGA_MAINLINE_NUTRUNNER].[dbo].[TIAS330_TCC2_FIPG]", "JUDGEMENT_1", "PART_ENTRY_TIME"),

      getData("[TNGA_MAINLINE_NUTRUNNER].[dbo].[TITM315_SPARKPLUG_GAP_CHECK]", "JUDGEMENT_1", "PART_ENTRY_TIME"),

      pool.request()
        .input("engineNo", engineNo)
        .query(`
          SELECT TOP 1 
            TIME_DEVIATION,
            JUDGEMENT_1,
            JUDGEMENT_2,
            JUDGEMENT_3,
            JUDGEMENT_4
          FROM [TNGA_MAINLINE_NUTRUNNER].[dbo].[TITM314_ROCKER_ARM_VISION]
          WHERE ENGINE_NO = @engineNo
          ORDER BY PART_ENTRY_TIME DESC
        `)
    ]);

    const rocker = rockerResult.recordset[0] || {};
const STD_15L_CODES = ["101","103","601","11","12"];
const STD_2L_CODES = ["201","207","203","205","209","62","21","22","201","202","204","206","208","620","23"];

const stdQuery = await pool.request().query(`
  SELECT STATION_NAME, STD_TIME_1_5L, STD_TIME_2L
  FROM [TNGA_MAINLINE_NUTRUNNER].[dbo].[LINE_STATUS]
`);

let mainStdTimes = Array(7).fill(null);
let main1StdTimes = Array(6).fill(null);

if (stdQuery.recordset.length > 0) {
  const engineCode = String(mainResult.recordset[0].ENGINE_CODE).padStart(3, "0");
  const use15L = STD_15L_CODES.includes(engineCode);

  const stationOrder = [
    "TIAS323_REAROILSEAL",
    "TIAS324_FLYWHEEL  ",
    "TIAS325_HEADBOLT ",
    "TIAS327_CAMHOSING ",
    "TIAS329_TCC1",
    "TIAS331_TCC2",
    "TIAS322_OILPAN_FIPG",
    "TIAS326_CAMHSG_FIPG",
    "TIAS328_TCC1_FIPG",
    "TIAS330_TCC2_FIPG",
    "TITM314_ROCKER_ARM_VISION",
    "TITM315_SPARKPLUG_GAP_CHECK"
    
  ];

  const values = stationOrder.map(station => {
    const row = stdQuery.recordset.find(r => r.STATION_NAME === station);
    return row ? (use15L ? Number(row.STD_TIME_1_5L) : Number(row.STD_TIME_2L)) : null;
  });

  mainStdTimes = values.slice(0, 6);
  main1StdTimes = values.slice(6, 12);
}
    res.json({
      engineNo,
      rowJudgements,
      t1, t2, t3, t4, t5, t6, t7,
      f1, f2, f3, f4,
      spark,
      rocker,
      mainStdTimes, 
  main1StdTimes
    });

  } catch (err) {
    console.error("MAIN FULL ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/block_result_status", async (req, res) => {
  const { engineNo } = req.query;

  if (!engineNo) {
    return res.status(400).json({ message: "engineNo is required" });
  }

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("engineNo", engineNo)
      .query(`
        SELECT 
          ROW_JUDGEMENT_1_MAIN,
          ROW_JUDGEMENT_2_MAIN,
          ROW_JUDGEMENT_3_MAIN,
          ROW_JUDGEMENT_4_MAIN,
          ROW_JUDGEMENT_5_MAIN,
          ROW_JUDGEMENT_6_MAIN,
          ROW_JUDGEMENT_7_MAIN,
          ROW_JUDGEMENT_8_MAIN,
          ROW_JUDGEMENT_9_MAIN,
          ROW_JUDGEMENT_10_MAIN,
          ROW_JUDGEMENT_11_MAIN
        FROM [BLOCK_PISTON_SUB].[dbo].[BLOCK_RESULT]
        WHERE ENGINE_NO = @engineNo
        ORDER BY DATE_TIME DESC
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "No data found for this engine" });
    }

    const row = result.recordset[0];

    const values = Object.values(row);

    const isAllOk = values.every(
      (val) => val && val.toString().toUpperCase() === "OK"
    );

    res.json({
      engineNo,
      status: isAllOk ? "OK" : "NG"
    });

  } catch (err) {
    console.error("BLOCK RESULT ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/piston_result_status", async (req, res) => {
  const { engineNo } = req.query;

  if (!engineNo) {
    return res.status(400).json({ message: "engineNo is required" });
  }

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("engineNo", engineNo)
      .query(`
        SELECT 
          ROW_JUDGEMENT_1_MAIN,
          ROW_JUDGEMENT_2_MAIN,
          ROW_JUDGEMENT_3_MAIN,
          ROW_JUDGEMENT_4_MAIN,
          ROW_JUDGEMENT_5_MAIN,
          ROW_JUDGEMENT_6_MAIN,
          ROW_JUDGEMENT_7_MAIN,
          ROW_JUDGEMENT_8_MAIN,
          ROW_JUDGEMENT_9_MAIN,
          ROW_JUDGEMENT_10_MAIN,
          ROW_JUDGEMENT_11_MAIN
        FROM [BLOCK_PISTON_SUB].[dbo].[PISTON_RESULT]
        WHERE ENGINE_NO = @engineNo
        ORDER BY DATE_TIME DESC
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "No data found for this engine" });
    }

    const row = result.recordset[0];

    const values = Object.values(row);

    const isAllOk = values.every(
      (val) => val && val.toString().toUpperCase() === "OK"
    );

    res.json({
      engineNo,
      status: isAllOk ? "OK" : "NG"
    });

  } catch (err) {
    console.error("PISTON RESULT ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/camhsg_result_status", async (req, res) => {
  const { engineNo } = req.query;

  if (!engineNo) {
    return res.status(400).json({ message: "engineNo is required" });
  }

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("engineNo", engineNo)
      .query(`
        SELECT 
          ROW_JUDGEMENT_1_MAIN,
          ROW_JUDGEMENT_2_MAIN,
          ROW_JUDGEMENT_3_MAIN,
          ROW_JUDGEMENT_4_MAIN,
          ROW_JUDGEMENT_5_MAIN
        FROM [CAM_HOUSING].[dbo].[CHS_RESULT]
        WHERE LTRIM(RTRIM(SERIAL_NO)) = LTRIM(RTRIM(@engineNo))
        ORDER BY DATE_TIME DESC
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "No data found for this engine" });
    }

    const row = result.recordset[0];

    const isAllOk = Object.values(row).every(
      (val) => val && val.toString().toUpperCase() === "OK"
    );

    res.json({
      engineNo,
      status: isAllOk ? "OK" : "NG"
    });

  } catch (err) {
    console.error("CAMHSG RESULT ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});
module.exports = router;