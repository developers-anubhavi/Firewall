import '../Head-Traceability/Kick_io.css';

import {
  useEffect,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

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
import CalendarBox from '../Head-Traceability/CalendarBox';
import Golive from '../Head-Traceability/GOLIVE';
import Menu from '../Head-Traceability/menu';

function Kick_io() {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [kickInCount, setKickInCount] = useState<number | null>(null);
  const [kickOutCount, setKickOutCount] = useState<number | null>(null);
  const [abnormalCycleCount, setAbnormalCycleCount] = useState<number | null>(null);
  const [engines, setEngines] = useState<string[]>([]);
  const [, setSelectedEngine] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [engineData, setEngineData] = useState<EngineData | null>(null);
  const [selectedKickType, setSelectedKickType] = useState<"in" | "out" | "abnormal" | null>(null);
  const [selectedShift, setSelectedShift] = useState<number | null>(null);
  const [kickInIndex, setKickInIndex] = useState<number | null>(null);
  const [kickOutIndex, setKickOutIndex] = useState<number | null>(null);
  const [boxValues, setBoxValues] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState("");
const [suggestions, setSuggestions] = useState<string[]>([]);
const [showSuggestions, setShowSuggestions] = useState(false);
  

  const [selectedDate, setSelectedDate] = useState(() => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
});

  const [showLiveOverlay, setShowLiveOverlay] = useState(false);
  
  const handleLiveClick = () => {
  setShowLiveOverlay(true);
};

const handleClearData = () => {

  setSelectedDate("");
  setSelectedShift(null);

  setKickInCount(null);
  setKickOutCount(null);
  setShiftInCount(null);
  setShiftOutCount(null);
  setAbnormalCycleCount(null);
  setStraightPass("0%");

  setSelectedEngine(null);
  setEngineData(null);
  setEngines([]);
  setSearchTerm("");
  settimestdValues({});
  setSelectedIndex(null);
  setKickInIndex(null);
  setKickOutIndex(null);
  setBoxValues({});

  setSelectedKickType(null);

  boxIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.backgroundColor = "";
      el.style.color = "";
      if (el instanceof HTMLInputElement) el.value = "";
    }
  });

  for (let i = 1; i <= 8; i++) {
    const devCell = document.getElementById(`kick_io_timeDev${i}`);
    if (devCell) {
      devCell.style.backgroundColor = "";
      devCell.style.color = "";
    }
  }

  const aCycleElement = document.getElementById("kick_io_A-cycle");
  if (aCycleElement) aCycleElement.textContent = "0";

  const sPassElement = document.getElementById("S-pass");
  if (sPassElement) sPassElement.textContent = "0%";

  for (let i = 1; i <= 10; i++) {
    const arrowEl = document.getElementById(`kick_io_arrow${i}data`);
    if (arrowEl instanceof HTMLInputElement) {
      arrowEl.value = "";
    }
  }

  const tptEl = document.getElementById("kick_io_tpt-data");
  if (tptEl instanceof HTMLInputElement) tptEl.value = "";


  console.log("✔ All values and UI reset successful");
};



const handleGearClick = () => {
    window.open("/Login", "_blank");
    setShowSettings(true);
  };

const cellStyle = (value: string | number | null | undefined) => ({
  backgroundColor: value && value !== "-" ? "lightgreen" : "white",
});


const boxIds: string[] = [
  'kick_io_machine1-1','kick_io_machine1-2','kick_io_machine1-3','kick_io_machine1-4','kick_io_machine1-5',
  'kick_io_machine2-1','kick_io_machine2-2','kick_io_machine2-3','kick_io_machine2-4','kick_io_machine2-5'
];

useEffect(() => {
  let isMounted = true;

  const fetchPingData = async () => {
    try {
      const res = await fetch('http://192.168.0.20:4001/api/ping');
      const json = await res.json();
      const values = json.data;

      if (!isMounted) return;

      boxIds.forEach((id, index) => {
        const el = document.getElementById(id);
        if (!el) return;
       
        if (index === kickInIndex || index === kickOutIndex) return;

        if (values[index] === '0') {
          el.style.backgroundColor = "red";
          el.style.color = "white";
        } else {
          el.style.backgroundColor = "";
          el.style.color = "";
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  fetchPingData();
  const interval = setInterval(fetchPingData, 100);

  return () => {
    isMounted = false;
    clearInterval(interval);
  };
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [kickInIndex, kickOutIndex]); 

const [shiftInCount, setShiftInCount] = useState<number | null>(null);
const [shiftOutCount, setShiftOutCount] = useState<number | null>(null);
useEffect(() => {
  if (selectedShift === null) return;

  const fetchShiftCounts = async () => {
    try {
      const res = await fetch('http://192.168.0.20:4001/api/shiftCounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          shift: selectedShift,
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
}, [selectedDate, selectedShift]);


useEffect(() => {
  if (selectedShift === null) return;

  const fetchKickIOCounts = async () => {
    try {
      const res = await fetch('http://192.168.0.20:4001/api/kickIOCounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          shift: selectedShift,
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
}, [selectedDate, selectedShift]);

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
  const interval = setInterval(calculateStraightPass, 100);

  return () => clearInterval(interval);
}, [shiftInCount, abnormalCycleCount]);


useEffect(() => {
  const fetchAbnormalCycleData = async () => {
    try {
      const res = await fetch("http://192.168.0.20:4001/api/newAbnormalCycleCount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shift: selectedShift,
          date: selectedDate,
        }),
      });

      const json = await res.json();
      setAbnormalCycleCount(json.abnormal_count || 0);

      const aCycleElement = document.getElementById("kick_io_A-cycle");
      if (aCycleElement) {
        aCycleElement.textContent = json.abnormal_count?.toString() ?? "0";
      }
    } catch (error) {
      console.error("❌ Error fetching abnormal cycle data:", error);
    }
  };

  if (selectedShift && selectedDate) {
    fetchAbnormalCycleData();
    const interval = setInterval(fetchAbnormalCycleData, 1000);
    return () => clearInterval(interval);
  }
}, [selectedShift, selectedDate]);

const handleAbnormalCycleData = async () => {
  setSelectedKickType("abnormal");
  // setSuggestions([]);

  try {
    const res = await fetch('http://192.168.0.20:4001/api/abnormalcycleEngines', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shift: selectedShift, date: selectedDate })
    });

    const json = await res.json();
    setEngines(json.engines || []);
  } catch(err) {
    console.error(err);
  }
};

const handleKickInClick = async () => {
  setSelectedKickType("in");
  // setShowEngineTable(true); 
  // setSuggestions([]);
  setShowSuggestions(false);

  if (kickOutIndex !== null) {
    const prevEl = document.getElementById(boxIds[kickOutIndex]);
    if (prevEl) {
      prevEl.style.backgroundColor = "";
      prevEl.style.color = "";
    }
    setKickOutIndex(null);
  }

  try {
    const res = await fetch("http://192.168.0.20:4001/api/kickInEngines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shift: selectedShift, date: selectedDate })
    });

    const json = await res.json();
    setEngines(json.engines || []);

    const kickInStn = json.engines[0]?.KICK_IN_STN;
    if (!kickInStn) return;

    const ki = Number(kickInStn) - 1;
    if (ki < 0 || ki >= boxIds.length) return;

    if (kickInIndex !== null && kickInIndex !== ki) {
      const prevEl = document.getElementById(boxIds[kickInIndex]);
      if (prevEl) prevEl.style.backgroundColor = "";
    }

    const el = document.getElementById(boxIds[ki]);
    if (el) {
      el.style.backgroundColor = "lightgreen";
      el.style.color = "black";
      setKickInIndex(ki);
    }

  } catch (err) {
    console.error(err);
  }
};

const handleKickOutClick = async () => {
  setSelectedKickType("out");
  // setShowEngineTable(true); 
  // setSuggestions([]);
  setShowSuggestions(false);

  if (kickInIndex !== null) {
    const prevEl = document.getElementById(boxIds[kickInIndex]);
    if (prevEl) {
      prevEl.style.backgroundColor = "";
      prevEl.style.color = "";
    }
    setKickInIndex(null);
  }

  try {
    const res = await fetch('http://192.168.0.20:4001/api/kickoutEngines', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shift: selectedShift, date: selectedDate })
    });

    const json = await res.json();
    setEngines(json.engines || []);

    const kickOutStn = json.engines[0]?.KICK_OUT_STN;
    if (!kickOutStn) return;

    const ko = Number(kickOutStn) - 1;
    if (ko < 0 || ko >= boxIds.length) return;

    if (kickOutIndex !== null && kickOutIndex !== ko) {
      const prevEl = document.getElementById(boxIds[kickOutIndex]);
      if (prevEl) prevEl.style.backgroundColor = "";
    }

    const el = document.getElementById(boxIds[ko]);
    if (el) {
      el.style.backgroundColor = "lightskyblue";
      el.style.color = "black";
      setKickOutIndex(ko);
    }

  } catch(err) {
    console.error(err);
  }
};

