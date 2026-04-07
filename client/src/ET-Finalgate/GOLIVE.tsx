import '../ET-Finalgate/GOLIVE.css';

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
    const res = await axios.get("http://192.168.0.20:4001/api/et_top-engines");
    if (!res.data.success) return;

    const data = res.data.data;

    setTimeout(() => {
const engineBoxIds = [
  "et_live_boxrow1_1",
  "et_live_boxrow1_2",
  "et_live_boxrow1_3",
  "et_live_boxrow1_4",
  "et_live_boxrow1_5",
  "et_live_boxrow1_6",
  "et_live_boxrow2_3",
  "et_live_boxrow2_2",
  "et_live_boxrow2_1"
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
        <div className="et_live_overlay" onClick={closeOverlay}>
      <div className="et_live_modal" onClick={(e) => e.stopPropagation()}>

        <button className="et_live_close_btn" onClick={closeOverlay}>X</button>

        <span id='et_live_title'>ET FINAL GATE</span>
        <img src={live} alt="live" width="50px" height="50px" />
        <table>
        <tbody>
            <tr id="et_live_row3">
            <td id="et_live_machine1-6">
              ID Writing
            </td>
            <td id="et_live_man-1">
              Masking
              <img src={Man} alt="man" width="45" height="45" style={{ marginTop: "15px", marginLeft: "15px" }}  id='et_live_man1' />
            </td>
             <td id="et_live_machine1-5">
              Oil leak test
            </td>
             <td id="et_live_machine1-4">
              Injector Mov
            </td>
             <td id="et_live_machine1-3">
              Water leak testing
            </td>
              <td id="et_live_B-1">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='et_live_b1' />
            </td>
            <td id="et_live_man-2">
              Visual Check
              <img src={Man} alt="man" width="45" height="45" style={{ marginTop: "15px", marginLeft: "15px" }}  id='et_live_man2' />
            </td>
             <td id="et_live_machine1-2">
              Oil filling
            </td>
            <td id="et_live_man-3">
              Face plate assy
              <img src={Man} alt="man" width="45" height="45" style={{ marginTop: "15px", marginLeft: "15px" }}  id='et_live_man3' />
            </td>
             <td id="et_live_man-4">
              Harness Assy
              <img src={Man} alt="man" width="45" height="45" style={{ marginTop: "4px", marginLeft: "18px" }} id='et_live_man4' />
            </td>
            <td id="et_live_B-2">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px"}} id='et_live_b2' />
            </td>
            <td id="et_live_machine1-1">
              MTB-1
            </td>
            <td id="et_live_B-3">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px"}} id='et_live_b3' />
            </td>
            
          </tr>
        </tbody>
      </table>

     <div id="et_live_boxrow1">
  <div id="et_live_boxrow1_1" className="et_engineBox" style={{border:"1px solid black"}}></div>
  <div id="et_live_boxrow1_2" className="et_engineBox"  style={{marginLeft: "5.5%", border:"1px solid black"}}></div>
  <div id="et_live_boxrow1_3" className="et_engineBox"  style={{marginLeft: "0%", border:"1px solid black"}}></div>
  <div id="et_live_boxrow1_4" className="et_engineBox"  style={{marginLeft: "0%", border:"1px solid black"}}></div>
  <div id="et_live_boxrow1_5" className="et_engineBox"  style={{marginLeft: "10%", border:"1px solid black"}}></div>
  <div id="et_live_boxrow1_6" className="et_engineBox"  style={{marginLeft: "16%", border:"1px solid black"}}></div>
</div>
   
      <div id="et_live_boxrow2">
  <div id="et_live_boxrow2_1" className="et_engineBox"  style={{border:"1px solid black"}}></div>
  <div id="et_live_boxrow2_2" className="et_engineBox" style={{marginLeft: "6%", border:"1px solid black"}}></div>
  <div id="et_live_boxrow2_3" className="et_engineBox" style={{marginLeft: "27%", border:"1px solid black"}}></div>
</div>
        <table>
        <tbody>
          <tr id="et_live_row4">
            <td id="et_live_B2-1">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='et_live_b21'/>
            </td>
            <td id="et_live_B2-2">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='et_live_b22' />
            </td>
              <td id="et_live_B2-3">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='et_live_b23' />
            </td>
              <td id="et_live_B2-4">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='et_live_b24' />
            </td>
            <td id="et_live_machine2-1">
             Final Vision check
            </td>
             <td id="et_live_B2-5">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='et_live_b25' />
            </td>
             <td id="et_live_machine2-2">
            Engine labelling
            </td>
              <td id="et_live_B2-6">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='et_live_b26' />
            </td>
             <td id="et_live_man2-1">
              <span style={{ marginTop: "5px" }}>Gauge check</span>
              <img src={Man} alt="man" width="42" height="42" style={{ marginTop: "1px", marginLeft: "15px" }} id='et_live_man21'/>
            </td>
            <td id="et_live_man2-2">
              <span style={{ marginTop: "5px" }}>Harness Dis-assy</span>
              <img src={Man} alt="man" width="42" height="42" style={{ marginTop: "1px", marginLeft: "15px" }} id='et_live_man22'/>
            </td>
            <td id="et_live_B2-7">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='et_live_b27' />
            </td>
            <td id="et_live_machine2-3">
             MTB-2
            </td>
              <td id="et_live_B2-8">
              <img src={B} alt="B" width="42" height="42" style={{ marginLeft: "4px", marginTop: "4px" }} id='et_live_b28' />
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
