import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/api$/, "");

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [mobileAvatarError, setMobileAvatarError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAvatarError(false);
    setMobileAvatarError(false);
  }, [user?.avatarUrl]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(e.target as Node)) {
        setMobileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white shadow-sm border-b border-ink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-xl font-bold shrink-0">
            <span className="text-ink">Find </span>
            <span className="text-ink">Your </span>
            <span className="text-pitch">Pitch</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
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

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="focus:outline-none"
                  >
                    {user?.avatarUrl && !avatarError ? (
                      <img
                        src={`${API_URL}${user.avatarUrl}`}
                        alt="Avatar"
                        decoding="async"
                        onError={() => setAvatarError(true)}
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

          {/* Mobile section */}
          <div className="md:hidden flex items-center">
            {isAuthenticated && (
              <div className="relative mr-2" ref={mobileDropdownRef}>
                <button
                  onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                  className="focus:outline-none"
                >
                  {user?.avatarUrl && !mobileAvatarError ? (
                    <img
                      src={`${API_URL}${user.avatarUrl}`}
                      alt="Avatar"
                      decoding="async"
                      onError={() => setMobileAvatarError(true)}
                      className="w-8 h-8 rounded-full object-cover border-2 border-ink-100"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-pitch text-white flex items-center justify-center text-xs font-bold">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>
                {mobileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-ink-100 py-1 z-50">
                    <Link
                      to="/profile"
                      onClick={() => setMobileDropdownOpen(false)}
                      className="block px-4 py-2.5 text-sm text-ink-600 hover:text-ink hover:bg-slate-50 transition-colors"
                    >
                      Mi perfil
                    </Link>
                    <hr className="border-ink-100" />
                    <button
                      onClick={() => {
                        setMobileDropdownOpen(false);
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
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-ink-600 hover:text-ink focus:outline-none"
              aria-label="Menú"
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-ink-100 pt-4 space-y-2">
            {isAuthenticated ? (
              <>
                {user?.role !== "admin" && (
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-ink-600 hover:text-pitch hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    Mis reservas
                  </Link>
                )}
                {user?.role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-ink-600 hover:text-pitch hover:bg-slate-50 rounded-lg transition-colors font-medium"
                  >
                    Admin
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 text-ink-600 hover:text-pitch hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 text-pitch font-medium hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
