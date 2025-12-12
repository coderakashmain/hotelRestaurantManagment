import { Outlet } from "react-router";
import Sidebar from "../components/Sidebar";


const IndexRouter = () => {
  return (
    <section className="grid grid-cols-[250px_1fr] h-screen w-full">
    
      <aside className="">
        <Sidebar />
      </aside>

      
      <main className="overflow-auto p-4 bg-bg-secondary rounded-tl-2xl shadow-md">
        <Outlet />
      </main>
    </section>
  );
};

export default IndexRouter;