//  useEffect(() => {
//     if (!searchTerm) {
//       setSuggestions([]);
//       setShowSuggestions(false);
//       return;
//     }

//     const filtered = engines.filter((eng) =>
//       eng.toLowerCase().startsWith(searchTerm.toLowerCase())
//     );

//     setSuggestions(filtered);
//     setShowSuggestions(filtered.length > 0);
//   }, [searchTerm, engines]);

const handleEngineClick = async (engineNo: string, index: number) => {

  setShowSuggestions(false);
  
  setSelectedEngine(engineNo);
   setSelectedIndex(index >= 0 ? index : null);

  try {
    const res = await fetch(
      `http://192.168.0.20:4001/api/engine-number2?engineNo=${engineNo}`
    );
    const data = await res.json();
    if (data.error) return;

      setEngineData({
      ...data,
      qualityData4Gray: data.engineCode === "012"
    });
    

const newTimestdValues: { [key: string]: string } = {};
for (let i = 1; i <= 9; i++) {
  newTimestdValues[`timestd${i}`] = data[`kick_io_timestd${i}`] !== undefined 
    ? String(data[`kick_io_timestd${i}`]) 
    : "";
}
settimestdValues(newTimestdValues);

 const pm = data.processMinutes;

    const parseDateTime = (t: string | null): Date | null => {
      if (!t) return null;
      const [datePart, timePart] = t.split(" ");
      if (!datePart || !timePart) return null;
      const [day, month, year] = datePart.split("-").map(Number);
      const [hours, minutes, seconds] = timePart.split(":").map(Number);
      if ([day, month, year, hours, minutes, seconds].some(isNaN)) return null;
      return new Date(year, month - 1, day, hours, minutes, seconds);
    };

    const diffSeconds = (later: string | null, earlier: string | null): number | null => {
      const d1 = parseDateTime(later);
      const d0 = parseDateTime(earlier);
      if (!d1 || !d0) return null;
      return Math.round((d1.getTime() - d0.getTime()) / 1000); // seconds
    };

    const setVal = (id: string, val: number | null) => {
      const el = document.getElementById(id);
      if (el instanceof HTMLInputElement) {
        el.value = val !== null ? String(val) : "";
      }
    };

    setVal("kick_io_arrow1data", diffSeconds(pm.STEM_OIL_ASSEMBLY, pm.ID_WRITING));
    setVal("kick_io_arrow2data", diffSeconds(pm.STEM_OIL_INSP, pm.STEM_OIL_ASSEMBLY));
    setVal("kick_io_arrow3data", diffSeconds(pm.COTTER_RETAINER_ASSEMBLY, pm.STEM_OIL_INSP));
    setVal("kick_io_arrow4data", diffSeconds(pm.COTTER_RETAINER_INSP, pm.COTTER_RETAINER_ASSEMBLY));
 
    setVal("kick_io_arrow6data", diffSeconds(pm.PLUG_TUBE_PRESS, pm.COTTER_RETAINER_INSP));
    setVal("kick_io_arrow7data", diffSeconds(pm.SPARK_PLUG_TIGHT, pm.PLUG_TUBE_PRESS));
    setVal("kick_io_arrow8data", diffSeconds(pm.PORT_LEAK_TESTER, pm.SPARK_PLUG_TIGHT));
    setVal("kick_io_arrow9data", diffSeconds(pm.FUEL_LEAK_TESTER, pm.PORT_LEAK_TESTER));
    setVal("kick_io_arrow10data", diffSeconds(pm.END_CAP_VISION, pm.FUEL_LEAK_TESTER));

(() => {
  const arrowIds = [
    "kick_io_arrow1data",
    "kick_io_arrow2data",
    "kick_io_arrow3data",
    "kick_io_arrow4data",
    "kick_io_arrow6data",
    "kick_io_arrow7data",
    "kick_io_arrow8data",
    "kick_io_arrow9data",
    "kick_io_arrow10data",
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

  const tptFormatted = `${minutes}m ${seconds}s`;

  const tptEl = document.getElementById("kick_io_tpt-data") as HTMLInputElement | null;
  if (tptEl) tptEl.value = tptFormatted;

})();


    const ki = Number(data.KICK_IN_STN)-1;
    const ko = Number(data.KICK_OUT_STN)-1;

    if (selectedKickType === "in" && kickOutIndex !== null) {
      const prevKoEl = document.getElementById(boxIds[kickOutIndex]);
      if (prevKoEl) {
        prevKoEl.style.backgroundColor = "";
        prevKoEl.style.color = "";
      }
      setKickOutIndex(null);
    } else if (selectedKickType === "out" && kickInIndex !== null) {
      const prevKiEl = document.getElementById(boxIds[kickInIndex]);
      if (prevKiEl) {
        prevKiEl.style.backgroundColor = "";
        prevKiEl.style.color = "";
      }
      setKickInIndex(null);
    }

 boxIds.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el instanceof HTMLInputElement) el.value = "";
    el.style.backgroundColor = "";
    el.style.color = "";
    el.classList.remove("kick-in-flash", "kick-out-flash");
  });
  if (kickInIndex !== null) setKickInIndex(null);
  if (kickOutIndex !== null) setKickOutIndex(null);

  setBoxValues({});  

    const machineToBoxMap = [  
      null,        
      "boxrow1_1",  
      "boxrow1_2",
      "boxrow1_3",   
      "boxrow1_4",   
      "boxrow2_1",   
      "boxrow2_2",   
      "boxrow2_3",  
      "boxrow2_4",  
      "boxrow2_5",  
    ];

