const ExcelJS = require('exceljs');
const { poolPromise, sql } = require('../Piston-firewall/db');

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

async function generatepistonExcel(palletNo,fromDate, toDate, models = [], stations = []) {
  const pool = await poolPromise;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("PISTON_FIREWALL");

  console.log("===== EXCEL GENERATION DEBUG =====");
  console.log("From Date:", fromDate);
  console.log("To Date:", toDate);
  console.log("Models filter (ENGINE_CODE):", models);
  console.log("Stations filter:", stations);
  console.log("Pallet Number filter:", palletNo || "None");
  console.log("==================================");

  for (const station of stations) {

    let tableName = "PISTON_PIN_COLLATION";

    if (station === "Piston Pin Collation") tableName = "PISTON_PIN_COLLATION";

let modelCondition = "";
let modelParams = {};

if (models.length > 0) {
  const modelPlaceholders = models.map((_, i) => `@model${i}`).join(",");
  modelCondition = ` AND r.ENGINE_CODE IN (${modelPlaceholders})`;
  models.forEach((model, i) => modelParams[`model${i}`] = model);
}

    const dateFilterColumn = station === "Kick InOut"
      ? convertKickInOutDateTime()
      : "PART_ENTRY_TIME";   // since datatype is already datetime

  let engineCondition = "";

if (palletNo && palletNo.trim() !== "") {
  engineCondition = ` AND LTRIM(RTRIM(PALLET_NO)) = @palletNo`;
}

const query = `
 SELECT p.*
FROM [BLOCK_PISTON_SUB].[dbo].[${tableName}] p
LEFT JOIN [BLOCK_PISTON_SUB].[dbo].[PISTON_RESULT] r
  ON LTRIM(RTRIM(p.PALLET_NO)) = LTRIM(RTRIM(r.PALLET_NO))
WHERE 
  p.${dateFilterColumn} >= @fromDate
AND
  p.${dateFilterColumn} < DATEADD(day, 1, @toDate)
  ${modelCondition}
  ${palletNo ? `AND LTRIM(RTRIM(p.PALLET_NO)) = @palletNo` : ""}
ORDER BY p.${dateFilterColumn} ASC
`;


const from = new Date(fromDate);
from.setHours(0, 0, 0, 0);

const to = new Date(toDate);
to.setHours(23, 59, 59, 999);

const request = pool.request()
  .input("fromDate", sql.DateTime, from)
  .input("toDate", sql.DateTime, to);

for (const key in modelParams) {
  request.input(key, sql.VarChar, modelParams[key]);
}

if (palletNo && palletNo.trim() !== "") {
  request.input("palletNo", sql.VarChar, palletNo.trim());
}
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
  generatepistonExcel
};