import { useLocation, useNavigate } from "react-router-dom";
import { useUsers } from "../context/UserContext";
import { useEffect } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";
import { useSnackbar } from "../context/SnackbarContext";

const Topbar = () => {
  const { users } = useUsers();
  const navigate = useNavigate();
  const location = useLocation();
  const {showSnackbar} = useSnackbar();

  const isHotel = location.pathname.startsWith("/hotel");
  const isRestaurant = location.pathname.startsWith("/restaurant");

  /* ================= KEYBOARD SHORTCUTS =================
     Ctrl + Tab   → Switch Hotel / Restaurant
     Alt  + ←     → Back
     Alt  + →     → Forward
  ====================================================== */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!users[0]?.is_active) return;

      // Ctrl + Tab → Switch mode
      if (e.ctrlKey && e.key === "Tab") {
        e.preventDefault();
        navigate(isHotel ? "/restaurant" : "/hotel");
      }

      // Alt + Left → Back
      if (e.altKey && e.key === "ArrowLeft") {
        e.preventDefault();
        navigate(-1);
      }

      // Alt + Right → Forward
      if (e.altKey && e.key === "ArrowRight") {
        e.preventDefault();
        navigate(1);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isHotel, users]);

  return (
    <div className="h-10 flex items-center justify-between bg-bg-primary border-b border-gray select-none transition-all duration-200">

      {/* LEFT – Drag Area + Navigation */}
      <div className="flex items-center gap-2 px-3 flex-1 drag">

        {/* App Icon */}
        <div className="w-4 h-4 rounded-sm bg-primary shadow-soft transition-all duration-200" />

        {/* App Title */}
        <span className="text-xs font-semibold tracking-wide text-text">
          RatraX
        </span>

        {/* Divider */}
        <div className="w-px h-4 bg-gray mx-2" />

        {/* ⬅➡ Navigation */}
        <div className="flex items-center gap-1 no-drag">
          <button
            onClick={() => navigate(-1)}
            className="w-7 h-7 flex items-center justify-center rounded-sm
                       hover:bg-lightColor transition-all"
            title="Back (Alt + ←)"
          >
            <ChevronLeftIcon className="w-4 h-4 text-secondary" />
          </button>

          <button
            onClick={() => navigate(1)}
            className="w-7 h-7 flex items-center justify-center rounded-sm
                       hover:bg-lightColor transition-all"
            title="Forward (Alt + →)"
          >
            <ChevronRightIcon className="w-4 h-4 text-secondary" />
          </button>
        </div>
      </div>

      {/* CENTER – Mode Switch */}
      {users[0]?.is_active && (
        <div className="flex items-center gap-2">

          <div className="flex items-center bg-gray rounded-sm p-[2px] no-drag">
            <button
              onClick={() => navigate("/hotel")}
              className={`px-4 h-7 text-xs rounded-sm transition-all
                ${isHotel
                  ? "bg-bg-secondary text-black shadow-soft"
                  : "text-text hover:bg-lightColor"}`}
            >
              Hotel
            </button>

            <button
              onClick={() => navigate("/restaurant")}
              className={`px-4 h-7 text-xs rounded-sm transition-all
                ${isRestaurant
                  ? "bg-bg-secondary text-black shadow-soft"
                  : "text-text hover:bg-lightColor"}`}
            >
              Restaurant
            </button>
          </div>

          {/* Shortcut hint */}
          <span className="text-[10px] text-gray-500">
            Ctrl + Tab
          </span>
        </div>
      )}

      {/* RIGHT – Upgrade + Window Controls */}
      <div className="flex items-center no-drag ml-3">

        {/* Upgrade */}
        <button
        onClick={()=>showSnackbar("Free to use for Now.",'warning')}
          className="
            mr-2 px-4 h-7 text-xs font-medium
            rounded-sm border border-accent
            text-accent bg-transparent
            hover-accent hover-glow
            transition-all
          "
        >
          Upgrade
        </button>

        {/* Window Controls */}
        <button
          onClick={() => window.api.minimize()}
          className="w-11 h-10 flex items-center justify-center rounded-sm hover:bg-lightColor transition-all"
        >
          ─
        </button>

        <button
          onClick={() => window.api.maximize()}
          className="w-11 h-10 flex items-center justify-center rounded-sm hover:bg-lightColor transition-all"
        >
          ▢
        </button>

        <button
          onClick={() => window.api.close()}
          className="w-11 h-10 flex items-center justify-center rounded-sm hover:bg-error hover:text-white transition-all"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Topbar;
