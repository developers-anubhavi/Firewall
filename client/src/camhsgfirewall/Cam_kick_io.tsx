import '../camhsgfirewall/cam_kick_io.css';

import {
  useEffect,
  useState,
} from 'react';

import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { faGear } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import B from '../assets/B.png';
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
import CalendarBox from '../camhsgfirewall/CalendarBox';
import Golive from '../camhsgfirewall/GOLIVE';
import Menu from '../Head-Traceability/menu';

const App = () => {

  const navigate = useNavigate();
   const location = useLocation();
const passedEngineNo = location.state?.engineNo;

useEffect(() => {
  if (passedEngineNo) {
    setSearchTerm(passedEngineNo);

    if (!selectedKickType) setSelectedKickType("in");

    handleEngineClick(passedEngineNo, -1);
  }
}, [passedEngineNo]);


const handleKickClick = () => {
  navigate("/cam-housing"); 
};

  const [isSpinning,] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showLiveOverlay, setShowLiveOverlay] = useState(false);
   const [showSettings, setShowSettings] = useState(false);
  const [cam_selectedShift, setSelectedShift] = useState<number | null>(null);
  const [cam_selectedDate, setSelectedDate] = useState(() => {
const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  });


  const handleGearClick = () => {
    window.open("/camlogin", "_blank");
    setShowSettings(true);
  };


  const handleLiveClick = () => {
  setShowLiveOverlay(true);
};



  const handleClearData = () => {
  setSelectedDate("");
  setSelectedShift(null);

  setShiftInCount(null);
  setShiftOutCount(null);
  setKickInCount(null);
  setKickOutCount(null);
  setSearchTerm("");

  setAbnormalCycleCount(null);
  setStraightPass('0%');

  setSelectedKickType(null);

  setSerialNo(null);
  setSelectedIndex(null);

  setEngines([]);

  setPartEntryTime("");

  resetKickIOUI();
  resetStationHighlights();

  const aCycleEl = document.getElementById("cam_kick_io_A-cycle");
  if (aCycleEl) {
    aCycleEl.style.backgroundColor = "";
    aCycleEl.style.color = "";
    aCycleEl.textContent = "-";
  }
};

const [selectedKickType, setSelectedKickType] = useState<"in" | "out" | "abnormal" | null>(null);
const [searchTerm, setSearchTerm] = useState("");
const [suggestions, setSuggestions] = useState<string[]>([]);
const [showSuggestions, setShowSuggestions] = useState(false);
const [engines, setEngines] = useState<string[]>([]); 
 
  const [shiftInCount, setShiftInCount] = useState<number | null>(null);
  const [shiftOutCount, setShiftOutCount] = useState<number | null>(null);

  useEffect(() => {
    if (cam_selectedShift === null) return;
  
    const fetchShiftCounts = async () => {
      try {
        const res = await fetch('http://192.168.0.20:4001/api/cam_shiftCounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: cam_selectedDate,
            shift: cam_selectedShift,
          }),
        });
  
        if (!res.ok) {
          console.error('Backend error:', res.status);
          setShiftInCount(0);
          setShiftOutCount(0);
          return;
        }
  
        const json = await res.json();
        setShiftInCount(typeof json.shift_in_count === 'number' ? json.shift_in_count : 0);
        setShiftOutCount(typeof json.shift_out_count === 'number' ? json.shift_out_count : 0);
  
      } catch (err) {
        console.error('Fetch failed:', err);
        setShiftInCount(0);
        setShiftOutCount(0);
      }
    };
  
    fetchShiftCounts();
  }, [cam_selectedDate, cam_selectedShift]);
  
    const [kickInCount, setKickInCount] = useState<number | null>(null);
  const [kickOutCount, setKickOutCount] = useState<number | null>(null);
  
  useEffect(() => {
    if (cam_selectedShift === null) return;
  
    const fetchKickIOCounts = async () => {
      try {
        const res = await fetch('http://192.168.0.20:4001/api/cam_kickIOCounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: cam_selectedDate,
            shift: cam_selectedShift,
          }),
        });
  
        if (!res.ok) {
          console.error('Backend error:', res.status);
          setKickInCount(0);
          setKickOutCount(0);
          return;
        }
  
        const json = await res.json();
        setKickInCount(typeof json.kick_in_count === 'number' ? json.kick_in_count : 0);
        setKickOutCount(typeof json.kick_out_count === 'number' ? json.kick_out_count : 0);
      } catch (err) {
        console.error('Fetch failed:', err);
        setKickInCount(0);
        setKickOutCount(0);
      }
    };
  
    fetchKickIOCounts();
  }, [cam_selectedDate, cam_selectedShift]);
  
  const [straightPass, setStraightPass] = useState<string>('0%');
  const [abnormalCycleCount, setAbnormalCycleCount] = useState<number | null>(null);
  
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
  
        const sPassElement = document.getElementById('cam_kick_io_S-pass');
        if (sPassElement) {
          sPassElement.textContent = formattedValue;
        }
      } else {
        setStraightPass('0%');
      }
    };
  
    calculateStraightPass();
    const interval = setInterval(calculateStraightPass, 100);
  
    return () => clearInterval(interval);
  }, [shiftInCount, abnormalCycleCount]);
  
  
  useEffect(() => {
    const fetchAbnormalCycleData = async () => {
      try {
        const res = await fetch("http://192.168.0.20:4001/api/cam_newAbnormalCycleCount", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shift: cam_selectedShift,
            date: cam_selectedDate,
          }),
        });
  
        const json = await res.json();
        setAbnormalCycleCount(json.abnormal_count || 0);
  
        const aCycleElement = document.getElementById("cam_kick_io_A-cycle");
        if (aCycleElement) {
          aCycleElement.textContent = json.abnormal_count?.toString() ?? "0";
        }
      } catch (error) {
        console.error("❌ Error fetching abnormal cycle data:", error);
      }
    };
  
    if (cam_selectedShift && cam_selectedDate) {
      fetchAbnormalCycleData();
      const interval = setInterval(fetchAbnormalCycleData, 1000);
      return () => clearInterval(interval);
    }
  }, [cam_selectedShift, cam_selectedDate]);

