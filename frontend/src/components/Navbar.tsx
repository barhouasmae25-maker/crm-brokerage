
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { Link } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

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

        {role === "AGENT" && (
          <NavLink to="/tasks">
            Mes tâches
          </NavLink>
        )}

        {role === "MANAGER" && (
          <NavLink to="/manager">
            Gestion équipe
          </NavLink>
        )}

        <Link to="/account-requests">
  Demandes de comptes
</Link>

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
