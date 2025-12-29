import MoneyReceiptPrint from "./MoneyReceiptPrint";

export default function DualMrPage() {
  return (
    <div className="mr-page bg-white">
      <div className="mr-half">
        <MoneyReceiptPrint viewFor="CUSTOMER" />
      </div>

      <div className="mr-half">
        <MoneyReceiptPrint viewFor="EMPLOYEE" />
      </div>

      <style>
        {`
          @page {
            size: A4;
            margin: 10mm;
          }

          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            /* One page only */
            .mr-page {
              width: 100%;
              height: 100vh;
              page-break-after: always;
            }

            /* Half A4 for each receipt */
            .mr-half {
              height: 50vh;
              display: flex;
              justify-content: center;
              align-items: center;
              page-break-inside: avoid;
            }

            /* Remove extra UI */
            .print\\:hidden {
              display: none !important;
            }
          }
        `}
      </style>
    </div>
  );
}
