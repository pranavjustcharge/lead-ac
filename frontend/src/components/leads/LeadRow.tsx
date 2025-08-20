import React, { useContext, useState } from "react";
import { FaPlay } from "react-icons/fa";
import ConfirmModal from "../ui/ConfirmModal";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";

type LeadRowProps = {
  reference: string;
  name: string;
  email: string;
  id: string;
};

const LeadRow: React.FC<LeadRowProps> = ({ reference, name, email,id }) => {
  const { setLeadId } = useContext(AppContext);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const handleConfirm = () => {
    setShowModal(false);
    setLeadId(id);
    navigate(`/call-manager/${reference}`);
  };

  return (
    <>
      <tr
        className="border-t border-gray-300 hover:bg-gray-100 cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        <td className="p-3 text-blue-600">{reference}</td>
        {/* <td className="p-3">Social Media Campaign</td> */}
        <td className="p-3">{name}</td>
        <td className="p-3">{email}</td>
        <td className="p-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowModal(true);
            }}
            className="bg-blue-500 text-white p-2 rounded"
          >
            <FaPlay size={12} />
          </button>
        </td>
      </tr>

      <ConfirmModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirm}
        message={'Are you sure you want to resume this lead?'}
      />
    </>
  );
};

export default LeadRow;
