import '../camhsgfirewall/index.css';

import {
  useEffect,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import { faGear } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import B from '../assets/B.png';
import cylinder from '../assets/CamHousing.png';
import downarrow from '../assets/dotted down arrow.png';
import uparrow from '../assets/dotted up arrow.png';
import live from '../assets/live-streaming.gif';
import Machine from '../assets/Machine.png';
import Man from '../assets/Man.png';
import menu from '../assets/menu.gif';
import notokay from '../assets/not okay.png';
import okay from '../assets/okay.png';
import tiei1 from '../assets/tiei-pic1.png';
import tiei2 from '../assets/tiei-pic2.png';
import Golive from '../camhsgfirewall/GOLIVE';
import Menu from '../Head-Traceability/menu';

type DataRow = {
  asn: string;
  suffix: string;
};


const App = () => {

  const navigate = useNavigate();

const handleKickClick = () => {
  navigate("/camhsgfirewall/Cam_kick_io"); 
};

  const [data, setData] = useState<DataRow[]>([]);
  console.log(data);
  const [isSpinning,] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showLiveOverlay, setShowLiveOverlay] = useState(false);
  const [showSettings, setShowSettings] = useState(false);



  const handleGearClick = () => {
    window.open("/camlogin", "_blank");
    setShowSettings(true);
  };

  const handleLiveClick = () => {
  setShowLiveOverlay(true);
};


useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch('http://192.168.0.20:4001/api/data');
      const jsonData = await response.json();
      console.log(jsonData); 
      setData(jsonData);
    } catch (error) {
      console.error( error);
    }
  };

  fetchData();
}, []);

useEffect(() => {
  const fetchAllCounts = async () => {
    try {
      const [
        inRes,
        outRes,
        kickInRes,
        kickOutRes,
        abnormalRes
      ] = await Promise.all([
        fetch("http://192.168.0.20:4001/api/cam-count"),
        fetch("http://192.168.0.20:4001/api/cam-countout"),
        fetch("http://192.168.0.20:4001/api/cam_kickin"),
        fetch("http://192.168.0.20:4001/api/cam_kickout"),
        fetch("http://192.168.0.20:4001/api/cam_abnormalcount")
      ]);

      const [
        inData,
        outData,
        kickInData,
        kickOutData,
        abnormalData
      ] = await Promise.all([
        inRes.json(),
        outRes.json(),
        kickInRes.json(),
        kickOutRes.json(),
        abnormalRes.json()
      ]);

      setCount(inData.count);
      setShiftOutCount(outData.count);
      setKickInCount(kickInData.kickInCount);
      setKickOutCount(kickOutData.kickOutCount);
      setAbnormalCount(abnormalData.abnormalCount);
    } catch (err) {
      console.error(err);
    }
  };

  fetchAllCounts();
  const interval = setInterval(fetchAllCounts, 1000);
  return () => clearInterval(interval);
}, []);

const [shiftcountin, setCount] = useState(0);
const [shiftOutCount, setShiftOutCount] = useState(0);

