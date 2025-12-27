import MoneyReceiptPrint from "./MoneyReceiptPrint"


const DualMrPage = () => {
  return (
    <div className="flex flex-col gap-10 bg-white py-5">
    <MoneyReceiptPrint viewFor="CUSTOMER"/>
    <MoneyReceiptPrint viewFor="EMPLOYEE"/>
      
    </div>
  )
}

export default DualMrPage
