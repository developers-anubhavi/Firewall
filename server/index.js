const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(cors());

app.use(express.text()); 

const pingRouter = require('./Head-Traceability/ping_check.js');
const shiftData = require('./Head-Traceability/routes/shiftData.js');
const currentpart = require('./Head-Traceability/TableDataContent/current-part.js');
const std = require('./Head-Traceability/TableDataContent/timestd.js');
const kickIORoutes = require("./Head-Traceability/routes/kickIO.js");
const calendarRoute = require('./Head-Traceability/routes/calendarbox.js');
const Golive = require('./Head-Traceability/routes/Golive.js');
const { router: settingsRouter, setupWebSocket } = require('./Head-Traceability/TableDataContent/settings.js');
const shiftout = require('./Head-Traceability/routes/out.js');
const cam_shiftvalues = require('./camhsgfirewall/routes/shiftvalues.js');
const cam_currentpart = require('./camhsgfirewall/routes/CurrentPartStatus.js');
const cam_ping = require('./camhsgfirewall/routes/ping_check.js');
const cam_calendar = require('./camhsgfirewall/routes/calendarbox.js');
const cam_kickio = require('./camhsgfirewall/routes/cam_kickio.js');
const cam_live = require('./camhsgfirewall/routes/Golive.js');
const { router: camsettingsRouter, setupcamWebSocket } = require('./camhsgfirewall/routes/settings.js');
const block_shiftdata = require('./Block-firewall/Shiftdatas.js');
const block_currentpart = require('./Block-firewall/CurrentPartStatus.js');
const block_kickio = require('./Block-firewall/Block_kickio.js');
const block_calendar = require('./Block-firewall/calendarbox.js');
const block_ping = require('./Block-firewall/ping_check.js');
const block_golive = require('./Block-firewall/Golive.js');
const { router: blocksettingsRouter, setupblockWebSocket } = require('./Block-firewall/settings.js');
const block_login = require('./Block-firewall/login.js');
const et_shift = require('./ET/Shiftdatas');
const et_current = require('./ET/CurrentPartStatus.js');
const et_live = require('./ET/Golive.js');
const et_calendar = require('./ET/calendarbox.js');
const et_kickio = require('./ET/et_kickio.js');
const { router: etsettingsRouter, setupetWebSocket } = require('./ET/settings.js');
const piston_shift = require('./Piston-firewall/Shiftdatas.js');
const piston_currentstatus = require('./Piston-firewall/CurrentPartStatus.js');
const piston_live = require('./Piston-firewall/Golive.js');
const { router: pistonsettingsRouter, setuppistonWebSocket } = require('./Piston-firewall/settings.js');
const main_engine = require('./Mainline/pitchroute.js');
const main_Shift = require('./Mainline/Shiftdatas.js');
const main_current = require('./Mainline/currentpart.js');
const main_torquedetails = require('./Mainline/torquedetails.js');
const { router: mainsettingsRouter, setupmainWebSocket } = require('./Mainline/settings.js');

const loginRouter2 = require("./Head-Traceability/routes/login.js");
const { createDefaultUser } = require('./Head-Traceability/routes/user.js');
const userRecords = require('./Head-Traceability/routes/user_records.js');
const dotenv = require('dotenv');

dotenv.config();

app.use('/api', piston_currentstatus);
app.use('/api', piston_shift);
app.use('/api', pistonsettingsRouter);
app.use('/api', piston_live);
app.use('/api', block_calendar);
app.use('/api', block_kickio);
app.use('/api', block_shiftdata);
app.use('/api', block_currentpart);
app.use('/api', block_ping);
app.use('/api', block_golive);
app.use('/api', blocksettingsRouter);
app.use('/api', block_login);
app.use('/api', cam_shiftvalues);
app.use('/api', cam_currentpart);
app.use('/api', cam_ping);
app.use('/api', cam_calendar);
app.use('/api', cam_kickio);
app.use('/api', cam_live);
app.use('/api', camsettingsRouter);
app.use('/api', settingsRouter);
app.use('/api', calendarRoute);
app.use("/api", kickIORoutes);
app.use('/api', pingRouter);
app.use('/api', shiftData);
app.use('/api', currentpart);
app.use('/api', std);
app.use('/api', shiftout);
app.use('/api', et_shift);
app.use('/api', et_current);
app.use('/api', et_live);
app.use('/api', et_calendar);
app.use('/api', et_kickio);
app.use('/api', etsettingsRouter);
app.use('/api', main_engine);
app.use('/api', main_Shift);
app.use('/api', main_current);
app.use('/api', main_torquedetails);
app.use('/api', mainsettingsRouter);

