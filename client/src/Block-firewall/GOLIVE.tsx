import '../Block-firewall/GOLIVE.css';

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
    const res = await axios.get("http://192.168.0.20:4001/api/block_top-engines");
    if (!res.data.success) return;

    const data = res.data.data;

    setTimeout(() => {
const engineBoxIds = [
  "block_live_boxrow1_1",
  "block_live_boxrow1_2",
  "block_live_boxrow1_5",
  "block_live_boxrow1_6",
  "block_live_boxrow1_7",
  "block_live_boxrow2_1",
  "block_live_boxrow2_2",
  "block_live_boxrow2_3"
];

engineBoxIds.forEach((id, index) => {
  const box = document.getElementById(id);
  if (box && data[index]) {
    box.innerHTML = `
      <div class="engineNo">${data[index].ENGINE_NO || ""}</div>
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
        <div className="block_live_overlay" onClick={closeOverlay}>
      <div className="block_live_modal" onClick={(e) => e.stopPropagation()}>

        <button className="block_live_close_btn" onClick={closeOverlay}>X</button>

        <span id='block_live_title'>BLOCK FIREWALL </span>
        <img src={live} alt="live" width="50px" height="50px" />
        <table>
        <tbody>
          <tr id="block_live_row3">
            <td id="block_live_man-1">
              D4 Fuel Pipe Assy
              <img src={Man} alt="man" width="45" height="45" style={{ marginTop: "15px", marginLeft: "15px" }}  id='block_live_man1' />
            </td>
             <td id="block_live_machine1-9">
              Crank Cap Nut runner
            </td>
            <td id="block_live_man-2">
              D4 Fuel Pipe Assy
              <img src={Man} alt="man" width="45" height="45" style={{ marginTop: "15px", marginLeft: "15px" }}  id='block_live_man2' />
            </td>
            <td id="block_live_man-3">
              D4 Fuel Pipe Assy
              <img src={Man} alt="man" width="45" height="45" style={{ marginTop: "15px", marginLeft: "15px" }}  id='block_live_man3' />
            </td>
             <td id="block_live_machine1-8">
              Journal Oiling
            </td>
             <td id="block_live_machine1-7">
              Crank Shaft assy.
            </td>
            <td id="block_live_B-1">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='block_live_b1' />
            </td>
             <td id="block_live_machine1-6">
              Top Bearing assy.
            </td>
            <td id="block_live_B-2">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px"}} id='block_live_b2' />
            </td>
            <td id="block_live_machine1-5">
              Bottom Bearing assy.
            </td>
            <td id="block_live_man-4">
              Spring Assy
              <img src={Man} alt="man" width="42" height="42" style={{ marginTop: "4px", marginLeft: "18px" }} id='block_live_man4' />
            </td>
            <td id="block_live_man-5">
              Spring seat Assy
              <img src={Man} alt="man" width="42" height="42" style={{ marginTop: "4px", marginLeft: "18px" }}  id='block_live_man5'/>
            </td>
            <td id="block_live_machine1-4">
              Metal Rank
            </td>
             <td id="block_live_machine1-3">
              ID Writing
            </td>
            <td id="block_live_B-3">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }}  id='block_live_b3'/>
            </td>
            <td id="block_live_machine1-2">
              Engine No. Label
            </td>
             <td id="block_live_machine1-1">
              Engine No. Engraving
            </td>
            <td id="block_live_B-4">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='block_live_b4'/>
            </td>
            <td id="block_live_B-5">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='block_live_b5'/>
            </td>
          </tr>
        </tbody>
      </table>

     <div id="block_live_boxrow1">
  <div id="block_live_boxrow1_1" className="block_engineBox" style={{border:"1px solid black"}}></div>
  <div id="block_live_boxrow1_2" className="block_engineBox"  style={{marginLeft: "11%", border:"1px solid black"}}></div>
  <div id="block_live_boxrow1_3" className="block_engineBox"  style={{marginLeft: "4.5%", border:"1px solid black"}}></div>
  <div id="block_live_boxrow1_4" className="block_engineBox"  style={{marginLeft: "11%", border:"1px solid black"}}></div>
  <div id="block_live_boxrow1_5" className="block_engineBox"  style={{marginLeft: "0%", border:"1px solid black"}}></div>
  <div id="block_live_boxrow1_6" className="block_engineBox"  style={{marginLeft: "4.1%", border:"1px solid black"}}></div>
  <div id="block_live_boxrow1_7" className="block_engineBox"  style={{marginLeft: "0%", border:"1px solid black"}}></div>
</div>
   
      <div id="block_live_boxrow2">
  <div id="block_live_boxrow2_1" className="block_engineBox"  style={{border:"1px solid black"}}></div>
  <div id="block_live_boxrow2_2" className="block_engineBox" style={{marginLeft: "23.2%", border:"1px solid black"}}></div>
  <div id="block_live_boxrow2_3" className="block_engineBox" style={{marginLeft: "4.4%", border:"1px solid black"}}></div>
</div>
        <table>
        <tbody>
          <tr id="block_live_row4">
          
            <td id="block_live_machine2-1">
-              BS-PS Collation
            </td>
            <td id="block_live_B2-1">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='block_live_b21'/>
            </td>
             <td id="block_live_man2-1">
              <span style={{ marginTop: "5px" }}>Piston Assy</span>
              <img src={Man} alt="man" width="42" height="42" style={{ marginTop: "1px", marginLeft: "15px" }} id='block_live_man21'/>
            </td>
            <td id="block_live_man2-2">
              <span style={{ marginTop: "5px" }}>Con Rod Assy</span>
              <img src={Man} alt="man" width="42" height="42" style={{ marginTop: "1px", marginLeft: "15px" }} id='block_live_man22'/>
            </td>
            <td id="block_live_B2-2">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='block_live_b22' />
            </td>
              <td id="block_live_B2-3">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='block_live_b23' />
            </td>
            <td id="block_live_machine2-2">
-              Conrod Nut-runner
            </td>
              <td id="block_live_B2-4">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='block_live_b24' />
            </td>
          
            <td id="block_live_machine2-3">
              Piston Collation
            </td>
             <td id="block_live_man2-3">
              <span style={{ marginTop: "5px" }}>Visual Check</span>
              <img src={Man} alt="man" width="42" height="42" style={{ marginTop: "1px", marginLeft: "15px" }} id='block_live_man23'/>
            </td>
              <td id="block_live_B2-5">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='block_live_b25' />
            </td>
            <td id="block_live_man2-4">
              <span style={{ marginTop: "5px" }}>PCV Assy</span>
              <img src={Man} alt="man" width="42" height="42" style={{ marginTop: "1px", marginLeft: "15px" }} id='block_live_man24'/>
            </td>
             <td id="block_live_B2-6">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='block_live_b26'/>
            </td>

              <td id="block_live_man2-5">
              <span style={{ marginTop: "5px" }}>Crank Case Tightening</span>
              <img src={Man} alt="man" width="42" height="42" style={{ marginTop: "1px", marginLeft: "15px" }} id='block_live_man25'/>
            </td>
             <td id="block_live_B2-7">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='block_live_b27'/>
            </td>
              <td id="block_live_man2-6">
                <span style={{ marginTop: "5px" }}>FIPG cleaning</span>
              <img src={Man} alt="man" width="42" height="42" style={{ marginTop: "1px", marginLeft: "15px" }} id='block_live_man26'/>
            </td>
            <td id="block_live_B2-8">
              <span style={{
                display:"flex",
               justifyContent: "center",
               alignItems: "center",
               marginTop: "10px",
               backgroundColor: "rgba(251,243,225)",
               padding: "4px",
               border: "2px solid orange",borderRadius:"5px"
              }} id='block_b24'>C/B</span>
            </td>
            <td style={{
              height:"60px",
              marginTop: "60px",
              marginLeft: "-40px",
              borderRadius: "5px"
              }}  id='block_live_downarrow'><img src={downarrow} alt="downarrow" width="34" height="66"  id='block_live_downarrow-img'/></td>
            <td style={{
              marginLeft:"6px",borderRadius: "5px"
            }} id='block_live_uparrow'><img src={uparrow} alt="uparrow" width="34" height="100"  id='block_live_uparrow-img'/></td>
          </tr>
        </tbody>
      </table>
    <div id="block_live_crankcase">CrankCase FIPG</div>
    <div id="block_live_boxrow2_4" className="block_engineBox" style={{border:"1px solid black"}}></div>

      </div>
    </div>
    </>

  );
};

export default Golive;
