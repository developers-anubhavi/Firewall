const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { sql, poolPromise } = require('../db');

const SHIFT_DIR = 'D:/Debug/';

function readShiftTimes() {
  const filePath = path.join(SHIFT_DIR, 'shifttime.txt');
  const fileContent = fs.readFileSync(filePath, 'utf8').trim();
  const lines = fileContent.split(/\r?\n/).map(line => line.trim()).filter(Boolean);

  if (lines.length < 3) throw new Error('shifttime.txt must contain 3 lines for 3 shifts.');

  const [first, second, third] = lines;
  return { first, second, third };
}

function parseShiftDate(baseDate, timeStr) {
  const [h, m, s] = timeStr.split(':').map(Number);
  const d = new Date(baseDate);
  d.setHours(h, m, s, 0);
  return d;
}

function getCurrentShift(shiftTimes) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const shift1Start = parseShiftDate(today, shiftTimes.first);
  const shift2Start = parseShiftDate(today, shiftTimes.second);
  const shift3Start = parseShiftDate(today, shiftTimes.third);
  const nextShift1Start = parseShiftDate(tomorrow, shiftTimes.first);

  let shiftNumber, shiftStart, shiftEnd;

  if (now >= shift1Start && now < shift2Start) {
    shiftNumber = 1;
    shiftStart = shift1Start;
    shiftEnd = new Date(shift2Start.getTime() - 1000);
  } else if (now >= shift2Start || now < shift3Start) {
    shiftNumber = 2;
    if (now >= shift2Start) {
      shiftStart = shift2Start;
      shiftEnd = new Date(shift3Start.getTime() + 24 * 60 * 60 * 1000 - 1000);
    } else {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      shiftStart = parseShiftDate(yesterday, shiftTimes.second);
      shiftEnd = new Date(shift3Start.getTime() - 1000);
    }
  } else {
    shiftNumber = 3;
    shiftStart = shift3Start;
    shiftEnd = new Date(shift1Start.getTime() - 1000);
  }

  return { shiftNumber, shiftStart, shiftEnd };
}

