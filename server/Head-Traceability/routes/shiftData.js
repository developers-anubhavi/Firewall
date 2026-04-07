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
    throw new Error('FIRST.txt must contain 3 lines: FIRST, SECOND, and THIRD shift start times.');
  }

  const [first, second, third] = lines;
  return { first, second, third };
}


function formatDateDisplay(date) {
  const pad = (n) => n.toString().padStart(2, '0');
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatDateSQL(date) {
  const pad = (n) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function getCurrentShift(shiftTimes) {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowDate = tomorrow.toISOString().split('T')[0];

  const shift1Start = new Date(`${today} ${shiftTimes.first}`);
  const shift2Start = new Date(`${today} ${shiftTimes.second}`);
  const shift3Start = new Date(`${today} ${shiftTimes.third}`);
  const nextDayShift1Start = new Date(`${tomorrowDate} ${shiftTimes.first}`);

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
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const yestDate = yesterday.toISOString().split('T')[0];
      shiftStart = new Date(`${yestDate} ${shiftTimes.second}`);
      shiftEnd = new Date(`${today} ${shiftTimes.third}`);
      shiftEnd.setSeconds(shiftEnd.getSeconds() - 1);
    }
  } else {
    shiftNumber = 3;
    shiftStart = shift3Start;
    shiftEnd = new Date(nextDayShift1Start.getTime() - 1000);
  }

  return { shiftNumber, shiftStart, shiftEnd };
}

