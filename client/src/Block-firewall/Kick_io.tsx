/* eslint-disable react-hooks/exhaustive-deps */
import '../Block-firewall/Kick_io.css';

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
import CalendarBox from '../Block-firewall/CalendarBox';
import Golive from '../Block-firewall/GOLIVE';
import Menu from '../Block-firewall/menu';

const App = () => {
const [showMenu, setShowMenu] = useState(false);
const [engines, setEngines] = useState<string[]>([]); 
const [suggestions, setSuggestions] = useState<string[]>([]);
const [showSuggestions, setShowSuggestions] = useState(false);
const [showSettings, setShowSettings] = useState(false);
const [searchTerm, setSearchTerm] = useState("");
const [selectedKickType, setSelectedKickType] = useState<"in" | "out" | "abnormal" | null>(null);
const [showLiveOverlay, setShowLiveOverlay] = useState(false);
const [block_selectedShift, setSelectedShift] = useState<number | null>(null);
const [block_selectedDate, setSelectedDate] = useState(() => {
const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  });
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
  
  const handleGearClick = () => {
    window.open("/blocklogin", "_blank");
    setShowSettings(true);
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

  setEngineNo(null);
  setSelectedIndex(null);

  setEngines([]);

  setPartEntryTime("");

  resetKickIOUI();
  resetStationHighlights();

  const aCycleEl = document.getElementById("block_kick_io_A-cycle");
  if (aCycleEl) {
    aCycleEl.style.backgroundColor = "";
    aCycleEl.style.color = "";
    aCycleEl.textContent = "-";
  }
};


  const handleLiveClick = () => {
  setShowLiveOverlay(true);
};
  
  const [shiftInCount, setShiftInCount] = useState<number | null>(null);
  const [shiftOutCount, setShiftOutCount] = useState<number | null>(null);
  useEffect(() => {
    if (block_selectedShift === null) return;
  
    const fetchShiftCounts = async () => {
      try {
        const res = await fetch('http://192.168.0.20:4001/api/block_shiftCounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: block_selectedDate,
            shift: block_selectedShift,
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
  }, [block_selectedDate, block_selectedShift]);
  
    const [kickInCount, setKickInCount] = useState<number | null>(null);
  const [kickOutCount, setKickOutCount] = useState<number | null>(null);
  
  useEffect(() => {
    if (block_selectedShift === null) return;
  
    const fetchKickIOCounts = async () => {
      try {
        const res = await fetch('http://192.168.0.20:4001/api/block_kickIOCounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: block_selectedDate,
            shift: block_selectedShift,
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
  }, [block_selectedDate, block_selectedShift]);
  
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
  
        const sPassElement = document.getElementById('block_kick_io_S-pass');
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
        const res = await fetch("http://192.168.0.20:4001/api/block_newAbnormalCycleCount", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shift: block_selectedShift,
            date: block_selectedDate,
          }),
        });
  
        const json = await res.json();
        setAbnormalCycleCount(json.abnormal_count || 0);
  
        const aCycleElement = document.getElementById("block_kick_io_A-cycle");
        if (aCycleElement) {
          aCycleElement.textContent = json.abnormal_count?.toString() ?? "0";
        }
      } catch (error) {
        console.error("❌ Error fetching abnormal cycle data:", error);
      }
    };
  
    if (block_selectedShift && block_selectedDate) {
      fetchAbnormalCycleData();
      const interval = setInterval(fetchAbnormalCycleData, 1000);
      return () => clearInterval(interval);
    }
  }, [block_selectedShift, block_selectedDate]);

const handleBlockKickInClick = async () => {
  if (!block_selectedDate || !block_selectedShift) return;

  setSelectedKickType("in");
  setShowSuggestions(false);

  resetKickIOUI();

  try {
    const res = await fetch('http://192.168.0.20:4001/api/block_kickInEngines', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shift: block_selectedShift, date: block_selectedDate })
    });

    const json = await res.json();
    setEngines(json.engines || []); 

  } catch(err) {
    console.error(err);
  }
};

const handleBlockKickOutClick = async () => {
  if (!block_selectedDate || !block_selectedShift) return;

  setSelectedKickType("out");
  setShowSuggestions(false);

  resetKickIOUI();

  try {
    const res = await fetch('http://192.168.0.20:4001/api/block_kickoutEngines', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shift: block_selectedShift, date: block_selectedDate })
    });

    const json = await res.json();
    setEngines(json.engines || []); 

  } catch(err) {
    console.error(err);
  }
};

