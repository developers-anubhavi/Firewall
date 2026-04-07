const express = require('express');
const fs = require('fs');
const chokidar = require('chokidar');
const path = require('path');

const router = express.Router();

const STD_FILE_PATH = path.resolve('D:/Debug/StdDeviationTime.txt');

let stdValues = [];

const readStdFile = () => {
  fs.readFile(STD_FILE_PATH, 'utf8', (err, data) => {
    if (err) {
      console.error('❌ Error reading STD.txt:', err);
      return;
    }
    stdValues = data
      .split(/\r?\n/) 
      .map(line => line.trim())
      .filter(line => line !== ''); 
    console.log('✅ Updated STD values:', stdValues);
  });
};

readStdFile();

chokidar.watch(STD_FILE_PATH).on('change', () => {
  console.log('📄 STD.txt changed — reloading...');
  readStdFile();
});

router.get('/std-values', (req, res) => {
  res.json({
    head_timestd1: stdValues[0] || null,
    head_timestd2: stdValues[1] || null,
    head_timestd3: stdValues[2] || null,
    head_timestd4: stdValues[3] || null,
    head_timestd5: stdValues[4] || null,
    head_timestd6: stdValues[5] || null,
    head_timestd7: stdValues[6] || null,
    head_timestd8: stdValues[7] || null,
    head_timestd9: stdValues[8] || null,
  });
});

module.exports = router;
