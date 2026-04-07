const ExcelJS = require('exceljs');
const path = require('path');
const { poolPromise, sql } = require('../Block-firewall/db');

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

async function generateBlockExcel(engineNumber, fromDate, toDate, models = [], stations = []) {
  const pool = await poolPromise;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("BLOCK_FIREWALL");

  // ================= HEADER SECTION =================

  // Add Logo
  const logo = workbook.addImage({
    filename: path.join(__dirname, '../Block-firewall/assets/Tieilogo.png'), // ✅ update path if needed
    extension: 'png',
  });

  worksheet.addImage(logo, {
    tl: { col: 0, row: 0 },
    ext: { width: 150, height: 60 }
  });

  // Title
  worksheet.mergeCells('C1:H2');
  const titleCell = worksheet.getCell('C1');
  titleCell.value = "BLOCK FIREWALL REPORT";
  titleCell.font = { size: 20, bold: true, color: { argb: 'FF007BFF' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // Date Range
  worksheet.mergeCells('C3:H3');
  const dateCell = worksheet.getCell('C3');
  dateCell.value = `From: ${fromDate}   To: ${toDate}`;
  dateCell.alignment = { horizontal: 'center' };

  // Spacer rows
  worksheet.addRow([]);
  worksheet.addRow([]);
  worksheet.addRow([]);

  // Freeze header
  worksheet.views = [{ state: 'frozen', ySplit: 4 }];

  let currentRow = worksheet.lastRow ? worksheet.lastRow.number + 1 : 6;

  // ================= DATA SECTION =================

  for (const station of stations) {

    let tableName = "TIZZ320_ENGRAVING";

    if (station === "Engraving") tableName = "TIZZ320_ENGRAVING";
    if (station === "Label Printer") tableName = "TIZZ322_ENGINE_LABEL";
    if (station === "ID Writing") tableName = "TIZZ325_ID_WRITING";
    if (station === "Lower Metal Rank") tableName = "TIZZ323_LOWER_BEARING";
    if (station === "Upper Metal Rank") tableName = "TIZZ323_UPPER_BEARING";
    if (station === "Crankshaft") tableName = "TIZZ352_CHUTTER";
    if (station === "Crank Cap Nutrunner") tableName = "TIAS307_CRANK_NR";
    if (station === "BS-PS Collation") tableName = "TIZZ353_BLOCK_PISTON_COLLATION";
    if (station === "Conrod Nutrunner") tableName = "TIAS308_CONROD_NR";
    if (station === "Piston Collation") tableName = "TIAS309_COLLATION";
    if (station === "Kick InOut") tableName = "KICK_IN_OUT";

    let modelCondition = "";
    let modelParams = {};

    if (models.length > 0 && station !== "Kick InOut") {
      const modelPlaceholders = models.map((_, i) => `@model${i}`).join(",");
      modelCondition = ` AND ENGINE_CODE IN (${modelPlaceholders})`;
      models.forEach((model, i) => modelParams[`model${i}`] = model);
    }

    const dateFilterColumn = station === "Kick InOut"
      ? convertKickInOutDateTime()
      : "PART_ENTRY_TIME";

    let engineCondition = "";
    if (engineNumber && engineNumber.trim() !== "") {
      engineCondition = ` AND LTRIM(RTRIM(engine_no)) = @engineNumber`;
    }

    const query = `
      SELECT *
      FROM [BLOCK_PISTON_SUB].[dbo].[${tableName}]
      WHERE 
        ${dateFilterColumn} >= @fromDate
        AND ${dateFilterColumn} <= @toDate
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
      request.input("engineNumber", sql.VarChar, engineNumber.trim());
    }

    const result = await request.query(query);

    // ===== STATION TITLE =====
 // Determine headers first
const headers = result.recordset.length ? Object.keys(result.recordset[0]) : ["No Data"];

// Insert the station title row
const titleRow = worksheet.insertRow(currentRow, [`STATION : ${station.toUpperCase()}`]);

// Get the last column letter based on headers length
const lastColLetter = worksheet.getColumn(headers.length).letter;

// Merge ONLY across the actual data columns
worksheet.mergeCells(`A${titleRow.number}:${lastColLetter}${titleRow.number}`);

// Style the title row
titleRow.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
titleRow.fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FF007BFF' }
};
titleRow.alignment = { horizontal: 'center', vertical: 'middle' };

// Move to next row
currentRow++;

    if (!result.recordset.length) {
      worksheet.insertRow(currentRow, ["No Data Found"]);
      currentRow += 2;
      continue;
    }


    // ===== HEADER ROW =====
    const headerRow = worksheet.insertRow(currentRow, headers);

    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: 'center' };

   headerRow.eachCell(cell => {
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD9E1F2' }
  };

  cell.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };

  cell.alignment = {
    vertical: 'middle',
    horizontal: 'center',
    wrapText: true
  };
});
    currentRow++;

    // ===== DATA ROWS =====
    result.recordset.forEach(row => {
      const dataRow = worksheet.insertRow(currentRow, headers.map(h => row[h]));

      dataRow.eachCell(cell => {
  cell.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };

  cell.alignment = {
    vertical: 'middle',
    horizontal: 'center',
    wrapText: true
  };
});

      currentRow++;
    });

    // ===== AUTO WIDTH =====
headers.forEach((header, index) => {
  const column = worksheet.getColumn(index + 1);

  let maxLength = header.length;

  column.eachCell({ includeEmpty: true }, (cell) => {
    if (cell.value) {
      const cellText = cell.value.toString();

      const length = cellText.length;

      maxLength = Math.max(maxLength, length);
    }
  });

  // 🎯 Smart width control
  if (maxLength <= 5) {
    column.width = 8;   // small fields like ID, SHIFT
  } else if (maxLength <= 10) {
    column.width = 12;  // medium fields
  } else if (maxLength <= 20) {
    column.width = 20;  // longer text
  } else {
    column.width = 30;  // cap for long text
  }
});

    currentRow += 2; // spacing between stations
  }

  return workbook;
}

module.exports = {
  generateBlockExcel
};