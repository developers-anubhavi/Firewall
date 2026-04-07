import '../Piston-firewall/GOLIVE.css';

import { useEffect } from 'react';

import axios from 'axios';

import B from '../assets/B.png';
import live from '../assets/live.gif';
import Man from '../assets/Man.png';

interface Props {
  closeOverlay: () => void;
}

const Golive: React.FC<Props> = ({ closeOverlay }) => {

  useEffect(() => {
  fetchEngineNumbers();                        

  const interval = setInterval(() => {
    fetchEngineNumbers();                     
  }, 3000);

  return () => clearInterval(interval);       
}, []);


const fetchEngineNumbers = async () => {
  try {
    const res = await axios.get("http://192.168.0.20:4001/api/piston_top-engines");
    if (!res.data.success) return;

    const data = res.data.data;

    setTimeout(() => {

      // ROW 1
for (let i = 0; i < 4; i++) {
  const box = document.getElementById(`piston_live_boxrow1_${i + 1}`);
  if (box && data[i]) {
    box.innerHTML = `
      <div class="piston_engineNo">${data[i].PALLET_NO || ""}</div>
      <div class="piston_engineCode">${data[i].ENGINE_CODE || ""}</div>
    `;
  }
}

// ROW 2
for (let i = 4; i < 8; i++) {
  const box = document.getElementById(`piston_live_boxrow2_${i - 3}`);
  if (box && data[i]) {
    box.innerHTML = `
      <div class="piston_engineNo">${data[i].PALLET_NO || ""}</div>
      <div class="piston_engineCode">${data[i].ENGINE_CODE || ""}</div>
    `;
  }
}

    }, 0);

  } catch (err) {
    console.error("Engine fetch error:", err);
  }
};



  return (
    <>
        <div className="live_overlay" onClick={closeOverlay}>
      <div className="live_modal" onClick={(e) => e.stopPropagation()}>

        <button className="live_close_btn" onClick={closeOverlay}>X</button>

        <span id='piston_live_title'>PISTON FIREWALL </span>
        <img src={live} alt="live" width="50px" height="50px" />
        <table>
        <tbody>
         <tr id="piston_live_row3">
            <td id="piston_live_B-1">
              <img src={B} alt="B" width="40" height="40" style={{ marginLeft: "14px", marginTop: "8px" }} id='piston_live_b1' />
            </td>
            <td id="piston_live_machine1-4">
              Piston pin Assy
            </td>
                <td id="piston_live_B-2">
              <img src={B} alt="B" width="40" height="40" style={{ marginLeft: "14px", marginTop: "8px" }}  id='piston_live_b2'/>
            </td>
         
            <td id="piston_live_machine1-3">
             Piston Heating
            </td>
             <td id="piston_live_B-3">
              <img src={B} alt="B" width="40" height="40" style={{ marginLeft: "14px", marginTop: "8px" }}  id='piston_live_b3'/>
            </td>
                <td id="piston_live_man-1">
                   <span>Piston Assy</span>
             <img src={Man} alt="man" width="36" height="36" style={{ marginTop: "10px", marginLeft: "20px" }} id='piston_live_man1'/>
             
            </td>
              <td id="piston_live_machine1-2">
             Rank Vision System
            </td>
            <td id="piston_live_machine1-1">
              ID Writing
          
            </td>
         
          </tr>
        </tbody>
      </table>

      <div id="piston_live_boxrow1">
  <div id="piston_live_boxrow1_1" className="engineBox" style={{border: "1px solid black"}}></div>
  <div id="piston_live_boxrow1_2" className="engineBox"  style={{marginLeft: "8%",border: "1px solid black"}}></div>
  <div id="piston_live_boxrow1_3" className="engineBox"  style={{marginLeft: "17.7%",border: "1px solid black"}}></div>
  <div id="piston_live_boxrow1_4" className="engineBox"  style={{marginLeft: "0.1%",border: "1px solid black"}}></div>
</div>
 
      <div id="piston_live_boxrow2">
  <div id="piston_live_boxrow2_1" className="engineBox" style={{border: "1px solid black"}}></div>
  <div id="piston_live_boxrow2_2" className="engineBox" style={{marginLeft: "11.3%",border: "1px solid black"}}></div>
  <div id="piston_live_boxrow2_3" className="engineBox" style={{marginLeft: "0%",border: "1px solid black"}}></div>
  <div id="piston_live_boxrow2_4" className="engineBox" style={{marginLeft: "0%",border: "1px solid black"}}></div>
  </div>
        <table>
        <tbody>
          <tr id="piston_live_row4">
               <td id="piston_live_B2-1">
              <img src={B} alt="B" width="40" height="40" style={{ marginLeft: "14px", marginTop: "10px" }} id='piston_live_b21'/>
            </td>
             <td id="piston_live_machine2-1">
             Snap ring Assy
            </td>
             <td id="piston_live_man2-1">
              <img src={Man} alt="man" width="36" height="36" style={{ marginTop: "1px", marginLeft: "35px" }} id='piston_live_man21'/>
              <span style={{ marginTop: "10px" }}>Oil Ring & Expander assy</span>
            </td>
          
            <td id="piston_live_machine2-2">
             Piston Ring assy
            </td>
            <td id="piston_live_machine2-3">
             Rings Vision System
            </td>
            <td id="piston_live_machine2-4">
             Bearing assy
            </td>
            <td id='piston_live_arrow'>-------▷
              <span>To Block Sub</span>
            </td>
            
          </tr>
        </tbody>
      </table>

      </div>
    </div>
    </>

  );
};

export default Golive;
