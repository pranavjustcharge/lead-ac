import React from "react";

interface FormData {
  referenceNumber: string;
  leadStatus: string;
  firstName: string;
  lastName: string;
  email: string;
  website: string;
  phone: string;
  alternativeNumber:string;
  notes: string;
  companyName: string;
  softwareName: string;
  typeofLead: string;
  budget: string;
  duration: string;
}

interface Props {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleUpdateSave: () => void;
  handleUpdateSaveExit: ()=> void;
}

const LeadDetailsForm: React.FC<Props> = ({ formData, handleChange, handleUpdateSave, handleUpdateSaveExit }) => {
  return (
    <div className="relative h-[550px] overflow-hidden">
      <div className="overflow-y-auto h-full pb-24 pr-2">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="pt-2">
            <label><span className="text-red-500 mr-2">*</span>Reference Number</label>
            <input
              name="referenceNumber"
              value={formData.referenceNumber}
              onChange={handleChange}
              placeholder="Please Enter Reference Number"
              className="border border-gray-300 opacity-50 rounded w-full px-3 py-2"
              disabled
            />
          </div>

          <div className="pt-2">
            <label>Lead Status</label>
            <select
              name="leadStatus"
              value={formData.leadStatus}
              onChange={handleChange}
              className="border border-gray-300 rounded w-full px-3 py-2 text-gray-500"
            >
              <option value="">Select Lead Status…</option>
              <option value="INTERESTED">Interested</option>
              <option value="NOT_INTERESTED">Not Interested</option>
              <option value="UNREACHABLE">Unreachable</option>
            </select>
          </div>

          <div className="pt-2">
            <label>First Name</label>
            <input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Please Enter First Name"
              className="border border-gray-300 rounded w-full px-3 py-2"
            />
          </div>

          <div className="pt-2">
            <label>Last Name</label>
            <input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Please Enter Last Name"
              className="border border-gray-300 rounded w-full px-3 py-2"
            />
          </div>

          <div className="pt-2">
            <label>Company</label>
            <input
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Please Enter Company Name"
              className="border border-gray-300 rounded w-full px-3 py-2"
            />
          </div>

          <div className="pt-2">
            <label>Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Please Enter Email"
              className="border border-gray-300 rounded w-full px-3 py-2"
            />
          </div>

          <div className="pt-2">
            <label>Website</label>
            <input
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="Please Enter Website Url"
              className="border border-gray-300 rounded w-full px-3 py-2"
            />
          </div>

          <div className="pt-2">
            <label>Phone No.</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Please Enter Phone No."
              className="border border-gray-300 rounded w-full px-3 py-2"
            />
          </div>

          <div className="pt-2">
            <label>Alternative Phone No.</label>
            <input
              name="alternativeNumber"
              value={formData.alternativeNumber}
              onChange={handleChange}
              placeholder="Please Enter alt Phone No."
              className="border border-gray-300 rounded w-full px-3 py-2"
            />
          </div>

          <div className="pt-2">
            <label>Notes</label>
            <input
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="border border-gray-300 rounded w-full px-3 py-2"
            />
          </div>

          <div className="pt-2">
            <label>Software Name</label>
            <input
              name="softwareName"
              value={formData.softwareName}
              onChange={handleChange}
              placeholder="Please Enter Software Name"
              className="border border-gray-300 rounded w-full px-3 py-2"
            />
          </div>

          <div className="pt-2">
            <label>Budget</label>
            <input
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              className="border border-gray-300 rounded w-full px-3 py-2"
            />
          </div>

          <div className="pt-2">
            <label>Duration</label>
            <input
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="border border-gray-300 rounded w-full px-3 py-2"
            />
          </div>

          <div className="pt-2">
            <label>Types of Lead</label>
            <select
              name="typeOfLead"
              value={formData.typeofLead}
              onChange={handleChange}
              className="border border-gray-300 rounded w-full px-3 py-2 text-gray-500"
            >
              <option value="">Types of Leads</option>
              <option value="INSURANCE">Insurance</option>
              <option value="LOAN">Loan</option>
              <option value="SELL">Sell</option>
              <option value="NEWCAR">New Car</option>
              <option value="OLD_CAR">Old Car</option>
              <option value="FINANCE">Finance</option>
            </select>
          </div>
        </form>
      </div>

      {/* Save Buttons */}
      <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-200 px-4 py-3 flex gap-3 items-center">
        <button
          onClick={handleUpdateSave}
          className="bg-blue-400 text-white cursor-pointer px-4 py-2 rounded-md text-sm"
        >
          Save
        </button>
        <button onClick={handleUpdateSaveExit} className="bg-blue-400 text-white px-4 py-2 cursor-pointer rounded-md text-sm">
          Save & Exit
        </button>
        <span className="ml-auto text-gray-500 cursor-pointer">✓ Auto Save</span>
      </div>
    </div>
  );
};

export default LeadDetailsForm;
