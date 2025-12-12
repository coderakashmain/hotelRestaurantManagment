import { useState, useEffect } from "react";
import { api } from "../api/api";
import { useNavigate } from "react-router";
import { useCompany } from "../context/CompanyInfoContext";

export default function CompanySetupPage() {
  // const { loading, data: company } = useAsync(() => api.company.get(), []);
  const{company,loading} = useCompany();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [gst, setGst] = useState("");
  const [bankName, setBankName] = useState("");
  const [accNo, setAccNo] = useState("");
  const [ifsc, setIfsc] = useState("");
  const navigate = useNavigate();

  // Auto-fill form when "company" loads
  useEffect(() => {
    if (!company) return;
    setName(company.name || "");
    setAddress(company.address || "");
    setCity(company.city || "");
    setContact(company.contact_number || "");
    setEmail(company.email || "");
    setGst(company.gst_number || "");
    setBankName(company.bank_account_name || "");
    setAccNo(company.bank_account_number || "");
    setIfsc(company.ifsc_code || "");
  }, [company]);

  const save = async () => {
    if (!name.trim()) return alert("Company name is required");

    await api.company.save({
      name,
      address,
      city,
      contact_number: contact,
      email,
      gst_number: gst,
      bank_account_name: bankName,
      bank_account_number: accNo,
      ifsc_code: ifsc,
      is_active: 1,
    });

    alert("Company info saved!");
      navigate('/setup/user-create')
    window.location.reload();
  };

  if (loading) return <div className="text-center p-10">Loading...</div>;

  return (
    <section className="h-screen w-full flex items-center justify-center">
      <div className="max-w-3xl w-full bg-bg-secondary shadow p-6 rounded">
        <h2 className="text-2xl font-semibold mb-6">
          {company ? "Update Company Info" : "Enter Company Info"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Company Name *</label>
            <input
              className="w-full border p-2 rounded bg-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Hotel XYZ"
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-medium mb-1">Contact Number</label>
            <input
              className="w-full border p-2 rounded bg-white"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="9876543210"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              className="w-full border p-2 rounded bg-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="info@hotel.com"
            />
          </div>

          {/* GST */}
          <div>
            <label className="block text-sm font-medium mb-1">GST Number</label>
            <input
              className="w-full border p-2 rounded bg-white"
              value={gst}
              onChange={(e) => setGst(e.target.value)}
              placeholder="GST1234"
            />
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Address</label>
            <textarea
              className="w-full border p-2 rounded bg-white"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full address of the hotel"
            />
          </div>

          {/* Bank account name */}
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input
              className="w-full border p-2 rounded bg-white"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter Your City"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bank Account Name</label>
            <input
              className="w-full border p-2 rounded bg-white"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Hotel XYZ Pvt Ltd"
            />
          </div>

          {/* Account number */}
          <div>
            <label className="block text-sm font-medium mb-1">Account Number</label>
            <input
              className="w-full border p-2 rounded bg-white"
              value={accNo}
              onChange={(e) => setAccNo(e.target.value)}
              placeholder="1234567890"
            />
          </div>

          {/* IFSC */}
          <div>
            <label className="block text-sm font-medium mb-1">IFSC Code</label>
            <input
              className="w-full border p-2 rounded bg-white"
              value={ifsc}
              onChange={(e) => setIfsc(e.target.value)}
              placeholder="SBIN0012345"
            />
          </div>
        </div>

        {/* Save button */}
        <div className="mt-6 flex justify-end">
          <button
            className="px-6 py-2 bg-sky-600 text-white rounded shadow btn"
            onClick={save}
          >
            Save Company Info
          </button>
        </div>

      </div>
    </section>
  );
}
