import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Squares2X2Icon,
  ClipboardDocumentListIcon,
  TableCellsIcon,
  UsersIcon,
  ReceiptPercentIcon,
  ClipboardIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";

export default function RestaurantSidebar() {
  const { pathname } = useLocation();

  const [masterOpen, setMasterOpen] = useState(false);

  /* ---------- ACTIVE GROUP DETECTION ---------- */
  const isMasterChildActive =
    pathname.startsWith("/restaurant/category-master") ||
    pathname.startsWith("/restaurant/dish-master") ||
    pathname.startsWith("/restaurant/table-master") ||
    pathname.startsWith("/restaurant/employee-master");

  /* ---------- AUTO OPEN WHEN CHILD ACTIVE ---------- */
  useEffect(() => {
    if (isMasterChildActive) setMasterOpen(true);
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
    <aside className="w-full   flex flex-col items-center px-2 py-3 gap-1">

      {/* MASTER CONTROL (PARENT) */}
      <button
        onClick={() => setMasterOpen(!masterOpen)}
        className={parentButton(isMasterChildActive)}
      >
        <Squares2X2Icon className="w-5 h-5" />
        <span className={label}>
          Master {masterOpen ? "▾" : "▸"}
        </span>
      </button>

      {masterOpen && (
        <div
          className={`w-full flex flex-col gap-1 pl-1
            ${isMasterChildActive ? "border-l-2 border-primary" : ""}
          `}
        >
          <Link
            to="/restaurant/category-master"
            className={itemClass("/restaurant/category-master")}
          >
            <ClipboardDocumentListIcon className="w-4 h-4" />
            <span className={label}>Category</span>
          </Link>

          <Link
            to="/restaurant/dish-master"
            className={itemClass("/restaurant/dish-master")}
          >
            <ClipboardIcon className="w-4 h-4" />
            <span className={label}>Dishes</span>
          </Link>

          <Link
            to="/restaurant/table-master"
            className={itemClass("/restaurant/table-master")}
          >
            <TableCellsIcon className="w-4 h-4" />
            <span className={label}>Tables</span>
          </Link>

          <Link
            to="/restaurant/employee-master"
            className={itemClass("/restaurant/employee-master")}
          >
              <DocumentTextIcon className="w-4 h-4" />
            <span className={label}>Staff</span>
          </Link>
          <Link
            to="/restaurant/gst-master-restaurent"
            className={itemClass("/restaurant/gst-master-restaurent")}
          >
            <UsersIcon className="w-4 h-4" />
            <span className={label}>GST</span>
          </Link>
        </div>
      )}

      {/* Divider */}
      <div className="w-8 h-px bg-gray my-2" />

      {/* KOT */}
      <Link to="/restaurant/kot" className={itemClass("/restaurant/kot")}>
        <ReceiptPercentIcon className="w-5 h-5" />
        <span className={label}>KOT</span>
      </Link>

      {/* KOT BILLING */}
      <Link
        to="/restaurant/kot-billing"
        className={itemClass("/restaurant/kot-billing")}
      >
        <ReceiptPercentIcon className="w-5 h-5" />
        <span className={label}>Billing</span>
      </Link>
    </aside>
  );
}
