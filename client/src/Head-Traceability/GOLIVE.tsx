import '../Head-Traceability/GOLIVE.css';

import { useEffect } from 'react';

import axios from 'axios';

import B from '../assets/B.png';
import downarrow from '../assets/dotted down arrow.png';
import uparrow from '../assets/dotted up arrow.png';
import live from '../assets/live.gif';
import Machine from '../assets/Machine.png';
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
    const res = await axios.get("http://192.168.0.20:4001/api/top-engines");
    if (!res.data.success) return;

    const data = res.data.data;

    setTimeout(() => {

      for (let i = 0; i < 5; i++) {
        const box = document.getElementById(`live_boxrow1_${i + 1}`);
        if (box && data[i]) {
          box.innerHTML = `
            <div class="engineNo">${data[i].ENGINE_NO || ""}</div>
            <div class="engineCode">${data[i].ENGINE_CODE || ""}</div>
          `;
        }
      }

      for (let i = 5; i < 10; i++) {
        const box = document.getElementById(`live_boxrow2_${i - 4}`);
        if (box && data[i]) {
          box.innerHTML = `
            <div class="engineNo">${data[i].ENGINE_NO || ""}</div>
            <div class="engineCode">${data[i].ENGINE_CODE || ""}</div>
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

        <span id='title'>HEAD FIREWALL </span>
        <img src={live} alt="live" width="50px" height="50px" />
        <table>
        <tbody>
          <tr id="live_row3">
            <td id="live_man-1" >
              D4 Fuel Pipe Assy
              <img src={Man} alt="man" width="60" height="60" style={{ marginTop: "22px", marginLeft: "15px" }}  id='live_man1' />
            </td>
            <td id="live_B-1">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "8px" }} id='live_b1' />
            </td>
            <td id="live_B-2">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "8px"}} id='live_b2' />
            </td>
            <td id="live_machine1-5">
              Cotter/ Retainer Insp
              <img src={Machine} alt="machine" width="40" height="40" style={{ marginTop: "30px", marginLeft: "20px" }} id='live_machine5'  />
            </td>
            <td id="live_B-3">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "8px" }}  id='live_b3'/>
            </td>
            <td id="live_machine1-4">
              Cotter/ Retainer Assy
              <img src={Machine} alt="machine" width="40" height="40" style={{ marginTop: "8px", marginLeft: "20px" }}  id='live_machine4'/>
            </td>
            <td id="live_man-2">
              Spring Assy
              <img src={Man} alt="man" width="60" height="60" style={{ marginTop: "25px", marginLeft: "18px" }} id='live_man2' />
            </td>
            <td id="live_man-3">
              Spring seat Assy
              <img src={Man} alt="man" width="60" height="60" style={{ marginTop: "4px", marginLeft: "18px" }}  id='live_man3'/>
            </td>
            <td id="live_man-4">
              Value Assy
              <img src={Man} alt="man" width="60" height="60" style={{ marginTop: "27px", marginLeft: "18px" }}id='live_man4' />
            </td>
            <td id="live_B-4">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "8px" }}  id='live_b4'/>
            </td>
            <td id="live_machine1-3">
              Steam oil seal Insp
              <img src={Machine} alt="machine" width="40" height="50" style={{ marginTop: "29px", marginLeft: "21px" }} id='live_machine3'/>
            </td>
            <td id="live_machine1-2">
              Steam oil seal Assy
              <img src={Machine} alt="machine" width="40" height="50" style={{ marginTop: "29px", marginLeft: "21px" }}  id='live_machine2'/>
            </td>
            <td id="live_B-5">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "8px" }} id='live_b5'/>
            </td>
            <td id="live_machine1-1">
              ID writing
              <img src={Machine} alt="machine" width="40" height="50" style={{ marginTop: "52px", marginLeft: "21px" }} id='live_machine1' />
            </td>
          </tr>
        </tbody>
      </table>

       <div id="live_boxrow1">
  <div id="live_boxrow1_1" className="engineBox"></div>
  <div id="live_boxrow1_2" className="engineBox"  style={{marginLeft: "6%"}}></div>
  <div id="live_boxrow1_3" className="engineBox"  style={{marginLeft: "29%"}}></div>
  <div id="live_boxrow1_4" className="engineBox"  style={{marginLeft: "0.1%"}}></div>
  <div id="live_boxrow1_5" className="engineBox"  style={{marginLeft: "6%"}}></div>
</div>

         <div id="live_boxrow2">
  <div id="live_boxrow2_1" className="engineBox"></div>
  <div id="live_boxrow2_2" className="engineBox" style={{marginLeft: "10.9%"}}></div>
  <div id="live_boxrow2_3" className="engineBox" style={{marginLeft: "5.4%"}}></div>
  <div id="live_boxrow2_4" className="engineBox" style={{marginLeft: "5.4%"}}></div>
  <div id="live_boxrow2_5" className="engineBox" style={{marginLeft: "13.3%"}}></div>
</div>
        <table>
        <tbody>
          <tr id="live_row4">
            <td id="live_man2-1">
              <img src={Man} alt="man" width="60" height="60" style={{ marginTop: "0px", marginLeft: "12px" }} id='live_man21' />
              <span style={{ marginTop: "-8px" }}>Low Pres Fuel Pipe Assy</span>
            </td>
            <td id="live_machine2-1">
              <img src={Machine} alt="machine" width="40" height="50" style={{ marginTop: "10px", marginLeft: "21px" }}  id='live_machine21'/>
              Plug Tube Press Fit
            </td>
            <td id="live_B2-1">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "8px" }} id='live_b21'/>
            </td>
            <td id="live_B2-2">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "8px" }} id='live_b22' />
            </td>
            <td id="live_machine2-2">
              <img src={Machine} alt="machine" width="40" height="50" style={{ marginTop: "10px", marginLeft: "21px" }}  id='live_machine22'/>
              Spark Plug Tightening
            </td>
            <td id="live_man2-2">
              <img src={Man} alt="man" width="60" height="60" style={{ marginLeft: "4px" }} id='live_man22'/>
            </td>
            <td id="live_machine2-3">
              <img src={Machine} alt="machine" width="40" height="50" style={{ marginTop: "10px", marginLeft: "21px" }}id='live_machine23' />
              Port Leak Tester
            </td>
            <td id="live_man2-3">
              <img src={Man} alt="man" width="60" height="60" style={{ marginLeft: "4px" }}id='live_man23' />
            </td>
            <td id="live_machine2-4">
              <img src={Machine} alt="machine" width="40" height="50" style={{ marginTop: "10px", marginLeft: "21px" }} id='live_machine24'/>
              Fuel Leak Tester
            </td>
            <td id="live_man2-4">
              <img src={Man} alt="man" width="60" height="60" style={{ marginTop: "1px", marginLeft: "15px" }} id='live_man24'/>
              <span style={{ marginTop: "10px" }}>End cap</span>
            </td>
            <td id="live_man2-5">
              <img src={Man} alt="man" width="60" height="60" style={{ marginTop: "1px", marginLeft: "15px" }}  id='live_man25'/>
              <span style={{ marginTop: "10px" }}>Lash Adjuster</span>
            </td>
            <td id="live_machine2-5">
              <img src={Machine} alt="machine" width="40" height="40" style={{ marginTop: "10px", marginLeft: "21px" }}id='live_machine25' />
              End Cap Vision System
            </td>
            <td id="live_man2-4">
              <img src={Man} alt="man" width="60" height="60" style={{ marginTop: "1px", marginLeft: "15px" }}id='live_man24' />
              <span style={{ marginTop: "10px" }}>Rocker Arm</span>
            </td>
            <td id="live_B2-3">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "8px" }} id='live_b23'/>
            </td>
            <td id="live_B2-4">
              <span style={{
                display:"flex",
               justifyContent: "center",
               alignItems: "center",
               marginTop: "20px",
               marginLeft:"5px",
               backgroundColor: "rgba(251,243,225)",
               padding: "4px",
               border: "2px solid orange",borderRadius:"5px"
              }} id='live_b24'>C/H</span>
            </td>
            <td style={{
              height:"60px",
              marginTop: "60px",
              marginLeft: "-40px",
              borderRadius: "5px"
              }}  id='live_downarrow'><img src={downarrow} alt="downarrow" width="34" height="66"  id='live_downarrow-img'/></td>
            <td style={{
              marginLeft:"6px",borderRadius: "5px"
            }} id='live_uparrow'><img src={uparrow} alt="uparrow" width="34" height="100"  id='live_uparrow-img'/></td>
          </tr>
        </tbody>
      </table>

      </div>
    </div>
    </>

  );
};

export default Golive;
