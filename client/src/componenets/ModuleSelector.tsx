import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

export default function ModuleSelector() {
  const navigate = useNavigate();
  const location = useLocation();

  const getModuleFromPath = () => {
  const path = location.pathname.toLowerCase(); // lowercase

  if (path.includes("head")) return "Head Traceability";
  if (path.includes("cam")) return "Cam-housing";
  if (path.includes("block")) return "Block-firewall";
  if (path.includes("piston")) return "Piston-firewall";
  if (path.includes("/main")) return "Main"; // check main before et
  if (path.includes("et")) return "ET-final gate";

  return "Head Traceability";
};

  const selectedModule = getModuleFromPath();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    if (value === "Head Traceability") navigate("/headsettings");
    if (value === "Cam-housing") navigate("/camsettings");
    if (value === "Block-firewall") navigate("/blocksettings");
    if (value === "Piston-firewall") navigate("/pistonsettings");
    if (value === "Main") navigate("/main_settings");
    if (value === "ET-final gate") navigate("/et_settings");
    
  };

  return (
    <div className="module-selector">
      <label className="module-label">Select Module:</label>

      <select
        className="module-dropdown"
        value={selectedModule}
        onChange={handleChange}
      >
        <option value="Block-firewall">Block-firewall</option>
        <option value="Piston-firewall">Piston-firewall</option>
        <option value="Head Traceability">Head Traceability</option>
        <option value="Cam-housing">Cam-housing</option>
        <option value="Main">Main</option>
        <option value="ET-final gate">ET-final gate</option>
      </select>
    </div>
  );
}