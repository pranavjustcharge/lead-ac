import React, { useContext, useEffect, useState } from "react";
import { FaPhone, FaFileAlt, FaRegClock } from "react-icons/fa";
import { IoDocumentTextSharp, IoChevronDownSharp } from "react-icons/io5";
import { FaAngleRight } from "react-icons/fa6";
import { GoArrowLeft } from "react-icons/go";
import { IoCallOutline } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import { AppContext } from "../context/AppContext";
import ActionModal from "../components/ui/ActionModal";
import CallLogs from "../components/leads/CallLogs";
import NotesSection from "../components/leads/Notes";
import LeadDetailsForm from "../components/leads/LeadDetails";

interface Tab {
  name: string;
  icon: React.ReactNode;
}

interface FormData {
  referenceNumber: string;
  leadStatus: string;
  firstName: string;
  lastName: string;
  email: string;
  website: string;
  phone: string;
  alternativeNumber: string;
  notes: string;
  companyName: string;
  softwareName: string;
  typeofLead: string;
  budget: string;
  duration: string;
}

interface LeadData extends FormData {}

const CallManager: React.FC = () => {
  const { leadId, setLeadId, leads } = useContext(AppContext);
  const [leadData, setLeadData] = useState<LeadData | null>(null);
  const [formData, setFormData] = useState<FormData>({
    referenceNumber: "",
    leadStatus: "",
    firstName: "",
    lastName: "",
    email: "",
    website: "",
    phone: "",
    notes: "",
    alternativeNumber: "",
    companyName: "",
    softwareName: "",
    typeofLead: "",
    budget: "",
    duration: "",
  });

  const [leadHistory, setLeadHistory] = useState<any[]>([]);
  const [leadHistoryPage, setLeadHistoryPage] = useState(1);
  const leadHistoryItemsPerPage = 5;
  const leadHistoryTotalPages = Math.ceil(leadHistory.length / leadHistoryItemsPerPage);
  const leadHistoryStartIdx = (leadHistoryPage - 1) * leadHistoryItemsPerPage;
  const leadHistoryEndIdx = leadHistoryStartIdx + leadHistoryItemsPerPage;
  const paginatedLeadHistory = leadHistory.slice(leadHistoryStartIdx, leadHistoryEndIdx);
  const [activeTab, setActiveTab] = useState("Lead Details");
  const [leadDetailsOpen, setLeadDetailsOpen] = useState(true);
  const [campaignDetailsOpen, setCampaignDetailsOpen] = useState(false);
  const [modalType, setModalType] = useState<"followUp" | "leadBooking" | null>(null);
  const [loading, setLoading] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const { reference } = useParams();
  const currentIndex = leads.findIndex((lead) => lead.id === leadId);


  const getUserDetailsByLeadID = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/lead/get/${leadId}`);
      setLeadData(res.data.data);
    } catch (err) {
      console.error("Error fetching lead:", err);
    } finally {
      setLoading(false);
    }
  };

  
  const getUserLeadHistory = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/histories/${leadId}`);
      const history = res.data.data[0]?.actions || [];
      const sorted = history.sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setLeadHistory(sorted);
    } catch (err) {
      console.error("Unable to fetch history:", err);
      setLeadHistory([]);
    }
  };

  const handleLeadHistoryPrev = () => {
    if (leadHistoryPage > 1) setLeadHistoryPage((prev) => prev - 1);
  };

  const handleLeadHistoryNext = () => {
    if (leadHistoryPage < leadHistoryTotalPages) setLeadHistoryPage((prev) => prev + 1);
  };

  const handlePreviousLead = () => {
    if (currentIndex > 0) {
      const prev = leads[currentIndex - 1];
      setLeadId(prev.id);
      navigate(`/call-manager/${prev.referenceNumber}`);
    }
  };

  const handleNextLead = () => {
    if (currentIndex < leads.length - 1) {
      const next = leads[currentIndex + 1];
      setLeadId(next.id);
      navigate(`/call-manager/${next.referenceNumber}`);
    }
  };

  const openModal = (type: "followUp" | "leadBooking") => setModalType(type);
  const closeModal = () => setModalType(null);

  const formatTime = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const min = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${hrs.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateSave = async () => {
    try {
      const payload = {
        ...formData,
        tenantId: "random1234",
        salary_occupation: "Software Developer",
        createdBy: "Admin",
        updatedBy: "Admin",
      };
      const res = await axios.put(`${backendUrl}/api/lead/update/${leadId}`, payload);
      if (res.data.success) {
        toast.success(res.data.message);
        getUserLeadHistory();
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleUpdateSaveExit = async () => {
    try {
      const payload = {
        ...formData,
        tenantId: "random1234",
        salary_occupation: "Software Developer",
        createdBy: "Admin",
        updatedBy: "Admin",
      };
      const res = await axios.put(`${backendUrl}/api/lead/update/${leadId}`, payload);
      if (res.data.success) {
        toast.success(res.data.message);
        getUserLeadHistory();
        navigate('/leads');
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };


  useEffect(() => {
    getUserDetailsByLeadID();
    getUserLeadHistory();
    setLeadHistoryPage(1);
  }, [leadId]);

  useEffect(() => {
    if (leadData) {
      setFormData({
        ...formData,
        ...leadData,
      });
    }
  }, [leadData]);

  useEffect(() => {
    const timer = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const tabs: Tab[] = [
    { name: "Lead Details", icon: <IoDocumentTextSharp size={14} /> },
    { name: "Call Logs", icon: <FaPhone size={14} /> },
    { name: "Notes", icon: <FaFileAlt size={14} /> },
  ];

  return (
    <div className="h-screen w-full flex flex-col font-sans text-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-300 bg-white">
        <div>
          <div className="flex gap-2 items-center">
            <GoArrowLeft className="cursor-pointer" onClick={() => navigate(-1)} size={20} />
            <h2 className="text-base sm:text-xl text-red-500 lg:font-bold">{reference}</h2>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Dashboard - Call Manager - <b>Social Media Campaign</b>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePreviousLead}
            className="bg-orange-300 cursor-pointer text-white px-3 py-2 rounded-md text-xs"
          >
            ← Previous Lead
          </button>
          <button
            onClick={handleNextLead}
            className="bg-green-500 cursor-pointer text-white px-3 py-2 rounded-md text-xs"
          >
            Next Lead →
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-full w-full">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-4 text-blue-500 font-medium">Loading lead data...</span>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row flex-1">
          {/* Sidebar */}
          <div className="w-full md:w-1/4 border-r border-gray-300 p-4 bg-white space-y-4 overflow-y-auto">
            <div className="flex items-center justify-center gap-2 text-3xl font-medium">
              <FaRegClock />
              <span>{formatTime(callDuration)}</span>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-3 lg:mt-6">
              <button
                onClick={() => openModal("followUp")}
                className="bg-blue-400 text-white px-3 py-1 cursor-pointer rounded-md text-xs"
              >
                Lead Follow Up
              </button>
              <button
                onClick={() => openModal("leadBooking")}
                className="bg-blue-400 text-white px-3 py-1 cursor-pointer rounded-md text-xs"
              >
                Lead Booking
              </button>
            </div>
            <div className="border-t border-gray-300 pt-6">
              <h3
                onClick={() => setLeadDetailsOpen(!leadDetailsOpen)}
                className="flex items-center cursor-pointer gap-1 text-lg mb-2"
              >
                {leadDetailsOpen ? <IoChevronDownSharp size={14} /> : <FaAngleRight size={14} />} Lead Details
              </h3>
              {leadDetailsOpen && (
                <div className="space-y-2 text-sm px-2">
                  <p>Lead Number<br />16 / 78</p>
                  <p>Last Actioner<br />Admin</p>
                  <p>Follow Up<br />Manager on 19-07-2025</p>
                  <p>Salesman Booking<br />Herbert Aufderhar on 28-07-2025</p>
                </div>
              )}
            </div>
            <div>
              <h3
                onClick={() => setCampaignDetailsOpen(!campaignDetailsOpen)}
                className="flex items-center cursor-pointer border-t border-gray-300 pt-6 gap-1 text-lg mb-2"
              >
                {campaignDetailsOpen ? <IoChevronDownSharp size={14} /> : <FaAngleRight size={14} />} Campaign Details
              </h3>
            </div>
          </div>

          {/* Main Form Section */}
          <div className="flex-1 px-4 py-4 overflow-auto bg-white">
            <div className="flex border-b border-gray-300 mb-4 flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`px-3 py-2 flex items-center gap-1 border-b-2 ${
                    activeTab === tab.name
                      ? "border-blue-400 text-blue-400 font-medium"
                      : "border-transparent text-gray-600"
                  }`}
                >
                  {tab.icon} {tab.name}
                </button>
              ))}
            </div>

            {activeTab === "Lead Details" && (
              <LeadDetailsForm
                formData={formData}
                handleChange={handleChange}
                handleUpdateSave={handleUpdateSave}
                handleUpdateSaveExit={handleUpdateSaveExit}
              />
            )}

            {activeTab === "Call Logs" && <CallLogs callLogs={[]} />}
            {activeTab === "Notes" && <NotesSection getUserLeadHistory={getUserLeadHistory} />}
          </div>

          {/* Right Lead History Panel */}
          <div className="w-full md:w-[380px] border-l border-gray-300 px-4 py-4 bg-white overflow-y-auto">
            <h3 className="text-green-600 lg:text-lg border-b border-gray-300 pb-4 mb-3">
              Lead History
            </h3>
            <ul className="space-y-3 text-sm lg:text-md">
              {paginatedLeadHistory.length > 0 ? (
                paginatedLeadHistory.map((item, idx) => (
                  <li key={idx} className="flex flex-col pb-2">
                    <div className="flex items-start gap-2">
                      <IoCallOutline className="text-blue-600 mt-1" />
                      <p className="ml-2 text-gray-700 leading-snug">{item.details}</p>
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-center text-gray-500">No history found.</p>
              )}
            </ul>

            {leadHistoryTotalPages > 1 && (
              <div className="flex justify-center items-center mt-4 space-x-2 text-sm">
                <button
                  onClick={handleLeadHistoryPrev}
                  disabled={leadHistoryPage === 1}
                  className={`px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 ${
                    leadHistoryPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Prev
                </button>
                <span className="text-gray-700">
                  Page {leadHistoryPage} of {leadHistoryTotalPages}
                </span>
                <button
                  onClick={handleLeadHistoryNext}
                  disabled={leadHistoryPage === leadHistoryTotalPages}
                  className={`px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 ${
                    leadHistoryPage === leadHistoryTotalPages ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <ActionModal
        isOpen={modalType !== null}
        type={modalType}
        onClose={closeModal}
        getUserLeadHistory={getUserLeadHistory}
      />
    </div>
  );
};

export default CallManager;
