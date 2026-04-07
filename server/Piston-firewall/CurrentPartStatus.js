const express = require("express");
const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");
const router = express.Router();
const { sql, poolPromise } = require('../Piston-firewall/db'); 

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

// router.get("/pistonengine-number", async (req, res) => {
//   try {
//     const pool = await poolPromise;

//     const query = `
//       SELECT TOP 1
//         PALLET_NO
//       FROM [BLOCK_PISTON_SUB].[dbo].[TIAS313_RING_ASSY]
//       ORDER BY PART_ENTRY_TIME DESC, ID DESC
//     `;

//     const result = await pool.request().query(query);
//     const row = result.recordset[0];
//     if (!row) return res.json({ message: "No data found" });

//     const toNum = v => Number(v);

//     const processMinutes = {
//       TIAS311_VISION_SYSTEM: null,
//       TIAS311_PISTON_RANK: null,
//       TIAS311_PISTON_PIN_ASSY: null,
//       TIAS312_SNAPRING_VISION: null,
//       TIAS313_RING_ASSY: null
//     };

//     const tableMap = {
//       TIAS311_VISION_SYSTEM: "[BLOCK_PISTON_SUB].[dbo].[TIAS311_VISION_SYSTEM]",
//       TIAS311_PISTON_RANK: "[BLOCK_PISTON_SUB].[dbo].[TIAS311_PISTON_RANK]",
//       TIAS311_PISTON_PIN_ASSY: "[BLOCK_PISTON_SUB].[dbo].[TIAS311_PISTON_PIN_ASSY]",
//       TIAS312_SNAPRING_VISION: "[BLOCK_PISTON_SUB].[dbo].[TIAS312_SNAPRING_VISION]",
//       TIAS313_RING_ASSY: "[BLOCK_PISTON_SUB].[dbo].[TIAS313_RING_ASSY]"
//     };

//    for (const key of Object.keys(processMinutes)) {
//   const request = pool.request();
//   request.input("palletNo", sql.VarChar, row.PALLET_NO);

//   const ts = await request.query(`
//     SELECT TOP 1 PART_ENTRY_TIME AS TS
//     FROM ${tableMap[key]}
//     WHERE PALLET_NO = @palletNo
//     ORDER BY PART_ENTRY_TIME DESC
//   `);

//   processMinutes[key] = ts.recordset[0]?.TS ?? null;
// }

//     res.json({
//       engineNumber: row.PALLET_NO,
//       processMinutes
//     });

//   } catch (err) {
//     console.error("❌ Database error:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

const STD_15L_CODES = ["004"];
const STD_2L_CODES = ["002", "001"];