const handlecamKickInClick = async () => {
  if (!cam_selectedDate || !cam_selectedShift) return;

  setSelectedKickType("in");
  setShowSuggestions(false);

  resetKickIOUI();

  try {
    const res = await fetch('http://192.168.0.20:4001/api/cam_kickInEngines', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shift: cam_selectedShift, date: cam_selectedDate })
    });

    const json = await res.json();
    setEngines(json.engines || []); 

  } catch(err) {
    console.error(err);
  }
};

const handlecamKickOutClick = async () => {
  if (!cam_selectedDate || !cam_selectedShift) return;

  setSelectedKickType("out");
  setShowSuggestions(false);

  resetKickIOUI();

  try {
    const res = await fetch('http://192.168.0.20:4001/api/cam_kickoutEngines', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shift: cam_selectedShift, date: cam_selectedDate })
    });

    const json = await res.json();
    setEngines(json.engines || []); 

  } catch(err) {
    console.error(err);
  }
};

const handlecamAbnormalClick = async () => {
  if (!cam_selectedDate || !cam_selectedShift) return;

  setSelectedKickType("abnormal");

  resetKickIOUI();

  try {
    const res = await fetch(
      "http://192.168.0.20:4001/api/cam_abnormalcycleEngines",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shift: cam_selectedShift,
          date: cam_selectedDate,
        }),
      }
    );

    if (!res.ok) throw new Error("Failed to fetch abnormal engines");

    const json = await res.json();

    setEngines(Array.isArray(json.engines) ? json.engines : []);
    setAbnormalCycleCount(json.engines?.length || 0);

  } catch (err) {
    console.error("❌ Error fetching abnormal engines:", err);
    setEngines([]);
    setAbnormalCycleCount(0);
  }
};


const resetKickIOUI = () => {
  setSerialNo(null);
  setSelectedIndex(null);
  setPartEntryTime("");
  resetStationHighlights();

  Object.values(stationToElementId).forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.backgroundColor = "";
el.style.color = "";
delete el.dataset.stationColor;

    }
  });

  Object.values(stationToBoxId).forEach(id => {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (el) el.value = "";
  });

  const arrowIds = [
    "cam_arrow1data",
    "cam_arrow3data",
    "cam_arrow6data"
  ];
  arrowIds.forEach(id => {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (el) el.value = "";
  });

  const tptEl = document.getElementById("cam_kick_io_tpt-data") as HTMLInputElement | null;
  if (tptEl) tptEl.value = "";

  for (let row = 1; row <= 11; row++) {
    for (let col = 1; col <= 5; col++) {
      const cellId = `cam_kick_io_quality${row}data${col}`;
      const el = document.getElementById(cellId);
      if (el) {
        el.textContent = "";
        el.style.backgroundColor = "";
      }
    }

    const mainId = `cam_kick_io_qualityresult${row}`;
    const mainEl = document.getElementById(mainId);
    if (mainEl) {
      mainEl.textContent = "";
      mainEl.style.backgroundColor = "";
    }
  }
};

const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
const [partEntryTime, setPartEntryTime] = useState<string>('');

const formatSQLDateTimeRaw = (dateStr: string) => {
  if (!dateStr) return '';
  
  return dateStr.replace('T', ' ').replace('Z', '');
};

const stationToElementId: Record<number, string> = {
  1: "cam_kick_io_machine1-2",
  2: "cam_kick_io_machine1-3",
  3: "cam_kick_io_machine1-4",
  4: "cam_kick_io_machine1-5",
  5: "cam_kick_io_machine2-1",
};

const stationets: Record<number, number[]> = {
  1: [1],
  2: [2],
  3: [3],
  4: [4],
  5: [5],
};