const handleBlockAbnormalClick = async () => {
  if (!block_selectedDate || !block_selectedShift) return;

  setSelectedKickType("abnormal");

  resetKickIOUI();

  try {
    const res = await fetch(
      "http://192.168.0.20:4001/api/block_abnormalcycleEngines",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shift: block_selectedShift,
          date: block_selectedDate,
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
  setEngineNo(null);
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
    "block_kick_io_arrow2data",
    "block_kick_io_arrow3data",
    "block_kick_io_arrow4data",
    "block_kick_io_arrow7data",
    "block_kick_io_arrow8data",
    "block_kick_io_arrow9data",
    "block_kick_io_arrow10data",
  ];
  arrowIds.forEach(id => {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (el) el.value = "";
  });

  const tptEl = document.getElementById("block_kick_io_tpt-data") as HTMLInputElement | null;
  if (tptEl) tptEl.value = "";

  for (let row = 1; row <= 11; row++) {
    for (let col = 1; col <= 5; col++) {
      const cellId = `block_kick_io_quality${row}data${col}`;
      const el = document.getElementById(cellId);
      if (el) {
        el.textContent = "";
        el.style.backgroundColor = "";
      }
    }

    const mainId = `block_kick_io_qualityresult${row}`;
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
  1: "block_kick_io_machine1-1",
  2: "block_kick_io_machine1-2",
  3: "block_kick_io_machine1-3",
  4: "block_kick_io_machine1-4",
  5: "block_kick_io_machine1-5",
  6: "block_kick_io_machine1-6",
  7: "block_kick_io_machine1-7",
  8: "block_kick_io_machine1-8",
  9: "block_kick_io_machine1-9",
  10: "block_kick_io_machine2-1",
  11: "block_kick_io_machine2-2",
  12: "block_kick_io_machine2-3",
};

const stationBlocks: Record<number, number[]> = {
  1: [1],
  2: [2],
  3: [3],
  4: [4],
  5: [5, 6],
  6: [7, 8],
  7: [9],
  8: [10],
  9: [11],
  10: [12],
};

const highlightStations = (
  kickInStn: number | string | null,
  kickOutStn: number | string | null
) => {
  const inStn = kickInStn ? Number(kickInStn) : null;
  const outStn = kickOutStn ? Number(kickOutStn) : null;

  const applyFlash = (stn: number, flashClass: string) => {
    const stationsToHighlight = stationBlocks[stn] || [];

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
  1: "block_kick_io_boxrow1_1",
  2: "block_kick_io_boxrow1_2",
  3: "block_kick_io_boxrow1_3",
  4: "block_kick_io_boxrow1_4",
  5: "block_kick_io_boxrow1_5",
  6: "block_kick_io_boxrow1_6",
  7: "block_kick_io_boxrow1_7",
  8: "block_kick_io_boxrow2_1",
  9: "block_kick_io_boxrow2_2",
  10:"block_kick_io_boxrow2_3",
};

const displayEngineInBoxes = (engineNo: string, kickInStn: number | null, kickOutStn: number | null) => {
  Object.values(stationToBoxId).forEach(id => {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (el) el.value = "";
  });

  if (kickInStn && kickInStn > 0) {
    const el = document.getElementById(stationToBoxId[kickInStn]) as HTMLInputElement | null;
    if (el) el.value = engineNo;
  }

  if (kickOutStn && kickOutStn > 0) {
    const el = document.getElementById(stationToBoxId[kickOutStn]) as HTMLInputElement | null;
    if (el) el.value = engineNo;
  }
};

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

  setVal("block_kick_io_arrow2data", diffSeconds(pm.TIZZ322_ENGINE_LABEL, pm.TIZZ320_ENGRAVING));
  setVal("block_kick_io_arrow3data", diffSeconds(pm.TIZZ325_ID_WRITING, pm.TIZZ322_ENGINE_LABEL));
  setVal("block_kick_io_arrow6data", diffSeconds(pm.TIZZ323_LOWER_BEARING, pm.TIZZ325_ID_WRITING));
  setVal("block_kick_io_arrow7data", diffSeconds(pm.TIZZ352_CHUTTER, pm.TIZZ323_LOWER_BEARING));
  setVal("block_kick_io_arrow8data", diffSeconds(pm.TIAS307_CRANK_NR, pm.TIZZ352_CHUTTER));
  setVal("block_kick_io_arrow9data", diffSeconds(pm.TIZZ353_BLOCK_PISTON_COLLATION, pm.TIAS307_CRANK_NR));
  setVal("block_kick_io_arrow10data", diffSeconds(pm.TIAS308_CONROD_NR, pm.TIZZ353_BLOCK_PISTON_COLLATION));
  setVal("block_kick_io_arrow11data", diffSeconds(pm.TIAS309_COLLATION, pm.TIAS308_CONROD_NR));
  setVal("block_kick_io_arrow12data", diffSeconds(pm.BLOCK_RESULT, pm.TIAS309_COLLATION));

};

const [engineNo,setEngineNo ] = useState<string | null>(null);

const computeEngineTPT = (pm: ProcessMinutes | null | undefined) => {
  if (!pm) return;

  const engravingTime = pm.TIZZ320_ENGRAVING;
  const blockResultTime = pm.BLOCK_RESULT;

  if (!engravingTime || !blockResultTime) return;

  const start = new Date(engravingTime).getTime();
  const end = new Date(blockResultTime).getTime();

  if (isNaN(start) || isNaN(end)) return;

  const diffSeconds = Math.floor((end - start) / 1000);
  if (diffSeconds < 0) return;

  const minutes = Math.floor(diffSeconds / 60);
  const seconds = diffSeconds % 60;

  const formatted = `${minutes}m ${seconds}s`;

  const tptEl = document.getElementById("block_kick_io_tpt-data") as HTMLInputElement | null;
  if (tptEl) tptEl.value = formatted;
};

useEffect(() => {
  if (!engineNo) return;

  const fetchKickStationsAndProcess = async () => {
    try {
      const res = await fetch(
        "http://192.168.0.20:4001/api/block_kick_stations",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ engine_no: engineNo }),
        }
      );

      const data = await res.json();

      computeEngineArrows(data.processMinutes);
      computeEngineTPT(data.processMinutes);  // ✅ correct

      highlightStations(data.KICK_IN_STN, data.KICK_OUT_STN);
      fillEngineBoxes(engineNo, data.KICK_IN_STN, data.KICK_OUT_STN);

    } catch (err) {
      console.error("❌ Error fetching kick stations:", err);
    }
  };

  fetchKickStationsAndProcess();
}, [engineNo]);

