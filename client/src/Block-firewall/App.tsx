/* eslint-disable react-hooks/exhaustive-deps */
import '../Block-firewall/index.css';

import {
  useEffect,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import { faGear } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import B from '../assets/B.png';
import cylinder from '../assets/Block.png';
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
import Golive from '../Block-firewall/GOLIVE';
import Menu from '../Block-firewall/menu';

type DataRow = {
  asn: string;
  suffix: string;
};

const App = () => {
    const [, setData] = useState<DataRow[]>([]);
  //console.log(data);
  const [showSettings, setShowSettings] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showLiveOverlay, setShowLiveOverlay] = useState(false);

const navigate = useNavigate();

const handleKickClick = () => {
  navigate("/block-firewall/kick_io"); 
};

  const handleLiveClick = () => {
  setShowLiveOverlay(true);
};

  const handleGearClick = () => {
    window.open("/blocklogin", "_blank");
    setShowSettings(true);
  };

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch('http://192.168.0.20:4001/api/data');
      const jsonData = await response.json();
      // console.log(jsonData);
      setData(jsonData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  fetchData();
}, []);

  const [shiftInCount, setShiftInCount] = useState<number | null>(null);

 useEffect(() => {
  const fetchShiftData = async () => {
    try {
      const response = await fetch('http://192.168.0.20:4001/api/blockshiftindata');
      const json = await response.json();
      setShiftInCount(json.count);
    } catch (error) {
      console.error('❌ Error fetching shift data:', error);
    }
  };

  fetchShiftData();
  const interval = setInterval(fetchShiftData, 1000);

  return () => clearInterval(interval);
}, []);

 const [shiftOutCount, setShiftOutCount] = useState<number | null>(null);

 useEffect(() => {
   const fetchShiftOutData = async () => {
     try {
       const response = await fetch('http://192.168.0.20:4001/api/blockshiftDataOut');
       const json = await response.json();
       setShiftOutCount(json.count);
     } catch (error) {
       console.error('❌ Error fetching shift out data:', error);
     }
   };

   fetchShiftOutData();
   const interval = setInterval(fetchShiftOutData, 1000);

   return () => clearInterval(interval);
 }, []);

const [kickInCount, setKickInCount] = useState<number | null>(null);
const [kickOutCount, setKickOutCount] = useState<number | null>(null);

useEffect(() => {
  const fetchKickInData = async () => {
    try {
      const response = await fetch('http://192.168.0.20:4001/api/block_kickin');
      const json = await response.json();
      setKickInCount(json.kickInCount ?? 0);
    } catch (error) {
      console.error('❌ Error fetching kick-in data:', error);
    }
  };
  fetchKickInData(); 
  const interval = setInterval(fetchKickInData, 1000);
  return () => clearInterval(interval);
}, []);

useEffect(() => {
  const fetchKickOutData = async () => {
    try {
      const response = await fetch('http://192.168.0.20:4001/api/block_kickout');
      const json = await response.json();
      setKickOutCount(json.kickOutCount ?? 0);
    } catch (error) {
      console.error('❌ Error fetching kick-out data:', error);
    }
  };
  fetchKickOutData(); 
  const interval = setInterval(fetchKickOutData, 1000);
  return () => clearInterval(interval);
}, []);

const [abnormalCycleCount, setAbnormalCycleCount] = useState<number | null>(null);

useEffect(() => {
  const fetchAbnormalCycleData = async () => {
    try {
      const response = await fetch('http://192.168.0.20:4001/api/blockabnormalCycleData');
      const json = await response.json();
      setAbnormalCycleCount(json.abnormalCount ?? 0);
      const aCycleElement = document.getElementById('block_A-cycle');
      if (aCycleElement) {
        aCycleElement.textContent = (json.abnormalCount ?? 0).toString();
      }
    } catch (error) {
      console.error('❌ Error fetching abnormal cycle data:', error);
    }
  };
  fetchAbnormalCycleData();
  const interval = setInterval(fetchAbnormalCycleData, 1000);
  return () => clearInterval(interval);
}, []);

const [straightPass, setStraightPass] = useState<string>('0%');
useEffect(() => {
  const calculateStraightPass = () => {
    if (
      shiftInCount !== null &&
      abnormalCycleCount !== null &&
      shiftInCount > 0
    ) {
      const sPassValue =
        ((shiftInCount - abnormalCycleCount) / shiftInCount) * 100; 

      const formattedValue =
        sPassValue < 10
          ? `${sPassValue.toFixed(2)}%`
          : `${sPassValue.toFixed(2)}%`; 

      setStraightPass(formattedValue);

      const sPassElement = document.getElementById('block_S-pass');
      if (sPassElement) {
        sPassElement.textContent = formattedValue;
      }
    } else {
      setStraightPass('0%');
    }
  };

  calculateStraightPass();
  const interval = setInterval(calculateStraightPass, 1000);

  return () => clearInterval(interval);
}, [shiftInCount, abnormalCycleCount]);

