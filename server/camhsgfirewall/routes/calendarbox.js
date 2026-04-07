const express = require('express');
const router = express.Router();
const db = require('../db'); 

router.get('/camcalendar', async (req, res) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ error: 'year and month required' });
    }

    const pool = await db.poolPromise;
    const request = pool.request();

    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 1);

    request.input('startDate', db.sql.DateTime2, startDate);
    request.input('endDate', db.sql.DateTime2, endDate);

    const query = `
      SELECT DISTINCT DATE FROM (
        SELECT CONVERT(varchar(10), PART_ENTRY_TIME, 23) AS DATE FROM [CAM_HOUSING].[dbo].[TITM310_VVT_COIL]
        WHERE PART_ENTRY_TIME >= @startDate AND PART_ENTRY_TIME < @endDate

        UNION

        SELECT CONVERT(varchar(10), PART_ENTRY_TIME, 23) AS DATE FROM [CAM_HOUSING].[dbo].[TIZZ350_ID_WRITING]
        WHERE PART_ENTRY_TIME >= @startDate AND PART_ENTRY_TIME < @endDate

        UNION

        SELECT CONVERT(varchar(10), PART_ENTRY_TIME, 23) AS DATE FROM [CAM_HOUSING].[dbo].[TIAS314_GREASE_APPLICATION]
        WHERE PART_ENTRY_TIME >= @startDate AND PART_ENTRY_TIME < @endDate

        UNION

        SELECT CONVERT(varchar(10), PART_ENTRY_TIME, 23) AS DATE FROM [CAM_HOUSING].[dbo].[TIZZ366_PISTON_COLLATION]
        WHERE PART_ENTRY_TIME >= @startDate AND PART_ENTRY_TIME < @endDate

        UNION

        SELECT CONVERT(varchar(10), KICK_IN_DATE, 23) AS DATE FROM [CAM_HOUSING].[dbo].[KICK_IN_OUT]
        WHERE KICK_IN_DATE >= @startDate AND KICK_IN_DATE < @endDate

        UNION

        SELECT CONVERT(varchar(10), KICK_OUT_DATE, 23) AS DATE FROM [CAM_HOUSING].[dbo].[KICK_IN_OUT]
        WHERE KICK_OUT_DATE >= @startDate AND KICK_OUT_DATE < @endDate
      ) AS AllDates
      ORDER BY DATE;
    `;

    const result = await request.query(query);
    res.json(result.recordset);

  } catch (err) {
    console.error('Calendar error:', err);
    res.status(500).json({ error: 'Calendar fetch failed' });
  }
});


router.get('/camcalendar_shiftCounts', async (req, res) => {
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
SELECT
    (SELECT COUNT(*)
     FROM [CAM_HOUSING].[dbo].[TIZZ350_ID_WRITING]
     WHERE [PART_ENTRY_TIME] >= @startDate
       AND [PART_ENTRY_TIME] < @endDate) AS TIZZ350_Count,

    (SELECT COUNT(*)
     FROM [CAM_HOUSING].[dbo].[CAM_RESULT]
     WHERE [DATE_TIME] >= @startDate
       AND [DATE_TIME] < @endDate) AS CAM_RESULT_Count;

    `;

    const result = await request.query(query);
    res.json(result.recordset);

  } catch (err) {
    console.error('Error fetching shift calendar data:', err);
    res.status(500).json({ error: 'Failed to fetch shift calendar data' });
  }
});

module.exports = router; 