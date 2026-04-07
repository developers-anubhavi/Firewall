const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('./db');
const fs = require('fs');
const path = require('path');
const chokidar = require("chokidar");

const SHIFT_DIR = 'D:/Debug/';


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
const STD_2L_CODES = [207, 203, 205, 209, 62, 21, 22, 202, 201, 204, 206, 208, 620, 23];


function readShiftTimes() {
  const filePath = path.join(SHIFT_DIR, 'shifttime.txt');
  const fileContent = fs.readFileSync(filePath, 'utf8').trim();
  const lines = fileContent.split(/\r?\n/).map(line => line.trim()).filter(Boolean);

  if (lines.length < 3) throw new Error('shifttime.txt must contain 3 lines');
  const [first, second, third] = lines;
  return { first, second, third };
}

function computeShiftForSelectedDate(shiftTimes, selectedDate) {
  const shifts = {};
  const dateStr = selectedDate;

  const parseTime = (timeStr) => {
    const [h, m, s] = timeStr.split(':').map(Number);
    return { h, m, s };
  };

  const buildDate = (date, timeStr) => {
    const { h, m, s } = parseTime(timeStr);
    const d = new Date(date);
    d.setHours(h, m, s, 0);
    return d;
  };


  const shift1Start = buildDate(dateStr, shiftTimes.first);
  const shift2Start = buildDate(dateStr, shiftTimes.second);
  const shift3Start = buildDate(dateStr, shiftTimes.third);

  const shift1End = shift2Start;
  const shift2End = shift3Start <= shift2Start ? new Date(shift3Start.getTime() + 24 * 60 * 60 * 1000) : shift3Start;
  const shift3End = shift1Start <= shift3Start ? new Date(shift1Start.getTime() + 24 * 60 * 60 * 1000) : shift1Start;

  shifts[1] = { start: shift1Start, end: shift1End };
  shifts[2] = { start: shift2Start, end: shift2End };
  shifts[3] = { start: shift3Start, end: shift3End };

  return shifts;
}


