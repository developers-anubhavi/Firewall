const express = require("express");
const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");
const router = express.Router();
const { sql, poolPromise } = require('../ET/db'); 


// const STD_FILE = path.resolve('D:/Debug/StdDeviationTime_a.txt');
// const STD_A_FILE = path.resolve('D:/Debug/StdDeviationTime.txt');


// let stdValues = Array(9).fill(null);
// let stdAValues = Array(9).fill(null);

const readStdFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    const values = data
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line !== "");
    while (values.length < 9) values.push(null);
    return values.slice(0, 9);
  } catch (err) {
    console.error(`❌ Error reading ${filePath}:`, err);
    return Array(9).fill(null);
  }
};


// stdValues = readStdFile(STD_FILE);
// stdAValues = readStdFile(STD_A_FILE);


// chokidar.watch(STD_FILE).on("change", () => {
//   console.log("📄 STD.txt changed — reloading...");
//   stdValues = readStdFile(STD_FILE);
// });

// chokidar.watch(STD_A_FILE).on("change", () => {
//   console.log("📄 STD_a.txt changed — reloading...");
//   stdAValues = readStdFile(STD_A_FILE);
// });

const STD_15L_CODES = [101, 103, 601, 11, 12];
const STD_2L_CODES = [207, 203, 205, 209, 62, 21, 22, 202, 204, 206, 208, 620, 23];


