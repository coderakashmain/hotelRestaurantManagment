import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { useUsers } from "../context/UserContext";
import { useCompany } from "../context/CompanyInfoContext";

const OuterRouter = () => {
  const navigate = useNavigate();
  const { company } = useCompany();
  const { users } = useUsers();


  useEffect(() => {
    
      if (!company) {
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