const fillEngineBoxes = (
  engineNo: string,
  kickIn: number | null,
  kickOut: number | null
) => {
  if (kickIn === null || kickOut === null) return;

  for (let i = kickIn; i <= kickOut; i++) {
    const el = document.getElementById(`block_kick_io_box_${i}`);
    if (el) el.textContent = engineNo;
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

const applyKickIOJudgements = (
  judgements: Record<string, (number | null)[]>
) => {
  for (let row = 1; row <= 11; row++) {

    const rowData = judgements[`row${row}`];
    if (!rowData) continue;

    const domRow = row;

    if (row === 4) {
      
      const judgement1 = rowData[0]; 
      const judgement3 = rowData[1];

      setQualityBg(`block_kick_io_quality4data1`, judgement3);
      setQualityBg(`block_kick_io_quality4data2`, judgement1);

      continue; 
    }

    if (row === 5) {
 
      const judgement1 = rowData[0]; 
      const judgement3 = rowData[2]; 

      setQualityBg(`block_kick_io_quality5data1`, judgement3); 
      setQualityBg(`block_kick_io_quality5data2`, judgement1);

      continue; 
    }


    for (let col = 1; col <= 5; col++) {
      const cellId = `block_kick_io_quality${domRow}data${col}`;
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
    el.style.color = "black";
  } else if (value === "NG") {
    el.style.backgroundColor = "red";
    el.style.color = "white";
  } else {
    el.style.backgroundColor = "";
  }
};

const applyMainJudgements = (mainJudgements: Record<string, string | null>) => {
  let allGreen = true;

  for (let row = 1; row <= 10; row++) {
    const tdId = `block_kick_io_qualityresult${row}`;
    const value = mainJudgements[`row${row}`] ?? null;

    setMainJudgementBg(tdId, value);

    const el = document.getElementById(tdId);
    if (el && el.style.backgroundColor !== "lightgreen") {
      allGreen = false;
    }
  }

  const resultImgEl = document.getElementById("block_kick_io_result_img") as HTMLImageElement | null;
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
      `http://192.168.0.20:4001/api/blockkickengine-details/${engineNo}`
    );
    const data: TableData = await res.json();

    for (const [tableKey, rowNo] of Object.entries(tableRowMap)) {
      const rowData = data[tableKey];
      if (!rowData) continue;


      writeCellValue(
        `block_kick_io_timedev${rowNo}`,
        rowData.TIME_DEVIATION
      );

   
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
            `block_kick_io_quality${rowNo}data${index + 1}`,
            `${value1} & ${value2}`
          );
        });
      } 
 
      else if (tableKey === "lower" || tableKey === "upper") {
        const data1 = rowData.JUDGEMENT_3 ?? "-"; 
        const data2 = rowData.JUDGEMENT_1 ?? "-"; 
        const label = tableKey === "lower" ? "Block -" : "Crank -";

        writeCellValue(`block_kick_io_quality${rowNo}data1`, data1);
        writeCellValue(`block_kick_io_quality${rowNo}data2`, `${label} ${data2}`);

  
        for (let i = 3; i <= 5; i++) {
          writeCellValue(`block_kick_io_quality${rowNo}data${i}`, "-");
        }
      } 

      else {
        for (let i = 1; i <= 5; i++) {
          const rawValue =
            rowData[`JUDGEMENT_${i}` as keyof typeof rowData];

          let displayValue: string;

          if (tableKey === "pistonCollation") {
            const numericValue = Number(rawValue);
            displayValue = numericValue === 1 ? "O" : numericValue === 0 ? "X" : "-";
          } else {
            displayValue = rawValue !== null && rawValue !== undefined
              ? String(rawValue)
              : "-";
          }

          writeCellValue(
            `block_kick_io_quality${rowNo}data${i}`,
            displayValue
          );
        }
      }
    }
  };

  fetchDetails();
  const interval = setInterval(fetchDetails, 1000);
  return () => clearInterval(interval);
}, [engineNo]);


