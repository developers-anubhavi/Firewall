const express = require("express");
const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");
const router = express.Router();
const { sql, poolPromise } = require('../db'); 


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

const STD_15L_CODES = ["004"];
const STD_2L_CODES = ["002", "001"];


router.get("/camengine-number", async (req, res) => {
  try {
    const pool = await poolPromise;

   
     const query = `
       SELECT TOP 1
         ENGINE_CODE,
         SERIAL_NO,

         ROW_JUDGEMENT_1_1,
         ROW_JUDGEMENT_2_1,
         ROW_JUDGEMENT_3_1, ROW_JUDGEMENT_3_2, ROW_JUDGEMENT_3_3, ROW_JUDGEMENT_3_4, ROW_JUDGEMENT_3_5,
        
         ROW_JUDGEMENT_1_MAIN, ROW_JUDGEMENT_2_MAIN, ROW_JUDGEMENT_3_MAIN,
         ROW_JUDGEMENT_4_MAIN, ROW_JUDGEMENT_5_MAIN
       FROM [CAM_HOUSING].[dbo].[CHS_RESULT]
       ORDER BY ID DESC
     `;

    const result = await pool.request().query(query);
    const row = result.recordset[0];
    if (!row) return res.json({ message: "No data found" });

    const toNum = v => Number(v);

    const processMinutes = {
      TIZZ350_ID_WRITING: null,
       TIAS314_GREASE_APPLICATION: null,
       CAM_COBOTPANEL_1: null,
      TITM310_VVT_COIL: null
     };

     const tableMap = {
       TIZZ350_ID_WRITING: "[CAM_HOUSING].[dbo].[TIZZ350_ID_WRITING]",
       TIAS314_GREASE_APPLICATION: "[CAM_HOUSING].[dbo].[TIAS314_GREASE_APPLICATION]",
       CAM_COBOTPANEL_1: "[CAM_HOUSING].[dbo].[CAM_COBOTPANEL_1]",
       TITM310_VVT_COIL: "[CAM_HOUSING].[dbo].[TITM310_VVT_COIL]"
     };

for (const key of Object.keys(processMinutes)) {

  if (!tableMap[key]) {
    // console.log("Missing table for key:", key);
    continue;
  }

  const request = pool.request();
  request.input("serialNo", sql.VarChar, row.SERIAL_NO);

  const ts = await request.query(`
    SELECT TOP 1 PART_ENTRY_TIME AS TS
    FROM ${tableMap[key]}
    WHERE SERIAL_NO = @serialNo
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
  FROM [CAM_HOUSING].[dbo].[LINE_STATUS]
`);

// console.log("STD Query Result:", stdQuery.recordset);

if (stdQuery.recordset.length > 0) {

  const use15L = STD_15L_CODES.includes(engineCode);

  const stationOrder = [
      "TIAS314_GREASE_APPLICATION",
      "CAM_COBOTPANEL_1"
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
      engineCode: row.ENGINE_CODE,
      serialno: row.SERIAL_NO,

      judgements: {
       row1: [toNum(row.ROW_JUDGEMENT_1_1)],
       row2: [toNum(row.ROW_JUDGEMENT_2_1)],
       row3: [toNum(row.ROW_JUDGEMENT_3_1), toNum(row.ROW_JUDGEMENT_3_2), toNum(row.ROW_JUDGEMENT_3_3), toNum(row.ROW_JUDGEMENT_3_4), toNum(row.ROW_JUDGEMENT_3_5)],
      },


    mainJudgements: {
   row1: row.ROW_JUDGEMENT_1_MAIN ?? null,
   row2: row.ROW_JUDGEMENT_2_MAIN ?? null,
   row3: row.ROW_JUDGEMENT_3_MAIN ?? null,
   row4: row.ROW_JUDGEMENT_4_MAIN ?? null,
   row5: row.ROW_JUDGEMENT_5_MAIN ?? null
 },

      processMinutes,
  stdDeviationTimes
  
    }
  );
    
  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ error: err.message });
  }
});


router.get("/camengine-details/:serialNo", async (req, res) => {
  try {
    const pool = await poolPromise;
    const { serialNo } = req.params;

    const queries = {
       greaseapplication: `
         SELECT TOP 1 JUDGEMENT_1, TIME_DEVIATION
         FROM [CAM_HOUSING].[dbo].[TIAS314_GREASE_APPLICATION]
         WHERE SERIAL_NO = @serialNo
         ORDER BY PART_ENTRY_TIME DESC
       `,
       pistoncollation: `
         SELECT TOP 1 JUDGEMENT_1, JUDGEMENT_2, JUDGEMENT_3, JUDGEMENT_4, JUDGEMENT_5, TIME_DEVIATION
         FROM [CAM_HOUSING].[dbo].[CAM_COBOTPANEL_1]
         WHERE SERIAL_NO = @serialNo
         ORDER BY PART_ENTRY_TIME DESC
       `,
      //  vvtcoil: `
      //    SELECT TOP 1 JUDGEMENT_1, TIME_DEVIATION
      //    FROM [CAM_HOUSING].[dbo].[TITM310_VVT_COIL]
      //    WHERE SERIAL_NO = @serialNo
      //    ORDER BY PART_ENTRY_TIME DESC
      //  `
     };

    const results = {};

    for (const [key, query] of Object.entries(queries)) {
      const request = pool.request();
      request.input("serialNo", serialNo);

      const result = await request.query(query);
      results[key] = result.recordset[0] || null;
    }

    res.json(results);

  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
