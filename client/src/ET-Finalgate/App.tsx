import '../ET-Finalgate/index.css';

import {
  useEffect,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import { faGear } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import B from '../assets/B.png';
import live from '../assets/live-streaming.gif';
import Machine from '../assets/Machine.png';
import Man from '../assets/Man.png';
import menu from '../assets/menu.gif';
import notokay from '../assets/not okay.png';
import okay from '../assets/okay.png';
import tiei1 from '../assets/tiei-pic1.png';
import tiei2 from '../assets/tiei-pic2.png';
import cylinder from '../assets/TNGA.png';
import Golive from '../ET-Finalgate/GOLIVE';
import Menu from '../ET-Finalgate/menu';

type DataRow = {
  asn: string;
  suffix: string;
};

const App = () => {

  const [showSettings, setShowSettings] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showLiveOverlay, setShowLiveOverlay] = useState(false);


  const handleGearClick = () => {
    window.open("/etlogin", "_blank");
    setShowSettings(true);
  };

  const handleLiveClick = () => {
  setShowLiveOverlay(true);
};

  const navigate = useNavigate();

const handleKickClick = () => {
  navigate("/et_kick_io"); 
};

  const [, setData] = useState<DataRow[]>([]);
    //console.log(data);

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
      const response = await fetch('http://192.168.0.20:4001/api/etshiftindata');
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
       const response = await fetch('http://192.168.0.20:4001/api/etshiftDataOut');
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
      const response = await fetch('http://192.168.0.20:4001/api/et_kickin');
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
      const response = await fetch('http://192.168.0.20:4001/api/et_kickout');
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
      const response = await fetch('http://192.168.0.20:4001/api/etabnormalCycleData');
      const json = await response.json();
      setAbnormalCycleCount(json.abnormalCount ?? 0);
      const aCycleElement = document.getElementById('et_A-cycle');
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

      const sPassElement = document.getElementById('et_S-pass');
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
}

const [engineNo, setEngineNo] = useState<string>("-");
const [engineCode, setEngineCode] = useState<string>("-");
// const [serialno, setSerialno] = useState<string>("-");

