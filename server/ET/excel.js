const ExcelJS = require('exceljs');
const { poolPromise, sql } = require('../ET/db');

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

async function generateetExcel(engineNumber,fromDate, toDate, models = [], stations = []) {
  const pool = await poolPromise;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("ET-FINAL GATE");

  console.log("===== EXCEL GENERATION DEBUG =====");
  console.log("From Date:", fromDate);
  console.log("To Date:", toDate);
  console.log("Models filter (ENGINE_CODE):", models);
  console.log("Stations filter:", stations);
  console.log("Engine Number filter:", engineNumber || "None");
  console.log("==================================");

  for (const station of stations) {

    let tableName = "TITM318_OILLEAK";

    if (station === "Oil Leak") tableName = "TITM318_OILLEAK";
    if (station === "Inj Moving") tableName = "TITM323_INJECTOR";
    if (station === "Water Leak") tableName = "TITM319_WATERLEAK";
    if (station === "Oil Fill") tableName = "TIZZ330_OILFILLING";
    if (station === "MTB-1") tableName = "TITM321_MTB1";
    if (station === "MTB-2") tableName = "TITM325_MTB2";
    if (station === "Final Label") tableName = "TIZZ365_ENGINELABEL";

    if (station === "Kick InOut") tableName = "KICK_IN_OUT";

    let modelCondition = "";
    let modelParams = {};

   if (!engineNumber && models.length > 0 && station !== "Kick InOut") {
  const modelPlaceholders = models.map((_, i) => `@model${i}`).join(",");
  modelCondition = `
  AND (
        ENGINE_CODE IN (${modelPlaceholders})
        OR ENGINE_CODE IS NULL
        OR ENGINE_CODE = ''
      )
  `;
  models.forEach((model, i) => modelParams[`model${i}`] = model);
}
    const dateFilterColumn = station === "Kick InOut"
      ? convertKickInOutDateTime()
      : "PART_ENTRY_TIME"; 

       let engineCondition = "";
    if (engineNumber && engineNumber.trim() !== "") {
     engineCondition = ` AND LTRIM(RTRIM(engine_no)) LIKE '%' + @engineNumber + '%'`;
    }


    const query = `
      SELECT *
      FROM [ENGINE_TESTING].[dbo].[${tableName}]
      WHERE 
        ${dateFilterColumn} >= @fromDate
      AND
        ${dateFilterColumn} <= @toDate
        ${modelCondition}
        ${engineCondition}
      ORDER BY ${dateFilterColumn} ASC
    `;

    const request = pool.request()
      .input("fromDate", sql.DateTime, new Date(fromDate))
      .input("toDate", sql.DateTime, new Date(toDate));

    for (const key in modelParams) {
      request.input(key, sql.VarChar, modelParams[key]);
    }

      if (engineNumber && engineNumber.trim() !== "") {
      // Pass trimmed engine number param
      request.input("engineNumber", sql.VarChar, engineNumber.trim());
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
  generateetExcel
};