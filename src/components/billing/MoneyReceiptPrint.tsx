export default function MoneyReceiptPrint({
  data,
  viewFor,
  onClose,
}: {
  data: any;
  viewFor: string;
  onClose: () => void;
}) {
  const printDoc = () => window.print();

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[99999] print:bg-white print:shadow-none">
      <div className="bg-white w-[700px] p-8 border rounded print:w-full print:p-8 print:border-none">
        {/* HEADER */}
        <div className="flex justify-between">
          <div>
            <h1 className="text-2xl font-bold uppercase">
              {data.company_name}
            </h1>
            <p>{data.company_address}</p>
            <p>Phone: {data.company_phone}</p>
          </div>

          <div className="text-left text-sm font-bold">
           {viewFor} COPY
            <div className="mt-2 font-normal text-left">
               <strong> MR No:</strong> {data.mr_no}
              <br />
              <strong> Date:</strong> {new Date(data.created_at).toLocaleDateString()} <br />
              <strong> GR No:</strong> {data.invoice_no} <br />
              <strong> Room No:</strong> {data.room_number}
            </div>
          </div>
        </div>

        {/* TITLE */}
        <h2 className="text-xl font-bold underline text-center my-6">
          MONEY RECEIPT
        </h2>

        {/* BODY */}
        <p className="mt-4 text-[15px]">
          Received with thanks from <strong className="underline">{data.guest_name}</strong>, the sum
          of
          <strong> ₹{data.amount}</strong>.
        </p>

        <p className="mt-2 text-[15px]">
          Payment made by <strong className="underline">{data.method}</strong> on
          <strong> {new Date(data.created_at).toLocaleDateString()}</strong>.
        </p>

        <p className="mt-2 text-[15px]">
          Towards <strong className="underline">{data.payment_type} payment</strong>.
        </p>

        {/* AMOUNT BOX */}
        <div className="border border-black w-[300px] p-2 mt-3 text-[15px]">
          <strong>Rs.</strong>
          <div className="border-b border-black mt-1 text-lg font-bold">
            ₹ {data.amount}
          </div>
        </div>

        {/* SIGNATURES */}
        <div className="flex justify-between mt-4 text-sm">
          <div className="text-center w-1/2">
            ______________________________ <br /> <strong> Customer Signature</strong>
          </div>
          <div className="text-center w-1/2">
            ______________________________ <br /> <strong> Authorized Signature</strong>
          </div>
        </div>
      </div>

      {/* BUTTONS */}
      <div className="fixed bottom-5 right-5 gap-4 flex print:hidden">
        <button onClick={onClose} className="px-4 py-2 border rounded text-gray border-gray cursor-pointer">
          Close
        </button>
        <button
          onClick={printDoc}
          className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer"
        >
          Print
        </button>
      </div>

      <style>
        {`
          @media print {
            body { -webkit-print-color-adjust: exact; }
            .print\\:hidden { display: none !important; }
            .border { border: 1px solid #000 !important; }
            .border-black { border-color: #000 !important; }
          }
        `}
      </style>
    </div>
  );
}
