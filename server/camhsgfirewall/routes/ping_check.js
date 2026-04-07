const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const PING_FILE = 'D:/Debug/Cam_ping.txt';
let lastModifiedTime = null;
let cachedData = [];

const readPingFile = () => {
  try {
    const stats = fs.statSync(PING_FILE);
    const modifiedTime = stats.mtimeMs;

    if (lastModifiedTime !== modifiedTime) {
      lastModifiedTime = modifiedTime;
      const content = fs.readFileSync(PING_FILE, 'utf8').trim();
      cachedData = content.split(',').map(v => v.trim());
      console.log('File updated:', cachedData);
    }
  } catch (err) {
    console.error('Error reading ping file:', err.message);
  }

  return cachedData;
};

router.get('/camping', (req, res) => {
  const data = readPingFile();
  res.json({ success: true, data });
});

module.exports = router;