function formatDateTimeSQL(date) {
  const pad = n => n.toString().padStart(2, '0');
  const padMs = n => n.toString().padStart(3, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
         `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.` +
         `${padMs(date.getMilliseconds())}`;
}

function formatDateDisplay(date) {
  const pad = n => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
         `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}


router.get('/camshiftindata', async (req, res) => {
  try {
    const pool = await poolPromise;
    const shiftTimes = readShiftTimes();
    const { shiftNumber, shiftStart, shiftEnd } = getCurrentShift(shiftTimes);

    const now = new Date();
    const effectiveEnd = shiftEnd > now ? now : shiftEnd;

    const query = `
       SELECT COUNT(*) AS count
       FROM [CAM_HOUSING].[dbo].[TIZZ350_ID_WRITING]
       WHERE [PART_ENTRY_TIME] BETWEEN @start AND @end
     `;

    const result = await pool.request()
      .input('shift', sql.Int, shiftNumber)
      .input('start', sql.VarChar, formatDateTimeSQL(shiftStart))
      .input('end', sql.VarChar, formatDateTimeSQL(effectiveEnd))
      .query(query);

    const count = result.recordset[0].count || 0;

    res.json({
      shift: shiftNumber,
      start_time: formatDateDisplay(shiftStart),
      end_time: formatDateDisplay(shiftEnd),
      count
    });

  } catch (err) {
    console.error('❌ Error fetching shift IN data:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.get('/camshiftDataOut', async (req, res) => {
  try {
    const pool = await poolPromise;
    const shiftTimes = readShiftTimes();
    const { shiftNumber, shiftStart, shiftEnd } = getCurrentShift(shiftTimes);

    const now = new Date();
    const effectiveEnd = shiftEnd > now ? now : shiftEnd;

    const query = `
       SELECT COUNT(*) AS count
       FROM [CAM_HOUSING].[dbo].[CHS_RESULT]
       WHERE [DATE_TIME] BETWEEN @start AND @end
     `;
    const result = await pool.request()
      .input('shift', sql.Int, shiftNumber)
      .input('start', sql.VarChar, formatDateTimeSQL(shiftStart))
      .input('end', sql.VarChar, formatDateTimeSQL(effectiveEnd))
      .query(query);

    const count = result.recordset[0].count || 0;

    res.json({
      shift: shiftNumber,
      start_time: formatDateDisplay(shiftStart),
      end_time: formatDateDisplay(shiftEnd),
      count
    });

  } catch (err) {
    console.error('❌ Error fetching shift OUT data:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/cam_kickin', async (req, res) => {
  try {
    const pool = await poolPromise;
    const shiftTimes = readShiftTimes();
    const { shiftNumber, shiftStart, shiftEnd } = getCurrentShift(shiftTimes);

    const now = new Date();
    const effectiveEnd = shiftEnd > now ? now : shiftEnd;

    const query = `
        SELECT COUNT(*) AS kickInCount
      FROM [CAM_HOUSING].[dbo].[KICK_IN_OUT]
      WHERE SHIFT = @shift
        AND KICK_IN_FLAG = 1
        AND KICK_IN_DATE >= @start
        AND KICK_IN_DATE < @end
        AND (LOCK_STATUS IS NULL OR LOCK_STATUS <> 1)
     `;

    const result = await pool.request()
      .input('shift', sql.Int, shiftNumber)
      .input('start', sql.VarChar, formatDateTimeSQL(shiftStart))
      .input('end', sql.VarChar, formatDateTimeSQL(effectiveEnd))
      .query(query);

    const kickInCount = result.recordset[0].kickInCount || 0;

    res.json({
      shift: shiftNumber,
      start_time: formatDateDisplay(shiftStart),
      end_time: formatDateDisplay(shiftEnd),
      kickInCount
    });

  } catch (err) {
    console.error('❌ Error fetching kick-in count:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/cam_kickout', async (req, res) => {
  try {
    const pool = await poolPromise;
    const shiftTimes = readShiftTimes();
    const { shiftNumber, shiftStart, shiftEnd } = getCurrentShift(shiftTimes);

    const now = new Date();
    const effectiveEnd = shiftEnd > now ? now : shiftEnd;

    const query = `
      SELECT COUNT(*) AS kickOutCount
      FROM [CAM_HOUSING].[dbo].[KICK_IN_OUT]
      WHERE SHIFT = @shift
        AND KICK_OUT_FLAG = 1
        AND KICK_OUT_DATE >= @start
        AND KICK_OUT_DATE < @end
        AND (LOCK_STATUS IS NULL OR LOCK_STATUS <> 1)
     `;

    const result = await pool.request()
      .input('shift', sql.Int, shiftNumber)
      .input('start', sql.VarChar, formatDateTimeSQL(shiftStart))
      .input('end', sql.VarChar, formatDateTimeSQL(effectiveEnd))
      .query(query);

    const kickOutCount = result.recordset[0].kickOutCount || 0;

    res.json({
      shift: shiftNumber,
      start_time: formatDateDisplay(shiftStart),
      end_time: formatDateDisplay(shiftEnd),
      kickOutCount
    });

  } catch (err) {
    console.error('❌ Error fetching kick-out count:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/camabnormalCycleData', async (req, res) => {
  try {
    const pool = await poolPromise;
    const shiftTimes = readShiftTimes();
    const { shiftNumber, shiftStart, shiftEnd } = getCurrentShift(shiftTimes);

    const now = new Date();
    const effectiveEnd = shiftEnd > now ? now : shiftEnd;

    const query = `
      SELECT COUNT(SERIAL_NO) AS abnormalCount
      FROM [CAM_HOUSING].[dbo].[KICK_IN_OUT]
      WHERE (KICK_IN_FLAG = 1 OR KICK_OUT_FLAG = 1)
        AND ((KICK_IN_DATE >= @start AND KICK_IN_DATE < @end)
             OR (KICK_OUT_DATE >= @start AND KICK_OUT_DATE < @end))
             AND ISNULL(LOCK_STATUS,0) <> 1
     `;

    const result = await pool.request()
      .input('shift', sql.Int, shiftNumber)
      .input('start', sql.VarChar, formatDateTimeSQL(shiftStart))
      .input('end', sql.VarChar, formatDateTimeSQL(effectiveEnd))
      .query(query);

    const abnormalCount = result.recordset[0].abnormalCount || 0;

    res.json({
      shift: shiftNumber,
      start_time: formatDateDisplay(shiftStart),
      end_time: formatDateDisplay(shiftEnd),
      abnormalCount
    });

  } catch (err) {
    console.error('❌ Error fetching abnormal count:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

