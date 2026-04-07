import '../Piston-firewall/index.css';

import {
  useEffect,
  useState,
} from 'react';

import { faGear } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import B from '../assets/B.png';
import live from '../assets/live-streaming.gif';
import Machine from '../assets/Machine.png';
import Man from '../assets/Man.png';
import menu from '../assets/menu.gif';
import notokay from '../assets/not okay.png';
import okay from '../assets/okay.png';
import cylinder from '../assets/Piston.png';
import tiei1 from '../assets/tiei-pic1.png';
import tiei2 from '../assets/tiei-pic2.png';
import Golive from '../Piston-firewall/GOLIVE';
import Menu from '../Piston-firewall/menu';

type DataRow = {
  asn: string;
  suffix: string;
};


const App = () => {
   const [, setData] = useState<DataRow[]>([]);
    //console.log(data);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showLiveOverlay, setShowLiveOverlay] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const handleLiveClick = () => {
  setShowLiveOverlay(true);
};

  const handleGearClick = () => {
  setIsSpinning(!isSpinning);
  window.open("/pistonlogin", "_blank");
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
      const response = await fetch('http://192.168.0.20:4001/api/pistonshiftindata');
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
       const response = await fetch('http://192.168.0.20:4001/api/pistonshiftDataOut');
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

interface ApiResponse {
  judgements: Record<string, number[]>;
  mainJudgements: Record<string, string>;
  stdDeviationTimes: string[];
}

const applyCellStyle = (id: string, value: number | null | undefined) => {

  const el = document.getElementById(id);
  if (!el) return;

  let bg = "transparent";
  let color = "black";

  if (value === 1) {
    bg = "lightgreen";
  } 
  else if (value === 0) {
    bg = "red";
    color = "white";
  }

  el.style.backgroundColor = bg;
  el.style.color = color;
};
useEffect(() => {

  const fetchPistonData = async () => {
    try {
      const res = await fetch("http://192.168.0.20:4001/api/pistonengine-number");
      const data: ApiResponse = await res.json();

      const judgementCellMap: Record<string, number[]> = {
        row1: [1,2,3,4],
        row2: [1,2,3,4],
        row3: [1,2,3,4],
        row4: [1,2,3,4],
        row5: [1,2,3,4],
        row6: [1,2,3,4],
        row7: [1,2,3,4]
      };


      Object.entries(judgementCellMap).forEach(([rowKey, cols]) => {
        const rowNo = Number(rowKey.replace("row",""));
        const values = data.judgements[rowKey] || [];

        cols.forEach((colIndex, i) => {
          const cellId = `piston_quality${rowNo}data${colIndex}`;
          applyCellStyle(cellId, values[i]);
        });
      });


      let allGreen = true;

      for (let row = 1; row <= 9; row++) {
        const el = document.getElementById(`piston_qualityresult${row}`);
        if (!el) continue;

        const value = data.mainJudgements[`row${row}`] ?? "-";
        el.innerText = value;

        if (value === "OK") {
          el.style.backgroundColor = "lightgreen";
          el.style.color = "black";
        } else if (value === "NG") {
          el.style.backgroundColor = "red";
          el.style.color = "white";
          allGreen = false;
        } else {
          el.style.backgroundColor = "transparent";
          el.style.color = "black";
          allGreen = false; 
        }
      }

      const imgEl = document.getElementById("piston_result-img") as HTMLImageElement | null;
      if (imgEl) {
        imgEl.src = allGreen ? okay : notokay;
        imgEl.alt = allGreen ? "OK" : "NOT OK";
      }

 
      const stdIds = [
        "piston_timestd1",
        "piston_timestd2",
        "piston_timestd3",
        "piston_timestd4",
        "piston_timestd5",
        "piston_timestd6",
        "piston_timestd7",
        "piston_timestd8"
      ];

      if (Array.isArray(data.stdDeviationTimes)) {
        stdIds.forEach((id, index) => {
          const el = document.getElementById(id);
          if (!el) return;

          const value = data.stdDeviationTimes[index];
          el.innerText = value !== null && value !== undefined ? value.toString() : "-";
        });
      }

    } catch (err) {
      console.error("❌ Error fetching piston data:", err);
    }
  };

  fetchPistonData();
  const interval = setInterval(fetchPistonData, 1000);

  return () => clearInterval(interval);

}, []);

interface TableData {
  [key: string]: {
    JUDGEMENT_1?: string;
    JUDGEMENT_2?: string;
    JUDGEMENT_3?: string;
    JUDGEMENT_4?: string;
    JUDGEMENT_5?: string;
    TIME_DEVIATION?: number;
  } | null;
}

const tableRowMap: Record<string, number> = {
  VisionSystem: 1,
  PistonRank: 2,
  PinAssembly: 3,
  SnapRingInspection: 4,   
  SnapRingVisionSystem: 5,  
  RingAssembly: 6,
  Bearingassy:7
};

interface EngineData {
  engineNumber: string | null;
  engineCode: string | null;
}

const [engineNo, setEngineNo] = useState<string>("-");
const [engineCode, setEngineCode] = useState<string>("-");

useEffect(() => {
  const fetchEngineData = async () => {
    const res = await fetch("http://192.168.0.20:4001/api/pistonengine-number");
const data: EngineData = await res.json();
 setEngineNo(data.engineNumber ?? "-");
 setEngineCode(data.engineCode ?? "-");

  };

  fetchEngineData();
  const interval = setInterval(fetchEngineData, 1000);
  return () => clearInterval(interval);
}, []);


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const writeCellValue = (id: string, value: any) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerText = value !== null && value !== undefined ? String(value) : "-";
};


