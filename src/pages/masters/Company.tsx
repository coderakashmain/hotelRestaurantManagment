import { useState, useEffect } from "react";
import { api } from "../../api/api";
import { useCompany } from "../../context/CompanyInfoContext";
import {
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

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

  if (loading) {
    return (
      <div className="p-10 text-sm text-secondary">
        Loading company profile…
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">
            Company Profile
          </h1>
          <p className="text-sm text-secondary mt-1">
            Organization identity & billing configuration
          </p>
        </div>

        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-sm transition hover-glow hover-accent"
          >
            <PencilSquareIcon className="w-4 h-4" />
            Edit
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={updateCompany}
              className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-sm hover-glow hover-accent transition"
            >
              <CheckIcon className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="flex items-center gap-2 bg-gray-100 text-text px-5 py-2 rounded-sm hover:bg-gray-200 transition"
            >
              <XMarkIcon className="w-4 h-4" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* ================= PROFILE CARD ================= */}
      <div className="bg-white rounded-sm shadow-soft p-6 bg-bg-primary border border-gray">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="w-28 h-28 rounded-sm bg-bg-secondary flex items-center justify-center">
            {form?.logo_url ? (
              <img
                src={form.logo_url}
                alt="Company Logo"
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <span className="text-xs text-secondary">No Logo</span>
            )}
          </div>

          {/* Summary */}
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-text">
              {form.name || "Company Name"}
            </h2>
            <p className="text-sm text-secondary mt-1">
              {form.address || "Company address not provided"}
            </p>
            <p className="text-xs text-secondary mt-2">
              Created: {company?.created_at} · Updated: {company?.updated_at}
            </p>
          </div>
        </div>
      </div>

      {/* ================= CONTENT GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Contact & Identity">
          <Field label="Company Name" value={form.name} editMode={editMode}
            onChange={(e:any)=>setForm({...form,name:e.target.value})}/>
          <Field label="Phone" value={form.contact_number} editMode={editMode}
            onChange={(e:any)=>setForm({...form,contact_number:e.target.value})}/>
          <Field label="Email" value={form.email} editMode={editMode}
            onChange={(e:any)=>setForm({...form,email:e.target.value})}/>
          <Field label="GST Number" value={form.gst_number} editMode={editMode}
            onChange={(e:any)=>setForm({...form,gst_number:e.target.value})}/>
        </Section>

        <Section title="Bank Details">
          <Field label="Account Name" value={form.bank_account_name} editMode={editMode}
            onChange={(e:any)=>setForm({...form,bank_account_name:e.target.value})}/>
          <Field label="Account Number" value={form.bank_account_number} editMode={editMode}
            onChange={(e:any)=>setForm({...form,bank_account_number:e.target.value})}/>
          <Field label="IFSC Code" value={form.ifsc_code} editMode={editMode}
            onChange={(e:any)=>setForm({...form,ifsc_code:e.target.value})}/>
          <Field label="Logo URL" value={form.logo_url || ""} editMode={editMode}
            onChange={(e:any)=>setForm({...form,logo_url:e.target.value})}/>
        </Section>
      </div>

      {/* ================= LOCATION ================= */}
      <Section title="Address">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field
            label="Address"
            value={form.address}
            textarea
            editMode={editMode}
            onChange={(e:any)=>setForm({...form,address:e.target.value})}
          />
          <Field
            label="City"
            value={form.city}
            editMode={editMode}
            onChange={(e:any)=>setForm({...form,city:e.target.value})}
          />
        </div>
      </Section>
    </div>
  );
};

/* ================= UI PRIMITIVES ================= */

const Section = ({ title, children }: any) => (
  <div className="bg-white rounded-sm shadow-soft  bg-bg-primary border border-gray p-6">
    <div className="flex items-center gap-2 mb-5">
      <div className="w-1 h-4 bg-primary rounded-full" />
      <h3 className="text-sm font-semibold text-text uppercase tracking-wide">
        {title}
      </h3>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {children}
    </div>
  </div>
);

const Field = ({ label, value, editMode, textarea, onChange }: any) => (
  <div className="space-y-1">
    <label className="text-xs font-medium text-secondary">
      {label}
    </label>

    {editMode ? (
      textarea ? (
        <textarea
          rows={3}
          value={value || ""}
          onChange={onChange}
          className="w-full rounded-sm bg-bg-secondary px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
        />
      ) : (
        <input
          value={value || ""}
          onChange={onChange}
          className="w-full rounded-sm bg-bg-secondary px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
        />
      )
    ) : (
      <div className="text-sm text-text">
        {value || <span className="text-secondary">—</span>}
      </div>
    )}
  </div>
);

export default Company;
