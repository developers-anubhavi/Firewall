const express = require('express');
const router = express.Router();
const db = require('../db'); 

router.get('/calendar', async (req, res) => {
    try {
        const { year, month, day } = req.query;

        const pool = await db.poolPromise;
        const request = pool.request();

        let query = `SELECT *
                     FROM [HEAD_TRACEABILITY].[dbo].[KICK_IN_OUT]
                     WHERE 1=1`; 

        if (year) {
            request.input('year', db.sql.Int, parseInt(year, 10));
            query += ' AND YEAR(CONVERT(DATE, [DATE], 105)) = @year';
        }

        if (month) {
            request.input('month', db.sql.Int, parseInt(month, 10));
            query += ' AND MONTH(CONVERT(DATE, [DATE], 105)) = @month';
        }

        if (day) {
            request.input('day', db.sql.Int, parseInt(day, 10));
            query += ' AND DAY(CONVERT(DATE, [DATE], 105)) = @day';
        }

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching calendar data:', err);
        res.status(500).json({ error: 'Failed to fetch calendar data' });
    }
});

module.exports = router; 