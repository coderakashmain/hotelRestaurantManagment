import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { useUsers } from "../context/UserContext";
import { useCompany } from "../context/CompanyInfoContext";

const OuterRouter = () => {
  const navigate = useNavigate();
  const { company } = useCompany();
  const { users } = useUsers();
  const STORAGE_KEY =
  import.meta.env.VITE_STORAGE_KEY || "3klsdfoidskfsdo";


  useEffect(() => {
    
      if (!company) {
        localStorage.removeItem(STORAGE_KEY);
        navigate("/company-setup");
      } else {
        if (!users[0]?.is_active) {
          navigate("/setup/user-create");
        }
      };
  }, [company]);
  return <Outlet />;
};

export default OuterRouter;