app.use("/auth", loginRouter2);
app.use("/api", userRecords);
app.use('/api', Golive);
app.get('/api/data', (req, res) => {
  const data = [
    { asn: '123', suffix: 'A' },
    { asn: '456', suffix: 'B' },
    { asn: '789', suffix: 'C' },
  ];

  res.json(data);
});


const bodyParser = require('body-parser');
const { generateExcel } = require('./Head-Traceability/excel.js');
const { generateBlockExcel } = require('./Block-firewall/excel.js');
const { generatecamExcel } = require('./camhsgfirewall/routes/excel.js');
const { generateetExcel } = require('./ET/excel.js');
const { generatepistonExcel } = require('./Piston-firewall/excel.js');
const { generatemainExcel } = require('./Mainline/excel.js');

app.use(bodyParser.json());

app.post("/api/fetch-data", async (req, res) => {
  try {
    const { engineNumber, fromDate, toDate, models, stations } = req.body;

    if (!fromDate || !toDate) {
      return res.status(400).send("From and To dates are required.");
    }

    const workbook = await generateExcel(
      engineNumber, 
      fromDate,
      toDate,
      models || [],
      stations || []
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=HEAD_TRACEABILITY_Report.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("Excel generation failed:", error);
    res.status(500).send("Error generating Excel");
  }
});

app.post("/api/fetch-block-data", async (req, res) => {
    try {
        const { engineNumber,fromDate, toDate, models, stations, engineNo } = req.body; // added engineNo

        if (!fromDate || !toDate) {
            return res.status(400).send("From and To dates are required.");
        }

        const workbook = await generateBlockExcel(
            engineNumber, 
            fromDate,
            toDate,
            models || [],
            stations || [],
            engineNo || null // pass engineNo, default null
        );

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=BLOCK_FIREWALL_Report.xlsx"
        );

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error("Block Excel generation failed:", error);
        res.status(500).send("Error generating Block Excel");
    }
});
app.post("/api/fetch-cam-data", async (req, res) => {
    try {
        const {serialNumber, fromDate, toDate, models, stations } = req.body;

        if (!fromDate || !toDate) {
            return res.status(400).send("From and To dates are required.");
        }

        const workbook = await generatecamExcel(
            serialNumber,
            fromDate,
            toDate,
            models || [],
            stations || []
        );

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=CAM_HOUSING_Report.xlsx"
        );

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error("CAM Excel generation failed:", error);
        res.status(500).send("Error generating CAM Excel");
    }
});


app.post("/api/fetch-et-data", async (req, res) => {
    try {
        const {  engineNumber,fromDate, toDate, models, stations } = req.body;

        if (!fromDate || !toDate) {
            return res.status(400).send("From and To dates are required.");
        }

        const workbook = await generateetExcel(
            engineNumber,
            fromDate,
            toDate,
            models || [],
            stations || []
        );

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=ET-FINAL GATE_Report.xlsx"
        );

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error("ET Excel generation failed:", error);
        res.status(500).send("Error generating ET Excel");
    }
});


app.post("/api/fetch-piston-data", async (req, res) => {
    try {
        const { palletNo,fromDate, toDate, models, stations } = req.body;

        if (!fromDate || !toDate) {
            return res.status(400).send("From and To dates are required.");
        }

        const workbook = await generatepistonExcel(
            palletNo,
            fromDate,
            toDate,
            models || [],
            stations || []
        );

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=Piston_Firewall_Report.xlsx"
        );

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error(" Piston Excel generation failed:", error);
        res.status(500).send("Error generating Piston Excel");
    }
});



app.post("/api/fetch-mainline-data", async (req, res) => {
    try {
        const { engineNumber,fromDate, toDate, models, stations } = req.body;

        if (!fromDate || !toDate) {
            return res.status(400).send("From and To dates are required.");
        }

        const workbook = await generatemainExcel(
            engineNumber,
            fromDate,
            toDate,
            models || [],
            stations || []
        );

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=Mainline_Report.xlsx"
        );

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error(" Mainline Excel generation failed:", error);
        res.status(500).send("Error generating Mainline Excel");
    }
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

const PORT = 4001;
const HOST = '192.168.0.20'; 

app.get('/', (req, res) => {
  res.send('Server is running on port 4001 🚀');
});

createDefaultUser();

const server = app.listen(PORT, HOST, () => {
  console.log(`✅ Server running at http://${HOST}:${PORT}`);
});

setupWebSocket(server);
setupblockWebSocket(server);
setupcamWebSocket(server);
setupetWebSocket(server);
setuppistonWebSocket(server);
setupmainWebSocket(server);