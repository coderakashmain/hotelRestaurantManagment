import { createContext, useContext, useEffect } from "react";
import { api } from "../api/api";
import { useNavigate } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { useCompany } from "./CompanyInfoContext";

interface UserContextType {
  users: any[];
  loading: boolean;
  refreshUsers: () => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export const useUsers = () => {

  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUsers must be used inside UserProvider");
  }
  return ctx;
};
const STORAGE_KEY = import.meta.env.VITE_STORAGE_KEY || "3klsdfoidskfsdo";

export function UserProvider({ children }: { children: React.ReactNode }) {
  const {company} = useCompany();
  const navigate = useNavigate();

  const { data, loading, reload } = useAsync<any[]>(async () => {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }

    const list = await api.users.list();

    if (list.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
    return list;
  }, []);

  const users = data ?? []; // ✅ normalize null → []

  // redirect logic
  useEffect(() => {
    if (!loading && users.length === 0 &&company ) {
      navigate("/setup/user-create");
    }
  }, [loading, users]);

  const refreshUsers = async () => {
    const list = await api.users.list();

    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    await reload();
  };

  return (
    <UserContext.Provider
      value={{
        users,
        loading,
        refreshUsers,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
