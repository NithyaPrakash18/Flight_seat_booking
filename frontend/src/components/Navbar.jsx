import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Navbar.css";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">✈️</span>
          <span className="brand-name">SkyWays</span>
        </Link>

        {/* Center Menu (Icons) */}
        <div className="navbar-center-menu">
          <Link to="/" className={`nav-item ${isActive("/") ? "active" : ""}`}>
            <span className="nav-icon">✈️</span>
            <span>FLIGHT</span>
          </Link>
        </div>

        {/* Right Side (Support & User) */}
        <div className="navbar-right">
          <div className="support-info">
            <span className="support-tag">LIVE ASSISTANCE</span>
            <span className="support-number">📞 09999-331-771</span>
          </div>

          {isAuthenticated ? (
            <div className="user-menu" style={{ position: 'relative' }}>
              <Link to="/profile" className="user-profile-btn" title={user?.name}>
                👤
              </Link>
              {/* Simplified logout for now */}
              <button onClick={logout} style={{
                position: 'absolute', top: '100%', right: 0,
                background: 'white', border: '1px solid #eee',
                padding: '5px 10px', display: 'none' // Hover via CSS usually, preserving simple react for speed
              }}>Logout</button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ padding: "8px 20px" }}>
              Login / Sign Up
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
