import { useState, useEffect } from "react";
import { api } from "../../api/api";
import { useCompany } from "../../context/CompanyInfoContext";
import { PencilSquareIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";

const Company = () => {
  const { company, loading, refreshCompany } = useCompany();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (company) setForm(company);
  }, [company]);

  const updateCompany = async () => {
    await api.company.save(form);
    setEditMode(false);
    refreshCompany();
  };

  if (loading) return <div className="p-8 text-lg">Loading company profile...</div>;

  return (
    <div className="w-full overflow-auto  p-10">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Company Profile</h1>
        
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded cursor-pointer btn shadow"
          >
            <PencilSquareIcon className="h-5" /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-4">
            <button
              onClick={updateCompany}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded btn shadow"
            >
              <CheckIcon className="h-5" /> Save
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 btn rounded shadow"
            >
              <XMarkIcon className="h-5" /> Cancel
            </button>
          </div>
        )}
      </div>

      {/* CARD */}
      <div className="bg-white rounded shadow-md p-8 border border-gray-200">
        {/* LOGO */}
        {form?.logo_url && (
          <div className="flex justify-center mb-6">
            <img src={form.logo_url} alt="logo" className="h-28 w-28 object-contain rounded-xl shadow" />
          </div>
        )}

        {/* GRID FIELDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Name */}
          <Field
            label="Company Name"
            value={form.name}
            editMode={editMode}
            onChange={(e : any) => setForm({ ...form, name: e.target.value })}
          />

          {/* Phone */}
          <Field
            label="Phone"
            value={form.contact_number}
            editMode={editMode}
            onChange={(e:any) => setForm({ ...form, contact_number: e.target.value })}
          />

          {/* Email */}
          <Field
            label="Email"
            value={form.email}
            editMode={editMode}
            onChange={(e:any) => setForm({ ...form, email: e.target.value })}
          />

          {/* GST */}
          <Field
            label="GST Number"
            value={form.gst_number}
            editMode={editMode}
            onChange={(e:any) => setForm({ ...form, gst_number: e.target.value })}
          />

          {/* Bank Details */}
          <Field
            label="Bank Account Name"
            value={form.bank_account_name}
            editMode={editMode}
            onChange={(e:any) => setForm({ ...form, bank_account_name: e.target.value })}
          />

          <Field
            label="Bank Account Number"
            value={form.bank_account_number}
            editMode={editMode}
            onChange={(e:any) => setForm({ ...form, bank_account_number: e.target.value })}
          />

          <Field
            label="IFSC Code"
            value={form.ifsc_code}
            editMode={editMode}
            onChange={(e:any) => setForm({ ...form, ifsc_code: e.target.value })}
          />

          <Field
            label="Logo URL"
            value={form.logo_url || ""}
            editMode={editMode}
            onChange={(e:any) => setForm({ ...form, logo_url: e.target.value })}
          />
        </div>

        {/* Address full width */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field
            label="Address"
            value={form.address}
            editMode={editMode}
            textarea
            onChange={(e:any) => setForm({ ...form, address: e.target.value })}
          />
          <Field
            label="city"
            value={form.city}
            editMode={editMode}
            textarea
            onChange={(e:any) => setForm({ ...form, city: e.target.value })}
          />
        </div>

        {/* Meta Info */}
        <div className="mt-8 text-sm text-gray-500 border-t pt-4">
          <p>Created: {company?.created_at}</p>
          <p>Last Updated: {company?.updated_at}</p>
        </div>
      </div>
    </div>
  );
};


const Field = ({ label, value, editMode, textarea, onChange }: any) => (
  <div>
    <label className="text-gray-600 font-semibold block mb-1">{label}</label>
    {editMode ? (
      textarea ? (
        <textarea
          className="border-gray-300 rounded w-full p-3 border focus:ring-blue-600 focus:border-blue-600"
          rows={4}
          value={value}
          onChange={onChange}
        />
      ) : (
        <input
          className="border-gray-300 rounded w-full p-3 border focus:ring-blue-600 focus:border-blue-600"
          value={value}
          onChange={onChange}
        />
      )
    ) : (
      <p className="text-gray-800 text-lg">{value || "-"}</p>
    )}
  </div>
);

export default Company;
