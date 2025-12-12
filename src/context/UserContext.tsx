import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/api";
import { useNavigate } from "react-router-dom";

interface UserContextType {
  users: any[];
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  users: [],
  loading: true,
});

export const useUsers = () => useContext(UserContext);

export function UserProvider({ children }: any) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function loadUsers() {
    setLoading(true);
    const list = await api.users.list();
    setUsers(list);
    setLoading(false);

    //  If no system user exists, force redirect to user create setup page
    if (list.length === 0) {
      navigate("/setup/user-create");
    }else{
      navigate('/')
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <UserContext.Provider value={{ users, loading }}>
      {children}
    </UserContext.Provider>
  );
}
