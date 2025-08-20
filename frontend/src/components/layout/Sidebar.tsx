import React, { useState } from "react";
import { FaUsers, FaRegCopyright, FaPhone,
  FaBullhorn, FaClipboardList, FaCogs, FaRegFolderOpen
} from "react-icons/fa";
import { AiOutlineHome, AiOutlineMail } from "react-icons/ai";

import { IoMdLogOut, IoIosSettings } from "react-icons/io";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import { BiChevronDown } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ expanded }) => {
  const navigate = useNavigate();
  const [show,setShow] = useState(false);
  return (
    <div
      className={`bg-blue-950 fixed  text-white h-screen transition-all duration-300 ease-in-out 
        ${expanded ? "w-[250px]" : "w-[80px]"} flex flex-col`}
    >
      <div className="flex items-center justify-center h-16 shrink-0 border-b border-blue-900">
        <span className="text-4xl">L</span>
        {expanded && <h1 className="text-xl font-bold ml-2">LEADPRO</h1>}
      </div>
      <div
        className={`flex-1 space-y-4 py-4 flex flex-col 
          ${expanded ? "items-start overflow-y-auto pr-2" : "items-center overflow-hidden"}`}
      >
        {/* <MenuItem icon={<AiOutlineHome size={16} />} label="Dashboard" expanded={expanded} />
        <MenuItem icon={<FaRegCopyright size={16} />} label="Products" expanded={expanded} />
        <MenuItem icon={<FaRegCopyright size={16} />} label="Expense Manager" expanded={expanded} /> */}
        {/* {expanded && <div className="px-4 text-xs text-gray-400">User Management</div>}
        <MenuItem icon={<FaUsers size={16} />} label="Staff Members" expanded={expanded} />
        <MenuItem icon={<FaUsers size={16} />} label="Salesmans" expanded={expanded} /> */}

        {expanded && <div className="px-4 text-xs text-gray-400">Lead Management</div>}
        {/* <MenuItem icon={<FaPhone size={16} />} label="Call Manager" expanded={expanded} />
        <MenuItem icon={<FaBullhorn size={16} />} label="Campaigns" expanded={expanded} /> */}
        <div className="flex flex-col gap-4 items-center">
         <div onClick={()=>setShow(p=>!p)} className="flex items-center">
           <MenuItem icon={<FaClipboardList size={16} />} label="Leads & Call" expanded={expanded} />
          {expanded &&  <BiChevronDown/>}
         </div>
          {show && <ul className="space-y-2">
            <li className="cursor-pointer text-xs" onClick={()=>{navigate('/leads');setShow(false)}}>Leads</li>
            <li className="cursor-pointer text-xs">Call Logs</li>
            <li className="cursor-pointer text-xs">Lead Notes</li>
          </ul>}
        </div>
        
        {/* <MenuItem icon={<FaClipboardList size={16} />} label="Lead Follow Up" expanded={expanded} />
        {expanded && <div className="px-4 text-xs text-gray-400">Settings</div>}
        <MenuItem icon={<FaCogs size={16} />} label="Lead Table Fields" expanded={expanded} />
        <MenuItem icon={<AiOutlineMail size={16} />} label="Messaging" expanded={expanded} />
        <MenuItem icon={<FaRegFolderOpen size={16} />} label="Forms" expanded={expanded} />
        <MenuItem icon={<IoIosSettings size={16} />} label="Settings" expanded={expanded} />
        <MenuItem icon={<RiMoneyDollarCircleLine size={16} />} label="Subscriptions" expanded={expanded} />
        <MenuItem icon={<IoMdLogOut size={16} />} label="LogOut" expanded={expanded} /> */}
      </div>
    </div>
  );
};

const MenuItem = ({ icon, label, expanded }) => (
  <div
    className={`flex px-4 py-2 cursor-pointer transition-all duration-200 w-full
      ${expanded ? "justify-start gap-4 items-center" : "justify-center"}`}
  >
    <div className="text-sm">{icon}</div>
    {expanded && <span className="text-sm">{label}</span>}
  </div>
);

export default Sidebar;
