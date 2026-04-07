const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { sql, poolPromise } = require('../db');

const SHIFT_DIR = 'D:/Debug/';

function readShiftTimes() {
  const filePath = path.join(SHIFT_DIR, 'shifttime.txt');
  const fileContent = fs.readFileSync(filePath, 'utf8').trim();

  const lines = fileContent
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  if (lines.length < 3) {
    throw new Error('FIRST.txt must contain 3 lines.');
  }

  const [first, second, third] = lines;
  return { first, second, third };
}

function formatDateSQL(date) {
  const pad = (n) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function computeShiftForSelectedDate(shiftTimes, selectedDate) {
  const [yyyy, mm, dd] = selectedDate.split('-');
  const dateObj = new Date(`${selectedDate}T00:00:00`);
  const nextDateObj = new Date(dateObj);
  nextDateObj.setDate(dateObj.getDate() + 1);

  const shift1Start = new Date(`${selectedDate} ${shiftTimes.first}`);
  const shift2Start = new Date(`${selectedDate} ${shiftTimes.second}`);
  const shift3Start = new Date(`${selectedDate} ${shiftTimes.third}`);
  const nextDayShift1Start = new Date(
    `${nextDateObj.toISOString().split('T')[0]} ${shiftTimes.first}`
  );

  return {
    1: { start: shift1Start, end: new Date(shift2Start.getTime() - 1000) },
    2: { start: shift2Start, end: new Date(shift3Start.getTime() - 1000) },
    3: { start: shift3Start, end: new Date(nextDayShift1Start.getTime() - 1000) },
  };
}


router.post('/kickIOCounts', async (req, res) => {
  try {
    const { date: selectedDate, shift } = req.body;

    if (!selectedDate || !shift) {
      return res.status(400).json({ error: "Missing date or shift" });
    }

    const shiftTimes = readShiftTimes();
    const shiftMap = computeShiftForSelectedDate(shiftTimes, selectedDate);

    if (!shiftMap[shift]) {
      return res.status(400).json({ error: "Invalid shift" });
    }

    let shiftStart = new Date(shiftMap[shift].start);
    let shiftEnd = new Date(shiftMap[shift].end);

    if (shiftEnd <= shiftStart) {
      shiftEnd.setDate(shiftEnd.getDate() + 1);
    }

    const startStr = formatDateSQL(shiftStart);
    const endStr = formatDateSQL(shiftEnd);

    const pool = await poolPromise;

    const kickInQuery = `
SELECT COUNT(DISTINCT ENGINE_NO) AS kickInCount
FROM [HEAD_TRACEABILITY].[dbo].[KICK_IN_OUT]
WHERE KSHIFT = @shift
  AND KICK_IN_FLG = 1
  AND TRY_CONVERT(datetime, CONCAT(KDATE, ' ', KTIME), 105)
        BETWEEN TRY_CONVERT(datetime, @start, 120)
        AND TRY_CONVERT(datetime, @end, 120)

    `;

    const kickOutQuery = `
SELECT COUNT(DISTINCT ENGINE_NO) AS kickOutCount
FROM [HEAD_TRACEABILITY].[dbo].[KICK_IN_OUT]
WHERE SHIFT = @shift
  AND KICK_OUT_FLG = 1
  AND TRY_CONVERT(datetime, CONCAT(DATE, ' ', TIME), 105)
        BETWEEN TRY_CONVERT(datetime, @start, 120)
        AND TRY_CONVERT(datetime, @end, 120);

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
      kick_in_count: kickInRes.recordset[0]?.kickInCount ?? 0,
      kick_out_count: kickOutRes.recordset[0]?.kickOutCount ?? 0,
    });

  } catch (err) {
    // console.error("❌ KickIO Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post('/kickInEngines', async (req, res) => {
  try {
    const { shift, date: selectedDate } = req.body; 

    if (!shift || !selectedDate) {
      return res.status(400).json({ error: "Missing date or shift" });
    }

    const shiftTimes = readShiftTimes();
    const shiftMap = computeShiftForSelectedDate(shiftTimes, selectedDate);

    if (!shiftMap[shift]) {
      return res.status(400).json({ error: "Invalid shift" });
    }

    let shiftStart = new Date(shiftMap[shift].start);
    let shiftEnd = new Date(shiftMap[shift].end);

    if (shiftEnd <= shiftStart) {
      shiftEnd.setDate(shiftEnd.getDate() + 1);
    }

    const startStr = formatDateSQL(shiftStart);
    const endStr = formatDateSQL(shiftEnd);

    const pool = await poolPromise;

    const engineQuery = `
      SELECT ENGINE_NO
      FROM [HEAD_TRACEABILITY].[dbo].[KICK_IN_OUT]
      WHERE KSHIFT = @shift
        AND KICK_IN_FLG = 1
        AND TRY_CONVERT(datetime, CONCAT(KDATE, ' ', KTIME), 105)
            BETWEEN TRY_CONVERT(datetime, @start, 120)
            AND TRY_CONVERT(datetime, @end, 120)
      ORDER BY ENGINE_NO
    `;

    const result = await pool.request()
      .input('shift', sql.Int, shift)
      .input('start', sql.VarChar, startStr)
      .input('end', sql.VarChar, endStr)
      .query(engineQuery);

    res.json({
      selected_date: selectedDate,
      shift,
      shift_start: startStr,
      shift_end: endStr,
      engines: result.recordset.map(r => r.ENGINE_NO)
    });

  } catch (error) {
    // console.error("❌ Error in /kickInEngines:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post('/kickoutEngines', async (req, res) => {
  try {
    const { shift, date: selectedDate } = req.body;

    if (!shift || !selectedDate) {
      return res.status(400).json({ error: "Missing date or shift" });
    }

    const shiftTimes = readShiftTimes();
    const shiftMap = computeShiftForSelectedDate(shiftTimes, selectedDate);

    if (!shiftMap[shift]) {
      return res.status(400).json({ error: "Invalid shift" });
    }

    let shiftStart = new Date(shiftMap[shift].start);
    let shiftEnd = new Date(shiftMap[shift].end);

    if (shiftEnd <= shiftStart) {
      shiftEnd.setDate(shiftEnd.getDate() + 1);
    }

    const startStr = formatDateSQL(shiftStart);
    const endStr = formatDateSQL(shiftEnd);

    const pool = await poolPromise;

    const engineQuery = `
      SELECT ENGINE_NO
      FROM [HEAD_TRACEABILITY].[dbo].[KICK_IN_OUT]
      WHERE SHIFT = @shift
        AND KICK_OUT_FLG = 1
        AND TRY_CONVERT(datetime, CONCAT(DATE, ' ', TIME), 105)
            BETWEEN TRY_CONVERT(datetime, @start, 120)
            AND TRY_CONVERT(datetime, @end, 120)
      ORDER BY ENGINE_NO
    `;

    const result = await pool.request()
      .input('shift', sql.Int, shift)
      .input('start', sql.VarChar, startStr)
      .input('end', sql.VarChar, endStr)
      .query(engineQuery);

    res.json({
      selected_date: selectedDate,
      shift,
      shift_start: startStr,
      shift_end: endStr,
      engines: result.recordset.map(r => r.ENGINE_NO)
    });

  } catch (error) {
    // console.error("❌ Error in /kickoutEngines:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post('/shiftCounts', async (req, res) => {
  try {
    const { date: selectedDate, shift } = req.body;

    if (!selectedDate || !shift) {
      return res.status(400).json({ error: "Missing date or shift" });
    }

    const shiftTimes = readShiftTimes();
    const shiftMap = computeShiftForSelectedDate(shiftTimes, selectedDate);

    if (!shiftMap[shift]) {
      return res.status(400).json({ error: "Invalid shift" });
    }

    let shiftStart = new Date(shiftMap[shift].start);
    let shiftEnd = new Date(shiftMap[shift].end);

    if (shiftEnd <= shiftStart) {
      shiftEnd.setDate(shiftEnd.getDate() + 1);
    }

    const startStr = formatDateSQL(shiftStart);
    const endStr = formatDateSQL(shiftEnd);

    const pool = await poolPromise;

    const shiftInQuery = `
      SELECT COUNT(*) AS shiftInCount
      FROM [HEAD_TRACEABILITY].[dbo].[ID_WRITING]
      WHERE SHIFT = @shift
        AND TRY_CONVERT(datetime, IN_STATION_TIME, 105)
            BETWEEN TRY_CONVERT(datetime, @start, 120)
            AND TRY_CONVERT(datetime, @end, 120)
    `;

    const shiftOutQuery = `
      SELECT COUNT(*) AS shiftOutCount
      FROM [HEAD_TRACEABILITY].[dbo].[POKOYOKE_PANEL]
      WHERE SHIFT = @shift
        AND TRY_CONVERT(datetime, DATE_TIME, 105)
            BETWEEN TRY_CONVERT(datetime, @start, 120)
            AND TRY_CONVERT(datetime, @end, 120)
    `;

    const [shiftInRes, shiftOutRes] = await Promise.all([
      pool.request()
        .input("shift", sql.Int, shift)
        .input("start", sql.VarChar, startStr)
        .input("end", sql.VarChar, endStr)
        .query(shiftInQuery),

      pool.request()
        .input("shift", sql.Int, shift)
        .input("start", sql.VarChar, startStr)
        .input("end", sql.VarChar, endStr)
        .query(shiftOutQuery)
    ]);

    res.json({
      selected_date: selectedDate,
      shift,
      shift_start: startStr,
      shift_end: endStr,
      shift_in_count: shiftInRes.recordset[0]?.shiftInCount ?? 0,
      shift_out_count: shiftOutRes.recordset[0]?.shiftOutCount ?? 0,
    });

  } catch (err) {
    // console.error("❌ ShiftCounts Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post('/newAbnormalCycleCount', async (req, res) => {
  try {
    const { date: selectedDate, shift } = req.body;

    if (!selectedDate || !shift) {
      return res.status(400).json({ error: "Missing date or shift" });
    }

    const shiftTimes = readShiftTimes();
    const shiftMap = computeShiftForSelectedDate(shiftTimes, selectedDate);

    if (!shiftMap[shift]) {
      return res.status(400).json({ error: "Invalid shift" });
    }

    let shiftStart = new Date(shiftMap[shift].start);
    let shiftEnd = new Date(shiftMap[shift].end);

    if (shiftEnd <= shiftStart) {
      shiftEnd.setDate(shiftEnd.getDate() + 1);
    }

    const startStr = formatDateSQL(shiftStart);
    const endStr = formatDateSQL(shiftEnd);

    const pool = await poolPromise;

    const query = `
      SELECT COUNT(*) AS abnormalCount
      FROM (
          SELECT ENGINE_NO
          FROM [HEAD_TRACEABILITY].[dbo].[KICK_IN_OUT]
          WHERE 
              (SHIFT = @shift AND KICK_OUT_FLG = 1 
               AND TRY_CONVERT(datetime, CONCAT(DATE, ' ', TIME), 105)
                   BETWEEN TRY_CONVERT(datetime, @start, 120)
                   AND TRY_CONVERT(datetime, @end, 120))
           OR
              (KSHIFT = @shift AND KICK_IN_FLG = 1
               AND TRY_CONVERT(datetime, CONCAT(KDATE, ' ', KTIME), 105)
                   BETWEEN TRY_CONVERT(datetime, @start, 120)
                   AND TRY_CONVERT(datetime, @end, 120))
          GROUP BY ENGINE_NO
      ) AS t
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
      abnormal_count: result.recordset[0]?.abnormalCount ?? 0
    });

  } catch (err) {
    // console.error("❌ newAbnormalCycleCount Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post('/abnormalcycleEngines', async (req, res) => {
  try {
    const { date: selectedDate, shift } = req.body;

    if (!selectedDate || !shift) {
      return res.status(400).json({ error: "Missing date or shift" });
    }

    const shiftTimes = readShiftTimes();
    const shiftMap = computeShiftForSelectedDate(shiftTimes, selectedDate);

    if (!shiftMap[shift]) {
      return res.status(400).json({ error: "Invalid shift" });
    }

    let shiftStart = new Date(shiftMap[shift].start);
    let shiftEnd = new Date(shiftMap[shift].end);

    if (shiftEnd <= shiftStart) {
      shiftEnd.setDate(shiftEnd.getDate() + 1);
    }

    const startStr = formatDateSQL(shiftStart);
    const endStr = formatDateSQL(shiftEnd);

    const pool = await poolPromise;

    const query = `
      SELECT DISTINCT ENGINE_NO
      FROM [HEAD_TRACEABILITY].[dbo].[KICK_IN_OUT]
      WHERE 
          (SHIFT = @shift AND KICK_OUT_FLG = 1 
           AND TRY_CONVERT(datetime, CONCAT(DATE, ' ', TIME), 105)
               BETWEEN TRY_CONVERT(datetime, @start, 120)
               AND TRY_CONVERT(datetime, @end, 120))
       OR
          (KSHIFT = @shift AND KICK_IN_FLG = 1 
           AND TRY_CONVERT(datetime, CONCAT(KDATE, ' ', KTIME), 105)
               BETWEEN TRY_CONVERT(datetime, @start, 120)
               AND TRY_CONVERT(datetime, @end, 120))
      ORDER BY ENGINE_NO
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
      engines: result.recordset.map(r => r.ENGINE_NO)
    });

  } catch (err) {
    // console.error("❌ abnormalcycleEngines Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



module.exports = router;

