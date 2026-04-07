const express = require("express");
const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");
const router = express.Router();
const { sql, poolPromise } = require('../Block-firewall/db'); 


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
const STD_2L_CODES = [201, 207, 203, 205, 209, 62, 21, 22, 202, 204, 206, 208, 620, 23];


router.get("/blockengine-number", async (req, res) => {
  try {
    const pool = await poolPromise;

   
    const query = `
      SELECT TOP 1
        ENGINE_NO,
        ENGINE_CODE,

        ROW_JUDGEMENT_1_1, 
        ROW_JUDGEMENT_2_1, 
        ROW_JUDGEMENT_3_1, ROW_JUDGEMENT_3_2, ROW_JUDGEMENT_3_3, 
        ROW_JUDGEMENT_4_1, ROW_JUDGEMENT_4_2, ROW_JUDGEMENT_4_3, ROW_JUDGEMENT_4_4, ROW_JUDGEMENT_4_5,
        ROW_JUDGEMENT_5_1, ROW_JUDGEMENT_5_2, ROW_JUDGEMENT_5_3, ROW_JUDGEMENT_5_4, ROW_JUDGEMENT_5_5, 
        ROW_JUDGEMENT_6_1,
        ROW_JUDGEMENT_7_1, ROW_JUDGEMENT_7_2, ROW_JUDGEMENT_7_3, ROW_JUDGEMENT_7_4, ROW_JUDGEMENT_7_5, 
        ROW_JUDGEMENT_8_1,
        ROW_JUDGEMENT_9_1, ROW_JUDGEMENT_9_2, ROW_JUDGEMENT_9_3, ROW_JUDGEMENT_9_4, ROW_JUDGEMENT_9_5,
        ROW_JUDGEMENT_10_1,
        ROW_JUDGEMENT_11_1,

        ROW_JUDGEMENT_1_MAIN, ROW_JUDGEMENT_2_MAIN, ROW_JUDGEMENT_3_MAIN,
        ROW_JUDGEMENT_4_MAIN, ROW_JUDGEMENT_5_MAIN, ROW_JUDGEMENT_6_MAIN,
        ROW_JUDGEMENT_7_MAIN, ROW_JUDGEMENT_8_MAIN, ROW_JUDGEMENT_9_MAIN,
        ROW_JUDGEMENT_10_MAIN, ROW_JUDGEMENT_11_MAIN
      FROM [BLOCK_PISTON_SUB].[dbo].[BLOCK_RESULT]
      ORDER BY DATE_TIME DESC, ID DESC
    `;

    const result = await pool.request().query(query);
    const row = result.recordset[0];
    if (!row) return res.json({ message: "No data found" });

const pistonCheck = await pool.request()
  .input("engineNo", sql.VarChar, row.ENGINE_NO)
  .query(`
    SELECT TOP 1
      ROW_JUDGEMENT_2_MAIN,
      ROW_JUDGEMENT_3_MAIN,
      ROW_JUDGEMENT_4_MAIN,
      ROW_JUDGEMENT_5_MAIN,
      ROW_JUDGEMENT_6_MAIN
    FROM [BLOCK_PISTON_SUB].[dbo].[PISTON_RESULT]
    WHERE ENGINE_NO = @engineNo
    ORDER BY DATE_TIME DESC
  `);

let pistonStatus = "-";

if (pistonCheck.recordset.length > 0) {
  const p = pistonCheck.recordset[0];

  const values = [
    p.ROW_JUDGEMENT_2_MAIN,
    p.ROW_JUDGEMENT_3_MAIN,
    p.ROW_JUDGEMENT_4_MAIN,
    p.ROW_JUDGEMENT_5_MAIN,
    p.ROW_JUDGEMENT_6_MAIN
  ];

  pistonStatus = values.every(
  v => v && v.toString().toUpperCase() === "OK"
) ? "OK" : "NG";
}

    const toNum = v => Number(v);

    const processMinutes = {
      TIZZ320_ENGRAVING: null,
      TIZZ322_ENGINE_LABEL: null,
      TIZZ325_ID_WRITING: null,
      TIZZ323_LOWER_BEARING: null,
      TIZZ352_CHUTTER: null,
      TIAS307_CRANK_NR: null,
      TIZZ353_BLOCK_PISTON_COLLATION: null,
      TIAS308_CONROD_NR: null,
      TIAS309_COLLATION:null,
      BLOCK_RESULT:null
    };

    const tableMap = {
      TIZZ320_ENGRAVING: "[BLOCK_PISTON_SUB].[dbo].[TIZZ320_ENGRAVING]",
      TIZZ322_ENGINE_LABEL: "[BLOCK_PISTON_SUB].[dbo].[TIZZ322_ENGINE_LABEL]",
      TIZZ325_ID_WRITING: "[BLOCK_PISTON_SUB].[dbo].[TIZZ325_ID_WRITING]",
      TIZZ323_LOWER_BEARING: "[BLOCK_PISTON_SUB].[dbo].[TIZZ323_LOWER_BEARING]",
      TIZZ352_CHUTTER: "[BLOCK_PISTON_SUB].[dbo].[TIZZ352_CHUTTER]",
      TIAS307_CRANK_NR: "[BLOCK_PISTON_SUB].[dbo].[TIAS307_CRANK_NR]",
      TIZZ353_BLOCK_PISTON_COLLATION: "[BLOCK_PISTON_SUB].[dbo].[TIZZ353_BLOCK_PISTON_COLLATION]",
      TIAS308_CONROD_NR: "[BLOCK_PISTON_SUB].[dbo].[TIAS308_CONROD_NR]",
      TIAS309_COLLATION: "[BLOCK_PISTON_SUB].[dbo].[TIAS309_COLLATION]",
      BLOCK_RESULT: "[BLOCK_PISTON_SUB].[dbo].[BLOCK_RESULT]"
    };

   for (const key of Object.keys(processMinutes)) {

  if (!tableMap[key]) {
    console.log("Missing table for key:", key);
    continue;
  }

  const request = pool.request();
  request.input("engineNo", sql.VarChar, row.ENGINE_NO);

  let columnName = "PART_ENTRY_TIME";

 
  if (key === "BLOCK_RESULT") {
    columnName = "DATE_TIME";
  }

  const ts = await request.query(`
    SELECT TOP 1 ${columnName} AS TS
    FROM ${tableMap[key]}
    WHERE ENGINE_NO = @engineNo
    ORDER BY ${columnName} DESC
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
  FROM [BLOCK_PISTON_SUB].[dbo].[LINE_STATUS]
`);

// console.log("STD Query Result:", stdQuery.recordset);

if (stdQuery.recordset.length > 0) {

  const use15L = STD_15L_CODES.includes(engineCode);

  const stationOrder = [
    "TIZZ320_ENGRAVING",
    "TIZZ322_ENGINE_LABEL",
    "TIZZ325_ID_WRITING",
    "TIZZ323_LOWER_BEARING",
    "TIZZ323_UPPER_BEARING",
    "TIZZ352_CHUTTER",
    "TIAS307_CRANK_NR",
    "TIZZ353_BLOCK_PISTON_COLLATION",
    "TIAS308_CONROD_NR",
    "TIAS309_COLLATION"
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
      pistonStatus,

      judgements: {
        row1: [toNum(row.ROW_JUDGEMENT_1_1)],
        row2: [toNum(row.ROW_JUDGEMENT_2_1)],
        row3: [toNum(row.ROW_JUDGEMENT_3_1), toNum(row.ROW_JUDGEMENT_3_2), toNum(row.ROW_JUDGEMENT_3_3)],
        row4: [toNum(row.ROW_JUDGEMENT_4_1), toNum(row.ROW_JUDGEMENT_4_2), toNum(row.ROW_JUDGEMENT_4_3)],
        row5: [toNum(row.ROW_JUDGEMENT_5_1), toNum(row.ROW_JUDGEMENT_5_2), toNum(row.ROW_JUDGEMENT_5_3)],
        row6: [toNum(row.ROW_JUDGEMENT_6_1)],
        row7: [toNum(row.ROW_JUDGEMENT_7_1), toNum(row.ROW_JUDGEMENT_7_2), toNum(row.ROW_JUDGEMENT_7_3), toNum(row.ROW_JUDGEMENT_7_4), toNum(row.ROW_JUDGEMENT_7_5)],
        row8: [toNum(row.ROW_JUDGEMENT_8_1)],
        row9: [toNum(row.ROW_JUDGEMENT_9_1), toNum(row.ROW_JUDGEMENT_9_2), toNum(row.ROW_JUDGEMENT_9_3), toNum(row.ROW_JUDGEMENT_9_4), toNum(row.ROW_JUDGEMENT_9_5)],
        row10: [toNum(row.ROW_JUDGEMENT_10_1)],

      },

     mainJudgements: {
  row1: row.ROW_JUDGEMENT_1_MAIN ?? null,
  row2: row.ROW_JUDGEMENT_2_MAIN ?? null,
  row3: row.ROW_JUDGEMENT_3_MAIN ?? null,
  row4: row.ROW_JUDGEMENT_4_MAIN ?? null,
  row5: row.ROW_JUDGEMENT_5_MAIN ?? null,
  row6: row.ROW_JUDGEMENT_6_MAIN ?? null,
  row7: row.ROW_JUDGEMENT_7_MAIN ?? null,
  row8: row.ROW_JUDGEMENT_8_MAIN ?? null,
  row9: row.ROW_JUDGEMENT_9_MAIN ?? null,
  row10: row.ROW_JUDGEMENT_10_MAIN ?? null,
  row11: row.ROW_JUDGEMENT_11_MAIN ?? null
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



router.get("/blockengine-details/:engineNo", async (req, res) => {
  try {
    const pool = await poolPromise;
    const { engineNo } = req.params;

    const queries = {
      engraving: `
        SELECT TOP 1 JUDGEMENT_1,TIME_DEVIATION
        FROM [BLOCK_PISTON_SUB].[dbo].[TIZZ320_ENGRAVING]
        WHERE ENGINE_NO = @engineNo
        ORDER BY PART_ENTRY_TIME DESC
      `,
      labelPrinter: `
        SELECT TOP 1 JUDGEMENT_1, TIME_DEVIATION
        FROM [BLOCK_PISTON_SUB].[dbo].[TIZZ322_ENGINE_LABEL]
        WHERE ENGINE_NO = @engineNo
        ORDER BY PART_ENTRY_TIME DESC
      `,
      idWriting: `
        SELECT TOP 1 JUDGEMENT_1, JUDGEMENT_2, JUDGEMENT_3,TIME_DEVIATION
        FROM [BLOCK_PISTON_SUB].[dbo].[TIZZ325_ID_WRITING]
        WHERE ENGINE_NO = @engineNo
        ORDER BY PART_ENTRY_TIME DESC
      `,
      lower: `
        SELECT TOP 1 JUDGEMENT_1, JUDGEMENT_3,TIME_DEVIATION
        FROM [BLOCK_PISTON_SUB].[dbo].[TIZZ323_LOWER_BEARING]
        WHERE ENGINE_NO = @engineNo
        ORDER BY PART_ENTRY_TIME DESC
      `,
      upper: `
        SELECT TOP 1 JUDGEMENT_1, JUDGEMENT_3,TIME_DEVIATION
        FROM [BLOCK_PISTON_SUB].[dbo].[TIZZ323_UPPER_BEARING]
        WHERE ENGINE_NO = @engineNo
        ORDER BY PART_ENTRY_TIME DESC
      `,
      chutter: `
        SELECT TOP 1 JUDGEMENT_1,  TIME_DEVIATION
        FROM [BLOCK_PISTON_SUB].[dbo].[TIZZ352_CHUTTER]
        WHERE ENGINE_NO = @engineNo
        ORDER BY PART_ENTRY_TIME DESC
      `,
      crankNr: `
        SELECT TOP 1 JUDGEMENT_1, JUDGEMENT_2, JUDGEMENT_3, JUDGEMENT_4, JUDGEMENT_5, JUDGEMENT_6, JUDGEMENT_7, JUDGEMENT_8, JUDGEMENT_9, JUDGEMENT_10, TIME_DEVIATION
        FROM [BLOCK_PISTON_SUB].[dbo].[TIAS307_CRANK_NR]
        WHERE ENGINE_NO = @engineNo
        ORDER BY PART_ENTRY_TIME DESC
      `,
      collation: `
        SELECT TOP 1 JUDGEMENT_1, TIME_DEVIATION
        FROM [BLOCK_PISTON_SUB].[dbo].[TIZZ353_BLOCK_PISTON_COLLATION]
        WHERE ENGINE_NO = @engineNo
        ORDER BY PART_ENTRY_TIME DESC
      `,
      conrod: `
        SELECT TOP 1 JUDGEMENT_1, JUDGEMENT_2, JUDGEMENT_3, JUDGEMENT_4, JUDGEMENT_5, JUDGEMENT_6, JUDGEMENT_7, JUDGEMENT_8, JUDGEMENT_9, JUDGEMENT_10, TIME_DEVIATION
        FROM [BLOCK_PISTON_SUB].[dbo].[TIAS308_CONROD_NR]
        WHERE ENGINE_NO = @engineNo
        ORDER BY PART_ENTRY_TIME DESC
      `,
      pistonCollation: `
        SELECT TOP 1 JUDGEMENT_1, TIME_DEVIATION
        FROM [BLOCK_PISTON_SUB].[dbo].[TIAS309_COLLATION]
        WHERE ENGINE_NO = @engineNo
        ORDER BY PART_ENTRY_TIME DESC
      `,
      crankFIPG: `
        SELECT TOP 1 JUDGEMENT_1, JUDGEMENT_2, JUDGEMENT_3, JUDGEMENT_4, JUDGEMENT_5, TIME_DEVIATION
        FROM [BLOCK_PISTON_SUB].[dbo].[TIAS321_CRANK_FIPG]
        WHERE ENGINE_NO = @engineNo
        ORDER BY PART_ENTRY_TIME DESC
      `,

      // bearing1: `
      //   SELECT TOP 1
      //     JUDGEMENT_1 AS JUDGEMENT_1,
      //     JUDGEMENT_3 AS JUDGEMENT_2,
      //     JUDGEMENT_5 AS JUDGEMENT_3,
      //     JUDGEMENT_7 AS JUDGEMENT_4,
      //     JUDGEMENT_9 AS JUDGEMENT_5,
      //     TIME_DEVIATION
      //   FROM [BLOCK_PISTON_SUB].[dbo].[TIZZ323_BEARING]
      //   WHERE ENGINE_NO = @engineNo
      //   ORDER BY PART_ENTRY_TIME DESC
      // `,
      // bearing2: `
      //   SELECT TOP 1
      //     JUDGEMENT_2 AS JUDGEMENT_1,
      //     JUDGEMENT_4 AS JUDGEMENT_2,
      //     JUDGEMENT_6 AS JUDGEMENT_3,
      //     JUDGEMENT_8 AS JUDGEMENT_4,
      //     JUDGEMENT_10 AS JUDGEMENT_5,
      //     TIME_DEVIATION
      //   FROM [BLOCK_PISTON_SUB].[dbo].[TIZZ323_BEARING]
      //   WHERE ENGINE_NO = @engineNo
      //   ORDER BY PART_ENTRY_TIME DESC
      // `

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


module.exports = router;