useEffect(() => {
  const fetchPingData = async () => {
    try {
      const response = await fetch('http://192.168.0.20:4001/api/blockping');
      const json = await response.json();
      const values = json.data;

      const ids = [
        'block_kick_io_machine1-1','block_kick_io_machine1-2','block_kick_io_machine1-3','block_kick_io_machine1-4','block_kick_io_machine1-5','block_kick_io_machine1-6','block_kick_io_machine1-7','block_kick_io_machine1-8','block_kick_io_machine1-9',
        'block_kick_io_machine2-1','block_kick_io_machine2-2','block_kick_io_machine2-3','block_kick_io_crankcase'
      ];

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

const handleEngineClick = async (clickedEngineNo: string, index: number) => {
  if (!clickedEngineNo) return;
  setShowSuggestions(false);

  // console.log("Engine clicked: ", clickedEngineNo);
  resetKickIOUI();
  setSelectedIndex(index >= 0 ? index : null);
  setEngineNo(clickedEngineNo);

  try {
    const res = await fetch("http://192.168.0.20:4001/api/blockengine_number", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ engine_no: clickedEngineNo })
    });
    const json = await res.json();
    // console.log("Block Engine Number Data: ", json);

    const stdIds = Array.from({ length: 10 }, (_, i) => `block_kick_io_timestd${i+1}`);
    if (Array.isArray(json.stdDeviationTimes)) {
      stdIds.forEach((id, idx) => {
        const el = document.getElementById(id);
        if (!el) return;
        const value = json.stdDeviationTimes[idx];
        const newText = value != null ? value.toString() : "-";
        if (el.innerText !== newText) el.innerText = newText;
      });
    }

    setPartEntryTime(json.part_entry_time ? formatSQLDateTimeRaw(json.part_entry_time) : "");

  } catch {
    setPartEntryTime("");
  }

  try {
    const res2 = await fetch("http://192.168.0.20:4001/api/block_kick_stations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ engine_no: clickedEngineNo })
    });
    const json2 = await res2.json();
    // console.log("Kick Stations and Process Minutes Data: ", json2); 

    resetStationHighlights();
    highlightStations(json2.KICK_IN_STN, json2.KICK_OUT_STN);
    displayEngineInBoxes(clickedEngineNo, json2.KICK_IN_STN, json2.KICK_OUT_STN);

    computeEngineArrows(json2.processMinutes);
    computeEngineTPT(json2.processMinutes);

  } catch (err) {
    console.error("❌ Error fetching kick stations or process minutes:", err);
  }

  try {
    const res3 = await fetch(`http://192.168.0.20:4001/api/blockkickengine-number/${clickedEngineNo}`);
    const json3 = await res3.json();

    if (!json3?.judgements) {
      console.warn("⚠️ No judgements received", json3);
      return;
    }

    applyKickIOJudgements(json3.judgements);
    if (json3.mainJudgements) applyMainJudgements(json3.mainJudgements);

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

  <div id="block_kick_io_head1"   className={showSettings ? "blur" : ""}>
    <header>
      <img
  src={menu}
  alt="menu"
  width="80"
  height="100"
  id='block_kick_io_menu'
  onMouseEnter={() => setShowMenu(true)}
  onMouseLeave={() => setShowMenu(false)}
/>
      <h2 id='block_kick_io_topic'>BLOCK FIREWALL – KICK-IN/OUT DETAILS</h2>
      <img src={tiei1} alt="TIEI-1" width="50" height="60" id="block_kick_io_tiei1" />
      <img src={tiei2} alt="TIEI-2" width="300" height="70" id="block_kick_io_tiei2" />
      <img 
  src={live} 
  alt="live" 
  width="80" 
  height="80" 
  id='block_kick_io_live' 
  onClick={handleLiveClick} 
/>
  <div id='search' style={{ position: "relative", width: "200px" }}>
 <input
  id="head_searchbar"
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

    if (!selectedKickType) setSelectedKickType("in");

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


        <div id="block_kick_io_tiei3">
              <FontAwesomeIcon
      icon={faGear}
      size="2x"
      onClick={handleGearClick}
      style={{ marginTop: '20px', color: '0,112,192', cursor: "pointer" }}
    />
  </div>
    </header>

    <main id="block_kick_io_dashboard-table">
      <span id="block_kick_io_ss1">Shift Status</span>
      <table>
        <tbody>
          <tr id="block_kick_io_row1">
            <td rowSpan={2} id="block_kick_io_box1">IN</td>
            <td rowSpan={2} id="block_kick_io_shift-in">
             {shiftInCount !== null ? shiftInCount : '-'}
            </td>

            <td id="block_kick_io_box2">KICK OUT</td>
            <td id="block_kick_io_kick-out" onClick={handleBlockKickOutClick}
style={{
    cursor: "pointer",
    backgroundColor: selectedKickType === "out" ? "lightgreen" : "",
    color: selectedKickType === "out" ? "black" : ""
  }}>{kickOutCount ?? '—'}</td>

            <td rowSpan={2} id="block_kick_io_box3">OUT</td>
            <td rowSpan={2} id="block_kick_io_shift-out">
            {shiftOutCount !== null ? shiftOutCount : '-'}
            </td>

            <td rowSpan={2} id="block_kick_io_box4">Abnormal cycle</td>
<td
  rowSpan={2}
  id="block_kick_io_A-cycle"
  onClick={() => {
    handleBlockAbnormalClick();

    const el = document.getElementById("block_kick_io_A-cycle");
    if (el) el.style.backgroundColor = "lightgreen";
  }}
  style={{ cursor: "pointer" }}
>
  {abnormalCycleCount ?? 0}
</td>


            <td rowSpan={2} id="block_kick_io_box5">Straight-Pass</td>
            <td rowSpan={2} id="block_kick_io_S-pass">{straightPass !== null ? straightPass : '-'}</td>
          </tr>
          <tr id="block_kick_io_row1-sub">
            <td id="block_kick_io_box6">KICK IN</td>
            <td
  id="block_kick_io_kick-in"
  onClick={handleBlockKickInClick}
  style={{
    cursor: "pointer",
    backgroundColor: selectedKickType === "in" ? "lightgreen" : "",
    fontWeight: selectedKickType === "in" ? "bold" : "normal",
  }}
>
  {kickInCount ?? "—"}
</td>

          </tr>
        </tbody>
      </table>

 
    </main>

    <div id="block_kick_io_row2">
      <span style={{ marginLeft: "-84%",marginTop: "1%" ,color: "blue", fontStyle: "italic", fontSize: "35px", fontWeight: "bold"}} id='block_kick_io_layout'>Layout:</span>
      <div id='block_kick_io_top-box'>
        <label htmlFor="tpt-data" id="block_kick_io_tpt" style={{marginLeft: "2%", marginTop: "-80px"}}>Throughput time</label>
        <input
          type="text"
          id="block_kick_io_tpt-data"
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
      
    </div>

  <div id='block_kick_io_boxrow1'>
  <input type="text"  id="block_kick_io_boxrow1_7"  style={{width: "70px", marginLeft: "0%", height: "25px", color: "black"}} readOnly/>
  <input type="text"  id="block_kick_io_boxrow1_6"  style={{width: "70px", marginLeft: "0%", height: "25px", color: "black"}} readOnly/>
  <input type="text"  id="block_kick_io_boxrow1_5"  style={{width: "70px", marginLeft: "0%", height: "25px", color: "black"}} readOnly/>
  <input type="text"  id="block_kick_io_boxrow1_4"  style={{width: "70px", marginLeft: "0%", height: "25px", color: "black"}} readOnly/>
  <input type="text"  id="block_kick_io_boxrow1_3"  style={{width: "70px", marginLeft: "0%", height: "25px", color: "black"}} readOnly/>
  <input type="text"  id="block_kick_io_boxrow1_2"  style={{width: "70px", marginLeft: "0%", height: "25px", color: "black"}} readOnly/>
  <input type="text"  id="block_kick_io_boxrow1_1"  style={{width: "70px", marginLeft: "0%", height: "25px", color: "black"}} readOnly />
</div>
    
<div id='block_kick_io_data'>
  {/* <input 
  type="text" 
  id='block_kick_io_i-dt' 
  value={engineData?.dateTime || ''}
  readOnly 
/>  </section> */}
<section>
  <label id='block_kick_io_initial-dt'>Selected Part Initial Date-time</label>
 <input
    type="text"
    id="block_kick_io_i-dt"
    value={partEntryTime}
    readOnly
  />
</section>

<div className="block_kick_io_table-wrapper">
  <table>
    <thead>
      <tr>
        <th className='block_kick_io_sl-col1'>SL NO</th>
        <th className='block_kick_io_head-col1'>SERIAL NO</th>
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
          <td className="block_kick_io_sl-col2">{index + 1}</td>
          <td className="block_kick_io_head-col2">{eng}</td>
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
      {/* <div>
        <table>
          <tbody>
          <tr><td id="block_kick_io_machine1-9">Model Code Label</td></tr>
          <tr><td id="block_kick_io_B-7"><img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='block_kick_io_b1' /></td></tr>
          <tr><td id="block_kick_io_B-6"><img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='block_kick_io_b1' /></td></tr>
          </tbody>
        </table>
      </div> */}
      <table>
        <tbody>
          <tr id="block_kick_io_row3">
            <td id="block_kick_io_man-1">
              Pin Assy
              <img src={Man} alt="man" width="45" height="45" style={{ marginTop: "15px", marginLeft: "15px" }}  id='block_kick_io_man1' />
            </td>
             <td id="block_kick_io_machine1-9">
              Crank Cap Nut runner
               <img src={Machine} alt="machine" width="30" height="25" id='def-kick_io_machine1-9'  />
            </td>
            <td id="block_kick_io_man-2">
              Pre Tightening
              <img src={Man} alt="man" width="45" height="45" style={{ marginTop: "15px", marginLeft: "15px" }}  id='block_kick_io_man2' />
            </td>
            <td id="block_kick_io_man-3">
              Crank Cap assy.
              <img src={Man} alt="man" width="45" height="45" style={{ marginTop: "15px", marginLeft: "15px" }}  id='block_kick_io_man3' />
            </td>
             <td id="block_kick_io_machine1-8">
              Journal Oiling
               <img src={Machine} alt="machine" width="30" height="25" id='def-kick_io_machine1-8'  />
            </td>
             <td id="block_kick_io_machine1-7">
              Crank Shaft assy.
               <img src={Machine} alt="machine" width="30" height="25" id='def-kick_io_machine1-7'  />
            </td>
            <td id="block_kick_io_B-1">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='block_kick_io_b1' />
            </td>
             <td id="block_kick_io_machine1-6">
              Top Bearing assy.
               <img src={Machine} alt="machine" width="30" height="25" id='def-kick_io_machine1-6'  />
            </td>
            <td id="block_kick_io_B-2">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px"}} id='block_kick_io_b2' />
            </td>
            <td id="block_kick_io_machine1-5">
              Bottom Bearing assy.
               <img src={Machine} alt="machine" width="30" height="25" id='def-kick_io_machine1-5'  />
            </td>
            <td id="block_kick_io_man-4">
              Cam Cap bolt Loosen
              <img src={Man} alt="man" width="42" height="42" style={{ marginTop: "4px", marginLeft: "18px" }} id='block_kick_io_man4' />
            </td>
            <td id="block_kick_io_man-5">
              Oil Jet Assy
              <img src={Man} alt="man" width="42" height="42" style={{ marginTop: "4px", marginLeft: "18px" }}  id='block_kick_io_man5'/>
            </td>
            <td id="block_kick_io_machine1-4">
              Metal Rank
               <img src={Machine} alt="machine" width="30" height="25" id='def-kick_io_machine1-4'  />
            </td>
             <td id="block_kick_io_machine1-3">
              ID Writing
               <img src={Machine} alt="machine" width="30" height="25" id='def-kick_io_machine1-3'  />
            </td>
            <td id="block_kick_io_B-3">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }}  id='block_kick_io_b4'/>
            </td>
            <td id="block_kick_io_machine1-2">
              Engine No. Label
               <img src={Machine} alt="machine" width="30" height="25" id='def-kick_io_machine1-2'  />
            </td>
             <td id="block_kick_io_machine1-1">
              Engine No. Engraving
               <img src={Machine} alt="machine" width="30" height="25" id='def-kick_io_machine1-1'  />
            </td>

          </tr>
        </tbody>
      </table>

    </div>

  <div id='block_kick_io_boxrow2'>
  <input type="text"  id="block_kick_io_boxrow2_1"  style={{width: "70px", marginLeft: "0%", height: "25px", color: "black", marginBottom: "0px"}}  readOnly/>
  <input type="text"  id="block_kick_io_boxrow2_2"  style={{width: "70px", marginLeft: "0%", height: "25px", color: "black"}} readOnly/>
  <input type="text"  id="block_kick_io_boxrow2_3"  style={{width: "70px", marginLeft: "0%", height: "25px", color: "black"}} readOnly/>