const last4 = data.last4digits;


if (selectedKickType === "in" && ki >= 0 && last4) {
  const boxId = machineToBoxMap[ki];
  if (boxId) {
    setBoxValues({ [boxId]: last4 });
  }
}

if (selectedKickType === "out" && ko >= 0 && last4) {
  const boxId = machineToBoxMap[ko];
  if (boxId) {
    setBoxValues({ [boxId]: last4 });
  }
}


    if (selectedKickType === "in" && ki >= 0 && ki < boxIds.length) {
      const el = document.getElementById(boxIds[ki]);
      if (el) {
        el.style.backgroundColor = "lightgreen";
        el.style.color = "black";
        setKickInIndex(ki);
      }
    } else if (selectedKickType === "out" && ko >= 0 && ko < boxIds.length) {
      const el = document.getElementById(boxIds[ko]);
      if (el) {
        el.style.backgroundColor = "lightskyblue";
        el.style.color = "black";
        setKickOutIndex(ko);
      }
    }

    if (selectedKickType === "in") {
      setKickOutIndex(null);

    } else if (selectedKickType === "out") {
      setKickInIndex(null);
    }

  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  fetch("http://192.168.0.20:4001/api/head_all_engines")
    .then(res => res.json())
    .then(data => setEngines(data))
    .catch(err => console.error("Error fetching engines:", err));
}, []);



setTimeout(() => {
  boxIds.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove("kick-in-flash", "kick-out-flash");
  });

  if (kickInIndex !== null) {
    const kiEl = document.getElementById(boxIds[kickInIndex]);
    if (kiEl) kiEl.classList.add("kick-in-flash");
  }

  if (kickOutIndex !== null) {
    const koEl = document.getElementById(boxIds[kickOutIndex]);
    if (koEl) koEl.classList.add("kick-out-flash");
  }
}, 50);

interface EngineData {
  ENGINE_NO?: string | null;
  engineNumber: string | null;
  engineCode: string | null;
  dateTime?: string | null;
  shift?: string | null;
  initialDateTime?: string | null; 
  message?: string;
  timeDevColors: string[]; 

  kick_io_timeDev1?: string | null;
  kick_io_result1_1?: string | null;
  kick_io_result1_2?: string | null;
  kick_io_result1_3?: string | null;
  kick_io_result1_4?: string | null;

  kick_io_timeDev2?: string | null;
  kick_io_result2_1?: string | null;
  kick_io_result2_2?: string | null;
  kick_io_result2_3?: string | null;
  kick_io_result2_4?: string | null;

  kick_io_timeDev3?: string | null;
  kick_io_result3_1?: string | null;
  kick_io_result3_2?: string | null;
  kick_io_result3_3?: string | null;
  kick_io_result3_4?: string | null;

  kick_io_timeDev4?: string | null;
  kick_io_result4_1?: string | null;
  kick_io_result4_2?: string | null;
  kick_io_result4_3?: string | null;
  kick_io_result4_4?: string | null;

  kick_io_timeDev5?: string | null;
  kick_io_result5_1?: string | null;
  kick_io_result5_2?: string | null;
  kick_io_result5_3?: string | null;
  kick_io_result5_4?: string | null;

  kick_io_timeDev6?: string | null;
  kick_io_result6_1?: string | null;
  kick_io_result6_2?: string | null;
  kick_io_result6_3?: string | null;
  kick_io_result6_4?: string | null;

  kick_io_timeDev7?: string | null;
  kick_io_result7_1?: string | null;
  kick_io_result7_2?: string | null;
  kick_io_result7_3?: string | null;
  kick_io_result7_4?: string | null;

  kick_io_timeDev8?: string | null;
  kick_io_result8_1?: string | null;
  kick_io_result8_2?: string | null;
  kick_io_result8_3?: string | null;
  kick_io_result8_4?: string | null;

  qualityData4Gray?: boolean;
}

const [timestdValues, settimestdValues] = useState<{ [key: string]: string | number }>({});

useEffect(() => {
  if (!engineData) return;

  // console.log("timeDevColors", engineData.timeDevColors);

  for (let i = 1; i <= 8; i++) {
    const cell = document.getElementById(`kick_io_timeDev${i}`);
    const color = engineData.timeDevColors?.[i - 1] ?? "gray";

    if (cell) {
      cell.style.backgroundColor = color;
      cell.style.color = color === "red" ? "white" : "black";
    }
  }

}, [engineData]);

