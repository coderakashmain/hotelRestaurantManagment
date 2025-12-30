import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  HomeIcon,
  BuildingOffice2Icon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  CalendarDaysIcon,
  UsersIcon,
  DocumentTextIcon,
  ChartBarIcon,
  BanknotesIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export default function Sidebar() {
  const { pathname } = useLocation();

  const [profileOpen, setProfileOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);

  /* ---------- ACTIVE GROUP DETECTION ---------- */
  const isSettingsChildActive =
    pathname.startsWith("/hotel/hotel-info") ||
    pathname.startsWith("/hotel/room-type") ||
    pathname.startsWith("/hotel/rooms") ||
    pathname.startsWith("/hotel/check-out-hours") ||
    pathname.startsWith("/hotel/extra-charges") ||
    pathname.startsWith("/hotel/gst-management") ||
    pathname.startsWith("/hotel/users-list") ||
    pathname.startsWith("/hotel/fy");

  // const isFYChildActive =
  //   pathname.startsWith("/hotel/fy");

  const isReportsChildActive =
    pathname.startsWith("/hotel/daily-reports") ||
    pathname.startsWith("/hotel/police-reports");

  /* ---------- AUTO OPEN WHEN CHILD ACTIVE ---------- */
  useEffect(() => {
    if (isSettingsChildActive) setProfileOpen(true);
    if (isReportsChildActive) setReportsOpen(true);
  }, [pathname]);

  /* ---------- CLASSES ---------- */
  const itemClass = (path: string) =>
    `w-full flex flex-col items-center gap-1 px-2 py-3 rounded-sm
     transition-all duration-200
     ${
       pathname === path
         ? "bg-primary text-white"
         : "text-secondary hover-bg-lightColor"
     }`;

  const parentButton = (active: boolean) =>
    `w-full flex flex-col items-center gap-1 px-2 py-3 rounded-sm
     transition-all duration-200
     text-secondary hover-bg-lightColor
     ${active ? "border-l-2 border-primary bg-lightColor" : ""}`;

  const label = "text-[10px] font-medium tracking-wide whitespace-nowrap";

  return (
    <aside className="w-full   flex flex-col items-center px-2 py-3 gap-1 ">

      {/* Dashboard */}
      <Link to="/hotel" className={itemClass("/hotel")}>
        <HomeIcon className="w-5 h-5" />
        <span className={label}>Dashboard</span>
      </Link>

      {/* Room Chart */}
      <Link to="/hotel/rooms-chart" className={itemClass("/hotel/rooms-chart")}>
        <BuildingOffice2Icon className="w-5 h-5" />
        <span className={label}>Rooms</span>
      </Link>

      {/* Check In */}
      <Link to="/hotel/checkin" className={itemClass("/hotel/checkin")}>
        <ArrowRightOnRectangleIcon className="w-5 h-5" />
        <span className={label}>Check-In</span>
      </Link>

      {/* Divider */}
      <div className="w-8 h-px bg-gray my-2" />

      {/* SETTINGS (PARENT) */}
      <button
        onClick={() => setProfileOpen(!profileOpen)}
        className={parentButton(isSettingsChildActive)}
      >
        <Cog6ToothIcon className="w-5 h-5" />
        <span className={label}>
          Settings {profileOpen ? "▾" : "▸"}
        </span>
      </button>

      {profileOpen && (
        <div
          className={`w-full flex flex-col gap-1 pl-1
            ${isSettingsChildActive ? "border-l-2 border-primary" : ""}
          `}
        >
          <Link to="/hotel/hotel-info" className={itemClass("/hotel/hotel-info")}>
            <DocumentTextIcon className="w-4 h-4" />
            <span className={label}>Hotel</span>
          </Link>

          <Link to="/hotel/room-type" className={itemClass("/hotel/room-type")}>
            <CalendarDaysIcon className="w-4 h-4" />
            <span className={label}>Types</span>
          </Link>

          <Link to="/hotel/rooms" className={itemClass("/hotel/rooms")}>
            <BuildingOffice2Icon className="w-4 h-4" />
            <span className={label}>Rooms</span>
          </Link>

          <Link to="/hotel/check-out-hours" className={itemClass("/hotel/check-out-hours")}>
            <ClockIcon className="w-4 h-4" />
            <span className={label}>Checkout</span>
          </Link>

          <Link to="/hotel/extra-charges" className={itemClass("/hotel/extra-charges")}>
            <BanknotesIcon className="w-4 h-4" />
            <span className={label}>Charges</span>
          </Link>

          <Link to="/hotel/gst-management" className={itemClass("/hotel/gst-management")}>
            <DocumentTextIcon className="w-4 h-4" />
            <span className={label}>GST</span>
          </Link>

          <Link to="/hotel/users-list" className={itemClass("/hotel/users-list")}>
            <UsersIcon className="w-4 h-4" />
            <span className={label}>Users</span>
          </Link>

          {/* FINANCIAL YEAR */}


         
              <Link to="/hotel/fy" className={itemClass("/hotel/fy")}>
                <CalendarDaysIcon className="w-4 h-4" />
                <span className={label}>Years</span>
              </Link>

          
        </div>
      )}

      {/* REPORTS */}
      <button
        onClick={() => setReportsOpen(!reportsOpen)}
        className={parentButton(isReportsChildActive)}
        // style={{ paddingBottom :reportsOpen ? '20px' : ''}}
      >
        <ChartBarIcon className="w-5 h-5 " />
        <span className={label}>
          Reports {reportsOpen ? "▾" : "▸"}
        </span>
      </button>

      {reportsOpen && (
        <div
          className={`w-full flex flex-col gap-1 pl-1 pb-10
            ${isReportsChildActive ? "border-l-2 border-primary" : ""}
          `}
        >
          <Link to="/hotel/daily-reports" className={itemClass("/hotel/daily-reports")}>
            <DocumentTextIcon className="w-4 h-4" />
            <span className={label}>Daily</span>
          </Link>

          <Link to="/hotel/police-reports" className={itemClass("/hotel/police-reports")}>
            <DocumentTextIcon className="w-4 h-4" />
            <span className={label}>Police</span>
          </Link>
        </div>
      )}
    </aside>
  );
}
