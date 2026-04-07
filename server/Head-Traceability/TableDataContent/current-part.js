const express = require("express");
const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");
const router = express.Router();
const { sql, poolPromise } = require('../db'); 

// const STD_FILE = path.resolve('D:/Debug/StdDeviationTime_a.txt');
// const STD_A_FILE = path.resolve('D:/Debug/StdDeviationTime.txt');

// let stdValues = Array(9).fill(null);
// let stdAValues = Array(9).fill(null);

const readStdFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    const values = data
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line !== "");
    while (values.length < 9) values.push(null);
    return values.slice(0, 9);
  } catch (err) {
    console.error(`❌ Error reading ${filePath}:`, err);
    return Array(9).fill(null);
  }
};

// stdValues = readStdFile(STD_FILE);
// stdAValues = readStdFile(STD_A_FILE);

// chokidar.watch(STD_FILE).on("change", () => {
//   console.log("📄 STD.txt changed — reloading...");
//   stdValues = readStdFile(STD_FILE);
// });

// chokidar.watch(STD_A_FILE).on("change", () => {
//   console.log("📄 STD_a.txt changed — reloading...");
//   stdAValues = readStdFile(STD_A_FILE);
// });

router.get("/engine-number", async (req, res) => {
  try {
    const pool = await poolPromise;

    const panelQuery = `
      SELECT TOP 1 ENGINE_NO, DATE_TIME, SHIFT
      FROM [HEAD_TRACEABILITY].[dbo].[POKOYOKE_PANEL]
      ORDER BY ID DESC
    `;
    const panelResult = await pool.request().query(panelQuery);
    const latestPanelRecord = panelResult.recordset[0];

    if (!latestPanelRecord) {
      return res.json({ engineNumber: null, message: "No engine found" });
    }

    const { ENGINE_NO, DATE_TIME, SHIFT } = latestPanelRecord;

    const codeQuery = `
      SELECT TOP 1 ENGINE_CODE
      FROM [HEAD_TRACEABILITY].[dbo].[ID_WRITING]
      WHERE ENGINE_NO = @engineNo
      ORDER BY ID DESC
    `;
    const codeResult = await pool.request()
      .input("engineNo", sql.VarChar, ENGINE_NO)
      .query(codeQuery);

    const engineCode = codeResult.recordset[0]?.ENGINE_CODE || null;

    const fetchProcessData = async (tableName) => {
      const query = `
        SELECT TOP 1 TIME_DEV, RESULT1, RESULT2, RESULT3, RESULT4
        FROM [HEAD_TRACEABILITY].[dbo].[${tableName}]
        WHERE ENGINE_NO = @engineNo
        ORDER BY ID DESC
      `;
      const result = await pool.request()
        .input("engineNo", sql.VarChar, ENGINE_NO)
        .query(query);
      return result.recordset[0] || {};
    };

    const [
      stemOilAssembly,
      stemOilInsp,
      cotterRetAssy,
      cotterRetInsp,
      plugTubePress,
      sparkPlugTight,
      portLeakTester,
      fuelLeakTester,
    ] = await Promise.all([
      fetchProcessData("STEM_OIL_ASSEMBLY"),
      fetchProcessData("STEM_OIL_INSP"),
      fetchProcessData("COTTER_RETAINER_ASSEMBLY"),
      fetchProcessData("COTTER_RETAINER_INSP"),
      fetchProcessData("PLUG_TUBE_PRESS"),
      fetchProcessData("SPARK_PLUG_TIGHT"),
      fetchProcessData("PORT_LEAK_TESTER"),
      fetchProcessData("FUEL_LEAK_TESTER"),
    ]);

    const timeDevFilePath = "D:/Debug/DevTime.txt";
    let timeDevLimits = [];
    try {
      const fileContent = fs.readFileSync(timeDevFilePath, "utf-8");
      timeDevLimits = fileContent
        .split(/\r?\n/)
        .map(line => parseFloat(line.trim()))
        .filter(val => !isNaN(val));
      while (timeDevLimits.length < 9) timeDevLimits.push(0);
    } catch (err) {
      console.error("❌ Error reading TIMEDEV.txt:", err);
    }

    const addColorFlag = (actual, limit) => {
      if (actual == null) return "gray";
      return actual > limit ? "red" : "palegreen";
    };

const stdQuery = `
  SELECT STATION_NAME, STD_TIME_1_5L, STD_TIME_2L
  FROM [HEAD_TRACEABILITY].[dbo].[LINE_STATUS]
`;

const stdResult = await pool.request().query(stdQuery);
const stdRows = stdResult.recordset;

const stationOrder = [
  "STEM_OIL_ASSEMBLY",
  "STEM_OIL_INSP",
  "COTTER_RETAINER_ASSEMBLY",
  "COTTER_RETAINER_INSP",
  "PLUG_TUBE_PRESS",
  "SPARK_PLUG_TIGHT",
  "PORT_LEAK_TESTER",
  "FUEL_LEAK_TESTER",
];

let currentStdValues = stationOrder.map(station => {
  const row = stdRows.find(r => r.STATION_NAME === station);

  if (!row) return null;

  // choose column based on engineCode
  if (engineCode === "001" || engineCode === "002") {
    return row.STD_TIME_2L;
  } else if (engineCode === "012") {
    return row.STD_TIME_1_5L;
  }

  return null;
});

// optional 9th value (if needed)
currentStdValues.push(null);

const isCol4Disabled = engineCode === "012";
const maybeResult4 = (value) => (isCol4Disabled ? null : value);

    const responseData = {
      engineNumber: ENGINE_NO,
      engineCode,
      dateTime: DATE_TIME,
      shift: SHIFT,

      timeDev1: stemOilAssembly.TIME_DEV || null,
      timeDev2: stemOilInsp.TIME_DEV || null,
      timeDev3: cotterRetAssy.TIME_DEV || null,
      timeDev4: cotterRetInsp.TIME_DEV || null,
      timeDev5: plugTubePress.TIME_DEV || null,
      timeDev6: sparkPlugTight.TIME_DEV || null,
      timeDev7: portLeakTester.TIME_DEV || null,
      timeDev8: fuelLeakTester.TIME_DEV || null,

      result1_1: stemOilAssembly.RESULT1 || null,
      result1_2: stemOilAssembly.RESULT2 || null,
      result1_3: stemOilAssembly.RESULT3 || null,
      result1_4: maybeResult4(stemOilAssembly.RESULT4),

      result2_1: stemOilInsp.RESULT1 || null,
      result2_2: stemOilInsp.RESULT2 || null,
      result2_3: stemOilInsp.RESULT3 || null, 
      result2_4: maybeResult4(stemOilInsp.RESULT4),

      result3_1: cotterRetAssy.RESULT1 || null, 
      result3_2: cotterRetAssy.RESULT2 || null, 
      result3_3: cotterRetAssy.RESULT3 || null, 
      result3_4: maybeResult4(cotterRetAssy.RESULT4), 
      
      result4_1: cotterRetInsp.RESULT1 || null, 
      result4_2: cotterRetInsp.RESULT2 || null, 
      result4_3: cotterRetInsp.RESULT3 || null, 
      result4_4: maybeResult4(cotterRetInsp.RESULT4),
      
      result5_1: plugTubePress.RESULT1 || null, 
      result5_2: plugTubePress.RESULT2 || null, 
      result5_3: plugTubePress.RESULT3 || null, 
      result5_4: maybeResult4(plugTubePress.RESULT4), 
      
      result6_1: sparkPlugTight.RESULT1 || null, 
      result6_2: sparkPlugTight.RESULT2 || null, 
      result6_3: sparkPlugTight.RESULT3 || null, 
      result6_4: maybeResult4(sparkPlugTight.RESULT4), 
      
      result7_1: portLeakTester.RESULT1 || null, 
      result7_2: portLeakTester.RESULT2 || null, 
      result7_3: portLeakTester.RESULT3 || null, 
      result7_4: maybeResult4(portLeakTester.RESULT4),
      
      result8_1: fuelLeakTester.RESULT1 || null, 
      result8_2: fuelLeakTester.RESULT2 || null, 
      result8_3: fuelLeakTester.RESULT3 || null, 
      result8_4: maybeResult4(fuelLeakTester.RESULT4),

      timeDevColors: [
        addColorFlag(stemOilAssembly.TIME_DEV, timeDevLimits[0]),
        addColorFlag(stemOilInsp.TIME_DEV, timeDevLimits[1]),
        addColorFlag(cotterRetAssy.TIME_DEV, timeDevLimits[2]),
        addColorFlag(cotterRetInsp.TIME_DEV, timeDevLimits[3]),
        addColorFlag(plugTubePress.TIME_DEV, timeDevLimits[4]),
        addColorFlag(sparkPlugTight.TIME_DEV, timeDevLimits[5]),
        addColorFlag(portLeakTester.TIME_DEV, timeDevLimits[6]),
        addColorFlag(fuelLeakTester.TIME_DEV, timeDevLimits[7]),
      ],

      timestd1: currentStdValues[0],
      timestd2: currentStdValues[1],
      timestd3: currentStdValues[2],
      timestd4: currentStdValues[3],
      timestd5: currentStdValues[4],
      timestd6: currentStdValues[5],
      timestd7: currentStdValues[6],
      timestd8: currentStdValues[7],
      timestd9: currentStdValues[8],

      message: "Latest engine number, code, process data, colors, and STD values fetched"
    };

    res.json(responseData);

  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
