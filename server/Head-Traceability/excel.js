const ExcelJS = require('exceljs');
const { poolPromise, sql } = require('./db.js');

const convertNVarcharToDateTime = (column) => `
TRY_CONVERT(datetime,
    SUBSTRING(${column}, 7, 4) + '-' +
    SUBSTRING(${column}, 4, 2) + '-' +
    SUBSTRING(${column}, 1, 2) + 
    SUBSTRING(${column}, 11, LEN(${column})),
120)
`;

const convertKickInOutDateTime = () => `
TRY_CONVERT(datetime,
    KDATE + ' ' + KTIME,
105)
`;

async function generateExcel(engineNumber, fromDate, toDate, models = [], stations = []) {
  const pool = await poolPromise;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("HEAD_TRACEABILITY");

  console.log("===== EXCEL GENERATION DEBUG =====");
  console.log("From Date:", fromDate);
  console.log("To Date:", toDate);
  console.log("Models filter (ENGINE_CODE):", models);
  console.log("Stations filter:", stations);
  console.log("Engine Number filter:", engineNumber || "None");
  console.log("==================================");

  for (const station of stations) {
    let tableName = "STEM_OIL_ASSEMBLY";

    if (station === "Stem Oil Assembly") tableName = "STEM_OIL_ASSEMBLY";
    else if (station === "Stem Oil Inspection") tableName = "STEM_OIL_INSP";
    else if (station === "Cotter/Retainer Assembly") tableName = "COTTER_RETAINER_ASSEMBLY";
    else if (station === "Cotter/Retainer Inspection") tableName = "COTTER_RETAINER_INSP";
    else if (station === "Plug Tube Press") tableName = "PLUG_TUBE_PRESS";
    else if (station === "Spark Plug Tight") tableName = "SPARK_PLUG_TIGHT";
    else if (station === "Port Leak Tester") tableName = "PORT_LEAK_TESTER";
    else if (station === "Fuel Leak Tester") tableName = "FUEL_LEAK_TESTER";
    else if (station === "End Cap Vision") tableName = "END_CAP_VISION";
    else if (station === "Kick InOut") tableName = "KICK_IN_OUT";

    let modelCondition = "";
    let modelParams = {};

    if (models.length > 0 && station !== "Kick InOut") {
      const modelPlaceholders = models.map((_, i) => `@model${i}`).join(",");
      modelCondition = ` AND ENGINE_CODE IN (${modelPlaceholders})`;
      models.forEach((model, i) => modelParams[`model${i}`] = model);
    }

    const dateFilterColumn = station === "Kick InOut"
      ? convertKickInOutDateTime()
      : convertNVarcharToDateTime("IN_STATION_TIME");

    // Add engine number filter only if provided, safely trim input for comparison
    let engineCondition = "";
    if (engineNumber && engineNumber.trim() !== "") {
      engineCondition = ` AND LTRIM(RTRIM(engine_no)) = @engineNumber`; 
    }

    const query = `
      SELECT *
      FROM [HEAD_TRACEABILITY].[dbo].[${tableName}]
      WHERE 
        ${dateFilterColumn} >= TRY_CONVERT(datetime, @fromDate, 120)
      AND
        ${dateFilterColumn} <= TRY_CONVERT(datetime, @toDate, 120)
        ${modelCondition}
        ${engineCondition}
      ORDER BY ${dateFilterColumn} ASC
    `;

    const request = pool.request()
      .input("fromDate", sql.NVarChar, fromDate.replace('T', ' ') + ':00')
      .input("toDate", sql.NVarChar, toDate.replace('T', ' ') + ':59');

    for (const key in modelParams) {
      request.input(key, sql.VarChar, modelParams[key]);
    }

    if (engineNumber && engineNumber.trim() !== "") {
      // Pass trimmed engine number param
      request.input("engineNumber", sql.VarChar, engineNumber.trim());
    }

    console.log("Executing query for station:", station);
    console.log("Query:", query);
    
    const result = await request.query(query);

    console.log("========= STATION SECTION START =========");
    console.log("Station Name :", station);
    console.log("Table Used   :", tableName);
    console.log("Rows Fetched :", result.recordset.length);
    console.log("=========================================");

    const titleRow = worksheet.addRow([`STATION : ${station.toUpperCase()}`]);
    titleRow.font = { bold: true, size: 18, color: { argb: 'FF007BFF' } };
    worksheet.mergeCells(`A${titleRow.number}:H${titleRow.number}`);

    if (!result.recordset.length) {
      worksheet.addRow(["No Data Found"]);
      worksheet.addRow([]);
      continue;
    }

    const headers = Object.keys(result.recordset[0]);

    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true };

    result.recordset.forEach(row => {
      worksheet.addRow(headers.map(h => row[h]));
    });

    headers.forEach((header, index) => {
      const column = worksheet.getColumn(index + 1);
      let maxLength = header.length;

      column.eachCell({ includeEmpty: true }, (cell) => {
        if (cell.value) {
          const cellLength = cell.value.toString().length;
          maxLength = Math.max(maxLength, cellLength);
        }
      });

      column.width = maxLength + 4;
    });

    worksheet.addRow([]);
  }

  return workbook;
}

module.exports = {
  generateExcel
};