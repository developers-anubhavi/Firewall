import '../Block-firewall/settings.css';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import userIcon from '../assets/group.png';
import logo from '../assets/TieiLogo.png';
import ModuleSelector from '../componenets/ModuleSelector';
import UserDetails from './user_details';

interface SettingsProps {
  username: string;
  logout: () => void;
  usertype: string;
}


interface TPProps {
  value: string;
  onChange: (newTime: string) => void;
  isOpen: boolean;
  onToggle: () => void; 
  onClose: () => void;  
}

const TimePicker: React.FC<TPProps> = ({ value, onChange, isOpen, onToggle, onClose }) => {
  const [h, setH] = useState('00');
  const [m, setM] = useState('00');
  const [s, setS] = useState('00');

  const containerRef = useRef<HTMLDivElement>(null);
  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);
  const secondRef = useRef<HTMLDivElement>(null);

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  const seconds = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  useEffect(() => {
    if (value) {
      const [vh, vm, vs] = value.split(':').map(x => x.padStart(2, '0'));
      setH(vh);
      setM(vm);
      setS(vs);
    } else {
      const now = new Date();
      const vh = now.getHours().toString().padStart(2, '0');
      const vm = now.getMinutes().toString().padStart(2, '0');
      const vs = now.getSeconds().toString().padStart(2, '0');
      setH(vh);
      setM(vm);
      setS(vs);
      onChange(`${vh}:${vm}:${vs}`);
    }
  }, [value, onChange]);

  useEffect(() => {
    if (isOpen) {
      const scrollToSelected = (container: HTMLDivElement | null) => {
        if (!container) return;
        const item = container.querySelector<HTMLDivElement>('.selected');
        if (item) container.scrollTop = item.offsetTop;
      };
      scrollToSelected(hourRef.current);
      scrollToSelected(minuteRef.current);
      scrollToSelected(secondRef.current);
    }
  }, [isOpen, h, m, s]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const handleSelect = (newH: string, newM: string, newS: string) => {
    setH(newH);
    setM(newM);
    setS(newS);
    onChange(`${newH}:${newM}:${newS}`);
  };


return (
  <div className="tp-container" ref={containerRef}>
      <input
        className="tp-input"
        value={`${h}:${m}:${s}`}
        onChange={(e) => onChange(e.target.value)}
      />
      <button className="tp-btn" onClick={onToggle}>🕒</button>

      {isOpen && (
        <div className="tp-popup">
          <div className="tp-col" ref={hourRef}>
            {hours.map((x) => (
              <div
                key={x}
                onClick={() => handleSelect(x, m, s)}
                className={x === h ? 'selected' : ''}
              >
                {x}
              </div>
            ))}
          </div>

          <div className="tp-col" ref={minuteRef}>
            {minutes.map((x) => (
              <div
                key={x}
                onClick={() => handleSelect(h, x, s)}
                className={x === m ? 'selected' : ''}
              >
                {x}
              </div>
            ))}
          </div>

          <div className="tp-col" ref={secondRef}>
            {seconds.map((x) => (
              <div
                key={x}
                onClick={() => handleSelect(h, m, x)}
                className={x === s ? 'selected' : ''}
              >
                {x}
              </div>
            ))}
          </div>
        </div>
      )}
  </div>
);

};



