import { Outlet } from "react-router";
import Topbar from "../components/Topbar";
import BottomBar from "../components/BottomBar";

const SwitchRouter = () => {
  return (
    <section className="h-screen flex flex-col overflow-hidden">
      <Topbar />
      <section className="h-full overflow-auto flex-1">

      <Outlet /> 
      </section>
      <BottomBar/>
    </section>
  );
};

export default SwitchRouter;
