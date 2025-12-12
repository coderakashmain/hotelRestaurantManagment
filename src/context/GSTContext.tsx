import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/api";

const GSTContext = createContext<any>(null);

export const useGST = () => useContext(GSTContext);

export const GSTProvider = ({ children }: any) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const result = await api.gst.list();
    setList(result);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <GSTContext.Provider value={{ list, loading, reload: load }}>
      {children}
    </GSTContext.Provider>
  );
};
