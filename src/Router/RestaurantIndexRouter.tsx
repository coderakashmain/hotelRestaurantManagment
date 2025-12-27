import { Outlet } from "react-router";
import RestaurantSidebar from "../components/restaurant/RestaurantSidebar";


const RestaurantIndexRouter = () => {
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