interface EngineData {
  engineNumber: string | null;
  engineCode: string | null;
  serialno: string | null;
  pistonStatus: string | null;
}

const [engineNo, setEngineNo] = useState<string>("-");
const [engineCode, setEngineCode] = useState<string>("-");
const [pistonStatus, setPistonStatus] = useState<string>("-");
// const [serialno, setSerialno] = useState<string>("-");

useEffect(() => {
  const fetchEngineData = async () => {
    try {
      const res = await fetch("http://192.168.0.20:4001/api/blockengine-number");
      const data: EngineData = await res.json();

      setEngineNo(data.engineNumber ?? "-");
      setEngineCode(data.engineCode ?? "-");

      setPistonStatus(data.pistonStatus ?? "-");

    } catch (error) {
      console.error(error);
    }
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

  let newBg = "transparent";
  let newColor = "black";

  if (value === 1) {
    newBg = "lightgreen";
    newColor = "black";
  } else if (value === 0) {
    newBg = "red";
    newColor = "white";
  }

  if (el.style.backgroundColor !== newBg) el.style.backgroundColor = newBg;
  if (el.style.color !== newColor) el.style.color = newColor;
};


useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await fetch("http://192.168.0.20:4001/api/blockengine-number");
      const data: ApiResponse = await res.json();

      const judgementCellMap: Record<string, number[]> = {
        row1: [1],
        row2: [1],
        row3: [1, 2, 3],
        row4: [1, 2, 3],
        row5: [1, 2, 3],
        row6: [1],
        row7: [1, 2, 3, 4, 5],
        row8: [1],
        row9: [1, 2, 3, 4, 5],
        row10: [1, 2, 3, 4, 5]
      };

      Object.entries(judgementCellMap).forEach(([rowKey, cols]) => {
  const rowNo = Number(rowKey.replace("row", ""));
  const values = data.judgements[rowKey] || [];

  if (rowNo === 4) {

    const judgement1 = values[0];
    const judgement3 = values[1];

    applyCellStyle(`block_quality4data1`, judgement3);
    applyCellStyle(`block_quality4data2`, judgement1);

    return;
  }

  if (rowNo === 5) {

    const judgement1 = values[0];
    const judgement3 = values[2];

    applyCellStyle(`block_quality5data1`, judgement3);
    applyCellStyle(`block_quality5data2`, judgement1);

    return;
  }

  cols.forEach((colIndex, i) => {
    const cellId = `block_quality${rowNo}data${colIndex}`;
    applyCellStyle(cellId, values[i]);
  });
});

      let allGreen = true;

      for (let row = 1; row <= 10; row++) {

        const cellId = `block_qualityresult${row}`;
        const el = document.getElementById(cellId);
        if (!el) continue;

        const value = data.mainJudgements[`row${row}`];

        const valueStr =
          value !== null && value !== undefined
            ? String(value)
            : "";

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

      const imgEl = document.getElementById("block_result-img") as HTMLImageElement | null;
      if (imgEl) {
        imgEl.src = allGreen ? okay : notokay;
        imgEl.alt = allGreen ? "OK" : "NOT OK";
      }

      const stdIds = [
        "block_timestd1",
        "block_timestd2",
        "block_timestd3",
        "block_timestd4",
        "block_timestd5",
        "block_timestd6",
        "block_timestd7",
        "block_timestd8",
        "block_timestd9",
        "block_timestd10"
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
      console.error("❌ Error fetching block engine data:", err);
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
    JUDGEMENT_6?: number;
    JUDGEMENT_7?: number;
    JUDGEMENT_8?: number;
    JUDGEMENT_9?: number;
    JUDGEMENT_10?: number;
    TIME_DEVIATION?: number;
  } | null;
}
const tableRowMap: Record<string, number> = {
  engraving: 1,
  labelPrinter: 2,
  idWriting: 3,
  lower: 4,
  upper: 5,
  chutter: 6,
  crankNr: 7,
  collation: 8,
  conrod: 9,
  pistonCollation: 10,
  crankFIPG: 11
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const writeCellValue = (id: string, value: any) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerText = value !== null && value !== undefined ? String(value) : "-";
};

useEffect(() => {
  if (!engineNo) return;

  const fetchDetails = async () => {
    const res = await fetch(
      `http://192.168.0.20:4001/api/blockengine-details/${engineNo}`
    );
    const data: TableData = await res.json();

    for (const [tableKey, rowNo] of Object.entries(tableRowMap)) {
      const rowData = data[tableKey];
      if (!rowData) continue;

   
      writeCellValue(`block_timedev${rowNo}`, rowData.TIME_DEVIATION);

    
      if (tableKey === "crankNr" || tableKey === "conrod") {
        const pairs = [
          [rowData.JUDGEMENT_1, rowData.JUDGEMENT_2],
          [rowData.JUDGEMENT_3, rowData.JUDGEMENT_4],
          [rowData.JUDGEMENT_5, rowData.JUDGEMENT_6],
          [rowData.JUDGEMENT_7, rowData.JUDGEMENT_8],
          [rowData.JUDGEMENT_9, rowData.JUDGEMENT_10]
        ];

        pairs.forEach((pair, index) => {
          const value1 = pair[0] ?? "-";
          const value2 = pair[1] ?? "-";

          writeCellValue(
            `block_quality${rowNo}data${index + 1}`,
            `${value1} & ${value2}`
          );
        });

      } 

      else if (tableKey === "lower" || tableKey === "upper") {
        const data1 = rowData.JUDGEMENT_3 ?? "-"; 
        const data2 = rowData.JUDGEMENT_1 ?? "-";

        const label = tableKey === "lower" ? "Block -" : "Crank -";

        writeCellValue(`block_quality${rowNo}data1`, data1);

        writeCellValue(`block_quality${rowNo}data2`, `${label} ${data2}`);

        for (let i = 3; i <= 5; i++) {
          writeCellValue(`block_quality${rowNo}data${i}`, "-");
        }
      } 
   
      else {
        for (let i = 1; i <= 5; i++) {
          const rawValue = rowData[`JUDGEMENT_${i}` as keyof typeof rowData];
          let displayValue: string;

          if (tableKey === "pistonCollation") {
            const numericValue = Number(rawValue);
            displayValue =
              numericValue === 1 ? "O" :
              numericValue === 0 ? "X" :
              "-";
          } else {
            displayValue =
              rawValue !== null && rawValue !== undefined
                ? String(rawValue)
                : "-";
          }

          writeCellValue(`block_quality${rowNo}data${i}`, displayValue);
        }
      }
    }
  };

  fetchDetails();
  const interval = setInterval(fetchDetails, 1000);
  return () => clearInterval(interval);
}, [engineNo]);

interface ProcessMinutes {
  TIZZ320_ENGRAVING: string | null;
  TIZZ322_ENGINE_LABEL: string | null;
  TIZZ325_ID_WRITING: string | null;
  TIZZ323_LOWER_BEARING: string | null;
  TIZZ352_CHUTTER: string | null;
  TIAS307_CRANK_NR: string | null;
  TIZZ353_BLOCK_PISTON_COLLATION: string | null;
  TIAS308_CONROD_NR: string | null;
  TIAS309_COLLATION: string | null;
  BLOCK_RESULT: string | null
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

 
  setVal("block_arrow2data", diffSeconds(pm.TIZZ322_ENGINE_LABEL, pm.TIZZ320_ENGRAVING));
  setVal("block_arrow3data", diffSeconds(pm.TIZZ325_ID_WRITING, pm.TIZZ322_ENGINE_LABEL));
  setVal("block_arrow6data", diffSeconds(pm.TIZZ323_LOWER_BEARING, pm.TIZZ325_ID_WRITING));
  setVal("block_arrow7data", diffSeconds(pm.TIZZ352_CHUTTER, pm.TIZZ323_LOWER_BEARING));
  setVal("block_arrow8data", diffSeconds(pm.TIAS307_CRANK_NR, pm.TIZZ352_CHUTTER));
  setVal("block_arrow9data", diffSeconds(pm.TIZZ353_BLOCK_PISTON_COLLATION, pm.TIAS307_CRANK_NR));
  setVal("block_arrow10data", diffSeconds(pm.TIAS308_CONROD_NR, pm.TIZZ353_BLOCK_PISTON_COLLATION));
  setVal("block_arrow11data", diffSeconds(pm.TIAS309_COLLATION, pm.TIAS308_CONROD_NR));
  setVal("block_arrow12data", diffSeconds(pm.BLOCK_RESULT, pm.TIAS309_COLLATION));
  
  computeEngineTPT(pm);
};

// const computeEngineTPT = () => {
//   const arrowIds = [
//     "block_arrow2data",
//     "block_arrow3data",
//     "block_arrow4data",
//     "block_arrow7data",
//     "block_arrow8data",
//     "block_arrow9data",
//     "block_arrow10data",
//     "block_arrow11data",
//     "block_arrow12data"
//   ];

//   let totalSeconds = 0;

//   arrowIds.forEach(id => {
//     const el = document.getElementById(id) as HTMLInputElement | null;
//     if (!el) return;

//     const val = Number(el.value);
//     if (!isNaN(val)) totalSeconds += val;
//   });

//   const minutes = Math.floor(totalSeconds / 60);
//   const seconds = totalSeconds % 60;

//   const formatted = `${minutes}m ${seconds}s`;

//   const tptEl = document.getElementById("block_tpt-data") as HTMLInputElement | null;
//   if (tptEl) tptEl.value = formatted;
// };

const computeEngineTPT = (processMinutes: ProcessMinutes | undefined) => {

  const engravingTime = processMinutes?.TIZZ320_ENGRAVING;
  const blockResultTime = processMinutes?.BLOCK_RESULT;

  if (!engravingTime || !blockResultTime) return;

  const start = new Date(engravingTime).getTime();
  const end = new Date(blockResultTime).getTime();

  if (isNaN(start) || isNaN(end)) return;

  const diffSeconds = Math.floor((end - start) / 1000);

  if (diffSeconds < 0) return;

  const minutes = Math.floor(diffSeconds / 60);
  const seconds = diffSeconds % 60;

  const formatted = `${minutes}m ${seconds}s`;

  const tptEl = document.getElementById("block_tpt-data") as HTMLInputElement | null;
  if (tptEl) tptEl.value = formatted;
};

useEffect(() => {
  if (!engineNo) return;

  const fetchKickStationsAndProcess = async () => {
    try {
     const res = await fetch(
  "http://192.168.0.20:4001/api/blockengine-number"
);

      const data = await res.json();

      computeEngineArrows(data.processMinutes);

    } catch (err) {
      console.error("❌ Error fetching kick stations:", err);
    }
  };

  fetchKickStationsAndProcess();
}, [engineNo]);

useEffect(() => {
  const fetchPingData = async () => {
    try {
      const response = await fetch('http://192.168.0.20:4001/api/blockping');
      const json = await response.json();
      const values = json.data;

      const ids = [
        'block_machine1-1','block_machine1-2','block_machine1-3','block_machine1-4','block_machine1-5','block_machine1-6','block_machine1-7','block_machine1-8','block_machine1-9',
        'block_machine2-1','block_machine2-2','block_machine2-3','block_crankcase'
      ];

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

  <div id="block_head1"  className={showSettings ? "blur" : ""}>
    <header>
      <img
  src={menu}
  alt="menu"
  width="80"
  height="100"
  id='block_menu'
  onMouseEnter={() => setShowMenu(true)}
  onMouseLeave={() => setShowMenu(false)}
/>
      <h2 id='block_topic'>BLOCK FIREWALL – MAIN DASHBOARD</h2>
      <img src={tiei1} alt="TIEI-1" width="50" height="60" id="block_tiei1" />
      <img src={tiei2} alt="TIEI-2" width="300" height="70" id="block_tiei2" />
      <img 
  src={live} 
  alt="live" 
  width="80" 
  height="80" 
  id='block_live'
  onClick={handleLiveClick} 

/>

        <div id="block_tiei3">
              <FontAwesomeIcon
      icon={faGear}
      size="2x"
      onClick={handleGearClick}
      style={{ marginTop: '20px', color: '0,112,192', cursor: "pointer" }}
    />
  </div>
    </header>

    <main id="block_dashboard-table">
      <span id="block_ss1">Shift Status</span>
      <table>
        <tbody>
          <tr id="block_row1">
            <td rowSpan={2} id="block_box1">IN</td>
            <td rowSpan={2} id="block_shift-in">
            {shiftInCount !== null ? shiftInCount : '-'}
            </td>

            <td id="block_box2">KICK OUT</td>
            <td id="block_kick-out">{kickOutCount ?? '—'}</td>

            <td rowSpan={2} id="block_box3">OUT</td>
            <td rowSpan={2} id="block_shift-out">
              {shiftOutCount !== null ? shiftOutCount : '-'}
            </td>

            <td rowSpan={2} id="block_box4">Abnormal cycle</td>
            <td rowSpan={2} id="block_A-cycle">{abnormalCycleCount !== null ? abnormalCycleCount : '-'}</td>

            <td rowSpan={2} id="block_box5">Straight-Pass</td>
            <td rowSpan={2} id="block_S-pass">{straightPass !== null ? straightPass : '-'}</td>
          </tr>
          <tr id="block_row1-sub">
            <td id="block_box6">KICK IN</td>
            <td id="block_kick-in">{kickInCount ?? '—'}</td>
          </tr>
        </tbody>
      </table>

    </main>

    <div id="block_row2">
      <span style={{ marginLeft: "-84%",marginTop: "1%" ,color: "blue", fontStyle: "italic", fontSize: "35px", fontWeight: "bold"}} id='block_layout'>Layout:</span>
      <div id='block_top-box'>
        <label htmlFor="tpt-data" id="block_tpt" style={{marginLeft: "2%", marginTop: "-80px"}}>Throughput time</label>
        <input
          type="text"
          id="block_tpt-data"
          style={{
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            fontSize: "17px",
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

    <table id="block_row2-tbl">
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

        <h2 id="block_ch">2.0L BLOCK SUB</h2>
        <img src={cylinder} alt="cylinder" width="18%" height="18%" id="block_ch-pic" />
      
    </div>
 

    <div>
      <div>
        <table>
          {/* <tbody>
          <tr><td id="block_machine1-9">Model Code Label</td></tr>
          <tr><td id="block_B-7"><img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='block_b1' /></td></tr>
          <tr><td id="block_B-6"><img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='block_b1' /></td></tr>
          </tbody> */}
        </table>
      </div>
      <table>
        <tbody>
          <tr id="block_row3">
            <td id="block_man-1">
              Pin Assy
              <img src={Man} alt="man" width="45" height="45" style={{ marginTop: "15px", marginLeft: "15px" }}  id='block_man1' />
            </td>
             <td id="block_machine1-9">
              Crank Cap Nut runner
              <img src={Machine} alt="machine" width="30" height="25" id='def-machine1-9'  />
            </td>
            <td id="block_man-2">
              Pre Tightening
              <img src={Man} alt="man" width="45" height="45" style={{ marginTop: "15px", marginLeft: "15px" }}  id='block_man2' />
            </td>
            <td id="block_man-3">
              Crank Cap assy.
              <img src={Man} alt="man" width="45" height="45" style={{ marginTop: "15px", marginLeft: "15px" }}  id='block_man3' />
            </td>
             <td id="block_machine1-8">
              Journal Oiling
              <img src={Machine} alt="machine" width="30" height="25" id='def-machine1-8'  />
            </td>
             <td id="block_machine1-7">
              Crank Shaft assy.
              <img src={Machine} alt="machine" width="30" height="25" id='def-machine1-7'  />
            </td>
            <td id="block_B-1">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='block_b1' />
            </td>
             <td id="block_machine1-6">
              Top Bearing assy.
              <img src={Machine} alt="machine" width="30" height="25" id='def-machine1-6'  />
            </td>
            <td id="block_B-2">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px"}} id='block_b2' />
            </td>
            <td id="block_machine1-5">
              Bottom Bearing assy.
              <img src={Machine} alt="machine" width="30" height="25" id='def-machine1-5'  />
            </td>
            <td id="block_man-4">
              Cam Cap bolt Loosen
              <img src={Man} alt="man" width="42" height="42" style={{ marginTop: "4px", marginLeft: "18px" }} id='block_man4' />
            </td>
            <td id="block_man-5">
              Oil Jet Assy
              <img src={Man} alt="man" width="42" height="42" style={{ marginTop: "4px", marginLeft: "18px" }}  id='block_man5'/>
            </td>
            <td id="block_machine1-4">
              Metal Rank
              <img src={Machine} alt="machine" width="30" height="25" id='def-machine1-4'  />
            </td>
             <td id="block_machine1-3">
              ID Writing
              <img src={Machine} alt="machine" width="30" height="25" id='def-machine1-3'  />
            </td>
            <td id="block_B-3">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }}  id='block_b4'/>
            </td>
            <td id="block_machine1-2">
              Engine No. Label
              <img src={Machine} alt="machine" width="30" height="25" id='def-machine1-2'  />
            </td>
             <td id="block_machine1-1">
              Engine No. Engraving
              <img src={Machine} alt="machine" width="30" height="25" id='def-machine1-1'  />
            </td>
            
          </tr>
        </tbody>
      </table>

    </div>

    {/* <div id='block_md'>
      <table >
        <tr >
          <td style={{border: "none", marginTop: "-20px"}}>
            <p style={{fontSize: "40px", lineHeight: "2", marginLeft: "60px",marginBottom:"0px"}}>↑</p>
            <span id='block_dolly'
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

  

<div id='block_logic'>
 <div id='block_md'>
 <p style={{fontSize: "40px", lineHeight: "2", marginLeft: "60px",marginBottom:"0px", color: "rgba(102, 99, 99, 0.733)"}} id='block_up'>↑</p>
  <span id='block_dolly'
  style={{
    border: "1px solid rgba(167, 164, 164, 0.73)",
    padding:"15px",
    fontSize: "17px",
    fontWeight: "bold",
  }}>RGV</span>
 <p style={{fontSize: "40px", lineHeight: "2", marginLeft: "60px", marginTop:"-10px", color: "rgba(102, 99, 99, 0.733)"}}  id='block_down'>↓</p>
</div>

<div className="block_arrow-line">
    <span className="block_arrow5">----------▷</span>
    <span className="block_arrow4">◁---------------------------------------▷</span>
    <span className="block_arrow3">◁----------------▷</span>
    <span className="block_arrow3a">◁----------------▷</span>
    <span className="block_arrow2">◁-----------------------------▷</span>
    <span className="block_arrow1">◁------▷</span>
    <span className="block_arrow1a">◁---------------▷</span>
    <span className="block_arrow1b">◁-------▷</span>
   
</div>

<div className='block_arrowlinedata1'>
  <input type="text" id='block_arrow9data'  readOnly/>
  <input type="text" id='block_arrow8data'  readOnly/>
  <input type="text" id='block_arrow7data'  readOnly/>
  <input type="text" id='block_arrow6data'  readOnly/>
  <input type="text" id="block_arrow5data" readOnly />
  <input type="text" id='block_arrow4data' readOnly/>
  <input type="text" id='block_arrow3data' readOnly/>
  <input type="text" id='block_arrow2data' readOnly/>
</div>

<div className='block_arrowlinedata2'>
  <input type="text" id='block_arrow10data' readOnly/>
  <input type="text" id='block_arrow11data' readOnly/>
  <input type="text" id='block_arrow12data' readOnly/>

</div>

<div id='block_fd1'>
  <p style={{color:"red",marginLeft:"1020px",marginTop: "-210px"}} id='block_flow-right'>Flow direction</p>
  <p
  id='block_right-line'
  style={{
    fontSize: "18px",
    lineHeight: "2",
    fontFamily: "monospace",
    marginTop: "-20px",
    color: "red"
  }}
>
  ◁---------
</p>
</div>

<div className="block_arrow-line2">
    <span className="block_arrow6">---▷</span>
    <span className="block_arrow7">◁-----------------------------------------------------▷</span>
    <span className="block_arrow8">◁--------------▷</span>
    <span className="block_arrow9">◁--------------------------------------------------------------------------▷</span>

</div>

<div id='block_fd2'>
<p style={{marginTop: "-140px",marginLeft:"-110px",color:"red"}} id='block_flow-left'>Flow direction</p>
<p
 id='block_left-line'
  style={{
    fontSize: "18px",
    lineHeight: "2",
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
          <tr id="block_row4">
          
            <td id="block_machine2-1">
-              BS-PS Collation
               <img src={Machine} alt="machine" width="30" height="25" id='def-machine2-1'  />
            </td>
            <td id="block_B2-1">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='block_b21'/>
            </td>
             <td id="block_man2-1">
              <span style={{ marginTop: "5px" }}>Piston Assy</span>
              <img src={Man} alt="man" width="42" height="42" style={{ marginTop: "1px", marginLeft: "15px" }} id='block_man21'/>
            </td>
            <td id="block_man2-2">
              <span style={{ marginTop: "5px" }}>Con Rod Assy</span>
              <img src={Man} alt="man" width="42" height="42" style={{ marginTop: "1px", marginLeft: "15px" }} id='block_man22'/>
            </td>
            <td id="block_B2-2">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='block_b22' />
            </td>
              <td id="block_B2-3">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='block_b22' />
            </td>
            <td id="block_machine2-2">
-              Conrod Nut-runner
              <img src={Machine} alt="machine" width="30" height="25" id='def-machine2-2'  />
            </td>
              <td id="block_B2-4">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='block_b22' />
            </td>
          
            <td id="block_machine2-3">
              Piston Collation
              <img src={Machine} alt="machine" width="30" height="25" id='def-machine2-3'  />
            </td>
             <td id="block_man2-3">
              <span style={{ marginTop: "5px" }}>Visual Check</span>
              <img src={Man} alt="man" width="42" height="42" style={{ marginTop: "1px", marginLeft: "15px" }} id='block_man23'/>
            </td>
              <td id="block_B2-5">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='block_b22' />
            </td>
            <td id="block_man2-4">
              <span style={{ marginTop: "5px" }}>PCV Assy</span>
              <img src={Man} alt="man" width="42" height="42" style={{ marginTop: "1px", marginLeft: "15px" }} id='block_man24'/>
            </td>
             <td id="block_B2-6">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='block_b23'/>
            </td>

              <td id="block_man2-5">
              <span style={{ marginTop: "5px" }}>Crank Case Tightening</span>
              <img src={Man} alt="man" width="42" height="42" style={{ marginTop: "1px", marginLeft: "15px" }} id='block_man25'/>
            </td>
             <td id="block_B2-7">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='block_b23'/>
            </td>
              <td id="block_man2-6">
                <span style={{ marginTop: "5px" }}>FIPG cleaning</span>
              <img src={Man} alt="man" width="42" height="42" style={{ marginTop: "1px", marginLeft: "15px" }} id='block_man26'/>
            </td>
            <td id="block_B2-8">
              <span style={{
                display:"flex",
               justifyContent: "center",
               alignItems: "center",
               marginTop: "10px",
               backgroundColor: "rgba(251,243,225)",
               padding: "4px",
               border: "2px solid orange",borderRadius:"5px"
              }} id='block_b24'>C/B</span>
            </td>
            <td style={{
              height:"60px",
              marginTop: "60px",
              marginLeft: "-40px",
              borderRadius: "5px"
              }}  id='block_downarrow'><img src={downarrow} alt="downarrow" width="34" height="66"  id='block_downarrow-img'/></td>
            <td style={{
              marginLeft:"6px",borderRadius: "5px"
            }} id='block_uparrow'><img src={uparrow} alt="uparrow" width="34" height="100"  id='block_uparrow-img'/></td>
          </tr>
        </tbody>
      </table>
    <div id="block_crankcase">CrankCase FIPG</div>
    </div>

    <div id="block_lastrow">
      <div id="block_row5">
  <table id="block_row5-tbl">
    <tbody>

      <tr id="block_cell1">
        <td
          style={{
            border: "2px solid orange",
            width: "25%",
            fontSize: "22px",
            padding: "4px",
            borderRadius: "5px"
          }}
        >
          Current Part Status
        </td>
      </tr>

      <tr id="block_cell2">
        <td style={{ border: "none", padding: "5px" }}>
          Engine No
        </td>
      </tr>

      <tr id="block_cell3">
        <td style={{ borderRadius: "10px" }}>
          {engineNo}
        </td>
      </tr>

      <tr id="block_cell4">
        <td style={{ border: "none", padding: "5px" }}>
          Eng Code
        </td>
      </tr>

      <tr id="block_cell5">
        <td>
          {engineCode}
        </td>
      </tr>

    </tbody>
  </table>
   <table id="ok_piston">
      <tbody>
  <tr id="piston_block">
    <td id="pistonblock1">PISTON</td>
    <td
  id="okblock2"
  style={{
    backgroundColor:
      pistonStatus === "OK"
        ? "green"
        : pistonStatus === "NG"
        ? "red"
        : "",
    color:
      pistonStatus === "OK"
        ? "black"
        : pistonStatus === "NG"
        ? "white"
        : ""
  }}
>
  {pistonStatus}
</td>
  </tr>
  </tbody>
</table>
</div>

      <div id="block_row6">
        <table id="block_row6-tbl">
          <tbody>

  <tr id="block_line1">
    <td id='block_machinetable1'></td>
    <td colSpan={2} id='block_time-stamp' className='block_time_Stamp'>Time Stamp</td>
    <td colSpan={6}>Quality</td>
  </tr>

  <tr id="block_line2">
    <td id='block_machine'>Machine</td>
    <td id='block_std1'>STD</td>
    <td id='block_dev'>DEV</td>

    <td id='block_#1'>#1</td>
    <td id='block_#2'>#2</td>
    <td id='block_#3'>#3</td>
    <td id='block_#4'>#4</td>
    <td id='block_#5'>#5</td>
    <td id='block_#6'>Result</td>
  </tr>

 <tr id="block_line3">
        <td id='block_machine1' >Engraving</td>

        <td id="block_timestd1"></td>
        <td  id="block_timedev1"></td>

        <td id="block_quality1data1" ></td>
        <td id="block_quality1data2"  style={{backgroundColor: ' rgb(218, 217, 217)'}}></td>
        <td id="block_quality1data3"  style={{backgroundColor: ' rgb(218, 217, 217)'}} ></td>
        <td id="block_quality1data4"  style={{backgroundColor: ' rgb(218, 217, 217)'}} ></td>
        <td id="block_quality1data5"  style={{backgroundColor: ' rgb(218, 217, 217)'}} ></td>

        <td id='block_qualityresult1' ></td>
      </tr>

  <tr id="block_line4">
        <td id='block_machine2'>Label Printer</td>

        <td id="block_timestd2"></td>
        <td id="block_timedev2"></td>

        <td id="block_quality2data1" ></td>
        <td id="block_quality2data2"  style={{backgroundColor: ' rgb(218, 217, 217)'}} ></td>
        <td id="block_quality2data3"  style={{backgroundColor: ' rgb(218, 217, 217)'}} ></td>
        <td id="block_quality2data4"  style={{backgroundColor: ' rgb(218, 217, 217)'}} ></td>
        <td id="block_quality2data5"  style={{backgroundColor: ' rgb(218, 217, 217)'}} ></td>

        <td id='block_qualityresult2' ></td>
      </tr>

  <tr id="block_line5">
        <td id='block_machine3'>ID Writing</td>
        <td id="block_timestd3"></td>
        <td id="block_timedev3"></td>

        <td id="block_quality3data1" ></td>
        <td id="block_quality3data2" ></td>
        <td id="block_quality3data3" ></td>
        <td id="block_quality3data4"  style={{backgroundColor: ' rgb(218, 217, 217)'}} ></td>
        <td id="block_quality3data5"  style={{backgroundColor: ' rgb(218, 217, 217)'}} ></td>

        <td id='block_qualityresult3' ></td>
      </tr>

      <tr id="block_line6">
        <td id='block_machine4'>Lower Metal Rank</td>
        <td id="block_timestd4"></td>
        <td id="block_timedev4"></td>

        <td id="block_quality4data1" ></td>
        <td id="block_quality4data2" ></td>
        <td id="block_quality4data3" style={{backgroundColor: ' rgb(218, 217, 217)'}}  ></td>
        <td id="block_quality4data4" style={{backgroundColor: ' rgb(218, 217, 217)'}}  ></td>
        <td id="block_quality4data5" style={{backgroundColor: ' rgb(218, 217, 217)'}}  ></td>

        <td id='block_qualityresult4' ></td>
      </tr>

      <tr id="block_line7">
        <td id='block_machine5'>Upper Metal Rank</td>
        <td id="block_timestd5"></td>
        <td id="block_timedev5"></td>

        <td id="block_quality5data1" ></td>
        <td id="block_quality5data2" ></td>
        <td id="block_quality5data3" style={{backgroundColor: ' rgb(218, 217, 217)'}}  ></td>
        <td id="block_quality5data4" style={{backgroundColor: ' rgb(218, 217, 217)'}}  ></td>
        <td id="block_quality5data5" style={{backgroundColor: ' rgb(218, 217, 217)'}}  ></td>
        <td id='block_qualityresult5' ></td>
      </tr>

      <tr id="block_line8">
        <td id='block_machine6'>Crankshaft</td>
        <td id="block_timestd6"></td>
        <td id="block_timedev6"></td>

        <td id="block_quality6data1" ></td>
        <td id="block_quality6data2"  style={{backgroundColor: ' rgb(218, 217, 217)'}} ></td>
        <td id="block_quality6data3"  style={{backgroundColor: ' rgb(218, 217, 217)'}} ></td>
        <td id="block_quality6data4"  style={{backgroundColor: ' rgb(218, 217, 217)'}} ></td>
        <td id="block_quality6data5"  style={{backgroundColor: ' rgb(218, 217, 217)'}} ></td>
        <td id='block_qualityresult6' ></td>
      </tr>

      <tr id="block_line9">
        <td id='block_machine7'>Crank Cap Nutrunner</td>
        <td id="block_timestd7"></td>
        <td id="block_timedev7"></td>

        <td id="block_quality7data1" ></td>
        <td id="block_quality7data2" ></td>
        <td id="block_quality7data3" ></td>
        <td id="block_quality7data4" ></td>
        <td id="block_quality7data5" ></td>
        <td id='block_qualityresult7' ></td>
      </tr>

      <tr id="block_line10">
        <td id='block_machine8'>BS-PS Collation</td>
        <td id="block_timestd8"></td>
        <td id="block_timedev8"></td>

        <td id="block_quality8data1" ></td>
        <td id="block_quality8data2"  style={{backgroundColor: ' rgb(218, 217, 217)'}} ></td>
        <td id="block_quality8data3"  style={{backgroundColor: ' rgb(218, 217, 217)'}} ></td>
        <td id="block_quality8data4"  style={{backgroundColor: ' rgb(218, 217, 217)'}} ></td>
        <td id="block_quality8data5"  style={{backgroundColor: ' rgb(218, 217, 217)'}} ></td>
        <td id='block_qualityresult8' ></td>
      </tr>

      <tr id="block_line11">
        <td id='block_machine9'>Conrod Nutrunner</td>
        <td id="block_timestd9"></td>
        <td id="block_timedev9"></td>

        <td id="block_quality9data1" ></td>
        <td id="block_quality9data2" ></td>
        <td id="block_quality9data3" ></td>
        <td id="block_quality9data4" ></td>
        <td id="block_quality9data5" ></td>
        <td id='block_qualityresult9'></td>
      </tr>

      <tr id="block_line12">
        <td id='block_machine10'>Piston Collation</td>
        <td id="block_timestd10"></td>
        <td id="block_timedev10"></td>

        <td id="block_quality10data1" ></td>
        <td id="block_quality10data2" style={{backgroundColor: ' rgb(218, 217, 217)'}} ></td>
        <td id="block_quality10data3" style={{backgroundColor: ' rgb(218, 217, 217)'}} ></td>
        <td id="block_quality10data4" style={{backgroundColor: ' rgb(218, 217, 217)'}} ></td>
        <td id="block_quality10data5" style={{backgroundColor: ' rgb(218, 217, 217)'}} ></td>
        <td id='block_qualityresult10'></td>
      </tr>

      <tr id="block_line13">
        <td id='block_machine11'>Crankcase FIPG</td>
        <td id="block_timestd11"></td>
        <td id="block_timedev11"></td>

        <td id="block_quality11data1"  style={{backgroundColor: ' rgb(218, 217, 217)'}} ></td>
        <td id="block_quality11data2"  style={{backgroundColor: ' rgb(218, 217, 217)'}} ></td>
        <td id="block_quality11data3"  style={{backgroundColor: ' rgb(218, 217, 217)'}} ></td>
        <td id="block_quality11data4"  style={{backgroundColor: ' rgb(218, 217, 217)'}} ></td>
        <td id="block_quality11data5"  style={{backgroundColor: ' rgb(218, 217, 217)'}} ></td>
        <td id='block_qualityresult11' style={{backgroundColor: ' rgb(218, 217, 217)'}} ></td>
      </tr>
</tbody>

        </table>
      </div>
 {/* <div id='block_btns'>
        <button type='submit' id='block_btn1'>TO KICK IN/OUT</button>
        <button type='submit' id='block_btn3'>BACK TO MAIN</button>
        <button type='submit' id='block_btn4'>GO TO LIVE</button>
      </div> */}
      <div id='block_row7'>
  <table id='block_result'>
    <tbody>
      <tr><td id='block_result1'>Overall Judgement</td></tr>
      <tr>
  <td id="block_result2">
     <img
      src={okay}
      alt={"OK"}
      height="150"
      width="150"
      id="block_result-img"
    />
  </td>
</tr>

      <tr><td
  id='block_result3'
  onClick={handleKickClick}
  style={{ cursor: "pointer", fontWeight: "bold", color: "white"}}>TO KICK IN / OUT</td></tr>
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