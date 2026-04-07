const express = require('express');
const router = express.Router();
const db = require('../Block-firewall/db'); 


router.get('/blockcalendar', async (req, res) => {
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
SELECT DISTINCT CONVERT(varchar(10), [DATE_TIME], 23) AS DATE
FROM (
    SELECT [DATE_TIME] FROM [BLOCK_PISTON_SUB].[dbo].[BLOCK_MONITOR_1]
    WHERE [DATE_TIME] >= @startDate
      AND [DATE_TIME] < @endDate

    UNION ALL

    SELECT [DATE_TIME] FROM [BLOCK_PISTON_SUB].[dbo].[BLOCK_MONITOR_2]
    WHERE [DATE_TIME] >= @startDate
      AND [DATE_TIME] < @endDate
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


router.get('/blockcalendar_shiftCounts', async (req, res) => {
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
    e.[PART_ENTRY_TIME]
FROM [BLOCK_PISTON_SUB].[dbo].[BLOCK_RESULT] r
LEFT JOIN [BLOCK_PISTON_SUB].[dbo].[TIZZ320_ENGRAVING] e
    ON r.ENGINE_NO = e.ENGINE_NO
WHERE r.[DATE_TIME] >= @startDate
  AND r.[DATE_TIME] < @endDate
ORDER BY DATE
    `;

    const result = await request.query(query);
    res.json(result.recordset);

  } catch (err) {
    console.error('Error fetching shift calendar data:', err);
    res.status(500).json({ error: 'Failed to fetch shift calendar data' });
  }
});

module.exports = router; 