router.get("/pistonengine-number", async (req, res) => {
  try {
    const pool = await poolPromise;

   
    const query = `
      SELECT TOP 1
        PALLET_NO,
        ENGINE_CODE,

        ROW_JUDGEMENT_2_1, ROW_JUDGEMENT_2_2, ROW_JUDGEMENT_2_3, ROW_JUDGEMENT_2_4, ROW_JUDGEMENT_2_5,
        ROW_JUDGEMENT_3_1, ROW_JUDGEMENT_3_2, ROW_JUDGEMENT_3_3, ROW_JUDGEMENT_3_4, ROW_JUDGEMENT_3_5,
        ROW_JUDGEMENT_4_1, ROW_JUDGEMENT_4_2, ROW_JUDGEMENT_4_3, ROW_JUDGEMENT_4_4, ROW_JUDGEMENT_4_5,
        ROW_JUDGEMENT_5_1, ROW_JUDGEMENT_5_2, ROW_JUDGEMENT_5_3, ROW_JUDGEMENT_5_4,
        ROW_JUDGEMENT_5_5, ROW_JUDGEMENT_5_6, ROW_JUDGEMENT_5_7, ROW_JUDGEMENT_5_8,
        ROW_JUDGEMENT_6_1, ROW_JUDGEMENT_6_2, ROW_JUDGEMENT_6_3, ROW_JUDGEMENT_6_4, ROW_JUDGEMENT_6_5,

        ROW_JUDGEMENT_2_MAIN, ROW_JUDGEMENT_3_MAIN,
        ROW_JUDGEMENT_4_MAIN, ROW_JUDGEMENT_5_MAIN, ROW_JUDGEMENT_6_MAIN
      FROM [BLOCK_PISTON_SUB].[dbo].[PISTON_RESULT]
      ORDER BY DATE_TIME DESC, ID DESC
    `;

    const result = await pool.request().query(query);
    const row = result.recordset[0];
    if (!row) return res.json({ message: "No data found" });

    const toNum = v => Number(v);

    
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
      "TIAS311_VISION_SYSTEM",
      "TIAS311_PISTON_RANK",
      "TIAS311_PISTON_PIN_ASSY",
      "TIAS312_SNAPRING_VISION",
      "TIAS312_SNAPRING_VISION",
      "TIAS313_RING_ASSY",
      "TIAS311_VISION_SYSTEM"
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
      engineNumber: row.PALLET_NO,
      engineCode: row.ENGINE_CODE,

      judgements: {
        row1: [toNum(row.ROW_JUDGEMENT_2_1),toNum(row.ROW_JUDGEMENT_2_2),toNum(row.ROW_JUDGEMENT_2_3),toNum(row.ROW_JUDGEMENT_2_4),toNum(row.ROW_JUDGEMENT_2_5)],
        row2: [toNum(row.ROW_JUDGEMENT_3_1),toNum(row.ROW_JUDGEMENT_3_2),toNum(row.ROW_JUDGEMENT_3_3),toNum(row.ROW_JUDGEMENT_3_4),toNum(row.ROW_JUDGEMENT_3_5)],
        row3: [toNum(row.ROW_JUDGEMENT_4_1),toNum(row.ROW_JUDGEMENT_4_2),toNum(row.ROW_JUDGEMENT_4_3),toNum(row.ROW_JUDGEMENT_4_4),toNum(row.ROW_JUDGEMENT_4_5)],
        row4: [toNum(row.ROW_JUDGEMENT_5_1),toNum(row.ROW_JUDGEMENT_5_2),toNum(row.ROW_JUDGEMENT_5_3),toNum(row.ROW_JUDGEMENT_5_4)],
        row5: [toNum(row.ROW_JUDGEMENT_5_5),toNum(row.ROW_JUDGEMENT_5_6),toNum(row.ROW_JUDGEMENT_5_7),toNum(row.ROW_JUDGEMENT_5_8)],
        row6: [toNum(row.ROW_JUDGEMENT_6_1),toNum(row.ROW_JUDGEMENT_6_2),toNum(row.ROW_JUDGEMENT_6_3),toNum(row.ROW_JUDGEMENT_6_4),toNum(row.ROW_JUDGEMENT_6_5)],
        row7: [toNum(row.ROW_JUDGEMENT_2_1),toNum(row.ROW_JUDGEMENT_2_2),toNum(row.ROW_JUDGEMENT_2_3),toNum(row.ROW_JUDGEMENT_2_4),toNum(row.ROW_JUDGEMENT_2_5)]
      },

     mainJudgements: {
  row1: row.ROW_JUDGEMENT_2_MAIN ?? null,
  row2: row.ROW_JUDGEMENT_3_MAIN ?? null,
  row3: row.ROW_JUDGEMENT_4_MAIN ?? null,
  row4: row.ROW_JUDGEMENT_5_MAIN ?? null,
  row5: row.ROW_JUDGEMENT_5_MAIN ?? null,
  row6: row.ROW_JUDGEMENT_6_MAIN ?? null,
  row7: row.ROW_JUDGEMENT_2_MAIN ?? null,
}
,stdDeviationTimes
  
    }
  );
    
  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/pistonengine-details/:engineNo", async (req, res) => {
  try {
    const pool = await poolPromise;
    const { engineNo } = req.params;

    const timeQuery = `
      SELECT TOP 1
      PART_ENTRY_TIME,
      PART_ENTRY_TIME_2,
      PART_ENTRY_TIME_4,
      PART_ENTRY_TIME_5,
      PART_ENTRY_TIME_6
      FROM [BLOCK_PISTON_SUB].[dbo].[PISTON_PIN_COLLATION]
      WHERE PALLET_NO = @palletNo
      ORDER BY PART_ENTRY_TIME DESC
    `;

    const timeResult = await pool
      .request()
      .input("palletNo", engineNo)
      .query(timeQuery);

    const partTimes = timeResult.recordset[0] || {};

    const queries = {
      VisionSystem: `
        SELECT TOP 1
        JUDGEMENT_11 AS JUDGEMENT_1,
        JUDGEMENT_12 AS JUDGEMENT_2,
        JUDGEMENT_13 AS JUDGEMENT_3,
        JUDGEMENT_14 AS JUDGEMENT_4,
        TIME_DEVIATION_2 AS TIME_DEVIATION
        FROM [BLOCK_PISTON_SUB].[dbo].[PISTON_PIN_COLLATION]
        WHERE PALLET_NO = @palletNo
        ORDER BY PART_ENTRY_TIME DESC
      `,
      PistonRank: `
        SELECT TOP 1
        JUDGEMENT_21 AS JUDGEMENT_1,
        JUDGEMENT_22 AS JUDGEMENT_2,
        JUDGEMENT_23 AS JUDGEMENT_3,
        JUDGEMENT_24 AS JUDGEMENT_4,
        TIME_DEVIATION_3 AS TIME_DEVIATION
        FROM [BLOCK_PISTON_SUB].[dbo].[PISTON_PIN_COLLATION]
        WHERE PALLET_NO = @palletNo
        ORDER BY PART_ENTRY_TIME DESC
      `,
      PinAssembly: `
        SELECT TOP 1
        JUDGEMENT_31 AS JUDGEMENT_1,
        JUDGEMENT_32 AS JUDGEMENT_2,
        JUDGEMENT_33 AS JUDGEMENT_3,
        JUDGEMENT_34 AS JUDGEMENT_4,
        TIME_DEVIATION_3 AS TIME_DEVIATION
        FROM [BLOCK_PISTON_SUB].[dbo].[PISTON_PIN_COLLATION]
        WHERE PALLET_NO = @palletNo
        ORDER BY PART_ENTRY_TIME DESC
      `,
      SnapRingInspection: `
        SELECT TOP 1
        JUDGEMENT_41 AS JUDGEMENT_1,
        JUDGEMENT_42 AS JUDGEMENT_2,
        JUDGEMENT_43 AS JUDGEMENT_3,
        JUDGEMENT_44 AS JUDGEMENT_4,
        TIME_DEVIATION_4 AS TIME_DEVIATION
        FROM [BLOCK_PISTON_SUB].[dbo].[PISTON_PIN_COLLATION]
        WHERE PALLET_NO = @palletNo
        ORDER BY PART_ENTRY_TIME DESC
      `,
      SnapRingVisionSystem: `
        SELECT TOP 1
        JUDGEMENT_45 AS JUDGEMENT_1,
        JUDGEMENT_46 AS JUDGEMENT_2,
        JUDGEMENT_47 AS JUDGEMENT_3,
        JUDGEMENT_48 AS JUDGEMENT_4,
        TIME_DEVIATION_4 AS TIME_DEVIATION
        FROM [BLOCK_PISTON_SUB].[dbo].[PISTON_PIN_COLLATION]
        WHERE PALLET_NO = @palletNo
        ORDER BY PART_ENTRY_TIME DESC
      `,
      RingAssembly: `
        SELECT TOP 1
        JUDGEMENT_51 AS JUDGEMENT_1,
        JUDGEMENT_52 AS JUDGEMENT_2,
        JUDGEMENT_53 AS JUDGEMENT_3,
        JUDGEMENT_54 AS JUDGEMENT_4,
        TIME_DEVIATION_5 AS TIME_DEVIATION
        FROM [BLOCK_PISTON_SUB].[dbo].[PISTON_PIN_COLLATION]
        WHERE PALLET_NO = @palletNo
        ORDER BY PART_ENTRY_TIME DESC
      `,
      // RingVision: `
      //   SELECT TOP 1
      //   JUDGEMENT_41 AS JUDGEMENT_1,
      //   JUDGEMENT_42 AS JUDGEMENT_2,
      //   JUDGEMENT_43 AS JUDGEMENT_3,
      //   JUDGEMENT_44 AS JUDGEMENT_4,
      //   TIME_DEVIATION_5 AS TIME_DEVIATION
      //   FROM [BLOCK_PISTON_SUB].[dbo].[PISTON_PIN_COLLATION]
      //   WHERE PALLET_NO = @palletNo
      //   ORDER BY PART_ENTRY_TIME DESC
      // `,
      Bearingassy: `
        SELECT TOP 1
        JUDGEMENT_11 AS JUDGEMENT_1,
        JUDGEMENT_12 AS JUDGEMENT_2,
        JUDGEMENT_13 AS JUDGEMENT_3,
        JUDGEMENT_14 AS JUDGEMENT_4,
        TIME_DEVIATION_2 AS TIME_DEVIATION
        FROM [BLOCK_PISTON_SUB].[dbo].[PISTON_PIN_COLLATION]
        WHERE PALLET_NO = @palletNo
        ORDER BY PART_ENTRY_TIME DESC
      `
    };

    const results = {};

    for (const [key, query] of Object.entries(queries)) {
      const request = pool.request();
      request.input("palletNo", engineNo);

      const result = await request.query(query);
      results[key] = result.recordset[0] || null;
    }

    res.json({
      stations: results,
      partTimes: partTimes
    });

  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;


