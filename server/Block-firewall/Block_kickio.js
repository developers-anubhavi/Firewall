const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../Block-firewall/db');
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
const STD_2L_CODES = [207, 203, 205, 209, 62, 21, 22, 201, 202, 204, 206, 208, 620, 23];

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

router.post('/block_kickIOCounts', async (req, res) => {
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

    // Single query for both kick-in and kick-out counts
    const query = `
          SELECT
  (SELECT COUNT(*) FROM [BLOCK_PISTON_SUB].[dbo].[KICK_IN_OUT]
   WHERE SHIFT = @shift
     AND KICK_IN_FLAG = 1
     AND KICK_IN_DATE >= @start
     AND KICK_IN_DATE < @end
  ) AS kickInCount,

  (SELECT COUNT(*) FROM [BLOCK_PISTON_SUB].[dbo].[KICK_IN_OUT]
   WHERE SHIFT = @shift
     AND KICK_OUT_FLAG = 1
     AND KICK_OUT_DATE >= @start
     AND KICK_OUT_DATE < @end
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
    console.error("❌ block_kickIOCounts Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.post('/block_kickInEngines', async (req, res) => {
  try {
    const { shift, date: block_selectedDate } = req.body;

    if (!shift || !block_selectedDate) {
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

      const shift1End = shift2Start;
      const shift2End =
        shift3Start <= shift2Start
          ? new Date(shift3Start.getTime() + 24 * 60 * 60 * 1000)
          : shift3Start;
      const shift3End =
        shift1Start <= shift3Start
          ? new Date(shift1Start.getTime() + 24 * 60 * 60 * 1000)
          : shift1Start;

      return {
        1: { start: shift1Start, end: shift1End },
        2: { start: shift2Start, end: shift2End },
        3: { start: shift3Start, end: shift3End }
      };
    };

    const shiftMap = computeShiftForSelectedDate(shiftTimes, block_selectedDate);

    if (!shiftMap[shift]) {
      return res.status(400).json({ error: "Invalid shift" });
    }

    const shiftStart = shiftMap[shift].start;
    const shiftEnd = shiftMap[shift].end;

    const formatDateSQL = (date) => {
      const pad = (n) => n.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
             `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    const startStr = formatDateSQL(shiftStart);
    const endStr   = formatDateSQL(shiftEnd);

    // console.log(`Kick-In Shift ${shift}: ${startStr} → ${endStr}`);

    const pool = await poolPromise;

    const engineQuery = `
      SELECT ENGINE_NO
      FROM [BLOCK_PISTON_SUB].[dbo].[KICK_IN_OUT]
      WHERE SHIFT = @shift
        AND KICK_IN_FLAG = 1
        AND KICK_IN_DATE >= @start
        AND KICK_IN_DATE < @end
      ORDER BY ENGINE_NO
    `;

    const result = await pool.request()
      .input("shift", sql.VarChar, shift.toString())
      .input("start", sql.VarChar, startStr)
      .input("end", sql.VarChar, endStr)
      .query(engineQuery);

    res.json({
      selected_date: block_selectedDate,
      shift,
      shift_start: startStr,
      shift_end: endStr,
      engines: result.recordset.map(r => r.ENGINE_NO)
    });

  } catch (error) {
    console.error("❌ block_kickInEngines Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.post('/block_kickoutEngines', async (req, res) => {
  try {
    const { shift, date: block_selectedDate } = req.body;

    if (!shift || !block_selectedDate) {
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

      const shift1End = shift2Start;
      const shift2End =
        shift3Start <= shift2Start
          ? new Date(shift3Start.getTime() + 24 * 60 * 60 * 1000)
          : shift3Start;
      const shift3End =
        shift1Start <= shift3Start
          ? new Date(shift1Start.getTime() + 24 * 60 * 60 * 1000)
          : shift1Start;

      return {
        1: { start: shift1Start, end: shift1End },
        2: { start: shift2Start, end: shift2End },
        3: { start: shift3Start, end: shift3End }
      };
    };

    const shiftMap = computeShiftForSelectedDate(shiftTimes, block_selectedDate);

    if (!shiftMap[shift]) {
      return res.status(400).json({ error: "Invalid shift" });
    }

    const shiftStart = shiftMap[shift].start;
    const shiftEnd = shiftMap[shift].end;


    const formatDateSQL = (date) => {
      const pad = (n) => n.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
             `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    const startStr = formatDateSQL(shiftStart);
    const endStr   = formatDateSQL(shiftEnd);

    // console.log(`Kick-Out Shift ${shift}: ${startStr} → ${endStr}`);

    const pool = await poolPromise;

    const engineQuery = `
      SELECT ENGINE_NO
      FROM [BLOCK_PISTON_SUB].[dbo].[KICK_IN_OUT]
      WHERE SHIFT = @shift
        AND KICK_OUT_FLAG = 1
        AND KICK_OUT_DATE >= @start
        AND KICK_OUT_DATE < @end
      ORDER BY ENGINE_NO
    `;

    const result = await pool.request()
      .input("shift", sql.VarChar, shift.toString())
      .input("start", sql.VarChar, startStr)
      .input("end", sql.VarChar, endStr)
      .query(engineQuery);

    res.json({
      selected_date: block_selectedDate,
      shift,
      shift_start: startStr,
      shift_end: endStr,
      engines: result.recordset.map(r => r.ENGINE_NO)
    });

  } catch (error) {
    console.error("❌ block_kickoutEngines Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



router.post('/block_shiftCounts', async (req, res) => {
  try {
    const { date: block_selectedDate, shift } = req.body;

    if (!block_selectedDate || !shift) {
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

    const shiftMap = computeShiftForSelectedDate(shiftTimes, block_selectedDate);

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
      FROM [BLOCK_PISTON_SUB].[dbo].[TIZZ320_ENGRAVING]
      WHERE SHIFT = @shift
        AND PART_ENTRY_TIME >= @start
        AND PART_ENTRY_TIME < @end
    `;

    const shiftOutQuery = `
      SELECT COUNT(*) AS count
      FROM [BLOCK_PISTON_SUB].[dbo].[BLOCK_RESULT]
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
      selected_date: block_selectedDate,
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


router.post('/block_newAbnormalCycleCount', async (req, res) => {
  try {
    const { date: block_selectedDate, shift } = req.body;

    if (!block_selectedDate || !shift) {
      return res.status(400).json({ error: "Missing date or shift" });
    }

    const shiftTimes = readShiftTimes();
    const shiftMap = computeShiftForSelectedDate(shiftTimes, block_selectedDate);

    if (!shiftMap[shift]) {
      return res.status(400).json({ error: "Invalid shift" });
    }

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
      FROM [BLOCK_PISTON_SUB].[dbo].[KICK_IN_OUT]
      WHERE SHIFT = @shift
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
      selected_date: block_selectedDate,
      shift,
      shift_start: startStr,
      shift_end: endStr,
      abnormal_count: result.recordset[0]?.abnormalCount ?? 0
    });

  } catch (err) {
    console.error("❌ block_newAbnormalCycleCount Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post('/block_abnormalcycleEngines', async (req, res) => {
  try {
    const { date: block_selectedDate, shift } = req.body;
    if (!block_selectedDate || !shift) {
      return res.status(400).json({ error: "Missing date or shift" });
    }

    const shiftTimes = readShiftTimes();
    const shiftMap = computeShiftForSelectedDate(shiftTimes, block_selectedDate);
    if (!shiftMap[shift]) return res.status(400).json({ error: "Invalid shift" });

    let shiftStart = new Date(shiftMap[shift].start);
    let shiftEnd = new Date(shiftMap[shift].end);
    if (shiftEnd <= shiftStart) shiftEnd.setDate(shiftEnd.getDate() + 1);

    const startStr = formatDateSQL(shiftStart);
    const endStr = formatDateSQL(shiftEnd);

    const pool = await poolPromise;

    const query = `
      SELECT DISTINCT ENGINE_NO
      FROM [BLOCK_PISTON_SUB].[dbo].[KICK_IN_OUT]
      WHERE SHIFT = @shift
        AND (
          (KICK_IN_FLAG = 1 AND KICK_IN_DATE >= @start AND KICK_IN_DATE < @end)
          OR
          (KICK_OUT_FLAG = 1 AND KICK_OUT_DATE >= @start AND KICK_OUT_DATE < @end)
        )
      ORDER BY ENGINE_NO;
    `;

    const result = await pool.request()
      .input("shift", sql.Int, shift)
      .input("start", sql.VarChar, startStr)
      .input("end", sql.VarChar, endStr)
      .query(query);

    const engines = result.recordset.map(r => r.ENGINE_NO).filter(Boolean);

    res.json({
      selected_date: block_selectedDate,
      shift,
      shift_start: startStr,
      shift_end: endStr,
      engines
    });

  } catch (err) {
    console.error("❌ block_abnormalcycleEngines Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post('/blockengine_number', async (req, res) => {
  try {
    const { engine_no } = req.body;
    if (!engine_no) return res.status(400).json({ error: "Missing engine number" });

    const pool = await poolPromise;
    const query = `
      SELECT ENGINE_NO, PART_ENTRY_TIME, ENGINE_CODE
      FROM [BLOCK_PISTON_SUB].[dbo].[TIZZ320_ENGRAVING]
      WHERE ENGINE_NO = @engine_no;
    `;

    const result = await pool.request()
      .input('engine_no', sql.VarChar, engine_no)
      .query(query);

    if (result.recordset.length === 0) return res.status(404).json({ error: "Engine number not found" });

    const engine = result.recordset[0];

let stdDeviationTimes = [];

const engineCode = Number(engine.ENGINE_CODE);

// Fetch all stations
const stdQuery = await pool.request().query(`
  SELECT 
    STATION_NAME,
    STD_TIME_1_5L,
    STD_TIME_2L
  FROM [BLOCK_PISTON_SUB].[dbo].[LINE_STATUS]
`);

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
      FROM [BLOCK_PISTON_SUB].[dbo].[TIZZ320_ENGRAVING]
      ORDER BY ENGINE_NO
    `);
    const engines = result.recordset.map(r => r.ENGINE_NO);
    res.json(engines);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.post('/block_kick_stations', async (req, res) => {
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
        FROM [BLOCK_PISTON_SUB].[dbo].[KICK_IN_OUT]
        WHERE ENGINE_NO = @engine_no
        ORDER BY ID DESC
      `);

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


let kickIn = null;
let kickOut = null;

if (stationResult.recordset.length > 0) {
  kickIn = stationResult.recordset[0].KICK_IN_STN;
  kickOut = stationResult.recordset[0].KICK_OUT_STN;
}
  
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
  request.input("engineNo", sql.VarChar, engine_no);

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

res.json({
  KICK_IN_STN: kickIn,
  KICK_OUT_STN: kickOut,
  processMinutes
});

  } catch (err) {
    console.error("❌ Error in /block_kick_stations:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const processMinutes = null;



router.get("/blockkickengine-number/:engineNo", async (req, res) => {
  try {
    const pool = await poolPromise;
    const { engineNo } = req.params;

    const blockResultQuery = `
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
      WHERE ENGINE_NO = @engineNo
      ORDER BY DATE_TIME DESC, ID DESC
    `;

    const result = await pool.request()
      .input("engineNo", sql.VarChar, engineNo)
      .query(blockResultQuery);

    const row = result.recordset[0];
    if (!row) return res.json({
  judgements: {},
  mainJudgements: {},
  processMinutes
});


    const toNum = (val) => {
      if (val === null || val === undefined) return null;
      const n = Number(val);
      return isNaN(n) ? null : n;
    };

    res.json({
      engineNumber: row.ENGINE_NO,
      engineCode: row.ENGINE_CODE,

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
  row1: row.ROW_JUDGEMENT_1_MAIN,
  row2: row.ROW_JUDGEMENT_2_MAIN,
  row3: row.ROW_JUDGEMENT_3_MAIN,
  row4: row.ROW_JUDGEMENT_4_MAIN,
  row5: row.ROW_JUDGEMENT_5_MAIN,
  row6: row.ROW_JUDGEMENT_6_MAIN,
  row7: row.ROW_JUDGEMENT_7_MAIN,
  row8: row.ROW_JUDGEMENT_8_MAIN,
  row9: row.ROW_JUDGEMENT_9_MAIN,
  row10: row.ROW_JUDGEMENT_10_MAIN,
},

      processMinutes
    });

  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/blockkickengine-details/:engineNo", async (req, res) => {
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
        SELECT TOP 1 JUDGEMENT_1, JUDGEMENT_2, JUDGEMENT_3, JUDGEMENT_4, JUDGEMENT_5, JUDGEMENT_6, JUDGEMENT_7, JUDGEMENT_8, JUDGEMENT_9, JUDGEMENT_10,  TIME_DEVIATION
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

router.get("/block_search_engine", async (req, res) => {
  const search = req.query.search;

  if (!search || search.trim() === "") {
    return res.json([]);
  }

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("search", sql.VarChar, search + "%") 
      .query(`
        SELECT TOP 10 ENGINE_NO
        FROM [BLOCK_PISTON_SUB].[dbo].[BLOCK_RESULT]
        WHERE ENGINE_NO LIKE @search
        ORDER BY ENGINE_NO DESC
      `);

    res.json(result.recordset.map(row => row.ENGINE_NO));

  } catch (error) {
    console.error("❌ Engine search error:", error);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;