useEffect(() => {

  const fetchCounts = async () => {
    try {
      const res1 = await fetch("http://192.168.0.20:4001/api/camshiftindata");
      const data1 = await res1.json();
      console.log("Fetched IN count:", data1.count);
      setCount(data1.count);

      const res2 = await fetch("http://192.168.0.20:4001/api/camshiftDataOut");
      const data2 = await res2.json();
      console.log("Fetched OUT count:", data2.count);
      setShiftOutCount(data2.count);

    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  fetchCounts(); 

  const interval = setInterval(fetchCounts, 1000);

  return () => clearInterval(interval);

}, []);

  const [kickInCount, setKickInCount] = useState(0);
  const [kickOutCount, setKickOutCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const kickInRes = await fetch("http://192.168.0.20:4001/api/cam_kickin");
        const kickInData = await kickInRes.json();
        setKickInCount(kickInData.kickInCount);

        const kickOutRes = await fetch("http://192.168.0.20:4001/api/cam_kickout");
        const kickOutData = await kickOutRes.json();
        setKickOutCount(kickOutData.kickOutCount);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCounts();
  }, []);

const [abnormalCount, setAbnormalCount] = useState(0);

useEffect(() => {
  const fetchAbnormal = async () => {
    try {
      const res = await fetch("http://192.168.0.20:4001/api/camabnormalCycleData");
      const data = await res.json();
      setAbnormalCount(data.abnormalCount);
    } catch (err) {
      console.error(err);
    }
  };

  fetchAbnormal();
}, []);


const [straightPass, setStraightPass] = useState<string>('0%');

useEffect(() => {
  const calculateStraightPass = () => {
    if (shiftcountin > 0) {
      const sPassValue = ((shiftcountin - abnormalCount) / shiftcountin) * 100;
      setStraightPass(`${sPassValue.toFixed(2)}%`);
    } else {
      setStraightPass('0%');
    }
  };

  calculateStraightPass();
 
}, [shiftcountin, abnormalCount]);


interface EngineData {
  serialno: string | null;
  engineCode: string | null;
}

const [serialno, setserialNo] = useState<string>("-");
const [engineCode, setEngineCode] = useState<string>("-");

useEffect(() => {
  const fetchEngineData = async () => {
    const res = await fetch("http://192.168.0.20:4001/api/camengine-number");
    const data: EngineData = await res.json();

    setserialNo(data.serialno ?? "-");
    setEngineCode(data.engineCode ?? "-");
  };

  fetchEngineData();
  const interval = setInterval(fetchEngineData, 1000);
  return () => clearInterval(interval);
}, []);

interface ApiResponse {
  judgements: Record<string, number[]>;
  mainJudgements: Record<string, number>;
  stdDeviationTimes: string[];
}


const applyCellStyle = (id: string, value: number | null | undefined) => {
  const el = document.getElementById(id);
  if (!el) return;

  if (value === 1) {
    el.style.backgroundColor = "lightgreen";
  } else if (value === 0) {
    el.style.backgroundColor = "red";
    el.style.color = "white";
  } else {
    el.style.backgroundColor = "transparent";
  }
};


useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await fetch("http://192.168.0.20:4001/api/camengine-number");
      const data: ApiResponse = await res.json();

      for (let row = 2; row <= 3; row++) {
        const rowKey = `row${row}`;
        const values = data.judgements[rowKey] || [];

        for (let col = 1; col <= 5; col++) {
          const cellId = `cam_quality${row}data${col}`;
          

          applyCellStyle(cellId, values[col - 1]);
          
        }
      }

      let allGreen = true;
      for (let row = 2; row <= 3; row++) {
        const cellId = `cam_qualityresult${row}`;
        const value = data.mainJudgements[`row${row}`];

        const el = document.getElementById(cellId);
        if (!el) continue;

        const valueStr = value !== null && value !== undefined ? value.toString() : "";
        const newText =
          valueStr === "OK" ? "OK" :
          valueStr === "NG" ? "NG" :
          "-";

        if (el.innerText !== newText) el.innerText = newText;

        const newBg =
          newText === "OK" ? "lightgreen" :
          newText === "NG" ? "red" :
          "transparent";

        if (el.style.backgroundColor !== newBg) {
    el.style.backgroundColor = newBg;

    el.style.color = newBg === "red" ? "white" : "black";
  }

        if (newText !== "OK") allGreen = false;
      }

      const imgEl = document.getElementById("cam_result-img") as HTMLImageElement | null;
      if (imgEl) {
        imgEl.src = allGreen ? okay : notokay;
        imgEl.alt = allGreen ? "OK" : "NOT OK";
      }

      const stdIds = [
        "cam_timestd2",
        "cam_timestd3"
      ];

      if (Array.isArray(data.stdDeviationTimes)) {
  stdIds.forEach((id, index) => {
    const el = document.getElementById(id);
    if (!el) return;

    const value = data.stdDeviationTimes[index];
    el.innerText =
      value !== null && value !== undefined
        ? value.toString()
        : "-";
  });
}
    } catch (err) {
      console.error("❌ Error fetching cam engine data:", err);
    }
  };

  fetchData();
  const interval = setInterval(fetchData, 1000);
  return () => clearInterval(interval);
}, []);


  interface TableData {
  [key: string]: {
    JUDGEMENT_1?: number;
    JUDGEMENT_2?: number;
    JUDGEMENT_3?: number;
    JUDGEMENT_4?: number;
    JUDGEMENT_5?: number;
    TIME_DEVIATION?: number;
  } | null;
}