router.get("/etengine-number", async (req, res) => {
  try {
    const pool = await poolPromise;

   
    const query = `
      SELECT TOP 1
        ENGINE_NO,
        ENGINE_CODE,

        ROW_JUDGEMENT_2_1,
        ROW_JUDGEMENT_3_1, ROW_JUDGEMENT_3_2,
        ROW_JUDGEMENT_4_1,
        ROW_JUDGEMENT_4_6,
        ROW_JUDGEMENT_5_1, 
        ROW_JUDGEMENT_6_1,
        ROW_JUDGEMENT_7_1, 
        ROW_JUDGEMENT_8_1,

        ROW_JUDGEMENT_2_MAIN, ROW_JUDGEMENT_3_MAIN,
        ROW_JUDGEMENT_4_MAIN, ROW_JUDGEMENT_5_MAIN, ROW_JUDGEMENT_6_MAIN,
        ROW_JUDGEMENT_7_MAIN, ROW_JUDGEMENT_8_MAIN,ROW_JUDGEMENT_9_MAIN
      FROM [ENGINE_TESTING].[dbo].[ET_RESULT]
      ORDER BY DATE_TIME DESC, ID DESC
    `;

    const result = await pool.request().query(query);
    const row = result.recordset[0];
    if (!row) return res.json({ message: "No data found" });

    const toNum = v => Number(v);

    const processMinutes = {
      TIZZ358_IDWRITER:null,
      TITM318_OILLEAK: null,
      TITM323_INJECTOR: null,
      TITM319_WATERLEAK: null,
      TIZZ330_OILFILLING: null,
      TITM321_MTB1: null,
      TITM325_MTB2: null,
      TIZZ365_ENGINELABEL: null
    };

    const tableMap = {
      TIZZ358_IDWRITER: "[ENGINE_TESTING].[dbo].[TIZZ358_IDWRITER]",
      TITM318_OILLEAK: "[ENGINE_TESTING].[dbo].[TITM318_OILLEAK]",
      TITM323_INJECTOR: "[ENGINE_TESTING].[dbo].[TITM323_INJECTOR]",
      TITM319_WATERLEAK: "[ENGINE_TESTING].[dbo].[TITM319_WATERLEAK]",
      TIZZ330_OILFILLING: "[ENGINE_TESTING].[dbo].[TIZZ330_OILFILLING]",
      TITM321_MTB1: "[ENGINE_TESTING].[dbo].[TITM321_MTB1]",
      TITM325_MTB2: "[ENGINE_TESTING].[dbo].[TITM325_MTB2]",
      TIZZ365_ENGINELABEL: "[ENGINE_TESTING].[dbo].[TIZZ365_ENGINELABEL]"
    };
for (const key of Object.keys(processMinutes)) {

  if (!tableMap[key]) {
    // console.log("Missing table for key:", key);
    continue;
  }

  const request = pool.request();
  request.input("engineNo", sql.VarChar, row.ENGINE_NO);

  const ts = await request.query(`
    SELECT TOP 1 PART_ENTRY_TIME AS TS
    FROM ${tableMap[key]}
    WHERE ENGINE_NO = @engineNo
    ORDER BY PART_ENTRY_TIME DESC
  `);

  processMinutes[key] = ts.recordset[0]?.TS ?? null;
}

let stdDeviationTimes = [];

const engineCode = Number(row.ENGINE_CODE);

const stdQuery = await pool.request().query(`
  SELECT 
    STATION_NAME,
    STD_TIME_1_5L,
    STD_TIME_2L
  FROM [ENGINE_TESTING].[dbo].[LINE_STATUS]
`);

// console.log("STD Query Result:", stdQuery.recordset);

if (stdQuery.recordset.length > 0) {

  const use15L = STD_15L_CODES.includes(engineCode);

  const stationOrder = [
      "TITM318_OILLEAK",
      "TITM323_INJECTOR",
      "TITM319_WATERLEAK",
      "TIZZ330_OILFILLING",
      "TITM321_MTB1",
      "TITM325_MTB2",
      "TIZZ365_ENGINELABEL",
      "ET_RESULT"
  ];

  stdDeviationTimes = stationOrder.map(station => {
    const found = stdQuery.recordset.find(r => r.STATION_NAME === station);

    if (!found) return null;

    return use15L
      ? Number(found.STD_TIME_1_5L)
      : Number(found.STD_TIME_2L);
  });
}

    res.json({
      engineNumber: row.ENGINE_NO,
      engineCode: row.ENGINE_CODE,
      serialno: row.SERIAL_NO,

      judgements: {
        row1: [toNum(row.ROW_JUDGEMENT_2_1)],
        row2: [toNum(row.ROW_JUDGEMENT_3_1), toNum(row.ROW_JUDGEMENT_3_2)],
        row3: [toNum(row.ROW_JUDGEMENT_4_1)],
        row4: [toNum(row.ROW_JUDGEMENT_5_1)],
        row5: [toNum(row.ROW_JUDGEMENT_6_1)],
        row6: [toNum(row.ROW_JUDGEMENT_7_1)],
        row7: [toNum(row.ROW_JUDGEMENT_8_1)],
        row8: [toNum(row.ROW_JUDGEMENT_9_1)]
      },

     mainJudgements: {
  row1: row.ROW_JUDGEMENT_2_MAIN ?? null,
  row2: row.ROW_JUDGEMENT_3_MAIN ?? null,
  row3: row.ROW_JUDGEMENT_4_MAIN ?? null,
  row4: row.ROW_JUDGEMENT_5_MAIN ?? null,
  row5: row.ROW_JUDGEMENT_6_MAIN ?? null,
  row6: row.ROW_JUDGEMENT_7_MAIN ?? null,
  row7: row.ROW_JUDGEMENT_8_MAIN ?? null,
  row8: row.ROW_JUDGEMENT_9_MAIN ?? null
}
,

      processMinutes,
  stdDeviationTimes
  
    }
  );
    
  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ error: err.message });
  }
});


