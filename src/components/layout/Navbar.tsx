import { useContext } from "react";
import { FaBars, FaMoon, FaGlobe, FaUserCircle, FaSun } from "react-icons/fa";
import { AppContext } from "../../context/AppContext";

interface NavbarProps {
  onToggle: () => void;
}

const Navbar = ({ onToggle }: NavbarProps) => {
  const { mode, toggleMode } = useContext(AppContext);
  
  return (
    <nav style={mode === 'light' ? {backgroundColor:'white', color:'black'}:{backgroundColor:'black',color:'white'}} className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
      <button
        className="text-2xl text-gray-700 focus:outline-none"
        onClick={onToggle}
      >
        <FaBars />
      </button>
      <div className="flex items-center gap-6">
       {mode === 'light' ? <FaMoon onClick={toggleMode} size={18} className="cursor-pointer" /> : <FaSun onClick={toggleMode} size={18} className="cursor-pointer" />}
        <FaGlobe className="text-gray-600 cursor-pointer" size={18} />
        <FaUserCircle className="text-gray-600 cursor-pointer" size={24} />
      </div>
    </nav>
  );
};

export default Navbar;
