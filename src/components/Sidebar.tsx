import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

export default function Sidebar() {
  const { pathname } = useLocation();
  const [fyOpen, setFyOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const linkClass = (path: string) =>
    `block px-4 py-2 rounded mb-2 ${
      pathname === path ? "bg-blue-600 text-white" : "text-gray-200"
    }`;

  return (
    <aside className="h-full p-4">
      <h2 className="text-xl font-bold mb-4">Hotel Admin</h2>

      <Link to="/" className={linkClass("/")}>
        Dashboard
      </Link>

      <Link to="/rooms-chart" className={linkClass("/rooms-chart")}>
        Room Chart
      </Link>
      <Link to="/checkin" className={linkClass("/checkin")}>
        Check In
      </Link>

      {/* Financial Year Dropdown */}

      <div>
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="block w-full text-left px-4 py-2 text-black rounded mb-2 "
        >
          Setting ▾
        </button>

        {profileOpen && (
          <div className="ml-4">
            <Link to="/hotel-info" className={linkClass("/hotel-info")}>
              Hotel info
            </Link>

            <Link to="/room-type" className={linkClass("/room-type")}>
              Room Type
            </Link>
            <Link to="/rooms" className={linkClass("/rooms")}>
               Room Setting
            </Link>
            <Link to="/check-out-hours" className={linkClass("/check-out-hours")}>
              Check Out Hours
            </Link>
            <Link to="/extra-charges" className={linkClass("/extra-charges")}>
              Extra Charges
            </Link>
            <Link to="/gst-management" className={linkClass("/gst-management")}>
              GST Management
            </Link>
            <Link to="/users" className={linkClass("/users")}>
              Users
            </Link>
            <div>
              <button
                onClick={() => setFyOpen(!fyOpen)}
                className="block w-full text-left px-4 py-2 text-black rounded mb-2 "
              >
                Financial Year ▾
              </button>

              {fyOpen && (
                <div className="ml-4">
                  <Link to="/fy" className={linkClass("/fy")}>
                    Manage Years
                  </Link>

                  <Link to="/fy-create" className={linkClass("/fy-create")}>
                    Create Year
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
