import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/clients", label: "Clients", icon: "👥" },
  { to: "/projects", label: "Projects", icon: "📁" },
  { to: "/tasks", label: "Tasks", icon: "✅" },
  { to: "/invoices", label: "Invoices", icon: "🧾" },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="h-screen w-64 bg-gray-900 text-white flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white">Jipange</h1>
        <p className="text-xs text-gray-400 mt-1">Client & Project Manager</p>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            <span>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-4 py-4 border-t border-gray-700">
        <p className="text-sm text-white font-medium px-4">{user?.name}</p>
        <p className="text-xs text-gray-400 px-4 mb-3">{user?.email}</p>
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;