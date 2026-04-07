const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db');
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


const STD_15L_CODES = ["004"];
const STD_2L_CODES = ["002", "001"];

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


router.post('/cam_kickIOCounts', async (req, res) => {
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

     const kickInQuery = `
       SELECT COUNT(*) AS kickInCount
      FROM [CAM_HOUSING].[dbo].[KICK_IN_OUT]
      WHERE SHIFT = @shift
        AND KICK_IN_FLAG = 1
        AND KICK_IN_DATE >= @start
        AND KICK_IN_DATE < @end
        AND (LOCK_STATUS IS NULL OR LOCK_STATUS <> 1)
     `;


     const kickOutQuery = `
       SELECT COUNT(*) AS kickOutCount
      FROM [CAM_HOUSING].[dbo].[KICK_IN_OUT]
      WHERE SHIFT = @shift
        AND KICK_OUT_FLAG = 1
        AND KICK_OUT_DATE >= @start
        AND KICK_OUT_DATE < @end
        AND (LOCK_STATUS IS NULL OR LOCK_STATUS <> 1)
     `;

     const [kickInRes, kickOutRes] = await Promise.all([
      pool.request()
        .input("shift", sql.Int, shift)
        .input("start", sql.VarChar, startStr)
        .input("end", sql.VarChar, endStr)
        .query(kickInQuery),

      pool.request()
        .input("shift", sql.Int, shift)
        .input("start", sql.VarChar, startStr)
        .input("end", sql.VarChar, endStr)
        .query(kickOutQuery)
    ]);

    res.json({
      selected_date: selectedDate,
      shift,
      shift_start: startStr,
      shift_end: endStr,
      kick_in_count: kickInRes.recordset[0]?.kickInCount || 0,
      kick_out_count: kickOutRes.recordset[0]?.kickOutCount || 0,
    });


  } catch (err) {
    // console.error("❌ et_kickIOCounts Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.post('/cam_kickInEngines', async (req, res) => {
  try {
    const { shift, date: et_selectedDate } = req.body;

    if (!shift || !et_selectedDate) {
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

    const shiftMap = computeShiftForSelectedDate(shiftTimes, et_selectedDate);

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
      SELECT SERIAL_NO
      FROM [CAM_HOUSING].[dbo].[KICK_IN_OUT]
      WHERE SHIFT = @shift
        AND KICK_IN_FLAG = 1
        AND KICK_IN_DATE >= @start
        AND KICK_IN_DATE < @end
        AND (LOCK_STATUS IS NULL OR LOCK_STATUS <> 1)
      ORDER BY SERIAL_NO
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
      engines: result.recordset.map(r => r.SERIAL_NO)
    });

  } catch (error) {
    console.error("❌ et_kickInEngines Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.post('/cam_kickoutEngines', async (req, res) => {
  try {
    const { shift, date: et_selectedDate } = req.body;

    if (!shift || !et_selectedDate) {
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

    const shiftMap = computeShiftForSelectedDate(shiftTimes, et_selectedDate);

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
    SELECT SERIAL_NO
      FROM [CAM_HOUSING].[dbo].[KICK_IN_OUT]
      WHERE SHIFT = @shift
        AND KICK_OUT_FLAG = 1
        AND KICK_OUT_DATE >= @start
        AND KICK_OUT_DATE < @end
        AND (LOCK_STATUS IS NULL OR LOCK_STATUS <> 1)
      ORDER BY SERIAL_NO
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
      engines: result.recordset.map(r => r.SERIAL_NO)
    });

  } catch (error) {
    console.error("❌ et_kickoutEngines Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



router.post('/cam_shiftCounts', async (req, res) => {
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
      FROM [CAM_HOUSING].[dbo].[TIZZ350_ID_WRITING]
      WHERE SHIFT = @shift
        AND [PART_ENTRY_TIME] BETWEEN @start AND @end
    `;

    const shiftOutQuery = `
      SELECT COUNT(*) AS count
      FROM [CAM_HOUSING].[dbo].[CHS_RESULT]
      WHERE SHIFT = @shift
        AND [DATE_TIME] BETWEEN @start AND @end
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

router.post('/cam_newAbnormalCycleCount', async (req, res) => {
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

    const shiftMap = computeShiftForSelectedDate(shiftTimes, et_selectedDate);

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

    // console.log(`Abnormal Cycle Shift ${shift}: ${startStr} → ${endStr}`);

    const pool = await poolPromise;

   const query = `
   SELECT COUNT(DISTINCT SERIAL_NO) AS abnormalCount
      FROM [CAM_HOUSING].[dbo].[KICK_IN_OUT]
      WHERE SHIFT = @shift
      AND ISNULL(LOCK_STATUS,0) <> 1
        AND (
          (KICK_IN_FLAG = 1 AND KICK_IN_DATE >= @start AND KICK_IN_DATE < @end)
          OR
          (KICK_OUT_FLAG = 1 AND KICK_OUT_DATE >= @start AND KICK_OUT_DATE < @end)
        )
`;

    const result = await pool.request()
      .input("shift", sql.Int, parseInt(shift))
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

router.post('/cam_abnormalcycleEngines', async (req, res) => {
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
    if (shiftEnd <= shiftStart)
      shiftEnd.setDate(shiftEnd.getDate() + 1);

    const startStr = formatDateSQL(shiftStart);
    const endStr = formatDateSQL(shiftEnd);

    const pool = await poolPromise;

   const query = `
   SELECT DISTINCT SERIAL_NO
      FROM [CAM_HOUSING].[dbo].[KICK_IN_OUT]
      WHERE SHIFT = @shift
      AND ISNULL(LOCK_STATUS,0) <> 1
        AND (
          (KICK_IN_FLAG = 1 AND KICK_IN_DATE >= @start AND KICK_IN_DATE < @end)
          OR
          (KICK_OUT_FLAG = 1 AND KICK_OUT_DATE >= @start AND KICK_OUT_DATE < @end)
        )
      ORDER BY SERIAL_NO;
`;

    const result = await pool.request()
      .input("shift", sql.Int, parseInt(shift))
      .input("start", sql.VarChar, startStr)
      .input("end", sql.VarChar, endStr)
      .query(query);

    res.json({
      selected_date: selectedDate,
      shift,
      shift_start: startStr,
      shift_end: endStr,
      abnormal_count: result.recordset.length,
      engines: result.recordset.map(r => r.SERIAL_NO)
    });

  } catch (err) {
    console.error("❌ et_abnormalcycleEngines Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post('/camengine_number', async (req, res) => {
  try {
    const { serial_no } = req.body;
    if (!serial_no) return res.status(400).json({ error: "Missing serial number" });

    const pool = await poolPromise;
    const query = `
      SELECT SERIAL_NO, PART_ENTRY_TIME, ENGINE_CODE
      FROM [CAM_HOUSING].[dbo].[TIZZ350_ID_WRITING]
      WHERE SERIAL_NO = @serial_no;
    `;

    const result = await pool.request()
      .input('serial_no', sql.VarChar, serial_no)
      .query(query);

    if (result.recordset.length === 0) return res.status(404).json({ error: "Serial number not found" });

    const engine = result.recordset[0];

    
let stdDeviationTimes = [];

const engineCode = Number(engine.ENGINE_CODE);

const stdQuery = await pool.request().query(`
  SELECT 
    STATION_NAME,
    STD_TIME_1_5L,
    STD_TIME_2L
  FROM [CAM_HOUSING].[dbo].[LINE_STATUS]
`);

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
      engine_no: engine.SERIAL_NO,
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
      SELECT SERIAL_NO
      FROM [CAM_HOUSING].[dbo].[TIZZ350_ID_WRITING]
      ORDER BY SERIAL_NO
    `);
    const engines = result.recordset.map(r => r.SERIAL_NO);
    res.json(engines);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.post('/cam_kick_stations', async (req, res) => {
  try {
    const { serial_no } = req.body;

    if (!serial_no) {
      return res.status(400).json({ error: "Missing serial number" });
    }

    const pool = await poolPromise;

    // Get latest KICK_IN_STN and KICK_OUT_STN
    const stationResult = await pool.request()
      .input('serial_no', sql.VarChar, serial_no)
      .query(`
        SELECT TOP 1
          KICK_OUT_STN,
          KICK_IN_STN
        FROM [CAM_HOUSING].[dbo].[KICK_IN_OUT]
        WHERE SERIAL_NO = @serial_no
        ORDER BY ID DESC
      `);

    if (stationResult.recordset.length === 0) {
      return res.status(404).json({ error: "No station data found" });
    }

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
    // Loop over each process step
    for (const key of Object.keys(processMinutes)) {
      const table = tableMap[key];
      if (!table) continue;

      try {
        const tsResult = await pool.request()
          .input('serialNo', sql.VarChar, serial_no)
          .query(`
            SELECT TOP 1 
              PART_ENTRY_TIME AS TS
            FROM ${table}
            WHERE SERIAL_NO = @serialNo
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
      KICK_IN_STN: stationResult.recordset[0].KICK_IN_STN,
      KICK_OUT_STN: stationResult.recordset[0].KICK_OUT_STN,
      processMinutes
    });

  } catch (err) {
    console.error("❌ Error in /et_kick_stations:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const processMinutes = null;


router.get("/camkickengine-number/:serialNo", async (req, res) => {
  try {
    const pool = await poolPromise;
    const { serialNo } = req.params;

    const etResultQuery = `
     SELECT TOP 1
         ENGINE_CODE,
         SERIAL_NO,

         ROW_JUDGEMENT_1_1,
         ROW_JUDGEMENT_2_1,
         ROW_JUDGEMENT_3_1, ROW_JUDGEMENT_3_2, ROW_JUDGEMENT_3_3, ROW_JUDGEMENT_3_4, ROW_JUDGEMENT_3_5,
        
         ROW_JUDGEMENT_1_MAIN, ROW_JUDGEMENT_2_MAIN, ROW_JUDGEMENT_3_MAIN,
         ROW_JUDGEMENT_4_MAIN, ROW_JUDGEMENT_5_MAIN
       FROM [CAM_HOUSING].[dbo].[CHS_RESULT]
       ORDER BY DATE_TIME DESC, ID DESC
    `;

    const result = await pool.request()
      .input("serialNo", sql.VarChar, serialNo)
      .query(etResultQuery);

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
      engineNumber: row.SERIAL_NO,
      engineCode: row.ENGINE_CODE,

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

      processMinutes
    });

  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/camkickengine-details/:serialNo", async (req, res) => {
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

