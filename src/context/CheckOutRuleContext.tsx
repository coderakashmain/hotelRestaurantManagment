import { createContext, useContext, useEffect, useState } from "react";
import { CheckOutSetting } from "../components/rooms/types";
import { api } from "../api/api";

interface CheckOutRuleContextType {
  allowChange: boolean;
  setAllowChange: (val: boolean) => void;
  checkOutType: CheckOutSetting[];
  loading: boolean;
  refreshCheckOutType: () => Promise<void>;
}

const CheckOutRuleContext = createContext<CheckOutRuleContextType | null>(null);

export const useCheckOutRule = () => {
  const ctx = useContext(CheckOutRuleContext);
  if (!ctx) throw new Error("useCheckOutRule must be used inside Provider");
  return ctx;
};

export const CheckOutRuleProvider = ({ children }: any) => {
 const [allowChange, setAllowChangeState] = useState<boolean>(() => {
    const saved = localStorage.getItem("allowChange");
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [checkOutType, setCheckOutType] = useState<CheckOutSetting[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

    const setAllowChange = (val: boolean) => {
    setAllowChangeState(val);
    localStorage.setItem("allowChange", JSON.stringify(val));
  };

  const refreshCheckOutType = async () => {
    setLoading(true);
    const list = await api.checkOut.list();
    setCheckOutType(list);
    setLoading(false);
  };

  useEffect(() => {
    refreshCheckOutType();
  }, []);

  return (
    <CheckOutRuleContext.Provider
      value={{
        allowChange,
        setAllowChange,
        checkOutType,
        loading,
        refreshCheckOutType,
      }}
    >
      {children}
    </CheckOutRuleContext.Provider>
  );
};
