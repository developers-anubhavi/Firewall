import '../Main/index.css';

import {
  useEffect,
  useState,
} from 'react';

import {
  faArrowDown,
  faArrowLeft,
  faArrowUp,
  faGear,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// import live from '../assets/live-streaming.gif';
import Machine from '../assets/Machine.png';
import menu from '../assets/menu.gif';
import notokay from '../assets/not okay.png';
import okay from '../assets/okay.png';
import tiei1 from '../assets/tiei-pic1.png';
import tiei2 from '../assets/tiei-pic2.png';
import Menu from '../ET-Finalgate/menu';

type TorqueRow = {
  TORQUE_NUT?: string;
  JUDGE_NUT?: string;
};


const TorqueModal = ({
  isOpen,
  onClose,
  tableName,
  engineNo,
}: {
  isOpen: boolean;
  onClose: () => void;
  tableName: string;
  engineNo: string;
}) => {
  const [data, setData] = useState<TorqueRow[]>([]);

 useEffect(() => {
  if (!isOpen) return;

  const fetchData = async () => {
    try {
      const res = await fetch(
        `http://192.168.0.20:4001/api/torque_nut_details?engineNo=${engineNo}&table=${tableName}`
      );
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    }
  };

  fetchData();

// eslint-disable-next-line react-hooks/exhaustive-deps
}, [isOpen]); 



  if (!isOpen) return null;

return (
  <div className="overlay" onClick={onClose}>
    <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
      
      <div className="overlay-header">
        <h2>{tableName} - Torque Details</h2>
        <button onClick={onClose}>✖</button>
      </div>

      <table className="overlay-table">
        <thead>
          <tr>
            <th>No</th>
            <th>TORQUE_NUT</th>
            <th>JUDGE_NUT</th>
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={3}>No Data</td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>

                <td>{row.TORQUE_NUT ?? "-"}</td>

                <td
                  style={{
                    backgroundColor:
                      row.JUDGE_NUT?.toUpperCase() === "OK"
                        ? "lightgreen"
                        : row.JUDGE_NUT?.toUpperCase() === "NG"
                        ? "red"
                        : "",
                    color: "black",
                    fontWeight: "bold",
                  }}
                >
                  {row.JUDGE_NUT ?? "-"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

    </div>
  </div>
);};

const App = () => {

  const [showSettings, setShowSettings ] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleGearClick = () => {
    window.open("/mainlogin", "_blank");
    setShowSettings(true);
  };

//  useEffect(() => {
//     fetch("http://192.168.0.20:4001/api/mk1-pitch")
//       .then(res => res.json())
//       .then(data => {

//         // Loop through 32 fields
//         for (let i = 1; i <= 32; i++) {
//           const value = data[`MK1_PITCH${i}`];
//           const element = document.getElementById(`row1_${i}`);

//           if (element) {
//             element.innerText = value ?? "";
//           }
//         }

//       })
//       .catch(err => console.error(err));
//   }, []);
useEffect(() => {
  const interval = setInterval(() => {

    // MK1
    fetch("http://192.168.0.20:4001/api/mk1-pitch")
      .then(res => res.json())
      .then(data => {
        for (let i = 1; i <= 32; i++) {
          const value = data[`MK1_PITCH${i}`];
          const reversedIndex = 33 - i;
          const el = document.getElementById(`row1_${reversedIndex}`);
          if (el) el.innerText = value ?? "";
        }
      });

    // MK2
    fetch("http://192.168.0.20:4001/api/mk2-pitch")
      .then(res => res.json())
      .then(data => {
        for (let i = 41; i <= 48; i++) {
          const value = data[`MK2_PITCH${i}`];
          const index = i - 37;
          const el = document.getElementById(`row5_${index}`);
          if (el) el.innerText = value ?? "";
        }
      });

    // MK3
    fetch("http://192.168.0.20:4001/api/mk3-pitch")
      .then(res => res.json())
      .then(data => {
        for (let i = 51; i <= 62; i++) {
          const value = data[`MK3_PITCH${i}`];
          const index = i - 48;
          const el = document.getElementById(`row51_${index}`);
          if (el) el.innerText = value ?? "";
        }
      });

  }, 1000);

  return () => clearInterval(interval);
}, []);
 const [shiftInCount, setShiftInCount] = useState<number | null>(null);

 useEffect(() => {
  const fetchShiftData = async () => {
    try {
      const response = await fetch('http://192.168.0.20:4001/api/mainshiftindata');
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
       const response = await fetch('http://192.168.0.20:4001/api/mainshiftDataOut');
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

  const [mainblocksub, setMainBlockSub] = useState<number | null>(null);

 useEffect(() => {
   const fetchShiftOutData = async () => {
     try {
       const response = await fetch('http://192.168.0.20:4001/api/main_blocksub');
       const json = await response.json();
       setMainBlockSub(json.ENGINE_NO);
     } catch (error) {
       console.error('❌ Error fetching shift out data:', error);
     }
   };

   fetchShiftOutData();
   const interval = setInterval(fetchShiftOutData, 1000);

   return () => clearInterval(interval);
 }, []);

  const [mainheadsub, setMainHeadSub] = useState<number | null>(null);

 useEffect(() => {
   const fetchShiftOutData = async () => {
     try {
       const response = await fetch('http://192.168.0.20:4001/api/main_headsub');
       const json = await response.json();
       setMainHeadSub(json.ENGINE_NO);
     } catch (error) {
       console.error('❌ Error fetching shift out data:', error);
     }
   };

   fetchShiftOutData();
   const interval = setInterval(fetchShiftOutData, 1000);

   return () => clearInterval(interval);
 }, []);

  const [maincamhsg, setMainCamHSG] = useState<number | null>(null);

 useEffect(() => {
   const fetchShiftOutData = async () => {
     try {
       const response = await fetch('http://192.168.0.20:4001/api/main_camhsg');
       const json = await response.json();
       setMainCamHSG(json.ENGINE_NO);
     } catch (error) {
       console.error('❌ Error fetching shift out data:', error);
     }
   };

   fetchShiftOutData();
   const interval = setInterval(fetchShiftOutData, 1000);

   return () => clearInterval(interval);
 }, []);

   const [mainengineno, setMainEngineNo] = useState<number | null>(null);
   const [mainenginecode, setMainEngineCode] = useState<number | null>(null);

   const engineNo = mainengineno?.toString() ?? "";

 useEffect(() => {
   const fetchShiftOutData = async () => {
     try {
       const response = await fetch('http://192.168.0.20:4001/api/main_currentpart');
       const json = await response.json();
       setMainEngineNo(json.ENGINE_NO);
       setMainEngineCode(json.ENGINE_CODE);
     } catch (error) {
       console.error('❌ Error fetching shift out data:', error);
     }
   };

   fetchShiftOutData();
   const interval = setInterval(fetchShiftOutData, 1000);

   return () => clearInterval(interval);
 }, []);

type MainData = {
  rowJudgements?: RowJudgements;

  t1?: { TIME_DEVIATION?: string; OVERALL_JUDGEMENT?: string };
  t2?: { TIME_DEVIATION?: string; OVERALL_JUDGEMENT?: string };
  t3?: { TIME_DEVIATION?: string; OVERALL_JUDGEMENT?: string };
  t4?: { TIME_DEVIATION?: string; OVERALL_JUDGEMENT?: string };
  t5?: { TIME_DEVIATION?: string; OVERALL_JUDGEMENT?: string };
  t6?: { TIME_DEVIATION?: string; OVERALL_JUDGEMENT?: string };
  t7?: { TIME_DEVIATION?: string; OVERALL_JUDGEMENT?: string };

  f1?: { TIME_DEVIATION?: string; JUDGEMENT_1?: string };
  f2?: { TIME_DEVIATION?: string; JUDGEMENT_1?: string };
  f3?: { TIME_DEVIATION?: string; JUDGEMENT_1?: string };
  f4?: { TIME_DEVIATION?: string; JUDGEMENT_1?: string };

  rocker?: {
    TIME_DEVIATION?: string;
    JUDGEMENT_1?: string;
    JUDGEMENT_2?: string;
    JUDGEMENT_3?: string;
    JUDGEMENT_4?: string;
  };

  spark?: { TIME_DEVIATION?: string; JUDGEMENT_1?: string };
};

type RowJudgements = {
  ROW_JUDGEMENT_1_MAIN?: string;
  ROW_JUDGEMENT_2_MAIN?: string;
  ROW_JUDGEMENT_3_MAIN?: string;
  ROW_JUDGEMENT_4_MAIN?: string;
  ROW_JUDGEMENT_5_MAIN?: string;
  ROW_JUDGEMENT_6_MAIN?: string;
  ROW_JUDGEMENT_7_MAIN?: string;
  ROW_JUDGEMENT_8_MAIN?: string;
  ROW_JUDGEMENT_9_MAIN?: string;
  ROW_JUDGEMENT_10_MAIN?: string;
  ROW_JUDGEMENT_11_MAIN?: string;
  ROW_JUDGEMENT_12_MAIN?: string;
  ROW_JUDGEMENT_13_MAIN?: string;
  ROW_JUDGEMENT_14_MAIN?: string;
  ROW_JUDGEMENT_15_MAIN?: string;
  ROW_JUDGEMENT_16_MAIN?: string;
};


const [mainData, setMainData] = useState<MainData>({});

useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await fetch("http://192.168.0.20:4001/api/main_full_data");
      const data = await res.json();
      setMainData(data);

      const mainStdIds = [
  "main_timestd1",
  "main_timestd2",
  "main_timestd3",
  "main_timestd4",
  "main_timestd5",
  "main_timestd6"
];

const main1StdIds = [
  "main1_timestd1",
  "main1_timestd2",
  "main1_timestd3",
  "main1_timestd4",
  "main1_timestd5",
  "main1_timestd6",
];

if (Array.isArray(data.mainStdTimes)) {
  mainStdIds.forEach((id, index) => {
    const el = document.getElementById(id);
    if (!el) return;

    const value = data.mainStdTimes[index];
    el.innerText = value !== null && value !== undefined ? value.toString() : "-";
  });
}

if (Array.isArray(data.main1StdTimes)) {
  main1StdIds.forEach((id, index) => {
    const el = document.getElementById(id);
    if (!el) return;

    const value = data.main1StdTimes[index];
    el.innerText = value !== null && value !== undefined ? value.toString() : "-";
  });
}

    } catch (err) {
      console.error(err);
    }
  };

  fetchData();
  const interval = setInterval(fetchData, 1000);

  return () => clearInterval(interval);
}, []);

const getRowBgColor = (value?: string) => {
  if (!value) return "";

  switch (value.toUpperCase()) {
    case "OK":
      return "lightgreen";
    case "NG":
      return "red";
    default:
      return "";
  }
};

const getRowTextColor = (value?: string) => {
  if (!value) return "black";
  return value.toUpperCase() === "NG" ? "white" : "black";
};

  // const handleGearClick = () => {
  //   window.open("/Login", "_blank");
  //   setShowSettings(true);
  // };


const [modalOpen, setModalOpen] = useState(false);
const [selectedTable, setSelectedTable] = useState("");
const [, setSelectedEngineNo] = useState("");

const isOK = (val?: string) => val?.toUpperCase() === "OK";

const isAllOk =
  isOK(mainData.t1?.OVERALL_JUDGEMENT) &&
  isOK(mainData.t2?.OVERALL_JUDGEMENT) &&
  isOK(mainData.t3?.OVERALL_JUDGEMENT) &&
  isOK(mainData.t4?.OVERALL_JUDGEMENT) &&
  isOK(mainData.t5?.OVERALL_JUDGEMENT) &&
  isOK(mainData.t6?.OVERALL_JUDGEMENT) &&
  isOK(mainData.t7?.OVERALL_JUDGEMENT) &&

  isOK(mainData.f1?.JUDGEMENT_1) &&
  isOK(mainData.f2?.JUDGEMENT_1) &&
  isOK(mainData.f3?.JUDGEMENT_1) &&
  isOK(mainData.f4?.JUDGEMENT_1) &&

  isOK(mainData.rocker?.JUDGEMENT_1) &&
  isOK(mainData.rocker?.JUDGEMENT_2) &&
  isOK(mainData.rocker?.JUDGEMENT_3) &&
  isOK(mainData.rocker?.JUDGEMENT_4) &&

  isOK(mainData.spark?.JUDGEMENT_1);


const [blockStatus, setBlockStatus] = useState<string>("-");
const [blockError, setBlockError] = useState(false);

useEffect(() => {
  if (!engineNo || blockError) return;

  const fetchBlockStatus = async () => {
    try {
      const res = await fetch(
        `http://192.168.0.20:4001/api/block_result_status?engineNo=${engineNo}`
      );

      if (res.status === 404) {
        console.warn("No BLOCK data found");
        setBlockError(true);
        return;
      }

      const data = await res.json();
      setBlockStatus(data.status);

    } catch (err) {
      console.error(err);
      setBlockError(true); 
    }
  };

  fetchBlockStatus();

  const interval = setInterval(fetchBlockStatus, 1000);

  return () => clearInterval(interval);

}, [engineNo, blockError]);


const [pistonStatus, setPistonStatus] = useState<string>("-");
const [pistonError, setPistonError] = useState(false);

useEffect(() => {
  if (!engineNo || pistonError) return;

  const fetchPistonStatus = async () => {
    try {
      const res = await fetch(
        `http://192.168.0.20:4001/api/piston_result_status?engineNo=${engineNo}`
      );

      if (!res.ok) {
        console.warn("Piston API error:", res.status);
        setPistonError(true); 
        return;
      }

      const data = await res.json();
      setPistonStatus(data.status);

    } catch (err) {
      console.error(err);
      setPistonError(true);
    }
  };

  fetchPistonStatus();

  const interval = setInterval(fetchPistonStatus, 1000);

  return () => clearInterval(interval);

}, [engineNo, pistonError]);


const [camhsgStatus, setCamhsgStatus] = useState<string>("-");
const [camhsgError, setCamhsgError] = useState(false); 

useEffect(() => {
  if (!engineNo || camhsgError) return;

  const fetchCamhsgStatus = async () => {
    try {
      const res = await fetch(
        `http://192.168.0.20:4001/api/camhsg_result_status?engineNo=${engineNo}`
      );

      if (res.status === 404) {
        console.warn("No CAMHSG data found");
        setCamhsgError(true);
        return;
      }

      const data = await res.json();
      setCamhsgStatus(data.status);

    } catch (err) {
      console.error(err);
      setCamhsgError(true);
    }
  };

  fetchCamhsgStatus();

  const interval = setInterval(fetchCamhsgStatus, 1000);

  return () => clearInterval(interval);

}, [engineNo, camhsgError]);




  return (

  <div id="main_head1"  className={showSettings ? "blur" : ""}>
    <header>
      <img
  src={menu}
  alt="menu"
  width="80"
  height="100"
  id='main_menu'
  onMouseEnter={() => setShowMenu(true)}
  onMouseLeave={() => setShowMenu(false)}
/>
      <h2>MAIN LINE FIREWALL – DASHBOARD</h2>
      <img src={tiei1} alt="TIEI-1" width="50" height="60" id="main_tiei1" />
      <img src={tiei2} alt="TIEI-2" width="300" height="70" id="main_tiei2" />
      {/* <img 
  src={live} 
  alt="live" 
  width="80" 
  height="80" 
  id='main_live'

/> */}

        <div id="main_tiei3">
              <FontAwesomeIcon
      icon={faGear}
      size="2x"
      onClick={handleGearClick}
      style={{ marginTop: '20px', color: '0,112,192', cursor: "pointer" }}
    />
  </div>
    </header>

    <main id="main_dashboard-table">
      <span id="main_ss1">Shift Status</span>
      <table>
        <tbody>
          <tr id="main_row1">
            <td rowSpan={2} id="main_box1">IN</td>
            <td rowSpan={2} id="main_shift-in">{shiftInCount !== null ? shiftInCount : '-'}</td>

            <td id="main_box2">KICK OUT</td>
            <td id="main_kick-out"></td>

            <td rowSpan={2} id="main_box3">OUT</td>
            <td rowSpan={2} id="main_shift-out"> {shiftOutCount !== null ? shiftOutCount : '-'}</td>

            <td rowSpan={2} id="main_box4">Abnormal cycle</td>
            <td rowSpan={2} id="main_A-cycle"></td>

            <td rowSpan={2} id="main_box5">Straight-Pass</td>
            <td rowSpan={2} id="main_S-pass"></td>
          </tr>
          <tr id="main_row1-sub">
            <td id="main_box6">KICK IN</td>
            <td id="main_kick-in"></td>
          </tr>
        </tbody>
      </table>
    </main>

    <div id="main_row2">
      <span style={{ marginLeft: "-84%",marginTop: "1%" ,color: "blue", fontStyle: "italic", fontSize: "35px", fontWeight: "bold"}} id='main_layout'>Layout:</span>
    

  <table id="main_row2-tbl">
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
  </tbody>
</table>
</div>

<div id='divrow1'>

    <div id='main_divbox1'>
  <table>
    <tbody>
      <tr id='main_mkid'>
        <td>kick In/Out</td>
      </tr>
      <tr id='main_emty'>
        <td></td>
      </tr>
    </tbody>
  </table>

 <div 
  id='main_divbox1_downarrow' 
  style={{ textAlign: "center", marginTop: "10px", display: "flex", justifyContent: "center", gap: "10px" }}
>
  <FontAwesomeIcon 
    icon={faArrowUp} 
    size="2x" 
    style={{ color: "#000" }} 
    className='divbox1_up'
  />
  <FontAwesomeIcon 
    icon={faArrowDown} 
    size="2x" 
    style={{ color: "#000" }} 
    className='divbox1_down'
  />
</div>
</div>

     <div id='main_divbox2'>
    <div id='main_fipg'>
    <span>TCC-2 FIPG</span></div>
     <div id='main_divbox2_downarrow'>
    <FontAwesomeIcon 
      icon={faArrowDown} 
      size="2x" 
      style={{ color: "#000" }} 
      className='divbox2_up'
    />
  </div>
   </div>

     <div id='main_divbox3'>
    <div id='main_fipg'>
    <span>TCC-1 FIPG</span></div>
     <div id='main_divbox3_downarrow'>
    <FontAwesomeIcon 
      icon={faArrowDown} 
      size="2x" 
      style={{ color: "#000" }} 
      className='divbox3_up'
    />
  </div>
   </div>

     <div id='main_divbox4'>
    <div id='main_fipg'>
    <span>Cam-HSG fipg</span></div>
     <div id='main_divbox4_downarrow'>
    <FontAwesomeIcon 
      icon={faArrowDown} 
      size="2x" 
      style={{ color: "#000" }} 
      className='divbox4_down'
    />
  </div>
   </div>

    <div id='main_divbox5'>

    <div id='main_divbox5_downarrow'>
  <FontAwesomeIcon 
    icon={faArrowLeft} 
    size="2x" 
    style={{ color: "#000" }} 
    className='divbox5_down'
  />
</div>

  <table>
    <tbody>
      <tr id='main_Collation'>
        <td>Collation</td>
      </tr>
      <tr id='main_cam'>
        <td>cam-HSG</td>
      </tr>
      <tr id='main_emty'>
        <td>{maincamhsg !== null ? maincamhsg : '-'}</td>
      </tr>
    </tbody>
  </table>

</div>

     <div id='main_divbox6'>
  <table>
    <tbody>
      <tr id='main_Collation'>
        <td>Collation</td>
      </tr>
      <tr id='main_head'>
        <td>Head-Sub</td>
      </tr>
      <tr id='main_emty'>
        <td>{mainheadsub !== null ? mainheadsub : '-'}</td>
      </tr>
    </tbody>
  </table>

  <div id='main_divbox6_downarrow'>
    <FontAwesomeIcon 
      icon={faArrowDown} 
      size="2x" 
      style={{ color: "#000" }} 
      className='divbox6_down'
    />
  </div>
</div>

   <div id='main_divbox7'>
    <div id='main_fipg'>
    <span>Oil Pan FIPG</span></div>
     <div id='main_divbox7_downarrow'>
    <FontAwesomeIcon 
      icon={faArrowDown} 
      size="2x" 
      style={{ color: "#000" }} 
      className='divbox7_down'
    />
  </div>
   </div>

    <div id='main_divbox8'>
  <table>
    <tbody>
      <tr id='main_mkid'>
        <td>MK-ID</td>
      </tr>
      <tr id='main_bsub'>
        <td>Block-Sub</td>
      </tr>
      <tr id='main_emty'>
        <td>{mainblocksub !== null ? mainblocksub : '-'}</td>
      </tr>
    </tbody>
  </table>

  {/* Arrow below table */}
  <div id='main_divbox8_downarrow'>
    <FontAwesomeIcon 
      icon={faArrowDown} 
      size="2x" 
      style={{ color: "#000" }} 
      className='divbox8_down'
    />
  </div>
</div>
</div>
 

            <section>
                <section id='maintable_row1'>
                    <div id='row1_36' style={{backgroundColor : "rgb(176, 222, 236)"}}><span>Buffer</span></div>
                    <section>
                    <div id='maintable1'>
                    <span id='maintable_row1_mk1'>MK1</span>
                    <section id='maintable_rowcolumn1'>
                    <div id='maintable_row1_column1'>   
                    <div id='row1_1' style={{border: "1px solid black"}}></div>
                    <div id='row1_2' style={{border: "1px solid black"}}></div>
                    <div id='row1_3' style={{border: "1px solid black"}}></div>
                    <div id='row1_4' style={{border: "1px solid black"}}></div>
                    <div id='row1_5' style={{border: "1px solid black"}}></div>
                    <div id='row1_6' style={{border: "1px solid black"}}></div>
                    <div id='row1_7' style={{border: "1px solid black"}}></div>
                    <div id='row1_8' style={{border: "1px solid black"}}></div>
                    <div id='row1_9' style={{border: "1px solid black"}}></div>
                    <div id='row1_10' style={{border: "1px solid black"}}></div>
                    <div id='row1_11' style={{border: "1px solid black"}}></div>
                    <div id='row1_12' style={{border: "1px solid black"}}></div>
                    <div id='row1_13' style={{border: "1px solid black"}}></div>
                    <div id='row1_14' style={{border: "1px solid black"}}></div>
                    <div id='row1_15' style={{border: "1px solid black"}}></div>
                    <div id='row1_16' style={{border: "1px solid black"}}></div>
                    <div id='row1_17' style={{border: "1px solid black"}}></div>
                    <div id='row1_18' style={{border: "1px solid black"}}></div>
                    <div id='row1_19' style={{border: "1px solid black"}}></div>
                    <div id='row1_20' style={{border: "1px solid black"}}></div>
                    <div id='row1_21' style={{border: "1px solid black"}}></div>
                    <div id='row1_22' style={{border: "1px solid black"}}></div>
                    <div id='row1_23' style={{border: "1px solid black"}}></div>
                    <div id='row1_24' style={{border: "1px solid black"}}></div>
                    <div id='row1_25' style={{border: "1px solid black"}}></div>
                    <div id='row1_26' style={{border: "1px solid black"}}></div>
                    <div id='row1_27' style={{border: "1px solid black"}}></div>
                    <div id='row1_28' style={{border: "1px solid black"}}></div>
                    <div id='row1_29' style={{border: "1px solid black"}}></div>
                    <div id='row1_30' style={{border: "1px solid black"}}></div>
                    <div id='row1_31' style={{border: "1px solid black"}}></div>
                    <div id='row1_32' style={{border: "1px solid black"}}></div>
                    
                    <div id='row1_33' style={{border: "1px solid black"}}>-</div>
                  
                    <div id='row1_34' style={{border: "1px solid black"}}>-</div></div>
                    </section>
                    </div>
                    </section>
                    <div id='row1_35' style={{backgroundColor : "rgb(176, 222, 236)"}}><span id='rowdata1_35'>Buffer</span></div>
                </section>

                <section>
                  <div id='maintablenum_1'>
                    <div id='rownum1_1'>32</div>
                    <div id='rownum1_2'>31</div>
                    <div id='rownum1_3'>30</div>
                    <div id='rownum1_4'>29</div>
                    <div id='rownum1_5'>28</div>
                    <div id='rownum1_6'>27</div>
                    <div id='rownum1_7'>26</div>
                    <div id='rownum1_8'>25</div>
                    <div id='rownum1_9'>24</div>
                    <div id='rownum1_10'>23</div>
                    <div id='rownum1_11'>22</div>
                    <div id='rownum1_12'>21</div>
                    <div id='rownum1_13'>20</div>
                    <div id='rownum1_14'>19</div>
                    <div id='rownum1_15'>18</div>
                    <div id='rownum1_16'>17</div>
                    <div id='rownum1_17'>16</div>
                    <div id='rownum1_18'>15</div>
                    <div id='rownum1_19'>14</div>
                    <div id='rownum1_20'>13</div>
                    <div id='rownum1_21'>12</div>
                    <div id='rownum1_22'>11</div>
                    <div id='rownum1_23'>10</div>
                    <div id='rownum1_24'>9</div>
                    <div id='rownum1_25'>8</div>
                    <div id='rownum1_26'>7</div>
                    <div id='rownum1_27'>6</div>
                    <div id='rownum1_28'>5</div>
                    <div id='rownum1_29'>4</div>
                    <div id='rownum1_30'>3</div>
                    <div id='rownum1_31'>2</div>
                    <div id='rownum1_32'>1</div>
                  </div>
                </section>

                <section>
                   <div id='main_boxrow1'>
        <div id='main_boxrow11'>
            <span>Rocker-Arm Vision</span>
        </div>
        <div id='main_boxrow12'>
            <span>TCC-2 Nut-runner</span>
        </div>
        <div id='main_boxrow13'>
            <span>TCC-1 Nut-runner</span>
        </div>
        <div id='main_boxrow14'>
            <span>Cam-Hsg Nut-runner</span>
        </div>
        <div id='main_boxrow15'>
            <span>Head-bolt Nut-runner</span>
        </div>
        <div id='main_boxrow16'>
            <span>Flywheel Nut-runner</span>
        </div>
        <div id='main_boxrow17'>
            <span>R/O Seat Nut-runner</span>
        </div>
    </div>

    <div id='main_boxrow2'>
        <div id='main_boxrow21'>
            <span>Headcover Nut-runner</span>
        </div>
        <div id='main_boxrow22'>
            <span>Spark-Plug Gap check</span>
        </div>
        <div id='main_boxrow23'>
            <span>D4 pipe Leak Test</span>
        </div>
        <div id='main_boxrow24'>
            <span>D4 Sensor Leak Test</span>
        </div>
        <div id='main_boxrow25'>
            <span>Arm Lifter</span>
        </div>
    </div>
                </section>

                <section  id='maintable23'>
                  <div  id='maintable2'>
                    <span id='maintable_row2_mk2'>MK2</span>
                    <section id='maintable_row5'>
                    <div id='row5_1'>Buffer</div>
                    <div id='row5_2'>Buffer</div>
                    <div id='row5_3'>Buffer</div>
                    <div id='row5_4'></div>
                    <div id='row5_5'></div>
                    <div id='row5_6'></div>
                    <div id='row5_7'></div>
                    <div id='row5_8'></div>
                    <div id='row5_9'></div>
                    <div id='row5_10'></div>
                    <div id='row5_11'></div>
                    <div id='row5_12'>Buffer</div>
                    </section>
                  </div> 
                  <div  id='maintable3'>
                    <span id='maintable_row3_mk3'>MK3</span>
                    <section  id='maintable_row51'>
                    <div id='row51_1'>Buffer</div>
                    <div id='row51_2'>Buffer</div>
                    <div id='row51_3'></div>
                    <div id='row51_4'></div>
                    <div id='row51_5'></div>
                    <div id='row51_6'></div>
                    <div id='row51_7'></div>
                    <div id='row51_8'></div>
                    <div id='row51_9'></div>
                    <div id='row51_10'></div>
                    <div id='row51_11'></div>
                    <div id='row51_12'></div>
                    <div id='row51_13'></div>
                    <div id='row51_14'></div>
                    <div id='row51_15'>-</div>
                    </section>
                  </div>
                </section>

                <section  id='maintablenum'>
                  <div  id='maintablenum_row5'>
                    <div id='rownum5_1'>41</div>
                    <div id='rownum5_2'>42</div>
                    <div id='rownum5_3'>43</div>
                    <div id='rownum5_4'>44</div>
                    <div id='rownum5_5'>45</div>
                    <div id='rownum5_6'>46</div>
                    <div id='rownum5_7'>47</div>
                    <div id='rownum5_8'>48</div>
                  </div>
                  <div  id='maintablenum_row51'>
                    <div id='rownum51_1'>51</div>
                    <div id='rownum51_2'>52</div>
                    <div id='rownum51_3'>53</div>
                    <div id='rownum51_4'>54</div>
                    <div id='rownum51_5'>55</div>
                    <div id='rownum51_6'>56</div>
                    <div id='rownum51_7'>57</div>
                    <div id='rownum51_8'>58</div>
                    <div id='rownum51_9'>59</div>
                    <div id='rownum51_10'>60</div>
                    <div id='rownum51_11'>61</div>
                    <div id='rownum51_12'>62</div>
                  </div>
                </section>
                </section>
  
    <div id='divrow2'>
     <div id='main_divbox21'>
    <div id='main_fipg'>
    <span>Mid Transfer</span></div>
     {/* <div id='main_divbox21_downarrow'>
    <FontAwesomeIcon 
      icon={faArrowDown} 
      size="2x" 
      style={{ color: "#000" }} 
    />
  </div> */}
   </div>


    <div id='main_divbox22'>

    <div id='main_divbox22_downarrow'>
  <FontAwesomeIcon 
      icon={faArrowDown} 
      size="2x" 
      style={{ color: "#000" }} 
      className='divbox22_down'
    />
</div>

  <table>
    <tbody>
        <tr id='main_emty'>
        <td></td>
      </tr>
      <tr id='main_cam'>
        <td>To ET</td>
      </tr>
      
    </tbody>
  </table>

</div>


    <div id='main_divbox23'>
        <div 
  id='main_divbox23_downarrow' 
  style={{ textAlign: "center", marginTop: "10px", display: "flex", justifyContent: "center", gap: "10px" }}
>
  <FontAwesomeIcon 
    icon={faArrowUp} 
    size="2x" 
    style={{ color: "#000" }} 
    className='divbox23_up'
  />
  <FontAwesomeIcon 
    icon={faArrowDown} 
    size="2x" 
    style={{ color: "#000" }} 
    className='divbox23_down'
  />
</div>
  <table>
    <tbody>
        <tr id='main_emty'>
        <td></td>
      </tr>
      <tr id='main_mkid'>
        <td>kick In/Out</td>
      </tr>
      
    </tbody>
  </table>
</div>


     <div id='main_divbox24'>
          <div id='main_divbox24_downarrow'>
    <FontAwesomeIcon 
      icon={faArrowDown} 
      size="2x" 
      style={{ color: "#000" }} 
      className='divbox24_down'
    />
  </div>
  <table>
    <tbody>
        <tr id='main_emty'>
        <td></td>
      </tr>
      <tr id='main_head'>
        <td>SPS-OUT</td>
      </tr>      
    </tbody>
  </table>
</div>


    <div id='main_divbox25'>
        <div id='main_divbox25_downarrow'>
    <FontAwesomeIcon 
      icon={faArrowUp} 
      size="2x" 
      style={{ color: "#000" }} 
      className='divbox25_down'
    />
  </div>
  <table>
    <tbody>
        <tr id='main_emty'>
        <td></td>
      </tr>
     
      <tr id='main_bsub'>
        <td>SPS</td>
      </tr>
      
       <tr id='main_mkid'>
        <td>Collation</td>
      </tr>
    </tbody>
  </table>

  
</div>
</div>
 
  
    <div id="main_lastrow">
      <div id="main_row5">
  <table id="main_row5-tbl">
    <tbody>

      <tr id="main_cell1">
        <td
          style={{
            border: "2px solid orange",
            
            borderRadius: "5px"
          }}
        >
          Current Part Status
        </td>
      </tr>

      <tr id="main_cell2">
        <td style={{ border: "none", padding: "5px" }}>
          Engine No
        </td>
      </tr>

      <tr id="main_cell3">
        <td style={{ borderRadius: "5px" }}>
        {mainengineno !== null ? mainengineno : '-'}
        </td>
      </tr>

      <tr id="main_cell4">
        <td style={{ border: "none", padding: "5px" }}>
          Eng Code
        </td>
      </tr>

      <tr id="main_cell5">
        <td style={{ borderRadius: "5px" }}>
         {mainenginecode !== null ? mainenginecode : '-'}
      </td>
      </tr>

    </tbody>
  </table>
</div>

      <div id="main_row6">
        <table id="main_row6-tbl">
          <tbody>

  <tr id="main_line1">
    <td id='main_machine1'></td>
    <td colSpan={2} id='main_time-stamp'>Time(sec)</td>
    <td colSpan={2}>Quality</td>
  </tr>

  <tr id="main_line2">
    <td id='main_machine'>Machine</td>
    <td id='main_std1'>STD</td>
    <td id='main_dev'>DEV</td>

    <td id='main_#1'>STD</td>
    <td id='main_#2'>ACTUAL</td>

  </tr>

  <tr><td id='main_line3' colSpan={5}>Nut Runner</td></tr>

 <tr id="main_line4">
  <td>R/O Seal NR</td>
  <td id="main_timestd1"></td>
  <td id="main_timedev1">{mainData.t1?.TIME_DEVIATION ?? "-"}</td>
  <td id="main_quality1data1"></td>
  <td
  id="main_quality1data2"
  style={{
    backgroundColor: getRowBgColor(mainData.rowJudgements?.ROW_JUDGEMENT_1_MAIN),
    color: getRowTextColor(mainData.rowJudgements?.ROW_JUDGEMENT_1_MAIN),
    cursor: "pointer",
  }}
  onClick={() => {
    setSelectedTable("TIAS323_REAROILSEAL");
    setSelectedEngineNo(mainengineno?.toString() ?? "");
    setModalOpen(true);
  }}>
  {mainData.t1?.OVERALL_JUDGEMENT ?? "-"}
</td></tr>

<tr id="main_line5">
  <td>Flywheel NR</td>
  <td id="main_timestd2"></td>
  <td id="main_timedev2">{mainData.t2?.TIME_DEVIATION ?? "-"}</td>
  <td id="main_quality2data1"></td>
 <td
  style={{
    backgroundColor: getRowBgColor(mainData.rowJudgements?.ROW_JUDGEMENT_2_MAIN),
    color: getRowTextColor(mainData.rowJudgements?.ROW_JUDGEMENT_2_MAIN),
    cursor: "pointer",
  }}
  onClick={() => {
    setSelectedTable("TIAS324_FLYWHEEL");
    setModalOpen(true);
  }}
>
  {mainData.t2?.OVERALL_JUDGEMENT ?? "-"}
</td>
</tr>

<tr id="main_line6">
  <td>Head-bolt NR</td>
  <td id="main_timestd3"></td>
  <td id="main_timedev3">{mainData.t3?.TIME_DEVIATION ?? "-"}</td>
  <td id="main_quality3data1"></td>
  <td
  id="main_quality3data2"
  style={{
    backgroundColor: getRowBgColor(mainData.rowJudgements?.ROW_JUDGEMENT_3_MAIN),
    color: getRowTextColor(mainData.rowJudgements?.ROW_JUDGEMENT_3_MAIN),
    cursor: "pointer",
  }}
  onClick={() => {
    setSelectedTable("TIAS325_HEADBOLT");
    setModalOpen(true);
  }}
>
  {mainData.t3?.OVERALL_JUDGEMENT ?? "-"}
</td>
</tr>

<tr id="main_line7">
  <td>Cam-HSG NR</td>
  <td id="main_timestd4"></td>
  <td id="main_timedev4">{mainData.t4?.TIME_DEVIATION ?? "-"}</td>
  <td id="main_quality4data1"></td>
 <td
  id="main_quality4data2"
  style={{ backgroundColor: getRowBgColor(mainData.rowJudgements?.ROW_JUDGEMENT_4_MAIN), color: getRowTextColor(mainData.rowJudgements?.ROW_JUDGEMENT_4_MAIN),cursor: "pointer" }}
  onClick={() => {
    setSelectedTable("TIAS327_CAMHOSING");
    setModalOpen(true);
  }}
>
  {mainData.t4?.OVERALL_JUDGEMENT ?? "-"}
</td>
</tr>

<tr id="main_line8">
  <td>TCC-1 NR</td>
  <td id="main_timestd5"></td>
  <td id="main_timedev5">{mainData.t5?.TIME_DEVIATION ?? "-"}</td>
  <td id="main_quality5data1"></td>
  <td
  id="main_quality5data2"
  style={{ backgroundColor: getRowBgColor(mainData.rowJudgements?.ROW_JUDGEMENT_5_MAIN), color: getRowTextColor(mainData.rowJudgements?.ROW_JUDGEMENT_5_MAIN), cursor: "pointer" }}
  onClick={() => {
    setSelectedTable("TIAS329_TCC1");
    setModalOpen(true);
  }}
>
  {mainData.t5?.OVERALL_JUDGEMENT ?? "-"}
</td>
</tr>

<tr id="main_line9">
  <td>TCC-2 NR</td>
  <td id="main_timestd6"></td>
  <td id="main_timedev6">{mainData.t6?.TIME_DEVIATION ?? "-"}</td>
  <td id="main_quality6data1"></td>
  <td
  id="main_quality6data2"
  style={{ backgroundColor: getRowBgColor(mainData.rowJudgements?.ROW_JUDGEMENT_6_MAIN), color: getRowTextColor(mainData.rowJudgements?.ROW_JUDGEMENT_6_MAIN), cursor: "pointer" }}
  onClick={() => {
    setSelectedTable("TIAS331_TCC2");
    setModalOpen(true);
  }}
>
  {mainData.t6?.OVERALL_JUDGEMENT ?? "-"}
</td>
</tr>

<tr id="main_line10">
  <td>Head cover</td>
  <td id="main_timestd7"></td>
  <td id="main_timedev7">{mainData.t7?.TIME_DEVIATION ?? "-"}</td>
  <td id="main_quality6data1"></td>
 <td
  id="main_quality6data2"
  style={{ backgroundColor: getRowBgColor(mainData.rowJudgements?.ROW_JUDGEMENT_7_MAIN), color: getRowTextColor(mainData.rowJudgements?.ROW_JUDGEMENT_7_MAIN), cursor: "pointer" }}
  onClick={() => {
    setSelectedTable("TIAS341_HEADCOVER");
    setModalOpen(true);
  }}
>
  {mainData.t7?.OVERALL_JUDGEMENT ?? "-"}
</td>
</tr>

      <tr><td id="main_line11" colSpan={5}>-</td></tr>

      <tr id="main_line12">
        <td>-</td>
        <td id="main_timestd8"></td>
        <td id="main_timedev8"></td>

        <td id="main_quality8data1" ></td>
        <td id="main_quality8data2" ></td>
      </tr>

       <tr id="main_line13">
        <td>-</td>
        <td id="main_timestd9"></td>
        <td id="main_timedev9"></td>

        <td id="main_quality9data1" ></td>
        <td id="main_quality9data2" ></td>
      </tr>
    </tbody>
 </table>

  <table id="main_row61-tbl">
 <tbody>

  <tr id="main_line1">
    <td id='main_machine1'></td>
    <td colSpan={2} id='main_time-stamp'>Time(sec)</td>
    <td colSpan={5}>Quality</td>
  </tr>

  <tr id="main_line2">
    <td id='main_machine'>Machine</td>
    <td id='main_std1'>STD</td>
    <td id='main_dev'>DEV</td>

    <td id='main_#1'>STD</td>
    <td id='main_#2' colSpan={4} >ACTUAL</td>
  </tr>

  <tr><td id="main_line3" colSpan={8}>FIPG</td></tr>

      <tr id="main_line4">
        <td>oil pan FIPG</td>

        <td id="main1_timestd1"></td>
        <td  id="main1_timedev1">{mainData.f1?.TIME_DEVIATION ?? "-"}</td>

        <td id="main1_quality1data1"></td>
       <td
  colSpan={4}
  style={{
    backgroundColor: getRowBgColor(mainData.rowJudgements?.ROW_JUDGEMENT_8_MAIN),
    color: getRowTextColor(mainData.rowJudgements?.ROW_JUDGEMENT_8_MAIN),
  }}
>
  {mainData.f1?.JUDGEMENT_1 ?? "-"}
</td>
      </tr>

     <tr id="main1_line5">
        <td>Cam-HSG FIPG</td>

        <td id="main1_timestd2"></td>
        <td id="main1_timedev2">{mainData.f2?.TIME_DEVIATION ?? "-"}</td>

        <td id="main1_quality2data1" ></td>
       <td id="main1_quality2data2" colSpan={4}  style={{
    backgroundColor: getRowBgColor(mainData.rowJudgements?.ROW_JUDGEMENT_9_MAIN),
    color: getRowTextColor(mainData.rowJudgements?.ROW_JUDGEMENT_9_MAIN),
  }}>
  {mainData.f2?.JUDGEMENT_1 ?? "-"}
</td>

      </tr>

      <tr id="main1_line6">
        <td>TCC-1 FIPG</td>
        <td id="main1_timestd3"></td>
        <td id="main1_timedev3">{mainData.f3?.TIME_DEVIATION ?? "-"}</td>

        <td id="main1_quality3data1" ></td>
        <td id="main1_quality3data2" colSpan={4}  style={{ backgroundColor: getRowBgColor(mainData.rowJudgements?.ROW_JUDGEMENT_10_MAIN), color: getRowTextColor(mainData.rowJudgements?.ROW_JUDGEMENT_10_MAIN) }}>
  {mainData.f3?.JUDGEMENT_1 ?? "-"}
</td>

      </tr>

      <tr id="main1_line7">
        <td>TCC-2 FIPG</td>
        <td id="main1_timestd4"></td>
        <td id="main1_timedev4">{mainData.f4?.TIME_DEVIATION ?? "-"}</td>

        <td id="main1_quality4data1" ></td>
        <td id="main1_quality4data2" colSpan={4} style={{ backgroundColor: getRowBgColor(mainData.rowJudgements?.ROW_JUDGEMENT_11_MAIN), color: getRowTextColor(mainData.rowJudgements?.ROW_JUDGEMENT_11_MAIN) }}>
  {mainData.f4?.JUDGEMENT_1 ?? "-"}
</td>
 
      </tr>
      
      <tr><td id="main1_line8" colSpan={8}>Special</td></tr>

      <tr id="main1_line9">
        <td>Rocker-Arm vision</td>
        <td id="main1_timestd5"></td>
        <td id="main1_timedev5">{mainData.rocker?.TIME_DEVIATION ?? "-"}</td>

        <td id="main1_quality5data1" ></td>
        <td id="main1_quality5data2" style={{ backgroundColor: getRowBgColor(mainData.rowJudgements?.ROW_JUDGEMENT_12_MAIN), color: getRowTextColor(mainData.rowJudgements?.ROW_JUDGEMENT_12_MAIN) }}>
  {mainData.rocker?.JUDGEMENT_1 ?? "-"}
</td>
        <td id="main1_quality5data3" style={{ backgroundColor: getRowBgColor(mainData.rowJudgements?.ROW_JUDGEMENT_13_MAIN), color: getRowTextColor(mainData.rowJudgements?.ROW_JUDGEMENT_13_MAIN) }}>
  {mainData.rocker?.JUDGEMENT_2 ?? "-"}
</td>
        <td id="main1_quality5data4" style={{ backgroundColor: getRowBgColor(mainData.rowJudgements?.ROW_JUDGEMENT_14_MAIN), color: getRowTextColor(mainData.rowJudgements?.ROW_JUDGEMENT_14_MAIN) }}>
  {mainData.rocker?.JUDGEMENT_3 ?? "-"}
</td>
        <td id="main1_quality5data5" style={{ backgroundColor: getRowBgColor(mainData.rowJudgements?.ROW_JUDGEMENT_15_MAIN), color: getRowTextColor(mainData.rowJudgements?.ROW_JUDGEMENT_15_MAIN) }}>
  {mainData.rocker?.JUDGEMENT_4 ?? "-"}
</td>
      </tr>

      <tr id="main1_line10">
        <td>Spark-plug gap check</td>
        <td id="main1_timestd6"></td>
        <td id="main1_timedev6">{mainData.spark?.TIME_DEVIATION ?? "-"}</td>

        <td id="main1_quality6data1" ></td>
       <td id="main1_quality6data2" colSpan={4} style={{ backgroundColor: getRowBgColor(mainData.rowJudgements?.ROW_JUDGEMENT_16_MAIN), color: getRowTextColor(mainData.rowJudgements?.ROW_JUDGEMENT_16_MAIN) }}>
  {mainData.spark?.JUDGEMENT_1 ?? "-"}
</td>
      </tr>
    </tbody>
 </table>

<div id='main_bphm'>
  <div id='main_block_Sub'>
    <table>
      <tbody>
      <tr>
        <td id='main_blocksub'>Block sub</td>
        <td
  id="main_blockok"
  style={{
    backgroundColor:
      blockStatus === "OK"
        ? "lightgreen"
        : blockStatus === "NG"
        ? "red"
        : "",
    color: blockStatus === "OK"
      ? "black" 
      : blockStatus === "NG"
      ? "white" 
      : "",
    fontWeight: "bold",
    textAlign: "center",
  }}
>
  {blockStatus}
</td>
      </tr>
      </tbody>
    </table>
  </div>

  <div id='main_piston_Sub'>
    <table>
      <tbody>
      <tr>
        <td id='main_pistonsub'>Piston sub</td>
        <td
  id="main_pistonok"
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

   <div id='main_head_Sub'>
    <table>
      <tbody>
      <tr>
        <td id='main_headsub'>Head sub</td>
        <td id='main_headok'>OK</td>
      </tr>
      </tbody>
    </table>
  </div>

     <div id='main_chg_Sub'>
    <table>
      <tbody>
      <tr>
        <td id='main_chgsub'>CHG sub</td>
        <td
  id="main_chgok"
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
{/* 
     <div id='main_etline_Sub'>
    <table>
      <tbody>
      
      <tr>
        <td id='main_etlinesub'>Main line</td>
        <td id='main_etlineok'>OK</td>
      </tr>
      </tbody>
    </table>
  </div> */}

</div>

</div>
 {/* <div id='main_btns'>
        <button type='submit' id='main_btn1'>TO KICK IN/OUT</button>
        <button type='submit' id='main_btn3'>BACK TO MAIN</button>
        <button type='submit' id='main_btn4'>GO TO LIVE</button>
      </div> */}
      <div id='main_row7'>
  <table id='main_result'>
    <tbody>
      <tr><td id='main_result1'>Overall Judgement</td></tr>
      <tr>
  <td id="main_result2">
  <img
    src={isAllOk ? okay : notokay}
    alt="result"
    height="150"
    width="150"
    id="main_result-img"
  />
</td>
</tr>

      <tr><td
  id='main_result3'
  style={{ cursor: "pointer", fontWeight: "bold", color: "white"}}>TO KICK IN / OUT</td></tr>
    </tbody>
  </table>
</div>

      </div>
       {showMenu && (
  <Menu setShowMenu={setShowMenu}
  />
)}
<TorqueModal
  isOpen={modalOpen}
  onClose={() => setModalOpen(false)}
  tableName={selectedTable}
  engineNo={engineNo}
/>
    </div>
    
  );

};

export default App;