const ExcelJS = require('exceljs');
const { poolPromise, sql } = require('../Mainline/db');

const convertNVarcharToDateTime = (column) => `
TRY_CONVERT(datetime,
    SUBSTRING(${column}, 7, 4) + '-' +
    SUBSTRING(${column}, 4, 2) + '-' +
    SUBSTRING(${column}, 1, 2) + 
    SUBSTRING(${column}, 11, LEN(${column})),
120)
`;

async function generatemainExcel(engineNumber, fromDate, toDate, models = [], stations = []) {
    const pool = await poolPromise;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("MAINLINE");

    console.log("===== EXCEL GENERATION DEBUG =====");
    console.log("From Date:", fromDate);
    console.log("To Date:", toDate);
    console.log("Models filter (ENGINE_CODE):", models);
    console.log("Stations filter:", stations);
    console.log("Engine Number filter:", engineNumber || "None");
    console.log("==================================");

    for (const station of stations) {
        // Map station to table name
        let tableName = "";
        switch (station) {
            case "R/O Seal NR": tableName = "TIAS323_REAROILSEAL"; break;
            case "Flywheel NR": tableName = "TIAS324_FLYWHEEL"; break;
            case "Head-bolt NR": tableName = "TIAS325_HEADBOLT"; break;
            case "Cam-HSG NR": tableName = "TIAS327_CAMHOSING"; break;
            case "TCC-1 NR": tableName = "TIAS329_TCC1"; break;
            case "TCC-2 NR": tableName = "TIAS331_TCC2"; break;
            case "Head cover": tableName = "TIAS341_HEADCOVER"; break;
            case "oil pan FIPG": tableName = "TIAS322_OILPAN_FIPG"; break;
            case "Cam-HSG FIPG": tableName = "TIAS326_CAMHSG_FIPG"; break;
            case "TCC-1 FIPG": tableName = "TIAS328_TCC1_FIPG"; break;
            case "TCC-2 FIPG": tableName = "TIAS330_TCC2_FIPG"; break;
            case "Rocker-Arm vision": tableName = "TITM314_ROCKER_ARM_VISION"; break;
            case "Spark-plug gap check": tableName = "TITM315_SPARKPLUG_GAP_CHECK"; break;
            default: 
                console.warn(`Unknown station: ${station}. Skipping.`);
                continue;
        }

        // Select correct date column
        let dateFilterColumn = "";
        if (["R/O Seal NR", "Flywheel NR", "Head-bolt NR", "Cam-HSG NR", "TCC-1 NR", "TCC-2 NR", "Head cover"].includes(station)) {
            dateFilterColumn = "PART_IN_TIME";
        } else {
            dateFilterColumn = "PART_ENTRY_TIME";
        }

        // Model filtering
        let modelCondition = "";
        let modelParams = {};
        if (!engineNumber && models.length > 0) {
            const modelPlaceholders = models.map((_, i) => `@model${i}`).join(",");
            modelCondition = `
                AND (ENGINE_CODE IN (${modelPlaceholders}) OR ENGINE_CODE IS NULL OR ENGINE_CODE = '')
            `;
            models.forEach((model, i) => modelParams[`model${i}`] = model);
        }

        // Engine number filter
        let engineCondition = "";
        if (engineNumber && engineNumber.trim() !== "") {
            engineCondition = ` AND LTRIM(RTRIM(engine_no)) LIKE '%' + @engineNumber + '%'`;
        }

        // Build query
        const query = `
            SELECT *
            FROM [TNGA_MAINLINE_NUTRUNNER].[dbo].[${tableName}]
            WHERE ${dateFilterColumn} >= @fromDate
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

        console.log("========= STATION SECTION START =========");
        console.log("Station Name :", station);
        console.log("Table Used   :", tableName);
        console.log("Rows Fetched :", result.recordset.length);
        console.log("=========================================");

        // Add station title
        const titleRow = worksheet.addRow([`STATION : ${station.toUpperCase()}`]);
        titleRow.font = { bold: true, size: 18, color: { argb: 'FF007BFF' } };
        worksheet.mergeCells(`A${titleRow.number}:H${titleRow.number}`);

        if (!result.recordset.length) {
            worksheet.addRow(["No Data Found"]);
            worksheet.addRow([]);
            continue;
        }

        // Add headers
        const headers = Object.keys(result.recordset[0]);
        const headerRow = worksheet.addRow(headers);
        headerRow.font = { bold: true };

        // Add data rows
        result.recordset.forEach(row => {
            worksheet.addRow(headers.map(h => row[h]));
        });

        // Adjust column widths
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
    generatemainExcel
};