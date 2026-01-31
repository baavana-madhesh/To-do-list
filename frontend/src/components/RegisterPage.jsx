import React, { useState } from "react";
import axios from "axios";
import { Container, Form, Button, Alert, Card } from "react-bootstrap";
import "../styles/AuthStyles.css";

const API =process.env.REACT_APP_API;

function RegisterPage({ onRegisterSuccess, setAuthView }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/register`, {
        username,
        email,
        password,
      });

      // Save token and user info to localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Call parent callback to update app state
      onRegisterSuccess(response.data.token, response.data.user);
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Card className="auth-card shadow">
          <Card.Body>
            <h2 className="text-center mb-4">Create Account</h2>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </Form.Group>

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
                  placeholder="Enter a password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Button
                variant="success"
                type="submit"
                className="w-100"
                disabled={loading}
              >
                {loading ? "Registering..." : "Register"}
              </Button>
            </Form>

            <p className="text-center mt-3">
              Already have an account?{" "}
              <button
                onClick={() => setAuthView("login")}
                className="auth-link-btn"
              >
                Login here
              </button>
            </p>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default RegisterPage;
