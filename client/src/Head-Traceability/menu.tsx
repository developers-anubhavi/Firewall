import '../Head-Traceability/menu.css';

import { useNavigate } from 'react-router-dom';

interface MenuProps {
  setShowMenu: (value: boolean) => void;
}
const Menu: React.FC<MenuProps> = ({ setShowMenu }) => {
  const navigate = useNavigate();
  return (
    <div
      className="menu_overlay"
      onMouseEnter={() => setShowMenu(true)}    
      onMouseLeave={() => setShowMenu(false)}   
    >
      <div className="menu_modal">

       {/* <div className="menu_header">
          <span id="menu_hf">Head Firewall</span>
           <span id="menu_title">Menu</span>
        </div>  */}

        <div className="menu_content">
          <ul>
            <li onClick={() => navigate("/block-firewall")}>Block Firewall</li>
            <li onClick={() => navigate("/piston-firewall")}>Piston Firewall</li>
             <li onClick={() => navigate("/head-traceability")}>Head Firewall</li>
            <li onClick={() => navigate("/cam-housing")}>Cam-HSG Firewall</li>
            <li onClick={() => navigate("/Main")}>Mainline</li>
            <li onClick={() => navigate("/et_finalgate")}>ET Final Gate</li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default Menu;