router.get("/etengine-details/:engineNo", async (req, res) => {
  try {
    const pool = await poolPromise;
    const { engineNo } = req.params;

    const queries = {
      engraving: `
        SELECT TOP 1 JUDGEMENT_1,TIME_DEVIATION
        FROM [ENGINE_TESTING].[dbo].[TITM318_OILLEAK]
        WHERE ENGINE_NO = @engineNo
        ORDER BY PART_ENTRY_TIME DESC
      `,
      labelPrinter: `
        SELECT TOP 1 JUDGEMENT_1,JUDGEMENT_2, TIME_DEVIATION
        FROM [ENGINE_TESTING].[dbo].[TITM323_INJECTOR]
        WHERE ENGINE_NO = @engineNo
        ORDER BY PART_ENTRY_TIME DESC
      `,
      idWriting: `
        SELECT TOP 1 JUDGEMENT_1, TIME_DEVIATION
        FROM [ENGINE_TESTING].[dbo].[TITM319_WATERLEAK]
        WHERE ENGINE_NO = @engineNo
        ORDER BY PART_ENTRY_TIME DESC
      `,
      chutter: `
        SELECT TOP 1 JUDGEMENT_1,  TIME_DEVIATION
        FROM [ENGINE_TESTING].[dbo].[TIZZ330_OILFILLING]
        WHERE ENGINE_NO = @engineNo
        ORDER BY PART_ENTRY_TIME DESC
      `,
      crankNr: `
        SELECT TOP 1 JUDGEMENT_1, TIME_DEVIATION
        FROM [ENGINE_TESTING].[dbo].[TITM321_MTB1]
        WHERE ENGINE_NO = @engineNo
        ORDER BY PART_ENTRY_TIME DESC
      `,
      collation: `
        SELECT TOP 1 JUDGEMENT_1, TIME_DEVIATION
        FROM [ENGINE_TESTING].[dbo].[TITM325_MTB2]
        WHERE ENGINE_NO = @engineNo
        ORDER BY PART_ENTRY_TIME DESC
      `,
      conrod: `
        SELECT TOP 1 JUDGEMENT_1, TIME_DEVIATION
        FROM [ENGINE_TESTING].[dbo].[TIZZ365_ENGINELABEL]
        WHERE ENGINE_NO = @engineNo
        ORDER BY PART_ENTRY_TIME DESC
      `
    };

    const results = {};

    for (const [key, query] of Object.entries(queries)) {
      const request = pool.request();
      request.input("engineNo", engineNo);

      const result = await request.query(query);
      results[key] = result.recordset[0] || null;
    }

    res.json(results);

  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ error: err.message });
  }
});


router.get("/et_block_result_status", async (req, res) => {
  const { engineNo } = req.query;

  if (!engineNo) {
    return res.status(400).json({ message: "engineNo is required" });
  }

  try {
    const pool = await poolPromise;

   const sql = require('mssql');

const result = await pool.request()
  .input("engineNo", sql.VarChar, engineNo)
  .query(`
    SELECT TOP 1
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
    WHERE UPPER(LTRIM(RTRIM(ENGINE_NO))) = UPPER(LTRIM(RTRIM(@engineNo)))
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

router.get("/et_piston_result_status", async (req, res) => {
  const { engineNo } = req.query;

  if (!engineNo) {
    return res.status(400).json({ message: "engineNo is required" });
  }

  try {
    const pool = await poolPromise;

     const sql = require('mssql');

const result = await pool.request()
  .input("engineNo", sql.VarChar, engineNo)
      .query(`
        SELECT 
          ROW_JUDGEMENT_2_MAIN,
          ROW_JUDGEMENT_3_MAIN,
          ROW_JUDGEMENT_4_MAIN,
          ROW_JUDGEMENT_5_MAIN,
          ROW_JUDGEMENT_6_MAIN
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

router.get("/et_camhsg_result_status", async (req, res) => {
  const { engineNo } = req.query;

  if (!engineNo) {
    return res.status(400).json({ message: "engineNo is required" });
  }

  try {
    const pool = await poolPromise;

    const sql = require('mssql');

const result = await pool.request()
  .input("engineNo", sql.VarChar, engineNo)
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


router.get("/et_mainline_result_status", async (req, res) => {
  const { engineNo } = req.query;

  if (!engineNo) {
    return res.status(400).json({ message: "engineNo is required" });
  }

  try {
    const pool = await poolPromise;

    const sql = require('mssql');

const result = await pool.request()
  .input("engineNo", sql.VarChar, engineNo)
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
          ROW_JUDGEMENT_11_MAIN,
          ROW_JUDGEMENT_12_MAIN,
          ROW_JUDGEMENT_13_MAIN,
          ROW_JUDGEMENT_14_MAIN,
          ROW_JUDGEMENT_15_MAIN,
          ROW_JUDGEMENT_16_MAIN
        FROM [TNGA_MAINLINE_NUTRUNNER].[dbo].[MAINLINE_RESULT]
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
    console.error("MAINLINE RESULT ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;