const tableRowMap: Record<string, number> = {
  idwriting:1,
  greaseapplication: 2,
  pistoncollation: 3,
  vvtcoil: 4
};


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const writeCellValue = (id: string, value: any) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerText = value !== null && value !== undefined ? String(value) : "-";
};

useEffect(() => {
  if (!serialno) return;

  const fetchDetails = async () => {
    const res = await fetch(
      `http://192.168.0.20:4001/api/camengine-details/${serialno}`
    );
    const data: TableData = await res.json();

    for (const [tableKey, rowNo] of Object.entries(tableRowMap)) {
      const rowData = data[tableKey];
      if (!rowData) continue;

      writeCellValue(`cam_timedev${rowNo}`, rowData.TIME_DEVIATION);

      for (let i = 1; i <= 4; i++) {
        writeCellValue(
          `cam_quality${rowNo}data${i}`,
          rowData[`JUDGEMENT_${i}` as keyof typeof rowData]
        );
      }
    }
  };

  fetchDetails();
  const interval = setInterval(fetchDetails, 1000);
  return () => clearInterval(interval);
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [serialno]);

interface ProcessMinutes {
  TIZZ350_ID_WRITING: string | null;
  TIAS314_GREASE_APPLICATION: string | null;
  TIZZ366_PISTON_COLLATION: string | null;
  TITM310_VVT_COIL: string | null;
}

const computeEngineArrows = (pm: ProcessMinutes | undefined) => {
  if (!pm) return;

  const parseDateTime = (t: string | null): Date | null => {
    if (!t) return null;
    const d = new Date(t);
    return isNaN(d.getTime()) ? null : d;
  };

  const diffSeconds = (later: string | null, earlier: string | null): number | null => {
    const d1 = parseDateTime(later);
    const d0 = parseDateTime(earlier);
    if (!d1 || !d0) return null;
    return Math.round((d1.getTime() - d0.getTime()) / 1000);
  };

  const setVal = (id: string, val: number | null) => {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (el) el.value = val !== null ? String(val) : "";
  };

  setVal("cam_arrow1data", diffSeconds(pm.TIAS314_GREASE_APPLICATION, pm.TIZZ350_ID_WRITING));
  setVal("cam_arrow3data", diffSeconds(pm.TIZZ366_PISTON_COLLATION, pm.TIAS314_GREASE_APPLICATION));
  setVal("cam_arrow6data", diffSeconds(pm.TITM310_VVT_COIL, pm.TIZZ366_PISTON_COLLATION));
  
};

const computeEngineTPT = (pm: ProcessMinutes | undefined) => {
  if (!pm) return;

  const startTime = pm.TIZZ350_ID_WRITING;      
  const endTime = pm.TITM310_VVT_COIL;     

  if (!startTime || !endTime) return;

  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  if (isNaN(start) || isNaN(end)) return;

  const diffSeconds = Math.floor((end - start) / 1000);
  if (diffSeconds < 0) return;

  const minutes = Math.floor(diffSeconds / 60);
  const seconds = diffSeconds % 60;

  const formatted = `${minutes}m ${seconds}s`;

  const tptEl = document.getElementById("cam_tpt-data") as HTMLInputElement | null;
  if (tptEl) tptEl.value = formatted;
};

useEffect(() => {
  if (!serialno) return;

  const fetchKickStationsAndProcess = async () => {
    try {
     const res = await fetch(
  "http://192.168.0.20:4001/api/camengine-number"
);

      const data = await res.json();

      computeEngineArrows(data.processMinutes);
      computeEngineTPT(data.processMinutes);

    } catch (err) {
      console.error("❌ Error fetching kick stations:", err);
    }
  };

  fetchKickStationsAndProcess();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [serialno]);


useEffect(() => {
  const fetchPingData = async () => {
    try {
      const response = await fetch('http://192.168.0.20:4001/api/camping');
      const json = await response.json();
      const values = json.data;

      const ids = [
        'cam_machine1-2','cam_machine1-3','cam_machine1-4','cam_machine1-5','cam_machine2-1'];

      ids.forEach((id, index) => {
        const element = document.getElementById(id);
        if (element) {
          if (values[index] === '0') {
            element.style.backgroundColor = 'red';
            element.style.color = 'white';
          } else {
            element.style.backgroundColor = '';
            element.style.color = '';
          }
        }
      });
    } catch (error) {
      console.error('Error fetching ping data:', error);
    }
  };

  fetchPingData(); 
  const interval = setInterval(fetchPingData, 2000); 

  return () => clearInterval(interval);
}, []);

  return (

  <div id="cam_head1"  className={showSettings ? "blur" : ""}>
    <header>
     <img
  src={menu}
  alt="menu"
  width="80"
  height="100"
  id='cam_menu'
  onMouseEnter={() => setShowMenu(true)}
  onMouseLeave={() => setShowMenu(false)}
/>
    <h2>Cam-HSG FIREWALL – MAIN DASHBOARD</h2>
    <img src={tiei1} alt="TIEI-1" width="50" height="60" id="cam_tiei1" />
    <img src={tiei2} alt="TIEI-2" width="240" height="60" id="cam_tiei2" />
    <img 
  src={live} 
  alt="live" 
  width="80" 
  height="80" 
  id='cam_live'
  onClick={handleLiveClick} 
/>
    <div id="cam_tiei3">
    <FontAwesomeIcon
      icon={faGear}
      size="2x"
      spin={isSpinning}   
      onClick={handleGearClick} 
      style={{ marginTop: '20px', color: '0,112,192' }} id='cam_settings'
    />
    </div>
    </header>

    <main id="cam_dashboard-table">
      <span id="cam_ss1">Shift Status</span>
      <table>
        <tbody>
          <tr id="cam_row1">
            <td rowSpan={2} id="cam_box1">IN</td>
            <td rowSpan={2} id="cam_shift-in">
              {shiftcountin}
            </td>

            <td id="cam_box2">KICK OUT</td>
            <td id="cam_kick-out">{kickOutCount}</td>

            <td rowSpan={2} id="cam_box3">OUT</td>
            <td rowSpan={2} id="cam_shift-out">
            {shiftOutCount !== null ? shiftOutCount : '-'}
            </td>

            <td rowSpan={2} id="cam_box4">Abnormal cycle</td>
            {/* <td rowSpan={2} id="cam_A-cycle">{abnormalCycleCount !== null ? abnormalCycleCount : '-'}</td> */}
            <td rowSpan={2} id="cam_A-cycle">{abnormalCount}</td>


            <td rowSpan={2} id="cam_box5">Straight-Pass</td>
            <td rowSpan={2} id="cam_S-pass">{straightPass}</td>

            {/* <td rowSpan={2} id="cam_S-pass">{straightPass !== null ? straightPass : '-'}</td> */}
          </tr>
          <tr id="cam_row1-sub">
            <td id="cam_box6">KICK IN</td>
            <td id="cam_kick-in">{kickInCount}</td>
          </tr>
        </tbody>
      </table>
    </main>

    <div id="cam_row2">
      <span style={{ marginLeft: "-84%",marginTop: "1%" ,color: "blue", fontStyle: "italic", fontSize: "35px", fontWeight: "bold"}} id='cam_layout'>Layout:</span>
      <div id='cam_top-box'>
        <label htmlFor="tpt-data" id="cam_tpt" style={{marginLeft: "2%", marginTop: "-80px"}}>Throughput time</label>
        <input
          type="text"
          id="cam_tpt-data"
          style={{
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            fontSize: "15px",
            fontWeight: "bold",
            border: "none",
            borderBottom: "1px solid gray",
            marginLeft: "-33px",
            padding: "5px",
            textAlign: "center",
           marginTop: "10px"
          }}
          placeholder="number" readOnly
        /></div>

          <table id="cam_row2-tbl">
  <tbody>
    <tr>
      <td>
        <div className="legend-item">
          <div className="icon-box machine-bg">
            <img src={Machine} alt="machine" />
          </div>
          <span>- Machines</span>
        </div>
      </td>
    </tr>

    <tr>
      <td>
        <div className="legend-item">
          <div className="icon-box manual-bg">
            <img src={Man} alt="man" />
          </div>
          <span>- Manual stations</span>
        </div>
      </td>
    </tr>

    <tr>
      <td>
        <div className="legend-item">
          <div className="icon-box buffer-bg">
            <img src={B} alt="B" />
          </div>
          <span>- Idle/Buffer stations</span>
        </div>
      </td>
    </tr>
  </tbody>
</table>
       
        <h2 id="cam_ch">Cam Housing sub</h2>
        <img src={cylinder} alt="cylinder" width="22%" height="22%" id="cam_ch-pic" />
      
    </div>

    <div>
      <table>
        <tbody>
          <tr id="cam_row3">
            <td id="cam_B-1">
              <img src={B} alt="B" width="40" height="40" style={{ marginLeft: "14px", marginTop: "8px" }} id='cam_b1' />
            </td>
            <td id="cam_machine1-5">
              Cam-cap tighten
               <img src={Machine} alt="machine" width="30" height="25" id='cam_def-machine1-5'  />
            </td>
             <td id="cam_man-2">
             Backup Cam-cap tighten
             <img src={Man} alt="man" width="45" height="45" style={{ marginTop: "15px", marginLeft: "15px" }}  id='cam_man2' />
            </td>
            <td id="cam_machine1-4">
             Grease Application
              <img src={Machine} alt="machine" width="30" height="25" id='cam_def-machine1-4'  />
            </td>
             <td id="cam_B-3">
              <img src={B} alt="B" width="40" height="40" style={{ marginLeft: "14px", marginTop: "8px" }}  id='cam_b3'/>
            </td>
              <td id="cam_machine1-3">
             Cam shaft assy
              <img src={Machine} alt="machine" width="30" height="25" id='cam_def-machine1-3'  />
            </td>
          
            <td id="cam_B-4">
              <img src={B} alt="B" width="40" height="40" style={{ marginLeft: "14px", marginTop: "8px" }}  id='cam_b4'/>
            </td>
         
            <td id="cam_machine1-2">
              ID Writing
              <img src={Machine} alt="machine" width="30" height="25" id='cam_def-machine1-2'  />
            </td>
         
          </tr>
        </tbody>
      </table>
    </div>

    {/* <div id='cam_md'>
      <table >
        <tr >
          <td style={{border: "none", marginTop: "-20px"}}>
            <p style={{fontSize: "40px", lineHeight: "2", marginLeft: "60px",marginBottom:"0px"}}>↑</p>
            <span id='cam_dolly'
              style={{
              border: "1px solid black",
              padding:"15px",
              fontSize: "17px",
              fontWeight: "bold",
            }}>Manual dolly</span>
            <p style={{fontSize: "40px", lineHeight: "2", marginLeft: "60px", marginTop:"-10px"}}>↓</p>
          </td>
        </tr>
      </table>
    </div> */}

        <div className="cam_arrow-line">
    <span className="cam_arrow4">--------------▷</span>
    <span className="cam_arrow3">◁----------------------▷</span>
    <span className="cam_arrow2">◁--------------------▷</span>
    <span className="cam_arrow1">◁---------------------▷</span>
</div>

<div className='cam_arrowlinedata1'>
  <input type="text" id='cam_arrow3data' readOnly/>
  <input type="text" id='cam_arrow2data' readOnly/>
  <input type="text" id='cam_arrow1data'  readOnly/>
</div>

<div className='cam_arrowlinedata2'>
  <input type="text" id='cam_arrow6data' readOnly/>
</div>


<div className="cam_arrow-line2">
    <span className="cam_arrow6">--------------------------------------------------------------▷</span>
</div>

<div id='cam_logic'>
 <div id='cam_md'>
 <p style={{fontSize: "40px", lineHeight: "2", marginLeft: "60px",marginBottom:"0px",color:"rgb(138, 135, 135)"}} id='cam_up'>↑</p>
  <span id='cam_dolly'
  style={{
    border: "1px solid rgb(138, 135, 135)",
    padding:"15px",
    fontSize: "17px",
    fontWeight: "bold",
  }}>Transfer</span>
 <p style={{fontSize: "40px", lineHeight: "2", marginLeft: "60px", marginTop:"-10px",color:"rgb(138, 135, 135)"}}  id='cam_down'>↓</p>
</div>

<div id='cam_fd1'>
  <p style={{color:"red",marginLeft:"1020px",marginTop: "-210px"}} id='cam_flow-right'>Flow direction</p>
  <p
  id='cam_right-line'
  style={{
    fontSize: "18px",
    lineHeight: "2",
    marginLeft: "1020px",
    fontFamily: "monospace",
    marginTop: "-20px",
    color: "red"
  }}
>
  ◁---------
</p>
</div>

<div id='cam_fd2'>
<p style={{marginTop: "-140px",marginLeft:"-110px",color:"red"}} id='cam_flow-left'>Flow direction</p>
<p
 id='cam_left-line'
  style={{
    fontSize: "18px",
    lineHeight: "2",
    marginLeft: "-110px",
    marginTop: "-25px",
    fontFamily: "monospace",
    color: "red"
  }}
>
   {/* ─ ─ ─ ─ ─ ─*/}
 ---------▷
</p>
</div>
</div>

    <div>
      <table>
        <tbody>
          <tr id="cam_row4">
             <td id="cam_man2-4">
              <img src={Man} alt="man" width="36" height="36" style={{ marginTop: "1px", marginLeft: "35px" }} id='cam_man24'/>
              <span style={{ marginTop: "10px" }}>D4 lifter guide</span>
            </td>
             <td id="cam_B2-1">
              <img src={B} alt="B" width="40" height="40" style={{ marginLeft: "14px", marginTop: "10px" }} id='cam_b21'/>
            </td>
                 <td id="cam_man2-5">
              <img src={Man} alt="man" width="36" height="36" style={{ marginTop: "1px", marginLeft: "35px" }}id='cam_man25' />
              <span style={{ marginTop: "10px" }}>VVT</span>
            </td>
             <td id="cam_B2-2">
              <img src={B} alt="B" width="40" height="40" style={{ marginLeft: "14px", marginTop: "10px" }} id='cam_b22' />
            </td>
            <td id="cam_machine2-1">
             VVT Vision
              <img src={Machine} alt="machine" width="30" height="25" id='cam_def-machine2-1'  />
            </td>
            
            <td id="cam_B2-3">
              <img src={B} alt="B" width="40" height="40" style={{ marginLeft: "14px", marginTop: "10px" }} id='cam_b23'/>
            </td>
         
            <td id="cam_B2-4">
              <span style={{
                display:"flex",
               justifyContent: "center",
               alignItems: "center",
               marginTop: "10px",
               backgroundColor: "rgba(251,243,225)",
               padding: "6px",
               border: "2px solid orange"
              }} id='cam_b24'>C/H</span>
            </td>
            <td style={{
              height:"50px",
              marginTop: "65px",
              marginLeft: "-55px"
              }}  id='cam_downarrow'><img src={downarrow} alt="downarrow" width="45" height="55"  id='cam_downarrow-img'/></td>
            <td style={{
              marginLeft:"9px"
            }} id='cam_uparrow'><img src={uparrow} alt="uparrow" width="45" height="100"  id='cam_uparrow-img'/></td>
          </tr>
        </tbody>
      </table>
    </div>


    <div id="cam_lastrow">
      <div id="cam_row5">
        <table id="cam_row5-tbl">
          <tbody>
  <tr id="cam_cell1">
    <td
      style={{
        border: "2px solid orange",
        width: "25%",
        fontSize: "25px",
        padding: "10px",
      }}
    >
      Current Part Status
    </td>
  </tr>

  <tr id="cam_cell2">
    <td style={{ border: "none",  padding: "5px" }}>
      Cam-HSG Sl No
    </td>
  </tr>

  <tr id="cam_cell3">
    <td style={{ border: "none" }}>
      {serialno}
    </td>
  </tr>

  <tr id="cam_cell4">
    <td style={{ border: "none",  padding: "5px" }}>
      Eng code
    </td>
  </tr>

  <tr id="cam_cell5">
    <td style={{ border: "none" }}>
    {engineCode}
    </td>
  </tr>
</tbody>
        </table>
      </div>

      <div id="cam_row6">
        <table id="cam_row6-tbl">
          <tbody>

  <tr id="cam_line1">
    <td></td>
    <td colSpan={2} id='cam_time-stamp'>Time Stamp</td>
    <td colSpan={11}>Quality</td>
  </tr>

  <tr id="cam_line2">
    <td id='cam_machine'>Machine</td>
    <td id='cam_std1'>STD</td>
    <td id='cam_dev'>DEV</td>
     <td id='cam_qualitydata1'>#1</td>
    <td id='cam_qualitydata2'>#2</td> 
    <td id='cam_qualitydata3'>#3</td>
    <td id='cam_qualitydata4'>#4</td>
    <td id='cam_qualitydata5'>#5</td>
    <td id='cam_qualityresult'>Result</td>
    
  </tr>

  <tr id="cam_line3">
    <td>Cam shaft Vision</td>
    <td id="cam_timestd1"></td>
    <td id="cam_timedev1"></td>
    <td id="cam_quality1data1"></td>
    <td id="cam_quality1data2"></td>
    <td id="cam_quality1data3"></td>
    <td id="cam_quality1data4"></td>
    <td id="cam_quality1data5"></td>
    <td id="cam_qualityresult1"></td>
  </tr>

  <tr id="cam_line4">
    <td>Grease Application</td>
    <td id="cam_timestd2"></td>
    <td id="cam_timedev2"></td>
    <td id="cam_quality2data1"></td>
    <td id="cam_quality2data2"></td>
    <td id="cam_quality2data3"></td>
    <td id="cam_quality2data4"></td>
    <td id="cam_quality2data5"></td>
    <td id="cam_qualityresult2"></td>
  </tr>

  <tr id="cam_line5">
    <td>Cam-cap tightening</td>
    
    <td id="cam_timestd3"></td>
    <td id="cam_timedev3"></td>
    <td id="cam_quality3data1"></td>
    <td id="cam_quality3data2"></td>
    <td id="cam_quality3data3"></td>
    <td id="cam_quality3data4"></td>
    <td id="cam_quality3data5"></td>
    <td id="cam_qualityresult3"></td>
  </tr>

  <tr id="cam_line6">
    <td>VVT vision</td>
    
    <td id="cam_timestd4"></td>
    <td id="cam_timedev4"></td>
    <td id="cam_quality4data1" ></td>
    <td id="cam_quality4data2"></td>
    <td id="cam_quality4data3"></td>
    <td id="cam_quality4data4"></td>
    <td id="cam_quality4data5"></td>
    <td id="cam_qualityresult4">
      </td>
  </tr>


</tbody>

        </table>
      </div>
 {/* <div id='cam_btns'>
        <button type='submit' id='cam_btn1'>TO KICK IN/OUT</button>
        <button type='submit' id='cam_btn3'>BACK TO MAIN</button>
        <button type='submit' id='cam_btn4'>GO TO LIVE</button>
      </div> */}
      <div id='cam_row7'>
  <table id='cam_result'>
    <tbody>
      <tr><td id='cam_result1'>Overall Judgement</td></tr>
      <tr><td id='cam_result2'><img src={okay} alt="okay" height="150" width="150"  id='cam_result-img'/></td></tr>
      <tr><td
  id='cam_result3'
  onClick={handleKickClick}
  style={{ cursor: "pointer", fontWeight: "bold"}}>TO KICK IN / OUT</td></tr>
    </tbody>
  </table>
</div>
      </div>
      {showMenu && (
  <Menu setShowMenu={setShowMenu}
  />
)}
  {showLiveOverlay && <Golive closeOverlay={() => setShowLiveOverlay(false)} />}
    </div>
    );

};

export default App;