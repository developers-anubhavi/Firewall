import '../camhsgfirewall/GOLIVE.css';

import { useEffect } from 'react';

import axios from 'axios';

import B from '../assets/B.png';
import downarrow from '../assets/dotted down arrow.png';
import uparrow from '../assets/dotted up arrow.png';
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
    const res = await axios.get("http://192.168.0.20:4001/api/cam_top-engines");
    if (!res.data.success) return;

    const data = res.data.data;

    setTimeout(() => {
const engineBoxIds = [
  "cam_live_boxrow1_4",
  "cam_live_boxrow1_2",
  "cam_live_boxrow1_1",
  "cam_live_boxrow2_1",
  "cam_live_boxrow2_2",
  "cam_live_boxrow2_3"
];

engineBoxIds.forEach((id, index) => {
  const box = document.getElementById(id);
  if (box && data[index]) {
    box.innerHTML = `
      <div class="engineNo">${data[index].SERIAL_NO || ""}</div>
      <div class="engineCode">${data[index].ENGINE_CODE || ""}</div>
    `;
  }
});


    }, 0);

  } catch (err) {
    console.error("Engine fetch error:", err);
  }
};


  return (
    <>
        <div className="cam_live_overlay" onClick={closeOverlay}>
      <div className="cam_live_modal" onClick={(e) => e.stopPropagation()}>

        <button className="cam_live_close_btn" onClick={closeOverlay}>X</button>

        <span id='cam_live_title'>Cam-HSG FIREWALL </span>
        <img src={live} alt="live" width="50px" height="50px" />
        <table>
        <tbody>
           <tr id="cam_live_row3">
            <td id="cam_live_B-1">
              <img src={B} alt="B" width="40" height="40" style={{ marginLeft: "14px", marginTop: "8px" }} id='cam_live_b1' />
            </td>
            <td id="cam_live_machine1-5">
              Cam-cap tighten
            </td>
             <td id="cam_live_man-1">
             Backup Cam-cap tighten
            </td>
            <td id="cam_live_machine1-4">
             Grease Application
            </td>
             <td id="cam_live_B-2">
              <img src={B} alt="B" width="40" height="40" style={{ marginLeft: "14px", marginTop: "8px" }}  id='cam_live_b2'/>
            </td>
              <td id="cam_live_machine1-3">
             Can shaft assy
            </td>
          
            <td id="cam_live_B-3">
              <img src={B} alt="B" width="40" height="40" style={{ marginLeft: "14px", marginTop: "8px" }}  id='cam_live_b3'/>
            </td>
         
            <td id="cam_live_machine1-2">
              ID Writing
          
            </td>
         
          </tr>
        </tbody>
      </table>

     <div id="cam_live_boxrow1">
  <div id="cam_live_boxrow1_1" className="cam_live_engineBox" style={{border:"1px solid black"}}></div>
  <div id="cam_live_boxrow1_2" className="cam_live_engineBox"  style={{marginLeft: "11%", border:"1px solid black"}}></div>
  <div id="cam_live_boxrow1_3" className="cam_live_engineBox"  style={{marginLeft: "4.5%", border:"1px solid black"}}></div>
  <div id="cam_live_boxrow1_4" className="cam_live_engineBox"  style={{marginLeft: "11%", border:"1px solid black"}}></div>
</div>
   
      <div id="cam_live_boxrow2">
  <div id="cam_live_boxrow2_1" className="cam_live_engineBox"  style={{border:"1px solid black"}}></div>
</div>
        <table>
        <tbody>
          <tr id="cam_live_row4">
             <td id="cam_live_man2-1">
              <img src={Man} alt="man" width="36" height="36" style={{ marginTop: "1px", marginLeft: "35px" }} id='cam_live_man21'/>
              <span style={{ marginTop: "10px" }}>D4 lifter guide</span>
            </td>
             <td id="cam_live_B2-1">
              <img src={B} alt="B" width="40" height="40" style={{ marginLeft: "14px", marginTop: "10px" }} id='cam_live_b21'/>
            </td>
                 <td id="cam_live_man2-2">
              <img src={Man} alt="man" width="36" height="36" style={{ marginTop: "1px", marginLeft: "35px" }}id='cam_live_man22' />
              <span style={{ marginTop: "10px" }}>VVT</span>
            </td>
             <td id="cam_live_B2-2">
              <img src={B} alt="B" width="40" height="40" style={{ marginLeft: "14px", marginTop: "10px" }} id='cam_live_b22' />
            </td>
            <td id="cam_live_machine2-1">
             VVT Vision
            </td>
            
            <td id="cam_live_B2-3">
              <img src={B} alt="B" width="40" height="40" style={{ marginLeft: "14px", marginTop: "10px" }} id='cam_live_b23'/>
            </td>
         
            <td id="cam_live_B2-4">
              <span style={{
                display:"flex",
               justifyContent: "center",
               alignItems: "center",
               marginTop: "10px",
               backgroundColor: "rgba(251,243,225)",
               padding: "6px",
               border: "2px solid orange"
              }} id='cam_live_b24'>C/H</span>
            </td>
            <td style={{
              height:"50px",
              marginTop: "65px",
              marginLeft: "-55px"
              }}  id='cam_live_downarrow'><img src={downarrow} alt="downarrow" width="45" height="55"  id='cam_live_downarrow-img'/></td>
            <td style={{
              marginLeft:"9px"
            }} id='cam_live_uparrow'><img src={uparrow} alt="uparrow" width="45" height="100"  id='cam_live_uparrow-img'/></td>
          </tr>
        </tbody>
      </table>

      </div>
    </div>
    </>

  );
};

export default Golive;