const highlightStations = (
  kickInStn: number | string | null,
  kickOutStn: number | string | null
) => {
  const inStn = kickInStn ? Number(kickInStn) : null;
  const outStn = kickOutStn ? Number(kickOutStn) : null;

  const applyFlash = (stn: number, flashClass: string) => {
    const stationsToHighlight = stationets[stn] || [];

    stationsToHighlight.forEach(s => {
      const el = document.getElementById(stationToElementId[s]);
      if (!el) return;

      if (el.style.backgroundColor === "red") return;

      el.classList.remove("kick-in-flash", "kick-out-flash");

      el.classList.add(flashClass);
    });
  };

  if (inStn && inStn > 0) {
    applyFlash(inStn, "kick-in-flash");
  }

  if (outStn && outStn > 0) {
    applyFlash(outStn, "kick-out-flash");
  }
};

const resetStationHighlights = () => {
  Object.values(stationToElementId).forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;

    el.classList.remove("kick-in-flash", "kick-out-flash");
  });
};

const stationToBoxId: Record<number, string> = {
  1: "cam_kick_io_boxrow1_1",
  2: "cam_kick_io_boxrow1_2",
  3: "cam_kick_io_boxrow1_3",
  4: "cam_kick_io_boxrow1_4",
  5: "cam_kick_io_boxrow2_1",
};

const displayEngineInBoxes = (serialNo: string, kickInStn: number | null, kickOutStn: number | null) => {
  Object.values(stationToBoxId).forEach(id => {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (el) el.value = "";
  });

  if (kickInStn && kickInStn > 0) {
    const el = document.getElementById(stationToBoxId[kickInStn]) as HTMLInputElement | null;
    if (el) el.value = serialNo;
  }

  if (kickOutStn && kickOutStn > 0) {
    const el = document.getElementById(stationToBoxId[kickOutStn]) as HTMLInputElement | null;
    if (el) el.value = serialNo;
  }
};

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

  setVal("cam_kick_io_arrow1data", diffSeconds(pm.TIAS314_GREASE_APPLICATION, pm.TIZZ350_ID_WRITING));
  setVal("cam_kick_io_arrow3data", diffSeconds(pm.TIZZ366_PISTON_COLLATION, pm.TIAS314_GREASE_APPLICATION));
  setVal("cam_kick_io_arrow6data", diffSeconds(pm.TITM310_VVT_COIL, pm.TIZZ366_PISTON_COLLATION));

};

const [serialNo,setSerialNo ] = useState<string | null>(null);
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

  const tptEl = document.getElementById("cam_kick_io_tpt-data") as HTMLInputElement | null;
  if (tptEl) tptEl.value = formatted;
};

useEffect(() => {
  if (!serialNo) return;

  const fetchKickStationsAndProcess = async () => {
    try {
      const res = await fetch(
  "http://192.168.0.20:4001/api/cam_kick_stations",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ serial_no: serialNo }),
  }
);

      const data = await res.json();

      computeEngineArrows(data.processMinutes);
      computeEngineTPT(data.processMinutes);
      highlightStations(data.KICK_IN_STN, data.KICK_OUT_STN);
      fillEngineBoxes(serialNo, data.KICK_IN_STN, data.KICK_OUT_STN);

    } catch (err) {
      console.error("❌ Error fetching kick stations:", err);
    }
  };

  fetchKickStationsAndProcess();

// eslint-disable-next-line react-hooks/exhaustive-deps
}, [serialNo]);

const fillEngineBoxes = (
  serialNo: string,
  kickIn: number | null,
  kickOut: number | null
) => {
  if (kickIn === null || kickOut === null) return;

  for (let i = kickIn; i <= kickOut; i++) {
    const el = document.getElementById(`cam_kick_io_box_${i}`);
    if (el) el.textContent = serialNo;
  }
};

const setQualityBg = (id: string, value: number | null) => {
  const el = document.getElementById(id);
  if (!el) return;

  if (value === 1) {
    el.style.backgroundColor = "lightgreen";
    el.style.color = "black";
  } else if (value === 0) {
    el.style.backgroundColor = "red";
    el.style.color = "white";
  } else {
    el.style.backgroundColor = "";
  }
};

const applyKickIOJudgements = (judgements: Record<string, (number | null)[]>) => {
  for (let row = 2; row <= 11; row++) {

    const rowData = judgements[`row${row}`];
    if (!rowData) continue;

    const domRow = row;

    for (let col = 1; col <= 5; col++) {
      const cellId = `cam_kick_io_quality${domRow}data${col}`;
      const el = document.getElementById(cellId);

      if (!el) {
        console.warn("❌ Missing element:", cellId);
        continue;
      }

      setQualityBg(cellId, rowData[col - 1]);
    }
  }
};

const setMainJudgementBg = (id: string, value: string | null) => {
  const el = document.getElementById(id);
  if (!el) return;

  el.textContent = value ?? "";

  if (value === "OK") {
    el.style.backgroundColor = "lightgreen";
  } else if (value === "NG") {
    el.style.backgroundColor = "red";
    el.style.color = "white";
  } else {
    el.style.backgroundColor = "";
  }
};