useEffect(() => {
  if (!engineNo || engineNo === "-") return;

  const fetchDetails = async () => {
    try {
      const res = await fetch(
        `http://192.168.0.20:4001/api/pistonengine-details/${engineNo}`
      );

      const data: {
        stations: TableData;
        partTimes: Record<string, string | null>;
      } = await res.json();

     for (const [tableKey, rowNo] of Object.entries(tableRowMap)) {
  const rowData = data.stations[tableKey];
  if (!rowData) continue;

  writeCellValue(`piston_timedev${rowNo}`, rowData.TIME_DEVIATION);

  for (let i = 1; i <= 4; i++) {
    let value = rowData[`JUDGEMENT_${i}` as keyof typeof rowData];

   if (tableKey === "Bearingassy" && value !== null && value !== undefined) {
  const str = String(value);
  value = str.length > 1 ? str.charAt(1) : str;
}

    writeCellValue(`piston_quality${rowNo}data${i}`, value);
  }
}

      computeEngineArrowsAndTPT(data.partTimes);

    } catch (err) {
      console.error("Error fetching details:", err);
    }
  };

  fetchDetails();
  const interval = setInterval(fetchDetails, 1000);
  return () => clearInterval(interval);
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [engineNo]);

const computeEngineArrowsAndTPT = (partTimes: Record<string, string | null> | undefined) => {
  if (!partTimes) return;

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

  const diffMinutesSeconds = (later: string | null, earlier: string | null): string | null => {
    const d1 = parseDateTime(later);
    const d0 = parseDateTime(earlier);
    if (!d1 || !d0) return null;
    const diffMs = d1.getTime() - d0.getTime();
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const setVal = (id: string, val: string | number | null) => {
    const el = document.getElementById(id) as HTMLInputElement | HTMLDivElement | null;
    if (!el) return;
    if ('value' in el) el.value = val !== null ? String(val) : "";
    else el.innerText = val !== null ? String(val) : "-";
  };

  setVal("piston_arrow1data", diffSeconds(partTimes.PART_ENTRY_TIME_2, partTimes.PART_ENTRY_TIME_1));
  setVal("piston_arrow2data", diffSeconds(partTimes.PART_ENTRY_TIME_4, partTimes.PART_ENTRY_TIME_2));
  setVal("piston_arrow3data", diffSeconds(partTimes.PART_ENTRY_TIME_5, partTimes.PART_ENTRY_TIME_4));
  setVal("piston_arrow7data", diffSeconds(partTimes.PART_ENTRY_TIME_6, partTimes.PART_ENTRY_TIME_5));
  setVal("piston_arrow8data", diffSeconds(partTimes.PART_ENTRY_TIME, partTimes.PART_ENTRY_TIME_6));
  setVal("piston_tpt-data", diffMinutesSeconds(partTimes.PART_ENTRY_TIME_2, partTimes.PART_ENTRY_TIME));
};


  return (

    <>

  <div id="piston_head1"  className={showSettings ? "blur" : ""}>
    <header>
      <img
  src={menu}
  alt="menu"
  width="80"
  height="100"
  id='piston_menu'
  onMouseEnter={() => setShowMenu(true)}
  onMouseLeave={() => setShowMenu(false)}
/>
      <h2>Piston FIREWALL – MAIN DASHBOARD</h2>
      <img src={tiei1} alt="TIEI-1" width="50" height="60" id="piston_tiei1" />
      <img src={tiei2} alt="TIEI-2" width="280" height="70" id="piston_tiei2" />
       <img 
  src={live} 
  alt="live" 
  width="80" 
  height="80" 
  id='live' 
  onClick={handleLiveClick}
/>
      <div id="piston_tiei3">
    <FontAwesomeIcon
      icon={faGear}
      size="2x"
      spin={isSpinning}   
      onClick={handleGearClick} 
      style={{ marginTop: '20px', color: '0,112,192' }} id='piston_settings'
    />
      </div>
    </header>

    <main id="piston_dashboard-table">
      <span id="piston_ss1">Shift Status</span>
      <table>
        <tbody>
          <tr id="piston_row1">
            <td rowSpan={2} id="piston_box1">IN</td>
            <td rowSpan={2} id="piston_shift-in">{shiftInCount !== null ? shiftInCount : '-'}</td>

            {/* <td id="piston_box2">KICK OUT</td>
            <td id="piston_kick-out"></td> */}

            <td rowSpan={2} id="piston_box3">OUT</td>
            <td rowSpan={2} id="piston_shift-out">{shiftOutCount !== null ? shiftOutCount : '-'}
            </td>

            {/* <td rowSpan={2} id="piston_box4">Abnormal cycle</td>
            <td rowSpan={2} id="piston_A-cycle"></td>

            <td rowSpan={2} id="piston_box5">Straight-Pass</td>
            <td rowSpan={2} id="piston_S-pass"></td> */}
          </tr>
          {/* <tr id="piston_row1-sub">
            <td id="piston_box6">KICK IN</td>
            <td id="piston_kick-in"></td>
          </tr> */}
        </tbody>
      </table>
    </main>

    <div id="piston_row2">
      <span style={{ marginLeft: "-84%",marginTop: "1%" ,color: " blue", fontStyle: "italic", fontSize: "35px", fontWeight: "bold"}} id='piston_layout'>Layout:</span>
      <div id='piston_top-box'>
        <label htmlFor="tpt-data" id="piston_tpt" style={{marginLeft: "2%", marginTop: "-80px"}}>Throughput time</label>
        <input
          type="text"
          id="piston_tpt-data"
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

        <table id="piston_row2-tbl">
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


        
        <h2 id="piston_ch">Piston sub</h2>
        <img src={cylinder} alt="cylinder" width="25%" height="25%" id="piston_ch-pic" />
      
    </div>

    <div>
      <table>
        <tbody>
          <tr id="piston_row3">
            <td id="piston_B-1">
              <img src={B} alt="B" width="40" height="40" style={{ marginLeft: "14px", marginTop: "8px" }} id='piston_b1' />
            </td>
            <td id="piston_machine1-4">
              Piston pin Assy
               <img src={Machine} alt="machine" width="30" height="25" id='piston_img_machine1-4'  />
            </td>
                <td id="piston_B-2">
              <img src={B} alt="B" width="40" height="40" style={{ marginLeft: "14px", marginTop: "8px" }}  id='piston_b2'/>
            </td>
         
            <td id="piston_machine1-3">
             Piston Heating
              <img src={Machine} alt="machine" width="30" height="25" id='piston_img_machine1-3'  />
            </td>
             <td id="piston_B-3">
              <img src={B} alt="B" width="40" height="40" style={{ marginLeft: "14px", marginTop: "8px" }}  id='piston_b3'/>
            </td>
                <td id="piston_man-1">
                   <span>Piston Assy</span>
             <img src={Man} alt="man" width="36" height="36" style={{ marginTop: "10px", marginLeft: "20px" }} id='piston_man1'/>
             
            </td>
              <td id="piston_machine1-2">
             Rank Vision System
              <img src={Machine} alt="machine" width="30" height="25" id='piston_img_machine1-2'  />
            </td>
            <td id="piston_machine1-1">
              ID Writing
             <img src={Machine} alt="machine" width="30" height="25" id='piston_img_machine1-1'  />
            </td>
         
          </tr>
        </tbody>
      </table>
    </div>

    {/* <div id='piston_md'>
      <table >
        <tr >
          <td style={{border: "none", marginTop: "-20px"}}>
            <p style={{fontSize: "40px", lineHeight: "2", marginLeft: "60px",marginBottom:"0px"}}>↑</p>
            <span id='piston_dolly'
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

    <div className="piston_arrow-line">
    <span className="piston_arrow3">--------------▷</span>
    <span className="piston_arrow2">◁-----------------------------------------------------▷</span>
    <span className="piston_arrow1">◁-------▷</span>
</div>

<div className='piston_arrowlinedata1'>
  <input type="text" id='piston_arrow3data' readOnly/>
  <input type="text" id='piston_arrow2data' readOnly/>
  <input type="text" id='piston_arrow1data'  readOnly/>
</div>

<div className='piston_arrowlinedata2'>
  <input type="text" id='piston_arrow7data' readOnly/>
  <input type="text" id='piston_arrow8data' readOnly/>

</div>

<div className="piston_arrow-line2">
    <span className="piston_arrow6">-------------▷</span>
    <span className="piston_arrow7">◁-------------------------------▷</span>
    <span className="piston_arrow8">◁---------------------------▷</span>
</div>

<div id='piston_logic'>
 <div id='piston_md'>
 <p style={{fontSize: "40px", lineHeight: "2", marginLeft: "60px",marginBottom:"0px",color:"rgb(138, 135, 135)"}} id='piston_up'>↑</p>
  <span id='piston_dolly'
  style={{
    border: "1px solid rgb(138, 135, 135)",
    borderRadius: "5px",
    padding:"15px",
    fontSize: "17px",
    fontWeight: "bold",
  }}>Transfer</span>
 <p style={{fontSize: "40px", lineHeight: "2", marginLeft: "60px", marginTop:"-10px",color:"rgb(138, 135, 135)"}}  id='piston_down'>↓</p>
</div>

<div id='piston_fd1'>
  <p style={{color:"red",marginLeft:"1020px",marginTop: "-210px"}} id='piston_flow-right'>Flow direction</p>
  <p
  id='piston_right-line'
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

<div id='piston_fd2'>
<p style={{marginTop: "-140px",marginLeft:"-110px",color:"red"}} id='piston_flow-left'>Flow direction</p>
<p
 id='piston_left-line'
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
          <tr id="piston_row4">
               <td id="piston_B2-1">
              <img src={B} alt="B" width="40" height="40" style={{ marginLeft: "14px", marginTop: "10px" }} id='piston_b21'/>
            </td>
             <td id="piston_machine2-1">
             Snap ring Assy
              <img src={Machine} alt="machine" width="30" height="25" id='piston_img_machine2-1'  />
            </td>
             <td id="piston_man2-1">
              <img src={Man} alt="man" width="36" height="36" style={{ marginTop: "1px", marginLeft: "35px" }} id='piston_man21'/>
              <span style={{ marginTop: "10px" }}>Oil Ring & Expander assy</span>
            </td>
          
            <td id="piston_machine2-2">
             Piston Ring assy
              <img src={Machine} alt="machine" width="30" height="25" id='piston_img_machine2-2'  />
            </td>
            <td id="piston_machine2-3">
             Rings Vision System
              <img src={Machine} alt="machine" width="30" height="25" id='piston_img_machine2-3'  />
            </td>
            <td id="piston_machine2-4">
             Bearing assy
              <img src={Machine} alt="machine" width="30" height="25" id='piston_img_machine2-4'  />
            </td>
            <td id='piston_arrow'>-------▷
              <span>To Block Sub</span>
            </td>
            
          </tr>
        </tbody>
      </table>
    </div>

    <div id="piston_lastrow">
      <div id="piston_row5">
        <table id="piston_row5-tbl">
          <tbody>
  <tr id="piston_cell1">
    <td
      style={{
        border: "2px solid orange",
        borderRadius: "5px",
        width: "25%",
        fontSize: "25px",
        padding: "10px",
      }}
    >
      Current Part Status
    </td>
  </tr>

  <tr id="piston_cell2">
    <td style={{ border: "none",  padding: "5px" }}>
      Pallet no
    </td>
  </tr>

  <tr id="piston_cell3" style={{border: "1px solid rgb(219, 212, 212)", borderRadius: "5px"}}>
    <td>
      {engineNo}
    </td>
  </tr>

   <tr id="piston_cell4">
        <td style={{ border: "none", padding: "5px" }}>
          Eng Code
        </td>
      </tr>

      <tr id="piston_cell5">
        <td>
          {engineCode}
        </td>
      </tr>

</tbody>
        </table>
      </div>

      <div id="piston_row6">
        <table id="piston_row6-tbl">
          <tbody>

  <tr id="piston_line1">
    <td></td>
    <td colSpan={2} id='piston_time-stamp'>Time Stamp</td>
    <td colSpan={11}>Quality</td>
  </tr>

  <tr id="piston_line2">
    <td id='piston_machine'>Machine</td>
    <td id='piston_std1'>STD</td>
    <td id='piston_dev'>DEV</td>
    
    <td id='piston_#1'>#1</td>
    <td id='piston_#2'>#2</td>
    <td id='piston_#3'>#3</td>
    <td id='piston_#4'>#4</td>
    <td id='piston_#5'>Result</td>
    
  </tr>

  <tr id="piston_line3">
    <td>Vision System</td>
    <td id="piston_timestd1"></td>
    <td id="piston_timedev1"></td>
    <td id="piston_quality1data1"></td>
    <td id="piston_quality1data2"></td>
    <td id="piston_quality1data3"></td>
    <td id="piston_quality1data4"></td>

    <td id='piston_qualityresult1' ></td>
  </tr>

  <tr id="piston_line4">
    <td>Piston Rank</td>
    <td id="piston_timestd2"></td>
    <td id="piston_timedev2"></td>
    <td id="piston_quality2data1"></td>
    <td id="piston_quality2data2"></td>
    <td id="piston_quality2data3"></td>
    <td id="piston_quality2data4"></td>

    <td id='piston_qualityresult2' ></td>
  </tr>

  <tr id="piston_line5">
    <td>Pin Assembly</td>
    <td id="piston_timestd3"></td>
    <td id="piston_timedev3"></td>
    <td id="piston_quality3data1"></td>
    <td id="piston_quality3data2"></td>
    <td id="piston_quality3data3"></td>
    <td id="piston_quality3data4"></td>

    <td id='piston_qualityresult3' ></td>
  </tr>

  <tr id="piston_line6">
    <td>Snap Ring Inspection</td>
    <td id="piston_timestd4"></td>
    <td id="piston_timedev4"></td>
    <td id="piston_quality4data1"></td>
    <td id="piston_quality4data2"></td>
    <td id="piston_quality4data3"></td>
    <td id="piston_quality4data4"></td>

    <td id='piston_qualityresult4' ></td>
  </tr>

    <tr id="piston_line7">
    <td>Snap Ring Vision System</td>
    <td id="piston_timestd5"></td>
    <td id="piston_timedev5"></td>
    <td id="piston_quality5data1"></td>
    <td id="piston_quality5data2"></td>
    <td id="piston_quality5data3"></td>
    <td id="piston_quality5data4"></td>

    <td id='piston_qualityresult5' ></td>
  </tr>

    <tr id="piston_line8">
    <td>Ring Assembly</td>
    <td id="piston_timestd6"></td>
    <td id="piston_timedev6"></td>
    <td id="piston_quality6data1"></td>
    <td id="piston_quality6data2"></td>
    <td id="piston_quality6data3"></td>
    <td id="piston_quality6data4"></td>

    <td id='piston_qualityresult6' ></td>
  </tr>

    {/* <tr id="piston_line9">
    <td>Ring Vision System</td>
    <td id="piston_timestd7"></td>
    <td id="piston_timedev7"></td>
    <td id="piston_quality7data1"></td>
    <td id="piston_quality7data2"></td>
    <td id="piston_quality7data3"></td>
    <td id="piston_quality7data4"></td>

    <td id='piston_qualityresult7' ></td>
  </tr> */}

    <tr id="piston_line9">
    <td>Bearing Assembly</td>
    <td id="piston_timestd7"></td>
    <td id="piston_timedev7"></td>
    <td id="piston_quality7data1"></td>
    <td id="piston_quality7data2"></td>
    <td id="piston_quality7data3"></td>
    <td id="piston_quality7data4"></td>

    <td id='piston_qualityresult7' ></td>
  </tr>


</tbody>

        </table>
      </div>
 {/* <div id='piston_btns'>
        <button type='submit' id='piston_btn1'>TO KICK IN/OUT</button>
        <button type='submit' id='piston_btn3'>BACK TO MAIN</button>
        <button type='submit' id='piston_btn4'>GO TO LIVE</button>
      </div> */}
      <div id='piston_row7'>
  <table id='piston_result'>
    <tbody>
      <tr><td id='piston_result1'>Overall Judgement</td></tr>
      <tr><td id='piston_result2'><img src={okay} alt="okay" height="150" width="150"  id='piston_result-img'/></td></tr>
      {/* <tr><td
  id='piston_result3'
  style={{ cursor: "pointer", fontWeight: "bold"}}>Communication ok</td></tr> */}
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