</div>

    {/* <div id='block_kick_io_md'>
      <table >
        <tr >
          <td style={{border: "none", marginTop: "-20px"}}>
            <p style={{fontSize: "40px", lineHeight: "2", marginLeft: "60px",marginBottom:"0px"}}>↑</p>
            <span id='block_kick_io_dolly'
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

  

<div id='block_kick_io_logic'>
 <div id='block_kick_io_md'>
 <p style={{fontSize: "40px", lineHeight: "2", marginLeft: "60px",marginBottom:"0px", color: "rgba(102, 99, 99, 0.733)"}} id='block_kick_io_up'>↑</p>
  <span id='block_kick_io_dolly'
  style={{
    border: "1px solid rgba(167, 164, 164, 0.73)",
    padding:"15px",
    fontSize: "17px",
    fontWeight: "bold",
  }}>RGV</span>
 <p style={{fontSize: "40px", lineHeight: "2", marginLeft: "60px", marginTop:"-10px", color: "rgba(102, 99, 99, 0.733)"}}  id='block_kick_io_down'>↓</p>
</div>

<div className="block_kick_io_arrow-line">
    <span className="block_kick_io_arrow5">----------▷</span>
    <span className="block_kick_io_arrow4">◁---------------------------------------▷</span>
    <span className="block_kick_io_arrow3">◁----------------▷</span>
    <span className="block_kick_io_arrow3a">◁----------------▷</span>
    <span className="block_kick_io_arrow2">◁-----------------------------▷</span>
    <span className="block_kick_io_arrow1">◁------▷</span>
    <span className="block_kick_io_arrow1a">◁---------------▷</span>
    <span className="block_kick_io_arrow1b">◁-------▷</span>
   
</div>

<div className='block_kick_io_arrowlinedata1'>
  <input type="text" id='block_kick_io_arrow9data'  readOnly/>
  <input type="text" id='block_kick_io_arrow8data'  readOnly/>
  <input type="text" id='block_kick_io_arrow7data'  readOnly/>
  <input type="text" id='block_kick_io_arrow6data'  readOnly/>
  <input type="text" id="block_kick_io_arrow5data" readOnly />
  <input type="text" id='block_kick_io_arrow4data' readOnly/>
  <input type="text" id='block_kick_io_arrow3data' readOnly/>
  <input type="text" id='block_kick_io_arrow2data' readOnly/>
</div>

<div className='block_kick_io_arrowlinedata2'>
  <input type="text" id='block_kick_io_arrow10data' readOnly/>
  <input type="text" id='block_kick_io_arrow11data' readOnly/>
  <input type="text" id='block_kick_io_arrow12data' readOnly/>

</div>




<div id='block_kick_io_fd1'>
  <p style={{color:"red",marginLeft:"1020px",marginTop: "-210px"}} id='block_kick_io_flow-right'>Flow direction</p>
  <p
  id='block_kick_io_right-line'
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

<div className="block_kick_io_arrow-line2">
    <span className="block_kick_io_arrow6">---▷</span>
    <span className="block_kick_io_arrow7">◁-----------------------------------------------------▷</span>
    <span className="block_kick_io_arrow8">◁--------------▷</span>
    <span className="block_kick_io_arrow9">◁--------------------------------------------------------------------------▷</span>

</div>

<div id='block_kick_io_fd2'>
<p style={{marginTop: "-140px",marginLeft:"-110px",color:"red"}} id='block_kick_io_flow-left'>Flow direction</p>
<p
 id='block_kick_io_left-line'
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
          <tr id="block_kick_io_row4">
          
            <td id="block_kick_io_machine2-1">
             BS-PS Collation
                <img src={Machine} alt="machine" width="30" height="25" id='def-kick_io_machine2-1'  />
            </td>
            <td id="block_kick_io_B2-1">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='block_kick_io_b21'/>
            </td>
             <td id="block_kick_io_man2-1">
              <span style={{ marginTop: "5px" }}>Piston Assy</span>
              <img src={Man} alt="man" style={{ marginTop: "1px", marginLeft: "15px" }} id='block_kick_io_man21'/>
            </td>
            <td id="block_kick_io_man2-2">
              <span style={{ marginTop: "5px" }}>Con Rod Assy</span>
              <img src={Man} alt="man" style={{ marginTop: "1px", marginLeft: "15px" }} id='block_kick_io_man22'/>
            </td>
            <td id="block_kick_io_B2-2">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='block_kick_io_b22' />
            </td>
              <td id="block_kick_io_B2-3">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='block_kick_io_b22' />
            </td>
            <td id="block_kick_io_machine2-2">
              Conrod Nut-runner
               <img src={Machine} alt="machine" width="30" height="25" id='def-kick_io_machine2-2'  />
            </td>
              <td id="block_kick_io_B2-4">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='block_kick_io_b22' />
            </td>
          
            <td id="block_kick_io_machine2-3">
              Piston Collation
               <img src={Machine} alt="machine" width="30" height="25" id='def-kick_io_machine2-3'  />
            </td>

             <td id="block_kick_io_man2-3">
              <span style={{ marginTop: "5px" }}>Visual Check</span>
              <img src={Man} alt="man" style={{ marginTop: "1px", marginLeft: "15px" }} id='block_kick_io_man23'/>
            </td>
              <td id="block_kick_io_B2-5">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='block_kick_io_b22' />
            </td>
            <td id="block_kick_io_man2-4">
              <span style={{ marginTop: "5px" }}>PCV Assy</span>
              <img src={Man} alt="man" style={{ marginTop: "1px", marginLeft: "15px" }} id='block_kick_io_man24'/>
            </td>
             <td id="block_kick_io_B2-6">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='block_kick_io_b23'/>
            </td>

              <td id="block_kick_io_man2-5">
              <span style={{ marginTop: "5px" }}>Crank Case Tightening</span>
              <img src={Man} alt="man" style={{ marginTop: "1px", marginLeft: "15px" }} id='block_kick_io_man25'/>
            </td>
             <td id="block_kick_io_B2-7">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='block_kick_io_b23'/>
            </td>
              <td id="block_kick_io_man2-6">
                <span style={{ marginTop: "5px" }}>FIPG cleaning</span>
              <img src={Man} alt="man" style={{ marginTop: "1px", marginLeft: "15px" }} id='block_kick_io_man26'/>
            </td>
            <td id="block_kick_io_B2-8">
              <span style={{
                display:"flex",
               justifyContent: "center",
               alignItems: "center",
               marginTop: "10px",
               backgroundColor: "rgba(251,243,225)",
               padding: "4px",
               border: "2px solid orange",borderRadius:"5px"
              }} id='block_kick_io_b24'>C/B</span>
            </td>
            <td style={{
              height:"60px",
              marginTop: "60px",
              marginLeft: "-40px",
              borderRadius: "5px"
              }}  id='block_kick_io_downarrow'><img src={downarrow} alt="downarrow" width="34" height="66"  id='block_kick_io_downarrow-img'/></td>
            <td style={{
              marginLeft:"6px",borderRadius: "5px"
            }} id='block_kick_io_uparrow'><img src={uparrow} alt="uparrow" width="34" height="100"  id='block_kick_io_uparrow-img'/></td>
          </tr>
        </tbody>
      </table>
    <div id="block_kick_io_crankcase">CrankCase FIPG</div>
      <input type="text"  id="block_kick_io_boxrow2_4"  style={{width: "70px", marginLeft: "0%", height: "25px", color: "black"}} readOnly/>

    </div>

    {/* <table id="block_kick_io_row2-tbl">
          <tbody>
            <tr>
              <td style={{ backgroundColor: "rgba(204,255,255)" ,width: "30px"}}>
              </td>
              <td id="block_kick_io_def-img2">-Machines</td>
               <td style={{ backgroundColor: "rgba(251,243,225)" ,width: "30px"}}>
              </td>
              <td id="block_kick_io_def-img3">-Manual stations</td>
               <td style={{ backgroundColor: "rgba(180,229,162)" }}>
                <img src={B} alt="B" width="30" height="25"  id='block_kick_io_def-b' />
              </td>
               <td id="block_kick_io_def-img1">-Idle/Buffer stations</td>
            </tr>
          </tbody>
        </table> */}




    <div id="block_kick_io_lastrow">
      

      <div id="block_kick_io_row6" style={{ overflowX: "auto" }}>
        <table id="block_kick_io_row6-tbl">
          <tbody>

  <tr id="block_kick_io_line1">
    <td ></td>
    <td colSpan={2} id='block_kick_io_time-stamp'>Time Stamp</td>
    <td colSpan={6}>Quality</td>
  </tr>

  <tr id="block_kick_io_line2">
    <td id='block_kick_io_machine'>Machine</td>
    <td id='block_kick_io_std1'>STD</td>
    <td id='block_kick_io_dev'>DEV</td>
    <td id='block_kick_io_#1'>#1</td>
    <td id='block_kick_io_#2'>#2</td>
    <td id='block_kick_io_#3'>#3</td>
    <td id='block_kick_io_#4'>#4</td>
    <td id='block_kick_io_#5'>#5</td>
    <td id='block_kick_io_qualityresult' style={{color:"black"}}>Result</td>
  </tr>

 <tr id="block_kick_io_line3">
        <td  id='block_kick_io_machine1'>Engraving</td>

        <td id="block_kick_io_timestd1"></td>
        <td  id="block_kick_io_timedev1"></td>

        <td  id="block_kick_io_quality1data1"></td>
        <td  id="block_kick_io_quality1data2"></td>
        <td  id="block_kick_io_quality1data3"></td>
        <td  id="block_kick_io_quality1data4"></td>
        <td  id="block_kick_io_quality1data5"></td>
        <td  id="block_kick_io_qualityresult1"></td>
      </tr>

  <tr id="block_kick_io_line4">
        <td  id='block_kick_io_machine2'>Label Printer</td>

        <td id="block_kick_io_timestd2"></td>
        <td id="block_kick_io_timedev2"></td>

        <td id="block_kick_io_quality2data1"></td>
        <td id="block_kick_io_quality2data2"></td>
        <td id="block_kick_io_quality2data3"></td>
        <td id="block_kick_io_quality2data4"></td>
        <td  id="block_kick_io_quality2data5"></td>
        <td  id="block_kick_io_qualityresult2"></td>
      </tr>

  <tr id="block_kick_io_line5">
        <td id='block_kick_io_machine3'>ID Writing</td>
        <td id="block_kick_io_timestd3"></td>
        <td id="block_kick_io_timedev3"></td>

        <td id="block_kick_io_quality3data1"></td>
        <td id="block_kick_io_quality3data2"></td>
        <td id="block_kick_io_quality3data3"></td>
        <td id="block_kick_io_quality3data4"></td>
        <td  id="block_kick_io_quality3data5"></td>
        <td  id="block_kick_io_qualityresult3"></td>
      </tr>

      <tr id="block_kick_io_line6">
        <td id='block_kick_io_machine4'>Lower Metal Rank</td>
        <td id="block_kick_io_timestd4"></td>
        <td id="block_kick_io_timedev4"></td>

        <td id="block_kick_io_quality4data1"></td>
        <td id="block_kick_io_quality4data2"></td>
        <td id="block_kick_io_quality4data3"></td>
        <td id="block_kick_io_quality4data4"></td>
        <td  id="block_kick_io_quality4data5"></td>
        <td  id="block_kick_io_qualityresult4"></td>
      </tr>

      <tr id="block_kick_io_line7">
        <td id='block_kick_io_machine5'>Upper Metal Rank</td>
        <td id="block_kick_io_timestd5"></td>
        <td id="block_kick_io_timedev5"></td>

        <td id="block_kick_io_quality5data1"></td>
        <td id="block_kick_io_quality5data2"></td>
        <td id="block_kick_io_quality5data3"></td>
        <td id="block_kick_io_quality5data4"></td>
        <td  id="block_kick_io_quality5data5"></td>
        <td  id="block_kick_io_qualityresult5"></td>
      </tr>

      <tr id="block_kick_io_line8">
        <td id='block_kick_io_machine6'>Crankshaft</td>
        <td id="block_kick_io_timestd6"></td>
        <td id="block_kick_io_timedev6"></td>

        <td id="block_kick_io_quality6data1"></td>
        <td id="block_kick_io_quality6data2"></td>
        <td id="block_kick_io_quality6data3"></td>
        <td id="block_kick_io_quality6data4"></td>
        <td  id="block_kick_io_quality6data5"></td>
        <td  id="block_kick_io_qualityresult6"></td>
      </tr>

      <tr id="block_kick_io_line9">
        <td id='block_kick_io_machine7'>Crank Cap Nutrunner</td>
        <td id="block_kick_io_timestd7"></td>
        <td id="block_kick_io_timedev7"></td>
       
        <td id="block_kick_io_quality7data1"></td>
        <td id="block_kick_io_quality7data2"></td>
        <td id="block_kick_io_quality7data3"></td>
        <td id="block_kick_io_quality7data4"></td>
        <td  id="block_kick_io_quality7data5"></td>
        <td  id="block_kick_io_qualityresult7"></td>
      </tr>

      <tr id="block_kick_io_line10">
        <td id='block_kick_io_machine8'>BS-PS Collation</td>
        <td id="block_kick_io_timestd8"></td>
        <td id="block_kick_io_timedev8"></td>
     
        <td id="block_kick_io_quality8data1"></td>
        <td id="block_kick_io_quality8data2"></td>
        <td id="block_kick_io_quality8data3"></td>
        <td id="block_kick_io_quality8data4"></td>
        <td  id="block_kick_io_quality8data5"></td>
        <td  id="block_kick_io_qualityresult8"></td>
      </tr>

      <tr id="block_kick_io_line11">
        <td id='block_kick_io_machine9'>Conrod Nutrunner</td>
        <td id="block_kick_io_timestd9"></td>
        <td id="block_kick_io_timedev9">-</td>
       
        <td id="block_kick_io_quality9data1">-</td>
        <td id="block_kick_io_quality9data2">-</td>
        <td id="block_kick_io_quality9data3">-</td>
        <td id="block_kick_io_quality9data4">-</td>
        <td  id="block_kick_io_quality9data5"></td>
        <td  id="block_kick_io_qualityresult9"></td>
      </tr>

      <tr id="block_kick_io_line12">
        <td id='block_kick_io_machine10'>Piston Collation</td>
        <td id="block_kick_io_timestd10"></td>
        <td id="block_kick_io_timedev10">-</td>
        
        <td id="block_kick_io_quality10data1">-</td>
        <td id="block_kick_io_quality10data2">-</td>
        <td id="block_kick_io_quality10data3">-</td>
        <td id="block_kick_io_quality10data4">-</td>
        <td  id="block_kick_io_quality10data5"></td>
        <td  id="block_kick_io_qualityresult10"></td>
      </tr>

      <tr id="block_kick_io_line13">
        <td id='block_kick_io_machine11'>Crankcase FIPG</td>
        <td id="block_kick_io_timestd11"></td>
        <td id="block_kick_io_timedev11">-</td>
       
        <td id="block_kick_io_quality11data1">-</td>
        <td id="block_kick_io_quality11data2">-</td>
        <td id="block_kick_io_quality11data3">-</td>
        <td id="block_kick_io_quality11data4">-</td>
        <td  id="block_kick_io_quality11data5"></td>
        <td  id="block_kick_io_qualityresult11"></td>
      </tr>