const applyMainJudgements = (mainJudgements: Record<string, string | null>) => {
  let allGreen = true;

  for (let row = 2; row <= 11; row++) { 

    const value = mainJudgements[`row${row}`];
    if (!value) continue;  

    const tdId = `cam_kick_io_qualityresult${row}`;

    setMainJudgementBg(tdId, value);

    const el = document.getElementById(tdId);
    if (el && el.style.backgroundColor !== "lightgreen") {
      allGreen = false;
    }
  }

  const resultImgEl = document.getElementById("cam_kick_io_result_img") as HTMLImageElement | null;
  if (resultImgEl) {
    resultImgEl.src = allGreen ? okay : notokay;
    resultImgEl.alt = allGreen ? "OK" : "NOT OK";
  }
};

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
  if (!serialNo) return;

  const fetchDetails = async () => {
    const res = await fetch(
      `http://192.168.0.20:4001/api/camkickengine-details/${serialNo}`
    );
    const data: TableData = await res.json();

    for (const [tableKey, rowNo] of Object.entries(tableRowMap)) {

      const rowData = data[tableKey];
      if (!rowData) continue;

      writeCellValue(`cam_kick_io_timedev${rowNo}`, rowData.TIME_DEVIATION);

      for (let i = 1; i <= 5; i++) {
        writeCellValue(
          `cam_kick_io_quality${rowNo}data${i}`,
          rowData[`JUDGEMENT_${i}` as keyof typeof rowData]
        );
      }
    }
  };

  fetchDetails();
  const interval = setInterval(fetchDetails, 1000);
  return () => clearInterval(interval);
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [serialNo]);


