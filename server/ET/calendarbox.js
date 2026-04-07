const express = require('express');
const router = express.Router();
const db = require('../ET/db'); 


router.get('/etcalendar', async (req, res) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ error: 'year and month are required' });
    }

    const pool = await db.poolPromise;
    const request = pool.request();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    request.input('startDate', db.sql.DateTime2, startDate);
    request.input('endDate', db.sql.DateTime2, endDate);

    const query = `
SELECT DISTINCT CONVERT(varchar(10), kickDate, 23) AS DATE
FROM (
    
    SELECT [KICK_IN_DATE] AS kickDate
    FROM [ENGINE_TESTING].[dbo].[KICK_IN_OUT]
    WHERE [KICK_IN_DATE] >= @startDate
      AND [KICK_IN_DATE] < @endDate

    UNION ALL

    SELECT [KICK_OUT_DATE] AS kickDate
    FROM [ENGINE_TESTING].[dbo].[KICK_IN_OUT]
    WHERE [KICK_OUT_DATE] >= @startDate
      AND [KICK_OUT_DATE] < @endDate

) AS combinedDates
ORDER BY DATE;
    `;

    const result = await request.query(query);
    res.json(result.recordset);

  } catch (err) {
    console.error('Error fetching calendar data:', err);
    res.status(500).json({ error: 'Failed to fetch calendar data' });
  }
});


router.get('/etcalendar_shiftCounts', async (req, res) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ error: 'year and month are required' });
    }

    const pool = await db.poolPromise;
    const request = pool.request();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    request.input('startDate', db.sql.DateTime2, startDate);
    request.input('endDate', db.sql.DateTime2, endDate);

    const query = `
SELECT DISTINCT
    CONVERT(varchar(10), r.[DATE_TIME], 23) AS DATE,
    w.[PART_ENTRY_TIME]
FROM [ENGINE_TESTING].[dbo].[ET_RESULT] r
LEFT JOIN [ENGINE_TESTING].[dbo].[TIZZ358_IDWRITER] w
    ON r.ENGINE_NO = w.ENGINE_NO
WHERE r.[DATE_TIME] >= @startDate
  AND r.[DATE_TIME] < @endDate
ORDER BY DATE;
    `;

    const result = await request.query(query);
    res.json(result.recordset);

  } catch (err) {
    console.error('Error fetching shift calendar data:', err);
    res.status(500).json({ error: 'Failed to fetch shift calendar data' });
  }
});

module.exports = router; 