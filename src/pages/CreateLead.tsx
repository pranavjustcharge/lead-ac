import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

type Gender = 'MALE' | 'FEMALE';
type LeadSource = 'WEBSITE' | 'SOCIAL_MEDIA' | 'PARTNERSHIP' | 'ONLINE' | 'AGGREGATORS' | 'OTHERS';
type LeadStatus = 'HOT' | 'COLD' | 'WARM' | 'NOT_QUALIFIED' | 'IN_PROGRESS' | 'FOLLOW_UP_REQUEST' | 'CONVERTED';
type TypeOfService = 'FINANCE' | 'USED_CAR' | 'LOAN' | 'INSURANCE';
type PolicyType = '2_Wheeler' | '4_Wheeler' | 'HOME' | 'HEALTH' | 'LIFE';

interface LeadFormData {
  firstName: string;
  lastName: string;
  dob: string;
  phone: string;
  email: string;
  gender: Gender;
  address: string;
  leadSource: LeadSource;
  leadStatus: LeadStatus;
  rating: string;
  alternativeNumber: string;
  alternativeEmail: string;
  occupation: string;
  typeOfService: TypeOfService;
  policyType: PolicyType | null;
  annual_income: string | null;
  panNumber: string | null;
  aadharNumber: string | null;
  gstNumber: string | null;
  createdBy: string;
  updatedBy: string;
  tenantId: string;
}

const CreateLead: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LeadFormData>({
    firstName: '',
    lastName: '',
    dob: '',
    phone: '',
    email: '',
    gender: 'MALE',
    address: '',
    leadSource: 'OTHERS',
    leadStatus: 'HOT',
    rating: '',
    alternativeNumber: '',
    alternativeEmail: '',
    occupation: '',
    typeOfService: 'USED_CAR',
    policyType: null,
    annual_income: null,
    panNumber: null,
    aadharNumber: null,
    gstNumber: null,
    createdBy: 'admin',
    updatedBy: 'admin',
    tenantId: '3456',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const payload = { ...formData };
      const response = await axios.post(`${backendUrl}/api/lead/create`, payload);
      console.log("Lead created:", response.data);
      toast.success('Lead Created Successfully');
      navigate('/leads');
    } catch (error) {
      console.error("Failed to create lead:", error);
      toast.error('Unable to create Lead')
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">

      {/* Basic Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>First Name</label>
          <input name="firstName" value={formData.firstName} onChange={handleChange} className="border p-2 w-full" />
        </div>

        <div>
          <label>Last Name</label>
          <input name="lastName" value={formData.lastName} onChange={handleChange} className="border p-2 w-full" />
        </div>

        <div>
          <label>Date of Birth</label>
          <input name="dob" value={formData.dob} onChange={handleChange} type="date" className="border p-2 w-full" />
        </div>

        <div>
          <label>Phone</label>
          <input name="phone" value={formData.phone} onChange={handleChange} className="border p-2 w-full" />
        </div>

        <div>
          <label>Email</label>
          <input name="email" value={formData.email} onChange={handleChange} className="border p-2 w-full" />
        </div>

        <div>
          <label>Gender</label>
          <select name="gender" value={formData.gender} onChange={handleChange} className="border p-2 w-full">
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHERS">Others</option>
          </select>
        </div>

        <div>
          <label>Address</label>
          <input name="address" value={formData.address} onChange={handleChange} className="border p-2 w-full" />
        </div>

        <div>
          <label>Lead Source</label>
          <select name="leadSource" value={formData.leadSource} onChange={handleChange} className="border p-2 w-full">
            <option value="WEBSITE">Website</option>
            <option value="SOCIAL_MEDIA">Social Media</option>
            <option value="PARTNERSHIP">Partnership</option>
            <option value="ONLINE">Online</option>
            <option value="AGGREGATORS">Aggregators</option>
            <option value="OTHERS">Others</option>
          </select>
        </div>

        <div>
          <label>Lead Status</label>
          <select name="leadStatus" value={formData.leadStatus} onChange={handleChange} className="border p-2 w-full">
            <option value="HOT">Hot</option>
            <option value="COLD">Cold</option>
            <option value="WARM">Warm</option>
            <option value="NOT_QUALIFIED">Not Qualified</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="FOLLOW_UP_REQUEST">Follow Up Request</option>
            <option value="CONVERTED">Converted</option>
          </select>
        </div>

        <div>
          <label>Rating</label>
          <input name="rating" value={formData.rating} onChange={handleChange} className="border p-2 w-full" />
        </div>

        <div>
          <label>Alternative Number</label>
          <input name="alternativeNumber" value={formData.alternativeNumber} onChange={handleChange} className="border p-2 w-full" />
        </div>

        <div>
          <label>Alternative Email</label>
          <input name="alternativeEmail" value={formData.alternativeEmail} onChange={handleChange} className="border p-2 w-full" />
        </div>

        <div>
          <label>Occupation</label>
          <input name="occupation" value={formData.occupation} onChange={handleChange} className="border p-2 w-full" />
        </div>

        <div>
          <label>Type of Service</label>
          <select name="typeOfService" value={formData.typeOfService} onChange={handleChange} className="border p-2 w-full">
            <option value="FINANCE">Finance</option>
            <option value="USED_CAR">Used Car</option>
            <option value="LOAN">Loan</option>
            <option value="INSURANCE">Insurance</option>
          </select>
        </div>
      </div>

      {/* Conditional Insurance Fields */}
      {formData.typeOfService === 'INSURANCE' && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label>Policy Type</label>
            <select name="policyType" value={formData.policyType ?? ''} onChange={handleChange} className="border p-2 w-full">
              <option value="">Select Policy Type</option>
              <option value="2_Wheeler">2 Wheeler</option>
              <option value="4_Wheeler">4 Wheeler</option>
              <option value="HOME">Home</option>
              <option value="HEALTH">Health</option>
              <option value="LIFE">Life</option>
            </select>
          </div>
          <div>
            <label>Annual Income</label>
            <input name="annual_income" value={formData.annual_income ?? ''} onChange={handleChange} className="border p-2 w-full" />
          </div>
          <div>
            <label>PAN Number</label>
            <input name="panNumber" value={formData.panNumber ?? ''} onChange={handleChange} className="border p-2 w-full" />
          </div>
          <div>
            <label>Aadhar Number</label>
            <input name="aadharNumber" value={formData.aadharNumber ?? ''} onChange={handleChange} className="border p-2 w-full" />
          </div>
          <div>
            <label>GST Number</label>
            <input name="gstNumber" value={formData.gstNumber ?? ''} onChange={handleChange} className="border p-2 w-full" />
          </div>
        </div>
      )}


      <button onClick={handleSubmit} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded shadow">
        Submit Lead
      </button>
    </div>
  );
};

export default CreateLead;
