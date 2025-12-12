import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/api";

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

  return (
    <CompanyContext.Provider value={{ company, loading,refreshCompany }}>
      {children}
    </CompanyContext.Provider>
  );
}
