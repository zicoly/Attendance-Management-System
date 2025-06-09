import {
  LayoutDashboard,
  Briefcase,
  BookOpen,
  Video,
  Monitor,
  Settings,
  LogOut,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import logo from "/images/logo.png";

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "History", icon: Briefcase, path: "/history" },
    { label: "My Lectures", icon: BookOpen, path: "/my-lectures" },
    { label: "Live Class", icon: Video, path: "/live-class" },
    { label: "Room", icon: Monitor, path: "/room" },
  ];

  const bottomItems = [
    { label: "Settings", icon: Settings, path: "/settings" },
    { label: "Log Out", icon: LogOut, path: "/" },
  ];

  return (
    <aside className="w-64 h-screen bg-white shadow-lg flex flex-col justify-between p-6 rounded-r-3xl border border-[#DCDCDC]">
      <div>
        <div className="flex items-center space-x-2 mb-10">
          <img src={logo} alt="RollCall" className="w-12 h-12" />
          <div>
            <h2 className="text-2xl font-bold leading-normal bg-gradient-to-r from-[#00141F] to-[#70C6E7] bg-clip-text text-transparent">
              RollCall
            </h2>
            <p className="text-[10px] whitespace-nowrap text-[#00141F] font-medium">
              Your Presence, Digitally Verified.
            </p>
          </div>
        </div>

        <nav className="space-y-6 w-full">
          {navItems.map(({ label, icon: Icon, path }) => {
            const isActive = location.pathname === path;
            return (
              <NavLink
                key={label}
                to={path}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-blue-50 text-[#00141F] font-semibold"
                    : "text-gray-400 hover:text-[#00141F]"
                }`}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  fill={isActive ? "#00141F" : "none"}
                />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="space-y-4 mt-10 w-full">
        {bottomItems.map(({ label, icon: Icon, path }) => {
          const isActive = location.pathname === path;
          return (
            <NavLink
              key={label}
              to={path}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                isActive
                  ? "bg-blue-50 text-[#00141F] font-semibold "
                  : "text-gray-400 odd:hover:text-[#00141F] even:text-red-500 even:hover:bg-red-50"
              }`}
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 1.5}
                fill={isActive ? "#00141F" : "none"}
              />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
