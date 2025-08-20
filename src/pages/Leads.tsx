import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { FaPlay, FaPlus } from "react-icons/fa";
import { IoMdTime } from "react-icons/io";
import { FaRegCopyright, FaChartLine, FaNetworkWired, FaPhone } from "react-icons/fa";
import { BiChevronLeft } from "react-icons/bi";
import { CgChevronRight } from "react-icons/cg";
import LeadRow from "../components/leads/LeadRow";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";


const LeadsPage = () => {
  const navigate = useNavigate();
  const { leads,setLeads } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLeads, setTotalLeads] = useState<number>(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  const backendUrl = import.meta.env.VITE_BACKEND_URL;


  // api called of createLead with paginations
  const getLeads = async (page: number) => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/lead/all/leads?page=${page}&limit=${itemsPerPage}`);
      const { leads, pagination } = res.data.data;

      setLeads(leads);
      setTotalLeads(pagination.total);
      setTotalPages(pagination.totalPages);
      setCurrentPage(pagination.page);
    } catch (error) {
      console.error("Error fetching leads", error);
    } finally {
      setLoading(false);
    }
  };



  const getLeadsByStatus = async (status: string, page: number) => {
    setLoading(true);
    try {
      const res = await axios.post(`${backendUrl}/api/lead/filter/status`, {
        leadStatus: status,
        page,
        limit: itemsPerPage,
      });

      const { leads, totalLeads, currentPage, totalPages } = res.data.data;

      const formattedLeads = leads.map((lead: any) => ({
        referenceNumber: lead.referenceNumber,
        name: `${lead.firstName} ${lead.lastName}`,
        email: lead.email,
        id: lead._id,
      }));

      setLeads(formattedLeads);
      setTotalLeads(totalLeads);
      setTotalPages(totalPages);
      setCurrentPage(currentPage);
    } catch (error) {
      console.error("Error filtering leads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStatus) {
      getLeadsByStatus(selectedStatus, currentPage);
    } else {
      getLeads(currentPage);
    }
  }, [currentPage, selectedStatus]);


  const filteredLeads = leads.filter(lead =>
    lead.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );




  return (
    <div className="min-h-screen p-4 border border-gray-300 mt-4 max-w-[98%] mx-auto bg-gray-50 text-sm text-[#1B1B1B]">
      {/* Tabs */}
      <div className="flex gap-4 mb-4 border-b mt-10 border-gray-300 font-medium flex-wrap">
        <div className="flex items-center gap-2 text-blue-600 border-b-2 border-blue-600 pb-1 cursor-pointer">
          <FaPlay className="text-[14px]" />
          <span>Active Campaign</span>
        </div>
        {/* <div className="flex items-center gap-2 text-gray-600 cursor-pointer">
          <span>🚫</span>
          <span>Completed Campaign</span>
        </div> */}
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Sidebar */}
        <div className="w-full lg:max-w-[320px] space-y-4">
          {/* Dropdown */}
          <div>
            <label className="block text-sm mb-2">Campaign Name</label>
            <select className="w-full border border-gray-300 outline-none rounded p-2 text-sm">
              <option>Select Campaign Name...</option>
              <option>Live Event Campaign</option>
              <option>Electronic Item Sell Campaign</option>
              <option>Website Development Campaign</option>
              <option>Job Applications</option>
              <option>Make a new Mobile Applications</option>
              <option>Social Media Campaign</option>
            </select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            {[
              {
                icon: <FaRegCopyright className="text-white text-xl" />,
                color: "#715bff",
                value: "6",
                label: "Active Campaign",
              },
              {
                icon: <FaChartLine className="text-white text-xl" />,
                color: "#ff8686",
                value: "1",
                label: "Completed Campaign",
              },
              {
                icon: <FaNetworkWired className="text-white text-xl" />,
                color: "#d16f00",
                value: loading ? "Loading..." : totalLeads,
                label: "Total Leads",
              },
              {
                icon: <FaPhone className="text-white text-xl" />,
                color: "#1aaa49",
                value: "167",
                label: "Call Made",
              },
              {
                icon: <IoMdTime className="text-white text-xl" />,
                color: "#2aafb9",
                value: "16 H, 7 M, 54 S",
                label: "Total Duration",
              },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-4 rounded p-3 bg-white shadow-sm">
                <div
                  className="w-14 h-14 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: item.color }}
                >
                  {item.icon}
                </div>
                <div>
                  <div className="text-base font-semibold">{item.value}</div>
                  <div className="text-xs text-gray-500">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full">
          {/* Filter Tabs */}
          <div className="flex gap-4 mb-4 font-medium flex-wrap">
            <div className="text-blue-600 border-b-2 border-blue-600 pb-1 cursor-pointer">
              Started
            </div>
            <div className="text-gray-600 cursor-pointer">Not Started</div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Select Reference Number..."
                className="border border-gray-300 rounded p-2 w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <select value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded p-2 w-full sm:w-64 outline-none">
                <option>Select Lead Status...</option>
                <option value="HOT">Hot</option>
                <option value="COLD">Cold</option>
                <option value="WARM">Warm</option>
                <option value="NOT_QUALIFIED">Not Qualified</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="FOLLOW_UP_REQUEST">Follow Up Request</option>
                <option value="CONVERTED">Converted</option>
              </select>
            </div>

            <div className="md:mr-20">
              <button onClick={() => { navigate('/leads/create'); window.scrollTo(0, 0) }} className="bg-blue-600 px-4 flex gap-1 items-center cursor-pointer py-2 text-white rounded border-none">Create New Lead<FaPlus /></button>
            </div>
          </div>



          {/* Table */}
          <div className="bg-white rounded overflow-auto">
            <table className="min-w-[600px] w-full text-left text-sm">
              <thead className="text-gray-600 bg-gray-100">
                <tr>
                  <th className="p-3 whitespace-nowrap">Reference Number</th>
                  {/* <th className="p-3 whitespace-nowrap">Campaign Name</th> */}
                  <th className="p-3 whitespace-nowrap">Name</th>
                  <th className="p-3 whitespace-nowrap">Email</th>
                  <th className="p-3 whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center p-4 text-gray-500">
                      Loading leads...
                    </td>
                  </tr>
                ) : filteredLeads.length > 0 ? (
                  filteredLeads.map((lead, index) => (
                    <LeadRow
                      key={index}
                      reference={lead.referenceNumber}
                      name={lead.name}
                      email={lead.email}
                      id={lead.id}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center p-4 text-gray-500">
                      No leads found.
                    </td>
                  </tr>
                )}

              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-3 py-1 disabled:opacity-50"
            >
              <BiChevronLeft />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded ${currentPage === i + 1 ? "bg-blue-500 text-white" : ""
                  }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-3 py-1 disabled:opacity-50"
            >
              <CgChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadsPage;
