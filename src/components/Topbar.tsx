import { useLocation, useNavigate } from "react-router-dom";

const Topbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isHotel = location.pathname.startsWith("/hotel");
  const isRestaurant = location.pathname.startsWith("/restaurant");

  const handleUpgrade = () => {
    navigate("/upgrade");
  };

  return (
    <div className="h-10 flex items-center justify-between bg-bg-primary border-b border-gray select-none transition-all duration-200">

      {/* LEFT – Drag Area */}
      <div className="flex items-center gap-3 px-3 flex-1 drag">
        <div className="w-4 h-4 rounded-sm bg-primary shadow-soft transition-all duration-200" />
        <span className="text-xs font-semibold tracking-wide text-text">
          Hotel & Restaurant Management
        </span>
      </div>

      {/* CENTER – Mode Switch */}
      <div className="flex items-center bg-gray rounded-sm p-[2px] no-drag transition-all duration-200">
        <button
          onClick={() => navigate("/hotel")}
          className={`px-4 h-7 text-xs rounded-sm transition-all duration-200 ease-in-out
            ${isHotel
              ? "bg-bg-secondary text-black shadow-soft"
              : "text-text hover:bg-lightColor"}`}
        >
          Hotel
        </button>

        <button
          onClick={() => navigate("/restaurant")}
          className={`px-4 h-7 text-xs rounded-sm transition-all duration-200 ease-in-out
            ${isRestaurant
              ? "bg-bg-secondary text-black shadow-soft"
              : "text-text hover:bg-lightColor"}`}
        >
          Restaurant
        </button>
      </div>

      {/* RIGHT – Upgrade + Window Controls */}
      <div className="flex items-center no-drag ml-3">

        {/* 🔥 Upgrade Button – Accent */}
        <button
          // onClick={handleUpgrade}
          className="
            mr-2 px-4 h-7 text-xs font-medium
            rounded-sm border border-accent
            text-accent bg-transparent
            hover-accent hover-glow
            transition-all duration-200 ease-in-out
          "
        >
          Upgrade
        </button>

        {/* Window Controls */}
        <button
          onClick={() => window.api.minimize()}
          className="w-11 h-10 flex items-center justify-center rounded-sm hover:bg-lightColor transition-all duration-200"
        >
          ─
        </button>

        <button
          onClick={() => window.api.maximize()}
          className="w-11 h-10 flex items-center justify-center rounded-sm hover:bg-lightColor transition-all duration-200"
        >
          ▢
        </button>

        <button
          onClick={() => window.api.close()}
          className="w-11 h-10 flex items-center justify-center rounded-sm hover:bg-error hover:text-white transition-all duration-200"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Topbar;