useEffect(() => {
  const fetchEngineData = async () => {
    const res = await fetch("http://192.168.0.20:4001/api/etengine-number");
const data: EngineData = await res.json();
 setEngineNo(data.engineNumber ?? "-");
  setEngineCode(data.engineCode ?? "-");
  // setSerialno(data.serialno ?? "-");

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
      const res = await fetch("http://192.168.0.20:4001/api/etengine-number");
      const data: ApiResponse = await res.json();
const judgementCellMap: Record<string, number[]> = {
  row1: [1],
  row2: [1, 2],
  row3: [1],
  row4: [1],
  row5: [1],
  row6: [1],
  row7: [1],
  row8: [1]
};

Object.entries(judgementCellMap).forEach(([rowKey, cols]) => {
  const rowNo = Number(rowKey.replace("row", ""));
  const values = data.judgements[rowKey] || [];

  cols.forEach((colIndex, i) => {
    const cellId = `et_quality${rowNo}data${colIndex}`;
    applyCellStyle(cellId, values[i]);
  });
});

let allGreen = true;

for (let row = 1; row <= 10; row++) {

  const cellId = `et_qualityresult${row}`;
  const el = document.getElementById(cellId);
  if (!el) continue;

  let value;

  if (row === 5) {
    value = data.mainJudgements["row4"];
  } else if (row >= 6) {
    value = data.mainJudgements[`row${row - 1}`];
  } else {
    value = data.mainJudgements[`row${row}`];
  }

  const valueStr = value !== null && value !== undefined
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
      const imgEl = document.getElementById("et_result-img") as HTMLImageElement | null;
      if (imgEl) {
        imgEl.src = allGreen ? okay : notokay;
        imgEl.alt = allGreen ? "OK" : "NOT OK";
      }

      const stdIds = [
        "et_timestd1",
        "et_timestd2",
        "et_timestd3",
        "et_timestd4",
        "et_timestd5",
        "et_timestd6",
        "et_timestd7"
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
      console.error("❌ Error fetching et engine data:", err);
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
  chutter: 4,     
  crankNr: 5,  
  collation: 6,
  conrod: 7
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
      `http://192.168.0.20:4001/api/etengine-details/${engineNo}`
    );
    const data: TableData = await res.json();

  for (const [tableKey, rowNo] of Object.entries(tableRowMap)) {
  const rowData = data[tableKey];

  if (!rowData) {
    writeCellValue(`et_timedev${rowNo}`, "-");

    for (let i = 1; i <= 5; i++) {
      writeCellValue(`et_quality${rowNo}data${i}`, "-");
    }
    continue;
  }

  writeCellValue(`et_timedev${rowNo}`, rowData.TIME_DEVIATION);

  if (tableKey === "labelPrinter") {
    const judgement1 = rowData.JUDGEMENT_1 ?? "-";
    const judgement2 = rowData.JUDGEMENT_2 ?? "-";

    writeCellValue(`et_quality${rowNo}data1`, `Port - ${judgement1}`);
    writeCellValue(`et_quality${rowNo}data2`, `D4 - ${judgement2}`);

    for (let i = 3; i <= 5; i++) {
      writeCellValue(`et_quality${rowNo}data${i}`, "-");
    }
  } else {
    for (let i = 1; i <= 5; i++) {
      const rawValue = rowData[`JUDGEMENT_${i}` as keyof typeof rowData];
      const displayValue =
        rawValue !== null && rawValue !== undefined ? String(rawValue) : "-";

      writeCellValue(`et_quality${rowNo}data${i}`, displayValue);
    }
  }
}
  };

  fetchDetails();
  const interval = setInterval(fetchDetails, 1000);
  return () => clearInterval(interval);
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [engineNo]);


interface ProcessMinutes {
      TIZZ358_IDWRITER: string | null;
      TITM318_OILLEAK: string | null;
      TITM323_INJECTOR: string | null;
      TITM319_WATERLEAK: string | null;
      TIZZ330_OILFILLING: string | null;
      TITM321_MTB1: string | null;
      TITM325_MTB2: string | null;
      TIZZ365_ENGINELABEL: string | null
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

 
  setVal("et_arrow6data", diffSeconds(pm.TITM318_OILLEAK, pm.TIZZ358_IDWRITER));
  setVal("et_arrow5data", diffSeconds(pm.TITM323_INJECTOR, pm.TITM318_OILLEAK));
  setVal("et_arrow4data", diffSeconds(pm.TITM319_WATERLEAK, pm.TITM323_INJECTOR));
  setVal("et_arrow3data", diffSeconds(pm.TIZZ330_OILFILLING, pm.TITM319_WATERLEAK));
  setVal("et_arrow2data", diffSeconds(pm.TITM321_MTB1, pm.TIZZ330_OILFILLING));
  setVal("et_arrow13data", diffSeconds(pm.TITM325_MTB2, pm.TITM321_MTB1));
  setVal("et_arrow12data", diffSeconds(pm.TIZZ365_ENGINELABEL, pm.TITM325_MTB2));

  
  // setVal("et_arrow6data", diffSeconds(pm.TIZZ358_IDWRITER, pm.TITM318_OILLEAK));
  // setVal("et_arrow5data", diffSeconds(pm.TITM318_OILLEAK, pm.TITM323_INJECTOR));
  // setVal("et_arrow4data", diffSeconds(pm.TITM323_INJECTOR, pm.TITM319_WATERLEAK));
  // setVal("et_arrow3data", diffSeconds(pm.TITM319_WATERLEAK, pm.TIZZ330_OILFILLING));
  // setVal("et_arrow2data", diffSeconds(pm.TIZZ330_OILFILLING, pm.TITM321_MTB1));
  // setVal("et_arrow13data", diffSeconds(pm.TITM321_MTB1, pm.TITM325_MTB2));
  // setVal("et_arrow12data", diffSeconds(pm.TITM325_MTB2, pm.TIZZ365_ENGINELABEL));
  
};
const computeEngineTPT = (pm: ProcessMinutes | undefined) => {
  if (!pm) return;


  const startTime = pm.TIZZ358_IDWRITER;

  const endTime = pm.TIZZ365_ENGINELABEL;

  if (!startTime || !endTime) return;

  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  if (isNaN(start) || isNaN(end)) return;

  const diffSeconds = Math.floor((end - start) / 1000);
  if (diffSeconds < 0) return;

  const minutes = Math.floor(diffSeconds / 60);
  const seconds = diffSeconds % 60;

  const formatted = `${minutes}m ${seconds}s`;

  const tptEl = document.getElementById("et_tpt-data") as HTMLInputElement | null;
  if (tptEl) tptEl.value = formatted;
};
useEffect(() => {
  if (!engineNo) return;

  const fetchKickStationsAndProcess = async () => {
    try {
     const res = await fetch(
  "http://192.168.0.20:4001/api/etengine-number"
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
}, [engineNo]);

const [blockStatus, setBlockStatus] = useState<string>("-");

useEffect(() => {
  if (!engineNo || engineNo === "-") return;

  const fetchBlockStatus = async () => {
    try {
      console.log("Fetching BLOCK for:", engineNo);

      const res = await fetch(
        `http://192.168.0.20:4001/api/et_block_result_status?engineNo=${engineNo}`
      );

      if (res.status === 404) {
        console.warn("No BLOCK data yet for:", engineNo);
        setBlockStatus("-");
        return;
      }

      const data = await res.json();
      setBlockStatus(data.status);

    } catch (err) {
      console.error("Block fetch error:", err);
    }
  };

  fetchBlockStatus();

  const interval = setInterval(fetchBlockStatus, 1000);

  return () => clearInterval(interval);

}, [engineNo]);

const [pistonStatus, setPistonStatus] = useState<string>("-");

useEffect(() => {
  if (!engineNo || engineNo === "-") return;

  const fetchPistonStatus = async () => {
    try {
      console.log("Fetching PISTON for:", engineNo);

      const res = await fetch(
        `http://192.168.0.20:4001/api/et_piston_result_status?engineNo=${engineNo}`
      );

      if (res.status === 404) {
        console.warn("No PISTON data yet for:", engineNo);
        setPistonStatus("-");
        return;
      }

      const data = await res.json();
      setPistonStatus(data.status);

    } catch (err) {
      console.error("Piston fetch error:", err);
    }
  };

  fetchPistonStatus();

  const interval = setInterval(fetchPistonStatus, 1000);

  return () => clearInterval(interval);

}, [engineNo]);

const [camhsgStatus, setCamhsgStatus] = useState<string>("-");

useEffect(() => {
  if (!engineNo || engineNo === "-") return;

  const fetchCamhsgStatus = async () => {
    try {
      console.log("Fetching CAMHSG for:", engineNo);

      const res = await fetch(
        `http://192.168.0.20:4001/api/et_camhsg_result_status?engineNo=${engineNo}`
      );

      if (res.status === 404) {
        console.warn("No CAMHSG data yet for:", engineNo);
        setCamhsgStatus("-");
        return;
      }

      const data = await res.json();
      setCamhsgStatus(data.status);

    } catch (err) {
      console.error("CAMHSG fetch error:", err);
    }
  };

  fetchCamhsgStatus();

  const interval = setInterval(fetchCamhsgStatus, 1000);

  return () => clearInterval(interval);

}, [engineNo]); 


const [mainlineStatus, setMainlineStatus] = useState<string>("-");

useEffect(() => {
  if (!engineNo || engineNo === "-") return;

  const fetchMainlineStatus = async () => {
    try {
      console.log("Fetching MAINLINE for:", engineNo);

      const res = await fetch(
        `http://192.168.0.20:4001/api/et_mainline_result_status?engineNo=${engineNo}`
      );

      if (res.status === 404) {
        console.warn("No MAINLINE data yet for:", engineNo);
        setMainlineStatus("-");
        return;
      }

      const data = await res.json();
      setMainlineStatus(data.status);

    } catch (err) {
      console.error("MAINLINE fetch error:", err);
    }
  };

  fetchMainlineStatus();

  const interval = setInterval(fetchMainlineStatus, 1000);

  return () => clearInterval(interval);

}, [engineNo]); 

  return (

  <div id="et_head1"  className={showSettings ? "blur" : ""}>
    <header>
      <img
  src={menu}
  alt="menu"
  width="80"
  height="100"
  id='et_menu'
  onMouseEnter={() => setShowMenu(true)}
  onMouseLeave={() => setShowMenu(false)}
/>
      <h2>ET FINAL GATE – MAIN DASHBOARD</h2>
      <img src={tiei1} alt="TIEI-1" width="50" height="60" id="et_tiei1" />
      <img src={tiei2} alt="TIEI-2" width="300" height="70" id="et_tiei2" />
      <img 
  src={live} 
  alt="live" 
  width="80" 
  height="80" 
  id='et_live'
  onClick={handleLiveClick} 

/>

        <div id="et_tiei3">
              <FontAwesomeIcon
      icon={faGear}
      size="2x"
      onClick={handleGearClick}
      style={{ marginTop: '20px', color: '0,112,192', cursor: "pointer" }}
    />
  </div>
    </header>

    <main id="et_dashboard-table">
      <span id="et_ss1">Shift Status</span>
      <table>
        <tbody>
          <tr id="et_row1">
            <td rowSpan={2} id="et_box1">IN</td>
            <td rowSpan={2} id="et_shift-in">{shiftInCount !== null ? shiftInCount : '-'}
            </td>

            <td id="et_box2">KICK OUT</td>
            <td id="et_kick-out">{kickOutCount ?? '—'}</td>

            <td rowSpan={2} id="et_box3">OUT</td>
            <td rowSpan={2} id="et_shift-out">{shiftOutCount !== null ? shiftOutCount : '-'}
            </td>

            <td rowSpan={2} id="et_box4">Abnormal cycle</td>
            <td rowSpan={2} id="et_A-cycle">{abnormalCycleCount !== null ? abnormalCycleCount : '-'}</td>

            <td rowSpan={2} id="et_box5">Straight-Pass</td>
            <td rowSpan={2} id="et_S-pass">{straightPass !== null ? straightPass : '-'}</td>
          </tr>
          <tr id="et_row1-sub">
            <td id="et_box6">KICK IN</td>
            <td id="et_kick-in">{kickInCount ?? '—'}</td>
          </tr>
        </tbody>
      </table>
    </main>

    <div id="et_row2">
      <span style={{ marginLeft: "-84%",marginTop: "1%" ,color: "blue", fontStyle: "italic", fontSize: "35px", fontWeight: "bold"}} id='et_layout'>Layout:</span>
      <div id='et_top-box'>
        <label htmlFor="tpt-data" id="et_tpt" style={{marginLeft: "2%", marginTop: "-80px"}}>Throughput time</label>
        <input
          type="text"
          id="et_tpt-data"
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

  <table id="et_row2-tbl">
  <tbody>
    <tr>
      <td>
        <div className="legend-item" style={{border: "none"}}>
          <div className="icon-box machine-bg">
            <img src={Machine} alt="machine" />
          </div>
          <span>- Machines</span>
        </div>
      </td>
    </tr>

    <tr>
      <td>
        <div className="legend-item" style={{border: "none"}}>
          <div className="icon-box manual-bg">
            <img src={Man} alt="man" />
          </div>
          <span>- Manual stations</span>
        </div>
      </td>
    </tr>

    <tr>
      <td>
        <div className="legend-item" style={{border: "none"}}>
          <div className="icon-box buffer-bg">
            <img src={B} alt="B" />
          </div>
          <span>- Idle/Buffer stations</span>
        </div>
      </td>
    </tr>
  </tbody>
</table>



        <h2 id="et_ch">TNGA Engine</h2>
        <img src={cylinder} alt="cylinder" width="20%" height="20%" id="et_ch-pic" />
      
    </div>
 

    <div>
      <div>
        <table>
          {/* <tbody>
          <tr><td id="et_machine1-9">Model Code Label</td></tr>
          <tr><td id="et_B-7"><img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='et_b1' /></td></tr>
          <tr><td id="et_B-6"><img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='et_b1' /></td></tr>
          </tbody> */}
        </table>
      </div>
      <table>
        <tbody>
          <tr id="et_row3">
            <td id="et_machine1-6">
              ID Writing
              <img src={Machine} alt="machine" width="30" height="25" id='et_img_machine1-6'  />
            </td>
            <td id="et_man-1">
              Masking
              <img src={Man} alt="man" width="45" height="45" style={{ marginTop: "15px", marginLeft: "15px" }}  id='et_man1' />
            </td>
             <td id="et_machine1-5">
              Oil leak test
              <img src={Machine} alt="machine" width="30" height="25" id='et_img_machine1-5'  />
            </td>
             <td id="et_machine1-4">
              Injector Mov
              <img src={Machine} alt="machine" width="30" height="25" id='et_img_machine1-4'  />
            </td>
             <td id="et_machine1-3">
              Water leak testing
              <img src={Machine} alt="machine" width="30" height="25" id='et_img_machine1-3'  />
            </td>
              <td id="et_B-1">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='et_b1' />
            </td>
            <td id="et_man-2">
              Visual Check
              <img src={Man} alt="man" width="45" height="45" style={{ marginTop: "15px", marginLeft: "15px" }}  id='et_man2' />
            </td>
             <td id="et_machine1-2">
              Oil filling
              <img src={Machine} alt="machine" width="30" height="25" id='et_img_machine1-2'  />
            </td>
            <td id="et_man-3">
              Face plate assy
              <img src={Man} alt="man" width="45" height="45" style={{ marginTop: "15px", marginLeft: "15px" }}  id='et_man3' />
            </td>
             <td id="et_man-4">
              Harness Assy
              <img src={Man} alt="man" width="45" height="45" style={{ marginTop: "4px", marginLeft: "18px" }} id='et_man4' />
            </td>
            <td id="et_B-2">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px"}} id='et_b2' />
            </td>
            <td id="et_machine1-1">
              MTB-1
              <img src={Machine} alt="machine" width="30" height="25" id='et_img_machine1-1'  />
            </td>
            <td id="et_B-3">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px"}} id='et_b3' />
            </td>
            
          </tr>
        </tbody>
      </table>

    </div>

    {/* <div id='et_md'>
      <table >
        <tr >
          <td style={{border: "none", marginTop: "-20px"}}>
            <p style={{fontSize: "40px", lineHeight: "2", marginLeft: "60px",marginBottom:"0px"}}>↑</p>
            <span id='et_dolly'
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

  

<div id='et_logic'>


<div className="et_arrow-line">
    <span className="et_arrow3">◁----------------------▷</span>
    <span className="et_arrow3a">◁--------▷</span>
    <span className="et_arrow2">◁---------▷</span>
    <span className="et_arrow1">◁------------------------------▷</span>
    <span className="et_arrow1a">◁--------------------------------------------▷</span>
    <span className="et_arrow1b">◁----------</span>
   
</div>

<div className='et_arrowlinedata1'>
  <input type="text" id='et_arrow6data'  readOnly/>
  <input type="text" id="et_arrow5data" readOnly />
  <input type="text" id='et_arrow4data' readOnly/>
  <input type="text" id='et_arrow3data' readOnly/>
  <input type="text" id='et_arrow2data' readOnly/>
</div>

<div className='et_arrowlinedata2'>
  <input type="text" id='et_arrow10data' readOnly/>
  <input type="text" id='et_arrow11data' readOnly/>
  <input type="text" id='et_arrow12data' readOnly/>
  <input type="text" id='et_arrow13data' readOnly/>
</div>




<div id='et_fd1'>
  <p style={{color:"red",marginLeft:"1020px",marginTop: "-210px"}} id='et_flow-right'>Flow direction</p>
  <p
  id='et_right-line'
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

<div className="et_arrow-line2">
    <span className="et_arrow6">◁------------------------------------------▷</span>
    <span className="et_arrow7">◁-----------------------▷</span>
    <span className="et_arrow8">◁--------------------------------------------------------▷</span>
    <span className="et_arrow9">◁----------</span>

</div>

<div id='et_fd2'>
<p style={{marginTop: "-140px",marginLeft:"-110px",color:"red"}} id='et_flow-left'>Flow direction</p>
<p
 id='et_left-line'
  style={{
    fontSize: "18px",
    lineHeight: "2",
    marginTop: "-25px",
    fontFamily: "monospace",
    color: "red"
  }}
>
   {/* ─ ─ ─ ─ ─ ─ */}
 ---------▷
</p>
</div>
</div> 


   
    <div>
      <table>
        <tbody>
          <tr id="et_row4">
            <td id="et_B2-1">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='et_b21'/>
            </td>
            <td id="et_B2-2">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='et_b22' />
            </td>
              <td id="et_B2-3">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='et_b23' />
            </td>
              <td id="et_B2-4">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='et_b24' />
            </td>
            <td id="et_machine2-1">
             Final Vision check
             <img src={Machine} alt="machine" width="30" height="25" id='et_img_machine2-1'  />
            </td>
             <td id="et_B2-5">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='et_b25' />
            </td>
             <td id="et_machine2-2">
            Engine labelling
            <img src={Machine} alt="machine" width="30" height="25" id='et_img_machine2-2'  />
            </td>
              <td id="et_B2-6">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='et_b26' />
            </td>
             <td id="et_man2-1">
              <span style={{ marginTop: "5px" }}>Gauge check</span>
              <img src={Man} alt="man" width="42" height="42" style={{ marginTop: "1px", marginLeft: "15px" }} id='et_man21'/>
            </td>
            <td id="et_man2-2">
              <span style={{ marginTop: "5px" }}>Harness Dis-assy</span>
              <img src={Man} alt="man" width="42" height="42" style={{ marginTop: "1px", marginLeft: "15px" }} id='et_man22'/>
            </td>
            <td id="et_B2-7">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='et_b27' />
            </td>
            <td id="et_machine2-3">
             MTB-2
             <img src={Machine} alt="machine" width="30" height="25" id='et_img_machine2-3'  />
            </td>
              <td id="et_B2-8">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='et_b28' />
            </td> 
          </tr>
        </tbody>
      </table>

    </div>

  
    <div id="et_lastrow">
      <div id="et_row5">
  <table id="et_row5-tbl">
    <tbody>

      <tr id="et_cell1">
        <td
          style={{
            border: "2px solid orange",
            width: "25%",
            fontSize: "25px",
            padding: "10px",
            borderRadius: "5px"
          }}
        >
          Current Part Status
        </td>
      </tr>

      <tr id="et_cell2">
        <td style={{ border: "none", padding: "5px" }}>
          Engine No
        </td>
      </tr>

      <tr id="et_cell3">
        <td style={{ borderRadius: "5px" }}>
       {engineNo}
        </td>
      </tr>

      <tr id="et_cell4">
        <td style={{ border: "none", padding: "5px" }}>
          Eng Code
        </td>
      </tr>

      <tr id="et_cell5">
        <td style={{ borderRadius: "5px" }}>
          {engineCode}
      </td>
      </tr>

    </tbody>
  </table>
</div>

      <div id="et_row6">
        <table id="et_row6-tbl">
          <tbody>

  <tr id="et_line1">
    <td id='et_machine1'></td>
    <td colSpan={2} id='et_time-stamp'>Time Stamp</td>
    <td colSpan={6}>Quality</td>
  </tr>

  <tr id="et_line2">
    <td id='et_machine'>Machine</td>
    <td id='et_std1'>STD</td>
    <td id='et_dev'>DEV</td>

    <td id='et_#1'>#1</td>
    <td id='et_#2'>#2</td>
    <td id='et_#3'>#3</td>
    <td id='et_#4'>#4</td>
    <td id='et_#4'>#5</td>
    <td id='et_#5'>Result</td>
  </tr>

 <tr id="et_line3">
        <td>Oil Leak</td>

        <td id="et_timestd1"></td>
        <td  id="et_timedev1"></td>

        <td id="et_quality1data1"></td>
        <td id="et_quality1data2"></td>
        <td id="et_quality1data3"></td>
        <td id="et_quality1data4"></td>
        <td id="et_quality1data5"></td>

        <td id='et_qualityresult1'></td>
      </tr>

  <tr id="et_line4">
        <td>Inj Moving</td>

        <td id="et_timestd2"></td>
        <td id="et_timedev2"></td>

        <td id="et_quality2data1" ></td>
        <td id="et_quality2data2" ></td>
        <td id="et_quality2data3" ></td>
        <td id="et_quality2data4" ></td>
        <td id="et_quality2data5" ></td>

        <td id='et_qualityresult2' ></td>
      </tr>

  <tr id="et_line5">
        <td>Water Leak</td>
        <td id="et_timestd3"></td>
        <td id="et_timedev3"></td>

        <td id="et_quality3data1" ></td>
        <td id="et_quality3data2" ></td>
        <td id="et_quality3data3" ></td>
        <td id="et_quality3data4" ></td>
        <td id="et_quality3data5" ></td>

        <td id='et_qualityresult3'></td>
      </tr>

      <tr id="et_line6">
        <td>Oil Fill</td>
        <td id="et_timestd4"></td>
        <td id="et_timedev4"></td>

        <td id="et_quality4data1" ></td>
        <td id="et_quality4data2" ></td>
        <td id="et_quality4data3" ></td>
        <td id="et_quality4data4" ></td>
        <td id="et_quality4data5" ></td>

        <td id='et_qualityresult4'></td>
      </tr>

      <tr id="et_line7">
        <td>MTB-1</td>
        <td id="et_timestd5"></td>
        <td id="et_timedev5"></td>

        <td id="et_quality5data1" ></td>
        <td id="et_quality5data2" ></td>
        <td id="et_quality5data3" ></td>
        <td id="et_quality5data4" ></td>
        <td id="et_quality5data5" ></td>
        <td id='et_qualityresult5'></td>
      </tr>

      <tr id="et_line8">
        <td>MTB-2</td>
        <td id="et_timestd6"></td>
        <td id="et_timedev6"></td>

        <td id="et_quality6data1" ></td>
        <td id="et_quality6data2" ></td>
        <td id="et_quality6data3" ></td>
        <td id="et_quality6data4" ></td>
        <td id="et_quality6data5" ></td>
        <td id='et_qualityresult6'></td>
      </tr>

      <tr id="et_line9">
        <td>Final Label</td>
        <td id="et_timestd7"></td>
        <td id="et_timedev7"></td>

        <td id="et_quality7data1" ></td>
        <td id="et_quality7data2" ></td>
        <td id="et_quality7data3" ></td>
        <td id="et_quality7data4" ></td>
        <td id="et_quality7data5" ></td>
        <td id='et_qualityresult7'></td>
      </tr>

      {/* <tr id="et_line10">
        <td>Final Vision system</td>
        <td id="et_timestd8"></td>
        <td id="et_timedev8"></td>

        <td id="et_quality8data1" ></td>
        <td id="et_quality8data2" ></td>
        <td id="et_quality8data3" ></td>
        <td id="et_quality8data4" ></td>
        <td id="et_quality8data5" ></td>
        <td id='et_qualityresult8'></td>
      </tr> */}
    </tbody>
 </table>

<div id='bphm'>
  <div id='block_Sub'>
    <table>
      <tbody>
      <tr>
        <td id='blocksub'>Block sub</td>
       <td
  id="blockok"
  onClick={() => {
    if (blockStatus === "NG") {
      navigate("/block-firewall/kick_io", {
        state: { engineNo: engineNo },
      });
    }
  }}
  style={{
    backgroundColor:
      blockStatus === "OK"
        ? "lightgreen"
        : blockStatus === "NG"
        ? "red"
        : "",
    color:
      blockStatus === "OK"
        ? "black"
        : blockStatus === "NG"
        ? "white"
        : "",
    fontWeight: "bold",
    textAlign: "center",
    cursor: blockStatus === "NG" ? "pointer" : "default",
  }}
>
  {blockStatus}
</td>
      </tr>
      </tbody>
    </table>
  </div>

  <div id='piston_Sub'>
    <table>
      <tbody>
      <tr>
        <td id='pistonsub'>Piston sub</td>
        <td
  id="pistonok"
  style={{
    backgroundColor:
      pistonStatus === "OK"
        ? "lightgreen"
        : pistonStatus === "NG"
        ? "red"
        : "",
    color: pistonStatus === "OK"
      ? "black" 
      : pistonStatus === "NG"
      ? "white" 
      : "",
    fontWeight: "bold",
    textAlign: "center",
  }}
>
  {pistonStatus}
</td>
      </tr>
      </tbody>
    </table>
  </div>

   <div id='head_Sub'>
    <table>
      <tbody>
      <tr>
        <td id='headsub'>Head sub</td>
        <td id='headok'>OK</td>
      </tr>
      </tbody>
    </table>
  </div>

     <div id='chg_Sub'>
    <table>
      <tbody>
      <tr>
        <td id='chgsub'>CHG sub</td>
        <td
  id="chgok"
  onClick={() => {
    if (camhsgStatus === "NG") {
      navigate("/camhsgfirewall/Cam_kick_io", {
        state: { serialNo: engineNo },
      });
    }
  }}
  style={{
    backgroundColor:
      camhsgStatus === "OK"
        ? "lightgreen"
        : camhsgStatus === "NG"
        ? "red"
        : "",
    color: camhsgStatus === "OK"
      ? "black" 
      : camhsgStatus === "NG"
      ? "white" 
      : "",
    fontWeight: "bold",
    textAlign: "center",
  }}
>
  {camhsgStatus}
</td>
      </tr>
      </tbody>
    </table>
  </div>

     <div id='mainline_Sub'>
    <table>
      <tbody>
      
      <tr>
        <td id='mainlinesub'>Main line</td>
        <td id='mainlineok' style={{
    backgroundColor:
      mainlineStatus === "OK"
        ? "lightgreen"
        : mainlineStatus === "NG"
        ? "red"
        : "",
    color: mainlineStatus === "OK"
      ? "black" 
      : mainlineStatus === "NG"
      ? "white" 
      : "",
    fontWeight: "bold",
    textAlign: "center",
  }}
>
  {mainlineStatus}
</td>
      </tr>
      </tbody>
    </table>
  </div>

</div>

</div>
 {/* <div id='et_btns'>
        <button type='submit' id='et_btn1'>TO KICK IN/OUT</button>
        <button type='submit' id='et_btn3'>BACK TO MAIN</button>
        <button type='submit' id='et_btn4'>GO TO LIVE</button>
      </div> */}
      <div id='et_row7'>
  <table id='et_result'>
    <tbody>
      <tr><td id='et_result1'>Overall Judgement</td></tr>
      <tr>
  <td id="et_result2">
    <img
      src={okay}
      alt=""
      height="150"
      width="150"
      id="et_result-img"
    />
  </td>
</tr>

      <tr><td
  id='et_result3'
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