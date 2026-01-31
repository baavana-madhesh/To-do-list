import React, { useState } from "react";
import axios from "axios";
import { Container, Form, Button, Alert, Card } from "react-bootstrap";
import "../styles/AuthStyles.css";

const API = "http://localhost:5000";

function LoginPage({ onLoginSuccess, setAuthView }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, {
        email,
        password,
      });

      // Save token and user info to localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Call parent callback to update app state
      onLoginSuccess(response.data.token, response.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Card className="auth-card shadow">
          <Card.Body>
            <h2 className="text-center mb-4">Login</h2>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </Form>

            <p className="text-center mt-3">
              Don't have an account?{" "}
              <button
                onClick={() => setAuthView("register")}
                className="auth-link-btn"
              >
                Register here
              </button>
            </p>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default LoginPage;
