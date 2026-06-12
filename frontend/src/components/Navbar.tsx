import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/api$/, "");

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white shadow-sm border-b border-ink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-xl font-bold">
            <span className="text-ink">Find </span>
            <span className="text-ink">Your </span>
            <span className="text-pitch">Pitch</span>
          </Link>
          <div className="flex items-center gap-6">
            {isAuthenticated ? (
              <>
                {user?.role !== "admin" && (
                  <Link
                    to="/dashboard"
                    className="text-ink-600 hover:text-pitch transition-colors duration-200"
                  >
                    Mis reservas
                  </Link>
                )}
                {user?.role === "admin" && (
                  <Link
                    to="/admin"
                    className="text-ink-600 hover:text-pitch transition-colors duration-200 font-medium"
                  >
                    Admin
                  </Link>
                )}

                {/* Avatar dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="focus:outline-none"
                  >
                    {user?.avatarUrl ? (
                      <img
                        src={`${API_URL}${user.avatarUrl}`}
                        alt="Avatar"
                        className="w-9 h-9 rounded-full object-cover border-2 border-ink-100 hover:border-pitch transition-colors"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-pitch text-white flex items-center justify-center text-sm font-bold hover:bg-pitch-600 transition-colors">
                        {user?.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-ink-100 py-1 z-50">
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2.5 text-sm text-ink-600 hover:text-ink hover:bg-slate-50 transition-colors"
                      >
                        Mi perfil
                      </Link>
                      <hr className="border-ink-100" />
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                          navigate("/");
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:text-red-600 hover:bg-slate-50 transition-colors"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-ink-600 hover:text-pitch transition-colors duration-200"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className="bg-pitch text-white px-4 py-2 rounded-lg hover:bg-pitch-600 transition-colors duration-200"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