useEffect(() => {
  const fetchPingData = async () => {
    try {
      const response = await fetch('http://192.168.0.20:4001/api/camping');
      const json = await response.json();
      const values = json.data;

      const ids = [
        'cam_kick_io_machine1-5','cam_kick_io_machine1-4','cam_kick_io_machine1-3','cam_kick_io_machine1-2',
        'cam_kick_io_machine2-1'];

  ids.forEach((id, index) => {
  const element = document.getElementById(id);
  if (!element) return;

  if (values[index] === '0') {
    element.style.backgroundColor = 'red';
    element.style.color = 'white';
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

const handleEngineClick = async (clickedSerialNo: string, index: number) => {
  if (!clickedSerialNo) return;

  resetKickIOUI();
  setShowSuggestions(false);

  setSelectedIndex(index >= 0 ? index : null);

  setSerialNo(clickedSerialNo);

  try {
    const res = await fetch("http://192.168.0.20:4001/api/camengine_number", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serial_no: clickedSerialNo })
    });
    const json = await res.json();

    const stdIds = [
      "cam_kick_io_timestd2",
      "cam_kick_io_timestd3"
    ];

    if (Array.isArray(json.stdDeviationTimes)) {
      stdIds.forEach((id, index) => {
        const el = document.getElementById(id);
        if (!el) return;

        const value = json.stdDeviationTimes[index];
        const newText = value !== null && value !== undefined ? value.toString() : "-";

        if (el.innerText !== newText) el.innerText = newText;
      });
    }
    setPartEntryTime(json.part_entry_time ? formatSQLDateTimeRaw(json.part_entry_time) : "");
  } catch {
    setPartEntryTime("");
  }

  try {
    const res2 = await fetch("http://192.168.0.20:4001/api/cam_kick_stations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serial_no: clickedSerialNo })
    });
    const json2 = await res2.json();

    const kickIn = json2?.KICK_IN_STN ?? null;
    const kickOut = json2?.KICK_OUT_STN ?? null;
    resetStationHighlights();

    highlightStations(kickIn, kickOut);
    displayEngineInBoxes(clickedSerialNo, kickIn, kickOut);
  } catch (err) {
    console.error(err);
  }

  try {
    const res3 = await fetch(
      `http://192.168.0.20:4001/api/camkickengine-number/${clickedSerialNo}`
    );
    const json3 = await res3.json();

    if (!json3 || !json3.judgements) {
      console.warn("⚠️ No judgements received", json3);
      return;
    }

    applyKickIOJudgements(json3.judgements);

    if (json3.mainJudgements) {
      applyMainJudgements(json3.mainJudgements);
    }
  } catch (err) {
    console.error("❌ Error fetching kick IO quality:", err);
  }
};


useEffect(() => {
  fetch("http://192.168.0.20:4001/api/all_engines")
    .then(res => res.json())
    .then(data => setEngines(data))
    .catch(err => console.error("Error fetching engines:", err));
}, []);



  return (
    <>

  <div id="cam_kick_io_head1"   className={showSettings ? "blur" : ""}>
    <header>
     <img
  src={menu}
  alt="menu"
  width="80"
  height="100"
  id='cam_kick_io_menu'
  onMouseEnter={() => setShowMenu(true)}
  onMouseLeave={() => setShowMenu(false)}
/>
    <h2>Cam-HSG FIREWALL – KICK-IN/OUT DETAILS</h2>
    <img src={tiei1} alt="TIEI-1" width="50" height="60" id="cam_kick_io_tiei1" />
    <img src={tiei2} alt="TIEI-2" width="280" height="70" id="cam_kick_io_tiei2" />
    <img 
      src={live} 
      alt="live" 
      width="80" 
      height="60" 
      id='cam_kick_io_live'
      onClick={handleLiveClick} 
    />
  
<div id='search' style={{ position: "relative", width: "200px" }}>
 <input
  id="cam_searchbar"
  type="text"
  placeholder="Search"
  value={searchTerm}
  onChange={(e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim()) {
      const filtered = engines.filter(eng =>
        eng.toLowerCase().startsWith(value.toLowerCase())
      );

      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }}
  style={{ padding: "5px", width: "100%" }}
/>



  {showSuggestions && suggestions.length > 0 && (
    <ul className="suggestion-box"
      style={{
        position: "absolute",
        top: "35px",
        left: 0,
        right: 0,
        background: "white",
        border: "1px solid #ccc",
        listStyle: "none",
        padding: 0,
        margin: 0,
        maxHeight: "140px",
        overflowY: "auto",
        zIndex: 1000
      }}
    >
      {suggestions.map((eng, index) => (
        <li
          key={index}
          style={{
            padding: "8px",
            cursor: "pointer"
          }}
          onClick={() => {
            setSearchTerm(eng);
            setShowSuggestions(false);
            handleEngineClick(eng, -1);
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#f0f0f0")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "white")
          }
        >
          {eng}
        </li>
      ))}
    </ul>
  )}
</div>


    <div id="cam_kick_io_tiei3">
    <FontAwesomeIcon
      icon={faGear}
      size="2x"
      spin={isSpinning}   
      onClick={handleGearClick} 
      style={{ marginTop: '20px', color: '0,112,192' }} id='cam_kick_io_settings'
    />
    </div>
    </header>

    <main id="cam_kick_io_dashboard-table">
      <span id="cam_kick_io_ss1">Shift Status</span>
      <table>
        <tbody>
          <tr id="cam_kick_io_row1">
            <td rowSpan={2} id="cam_kick_io_box1">IN</td>
            <td rowSpan={2} id="cam_kick_io_shift-in">{shiftInCount !== null ? shiftInCount : '-'}</td>

            <td id="cam_kick_io_box2">KICK OUT</td>
            <td id="cam_kick_io_kick-out" onClick={handlecamKickOutClick}
style={{
    cursor: "pointer",
    backgroundColor: selectedKickType === "out" ? "lightgreen" : "",
    color: selectedKickType === "out" ? "black" : ""
  }}>{kickOutCount ?? '—'}</td>


            <td rowSpan={2} id="cam_kick_io_box3">OUT</td>
            <td rowSpan={2} id="cam_kick_io_shift-out">{shiftOutCount !== null ? shiftOutCount : '-'}</td>

            <td rowSpan={2} id="cam_kick_io_box4">Abnormal cycle</td>
            <td rowSpan={2} id="cam_kick_io_A-cycle" onClick={() => {
    handlecamAbnormalClick();

    const el = document.getElementById("cam_kick_io_A-cycle");
    if (el) el.style.backgroundColor = "lightgreen";
  }}
  style={{ cursor: "pointer" }}>
  {abnormalCycleCount ?? 0}</td>

            <td rowSpan={2} id="cam_kick_io_box5">Straight-Pass</td>
            <td rowSpan={2} id="cam_kick_io_S-pass">{straightPass !== null ? straightPass : '-'}</td>
          </tr>
           <tr id="cam_kick_io_row1-sub">
            <td id="cam_kick_io_box6">KICK IN</td>
           <td id="cam_kick_io_kick-in"  onClick={handlecamKickInClick}
  style={{
    cursor: "pointer",
    backgroundColor: selectedKickType === "in" ? "lightgreen" : "",
    fontWeight: selectedKickType === "in" ? "bold" : "normal",
  }}
>
  {kickInCount ?? "—"}</td>

          </tr>
        </tbody>
      </table>
    </main>

    <div id="cam_kick_io_row2">
      <span style={{ marginLeft: "-84%",marginTop: "1%" ,color: "blue", fontStyle: "italic", fontSize: "35px", fontWeight: "bold"}} id='cam_kick_io_layout'>Layout:</span>
      <div id='cam_kick_io_top-box'>
        <label htmlFor="tpt-data" id="cam_kick_io_tpt" style={{marginLeft: "2%", marginTop: "-80px"}}>Throughput time</label>
        <input
          type="text"
          id="cam_kick_io_tpt-data"
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
    </div>

        <table id="cam_kick_io_row2-tbl">
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

      <div id='cam_kick_io_boxrow1'>
  <input type="text"  id="cam_kick_io_boxrow1_4"  style={{width: "70px", marginLeft: "-132%", height: "25px", color: "black"}} readOnly/>
  <input type="text"  id="cam_kick_io_boxrow1_3"  style={{width: "70px", marginLeft: "19%", height: "25px", color: "black"}}  readOnly/>
  <input type="text"  id="cam_kick_io_boxrow1_2"  style={{width: "70px", marginLeft: "95%", height: "25px", color: "black"}} readOnly/>
  <input type="text"  id="cam_kick_io_boxrow1_1"  style={{width: "70px", marginLeft: "1%", height: "25px", color: "black"}} readOnly />
</div>

    
<div id='cam_kick_io_data'>
  {/* <input 
  type="text" 
  id='cam_kick_io_i-dt' 
  value={engineData?.dateTime || ''} 
  readOnly 
/>  </section> */}
<section>
  <label id='cam_kick_io_initial-dt'>Selected Part Initial Date-time</label>
<input
    type="text"
    id="cam_kick_io_i-dt"
    value={partEntryTime}
    readOnly
  />
</section>

<div className="cam_kick_io_table-wrapper">
<table>
  <thead>
    <tr>
      <th className='cam_kick_io_sl-col1'>SL NO</th>
      <th className='cam_kick_io_head-col1'>HEAD SERIAL NO</th>
    </tr>
  </thead>
 <tbody>
  {engines.length > 0 ? (
    engines
      .filter((eng) => {
        return eng.toString().includes(searchTerm);
      })
      .map((eng, index) => (
        <tr
          key={index}
          className={selectedIndex === index ? "selected-row" : ""}
          onClick={() => handleEngineClick(eng, index)}
        >
          <td className="cam_kick_io_sl-col2">{index + 1}</td>
          <td className="cam_kick_io_head-col2">{eng}</td>
        </tr>
      ))
  ) : (
    <tr>
      <td colSpan={2}>No engines yet</td>
    </tr>
  )}
</tbody>

</table>


</div>
</div>


    <div>
      <table>
        <tbody>
          <tr id="cam_kick_io_row3">
            <td id="cam_kick_io_B-1">
              <img src={B} alt="B" width="40" height="40" style={{ marginLeft: "14px", marginTop: "8px" }} id='cam_kick_io_b1' />
            </td>
            <td id="cam_kick_io_machine1-5">
              Cam-cap tighten
              <img src={Machine} alt="machine" width="30" height="25" id='cam_kick_io_def-machine1-5'  />
            </td>
             <td id="cam_kick_io_man-2">
             Backup Cam-cap tighten
            </td>
            <td id="cam_kick_io_machine1-4">
             Grease Application
             <img src={Machine} alt="machine" width="30" height="25" id='cam_kick_io_def-machine1-4'  />
            </td>
             <td id="cam_kick_io_B-3">
              <img src={B} alt="B" width="40" height="40" style={{ marginLeft: "14px", marginTop: "8px" }}  id='cam_kick_io_b3'/>
            </td>
              <td id="cam_kick_io_machine1-3">
             Cam shaft assy
             <img src={Machine} alt="machine" width="30" height="25" id='cam_kick_io_def-machine1-3'  />
            </td>
          
            <td id="cam_kick_io_B-4">
              <img src={B} alt="B" width="40" height="40" style={{ marginLeft: "14px", marginTop: "8px" }}  id='cam_kick_io_b4'/>
            </td>
         
            <td id="cam_kick_io_machine1-2">
              ID Writing
            <img src={Machine} alt="machine" width="30" height="25" id='cam_kick_io_def-machine1-2'  />
            </td>
         
          </tr>
        </tbody>
      </table>
    </div>

    <div id='cam_kick_io_boxrow2'>
  <input type="text"  id="cam_kick_io_boxrow2_1" readOnly/>
</div>

    {/* <div id='cam_kick_io_md'>
      <table >
        <tr >
          <td style={{border: "none", marginTop: "-20px"}}>
            <p style={{fontSize: "40px", lineHeight: "2", marginLeft: "60px",marginBottom:"0px"}}>↑</p>
            <span id='cam_kick_io_dolly'
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



        <div className="cam_kick_io_arrow-line">
    <span className="cam_kick_io_arrow4">--------------▷</span>
    <span className="cam_kick_io_arrow3">◁----------------------▷</span>
    <span className="cam_kick_io_arrow2">◁--------------------▷</span>
    <span className="cam_kick_io_arrow1">◁---------------------▷</span>
</div>

<div className='cam_kick_io_arrowlinedata1'>
  <input type="text" id='cam_kick_io_arrow3data' readOnly/>
  <input type="text" id='cam_kick_io_arrow2data' readOnly/>
  <input type="text" id='cam_kick_io_arrow1data'  readOnly/>
</div>

<div className='cam_kick_io_arrowlinedata2'>
  <input type="text" id='cam_kick_io_arrow6data' readOnly/>
</div>


<div className="cam_kick_io_arrow-line2">
    <span className="cam_kick_io_arrow6">--------------------------------------------------------------▷</span>
</div>


<div id='cam_kick_io_logic'>
 <div id='cam_kick_io_md'>
 <p style={{fontSize: "40px", lineHeight: "2", marginLeft: "60px",marginBottom:"0px",color:"rgb(138, 135, 135)"}} id='cam_kick_io_up'>↑</p>
  <span id='cam_kick_io_dolly'
  style={{
     border: "1px solid rgb(138, 135, 135)",
    padding:"15px",
    fontSize: "17px",
    fontWeight: "bold",
  }}>Transfer</span>
 <p style={{fontSize: "40px", lineHeight: "2", marginLeft: "60px", marginTop:"-10px",color:"rgb(138, 135, 135)"}}  id='cam_kick_io_down'>↓</p>
</div>

<div id='cam_kick_io_fd1'>
  <p style={{color:"red",marginLeft:"1020px",marginTop: "-210px"}} id='cam_kick_io_flow-right'>Flow direction</p>
  <p
  id='cam_kick_io_right-line'
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

<div id='cam_kick_io_fd2'>
<p style={{marginTop: "-140px",marginLeft:"-110px",color:"red"}} id='cam_kick_io_flow-left'>Flow direction</p>
<p
 id='cam_kick_io_left-line'
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
          <tr id="cam_kick_io_row4">
             <td id="cam_kick_io_man2-4">
              <img src={Man} alt="man" width="36" height="36" style={{ marginTop: "1px", marginLeft: "35px" }} id='cam_kick_io_man24'/>
              <span style={{ marginTop: "10px" }}>D4 lifter guide</span>
            </td>
             <td id="cam_kick_io_B2-1">
              <img src={B} alt="B" width="40" height="40" style={{ marginLeft: "14px", marginTop: "10px" }} id='cam_kick_io_b21'/>
            </td>
                 <td id="cam_kick_io_man2-5">
              <img src={Man} alt="man" width="36" height="36" style={{ marginTop: "1px", marginLeft: "35px" }}id='cam_kick_io_man25' />
              <span style={{ marginTop: "10px" }}>VVT</span>
            </td>
             <td id="cam_kick_io_B2-2">
              <img src={B} alt="B" width="40" height="40" style={{ marginLeft: "14px", marginTop: "10px" }} id='cam_kick_io_b22' />
            </td>
            <td id="cam_kick_io_machine2-1">
             VVT Vision
             <img src={Machine} alt="machine" width="30" height="25" id='cam_kick_io_def-machine2-1'  />
            </td>
            
            <td id="cam_kick_io_B2-3">
              <img src={B} alt="B" width="40" height="40" style={{ marginLeft: "14px", marginTop: "10px" }} id='cam_kick_io_b23'/>
            </td>
         
            <td id="cam_kick_io_B2-4">
              <span style={{
                display:"flex",
               justifyContent: "center",
               alignItems: "center",
               marginTop: "10px",
               backgroundColor: "rgba(251,243,225)",
               padding: "6px",
               border: "2px solid orange"
              }} id='cam_kick_io_b24'>C/H</span>
            </td>
            <td style={{
              height:"50px",
              marginTop: "65px",
              marginLeft: "-55px"
              }}  id='cam_kick_io_downarrow'><img src={downarrow} alt="downarrow" width="45" height="55"  id='cam_kick_io_downarrow-img'/></td>
            <td style={{
              marginLeft:"9px"
            }} id='cam_kick_io_uparrow'><img src={uparrow} alt="uparrow" width="45" height="100"  id='cam_kick_io_uparrow-img'/></td>
          </tr>
        </tbody>
      </table>
    </div>
    {/* <table id="cam_kick_io_row2-tbl">
          <tbody>
            <tr>
              <td style={{ backgroundColor: "rgba(204,255,255)" ,width: "30px"}}>
              </td>
              <td id="cam_kick_io_def-img2">-Machines</td>
               <td style={{ backgroundColor: "rgba(251,243,225)" ,width: "30px"}}>
              </td>
              <td id="cam_kick_io_def-img3">-Manual stations</td>
               <td style={{ backgroundColor: "rgba(180,229,162)" }}>
                <img src={B} alt="B" width="30" height="25"  id='cam_kick_io_def-b' />
              </td>
               <td id="cam_kick_io_def-img1">-Idle/Buffer stations</td>
            </tr>
          </tbody>
        </table> */}


    <div id="cam_kick_io_lastrow">

      <div id="cam_kick_io_row6">
        <table id="cam_kick_io_row6-tbl">
          <tbody>
  <tr id="cam_kick_io_line1">
    <td style={{backgroundColor: "white", border: "none"}}></td>
    <td colSpan={2} id='cam_kick_io_time-stamp'>Time Stamp</td>
    <td colSpan={11}>Quality</td>
  </tr>

  <tr id="cam_kick_io_line2">
    <td id='cam_kick_io_machine'>Machine</td>
    <td id='cam_kick_io_std1'>STD</td>
    <td id='cam_kick_io_dev'>DEV</td> 
    <td id='cam_kick_io_qualitydata1'>#1</td>
    <td id='cam_kick_io_qualitydata2'>#2</td> 
    <td id='cam_kick_io_qualitydata3'>#3</td>
    <td id='cam_kick_io_qualitydata4'>#4</td>
    <td id='cam_kick_io_qualitydata5'>#5</td>
    <td id='cam_kick_io_qualityresult'>Result</td>
  </tr>

  <tr id="cam_kick_io_line3">
    <td>Cam shaft Vision</td>
    <td id="cam_kick_io_timestd1"></td>
    <td id="cam_kick_io_timedev1"></td>
    <td id="cam_kick_io_quality1data1"></td>
    <td id="cam_kick_io_quality1data2"></td>
    <td id="cam_kick_io_quality1data3"></td>
    <td id="cam_kick_io_quality1data4"></td>
    <td id="cam_kick_io_quality1data5"></td>
    <td id='cam_kick_io_qualityresult1'></td>
  </tr>

  <tr id="cam_kick_io_line4">
    <td>Grease Application</td>
    <td id="cam_kick_io_timestd2"></td>
    <td id="cam_kick_io_timedev2"></td>
    <td id="cam_kick_io_quality2data1"></td>
    <td id="cam_kick_io_quality2data2"></td>
    <td id="cam_kick_io_quality2data3"></td>
    <td id="cam_kick_io_quality2data4"></td>
    <td id="cam_kick_io_quality2data5"></td>
    <td id='cam_kick_io_qualityresult2'></td>
  </tr>

  <tr id="cam_kick_io_line5">
    <td>Cam-cap tightening</td>
    <td id="cam_kick_io_timestd3"></td>
    <td id="cam_kick_io_timedev3"></td>
    <td id="cam_kick_io_quality3data1"></td>
    <td id="cam_kick_io_quality3data2"></td>
    <td id="cam_kick_io_quality3data3"></td>
    <td id="cam_kick_io_quality3data4"></td>
    <td id="cam_kick_io_quality3data5"></td>
    <td id='cam_kick_io_qualityresult5'></td>
  </tr>

  <tr id="cam_kick_io_line6">
    <td>VVT vision</td>
    <td id="cam_kick_io_timestd4"></td>
    <td id="cam_kick_io_timedev4"></td>
    <td id="cam_kick_io_quality4data1"></td>
    <td id="cam_kick_io_quality4data2"></td>
    <td id="cam_kick_io_quality4data3"></td>
    <td id="cam_kick_io_quality4data4"></td>
    <td id="cam_kick_io_quality4data5"></td>
    <td id='cam_kick_io_qualityresult5'></td>
  </tr>


</tbody>

        </table>
      </div>
 {/* <div id='cam_kick_io_btns'>
        <button type='submit' id='cam_kick_io_btn1'>TO KICK IN/OUT</button>
        <button type='submit' id='cam_kick_io_btn3'>BACK TO MAIN</button>
        <button type='submit' id='cam_kick_io_btn4'>GO TO LIVE</button>
      </div> */}
      <div id='cam_kick_io_row7'>
  <table id='cam_kick_io_result'>
    <tbody>
      <tr><td id='cam_kick_io_result1'>Overall Judgement</td></tr>
      <tr><td id='cam_kick_io_result2'><img src={okay} alt="okay" height="150" width="150"  id='cam_kick_io_result-img'/></td></tr>
      <tr><td
  id='cam_kick_io_result3'
  onClick={handleKickClick}
  style={{ cursor: "pointer", fontWeight: "bold"}}>TO MAIN PAGE</td></tr>
    </tbody>
  </table>
</div>
<div className='cam_calendar'>
<div className='shifts'>
  <button
    className='cam_shift1'
    onClick={() => setSelectedShift(1)}
    style={{
      backgroundColor: cam_selectedShift === 1 ? 'green' : '',
      color: cam_selectedShift === 1 ? 'white' : ''
    }}
  >
    1
  </button>

  <button
    className='cam_shift2'
    onClick={() => setSelectedShift(2)}
    style={{
      backgroundColor: cam_selectedShift === 2 ? 'green' : '',
      color: cam_selectedShift === 2 ? 'white' : ''
    }}
  >
    2
  </button>

  <button
    className='cam_shift3'
    onClick={() => setSelectedShift(3)}
    style={{
      backgroundColor: cam_selectedShift === 3 ? 'green' : '',
      color: cam_selectedShift === 3 ? 'white' : ''
    }}
  >
    3
  </button>
</div>

      <div id="cam_kick_io_row5">
  <CalendarBox
    selectedDate={cam_selectedDate}
    onDateChange={(date) => setSelectedDate(date)}
    selectedShift={cam_selectedShift ?? 0}
  />

</div>
      <div><span className="cam_clear-data" onClick={handleClearData}>Clear Data</span></div>
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