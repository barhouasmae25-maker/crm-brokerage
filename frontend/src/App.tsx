import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// =====================================================
// AUTH
// =====================================================

import Login from "./pages/Login";
import Register from "./pages/Register";

// =====================================================
// MAIN - MODULE 6
// =====================================================

import Dashboard from "./pages/Dashboard";

// =====================================================
// ADMIN
// =====================================================

import Users from "./pages/admin/Users";

// =====================================================
// CLIENTS - MODULE 5
// =====================================================

import Clients from "./pages/Clients/Clients";
import ClientDetails from "./pages/Clients/ClientDetails";

// =====================================================
// PROSPECTS - MODULE 2
// =====================================================

import Prospects from "./pages/prospects/Prospects";
import AddProspect from "./pages/prospects/AddProspect";
import EditProspect from "./pages/prospects/EditProspect";
import ProspectDetails from "./pages/prospects/ProspectDetails";
import AssignProspect from "./pages/prospects/AssignProspect";

// =====================================================
// INTERACTIONS - MODULE 3
// =====================================================

import Interactions from "./pages/interactions/Interactions";
import AddInteraction from "./pages/interactions/AddInteraction";

// =====================================================
// ACCOUNT REQUESTS - MODULE 4
// =====================================================

import AccountRequests from "./pages/accountRequests/AccountRequests";
import AddAccountRequest from "./pages/accountRequests/AddAccountRequest";
import AccountRequestDetails from "./pages/accountRequests/AccountRequestDetails";

// =====================================================
// SECURITY
// =====================================================

import ProtectedRoute from "./components/ProtectedRoute";

// =====================================================
// CONTEXT
// =====================================================

import { AuthProvider } from "./context/AuthContext";

// =====================================================
// APP
// =====================================================

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>

        <Routes>

          {/* =================================================
              DEFAULT
          ================================================= */}

          <Route
            path="/"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />

          {/* =================================================
              AUTH
          ================================================= */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          {/* =================================================
              MODULE 6
              DASHBOARD
          ================================================= */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* =================================================
              ADMIN USERS
              MANAGER ONLY
          ================================================= */}

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute role="MANAGER">
                <Users />
              </ProtectedRoute>
            }
          />

          {/* =================================================
              MODULE 5
              CLIENTS
          ================================================= */}

          {/* Liste des clients */}

          <Route
            path="/agent/clients"
            element={
              <ProtectedRoute>
                <Clients />
              </ProtectedRoute>
            }
          />

          {/* Détails d'un client */}

          <Route
            path="/agent/clients/:clientId"
            element={
              <ProtectedRoute>
                <ClientDetails />
              </ProtectedRoute>
            }
          />

          {/* =================================================
              MODULE 2
              PROSPECTS
          ================================================= */}

          {/* Liste des prospects */}

          <Route
            path="/prospects"
            element={
              <ProtectedRoute>
                <Prospects />
              </ProtectedRoute>
            }
          />

          {/* Ajouter un prospect */}

          <Route
            path="/prospects/add"
            element={
              <ProtectedRoute>
                <AddProspect />
              </ProtectedRoute>
            }
          />

          {/* Détails d'un prospect */}

          <Route
            path="/prospects/:id"
            element={
              <ProtectedRoute>
                <ProspectDetails />
              </ProtectedRoute>
            }
          />

          {/* Modifier un prospect */}

          <Route
            path="/prospects/:id/edit"
            element={
              <ProtectedRoute>
                <EditProspect />
              </ProtectedRoute>
            }
          />

          {/* Assigner un prospect
              MANAGER ONLY */}

          <Route
            path="/prospects/:id/assign"
            element={
              <ProtectedRoute role="MANAGER">
                <AssignProspect />
              </ProtectedRoute>
            }
          />

          {/* =================================================
              MODULE 3
              INTERACTIONS
          ================================================= */}

          {/* Liste des interactions */}

          <Route
            path="/prospects/:id/interactions"
            element={
              <ProtectedRoute>
                <Interactions />
              </ProtectedRoute>
            }
          />

          {/* Ajouter une interaction */}

          <Route
            path="/prospects/:id/interactions/add"
            element={
              <ProtectedRoute>
                <AddInteraction />
              </ProtectedRoute>
            }
          />

          {/* =================================================
              MODULE 4
              ACCOUNT REQUESTS
          ================================================= */}

          {/* Liste des demandes */}

          <Route
            path="/account-requests"
            element={
              <ProtectedRoute>
                <AccountRequests />
              </ProtectedRoute>
            }
          />

          {/* Ajouter une demande */}

          <Route
            path="/account-requests/add"
            element={
              <ProtectedRoute>
                <AddAccountRequest />
              </ProtectedRoute>
            }
          />

          {/* Détails d'une demande */}

          <Route
            path="/account-requests/:id"
            element={
              <ProtectedRoute>
                <AccountRequestDetails />
              </ProtectedRoute>
            }
          />

          {/* =================================================
              404
          ================================================= */}

          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

        </Routes>

      </BrowserRouter>
    </AuthProvider>
  );
}