useEffect(() => {
  if (!engineData) return;

  const is012 = engineData.engineCode === "012";
  const rows = [
    [engineData.kick_io_result1_1, engineData.kick_io_result1_2, engineData.kick_io_result1_3, engineData.kick_io_result1_4],
    [engineData.kick_io_result2_1, engineData.kick_io_result2_2, engineData.kick_io_result2_3, engineData.kick_io_result2_4],
    [engineData.kick_io_result3_1, engineData.kick_io_result3_2, engineData.kick_io_result3_3, engineData.kick_io_result3_4],
    [engineData.kick_io_result4_1, engineData.kick_io_result4_2, engineData.kick_io_result4_3, engineData.kick_io_result4_4],
    [engineData.kick_io_result5_1, engineData.kick_io_result5_2, engineData.kick_io_result5_3, engineData.kick_io_result5_4],
    [engineData.kick_io_result6_1, engineData.kick_io_result6_2, engineData.kick_io_result6_3, engineData.kick_io_result6_4],
  ];

  let allGreen = true;

  rows.forEach((rowValues, rowIndex) => {
    const columnsToCheck = is012 ? rowValues.slice(0, 3) : rowValues;

    columnsToCheck.forEach(value => {
      const color = cellColorRule(rowIndex + 1, value);
      if (color === "red") allGreen = false;
    });
  });

  const resultImg = document.querySelector<HTMLImageElement>("#kick_io_result2 img");
  if (resultImg) {
    resultImg.src = allGreen ? okay : notokay;
  }

}, [engineData]);



const cellColorRule = (row: number, value: string | number | null | undefined) => {
  if (!value || value === "-") return "white";

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

const getCellStyle = (
  row: number,
  col: number,
  value: string | number | null | undefined,
  isGray?: boolean
): React.CSSProperties => {
  if (isGray && col === 4) {
    return { backgroundColor: "#d3d3d3", color: "black", textAlign: "center" };
  }

  const bg = cellColorRule(row, value);
  return {
    backgroundColor: bg,
    color: bg === "red" ? "white" : "black",
    textAlign: "center"
  };
};

  return (
      <>
  <div className={showSettings ? "blur" : ""}>
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
      <h2  id="kick_io_head1">HEAD FIREWALL – KICK-IN/OUT DETAILS</h2>
      <img src={tiei1} alt="TIEI-1" width="50" height="60" id="kick_io_tiei1" />
      <img src={tiei2} alt="TIEI-2" width="280" height="70" id="kick_io_tiei2" />
      <img 
        src={live} 
        alt="live" 
        width="100" 
        height="120" 
        id='kick_io_live' 
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
      <div id="kick_io_tiei3">
    <FontAwesomeIcon
      icon={faGear}
      size="2x"  
      onClick={handleGearClick} 
      style={{ marginTop: '20px', color: '0,112,192' }} id='kick_io_settings'
    />
      </div>
    </header>

    <main id="kick_io_dashboard-table">
      <span id="kick_io_ss1">Shift Status</span>
      <table>
        <tbody>
          <tr id="kick_io_row1">
            <td rowSpan={2} id="kick_io_box1">IN</td>
            <td rowSpan={2} id="kick_io_shift-in">{shiftInCount !== null ? shiftInCount : '-'}
            </td>

            <td id="kick_io_box2">KICK OUT</td>
            <td id="kick_io_kick-out"  onClick={handleKickOutClick}
style={{
    cursor: "pointer",
    backgroundColor: selectedKickType === "out" ? "lightgreen" : "",
    color: selectedKickType === "out" ? "black" : ""
  }}>{kickOutCount ?? '—'}</td>

            <td rowSpan={2} id="kick_io_box3">OUT</td>
            <td rowSpan={2} id="kick_io_shift-out">{shiftOutCount !== null ? shiftOutCount : '-'}</td>

            <td rowSpan={2} id="kick_io_box4">Abnormal cycle</td>
            <td rowSpan={2} id="kick_io_A-cycle"  onClick={handleAbnormalCycleData}
  style={{
    cursor: "pointer",
    backgroundColor: selectedKickType === "abnormal" ? "lightgreen" : ""    
  }}>{abnormalCycleCount !== null ? abnormalCycleCount : '-'}</td>

            <td rowSpan={2} id="kick_io_box5">Straight-Pass</td>
            <td rowSpan={2} id="kick_io_S-pass">{straightPass !== null ? straightPass : '-'}</td>
          </tr>

<tr id="kick_io_row1-sub">
  <td id="kick_io_box6">KICK IN</td>
  <td id="kick_io_kick-in"
      onClick={handleKickInClick}
      style={{
        cursor: "pointer",
        backgroundColor: selectedKickType === "in" ? "lightgreen" : "",
      }}>
      {kickInCount ?? "—"}
  </td>
</tr>
        </tbody>
      </table>
    </main>

    <div id="kick_io_row2">
      <span style={{ marginLeft: "-84%",marginTop: "1%" , color: "blue", fontSize: "35px", fontWeight: "bold",fontStyle: "italic"}} id='kick_io_layout'>Layout:</span>
      <div id='kick_io_top-box'>
        <label htmlFor="tpt-data" id="kick_io_tpt" style={{marginLeft: "2%", marginTop: "-80px"}}>Throughput time</label>
        <input
          type="text"
          id="kick_io_tpt-data"
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
        <table id="kick_io_row2-tbl">
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
  <div id='kick_io_boxrow1'>
  <input type="text"  id="kick_io_boxrow1_4"  style={{width: "70px", marginLeft: "-132%", height: "25px", color: "black"}} value={boxValues["boxrow1_4"] || ""} readOnly/>
  <input type="text"  id="kick_io_boxrow1_3"  style={{width: "70px", marginLeft: "19%", height: "25px", color: "black"}} value={boxValues["boxrow1_3"] || ""} readOnly/>
  <input type="text"  id="kick_io_boxrow1_2"  style={{width: "70px", marginLeft: "95%", height: "25px", color: "black"}} value={boxValues["boxrow1_2"] || ""} readOnly/>
  <input type="text"  id="kick_io_boxrow1_1"  style={{width: "70px", marginLeft: "1%", height: "25px", color: "black"}} value={boxValues["boxrow1_1"] || ""} readOnly />
</div>

<div id='kick_io_data'>
  {/* <input 
  type="text" 
  id='i-dt' 
  value={engineData?.dateTime || ''}
  readOnly 
/>  </section> */}
<section>
  <label id='initial-dt'>Selected Part Initial Date-time</label>
<input 
  type="text" 
  id='i-dt' 
  value={engineData?.initialDateTime || ''} 
  readOnly 
/>
</section>

  <div className="table-wrapper">
  <table>
    <thead>
      <tr>
        <th className='sl-col1'>SL NO</th>
        <th className='head-col1'>HEAD SERIAL NO</th>
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
          <td className="sl-col2">{index + 1}</td>
          <td className="head-col2">{eng}</td>
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
    </div>

    <div>
      <table>
        <tbody>
          <tr id="kick_io_row3">
            <td id="kick_io_man-1">
              D4 Fuel Pipe Assy
              <img src={Man} alt="man" width="45" height="45" style={{ marginTop: "15px", marginLeft: "15px" }} id='kick_io_man1' />
            </td>
            <td id="kick_io_B-1">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='kick_io_b1'/>
            </td>
            <td id="kick_io_B-2">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px"}} id='kick_io_b2' />
            </td>
            <td id="kick_io_machine1-5">
              Cotter/ Retainer Insp
              <img src={Machine} alt="machine" width="45" height="40" style={{ marginTop: "10px", marginLeft: "18px" }} id='kick_io_machine5' />
            </td>
            <td id="kick_io_B-3">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='kick_io_b3'/>
            </td>
            <td id="kick_io_machine1-4">
              Cotter/ Retainer Assy
              <img src={Machine} alt="machine" width="45" height="50" style={{ marginTop: "8px", marginLeft: "15px" }} id='kick_io_machine4' />
            </td>
            <td id="kick_io_man-2">
              Spring Assy
              <img src={Man} alt="man" width="42" height="42" style={{ marginTop: "4px", marginLeft: "18px" }} id='kick_io_man2'/>
            </td>
            <td id="kick_io_man-3">
              Spring seat Assy
              <img src={Man} alt="man" width="42" height="42" style={{ marginTop: "4px", marginLeft: "18px" }} id='kick_io_man3'/>
            </td>
            <td id="kick_io_man-4">
              Value Assy
              <img src={Man} alt="man" width="42" height="42" style={{ marginTop: "6px", marginLeft: "18px" }} id='kick_io_man4'/>
            </td>
            <td id="kick_io_B-4">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }}  id='kick_io_b4'/>
            </td>
            <td id="kick_io_machine1-3">
              Steam oil seal Insp
              <img src={Machine} alt="machine" width="45" height="50" style={{ marginTop: "25px", marginLeft: "21px" }} id='kick_io_machine3'/>
            </td>
            <td id="kick_io_machine1-2">
              Steam oil seal Assy
              <img src={Machine} alt="machine" width="45" height="50" style={{ marginTop: "25px", marginLeft: "21px" }} id='kick_io_machine2'/>
            </td>
            <td id="kick_io_B-5">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='kick_io_b5'/>
            </td>
            <td id="kick_io_machine1-1">
              ID writing
              <img src={Machine} alt="machine" width="45" height="50" style={{ marginTop: "46px", marginLeft: "21px" }} id='kick_io_machine1'/>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
     <div id='kick_io_boxrow2'>
  <input type="text"  id="kick_io_boxrow2_1"  style={{width: "75px", marginLeft: "13.1%", height: "25px", color: "black", marginBottom: "0px"}} value={boxValues["boxrow2_1"] || ""} readOnly/>
  <input type="text"  id="kick_io_boxrow2_2"  style={{width: "75px", marginLeft: "6.1%", height: "25px", color: "black"}} value={boxValues["boxrow2_2"] || ""} readOnly/>
  <input type="text"  id="kick_io_boxrow2_3"  style={{width: "75px", marginLeft: "3.1%", height: "25px", color: "black"}} value={boxValues["boxrow2_3"] || ""} readOnly/>
  <input type="text"  id="kick_io_boxrow2_4"  style={{width: "75px", marginLeft: "3.2%", height: "25px", color: "black"}} value={boxValues["boxrow2_4"] || ""} readOnly/>
  <input type="text"  id="kick_io_boxrow2_5"  style={{width: "75px", marginLeft: "8.2%", height: "25px", color: "black"}} value={boxValues["boxrow2_5"] || ""} readOnly/>
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

