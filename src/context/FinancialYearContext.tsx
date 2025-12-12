import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api/api";
import { useNavigate } from "react-router";

type FY = {
  id: number;
  year_name: string;
  start_date: string;
  end_date: string;
  invoice_prefix?: string;
  is_active: number;
  current_invoice_no: number;
};

type FYContextType = {
  loading: boolean;
  years: FY[];
  activeYear: FY | null;
  reloadYears: () => Promise<void>;
  setActiveYear: (id: number) => Promise<void>;
};

const FinancialYearContext = createContext<FYContextType | null>(null);

export const FinancialYearProvider = ({ children }: { children: any }) => {
  const [years, setYears] = useState<FY[]>([]);
  const [activeYear, setActive] = useState<FY | null>(null);
  const [loading, setloading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Load FY list
  const reloadYears = async () => {
    setloading(true);
    const data = await api.fy.list();
    setYears(data);
    setActive(data.find((y: FY) => y.is_active === 1) || null);
    setloading(false);
  };
 useEffect(() => {
    if (!loading) {
     
      if (years.length === 0) navigate("/fy-create");
    }
  }, [loading, years]);

  // Set active FY
  const setActiveYear = async (id: number) => {
    await api.fy.setActive(id);
    await reloadYears();
  };

  useEffect(() => {
    reloadYears();
  }, []);

  return (
    <FinancialYearContext.Provider
      value={{
        loading,
        years,
        activeYear,
        reloadYears,
        setActiveYear,
      }}
    >
      {children}
    </FinancialYearContext.Provider>
  );
};

// Hook to use in components
export const useFinancialYear = () => {
  const ctx = useContext(FinancialYearContext);
  if (!ctx) throw new Error("useFinancialYear must be inside Provider");
  return ctx;
};
