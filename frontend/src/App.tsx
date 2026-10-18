
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Prospects from "./pages/Prospects";
import AccountRequests from "./pages/AccountRequests";
import MainLayout from "./components/MainLayout";

function ProtectedLayout() {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <MainLayout />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Page d'accueil */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Authentification */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Pages protégées : utilisateur connecté */}
        <Route element={<ProtectedLayout />}>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/prospects"
            element={<Prospects />}
          />

          <Route
            path="/account-requests"
            element={<AccountRequests />}
          />
        </Route>

        {/* Route inconnue */}
        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
