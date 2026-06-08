import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-xl font-bold text-green-600">
            Find Your Pitch
          </Link>
          <div className="flex gap-4">
            <Link to="/" className="text-gray-700 hover:text-green-600">
              Home
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-green-600">
                  Dashboard
                </Link>
                <button onClick={logout} className="text-red-500 hover:text-red-700">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-green-600">
                  Login
                </Link>
                <Link to="/register" className="text-gray-700 hover:text-green-600">
                  Register
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