function formatDateSQL(date) {
  const pad = (n) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

router.post('/et_kickIOCounts', async (req, res) => {
  try {
    const { date: selectedDate, shift } = req.body;

    if (!selectedDate || !shift) 
      return res.status(400).json({ error: "Missing date or shift" });

    const shiftTimes = readShiftTimes();
    const shiftMap = computeShiftForSelectedDate(shiftTimes, selectedDate);

    if (!shiftMap[shift]) 
      return res.status(400).json({ error: "Invalid shift" });

    let shiftStart = new Date(shiftMap[shift].start);
    let shiftEnd = new Date(shiftMap[shift].end);

    if (shiftEnd <= shiftStart) shiftEnd.setDate(shiftEnd.getDate() + 1);

    const startStr = formatDateSQL(shiftStart);
    const endStr = formatDateSQL(shiftEnd);

    const pool = await poolPromise;

    const query = `
      SELECT
  (SELECT COUNT(*) FROM [ENGINE_TESTING].[dbo].[KICK_IN_OUT]
   WHERE SHIFT = @shift
     AND KICK_IN_FLAG = 1
     AND KICK_IN_DATE >= @start
     AND KICK_IN_DATE < @end
     AND (LOCK_STATUS IS NULL OR LOCK_STATUS <> 1)
  ) AS kickInCount,

  (SELECT COUNT(*) FROM [ENGINE_TESTING].[dbo].[KICK_IN_OUT]
   WHERE SHIFT = @shift
     AND KICK_OUT_FLAG = 1
     AND KICK_OUT_DATE >= @start
     AND KICK_OUT_DATE < @end
     AND (LOCK_STATUS IS NULL OR LOCK_STATUS <> 1)
  ) AS kickOutCount
    `;

    const result = await pool.request()
      .input("shift", sql.Int, shift)
      .input("start", sql.VarChar, startStr)
      .input("end", sql.VarChar, endStr)
      .query(query);

    res.json({
      selected_date: selectedDate,
      shift,
      shift_start: startStr,
      shift_end: endStr,
      kick_in_count: result.recordset[0]?.kickInCount || 0,
      kick_out_count: result.recordset[0]?.kickOutCount || 0,
    });

  } catch (err) {
    console.error("❌ et_kickIOCounts Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.post('/et_kickInEngines', async (req, res) => {
  try {
    const { shift, date: et_selectedDate } = req.body;
    if (!shift || !et_selectedDate) return res.status(400).json({ error: "Missing date or shift" });

    const shiftTimes = readShiftTimes();
    const shiftMap = computeShiftForSelectedDate(shiftTimes, et_selectedDate);
    if (!shiftMap[shift]) return res.status(400).json({ error: "Invalid shift" });

    const shiftStart = shiftMap[shift].start;
    const shiftEnd = shiftMap[shift].end;

    const formatDateSQL = (date) => {
      const pad = (n) => n.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
             `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };
    const startStr = formatDateSQL(shiftStart);
    const endStr = formatDateSQL(shiftEnd);

    const pool = await poolPromise;

    const engineQuery = `
      SELECT ENGINE_NO
      FROM [ENGINE_TESTING].[dbo].[KICK_IN_OUT]
      WHERE SHIFT = @shift
        AND KICK_IN_FLAG = 1
        AND KICK_IN_DATE >= @start
        AND KICK_IN_DATE < @end
        AND (LOCK_STATUS IS NULL OR LOCK_STATUS <> 1)
      ORDER BY ENGINE_NO
    `;

    const result = await pool.request()
      .input("shift", sql.VarChar, shift.toString())
      .input("start", sql.VarChar, startStr)
      .input("end", sql.VarChar, endStr)
      .query(engineQuery);

    res.json({
      selected_date: et_selectedDate,
      shift,
      shift_start: startStr,
      shift_end: endStr,
      engines: result.recordset.map(r => r.ENGINE_NO)
    });

  } catch (error) {
    console.error("❌ et_kickInEngines Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.post('/et_kickoutEngines', async (req, res) => {
  try {
    const { shift, date: et_selectedDate } = req.body;
    if (!shift || !et_selectedDate) return res.status(400).json({ error: "Missing date or shift" });

    const shiftTimes = readShiftTimes();
    const shiftMap = computeShiftForSelectedDate(shiftTimes, et_selectedDate);
    if (!shiftMap[shift]) return res.status(400).json({ error: "Invalid shift" });

    const shiftStart = shiftMap[shift].start;
    const shiftEnd = shiftMap[shift].end;

    const formatDateSQL = (date) => {
      const pad = (n) => n.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
             `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };
    const startStr = formatDateSQL(shiftStart);
    const endStr = formatDateSQL(shiftEnd);

    const pool = await poolPromise;

    const engineQuery = `
      SELECT ENGINE_NO
      FROM [ENGINE_TESTING].[dbo].[KICK_IN_OUT]
      WHERE SHIFT = @shift
        AND KICK_OUT_FLAG = 1
        AND KICK_OUT_DATE >= @start
        AND KICK_OUT_DATE < @end
        AND (LOCK_STATUS IS NULL OR LOCK_STATUS <> 1)
      ORDER BY ENGINE_NO
    `;

    const result = await pool.request()
      .input("shift", sql.VarChar, shift.toString())
      .input("start", sql.VarChar, startStr)
      .input("end", sql.VarChar, endStr)
      .query(engineQuery);

    res.json({
      selected_date: et_selectedDate,
      shift,
      shift_start: startStr,
      shift_end: endStr,
      engines: result.recordset.map(r => r.ENGINE_NO)
    });

  } catch (error) {
    console.error("❌ et_kickoutEngines Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.post('/et_shiftCounts', async (req, res) => {
  try {
    const { date: et_selectedDate, shift } = req.body;

    if (!et_selectedDate || !shift) {
      return res.status(400).json({ error: "Missing date or shift" });
    }

    const shiftTimes = readShiftTimes();

    const computeShiftForSelectedDate = (shiftTimes, selectedDate) => {
      const parseTime = (t) => t.split(":").map(Number);
      const buildDate = (date, timeStr) => {
        const [h, m, s] = parseTime(timeStr);
        const d = new Date(date);
        d.setHours(h, m, s, 0);
        return d;
      };

      const shift1Start = buildDate(selectedDate, shiftTimes.first);
      const shift2Start = buildDate(selectedDate, shiftTimes.second);
      const shift3Start = buildDate(selectedDate, shiftTimes.third);

      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const shift1End = shift2Start;
      const shift2End = shift3Start <= shift2Start ? new Date(shift3Start.getTime() + 24*60*60*1000) : shift3Start;
      const shift3End = shift1Start <= shift3Start ? new Date(shift1Start.getTime() + 24*60*60*1000) : shift1Start;

      return {
        1: { start: shift1Start, end: shift1End },
        2: { start: shift2Start, end: shift2End },
        3: { start: shift3Start, end: shift3End },
      };
    };

    const shiftMap = computeShiftForSelectedDate(shiftTimes, et_selectedDate);

    if (!shiftMap[shift]) return res.status(400).json({ error: "Invalid shift" });

    const shiftStart = shiftMap[shift].start;
    const shiftEnd = shiftMap[shift].end;

    const formatDateSQL = (date) => {
      const pad = (n) => n.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    const startStr = formatDateSQL(shiftStart);
    const endStr = formatDateSQL(shiftEnd);

    // console.log(`Shift ${shift} range: ${startStr} → ${endStr}`);

    const pool = await poolPromise;

    const shiftInQuery = `
     SELECT COUNT(*) AS count
FROM [ENGINE_TESTING].[dbo].[TIZZ358_IDWRITER]
WHERE SHIFT = @shift
  AND PART_ENTRY_TIME >= @start
  AND PART_ENTRY_TIME < @end
    `;

    const shiftOutQuery = `
      SELECT COUNT(*) AS count
      FROM [ENGINE_TESTING].[dbo].[ET_RESULT]
      WHERE SHIFT = @shift
        AND DATE_TIME >= @start
        AND DATE_TIME < @end
    `;

    const [shiftInRes, shiftOutRes] = await Promise.all([
      pool.request()
        .input("shift", sql.VarChar, shift.toString())
        .input("start", sql.VarChar, startStr)
        .input("end", sql.VarChar, endStr)
        .query(shiftInQuery),

      pool.request()
        .input("shift", sql.VarChar, shift.toString())
        .input("start", sql.VarChar, startStr)
        .input("end", sql.VarChar, endStr)
        .query(shiftOutQuery)
    ]);


    res.json({
      selected_date: et_selectedDate,
      shift,
      shift_start: startStr,
      shift_end: endStr,
      shift_in_count: shiftInRes.recordset[0]?.count ?? 0,
      shift_out_count: shiftOutRes.recordset[0]?.count ?? 0,
    });

  } catch (err) {
    console.error("❌ ShiftCounts Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.post('/et_newAbnormalCycleCount', async (req, res) => {
  try {
    const { date: et_selectedDate, shift } = req.body;

    if (!et_selectedDate || !shift) {
      return res.status(400).json({ error: "Missing date or shift" });
    }

    const shiftTimes = readShiftTimes();
    const shiftMap = computeShiftForSelectedDate(shiftTimes, et_selectedDate);

    if (!shiftMap[shift]) return res.status(400).json({ error: "Invalid shift" });

    let shiftStart = new Date(shiftMap[shift].start);
    let shiftEnd = new Date(shiftMap[shift].end);
    if (shiftEnd <= shiftStart) shiftEnd.setDate(shiftEnd.getDate() + 1);

    const formatDateSQL = (date) => {
      const pad = (n) => n.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
             `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    const startStr = formatDateSQL(shiftStart);
    const endStr = formatDateSQL(shiftEnd);

    const pool = await poolPromise;

    const query = `
      SELECT COUNT(DISTINCT ENGINE_NO) AS abnormalCount
      FROM [ENGINE_TESTING].[dbo].[KICK_IN_OUT]
      WHERE SHIFT = @shift
      AND ISNULL(LOCK_STATUS,0) <> 1
        AND (
          (KICK_IN_FLAG = 1 AND KICK_IN_DATE >= @start AND KICK_IN_DATE < @end)
          OR
          (KICK_OUT_FLAG = 1 AND KICK_OUT_DATE >= @start AND KICK_OUT_DATE < @end)
        )
    `;

    const result = await pool.request()
      .input("shift", sql.VarChar, shift.toString())
      .input("start", sql.VarChar, startStr)
      .input("end", sql.VarChar, endStr)
      .query(query);

    res.json({
      selected_date: et_selectedDate,
      shift,
      shift_start: startStr,
      shift_end: endStr,
      abnormal_count: result.recordset[0]?.abnormalCount ?? 0
    });

  } catch (err) {
    console.error("❌ et_newAbnormalCycleCount Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post('/et_abnormalcycleEngines', async (req, res) => {
  try {
    const { date: selectedDate, shift } = req.body;

    if (!selectedDate || !shift)
      return res.status(400).json({ error: "Missing date or shift" });

    const shiftTimes = readShiftTimes();
    const shiftMap = computeShiftForSelectedDate(shiftTimes, selectedDate);

    if (!shiftMap[shift])
      return res.status(400).json({ error: "Invalid shift" });

    let shiftStart = new Date(shiftMap[shift].start);
    let shiftEnd = new Date(shiftMap[shift].end);
    if (shiftEnd <= shiftStart) shiftEnd.setDate(shiftEnd.getDate() + 1);

    const formatDateSQL = (date) => {
      const pad = (n) => n.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
             `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    const startStr = formatDateSQL(shiftStart);
    const endStr = formatDateSQL(shiftEnd);

    const pool = await poolPromise;

    const query = `
      SELECT DISTINCT ENGINE_NO
      FROM [ENGINE_TESTING].[dbo].[KICK_IN_OUT]
      WHERE SHIFT = @shift
      AND ISNULL(LOCK_STATUS,0) <> 1
        AND (
          (KICK_IN_FLAG = 1 AND KICK_IN_DATE >= @start AND KICK_IN_DATE < @end)
          OR
          (KICK_OUT_FLAG = 1 AND KICK_OUT_DATE >= @start AND KICK_OUT_DATE < @end)
        )
      ORDER BY ENGINE_NO
    `;

    const result = await pool.request()
      .input("shift", sql.VarChar, shift.toString())
      .input("start", sql.VarChar, startStr)
      .input("end", sql.VarChar, endStr)
      .query(query);

    res.json({
      selected_date: selectedDate,
      shift,
      shift_start: startStr,
      shift_end: endStr,
      abnormal_count: result.recordset.length,
      engines: result.recordset.map(r => r.ENGINE_NO)
    });

  } catch (err) {
    console.error("❌ et_abnormalcycleEngines Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post('/etengine_number', async (req, res) => {
  try {
    const { engine_no } = req.body;
    if (!engine_no) return res.status(400).json({ error: "Missing engine number" });

    const pool = await poolPromise;
    const query = `
      SELECT ENGINE_NO, PART_ENTRY_TIME, ENGINE_CODE
      FROM [ENGINE_TESTING].[dbo].[TIZZ358_IDWRITER]
      WHERE ENGINE_NO = @engine_no;
    `;

    const result = await pool.request()
      .input('engine_no', sql.VarChar, engine_no)
      .query(query);

    if (result.recordset.length === 0) return res.status(404).json({ error: "Engine number not found" });

    const engine = result.recordset[0];

let stdDeviationTimes = [];

const engineCode = Number(engine.ENGINE_CODE);

const stdQuery = await pool.request().query(`
  SELECT 
    STATION_NAME,
    STD_TIME_1_5L,
    STD_TIME_2L
  FROM [ENGINE_TESTING].[dbo].[LINE_STATUS]
`);

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
      engine_no: engine.ENGINE_NO,
      part_entry_time: engine.PART_ENTRY_TIME,
      engine_code: engine.ENGINE_CODE,
      stdDeviationTimes
    });

  } catch (error) {
    console.error("❌ Internal error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/all_engines', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT ENGINE_NO
      FROM [ENGINE_TESTING].[dbo].[TIZZ358_IDWRITER]
      ORDER BY ENGINE_NO
    `);
    const engines = result.recordset.map(r => r.ENGINE_NO);
    res.json(engines);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.post('/et_kick_stations', async (req, res) => {
  try {
    const { engine_no } = req.body;

    if (!engine_no) {
      return res.status(400).json({ error: "Missing engine number" });
    }

    const pool = await poolPromise;

    const stationResult = await pool.request()
      .input('engine_no', sql.VarChar, engine_no)
      .query(`
        SELECT TOP 1
          KICK_OUT_STN,
          KICK_IN_STN
        FROM [ENGINE_TESTING].[dbo].[KICK_IN_OUT]
        WHERE ENGINE_NO = @engine_no
        ORDER BY ID DESC
      `);

    let kickIn = null;
let kickOut = null;

if (stationResult.recordset.length > 0) {
  kickIn = stationResult.recordset[0].KICK_IN_STN;
  kickOut = stationResult.recordset[0].KICK_OUT_STN;
}

    const processMinutes = {
      TIZZ358_IDWRITER: null,
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
      const table = tableMap[key];
      if (!table) continue;

      try {
        const tsResult = await pool.request()
          .input('engineNo', sql.VarChar, engine_no)
          .query(`
            SELECT TOP 1 
              PART_ENTRY_TIME AS TS
            FROM ${table}
            WHERE ENGINE_NO = @engineNo
            ORDER BY PART_ENTRY_TIME DESC
          `);

        if (tsResult.recordset.length > 0) {
          processMinutes[key] = tsResult.recordset[0].TS;
        } else {
          processMinutes[key] = null;
          // console.log(`⚠️ No data found for table ${table} and engine ${engine_no}`);
        }
      } catch (err) {
        console.error(`❌ Error querying table ${table}:`, err.message);
        processMinutes[key] = null;
      }
    }
res.json({
  KICK_IN_STN: kickIn,
  KICK_OUT_STN: kickOut,
  processMinutes
});

  } catch (err) {
    console.error("❌ Error in /et_kick_stations:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.get("/etkickengine-number/:engineNo", async (req, res) => {
  try {
    const pool = await poolPromise;
    const { engineNo } = req.params;

   
    async function getProcessMinutes(engine_no, pool) {
      const processMinutes = {
        TIZZ358_IDWRITER: null,
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
        const table = tableMap[key];
        try {
          const result = await pool.request()
            .input("engineNo", sql.VarChar, engine_no)
            .query(`
              SELECT TOP 1 PART_ENTRY_TIME AS TS
              FROM ${table}
              WHERE ENGINE_NO = @engineNo
              ORDER BY PART_ENTRY_TIME DESC
            `);

          processMinutes[key] = result.recordset?.[0]?.TS ?? null;

        } catch (err) {
          console.error(`❌ Error querying ${table}:`, err.message);
          processMinutes[key] = null;
        }
      }

      return processMinutes;
    }

    const etResultQuery = `
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
        ROW_JUDGEMENT_9_1,
        ROW_JUDGEMENT_2_MAIN, ROW_JUDGEMENT_3_MAIN,
        ROW_JUDGEMENT_4_MAIN, ROW_JUDGEMENT_5_MAIN, ROW_JUDGEMENT_6_MAIN,
        ROW_JUDGEMENT_7_MAIN, ROW_JUDGEMENT_8_MAIN, ROW_JUDGEMENT_9_MAIN
      FROM [ENGINE_TESTING].[dbo].[ET_RESULT]
      WHERE ENGINE_NO = @engineNo
      ORDER BY DATE_TIME DESC, ID DESC
    `;

    const result = await pool.request()
      .input("engineNo", sql.VarChar, engineNo)
      .query(etResultQuery);

    const row = result.recordset[0];

    const processMinutes = await getProcessMinutes(engineNo, pool);

    if (!row) {
      return res.json({
        judgements: {},
        mainJudgements: {},
        processMinutes
      });
    }

    const toNum = (val) => {
      if (val === null || val === undefined) return null;
      const n = Number(val);
      return isNaN(n) ? null : n;
    };

    res.json({
      engineNumber: row.ENGINE_NO,
      engineCode: row.ENGINE_CODE,

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
      },

      processMinutes
    });

  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ error: err.message });
  }
});
router.get("/etkickengine-details/:engineNo", async (req, res) => {
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


module.exports = router;

