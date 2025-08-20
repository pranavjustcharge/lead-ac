import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

type ActionModalProps = {
  isOpen: boolean;
  type: "followUp" | "leadBooking" | "note" | null;
  onClose: () => void;
  selectedUser?: string; 
  onNoteCreated?: () => void; 
  getUserLeadHistory: () => void;
  editingNote?: any; 
  onNoteUpdated?: () => void; 
};

const ActionModal: React.FC<ActionModalProps> = ({
  isOpen,
  type,
  onClose,
  selectedUser, 
  onNoteCreated,
  getUserLeadHistory,
  editingNote,
  onNoteUpdated,
}) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { leadId } = useContext(AppContext);

  const [staffMember, setStaffMember] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [notes, setNotes] = useState("");

  
  useEffect(() => {
    if (editingNote) {
      setNotes(editingNote.notes);
    } else {
      setNotes(""); 
    }
    
    setStaffMember("");
    setFollowUpDate("");
  }, [editingNote, isOpen, type]); 

  
  if (!isOpen || !type) return null;

 
  const getTitle = () => {
    if (type === "followUp") return "Lead Follow Up";
    if (type === "leadBooking") return "Lead Booking";
    if (type === "note") return editingNote ? "Update Note" : "Add New Note";
    return "";
  };


  const handleSubmit = async () => {
    if (type === "followUp" && !staffMember) {
      toast.error("Staff Member is required");
      return;
    } else if (type === "leadBooking" && !staffMember) {
      toast.error("Type of Service is required");
      return;
    }

    if (!followUpDate && type !== "note") {
      toast.error("Date & Time is required");
      return;
    }

    if (!notes.trim()) {
      toast.error("Notes is required");
      return;
    }

    try {
      if (type === "followUp") {
        const data = {
          leadId,
          followUpStatus: "PENDING",
          staffMember,
          followUpDate,
          notes,
          createdBy: "admin@gmail.com",
          updatedBy: "admin@gmail.com",
        };

        const response = await axios.post(`${backendUrl}/api/lead/follow`, data);
        if (response.data.success) {
          toast.success(response.data.message);
          getUserLeadHistory();
        }
      } else if (type === "note") {
        if (editingNote) {
          const noteData = {
            notes,
            updatedBy: "admin@gmail.com", 
          };
          const response = await axios.put(`${backendUrl}/api/notes?id=${editingNote._id}`, noteData);
          if (response.data.success) {
            toast.success("Note updated successfully");
            if (onNoteUpdated) {
              onNoteUpdated(); 
            }
          }
        } else {
          if (!selectedUser || selectedUser === "Select User...") {
            toast.error("Please select a user.");
            return;
          }

          const noteData = {
            leadId,
            user: selectedUser, 
            notes,
            createdBy: selectedUser, 
            updatedBy: selectedUser, 
            tenantId: "random123", 
          };
          console.log(noteData)
          const response = await axios.post(`${backendUrl}/api/notes`, noteData);
          if (response.data.success) {
            toast.success("Note created successfully");
            getUserLeadHistory(); 
            if (onNoteCreated) {
              onNoteCreated(); 
            }
          }
        }
      } else if (type === "leadBooking") {
        const bookingData = {
          leadId,
          typeOfService: staffMember,
          bookingTime: followUpDate,
          notes,
          createdBy: "admin", 
          updatedBy: "admin", 
        };

        const response = await axios.post(`${backendUrl}/api/lead/booking`, bookingData);
        if (response.data.success) {
          toast.success(response.data.message);
          getUserLeadHistory();
        }
      }

      setStaffMember("");
      setFollowUpDate("");
      setNotes("");
      onClose();
    } catch (error) {
      console.error("Action error:", error);
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-md shadow-lg w-full max-w-md p-6 relative">
        <h2 className="text-lg font-semibold mb-4">{getTitle()}</h2>
        {type !== "note" && (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="text-red-500 mr-1">*</span>
                {type === "followUp" ? "Staff Member" : "Type of Service"}
              </label>
              <select
                className="w-full border border-gray-300 text-gray-400 rounded px-3 py-2 focus:outline-none"
                value={staffMember}
                onChange={(e) => setStaffMember(e.target.value)}
              >
                {type === "followUp" ? (
                  <>
                    <option value="">Select Staff</option>
                    <option value="ADMIN">Admin</option>
                    <option value="MANAGER">Manager</option>
                    <option value="MEMBER">Member</option>
                  </>
                ) : (
                  <>
                    <option value="">Select Service</option>
                    <option value="INSURANCE">Insurance</option>
                    <option value="LOAN">Loan</option>
                    <option value="NEW_CAR">New Car</option>
                    <option value="OLD_CAR">Old Car</option>
                    <option value="FINANCE">Finance</option>
                  </>
                )}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="text-red-500 mr-1">*</span>
                {type === "followUp" ? "Follow Up Time" : "Booking Time"}
              </label>
              <input
                type="datetime-local"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                placeholder="Date Time"
              />
            </div>
          </>
        )}

        {/* Notes textarea (always visible) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <span className="text-red-500 mr-1">*</span>Notes
          </label>
          <textarea
            rows={4}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Please Enter Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {editingNote ? "Update" : "Create"} {/* Dynamic button text */}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionModal;
