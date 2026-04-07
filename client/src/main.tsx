import './Head-Traceability/index.css';
import './camhsgfirewall/index.css';
import './Block-firewall/index.css';
import './Piston-firewall/index.css';

import { StrictMode } from 'react';

import { createRoot } from 'react-dom/client';
import {
  BrowserRouter,
  Route,
  Routes,
} from 'react-router-dom';

import Block_App from './Block-firewall/App';
import Blockkick_io from './Block-firewall/Kick_io';
import Block_login from './Block-firewall/Login';
import Block_Settings from './Block-firewall/Settings';
import Cam_App from './camhsgfirewall/App';
import Camkick_io from './camhsgfirewall/Cam_kick_io';
import Cam_login from './camhsgfirewall/Login';
import Cam_Settings from './camhsgfirewall/Settings';
import ET_App from './ET-Finalgate/App';
import ETKick_io from './ET-Finalgate/ET_kick_io';
import ET_login from './ET-Finalgate/Login';
import ET_Settings from './ET-Finalgate/Settings';
import HeadApp from './Head-Traceability/App';
import HeadKick_io from './Head-Traceability/Kick_io';
import Login from './Head-Traceability/Login';
import Head_Settings from './Head-Traceability/Settings';
import Main from './Main/App';
import MAIN_Login from './Main/Login';
import MAIN_Settings from './Main/Settings';
import Piston_App from './Piston-firewall/App';
import Piston_login from './Piston-firewall/Login';
import Piston_Settings from './Piston-firewall/Settings';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>

        {/* DEFAULT ROUTE */}
        <Route path="/" element={<HeadApp />} />

        {/* HEAD TRACEABILITY */}
        <Route path="/head-traceability" element={<HeadApp />} />
        <Route path="/head-traceability/kick-io" element={<HeadKick_io />} />
        <Route path="/login" element={<Login />} />
        <Route
  path="/headsettings"
  element={
    <Head_Settings
      username="Admin"
      logout={() => console.log("logout")}
      usertype="SUPER ADMIN"
    />
  }
/>

        {/* CAM HOUSING */}
        <Route path="/cam-housing" element={<Cam_App />} />
        <Route path="/camhsgfirewall/Cam_kick_io" element={<Camkick_io />} />
        <Route path="/camlogin" element={<Cam_login />} />
        <Route
  path="/camsettings"
  element={
    <Cam_Settings
      username="Admin"
      logout={() => console.log("logout")}
      usertype="SUPER ADMIN"
    />
  }
/>

        {/*BLOCK-FIREWALL*/}
        <Route path="/block-firewall" element={<Block_App />} />
        <Route path="/block-firewall/kick_io" element={<Blockkick_io />} />
        <Route path="/blocklogin" element={<Block_login />} />
        <Route
  path="/blocksettings"
  element={
    <Block_Settings
      username="Admin"
      logout={() => console.log("logout")}
      usertype="SUPER ADMIN"
    />
  }
/>

        {/*PISTON-FIREWALL*/}
        <Route path="/piston-firewall" element={<Piston_App />} />
        <Route path="/pistonlogin" element={<Piston_login />} />
        <Route path="/pistonsettings" element={<Piston_Settings username="Admin"
      logout={() => console.log("logout")}
      usertype="SUPER ADMIN" />} />
      

        {/*ET-FINAL GATE*/}
        <Route path="/et_finalgate" element={<ET_App />} />
        <Route path="/et_kick_io" element={<ETKick_io />} />
        <Route path="/etlogin" element={<ET_login />} />
        <Route path="/et_settings" element={<ET_Settings username="Admin"
      logout={() => console.log("logout")}
      usertype="SUPER ADMIN" />} />

        {/*MAIN*/}
        <Route path="/Main" element={<Main />} />
        <Route path="/mainlogin" element={<MAIN_Login />} />
        <Route path="/main_settings" element={<MAIN_Settings username="Admin"
      logout={() => console.log("logout")}
      usertype="SUPER ADMIN" />} />

      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