<div id='kick_io_logic'>
 <div id='kick_io_md'>
 <p style={{fontSize: "40px", lineHeight: "2", marginLeft: "60px",marginBottom:"0px",  color: "rgba(102, 99, 99, 0.733)"}} id='kick_io_up'>↑</p>
  <span id='kick_io_dolly'
  style={{
    border: "1px solid rgba(167, 164, 164, 0.73)",
    padding:"15px",
    fontSize: "17px",
    fontWeight: "bold",
  }}>Manual dolly</span>
 <p style={{fontSize: "40px", lineHeight: "2", marginLeft: "60px", marginTop:"-10px", color: "rgba(102, 99, 99, 0.733)"}} id='kick_io_down'>↓</p>
</div>

<div className="kick_io_arrow-line">
    <span className="kick_io_arrow5">-----------------------------▷</span>
    <span className="kick_io_arrow4">◁-------------------▷</span>
    <span className="kick_io_arrow3">◁----------------------------------------------------------------▷</span>
    <span className="kick_io_arrow2">◁---------▷</span>
    <span className="kick_io_arrow1">◁----------------------▷</span>
</div>

<div className='kick_io_arrowlinedata1'>
  <input type="text" id="kick_io_arrow5data" readOnly />
  <input type="text" id='kick_io_arrow4data' readOnly/>
  <input type="text" id='kick_io_arrow3data' readOnly/>
  <input type="text" id='kick_io_arrow2data'  readOnly/>
  <input type="text" id='kick_io_arrow1data'  readOnly/>
</div>

<div className='kick_io_arrowlinedata2'>
  <input type="text" id="kick_io_arrow6data" readOnly />
  <input type="text" id='kick_io_arrow7data' readOnly/>
  <input type="text" id='kick_io_arrow8data' readOnly/>
  <input type="text" id='kick_io_arrow9data' readOnly/>
  <input type="text" id='kick_io_arrow10data' readOnly/>
</div>

