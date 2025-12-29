import { createContext, useContext, useEffect, useState } from "react";
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
  const navigate = useNavigate();

  const [years, setYears] = useState<FY[]>([]);
  const [activeYear, setActiveYear] = useState<FY | null>(null);
  const [loading, setLoading] = useState(true);

  /* ============================
     LOAD FINANCIAL YEARS
  ============================ */
  const reloadYears = async () => {
    setLoading(true);

    const data: FY[] = await api.fy.list();
    setYears(data);

    setLoading(false);

    if (data.length === 0) {
      navigate("/hotel/fy");
    }
  };

  /* ============================
     SET ACTIVE FY
     (NO reload here)
  ============================ */
  const setActiveFY = async (id: number) => {
    // guard: prevent re-setting same FY
    if (activeYear?.id === id) return;

    await api.fy.setActive(id);

    // optimistic local update
    setYears((prev) =>
      prev.map((y) =>
        y.id === id
          ? { ...y, is_active: 1 }
          : { ...y, is_active: 0 }
      )
    );
  };

  /* ============================
     DERIVE ACTIVE YEAR
     (single source of truth)
  ============================ */
  useEffect(() => {
    setActiveYear(years.find((y) => y.is_active === 1) || null);
  }, [years]);

  /* ============================
     INITIAL LOAD
  ============================ */
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
        setActiveYear: setActiveFY,
      }}
    >
      {children}
    </FinancialYearContext.Provider>
  );
};

/* ============================
   HOOK
============================ */
export const useFinancialYear = () => {
  const ctx = useContext(FinancialYearContext);
  if (!ctx) {
    throw new Error(
      "useFinancialYear must be used inside FinancialYearProvider"
    );
  }
  return ctx;
};
