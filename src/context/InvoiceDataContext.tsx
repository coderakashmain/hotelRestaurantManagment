import { createContext, useContext, useState } from "react"

const  invoiceDataContext = createContext<any>(null);




 export const useInvoiceData = () => {
  return useContext(invoiceDataContext);
}

const InvoiceDataContext = ({ children } : any) => {
        const [ invoiceData, setInvoiceData ] = useState<null>(null);
        const [companyData, setCompanyData ] = useState<null>(null);


    
  return (
    <invoiceDataContext.Provider value={{ invoiceData, setInvoiceData,setCompanyData,companyData }}>
      {children}
    </invoiceDataContext.Provider>
  )
}

export default InvoiceDataContext
