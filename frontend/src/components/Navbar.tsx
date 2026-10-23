
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const role = (localStorage.getItem("role") || "")
    .replace(/^ROLE_/, "")
    .toUpperCase();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");

    navigate("/login", { replace: true });
  };

  return (
    <nav className="navbar">
      <NavLink to="/dashboard" className="navbar-brand">
        CRM Brokerage
      </NavLink>

      <div className="navbar-links">
        <NavLink to="/dashboard">
          Dashboard
        </NavLink>

        <NavLink to="/prospects">
          Prospects
        </NavLink>

        <NavLink to="/account-requests">
          Demandes de comptes
        </NavLink>

        <NavLink to="/clients">
          Clients
        </NavLink>


       

        <button
          type="button"
          className="logout-button"
          onClick={logout}
        >
          Déconnexion
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
