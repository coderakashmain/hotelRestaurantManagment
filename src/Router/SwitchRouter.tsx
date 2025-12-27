import { Outlet } from "react-router";
import Topbar from "../components/Topbar";

const SwitchRouter = () => {
  return (
    <section className="h-screen overflow-hidden">
      <Topbar />
      <Outlet />
    </section>
  );
};

export default SwitchRouter;
