// NotesSection.tsx
import React, { useContext, useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { CiHardDrive } from "react-icons/ci";
import ActionModal from "../ui/ActionModal";
import { MdDelete } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

type NotesSectionProps = {
  getUserLeadHistory: () => void;
};

const NotesSection: React.FC<NotesSectionProps> = ({ getUserLeadHistory }) => {
  const { leadId } = useContext(AppContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [modalType, setModalType] = useState<"followUp" | "leadBooking" | "note" | null>(null);
  const [notesList, setNotesList] = useState<any[]>([]);
  const [filteredNotesList, setFilteredNotesList] = useState<any[]>([]); 
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [editingNote, setEditingNote] = useState<any | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null); 

  
  const getNotesById = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/notes?leadId=${leadId}`);
      if (response.data.success) {
        setNotesList(response.data.data); 
      } else {
        toast.error("Failed to fetch notes");
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast.error("Something went wrong");
    }
  };

  
  const handleDeleteNotes = async (id: string) => {
    setDeletingNoteId(id);
    try {
      const response = await axios.delete(`${backendUrl}/api/notes?id=${id}`);
      if (response.data.success) {
        toast.success(response.data.message);
        getNotesById(); 
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete note");
    } finally {
      setDeletingNoteId(null); 
    }
  };

  
  const handleUpdateNotes = (note: any) => {
    setModalType("note");
    setIsModalOpen(true);
    setEditingNote(note);
  };

 
  useEffect(() => {
    if (leadId) {
      getNotesById();
    }
  }, [leadId]);

  
  useEffect(() => {
    let currentFilteredNotes = [...notesList]; 

   
    if (selectedUser && selectedUser !== "Select User...") {
      currentFilteredNotes = currentFilteredNotes.filter(note => note.user === selectedUser);
    }

    // Apply start date filter
    if (startDate) {
      const start = new Date(startDate);
      currentFilteredNotes = currentFilteredNotes.filter(note => {
        const noteDate = new Date(note.createdAt);
        // Compare only dates, ignore time for the filter range
        return noteDate.setHours(0,0,0,0) >= start.setHours(0,0,0,0);
      });
    }

    // Apply end date filter
    if (endDate) {
      const end = new Date(endDate);
      currentFilteredNotes = currentFilteredNotes.filter(note => {
        const noteDate = new Date(note.createdAt);
        // Compare only dates, ignore time for the filter range
        return noteDate.setHours(0,0,0,0) <= end.setHours(0,0,0,0);
      });
    }

    setFilteredNotesList(currentFilteredNotes); 
  }, [notesList, selectedUser, startDate, endDate]);

  
  const handleAddNoteClick = () => {
    setModalType("note");
    setIsModalOpen(true);
    setEditingNote(null); 
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        {/* Button to add a new note */}
        <button
          className="flex items-center gap-2 cursor-pointer bg-blue-600 text-white px-4 py-2 rounded text-sm"
          onClick={handleAddNoteClick}
        >
          <FaPlus size={12} /> Add New Note
        </button>

        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded text-sm"
        >
          <option value="">Select User...</option>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
          <option value="manager">Manager</option>
        </select>

        {/* Date range filters */}
        <div className="flex gap-2 items-center">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded text-sm text-gray-700"
          />
          <span className="text-gray-500">→</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border px-3 border-gray-300 py-2 rounded text-sm text-gray-700"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredNotesList.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-gray-400 py-8">
            <CiHardDrive size={30} className="mb-2" />
            <p>No data</p>
          </div>
        ) : (
          // Map and display filtered notes
          filteredNotesList.map((note) => (
            <div key={note._id} className="flex items-start gap-3 bg-white p-4 rounded shadow-sm border border-gray-300">
              <img
                src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
                className="w-8 h-8 rounded-full"
                alt="user"
              />
              <div className="flex-1">
                <div className="text-sm text-gray-300 font-semibold">
                  {note?.createdBy ?? "Unknown"}
                  <span className="text-gray-400 text-xs ml-2">
                    {note?.createdAt ? new Date(note.createdAt).toLocaleString() : ""}
                  </span>
                </div>
                <div className="mt-1 text-sm text-gray-800">
                  {note?.notes}
                </div>
              </div>
              <div className="flex gap-3 items-start">
                {/* Edit button */}
                <CiEdit
                  size={20}
                  onClick={() => handleUpdateNotes(note)}
                  className="text-blue-500 cursor-pointer"
                />
                <button
                  onClick={() => handleDeleteNotes(note._id)}
                  className="p-0 bg-transparent border-none flex items-center justify-center"
                  disabled={deletingNoteId === note._id} // Disable button while deleting
                >
                  {deletingNoteId === note._id ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div> // Simple spinner
                  ) : (
                    <MdDelete size={20} className="text-blue-600 cursor-pointer" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <ActionModal
        isOpen={isModalOpen}
        type={modalType}
        onClose={() => {
          setIsModalOpen(false);
          setModalType(null);
          setEditingNote(null); 
        }}
        selectedUser={selectedUser} 
        getUserLeadHistory={getUserLeadHistory}
        onNoteCreated={() => {
          getNotesById(); 
          setSelectedUser(""); 
          setIsModalOpen(false);
          setModalType(null);
        }}
        editingNote={editingNote} 
        onNoteUpdated={() => {
          getNotesById(); 
          setIsModalOpen(false);
          setModalType(null);
          setEditingNote(null); 
        }}
      />
    </div>
  );
};

export default NotesSection;