<div id='kick_io_fd1'>
  <p style={{color:"red",marginLeft:"1020px",marginTop: "-210px", fontSize: "14px"}} id='kick_io_flow-right'>Flow direction</p>
  <p
  id='kick_io_right-line'
  style={{
    fontSize: "14px",
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

<div className="kick_io_arrow-line2">
    <span className="kick_io_arrow6">----------------▷</span>
    <span className="kick_io_arrow7">◁--------------------------------▷</span>
    <span className="kick_io_arrow8">◁--------------------▷</span>
    <span className="kick_io_arrow9">◁--------------------▷</span>
    <span className="kick_io_arrow10">◁-------------------------------------▷</span>
</div>

<div id='kick_io_fd2'>
<p style={{marginTop: "-140px",marginLeft:"-110px",color:"red", fontSize: "14px"}} id='kick_io_flow-left'>Flow direction</p>
<p
 id='kick_io_left-line'
  style={{
    fontSize: "14px",
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
          <tr id="kick_io_row4">
            <td id="kick_io_man2-1">
              <img src={Man} alt="man" width="45" height="45" style={{ marginTop: "8px", marginLeft: "12px" }} id='kick_io_man21' />
              <span style={{ marginTop: "10px" }}>Low Pres Fuel Pipe Assy</span>
            </td>
            <td id="kick_io_machine2-1">
              <img src={Machine} alt="machine" width="45" height="50" style={{ marginTop: "10px", marginLeft: "21px" }} id='kick_io_machine21'/>
              Plug Tube Press Fit
            </td>
            <td id="kick_io_B2-1">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='kick_io_b21' />
            </td>
            <td id="kick_io_B2-2">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='kick_io_b22' />
            </td>
            <td id="kick_io_machine2-2">
              <img src={Machine} alt="machine" width="45" height="50" style={{ marginTop: "10px", marginLeft: "21px" }} id='kick_io_machine22'/>
              Spark Plug Tightening
            </td>
            <td id="kick_io_man2-2">
              <img src={Man} alt="man" width="45" height="45" style={{ marginLeft: "4px" }} id='kick_io_man22'/>
            </td>
            <td id="kick_io_machine2-3">
              <img src={Machine} alt="machine" width="45" height="50" style={{ marginTop: "10px", marginLeft: "21px" }} id='kick_io_machine23'/>
              Port Leak Tester
            </td>
            <td id="kick_io_man2-3">
              <img src={Man} alt="man" width="45" height="45" style={{ marginLeft: "4px" }} id='kick_io_man23'/>
            </td>
            <td id="kick_io_machine2-4">
              <img src={Machine} alt="machine" width="45" height="50" style={{ marginTop: "10px", marginLeft: "21px" }} id='kick_io_machine24' />
              Fuel Leak Tester
            </td>
            <td id="kick_io_man2-4">
              <img src={Man} alt="man" width="42" height="42" style={{ marginTop: "1px", marginLeft: "15px" }} id='kick_io_man24'/>
              <span style={{ marginTop: "10px" }}>End cap</span>
            </td>
            <td id="kick_io_man2-5">
              <img src={Man} alt="man" width="42" height="42" style={{ marginTop: "1px", marginLeft: "15px" }} id='kick_io_man25' />
              <span style={{ marginTop: "10px" }}>Lash Adjuster</span>
            </td>
            <td id="kick_io_machine2-5">
              <img src={Machine} alt="machine" width="45" height="40" style={{ marginTop: "10px", marginLeft: "21px" }} id='kick_io_machine25' />
              End Cap Vision System
            </td>
            <td id="kick_io_man2-4">
              <img src={Man} alt="man" width="42" height="42" style={{ marginTop: "1px", marginLeft: "15px" }} id='kick_io_man24'/>
              <span style={{ marginTop: "10px" }}>Rocker Arm</span>
            </td>
            <td id="kick_io_B2-3">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='kick_io_b23'/>
            </td>
            <td id="kick_io_B2-4">
              <span style={{
                display:"flex",
               justifyContent: "center",
               alignItems: "center",
               marginTop: "10px",
               backgroundColor: "rgba(251,243,225)",
               padding: "4px",
               border: "2px solid orange",
               borderRadius:"5px"
              }} id='kick_io_b24'>C/H</span>
            </td>
            <td style={{
              height:"60px",
              marginTop: "60px",
              marginLeft: "-40px",borderRadius:"5px"
              }} id='kick_io_downarrow'><img src={downarrow} alt="downarrow" width="34" height="66" id='kick_io_downarrow-img' /></td>
            <td style={{
              marginLeft:"6px",borderRadius:"5px"
            }} id='kick_io_uparrow'><img src={uparrow} alt="uparrow" width="34" height="100" id='kick_io_uparrow-img' /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div id="kick_io_lastrow">

      <div id="kick_io_row6">
        <table id="kick_io_row6-tbl">
          <tbody>

  <tr id="kick_io_line1">
    <td></td>
    <td colSpan={2} id='kick_io_time-stamp'>Time Stamp</td>
    <td colSpan={5}>Quality</td>
  </tr>

  <tr id="kick_io_line2">
    <td id='kick_io_machine'>Machine</td>
    <td id='kick_io_std1'>STD</td>
    <td id='kick_io_dev'>DEV</td>
    <td id='kick_io_std2'>STD</td>
    <td id='kick_io_#1'>#1</td>
    <td id='kick_io_#2'>#2</td>
    <td id='kick_io_#3'>#3</td>
    <td id='kick_io_#4'>#4</td>
  </tr>

    <tr id="kick_io_line3">
      <td id='kick_io_machine1'>Stem oil Assy</td>
      
      <td id="kick_io_timestd1">{timestdValues.timestd1}</td>
      <td style={cellStyle(engineData?.kick_io_timeDev1)} id="kick_io_timeDev1">{engineData?.kick_io_timeDev1 ?? "-"}</td>
      <td id="kick_io_qualitystd1">0000</td>

      <td style={{ backgroundColor: cellColorRule(1, engineData?.kick_io_result1_1),color: cellColorRule(1, engineData?.kick_io_result1_1) === "red" ? "white" : "black"  }} id="kick_io_quality1data1">{engineData?.kick_io_result1_1 ?? "-"}</td>
      <td style={{ backgroundColor: cellColorRule(1, engineData?.kick_io_result1_2),color: cellColorRule(1, engineData?.kick_io_result1_2) === "red" ? "white" : "black"  }} id="kick_io_quality1data2">{engineData?.kick_io_result1_2 ?? "-"}</td>
      <td style={{ backgroundColor: cellColorRule(1, engineData?.kick_io_result1_3),color: cellColorRule(1, engineData?.kick_io_result1_3) === "red" ? "white" : "black"  }} id="kick_io_quality1data3">{engineData?.kick_io_result1_3 ?? "-"}</td>
<td
  style={getCellStyle(1, 4, engineData?.kick_io_result1_4, engineData?.qualityData4Gray)}
  id="kick_io_quality1data4"
>
  {engineData?.qualityData4Gray ? "" : engineData?.kick_io_result1_4 ?? "-"}
</td>
</tr>

    <tr id="kick_io_line4">
      <td id='kick_io_machine2'>Stem oil Insp</td>

      <td id="kick_io_timestd2">{timestdValues.timestd2}</td>
      <td style={cellStyle(engineData?.kick_io_timeDev2)} id="kick_io_timeDev2">{engineData?.kick_io_timeDev2 ?? "-"}</td>
      <td id="kick_io_qualitystd2">Variant specific</td>

      <td style={{ backgroundColor: cellColorRule(2, engineData?.kick_io_result2_1),color: cellColorRule(2, engineData?.kick_io_result2_1) === "red" ? "white" : "black"  }} id="kick_io_quality2data1">{engineData?.kick_io_result2_1 ?? "-"}</td>
      <td style={{ backgroundColor: cellColorRule(2, engineData?.kick_io_result2_2),color: cellColorRule(2, engineData?.kick_io_result2_2) === "red" ? "white" : "black"  }} id="kick_io_quality2data2">{engineData?.kick_io_result2_2 ?? "-"}</td>
      <td style={{ backgroundColor: cellColorRule(2, engineData?.kick_io_result2_3),color: cellColorRule(2, engineData?.kick_io_result2_3) === "red" ? "white" : "black"  }} id="kick_io_quality2data3">{engineData?.kick_io_result2_3 ?? "-"}</td>
<td
  style={getCellStyle(2, 4, engineData?.kick_io_result2_4, engineData?.qualityData4Gray)}
  id="kick_io_quality2data4"
>
  {engineData?.qualityData4Gray ? "" : engineData?.kick_io_result2_4 ?? "-"}
</td>
    </tr>

    <tr id="kick_io_line5">
      <td id='kick_io_machine3'>Cotter retainer Assy</td>
      
      <td id="kick_io_timestd3">{timestdValues.timestd3}</td>
      <td style={cellStyle(engineData?.kick_io_timeDev3)} id="kick_io_timeDev3">{engineData?.kick_io_timeDev3 ?? "-"}</td>
      <td id="kick_io_qualitystd3">0000</td>

      <td style={{ backgroundColor: cellColorRule(3, engineData?.kick_io_result3_1),color: cellColorRule(3, engineData?.kick_io_result3_1) === "red" ? "white" : "black"  }} id="kick_io_quality3data1">{engineData?.kick_io_result3_1 ?? "-"}</td>
      <td style={{ backgroundColor: cellColorRule(3, engineData?.kick_io_result3_2),color: cellColorRule(3, engineData?.kick_io_result3_2) === "red" ? "white" : "black"  }} id="kick_io_quality3data2">{engineData?.kick_io_result3_2 ?? "-"}</td>
      <td style={{ backgroundColor: cellColorRule(3, engineData?.kick_io_result3_3),color: cellColorRule(3, engineData?.kick_io_result3_3) === "red" ? "white" : "black"  }} id="kick_io_quality3data3">{engineData?.kick_io_result3_3 ?? "-"}</td>
<td
  style={getCellStyle(3, 4, engineData?.kick_io_result3_4, engineData?.qualityData4Gray)}
  id="kick_io_quality3data4"
>
  {engineData?.qualityData4Gray ? "" : engineData?.kick_io_result3_4 ?? "-"}
</td>
    </tr>

    <tr id="kick_io_line6">
      <td id='kick_io_machine4'>Cotter retainer Insp</td>

      <td id="kick_io_timestd4">{timestdValues.timestd4}</td>
      <td style={cellStyle(engineData?.kick_io_timeDev4)} id="kick_io_timeDev4">{engineData?.kick_io_timeDev4 ?? "-"}</td>
      <td id="kick_io_qualitystd4">Variant specific</td>

      <td style={{ backgroundColor: cellColorRule(4, engineData?.kick_io_result4_1),color: cellColorRule(4, engineData?.kick_io_result4_1) === "red" ? "white" : "black"  }} id="kick_io_quality4data1">{engineData?.kick_io_result4_1 ?? "-"}</td>
      <td style={{ backgroundColor: cellColorRule(4, engineData?.kick_io_result4_2),color: cellColorRule(4, engineData?.kick_io_result4_2) === "red" ? "white" : "black"  }} id="kick_io_quality4data2">{engineData?.kick_io_result4_2 ?? "-"}</td>
      <td style={{ backgroundColor: cellColorRule(4, engineData?.kick_io_result4_3),color: cellColorRule(4, engineData?.kick_io_result4_3) === "red" ? "white" : "black"  }} id="kick_io_quality4data3">{engineData?.kick_io_result4_3 ?? "-"}</td>
<td
  style={getCellStyle(4, 4, engineData?.kick_io_result4_4, engineData?.qualityData4Gray)}
  id="kick_io_quality4data4"
>
  {engineData?.qualityData4Gray ? "" : engineData?.kick_io_result4_4 ?? "-"}
</td>
    </tr>

    <tr id="kick_io_line7">
      <td id='kick_io_machine5'>Plug tube press fit</td>

      <td id="kick_io_timestd5">{timestdValues.timestd5}</td>
      <td style={cellStyle(engineData?.kick_io_timeDev5)} id="kick_io_timeDev5">{engineData?.kick_io_timeDev5 ?? "-"}</td>
      <td id="kick_io_qualitystd5">2.8 ~ 13 KN</td>

      <td style={{ backgroundColor: cellColorRule(5, engineData?.kick_io_result5_1),color: cellColorRule(5, engineData?.kick_io_result5_1) === "red" ? "white" : "black"  }} id="kick_io_quality5data1">{engineData?.kick_io_result5_1 ?? "-"}</td>
      <td style={{ backgroundColor: cellColorRule(5, engineData?.kick_io_result5_2),color: cellColorRule(5, engineData?.kick_io_result5_2) === "red" ? "white" : "black"  }} id="kick_io_quality5data2">{engineData?.kick_io_result5_2 ?? "-"}</td>
      <td style={{ backgroundColor: cellColorRule(5, engineData?.kick_io_result5_3),color: cellColorRule(5, engineData?.kick_io_result5_3) === "red" ? "white" : "black"  }} id="kick_io_quality5data3">{engineData?.kick_io_result5_3 ?? "-"}</td>
<td
  style={getCellStyle(5, 4, engineData?.kick_io_result5_4, engineData?.qualityData4Gray)}
  id="kick_io_quality5data4"
>
  {engineData?.qualityData4Gray ? "" : engineData?.kick_io_result5_4 ?? "-"}
</td>
    </tr>

    <tr id="kick_io_line8">
      <td id='kick_io_machine6'>Spark plug tight</td>

      <td id="kick_io_timestd6">{timestdValues.timestd6}</td>
      <td style={cellStyle(engineData?.kick_io_timeDev6)} id="kick_io_timeDev6">{engineData?.kick_io_timeDev6 ?? "-"}</td>
      <td id="kick_io_qualitystd6">20 N</td>

      <td style={{ backgroundColor: cellColorRule(6, engineData?.kick_io_result6_1),color: cellColorRule(6, engineData?.kick_io_result6_1) === "red" ? "white" : "black" }} id="kick_io_quality6data1">{engineData?.kick_io_result6_1 ?? "-"}</td>
      <td style={{ backgroundColor: cellColorRule(6, engineData?.kick_io_result6_2),color: cellColorRule(6, engineData?.kick_io_result6_2) === "red" ? "white" : "black" }} id="kick_io_quality6data2">{engineData?.kick_io_result6_2 ?? "-"}</td>
      <td style={{ backgroundColor: cellColorRule(6, engineData?.kick_io_result6_3),color: cellColorRule(6, engineData?.kick_io_result6_3) === "red" ? "white" : "black" }} id="kick_io_quality6data3">{engineData?.kick_io_result6_3 ?? "-"}</td>
<td
  style={getCellStyle(6, 4, engineData?.kick_io_result6_4, engineData?.qualityData4Gray)}
  id="kick_io_quality6data4"
>
  {engineData?.qualityData4Gray ? "" : engineData?.kick_io_result6_4 ?? "-"}
</td>
    </tr>

    <tr id="kick_io_line9">
      <td id='kick_io_machine7'>Port leak</td>

      <td id="kick_io_timestd7">{timestdValues.timestd7}</td>
      <td style={cellStyle(engineData?.kick_io_timeDev7)} id="kick_io_timeDev7">{engineData?.kick_io_timeDev7 ?? "-"}</td>
      <td id="kick_io_qualitystd7">5ml/min</td>

      <td style={cellStyle(engineData?.kick_io_result7_1)} id="kick_io_quality7data1">{engineData?.kick_io_result7_1 ?? "-"}</td>
      <td style={cellStyle(engineData?.kick_io_result7_2)} id="kick_io_quality7data2">{engineData?.kick_io_result7_2 ?? "-"}</td>
      <td style={cellStyle(engineData?.kick_io_result7_3)} id="kick_io_quality7data3">{engineData?.kick_io_result7_3 ?? "-"}</td>
<td
  style={getCellStyle(7, 4, engineData?.kick_io_result7_4, engineData?.qualityData4Gray)}
  id="kick_io_quality7data4"
>
  {engineData?.qualityData4Gray ? "" : engineData?.kick_io_result7_4 ?? "-"}
</td>
    </tr>

    <tr id="kick_io_line10">
      <td id='kick_io_machine8'>Fuel leak</td>

      <td id="kick_io_timestd8">{timestdValues.timestd8}</td>
      <td style={cellStyle(engineData?.kick_io_timeDev8)} id="kick_io_timeDev8">{engineData?.kick_io_timeDev8 ?? "-"}</td>
      <td id="kick_io_qualitystd8">0.4ml/min</td>

      <td style={cellStyle(engineData?.kick_io_result8_1)} id="kick_io_quality8data1">{engineData?.kick_io_result8_1 ?? "-"}</td>
      <td style={cellStyle(engineData?.kick_io_result8_2)} id="kick_io_quality8data2">{engineData?.kick_io_result8_2 ?? "-"}</td>
      <td style={cellStyle(engineData?.kick_io_result8_3)} id="kick_io_quality8data3">{engineData?.kick_io_result8_3 ?? "-"}</td>
<td
  style={getCellStyle(8, 4, engineData?.kick_io_result8_4, engineData?.qualityData4Gray)}
  id="kick_io_quality8data4"
>
  {engineData?.qualityData4Gray ? "" : engineData?.kick_io_result8_4 ?? "-"}
</td>
    </tr>

    <tr id="kick_io_line11">
      <td id='kick_io_machine9'>End cap vision</td>

      <td id="kick_io_timestd9"></td>
      <td style={cellStyle("-")} id="kick_io_timedev9">-</td>
      <td id="kick_io_qualitystd9">0000</td>

      <td style={cellStyle("-")} id="kick_io_quality9data1">-</td>
      <td style={cellStyle("-")} id="kick_io_quality9data2">-</td>
      <td style={cellStyle("-")} id="kick_io_quality9data3">-</td>
      <td style={cellStyle("-")} id="kick_io_quality9data4">-</td>
    </tr>
</tbody>

        </table>
      </div>
 {/* <div id='btns'>
        <button type='submit' id='btn1'>TO KICK IN/OUT</button>
        <button type='submit' id='btn3'>BACK TO MAIN</button>
        <button type='submit' id='btn4'>GO TO LIVE</button>
      </div> */}
      <div id='kick_io_row7'>
  <table id='kick_io_result'>
    <tbody>
      <tr><td id='kick_io_result1'>Overall Judgement</td></tr>
      <tr><td id='kick_io_result2'><img src={okay} alt="okay" height="150" width="150" id='kick_io_result-img'/></td></tr>
      <tr><td id='kick_io_result3'
                onClick={() => navigate("/")}
                style={{
                  cursor: "pointer",
                  fontWeight: "bold",
                  color: "white"
                }}>
                TO MAIN PAGE
      </td></tr>
    </tbody>
  </table>
</div>
<div className='shifts'>
  <button
    className='shift1'
    onClick={() => setSelectedShift(1)}
    style={{
      backgroundColor: selectedShift === 1 ? 'green' : '',
      color: selectedShift === 1 ? 'white' : ''
    }}
  >
    1
  </button>

  <button
    className='shift2'
    onClick={() => setSelectedShift(2)}
    style={{
      backgroundColor: selectedShift === 2 ? 'green' : '',
      color: selectedShift === 2 ? 'white' : ''
    }}
  >
    2
  </button>

  <button
    className='shift3'
    onClick={() => setSelectedShift(3)}
    style={{
      backgroundColor: selectedShift === 3 ? 'green' : '',
      color: selectedShift === 3 ? 'white' : ''
    }}
  >
    3
  </button>
</div>

      <div id="kick_io_row5">
  <CalendarBox
    selectedDate={selectedDate}
    onDateChange={(date) => setSelectedDate(date)}
    selectedShift={selectedShift ?? 0}
  />

</div>
      <div><span className="clear-data" onClick={handleClearData}>Clear Data</span></div>
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


export default Kick_io;