</tbody>

        </table>
      </div>
 {/* <div id='block_kick_io_btns'>
        <button type='submit' id='block_kick_io_btn1'>TO KICK IN/OUT</button>
        <button type='submit' id='block_kick_io_btn3'>BACK TO MAIN</button>
        <button type='submit' id='block_kick_io_btn4'>GO TO LIVE</button>
      </div> */}
      <div id='block_kick_io_row7'>
  <table id='block_kick_io_result'>
    <tbody>
      <tr><td id='block_kick_io_result1'>Overall Judgement</td></tr>
      <tr><td id='block_kick_io_result2'><img src={okay} alt="okay" height="150" width="150"  id='block_kick_io_result_img'/></td></tr>
      <tr><td
  id='block_kick_io_result3'
  onClick={() => navigate("/block-firewall")}
  style={{ cursor: "pointer", fontWeight: "bold", color: "white"}}>TO MAIN PAGE</td></tr>
    </tbody>
  </table>
</div>
<div className='block_calendar'>
<div className='shifts'>
  <button
    className='block_shift1'
    onClick={() => setSelectedShift(1)}
    style={{
      backgroundColor: block_selectedShift === 1 ? 'green' : '',
      color: block_selectedShift === 1 ? 'white' : ''
    }}
  >
    1
  </button>

  <button
    className='block_shift2'
    onClick={() => setSelectedShift(2)}
    style={{
      backgroundColor: block_selectedShift === 2 ? 'green' : '',
      color: block_selectedShift === 2 ? 'white' : ''
    }}
  >
    2
  </button>

  <button
    className='block_shift3'
    onClick={() => setSelectedShift(3)}
    style={{
      backgroundColor: block_selectedShift === 3 ? 'green' : '',
      color: block_selectedShift === 3 ? 'white' : ''
    }}
  >
    3
  </button>
</div>

      <div id="block_kick_io_row5">
  <CalendarBox
    selectedDate={block_selectedDate}
    onDateChange={(date) => setSelectedDate(date)}
    selectedShift={block_selectedShift ?? 0}
  />

</div>
      <div><span className="block_clear-data" onClick={handleClearData}>Clear Data</span></div>
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