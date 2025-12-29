import { Outlet } from "react-router";
import Topbar from "../components/Topbar";
import BottomBar from "../components/BottomBar";

const SwitchRouter = () => {
  return (
    <section className="h-screen overflow-hidden">
      <Topbar />
      <Outlet />
      <BottomBar/>
    </section>
  );
};

export default SwitchRouter;