router.get('/shiftData', async (req, res) => {
  try {
    const pool = await poolPromise;
    const shiftTimes = readShiftTimes();
    const { shiftNumber, shiftStart, shiftEnd } = getCurrentShift(shiftTimes);

    const startStr = formatDateDisplay(shiftStart);
    const endStr = formatDateDisplay(shiftEnd);

    const query = `
      SELECT COUNT(*) AS count
      FROM [HEAD_TRACEABILITY].[dbo].[ID_WRITING]
      WHERE SHIFT = @shift
      AND TRY_CONVERT(datetime, IN_STATION_TIME, 105)
        BETWEEN TRY_CONVERT(datetime, @start, 105)
        AND TRY_CONVERT(datetime, @end, 105)
    `;

    const result = await pool.request()
      .input('shift', sql.Int, shiftNumber)
      .input('start', sql.VarChar, startStr)
      .input('end', sql.VarChar, endStr)
      .query(query);

    const count = result.recordset[0].count || 0;

    res.json({
      shift: shiftNumber,
      start_time: startStr,
      end_time: endStr,
      count
    });
  } catch (error) {
    console.error('❌ Error in /shiftData:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/shiftDataOut', async (req, res) => {
  try {
    const pool = await poolPromise;

    const shiftTimes = readShiftTimes();
    const { shiftNumber, shiftStart, shiftEnd } = getCurrentShift(shiftTimes);

    const startStr = formatDateDisplay(shiftStart);
    const endStr = formatDateDisplay(shiftEnd);

    const query = `
      SELECT COUNT(*) AS count
      FROM [HEAD_TRACEABILITY].[dbo].[POKOYOKE_PANEL]
      WHERE SHIFT = @shift
        AND TRY_CONVERT(datetime, DATE_TIME, 105) 
          BETWEEN TRY_CONVERT(datetime, @start, 105)
          AND TRY_CONVERT(datetime, @end, 105)
    `;

    const result = await pool.request()
      .input('shift', sql.Int, shiftNumber)
      .input('start', sql.VarChar, startStr)
      .input('end', sql.VarChar, endStr)
      .query(query);

    const count = result.recordset[0].count || 0;

    res.json({
      shift: shiftNumber,
      start_time: startStr,
      end_time: endStr,
      count
    });
  } catch (error) {
    console.error('❌ Error in /shiftDataOut:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




router.get('/kickInOutData', async (req, res) => {
  try {
    const pool = await poolPromise;
    const shiftTimes = readShiftTimes();
    const { shiftNumber, shiftStart, shiftEnd } = getCurrentShift(shiftTimes);
    const startStr = formatDateSQL(shiftStart);
    const endStr = formatDateSQL(shiftEnd);

    const kickOutQuery = `
      SELECT COUNT(*) AS kickOutCount
      FROM [HEAD_TRACEABILITY].[dbo].[KICK_IN_OUT]
      WHERE SHIFT = @shift
      AND KICK_OUT_FLG = 1
      AND TRY_CONVERT(datetime, CONCAT([DATE], ' ', [TIME]), 105)
        BETWEEN TRY_CONVERT(datetime, @start, 120)
        AND TRY_CONVERT(datetime, @end, 120)
    `;

    const kickInQuery = `
      SELECT COUNT(*) AS kickInCount
      FROM [HEAD_TRACEABILITY].[dbo].[KICK_IN_OUT]
      WHERE KSHIFT = @shift
      AND KICK_IN_FLG = 1
      AND TRY_CONVERT(datetime, CONCAT([KDATE], ' ', [KTIME]), 105)
        BETWEEN TRY_CONVERT(datetime, @start, 120)
        AND TRY_CONVERT(datetime, @end, 120)
    `;

    const [kickOutRes, kickInRes] = await Promise.all([
      pool.request()
        .input('shift', sql.Int, shiftNumber)
        .input('start', sql.VarChar, startStr)
        .input('end', sql.VarChar, endStr)
        .query(kickOutQuery),
      pool.request()
        .input('shift', sql.Int, shiftNumber)
        .input('start', sql.VarChar, startStr)
        .input('end', sql.VarChar, endStr)
        .query(kickInQuery)
    ]);

    const kickOutCount = kickOutRes.recordset[0].kickOutCount || 0;
    const kickInCount = kickInRes.recordset[0].kickInCount || 0;

    res.json({
      shift: shiftNumber,
      start_time: startStr,
      end_time: endStr,
      kick_out_count: kickOutCount,
      kick_in_count: kickInCount
    });
  } catch (error) {
    console.error('❌ Error in /kickInOutData:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/abnormalCycleData', async (req, res) => {
  try {
    const pool = await poolPromise;
    const shiftTimes = readShiftTimes();
    const { shiftNumber, shiftStart, shiftEnd } = getCurrentShift(shiftTimes);

    const startStr = formatDateDisplay(shiftStart);
    const endStr = formatDateDisplay(shiftEnd);

    const query = `
      SELECT COUNT(*) AS abnormalCount
      FROM (
          SELECT ENGINE_NO
          FROM [HEAD_TRACEABILITY].[dbo].[KICK_IN_OUT]
          WHERE 
              (SHIFT = @shift AND TRY_CONVERT(datetime, CONCAT([DATE], ' ', [TIME]), 105) 
                   BETWEEN TRY_CONVERT(datetime, @start, 105) AND TRY_CONVERT(datetime, @end, 105) 
                   AND KICK_OUT_FLG = 1)
              OR
              (KSHIFT = @shift AND TRY_CONVERT(datetime, CONCAT([KDATE], ' ', [KTIME]), 105) 
                   BETWEEN TRY_CONVERT(datetime, @start, 105) AND TRY_CONVERT(datetime, @end, 105) 
                   AND KICK_IN_FLG = 1)
          GROUP BY ENGINE_NO
      ) AS t
    `;

    const result = await pool.request()
      .input('shift', sql.Int, shiftNumber)
      .input('start', sql.VarChar, startStr)
      .input('end', sql.VarChar, endStr)
      .query(query);

    const abnormalCount = result.recordset[0].abnormalCount || 0;

    res.json({
      shift: shiftNumber,
      start_time: startStr,
      end_time: endStr,
      abnormal_count: abnormalCount
    });

  } catch (error) {
    console.error('❌ Error in /abnormalCycleData:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


function getShiftDateRange(dateStr, shiftTimes, shift) {
  const dateParts = dateStr.split('-');
  const year = parseInt(dateParts[2], 10);
  const month = parseInt(dateParts[1], 10) - 1;
  const day = parseInt(dateParts[0], 10);

  const today = new Date(year, month, day);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  let shiftStart, shiftEnd;

  if (shift === 1) {
    shiftStart = new Date(`${dateStr} ${shiftTimes.first}`);
    shiftEnd = new Date(`${dateStr} ${shiftTimes.second}`);
    shiftEnd.setSeconds(shiftEnd.getSeconds() - 1);
  } else if (shift === 2) {
    shiftStart = new Date(`${dateStr} ${shiftTimes.second}`);
    shiftEnd = new Date(`${dateStr} ${shiftTimes.third}`);
    shiftEnd.setSeconds(shiftEnd.getSeconds() - 1);
  } else if (shift === 3) {
    shiftStart = new Date(`${dateStr} ${shiftTimes.third}`);
    shiftEnd = new Date(`${tomorrow.getDate()}-${tomorrow.getMonth()+1}-${tomorrow.getFullYear()} ${shiftTimes.first}`);
    shiftEnd.setSeconds(shiftEnd.getSeconds() - 1);
  } else {
    throw new Error('Invalid shift number');
  }

  return { shiftStart, shiftEnd };
}

function formatDateTimeLocal(date) {
  const pad = (n) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

router.post('/kickInEngines', async (req, res) => {
  try {
    const { shift, date } = req.body;

    const shiftTimes = readShiftTimes();
    const { shiftStart, shiftEnd } = getShiftDateRange(date, shiftTimes, shift);

    const startStr = formatDateTimeLocal(shiftStart);
    const endStr   = formatDateTimeLocal(shiftEnd);

    const pool = await poolPromise;

    const engineQuery = `
      SELECT DISTINCT ENGINE_NO
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

    res.json({ shift, engines: result.recordset.map(r => r.ENGINE_NO) });

  } catch (error) {
    console.error("❌ Error in /kickInEngines:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post('/kickoutEngines', async (req, res) => {
  try {
    const { shift, date } = req.body;

    const shiftTimes = readShiftTimes();
    const { shiftStart, shiftEnd } = getShiftDateRange(date, shiftTimes, shift);

    const startStr = formatDateTimeLocal(shiftStart);
    const endStr   = formatDateTimeLocal(shiftEnd);

    const pool = await poolPromise;

    const engineQuery = `
      SELECT DISTINCT ENGINE_NO
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

    res.json({ shift, engines: result.recordset.map(r => r.ENGINE_NO) });

  } catch (error) {
    console.error("❌ Error in /kickoutEngines:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

function convertToDDMMYYYY(dateStr) {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-");
  return `${day}-${month}-${year}`;
}


router.post('/newAbnormalCycleCount', async (req, res) => {
  try {
    const pool = await poolPromise;
    const { date, shift } = req.body;
    if (!date || !shift) {
      return res.status(400).json({ error: "Date and shift are required" });
    }

    const shiftTimes = readShiftTimes();
    const { shiftStart, shiftEnd } = getShiftDateRange(date, shiftTimes, shift);

    const startStr = formatDateSQL(shiftStart);
    const endStr   = formatDateSQL(shiftEnd);

    const query = `
      SELECT COUNT(*) AS abnormalCount
      FROM (
          SELECT ENGINE_NO
          FROM [HEAD_TRACEABILITY].[dbo].[KICK_IN_OUT]
          WHERE 
              (SHIFT = @shift AND KICK_OUT_FLG = 1
               AND TRY_CONVERT(datetime, CONCAT([DATE], ' ', [TIME]), 105)
                   BETWEEN TRY_CONVERT(datetime, @start, 120)
                   AND TRY_CONVERT(datetime, @end, 120))
           OR
              (KSHIFT = @shift AND KICK_IN_FLG = 1
               AND TRY_CONVERT(datetime, CONCAT([KDATE], ' ', [KTIME]), 105)
                   BETWEEN TRY_CONVERT(datetime, @start, 120)
                   AND TRY_CONVERT(datetime, @end, 120))
          GROUP BY ENGINE_NO
      ) AS t;
    `;

    const result = await pool.request()
      .input("shift", sql.Int, shift)
      .input("start", sql.VarChar, startStr)
      .input("end", sql.VarChar, endStr)
      .query(query);

    res.json({
      abnormal_count: result.recordset[0]?.abnormalCount || 0
    });

  } catch (error) {
    console.error("❌ Error in /newAbnormalCycleCount:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post('/abnormalcycleEngines', async (req, res) => {
  try {
    const pool = await poolPromise;
    const { date, shift } = req.body;

    if (!date || !shift) {
      return res.status(400).json({ error: "Date and shift are required" });
    }

    const shiftTimes = readShiftTimes();
    const { shiftStart, shiftEnd } = getShiftDateRange(date, shiftTimes, shift);

    const startStr = formatDateSQL(shiftStart);
    const endStr   = formatDateSQL(shiftEnd);

    const query = `
      SELECT DISTINCT ENGINE_NO
      FROM [HEAD_TRACEABILITY].[dbo].[KICK_IN_OUT]
      WHERE 
          (SHIFT = @shift AND KICK_OUT_FLG = 1 
           AND TRY_CONVERT(datetime, CONCAT([DATE], ' ', [TIME]), 105) 
               BETWEEN TRY_CONVERT(datetime, @start, 120) 
               AND TRY_CONVERT(datetime, @end, 120))
       OR
          (KSHIFT = @shift AND KICK_IN_FLG = 1 
           AND TRY_CONVERT(datetime, CONCAT([KDATE], ' ', [KTIME]), 105) 
               BETWEEN TRY_CONVERT(datetime, @start, 120) 
               AND TRY_CONVERT(datetime, @end, 120))
    `;

    const result = await pool.request()
      .input("shift", sql.Int, shift)
      .input("start", sql.VarChar, startStr)
      .input("end", sql.VarChar, endStr)
      .query(query);

    res.json({
      engines: result.recordset.map(r => r.ENGINE_NO)
    });

  } catch (error) {
    console.error("❌ Error in /abnormalcycleEngines:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post('/engine-number', async (req, res) => {
  try {
    const { engineNumber, type } = req.body;
    if (!engineNumber) {
      return res.status(400).json({ message: 'engineNumber is required' });
    }

    const pool = await poolPromise;
    let query = '';
    if (type === 'kickin') {
      query = `
        SELECT ENGINE_NO, KDATE AS dateCol, KTIME AS timeCol
        FROM [HEAD_TRACEABILITY].[dbo].[KICK_IN_OUT]
        WHERE ENGINE_NO = @engineNo AND KICK_IN_FLG = 1
      `;
    } else if (type === 'kickout') {
      query = `
        SELECT ENGINE_NO, DATE AS dateCol, TIME AS timeCol
        FROM [HEAD_TRACEABILITY].[dbo].[KICK_IN_OUT]
        WHERE ENGINE_NO = @engineNo AND KICK_OUT_FLG = 1
      `;
    } else {
      return res.status(400).json({ message: 'type must be kickin or kickout' });
    }

    const result = await pool.request()
      .input('engineNo', sql.VarChar, engineNumber)
      .query(query);

    if (!result.recordset.length) {
      return res.status(404).json({ message: 'Engine not found' });
    }

    const engine = result.recordset[0];
    engine.initialDateTime = engine.dateCol && engine.timeCol ? `${engine.dateCol} ${engine.timeCol}` : '';

    res.json({ engineData: engine });
  } catch (error) {
    console.error('❌ Error in /engine-number:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/engine-number', async (req, res) => {
  try {
    const { engineNumber, type } = req.body;
    if (!engineNumber) {
      return res.status(400).json({ message: 'engineNumber is required' });
    }

    const pool = await poolPromise;
    let query = '';
    if (type === 'kickin') {
      query = `
        SELECT ENGINE_NO, KDATE AS dateCol, KTIME AS timeCol
        FROM [HEAD_TRACEABILITY].[dbo].[KICK_IN_OUT]
        WHERE ENGINE_NO = @engineNo AND KICK_IN_FLG = 1
      `;
    } else if (type === 'kickout') {
      query = `
        SELECT ENGINE_NO, DATE AS dateCol, TIME AS timeCol
        FROM [HEAD_TRACEABILITY].[dbo].[KICK_IN_OUT]
        WHERE ENGINE_NO = @engineNo AND KICK_OUT_FLG = 1
      `;
    } else {
      return res.status(400).json({ message: 'type must be kickin or kickout' });
    }

    const result = await pool.request()
      .input('engineNo', sql.VarChar, engineNumber)
      .query(query);

    if (!result.recordset.length) {
      return res.status(404).json({ message: 'Engine not found' });
    }

    const engine = result.recordset[0];
    engine.initialDateTime = engine.dateCol && engine.timeCol ? `${engine.dateCol} ${engine.timeCol}` : '';

    res.json({ engineData: engine });
  } catch (error) {
    console.error('❌ Error in /engine-number:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get("/engine-number2", async (req, res) => {
  try {
    const selectedEngine = req.query.engineNo;
    if (!selectedEngine) return res.status(400).json({ error: "Missing engine number" });

    const pool = await poolPromise;

    const panelQuery = `
      SELECT TOP 1 ENGINE_NO, DATE_TIME, SHIFT
      FROM POKOYOKE_PANEL
      WHERE ENGINE_NO = @engineNo
      ORDER BY ID DESC
    `;
    const panelDataResult = await pool.request()
      .input("engineNo", sql.VarChar, selectedEngine)
      .query(panelQuery);
    const panelData = panelDataResult.recordset[0] || {};

    const codeResult = await pool.request()
      .input("engineNo", sql.VarChar, selectedEngine)
      .query(`
        SELECT TOP 1 ENGINE_CODE
        FROM ID_WRITING
        WHERE ENGINE_NO = @engineNo
        ORDER BY ID DESC
      `);
    const engineCode = codeResult.recordset[0] ? codeResult.recordset[0].ENGINE_CODE : null;

    const processTables = [
      "STEM_OIL_ASSEMBLY",
      "STEM_OIL_INSP",
      "COTTER_RETAINER_ASSEMBLY",
      "COTTER_RETAINER_INSP",
      "PLUG_TUBE_PRESS",
      "SPARK_PLUG_TIGHT",
      "PORT_LEAK_TESTER",
      "FUEL_LEAK_TESTER"
    ];

    const fetchProcessData = async (tableName) => {
      const result = await pool.request()
        .input("engineNo", sql.VarChar, selectedEngine)
        .query(`
          SELECT TOP 1 TIME_DEV, RESULT1, RESULT2, RESULT3, RESULT4
          FROM ${tableName}
          WHERE ENGINE_NO = @engineNo
          ORDER BY ID DESC
        `);
      return result.recordset[0] || { TIME_DEV: null, RESULT1: null, RESULT2: null, RESULT3: null, RESULT4: null };
    };

    const processData = await Promise.all(processTables.map(fetchProcessData));
    const kickResult = await pool.request()
      .input("engineNo", sql.VarChar, selectedEngine)
      .query(`
        SELECT TOP 1 KICK_IN_STN, KICK_OUT_STN
        FROM KICK_IN_OUT
        WHERE ENGINE_NO = @engineNo
        ORDER BY ID DESC
      `);
    const kickData = kickResult.recordset[0] || { KICK_IN_STN: null, KICK_OUT_STN: null };

    let timeDevLimits = [];
    try {
      const fileContent = fs.readFileSync("D:/Debug/DevTime.txt", "utf-8");
      timeDevLimits = fileContent.split(/\r?\n/).map(val => parseFloat(val.trim())).filter(val => !isNaN(val));
      while (timeDevLimits.length < 9) timeDevLimits.push(0);
    } catch (err) {
      console.error("Error reading TIMEDEV.txt:", err);
    }

    const addColorFlag = (actual, limit) => {
      if (actual == null) return "gray";
      return actual > limit ? "red" : "palegreen";
    };

let processMinutes = {
  ID_WRITING: null,
  STEM_OIL_ASSEMBLY: null,
  STEM_OIL_INSP: null,
  COTTER_RETAINER_ASSEMBLY: null,
  COTTER_RETAINER_INSP: null,
  PLUG_TUBE_PRESS: null,
  SPARK_PLUG_TIGHT: null,
  PORT_LEAK_TESTER: null,
  FUEL_LEAK_TESTER: null,
  END_CAP_VISION: null
};


const idTime = await pool.request()
  .input("engineNo", sql.VarChar, selectedEngine)
  .query(`
    SELECT TOP 1 IN_STATION_TIME AS TS
    FROM ID_WRITING
    WHERE ENGINE_NO = @engineNo
    ORDER BY ID DESC
  `);

processMinutes.ID_WRITING = idTime.recordset[0]?.TS || null;
const engineData = {
  engineNumber: selectedEngine,
  engineCode,
  initialDateTime: processMinutes.ID_WRITING, 
  shift: panelData.SHIFT || null,
  KICK_IN_STN: kickData.KICK_IN_STN,
  KICK_OUT_STN: kickData.KICK_OUT_STN,
  timeDevColors: processData.map((p, idx) => addColorFlag(p.TIME_DEV, timeDevLimits[idx])),
  processMinutes
};

    processData.forEach((p, idx) => {
      const n = idx + 1;
      engineData[`kick_io_timeDev${n}`] = p.TIME_DEV;
      engineData[`kick_io_result${n}_1`] = p.RESULT1;
      engineData[`kick_io_result${n}_2`] = p.RESULT2;
      engineData[`kick_io_result${n}_3`] = p.RESULT3;
      engineData[`kick_io_result${n}_4`] = p.RESULT4;
    });

const endCap = await pool.request()
  .input("engineNo", sql.VarChar, selectedEngine)
  .query(`
    SELECT TOP 1 IN_STATION_TIME AS TS
    FROM END_CAP_VISION
    WHERE ENGINE_NO = @engineNo
    ORDER BY ID DESC
  `);
processMinutes.END_CAP_VISION = endCap.recordset[0]?.TS || null;

engineData.processMinutes = processMinutes;

const timestampQueries = [
  "STEM_OIL_ASSEMBLY",
  "STEM_OIL_INSP",
  "COTTER_RETAINER_ASSEMBLY",
  "COTTER_RETAINER_INSP",
  "PLUG_TUBE_PRESS",
  "SPARK_PLUG_TIGHT",
  "PORT_LEAK_TESTER",
  "FUEL_LEAK_TESTER"
];

for (let i = 0; i < timestampQueries.length; i++) {
  const table = timestampQueries[i];
  const tsResult = await pool.request()
    .input("engineNo", sql.VarChar, selectedEngine)
    .query(`
      SELECT TOP 1 IN_STATION_TIME AS TS
      FROM ${table}
      WHERE ENGINE_NO = @engineNo
      ORDER BY ID DESC
    `);

  processMinutes[table] = tsResult.recordset[0]?.TS || null;
}

const tsTables = ["ID_WRITING", "END_CAP_VISION", ...processTables];
    for (let table of tsTables) {
      const tsResult = await pool.request()
        .input("engineNo", sql.VarChar, selectedEngine)
        .query(`
          SELECT TOP 1 IN_STATION_TIME AS TS
          FROM ${table}
          WHERE ENGINE_NO = @engineNo
          ORDER BY ID DESC
        `);
      const key = table === "END_CAP_VISION" ? "END_CAP_VISION" : table;
      processMinutes[key] = tsResult.recordset[0]?.TS || null;
    }
    engineData.processMinutes = processMinutes;

   const stdResult = await pool.request().query(`
  SELECT STATION_NAME, STD_TIME_1_5L, STD_TIME_2L
  FROM LINE_STATUS
`);
const stdRows = stdResult.recordset;

const stationOrder = [
  "STEM_OIL_ASSEMBLY",
  "STEM_OIL_INSP",
  "COTTER_RETAINER_ASSEMBLY",
  "COTTER_RETAINER_INSP",
  "PLUG_TUBE_PRESS",
  "SPARK_PLUG_TIGHT",
  "PORT_LEAK_TESTER",
  "FUEL_LEAK_TESTER"
];

const stdMap = {};
stdRows.forEach(row => {
  stdMap[row.STATION_NAME] = row;
});

let stdValues = stationOrder.map(station => {
  const row = stdMap[station];
  if (!row) return 0;

  if (engineCode === "001" || engineCode === "002") {
  return row.STD_TIME_2L;
} else if (engineCode === "012") {
  return row.STD_TIME_1_5L;
}

  return 0;
});

// keep compatibility with old structure
stdValues.push(0);

stdValues.forEach((val, idx) => {
  engineData[`kick_io_timestd${idx + 1}`] = val;
});

// preserve your existing flag
if (engineCode === "012") {
  engineData.qualityData4Gray = true;
}

let last4 = null;
if (selectedEngine) {
  const str = String(selectedEngine).trim();
  if (str.length >= 4) {
    last4 = str.slice(-4); 
  } else {
    last4 = str;
  }
}

engineData.last4digits = last4;

    res.json(engineData);

  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/head_all_engines", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT TOP (1000) [ENGINE_NO]
      FROM [HEAD_TRACEABILITY].[dbo].[ID_WRITING]
      ORDER BY [ID] DESC
    `);

    const engines = result.recordset.map(row => row.ENGINE_NO);

    res.json(engines); 
  } catch (err) {
    console.error("Error fetching engines:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;
