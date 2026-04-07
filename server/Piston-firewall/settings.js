const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const { poolPromise } = require('../Piston-firewall/db'); 

const SHIFT_DIR = 'D:/Debug/';
const FILE_PATH = path.join(SHIFT_DIR, 'shifttime.txt');

const timeDevFilePath = path.join(SHIFT_DIR, "DevTime.txt");

let wss;

function readShiftTimes() {
  const lines = fs.readFileSync(FILE_PATH, 'utf8').trim()
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  if (lines.length < 3) throw new Error('FIRST.txt must have 3 lines');
  const [first, second, third] = lines;
  return { first, second, third };
}

router.get('/piston_shifts', (req, res) => {
  try { res.json(readShiftTimes()); }
  catch(err){ res.status(500).json({ error: 'Failed to read shift timings' }); }
});

router.post('/piston_update-shifts', (req, res) => {
  try {
    const { first, second, third } = req.body;
    if(!first || !second || !third) return res.status(400).json({ error: 'All three shift times required' });

    fs.writeFileSync(FILE_PATH, `${first}\n${second}\n${third}`, 'utf8');

    broadcastShiftTimes();
    res.json({ message: 'Shift timings updated successfully' });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update shift timings' });
  }
});

function readFileToArray(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    let values = data
      .split(/\r?\n/)
      .map(line => parseFloat(line.trim()))
      .filter(val => !isNaN(val));
    while (values.length < 9) values.push(0);
    return values;
  } catch(err) {
    console.error('Error reading file', filePath, err);
    return Array(9).fill(0);
  }
}

function readTimeDev() {
  try {
    const data = fs.readFileSync(timeDevFilePath, 'utf8');
    let values = data
      .split(/\r?\n/)
      .map(line => parseFloat(line.trim()))
      .filter(val => !isNaN(val));
    while (values.length < 9) values.push(0);
    return values;
  } catch(err) {
    console.error('Error reading TIMEDEV file', err);
    return Array(9).fill(0);
  }
}

router.post('/piston_update-table', (req, res) => {
  try {
    const { col2, col3, col4 } = req.body;

    if (!col2 || !col3 || !col4 || col2.length !== 9 || col3.length !== 9 || col4.length !== 9) {
      return res.status(400).json({ error: 'Invalid table data' });
    }

    const col4Content = col4.join('\n');

    fs.writeFileSync(timeDevFilePath, col4Content, 'utf8');

    broadcastTableData();

    res.json({ message: 'Table updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update table' });
  }
});

router.get('/piston_table-data', async (req, res) => {
  try {
    const data = await getTableData();
    console.log("Sending table data:", data);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch table data" });
  }
});


async function getTableData() {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT 
        STATION_NAME,
        STD_TIME_2L,
        STD_TIME_1_5L
      FROM [BLOCK_PISTON_SUB].[dbo].[LINE_STATUS]
    `);

    const rows = result.recordset;
    const timeDevValues = readTimeDev();

    const tableData = {};

    // ✅ Required stations in order
    const stationOrder = [
      "TIAS311_VISION_SYSTEM",
      "TIAS311_PISTON_RANK",
      "TIAS311_PISTON_PIN_ASSY",
      "TIAS312_SNAPRING_VISION",
      "TIAS312_SNAPRING_VISION",
      "TIAS313_RING_ASSY",
      "TIAS311_VISION_SYSTEM"
    ];

    stationOrder.forEach((station, index) => {
      const row = rows.find(r => r.STATION_NAME === station);

      tableData[`piston_col${index + 1}_2`] = row ? row.STD_TIME_2L : 0;
      tableData[`piston_col${index + 1}_3`] = row ? row.STD_TIME_1_5L : 0;
      tableData[`piston_col${index + 1}_4`] = timeDevValues[index] || 0;
    });

    return tableData;

  } catch (err) {
    console.error('DB fetch error:', err);
    return {};
  }
}

async function broadcastTableData() {
  if (!wss) return;

  const tableData = await getTableData();

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'tableData', data: tableData }));
    }
  });

  console.log('Table data broadcasted:', tableData);
}

function broadcastShiftTimes() {
  if (!wss) return;

  const data = readShiftTimes();

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: "shiftTimes", data }));
    }
  });
}

function setuppistonWebSocket(server){
  wss = new WebSocket.Server({ server });

wss.on('connection', async ws => {
  try {
    ws.send(JSON.stringify({ type: 'shiftTimes', data: readShiftTimes() }));

    const tableData = await getTableData();
    ws.send(JSON.stringify({ type: 'tableData', data: tableData }));

  } catch(err){ 
    console.error(err); 
  }
});

  fs.watch(FILE_PATH, { persistent: true }, (eventType) => {
    if(eventType === 'change'){
      broadcastShiftTimes();
    }
  });

[timeDevFilePath].forEach(file => { 
  fs.watch(file, { persistent: true }, (eventType) => {
    if (eventType === "change") {
      broadcastTableData();
    }
  });
});


  console.log('✅ WebSocket server ready');
}

module.exports = { router, setuppistonWebSocket };