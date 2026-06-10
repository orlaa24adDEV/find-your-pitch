import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();

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
                <Link
                  to="/dashboard"
                  className="text-ink-600 hover:text-pitch transition-colors duration-200"
                >
                  Mis reservas
                </Link>
                {user?.role === "admin" && (
                  <Link
                    to="/admin"
                    className="text-ink-600 hover:text-pitch transition-colors duration-200 font-medium"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="text-red-500 hover:text-red-600 transition-colors duration-200"
                >
                  Cerrar sesión
                </button>
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
