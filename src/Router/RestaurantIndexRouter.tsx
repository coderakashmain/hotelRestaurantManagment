import { Outlet, useNavigate } from "react-router";
import RestaurantSidebar from "../components/restaurant/RestaurantSidebar";
import { useCompany } from "../context/CompanyInfoContext";
import { useUsers } from "../context/UserContext";
import { useEffect } from "react";

const RestaurantIndexRouter = () => {
  const navigate = useNavigate();
  const { company } = useCompany();
  const { users } = useUsers();
  const STORAGE_KEY = import.meta.env.VITE_STORAGE_KEY || "3klsdfoidskfsdo";

  useEffect(() => {
    if (!company) {
      localStorage.removeItem(STORAGE_KEY);
      navigate("/company-setup");
    } else {
      if (!users[0]?.is_active) {
        navigate("/setup/user-create");
      }
    }
  }, [company]);

  
  return (
    <section className="grid grid-cols-[100px_1fr] h-full flex-1 w-full">
      <aside className="overflow-y-auto scrollbar-none h-full bg-bg-primary  border-r border-gray">
        <RestaurantSidebar />
      </aside>

      <main className="overflow-auto p-4 bg-bg-secondary ">
        <Outlet />
      </main>
    </section>
  );
};

export default RestaurantIndexRouter;
