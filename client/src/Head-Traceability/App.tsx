import '../Head-Traceability/index.css';

import {
  useEffect,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import { faGear } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import B from '../assets/B.png';
import cylinder from '../assets/cylinder head.jpg';
import downarrow from '../assets/dotted down arrow.png';
import uparrow from '../assets/dotted up arrow.png';
import live from '../assets/live-streaming.gif';
import Machine from '../assets/Machine.png';
import Man from '../assets/Man.png';
import menu from '../assets/menu.gif';
import notokay from '../assets/not okay.png';
import okay from '../assets/okay.png';
import tieilogo from '../assets/Tiei logo.png';
import tiei1 from '../assets/tiei-pic1.png';
import tiei2 from '../assets/tiei-pic2.png';
import Golive from '../Head-Traceability/GOLIVE';
import Menu from '../Head-Traceability/menu';

type DataRow = {
  asn: string;
  suffix: string;
};

const App = () => {
  const [, setData] = useState<DataRow[]>([]);
  // console.log(data);
  const [showSettings, setShowSettings] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showLiveOverlay, setShowLiveOverlay] = useState(false);
  
  const handleLiveClick = () => {
  setShowLiveOverlay(true);
};

  const handleGearClick = () => {
    window.open("/Login", "_blank");
    setShowSettings(true);
  };

const cellStyle = (value: string | number | null | undefined) => ({
  backgroundColor: value && value !== "-" ? "lightgreen" : "white",
});

useEffect(() => {
  const fetchPingData = async () => {
    try {
      const response = await fetch('http://192.168.0.20:4001/api/ping');
      const json = await response.json();
      const values = json.data;

      const ids = [
        'machine1-1','machine1-2','machine1-3','machine1-4','machine1-5',
        'machine2-1','machine2-2','machine2-3','machine2-4','machine2-5'
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
      const response = await fetch('http://192.168.0.20:4001/api/shiftdata');
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

interface outdup {
   hs_hs_actual_data: number;
}


const [shiftOutCount, setShiftOutCount] = useState<outdup | null>(null);

useEffect(() => {
  const fetchShiftOutData = async () => {
    try {
      const response = await fetch('http://192.168.0.20:4001/api/shiftoutdup');
      const json = await response.json();

      setShiftOutCount({
        hs_hs_actual_data: Number(json.hs_hs_actual_data)
      });

    } catch (error) {
      console.error('❌ Error fetching shift out data:', error);
    }
  };

  fetchShiftOutData();
  const interval = setInterval(fetchShiftOutData, 1000);

  return () => clearInterval(interval);
}, []);

// useEffect(() => {
//   const fetchShiftOutData = async () => {
//     try {
//       const response = await fetch('http://192.168.0.20:4001/api/shiftDataOut');
//       const json = await response.json();
//       setShiftOutCount(json.count);
//     } catch (error) {
//       console.error('❌ Error fetching shift out data:', error);
//     }
//   };

//   fetchShiftOutData();
//   const interval = setInterval(fetchShiftOutData, 1000);

//   return () => clearInterval(interval);
// }, []);

const [kickInCount, setKickInCount] = useState<number | null>(null);
const [kickOutCount, setKickOutCount] = useState<number | null>(null);

useEffect(() => {
  const fetchKickInOutData = async () => {
    try {
      const response = await fetch('http://192.168.0.20:4001/api/kickInOutData');
      const json = await response.json();

      setKickInCount(json.kick_in_count ?? 0);
      setKickOutCount(json.kick_out_count ?? 0);
    } catch (error) {
      console.error('❌ Error fetching kick-in/out data:', error);
    }
  };

  fetchKickInOutData(); 
  const interval = setInterval(fetchKickInOutData, 1000);

  return () => clearInterval(interval);
}, []);

const [abnormalCycleCount, setAbnormalCycleCount] = useState<number | null>(null);

useEffect(() => {
  const fetchAbnormalCycleData = async () => {
    try {
      const response = await fetch('http://192.168.0.20:4001/api/abnormalCycleData');
      const json = await response.json();

      setAbnormalCycleCount(json.abnormal_count ?? 0);

      const aCycleElement = document.getElementById('A-cycle');
      if (aCycleElement) {
        aCycleElement.textContent = json.abnormal_count?.toString() ?? '0';
      }
    } catch (error) {
      console.error('❌ Error fetching abnormal cycle data:', error);
    }
  };

  fetchAbnormalCycleData();
  const interval = setInterval(fetchAbnormalCycleData, 1000); 

  return () => clearInterval(interval)
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

      const sPassElement = document.getElementById('S-pass');
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


  const [engineNo, setEngineNo] = useState<string>("-");
  const [engineCode, setEngineCode] = useState<string>("-");


interface ProcessMinutes {
  ID_WRITING: string | null;
  STEM_OIL_ASSEMBLY: string | null;
  STEM_OIL_INSP: string | null;
  COTTER_RETAINER_ASSEMBLY: string | null;
  COTTER_RETAINER_INSP: string | null;
  PLUG_TUBE_PRESS: string | null;
  SPARK_PLUG_TIGHT: string | null;
  PORT_LEAK_TESTER: string | null;
  FUEL_LEAK_TESTER: string | null;
  END_CAP_VISION: string | null;
}

const computeEngineArrows = (pm: ProcessMinutes | undefined) => {
  if (!pm) return;

  const parseDateTime = (t: string | null): Date | null => {
    if (!t) return null;
    const [datePart, timePart] = t.split(" ");
    if (!datePart || !timePart) return null;
    const [day, month, year] = datePart.split("-").map(Number);
    const [hours, minutes, seconds] = timePart.split(":").map(Number);
    if ([day, month, year, hours, minutes, seconds].some(isNaN)) return null;
    return new Date(year, month - 1, day, hours, minutes, seconds);
  };

  const diffSeconds = (
    later: string | null,
    earlier: string | null
  ): number | null => {
    const d1 = parseDateTime(later);
    const d0 = parseDateTime(earlier);
    if (!d1 || !d0) return null;
    return Math.round((d1.getTime() - d0.getTime()) / 1000);
  };

  const setVal = (id: string, val: number | null) => {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (el) el.value = val !== null ? String(val) : "";
  };

  setVal("arrow1data", diffSeconds(pm.STEM_OIL_ASSEMBLY, pm.ID_WRITING));
  setVal("arrow2data", diffSeconds(pm.STEM_OIL_INSP, pm.STEM_OIL_ASSEMBLY));
  setVal("arrow3data", diffSeconds(pm.COTTER_RETAINER_ASSEMBLY, pm.STEM_OIL_INSP));
  setVal("arrow4data", diffSeconds(pm.COTTER_RETAINER_INSP, pm.COTTER_RETAINER_ASSEMBLY));

  setVal("arrow6data", diffSeconds(pm.PLUG_TUBE_PRESS, pm.COTTER_RETAINER_INSP));
  setVal("arrow7data", diffSeconds(pm.SPARK_PLUG_TIGHT, pm.PLUG_TUBE_PRESS));
  setVal("arrow8data", diffSeconds(pm.PORT_LEAK_TESTER, pm.SPARK_PLUG_TIGHT));
  setVal("arrow9data", diffSeconds(pm.FUEL_LEAK_TESTER, pm.PORT_LEAK_TESTER));
  setVal("arrow10data", diffSeconds(pm.END_CAP_VISION, pm.FUEL_LEAK_TESTER));

  computeEngineTPT();
};

const computeEngineTPT = () => {
  const arrowIds = [
    "arrow1data",
    "arrow2data",
    "arrow3data",
    "arrow4data",
    "arrow6data",
    "arrow7data",
    "arrow8data",
    "arrow9data",
    "arrow10data",
  ];

  let totalSeconds = 0;

  arrowIds.forEach(id => {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (!el) return;

    const val = Number(el.value);
    if (!isNaN(val)) totalSeconds += val;
  });

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const formatted = `${minutes}m ${seconds}s`;

  const tptEl = document.getElementById("tpt-data") as HTMLInputElement | null;
  if (tptEl) tptEl.value = formatted;
};



  useEffect(() => {
    const fetchEngineData = async () => {
      try {
        const res = await fetch("http://192.168.0.20:4001/api/engine-number");
        const data: EngineData = await res.json();
        setEngineNo(data.engineNumber ?? "-");
        setEngineCode(data.engineCode ?? "-");
      } catch (err) {
        console.error("❌ fetching :", err);
        setError("fetching..");
      } finally {
        setLoading(false);
      }
    };

    fetchEngineData();
    const interval = setInterval(fetchEngineData, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
  if (!engineNo || engineNo === "-") return;

  const fetchProcessData = async () => {
    try {
      const res = await fetch(
        `http://192.168.0.20:4001/api/engine-number2?engineNo=${engineNo}`
      );
      const data = await res.json();
      computeEngineArrows(data.processMinutes);
    } catch (err) {
      console.error("❌ Error fetching process timestamps:", err);
    }
  };

  fetchProcessData();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [engineNo]);


interface EngineData {
  engineNumber: string | null;
  engineCode: string | null;
  dateTime?: string | null;
  shift?: string | null;
  message?: string;
  timeDevColors: string[]; 

  timeDev1?: string | null;
  result1_1?: string | null;
  result1_2?: string | null;
  result1_3?: string | null;
  result1_4?: string | null;

  timeDev2?: string | null;
  result2_1?: string | null;
  result2_2?: string | null;
  result2_3?: string | null;
  result2_4?: string | null;

  timeDev3?: string | null;
  result3_1?: string | null;
  result3_2?: string | null;
  result3_3?: string | null;
  result3_4?: string | null;

  timeDev4?: string | null;
  result4_1?: string | null;
  result4_2?: string | null;
  result4_3?: string | null;
  result4_4?: string | null;

  timeDev5?: string | null;
  result5_1?: string | null;
  result5_2?: string | null;
  result5_3?: string | null;
  result5_4?: string | null;

  timeDev6?: string | null;
  result6_1?: string | null;
  result6_2?: string | null;
  result6_3?: string | null;
  result6_4?: string | null;

  timeDev7?: string | null;
  result7_1?: string | null;
  result7_2?: string | null;
  result7_3?: string | null;
  result7_4?: string | null;

  timeDev8?: string | null;
  result8_1?: string | null;
  result8_2?: string | null;
  result8_3?: string | null;
  result8_4?: string | null;
}

  const [engineData, setEngineData] = useState<EngineData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timestdValues, settimestdValues] = useState<{ [key: string]: string | number }>({});
  useEffect(() => {
    const fetchEngineData = async () => {
      try {
        const res = await fetch("http://192.168.0.20:4001/api/engine-number");
        const data: EngineData = await res.json();
        setEngineData(data);
      } catch (err) {
        console.error("❌ Error fetching engine data:", err);
        setError("Error fetching engine data");
      } finally {
        setLoading(false);
      }
    };

    fetchEngineData();
    const interval = setInterval(fetchEngineData, 1000);
    return () => clearInterval(interval);
  }, []);
  
const cellColorRule = (
  row: number,
  value: string | number | null | undefined
): string => {
  if (value === null || value === undefined || value === "-") return "white";

  switch (row) {
    case 1:
      return String(value).includes("X") ? "red" : "lightgreen";

    case 2:
      return value === "0" ? "red" : "lightgreen";

    case 3:
      return String(value).includes("X") ? "red" : "lightgreen";

    case 4:
      return value === "0" ? "red" : "lightgreen";

    case 5: {
      const num = parseFloat(String(value));
      if (isNaN(num)) return "red";
      return num < 2.8 || num > 13 ? "red" : "lightgreen";
    }

    case 6:
      return value === "NG" ? "red" : "lightgreen";

    default:
      return "lightgreen";
  }
};

const isQualityData4Gray =
  String(engineData?.engineCode).trim() === "012";

const grayCellStyle: React.CSSProperties = {
  backgroundColor: "#d3d3d3",
  color: "#1f1e1eff",
  textAlign: "center",
};


useEffect(() => {
  const fetchStdValues = async () => {
    try {
      const res = await fetch("http://192.168.0.20:4001/api/engine-number");
      const data = await res.json();

      settimestdValues({
        timestd1: data.timestd1 ?? "-",
        timestd2: data.timestd2 ?? "-",
        timestd3: data.timestd3 ?? "-",
        timestd4: data.timestd4 ?? "-",
        timestd5: data.timestd5 ?? "-",
        timestd6: data.timestd6 ?? "-",
        timestd7: data.timestd7 ?? "-",
        timestd8: data.timestd8 ?? "-",
        timestd9: data.timestd9 ?? "-",
      });

    } catch (err) {
      console.error("❌ Error fetching STD values:", err);
    }
  };

  fetchStdValues();
  const interval = setInterval(fetchStdValues, 2000);

  return () => clearInterval(interval);
}, []);

const getQualityCellStyle = (
  row: number,
  value: string | number | null | undefined
): React.CSSProperties => {
  if (isQualityData4Gray) {
    return grayCellStyle; 
  }

  const bg = cellColorRule(row, value);

  return {
    backgroundColor: bg,
    color: bg === "red" ? "white" : "black",
    textAlign: "center",
  };
};


useEffect(() => {
  const applyTimeDevColors = () => {
    for (let i = 1; i <= 8; i++) {
      const cell = document.getElementById(`timedev${i}`);
      if (cell && engineData?.timeDevColors) {
        const color = engineData.timeDevColors[i - 1] ?? "gray";
        cell.style.backgroundColor = color;
        cell.style.color = color === "red" ? "white" : "black";
      }
    }
  };

  applyTimeDevColors();
  const interval = setInterval(applyTimeDevColors, 1000);
  return () => clearInterval(interval);
}, [engineData]);

useEffect(() => {
  if (!engineData) return;

  const is012 = engineData.engineCode === "012";

  const rows = [
    [engineData.result1_1, engineData.result1_2, engineData.result1_3, engineData.result1_4],
    [engineData.result2_1, engineData.result2_2, engineData.result2_3, engineData.result2_4],
    [engineData.result3_1, engineData.result3_2, engineData.result3_3, engineData.result3_4],
    [engineData.result4_1, engineData.result4_2, engineData.result4_3, engineData.result4_4],
    [engineData.result5_1, engineData.result5_2, engineData.result5_3, engineData.result5_4],
    [engineData.result6_1, engineData.result6_2, engineData.result6_3, engineData.result6_4],
  ];

  let allGreen = true;

  rows.forEach((rowValues, rowIndex) => {
    const columnsToCheck = is012 ? rowValues.slice(0, 3) : rowValues;

    columnsToCheck.forEach(value => {
      const color = cellColorRule(rowIndex + 1, value);
      if (color === "red") allGreen = false;
    });
  });

  const resultImg = document.querySelector<HTMLImageElement>("#result2 img");
  if (resultImg) {
    resultImg.src = allGreen ? okay : notokay;
  }

}, [engineData]);

const navigate = useNavigate();

const handleKickClick = () => {
  navigate("/head-traceability/kick-io"); 
};

  if (loading) return <p><img src={tieilogo} alt="tieilogo" width="20%" height="4%" style={{marginTop: "19%", marginLeft:"38%"}}/></p>;

  return (
    <>

  <div id="head1"  className={showSettings ? "blur" : ""}>
    <header>
      <img
  src={menu}
  alt="menu"
  width="80"
  height="100"
  id='menu'
  onMouseEnter={() => setShowMenu(true)}
  onMouseLeave={() => setShowMenu(false)}
/>
      <h2 id='topic'>HEAD FIREWALL – MAIN DASHBOARD</h2>
      <img src={tiei1} alt="TIEI-1" width="50" height="60" id="tiei1" />
      <img src={tiei2} alt="TIEI-2" width="300" height="70" id="tiei2" />
      <img 
  src={live} 
  alt="live" 
  width="80" 
  height="80" 
  id='live' 
  onClick={handleLiveClick}
/>

        <div id="tiei3">
    <FontAwesomeIcon
      icon={faGear}
      size="2x"
      onClick={handleGearClick}
      style={{ marginTop: '20px', color: '0,112,192', cursor: "pointer" }}
    />
  </div>
    </header>

    <main id="dashboard-table">
      <span id="ss1">Shift Status</span>
      <table>
        <tbody>
          <tr id="row1">
            <td rowSpan={2} id="box1">IN</td>
            <td rowSpan={2} id="shift-in">
              {shiftInCount !== null ? shiftInCount : '-'}
            </td>

            <td id="box2">KICK OUT</td>
            <td id="kick-out">{kickOutCount ?? '-'}</td>

            <td rowSpan={2} id="box3">OUT</td>
            <td rowSpan={2} id="shift-out">{shiftOutCount?.hs_hs_actual_data ?? 0}</td>

            <td rowSpan={2} id="box4">Abnormal cycle</td>
            <td rowSpan={2} id="A-cycle">{abnormalCycleCount !== null ? abnormalCycleCount : '-'}</td>

            <td rowSpan={2} id="box5">Straight-Pass</td>
            <td rowSpan={2} id="S-pass">{straightPass !== null ? straightPass : '-'}</td>
          </tr>
          <tr id="row1-sub">
            <td id="box6">KICK IN</td>
            <td id="kick-in">{kickInCount ?? '-'}</td>
          </tr>
        </tbody>
      </table>
 
    </main>

    <div id="row2">
      <span style={{ marginLeft: "-84%",marginTop: "1%" ,color: "blue", fontStyle: "italic", fontSize: "35px", fontWeight: "bold"}} id='layout'>Layout:</span>
      <div id='top-box'>
        <label htmlFor="tpt-data" id="tpt" style={{marginLeft: "2%", marginTop: "-80px"}}>Throughput time</label>
        <input
          type="text"
          id="tpt-data"
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

   
        <table id="row2-tbl">
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


        <h2 id="ch">Cylinder Head</h2>
        <img src={cylinder} alt="cylinder" width="20%" height="20%" id="ch-pic" />
      
    </div>

    <div>
      <table>
        <tbody>
          <tr id="row3">
            <td id="man-1">
              D4 Fuel Pipe Assy
              <img src={Man} alt="man" width="45" height="45" style={{ marginTop: "15px", marginLeft: "15px" }}  id='man1' />
            </td>
            <td id="B-1">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='b1' />
            </td>
            <td id="B-2">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px"}} id='b2' />
            </td>
            <td id="machine1-5">
              Cotter/ Retainer Insp
              <img src={Machine} alt="machine" width="40" height="40" style={{ marginTop: "10px", marginLeft: "18px" }} id='machine5'  />
            </td>
            <td id="B-3">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }}  id='b3'/>
            </td>
            <td id="machine1-4">
              Cotter/ Retainer Assy
              <img src={Machine} alt="machine" width="40" height="50" style={{ marginTop: "8px", marginLeft: "15px" }}  id='machine4'/>
            </td>
            <td id="man-2">
              Spring Assy
              <img src={Man} alt="man" width="42" height="42" style={{ marginTop: "4px", marginLeft: "18px" }} id='man2' />
            </td>
            <td id="man-3">
              Spring seat Assy
              <img src={Man} alt="man" width="42" height="42" style={{ marginTop: "4px", marginLeft: "18px" }}  id='man3'/>
            </td>
            <td id="man-4">
              Value Assy
              <img src={Man} alt="man" width="42" height="42" style={{ marginTop: "4px", marginLeft: "18px" }}id='man4' />
            </td>
            <td id="B-4">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }}  id='b4'/>
            </td>
            <td id="machine1-3">
              Steam oil seal Insp
              <img src={Machine} alt="machine" width="40" height="50" style={{ marginTop: "25px", marginLeft: "21px" }} id='machine3'/>
            </td>
            <td id="machine1-2">
              Steam oil seal Assy
              <img src={Machine} alt="machine" width="40" height="50" style={{ marginTop: "25px", marginLeft: "21px" }}  id='machine2'/>
            </td>
            <td id="B-5">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='b5'/>
            </td>
            <td id="machine1-1">
              ID writing
              <img src={Machine} alt="machine" width="40" height="50" style={{ marginTop: "46px", marginLeft: "21px" }} id='machine1' />
            </td>
          </tr>
        </tbody>
      </table>

    </div>

    {/* <div id='md'>
      <table >
        <tr >
          <td style={{border: "none", marginTop: "-20px"}}>
            <p style={{fontSize: "40px", lineHeight: "2", marginLeft: "60px",marginBottom:"0px"}}>↑</p>
            <span id='dolly'
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

<div id='logic'>
 <div id='md'>
 <p style={{fontSize: "40px", lineHeight: "2", marginLeft: "60px",marginBottom:"0px", color: "rgba(102, 99, 99, 0.733)"}} id='up'>↑</p>
  <span id='dolly'
  style={{
    border: "1px solid rgba(167, 164, 164, 0.73)",
    padding:"15px",
    fontSize: "17px",
    fontWeight: "bold",
  }}>Manual dolly</span>
 <p style={{fontSize: "40px", lineHeight: "2", marginLeft: "60px", marginTop:"-10px", color: "rgba(102, 99, 99, 0.733)"}}  id='down'>↓</p>
</div>

<div className="arrow-line">
    <span className="arrow5">-----------------------------▷</span>
    <span className="arrow4">◁----------------▷</span>
    <span className="arrow3">◁-------------------------------------------------------▷</span>
    <span className="arrow2">◁-------▷</span>
    <span className="arrow1">◁-----------------▷</span>
</div>

<div className='arrowlinedata1'>
  <input type="text" id="arrow5data" readOnly />
  <input type="text" id='arrow4data' readOnly/>
  <input type="text" id='arrow3data' readOnly/>
  <input type="text" id='arrow2data' readOnly/>
  <input type="text" id='arrow1data'  readOnly/>
</div>

<div className='arrowlinedata2'>
  <input type="text" id="arrow6data" readOnly/>
  <input type="text" id='arrow7data' readOnly/>
  <input type="text" id='arrow8data' readOnly/>
  <input type="text" id='arrow9data' readOnly/>
  <input type="text" id='arrow10data' readOnly/>
</div>

<div id='fd1'>
  <p style={{color:"red",marginLeft:"1020px",marginTop: "-210px"}} id='flow-right'>Flow direction</p>
  <p
  id='right-line'
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

<div className="arrow-line2">
    <span className="arrow6">-------------▷</span>
    <span className="arrow7">◁---------------------------▷</span>
    <span className="arrow8">◁---------------▷</span>
    <span className="arrow9">◁-----------------▷</span>
    <span className="arrow10">◁-------------------------------▷</span>
</div>

<div id='fd2'>
<p style={{marginTop: "-140px",marginLeft:"-110px",color:"red"}} id='flow-left'>Flow direction</p>
<p
 id='left-line'
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
          <tr id="row4">
            <td id="man2-1">
              <img src={Man} alt="man" width="45" height="45" style={{ marginTop: "8px", marginLeft: "12px" }} id='man21' />
              <span style={{ marginTop: "10px" }}>Low Pres Fuel Pipe Assy</span>
            </td>
            <td id="machine2-1">
              <img src={Machine} alt="machine" width="40" height="50" style={{ marginTop: "10px", marginLeft: "21px" }}  id='machine21'/>
              Plug Tube Press Fit
            </td>
            <td id="B2-1">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='b21'/>
            </td>
            <td id="B2-2">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='b22' />
            </td>
            <td id="machine2-2">
              <img src={Machine} alt="machine" width="40" height="50" style={{ marginTop: "10px", marginLeft: "21px" }}  id='machine22'/>
              Spark Plug Tightening
            </td>
            <td id="man2-2">
              <img src={Man} alt="man" width="45" height="45" style={{ marginLeft: "4px" }} id='man22'/>
            </td>
            <td id="machine2-3">
              <img src={Machine} alt="machine" width="40" height="50" style={{ marginTop: "10px", marginLeft: "21px" }}id='machine23' />
              Port Leak Tester
            </td>
            <td id="man2-3">
              <img src={Man} alt="man" width="45" height="45" style={{ marginLeft: "4px" }}id='man23' />
            </td>
            <td id="machine2-4">
              <img src={Machine} alt="machine" width="40" height="50" style={{ marginTop: "10px", marginLeft: "21px" }} id='machine24'/>
              Fuel Leak Tester
            </td>
            <td id="man2-4">
              <img src={Man} alt="man" width="42" height="42" style={{ marginTop: "1px", marginLeft: "15px" }} id='man24'/>
              <span style={{ marginTop: "10px" }}>End cap</span>
            </td>
            <td id="man2-5">
              <img src={Man} alt="man" width="42" height="42" style={{ marginTop: "1px", marginLeft: "15px" }}  id='man25'/>
              <span style={{ marginTop: "10px" }}>Lash Adjuster</span>
            </td>
            <td id="machine2-5">
              <img src={Machine} alt="machine" width="40" height="40" style={{ marginTop: "10px", marginLeft: "21px" }}id='machine25' />
              End Cap Vision System
            </td>
            <td id="man2-4">
              <img src={Man} alt="man" width="42" height="42" style={{ marginTop: "1px", marginLeft: "15px" }}id='man24' />
              <span style={{ marginTop: "10px" }}>Rocker Arm</span>
            </td>
            <td id="B2-3">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='b23'/>
            </td>
            <td id="B2-4">
              <span style={{
                display:"flex",
               justifyContent: "center",
               alignItems: "center",
               marginTop: "10px",
               backgroundColor: "rgba(251,243,225)",
               padding: "4px",
               border: "2px solid orange",borderRadius:"5px"
              }} id='b24'>C/H</span>
            </td>
            <td style={{
              height:"60px",
              marginTop: "60px",
              marginLeft: "-40px",
              borderRadius: "5px"
              }}  id='downarrow'><img src={downarrow} alt="downarrow" width="34" height="66"  id='downarrow-img'/></td>
            <td style={{
              marginLeft:"6px",borderRadius: "5px"
            }} id='uparrow'><img src={uparrow} alt="uparrow" width="34" height="100"  id='uparrow-img'/></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div id="lastrow">
      <div id="row5">
        <table id="row5-tbl">
          <tbody>
  <tr id="cell1">
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

  <tr id="cell2">
    <td style={{ border: "none",  padding: "5px"}}>
      Head SL No
    </td>
  </tr>

  <tr id="cell3">
    <td style={{ border: " rgba(255, 255, 0, 0.51)",borderRadius: "10px" }}>
      {loading ? "Loading..." : error ? error : engineNo}
    </td>
  </tr>

  <tr id="cell4">
    <td style={{ border: "none",  padding: "5px" }}>
      Eng code
    </td>
  </tr>

  <tr id="cell5">
    <td style={{ border: "none"}}>
      {engineCode}
    </td>
  </tr>
</tbody>

        </table>
      </div>

      <div id="row6">
        <table id="row6-tbl">
          <tbody>
  <tr id="line1">
    <td ></td>
    <td colSpan={2} id='time-stamp'>Time Stamp</td>
    <td colSpan={5}>Quality</td>
  </tr>

  <tr id="line2">
    <td id='machine'>Machine</td>
    <td id='std1'>STD</td>
    <td id='dev'>DEV</td>
    <td id='std2'>STD</td>
    <td id='#1'>#1</td>
    <td id='#2'>#2</td>
    <td id='#3'>#3</td>
    <td id='#4'>#4</td>
  </tr>

 <tr id="line3">
        <td>Stem oil Assy</td>

        <td id="timestd1">{timestdValues.timestd1}</td>
        <td style={cellStyle(engineData?.timeDev1)} id="timedev1">{engineData?.timeDev1 ?? "-"}</td>
        <td id="qualitystd1">0000</td>
        <td style={{ backgroundColor: cellColorRule(1, engineData?.result1_1), color: cellColorRule(1, engineData?.result1_1) === "red" ? "white" : "black" }} id="quality1data1">{engineData?.result1_1 ?? "-"}</td>
        <td style={{ backgroundColor: cellColorRule(1, engineData?.result1_2), color: cellColorRule(1, engineData?.result1_2) === "red" ? "white" : "black" }} id="quality1data2">{engineData?.result1_2 ?? "-"}</td>
        <td style={{ backgroundColor: cellColorRule(1, engineData?.result1_3), color: cellColorRule(1, engineData?.result1_3) === "red" ? "white" : "black" }} id="quality1data3">{engineData?.result1_3 ?? "-"}</td>
<td id="quality1data4" style={getQualityCellStyle(1, engineData?.result1_4)}>
  {isQualityData4Gray ? "-" : engineData?.result1_4 ?? "-"}
</td>
      </tr>

  <tr id="line4">
        <td>Stem oil Insp</td>

        <td id="timestd2">{timestdValues.timestd2}</td>
        <td style={cellStyle(engineData?.timeDev2)} id="timedev2">{engineData?.timeDev2 ?? "-"}</td>

        <td id="qualitystd2">Variant specific</td>

        <td style={{ backgroundColor: cellColorRule(2, engineData?.result2_1), color: cellColorRule(2, engineData?.result2_1) === "red" ? "white" : "black" }} id="quality2data1">{engineData?.result2_1 ?? "-"}</td>
        <td style={{ backgroundColor: cellColorRule(2, engineData?.result2_2), color: cellColorRule(2, engineData?.result2_2) === "red" ? "white" : "black" }} id="quality2data2">{engineData?.result2_2 ?? "-"}</td>
        <td style={{ backgroundColor: cellColorRule(2, engineData?.result2_3), color: cellColorRule(2, engineData?.result2_3) === "red" ? "white" : "black" }} id="quality2data3">{engineData?.result2_3 ?? "-"}</td>
<td id="quality2data4" style={getQualityCellStyle(2, engineData?.result2_4)}>
  {isQualityData4Gray ? "-" : engineData?.result2_4 ?? "-"}
</td>

      </tr>

  <tr id="line5">
        <td>Cotter retainer Assy</td>
        <td id="timestd3">{timestdValues.timestd3}</td>
        <td style={cellStyle(engineData?.timeDev3)} id="timedev3">{engineData?.timeDev3 ?? "-"}</td>
        <td id="qualitystd3">0000</td>
        <td style={{ backgroundColor: cellColorRule(3, engineData?.result3_1), color: cellColorRule(3, engineData?.result3_1) === "red" ? "white" : "black" }} id="quality3data1">{engineData?.result3_1 ?? "-"}</td>
        <td style={{ backgroundColor: cellColorRule(3, engineData?.result3_2), color: cellColorRule(3, engineData?.result3_2) === "red" ? "white" : "black" }} id="quality3data2">{engineData?.result3_2 ?? "-"}</td>
        <td style={{ backgroundColor: cellColorRule(3, engineData?.result3_3), color: cellColorRule(3, engineData?.result3_3) === "red" ? "white" : "black" }} id="quality3data3">{engineData?.result3_3 ?? "-"}</td>
<td id="quality3data4" style={getQualityCellStyle(3, engineData?.result3_4)}>
  {isQualityData4Gray ? "-" : engineData?.result3_4 ?? "-"}
</td>

      </tr>

      <tr id="line6">
        <td>Cotter retainer Insp</td>
        <td id="timestd4">{timestdValues.timestd4}</td>
        <td style={cellStyle(engineData?.timeDev4)} id="timedev4">{engineData?.timeDev4 ?? "-"}</td>
        <td id="qualitystd4">Variant specific</td>
        <td style={{ backgroundColor: cellColorRule(4, engineData?.result4_1), color: cellColorRule(4, engineData?.result4_1) === "red" ? "white" : "black" }} id="quality4data1">{engineData?.result4_1 ?? "-"}</td>
        <td style={{ backgroundColor: cellColorRule(4, engineData?.result4_2), color: cellColorRule(4, engineData?.result4_2) === "red" ? "white" : "black" }} id="quality4data2">{engineData?.result4_2 ?? "-"}</td>
        <td style={{ backgroundColor: cellColorRule(4, engineData?.result4_3), color: cellColorRule(4, engineData?.result4_3) === "red" ? "white" : "black" }} id="quality4data3">{engineData?.result4_3 ?? "-"}</td>
<td id="quality4data4" style={getQualityCellStyle(4, engineData?.result4_4)}>
  {isQualityData4Gray ? "-" : engineData?.result4_4 ?? "-"}
</td>

      </tr>

      <tr id="line7">
        <td>Plug tube press fit</td>
        <td id="timestd5">{timestdValues.timestd5}</td>
        <td style={cellStyle(engineData?.timeDev5)} id="timedev5">{engineData?.timeDev5 ?? "-"}</td>
        <td id="qualitystd5">2.8 ~ 13 KN</td>
        <td style={{ backgroundColor: cellColorRule(5, engineData?.result5_1), color: cellColorRule(5, engineData?.result5_1) === "red" ? "white" : "black" }} id="quality5data1">{engineData?.result5_1 ?? "-"}</td>
        <td style={{ backgroundColor: cellColorRule(5, engineData?.result5_2), color: cellColorRule(5, engineData?.result5_2) === "red" ? "white" : "black" }} id="quality5data2">{engineData?.result5_2 ?? "-"}</td>
        <td style={{ backgroundColor: cellColorRule(5, engineData?.result5_3), color: cellColorRule(5, engineData?.result5_3) === "red" ? "white" : "black" }} id="quality5data3">{engineData?.result5_3 ?? "-"}</td>
<td id="quality5data4" style={getQualityCellStyle(5, engineData?.result5_4)}>
  {isQualityData4Gray ? "-" : engineData?.result5_4 ?? "-"}
</td>

      </tr>

      <tr id="line8">
        <td>Spark plug tight</td>
        <td id="timestd6">{timestdValues.timestd6}</td>
        <td style={cellStyle(engineData?.timeDev6)} id="timedev6">{engineData?.timeDev6 ?? "-"}</td>
        <td id="qualitystd6">20 N</td>
        <td style={{ backgroundColor: cellColorRule(6, engineData?.result6_1), color: cellColorRule(6, engineData?.result6_1) === "red" ? "white" : "black" }} id="quality6data1">{engineData?.result6_1 ?? "-"}</td>
        <td style={{ backgroundColor: cellColorRule(6, engineData?.result6_2), color: cellColorRule(6, engineData?.result6_2) === "red" ? "white" : "black" }} id="quality6data2">{engineData?.result6_2 ?? "-"}</td>
        <td style={{ backgroundColor: cellColorRule(6, engineData?.result6_3), color: cellColorRule(6, engineData?.result6_3) === "red" ? "white" : "black" }} id="quality6data3">{engineData?.result6_3 ?? "-"}</td>

<td id="quality6data4" style={getQualityCellStyle(6, engineData?.result6_4)}>
  {isQualityData4Gray ? "-" : engineData?.result6_4 ?? "-"}
</td>
      </tr>

      <tr id="line9">
        <td>Port leak</td>
        <td id="timestd7">{timestdValues.timestd7}</td>
        <td style={cellStyle(engineData?.timeDev7)} id="timedev7">{engineData?.timeDev7 ?? "-"}</td>
        <td id="qualitystd7">5ml/min</td>
        <td style={cellStyle(engineData?.result7_1)} id="quality7data1">{engineData?.result7_1 ?? "-"}</td>
        <td style={getQualityCellStyle(7, engineData?.result7_2)} id="quality7data2">{engineData?.result7_2 ?? "-"}</td>
        <td style={getQualityCellStyle(7, engineData?.result7_3)} id="quality7data3">{engineData?.result7_3 ?? "-"}</td>
<td id="quality7data4" style={getQualityCellStyle(7, engineData?.result7_4)}>
  {isQualityData4Gray ? "-" : engineData?.result7_4 ?? "-"}
</td>
</tr>

      <tr id="line10">
        <td>Fuel leak</td>
        <td id="timestd8">{timestdValues.timestd8}</td>
        <td style={cellStyle(engineData?.timeDev8)} id="timedev8">{engineData?.timeDev8 ?? "-"}</td>
        <td id="qualitystd8">0.4ml/min</td>
        <td style={cellStyle(engineData?.result8_1)} id="quality8data1">{engineData?.result8_1 ?? "-"}</td>
        <td style={cellStyle(engineData?.result8_2)} id="quality8data2">{engineData?.result8_2 ?? "-"}</td>
        <td style={getQualityCellStyle(8, engineData?.result8_3)} id="quality8data3">{engineData?.result8_3 ?? "-"}</td>
<td id="quality8data4" style={getQualityCellStyle(8, engineData?.result8_4)}>
  {isQualityData4Gray ? "-" : engineData?.result8_4 ?? "-"}
</td>
      </tr>

      <tr id="line11">
        <td>End cap vision</td>
        <td id="timestd9">{timestdValues.timestd9}</td>
        <td style={cellStyle("-")} id="timedev9">-</td>
        <td id="qualitystd9">0000</td>
        <td style={cellStyle("-")} id="quality9data1">-</td>
        <td style={cellStyle("-")} id="quality9data2">-</td>
        <td style={cellStyle("-")} id="quality9data3">-</td>
<td
  id="quality9data4"
>
</td>
      </tr>
</tbody>

        </table>
      </div>
 {/* <div id='btns'>
        <button type='submit' id='btn1'>TO KICK IN/OUT</button>
        <button type='submit' id='btn3'>BACK TO MAIN</button>
        <button type='submit' id='btn4'>GO TO LIVE</button>
      </div> */}
      <div id='row7'>
  <table id='result'>
    <tbody>
      <tr><td id='result1'>Overall Judgement</td></tr>
      <tr><td id='result2'><img src={okay} alt="okay" height="150" width="150"  id='result-img'/></td></tr>
      <tr><td
  id='result3'
  onClick={handleKickClick}
  style={{ cursor: "pointer", fontWeight: "bold", color: "white"}}>TO KICK IN / OUT</td></tr>
    </tbody>
  </table>
</div>

      </div>
    </div>
    {showMenu && (
  <Menu setShowMenu={setShowMenu}
  />
)}
  {showLiveOverlay && <Golive closeOverlay={() => setShowLiveOverlay(false)} />}

</>
    
  );

};

export default App;