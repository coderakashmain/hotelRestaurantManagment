import { useState, useEffect } from "react";
import { api } from "../api/api";
import { useNavigate } from "react-router";
import { useCompany } from "../context/CompanyInfoContext";

export default function CompanySetupPage() {
  const { company, loading,refreshCompany } = useCompany();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    contact: "",
    email: "",
    gst: "",
    bankName: "",
    accNo: "",
    ifsc: "",
  });

  /* =========================
     AUTO FILL
  ========================= */
  useEffect(() => {
    if (!company) return;
    setForm({
      name: company.name || "",
      address: company.address || "",
      city: company.city || "",
      contact: company.contact_number || "",
      email: company.email || "",
      gst: company.gst_number || "",
      bankName: company.bank_account_name || "",
      accNo: company.bank_account_number || "",
      ifsc: company.ifsc_code || "",
    });
  }, [company]);

  /* =========================
     SAVE
  ========================= */
  const save = async () => {
    if (!form.name.trim()) return;

    await api.company.save({
      name: form.name,
      address: form.address,
      city: form.city,
      contact_number: form.contact,
      email: form.email,
      gst_number: form.gst,
      bank_account_name: form.bankName,
      bank_account_number: form.accNo,
      ifsc_code: form.ifsc,
      is_active: 1,
    });
    refreshCompany();
    navigate("/setup/user-create");
  };

  /* =========================
     KEYBOARD SHORTCUTS
     ENTER → SAVE
     ESC → BACK
  ========================= */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "TEXTAREA" && e.key === "Enter") return;

      if (e.key === "Enter") {
        e.preventDefault();
        save();
      }

      if (e.key === "Escape") {
        e.preventDefault();
        navigate(-1);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [form]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-secondary">
        Loading company setup…
      </div>
    );
  }

  return (
    <section className="min-h-screen w-full flex items-center justify-center bg-bg-secondary px-6">
      <div className="w-full max-w-5xl card space-y-6">
        {/* ================= HEADER ================= */}
        <div>
          <h2 className="text-2xl font-semibold">
            {company ? "Update Company Information" : "Company Setup"}
          </h2>
          <p className="text-sm text-secondary mt-1">
            This information will appear on invoices, bills and reports
          </p>
        </div>

        {/* ================= FORM ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field
            label="Company Name *"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            placeholder="Hotel XYZ"
          />

          <Field
            label="Contact Number"
            value={form.contact}
            onChange={(v) => setForm({ ...form, contact: v })}
            placeholder="9876543210"
          />

          <Field
            label="Email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
            placeholder="info@hotel.com"
          />

          <Field
            label="GST Number"
            value={form.gst}
            onChange={(v) => setForm({ ...form, gst: v })}
            placeholder="GSTINXXXXXXXX"
          />

          <Field
            label="City"
            value={form.city}
            onChange={(v) => setForm({ ...form, city: v })}
            placeholder="City"
          />

          <Field
            label="Bank Account Name"
            value={form.bankName}
            onChange={(v) => setForm({ ...form, bankName: v })}
            placeholder="Canara Bank"
          />

          <Field
            label="Account Number"
            value={form.accNo}
            onChange={(v) => setForm({ ...form, accNo: v })}
            placeholder="1234567890"
          />

          <Field
            label="IFSC Code"
            value={form.ifsc}
            onChange={(v) => setForm({ ...form, ifsc: v })}
            placeholder="SBIN000000"
          />

          <Field
            label="Address"
            value={form.address}
            onChange={(v) => setForm({ ...form, address: v })}
            placeholder="Full company address"
            textarea
            className="md:col-span-2"
          />
        </div>

        {/* ================= ACTIONS ================= */}
        <div className="flex justify-between items-center pt-4">
          <p className="text-xs text-secondary">
            ⏎ Enter = Save &nbsp;&nbsp; • &nbsp;&nbsp; Esc = Back
          </p>

          <button onClick={save} className="btn hover-glow hover-accent">
            Save & Continue
          </button>
        </div>
      </div>
    </section>
  );
}

/* =========================
   FIELD COMPONENT
========================= */
function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs text-secondary mb-1">{label}</label>
      {textarea ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border rounded-sm p-2 text-sm bg-white"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border rounded-sm p-2 text-sm bg-white"
        />
      )}
    </div>
  );
}
