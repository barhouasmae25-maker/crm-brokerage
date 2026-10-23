import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/auth.service";

function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [role, setRole] =
    useState<"AGENT" | "MANAGER">("AGENT");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await register({
        email,
        password,
        role,
      });

      localStorage.setItem("token", response.token);
      localStorage.setItem("email", response.email);
      localStorage.setItem("role", response.role);

      navigate("/dashboard");

    } catch (error) {

      console.error(error);

      setError("Registration failed");

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="auth-container">

      <div className="auth-card">

        <h1>CRM Brokerage</h1>

        <h2>Create Account</h2>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>

          <div className="form-group">

            <label>Email</label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />

          </div>

          <div className="form-group">

            <label>Password</label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              minLength={6}
              required
            />

          </div>

          <div className="form-group">

            <label>Role</label>

            <select
              value={role}
              onChange={(e) =>
                setRole(
                  e.target.value as
                    | "AGENT"
                    | "MANAGER"
                )
              }
            >

              <option value="AGENT">
                AGENT
              </option>

              <option value="MANAGER">
                MANAGER
              </option>

            </select>

          </div>

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Création..." : "Register"}
          </button>

        </form>

        <p>
          Already have an account?{" "}
          <span
            className="link"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>

      </div>

    </div>
  );
}

export default Register;