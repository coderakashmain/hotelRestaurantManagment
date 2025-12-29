import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/api";
import { useNavigate } from "react-router";

interface CompanyInfoContext {
  company: any;
  loading: boolean;
   refreshCompany: () => Promise<void>;
}

const CompanyContext = createContext<CompanyInfoContext>({
  company: null,
  loading: true,
   refreshCompany: async () => {},
});



export const useCompany = () => useContext(CompanyContext);

export function CompanyProvider({ children }: any) {
  const [company, setCompany] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function loadCompany() {
    setLoading(true);
    const list = await api.company.get();
    setCompany(list);
    setLoading(false);
  }

  useEffect(() => {
    loadCompany();
  }, []);

  const refreshCompany = async () => {
    loadCompany();
  };
  useEffect(()=>{
    if(!loading && !company){
      localStorage.clear();
      navigate("/company-setup");
    }
  },[loading,company])


  return (
    <CompanyContext.Provider value={{ company, loading,refreshCompany }}>
      {children}
    </CompanyContext.Provider>
  );
}
