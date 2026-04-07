const ExcelJS = require('exceljs');
const { poolPromise, sql } = require('../db');

const convertNVarcharToDateTime = (column) => `
TRY_CONVERT(datetime,
    SUBSTRING(${column}, 7, 4) + '-' +
    SUBSTRING(${column}, 4, 2) + '-' +
    SUBSTRING(${column}, 1, 2) + 
    SUBSTRING(${column}, 11, LEN(${column})),
120)
`;

const convertKickInOutDateTime = () => `
ISNULL(KICK_IN_DATE, KICK_OUT_DATE)
`;

async function generatecamExcel(serialNumber,fromDate, toDate, models = [], stations = []) {
  const pool = await poolPromise;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("BLOCK_FIREWALL");

  console.log("===== EXCEL GENERATION DEBUG =====");
  console.log("From Date:", fromDate);
  console.log("To Date:", toDate);
  console.log("Models filter (ENGINE_CODE):", models);
  console.log("Stations filter:", stations);
  console.log("Serial Number filter:", serialNumber || "None");
  console.log("==================================");


  for (const station of stations) {

    let tableName = "TIAS314_GREASE_APPLICATION";

    if (station === "Grease Application") tableName = "TIAS314_GREASE_APPLICATION";
    if (station === "Cam-cap tightening") tableName = "CAM_COBOTPANEL_1";
   
    if (station === "Kick InOut") tableName = "KICK_IN_OUT";

    let modelCondition = "";
    let modelParams = {};

    if (models.length > 0 && station !== "Kick InOut") {
      const modelPlaceholders = models.map((_, i) => `@model${i}`).join(",");
      modelCondition = ` AND ENGINE_CODE IN (${modelPlaceholders})`;
      models.forEach((model, i) => modelParams[`model${i}`] = model);
    }

let dateFilterColumn;

if (station === "Kick InOut") {
  dateFilterColumn = convertKickInOutDateTime();
} else {
  dateFilterColumn = "PART_ENTRY_TIME";
}

           let serialCondition = "";
    if (serialNumber && serialNumber.trim() !== "") {
      serialCondition = ` AND LTRIM(RTRIM(serial_no)) = @serialNumber`; 
    }


    const query = `
      SELECT *
      FROM [CAM_HOUSING].[dbo].[${tableName}]
      WHERE 
        ${dateFilterColumn} >= @fromDate
      AND
        ${dateFilterColumn} <= @toDate
        ${modelCondition}
        ${serialCondition}
      ORDER BY ${dateFilterColumn} ASC
    `;

    const request = pool.request()
      .input("fromDate", sql.DateTime, new Date(fromDate))
      .input("toDate", sql.DateTime, new Date(toDate));

    for (const key in modelParams) {
      request.input(key, sql.VarChar, modelParams[key]);
    }

          if (serialNumber && serialNumber.trim() !== "") {
      request.input("serialNumber", sql.VarChar, serialNumber.trim());
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
  generatecamExcel
};