export default function Settings({ username, logout, usertype }: SettingsProps) {
    const [openUserDetails, setOpenUserDetails] = useState(false);

    const isUser = usertype === "USER";  

    interface ShiftTimes {
        first: string;
        second: string;
        third: string;
    }

    const [shiftTimes, setShiftTimes] = useState<ShiftTimes>({
        first: '08:00:00',
        second: '16:00:00',
        third: '00:00:00'
    });

    const [shift1, setShift1] = useState('08:00:00');
    const [shift2, setShift2] = useState('16:00:00');
    const [shift3, setShift3] = useState('00:00:00');

    const [openPicker, setOpenPicker] = useState<string | null>(null);

    useEffect(() => {
        fetch('http://192.168.0.20:4001/api/block_shifts')
            .then(res => res.json())
            .then(data => {
                setShiftTimes(data);
                setShift1(data.first);
                setShift2(data.second);
                setShift3(data.third);
            })
            .catch(console.error);

        const ws = new WebSocket('ws://192.168.0.20:4001');
        ws.onmessage = (e) => {
            const msg = JSON.parse(e.data);

            if (msg.type === "shiftTimes") {
                const { first, second, third } = msg.data;

                setShift1(first);
                setShift2(second);
                setShift3(third);

                setShiftTimes(msg.data);
            }

            if (msg.type === "tableData") {
                updateTableCells(msg.data);
            }
        };

        ws.onerror = console.error;
        ws.onclose = () => console.log('WebSocket closed');

        return () => ws.close();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleUpdate = async () => {
        if (isUser) return; 

        if (!shiftTimes) return;

        setLoading(true);

        const updatedShiftTimes: ShiftTimes = {
            first: shift1,
            second: shift2,
            third: shift3
        };

        try {
            const res = await fetch('http://192.168.0.20:4001/api/block_update-shifts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedShiftTimes),
            });

            await res.json();

            setShiftTimes(updatedShiftTimes);
        } catch (err) {
            console.error('Failed to update shifts:', err);
        } finally {
            setLoading(false);
        }
    };

const [from, setFrom] = useState(""); const [to, setTo] = useState(""); 
const [loading, setLoading] = useState(false); 
const [selectedModels, setSelectedModels] = useState<string[]>([]);
const [engineNumber, setEngineNumber] = useState("");
 const [selectedStations, setSelectedStations] = useState<string[]>([]); 
 const handleModelChange = (value: string) => { setSelectedModels(prev => prev.includes(value) ? prev.filter(x => x !== value) : [...prev, value] ); 
 }; 
 const handleStationChange = (value: string) => { setSelectedStations(prev => prev.includes(value) ? prev.filter(x => x !== value) : [...prev, value] );

  }; 
  const handleDownload = async () => { if (!from || !to) { 
   return;
  } 
  setLoading(true); 
  try {
     const response = await fetch("http://192.168.0.20:4001/api/fetch-block-data", 
      { method: "POST",
         headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ engineNumber,fromDate: from, toDate: to, models: selectedModels, stations: selectedStations }) 
        }); 
        const blob = await response.blob(); 
        
        const url = URL.createObjectURL(blob); 
        const a = document.createElement("a"); 
        a.href = url; a.download = "BlockFirewall_Report.xlsx"; 
        a.click(); URL.revokeObjectURL(url); 
      } catch (err) {
         console.error('Download failed:', err);

       } finally { 
        setLoading(false);

        } }; 
        
    interface TableData {
        [key: string]: number;
    }

    const updateTableCells = (data: TableData) => {
        Object.entries(data).forEach(([id, value]) => {
            const cell = document.getElementById(id);
            if (cell) {
                cell.contentEditable = isUser ? "false" : "true";
                cell.innerText = value.toString();
            }
        });
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const res = await fetch("http://192.168.0.20:4001/api/block_table-data");
                const data: TableData = await res.json();
                updateTableCells(data);
            } catch (err) {
                console.error("Failed to fetch table data:", err);
            }
        };

        fetchInitialData();

        const ws = new WebSocket("ws://192.168.0.20:4001");

        ws.onmessage = (event: MessageEvent) => {
            try {
                const msg = JSON.parse(event.data);

                if (msg.type === "tableData") {
                    updateTableCells(msg.data);
                }
            } catch (err) {
                console.error("WebSocket parse error:", err);
            }
        };

        ws.onerror = console.error;
        ws.onclose = () => console.log("WebSocket closed");

        return () => ws.close();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [tableLoading, setTableLoading] = useState(false);

    const handleSetTable = async () => {
        if (isUser) return;

        setTableLoading(true);

        const col2: number[] = [];
        const col3: number[] = [];
        const col4: number[] = [];

        for (let i = 1; i <= 9; i++) {
            const c2 = parseFloat(document.getElementById(`block_col${i}_2`)?.innerText || "0");
            const c3 = parseFloat(document.getElementById(`block_col${i}_3`)?.innerText || "0");
            const c4 = parseFloat(document.getElementById(`block_col${i}_4`)?.innerText || "0");

            col2.push(isNaN(c2) ? 0 : c2);
            col3.push(isNaN(c3) ? 0 : c3);
            col4.push(isNaN(c4) ? 0 : c4);
        }

        try {
            const res = await fetch("http://192.168.0.20:4001/api/block_update-table", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ col2, col3, col4 })
            });

            await res.json();
        } catch (err) {
            console.error('Failed to update table:', err);
        } finally {
            setTableLoading(false);
        }
    };

    
  useEffect(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleTabClose = async (_event: BeforeUnloadEvent) => {
    try {
      await fetch("http://192.168.0.20:4001/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Failed to logout on tab close:", err);
    }
  };

  window.addEventListener("beforeunload", handleTabClose);

  return () => {
    window.removeEventListener("beforeunload", handleTabClose);
  };
}, []);


  return (
    <div className="settings-container">
      
      <header className="topbar">
        <div className="topbar-left">
          <img src={logo} alt="App Logo" className="topbar-logo" onClick={() => window.open("https://tiei.toyota-industries.com/", "_blank")} />
          <span className="topbar-title" style={{marginLeft:'630px'}}>⚙️SETTINGS</span>
        </div>

        <div className="topbar-right">
            
          <img src={userIcon} alt="User" className="user-icon" onClick={() => {if (usertype === "SUPER ADMIN") setOpenUserDetails(true);
            }}/>
          <button className="logout-btn" onClick={logout}>
            LogOut
          </button>
        </div>
      </header>

      <div className="settings-content">
        <h6>👋 Welcome, {username}!</h6>


     <ModuleSelector />

        {/* <div className="settings-section">
          <h3>Preferences</h3>
          <button className="settings-btn">Change Password</button>
          <button className="settings-btn">Update Profile</button>
        </div> */}
      </div>


       <div className="settings_modal">

         {/* <div className="settings">
           <span id='settings_hf'>Head Firewall</span>
           <span id='settings_tiei'>Settings</span>
         </div> */}

           <table className="settings_headtable1"
                    style={{ pointerEvents: isUser ? "none" : "auto" }} 
                >
           <tbody>
             <tr>
                 <td style={{backgroundColor: '#7288a0a8'}}></td>
                 <td colSpan={2} style={{backgroundColor: '#7288a0a8', fontWeight: 'bold'}}>SET TIME</td>
                 <td style={{backgroundColor: '#7288a0a8'}}></td></tr>
             <tr>
                 <td id='block_col1'>MACHINE</td>
                 <td id='block_col2'>2L</td>
                 <td id='block_col3'>1.5L</td>
                 <td id='block_col4'>+/-</td></tr>
             <tr>
                 <td id='block_col1_1'>Engraving</td>
                 <td id='block_col1_2'></td>
                 <td id='block_col1_3'></td>
                 <td id='block_col1_4'></td></tr>
             <tr>
                 <td id='block_col2_1'>Label Printer</td>
                 <td id='block_col2_2'></td>
                 <td id='block_col2_3'></td>
                 <td id='block_col2_4'></td></tr>
             <tr>
                 <td id='block_col3_1'>ID Writing</td>
                 <td id='block_col3_2'></td>
                 <td id='block_col3_3'></td>
                 <td id='block_col3_4'></td></tr>
             <tr>
                 <td id='block_col4_1'>Lower Metal Rank</td>
                 <td id='block_col4_2'></td>
                 <td id='block_col4_3'></td>
                 <td id='block_col4_4'></td></tr>
             <tr>
                 <td id='block_col5_1'>Upper Metal Rank</td>
                 <td id='block_col5_2'></td>
                 <td id='block_col5_3'></td>
                 <td id='block_col5_4'></td></tr>
             <tr>
                 <td id='block_col6_1'>Crankshaft</td>
                 <td id='block_col6_2'></td>
                 <td id='block_col6_3'></td>
                 <td id='block_col6_4'></td></tr>
             <tr>
                 <td id='block_col7_1'>Crank Cap Nutrunner</td>
                 <td id='block_col7_2'></td>
                 <td id='block_col7_3'></td>
                 <td id='block_col7_4'></td></tr>
             <tr>
                 <td id='block_col8_1'>BS-PS Collation</td>
                 <td id='block_col8_2'></td>
                 <td id='block_col8_3'></td>
                 <td id='block_col8_4'></td></tr>
             <tr>
                 <td id='block_col9_1'>Conrod Nutrunner</td>
                 <td id='block_col9_2'></td>
                 <td id='block_col9_3'></td>
                 <td id='block_col9_4'></td></tr>
              <tr>
                 <td id='block_col10_1'>Piston Collation</td>
                 <td id='block_col10_2'></td>
                 <td id='block_col10_3'></td>
                 <td id='block_col10_4'></td></tr>
           </tbody>
           
         </table>

 <input
  type="button"
  id="settings_set"
  value={tableLoading ? "Setting..." : "SET"}
  onClick={handleSetTable}
  disabled={tableLoading || isUser}  
  />
 
<div className="excel-container">
  <h1 className="excel-title">Block Firewall - Excel Export</h1>

  <div className="excel-form-group">
    <label>From Date & Time:</label>
    <input
      type="datetime-local"
      value={from}
      onChange={(e) => setFrom(e.target.value)}
    
    />
  </div>

  <div className="excel-form-group">
    <label>To Date & Time:</label>
    <input
      type="datetime-local"
      value={to}
      onChange={(e) => setTo(e.target.value)}
      
    />
  </div>

 <div className="model-excel-section">
    <h3>MODEL</h3>
    <div className="excel-checkbox-vertical">
      <label>
        <input type="checkbox" onChange={() => {
      handleModelChange("201");
      handleModelChange("203");
      handleModelChange("205");
      handleModelChange("207");
      handleModelChange("209");
      handleModelChange("621");
      handleModelChange("21");
      handleModelChange("22");
    }} />
        2.0L HV
      </label>
      <label>
  <input
    type="checkbox"
    onChange={() => {
      handleModelChange("202");
      handleModelChange("204");
      handleModelChange("206");
      handleModelChange("208");
      handleModelChange("620");
      handleModelChange("23");
    }}
  />
  2.0L CV
</label>
      <label>
        <input type="checkbox" onChange={() => {
      handleModelChange("101");
      handleModelChange("103");
      handleModelChange("601");
      handleModelChange("11");
      handleModelChange("12");
    }} />
        1.5L HV
      </label>
    </div>
  </div>

  <div className="block-engine-search">
  <label>Engine Number:</label>
  <input
    type="text"
    placeholder="Enter Engine Number"
    value={engineNumber}
    onChange={(e) => setEngineNumber(e.target.value)}
  />
</div>

  <div className="excel-section">
    <h3>STATION</h3>
    <div className="excel-grid">
      {[
        "Engraving",
        "Label Printer",
        "ID Writing",
        "Lower Metal Rank",
        "Upper Metal Rank",
        "Crankshaft",
        "Crank Cap Nutrunner",
        "BS-PS Collation",
        "Conrod Nutrunner",
        "Piston Collation",
        "Kick InOut"
      ].map(station => (
        <label key={station}>
          <input
            type="checkbox"
            onChange={() => handleStationChange(station)}
          
          />
          {station}
        </label>
      ))}
    </div>
  </div>

  <button
    className="excel-download-btn"
    onClick={handleDownload}
    disabled={loading}
  >
    {loading ? "Generating..." : "Download Excel"}
  </button>
</div>

        <div className='block_shifttimings'>
          <table id='shifttext'>
            <caption style={{color :' #007bff',fontSize:'22px',fontWeight: 'bold'}}>SET SHIFT TIME</caption>
            <tbody>
              <tr>
                <td id='shift_1st'>1st SHIFT</td>
                <td id='shift1'>
                   <div
                        style={{
                            pointerEvents: isUser ? "none" : "auto", 
                        }}
                    >
                  <TimePicker
        value={shift1}
        onChange={isUser ? () => {} : setShift1}
        isOpen={!isUser && openPicker === "shift1"}
        onToggle={() => !isUser && setOpenPicker(openPicker === "shift1" ? null : "shift1")}
        onClose={() => setOpenPicker(null)}
        
      /></div>
                </td>
              </tr>
              <tr>
                <td id='shift_2nd'>2nd SHIFT</td>
                <td id='shift2'>
                   <div
                        style={{
                            pointerEvents: isUser ? "none" : "auto",
                      
                        }}
                    >
                        <TimePicker
                            value={shift2}
                            onChange={isUser ? () => {} : setShift2}
                            isOpen={!isUser && openPicker === "shift2"}
                            onToggle={() => !isUser && setOpenPicker(openPicker === "shift2" ? null : "shift2")}
                            onClose={() => setOpenPicker(null)}
                        />
                    </div>
                </td>
              </tr>
              <tr>
                <td id='shift_3rd'>3rd SHIFT</td>
                <td id='shift3'>
                     <div
                        style={{
                            pointerEvents: isUser ? "none" : "auto",
                      
                        }}
                    >
                        <TimePicker
                            value={shift3}
                            onChange={isUser ? () => {} : setShift3}
                            isOpen={!isUser && openPicker === "shift3"}
                            onToggle={() => !isUser && setOpenPicker(openPicker === "shift3" ? null : "shift3")}
                            onClose={() => setOpenPicker(null)}
                        />
                    </div>
                </td>
              </tr>
            </tbody>
          </table>

<input
  type="button"
  id="settings_update"
  value={loading ? "Updating..." : "UPDATE"}
  onClick={handleUpdate}
  disabled={loading}
/>

        </div>
      </div>
      {openUserDetails && (
  <UserDetails onClose={() => setOpenUserDetails(false)} />
)}
  </div>
  );
}


