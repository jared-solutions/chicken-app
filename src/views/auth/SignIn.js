import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  Card,
  CardContent,
} from "@mui/material";

const SignIn = ({ onSignIn, onSignUp }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      const response = await fetch('/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onSignIn(data.user);
      } else {
        setError("Invalid credentials");
      }
    } catch (error) {
      setError("Login failed");
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      setError("Please enter your email address");
      return;
    }

    try {
      const response = await fetch('/api/auth/password-reset/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });

      if (response.ok) {
        alert("Password reset instructions have been sent to your email");
        setShowForgotPassword(false);
        setResetEmail("");
      } else {
        setError("Failed to send password reset email");
      }
    } catch (error) {
      setError("Password reset failed");
    }
  };

  return (
    <Container maxWidth="xs">
      <Card elevation={3} sx={{ mt: 5, p: 3, textAlign: "center", background: 'linear-gradient(135deg, rgba(240, 255, 240, 0.9), rgba(245, 245, 220, 0.9))', backdropFilter: 'blur(10px)', border: '1px solid rgba(34, 139, 34, 0.2)' }}>
        <CardContent>
          <Typography variant="h4" gutterBottom sx={{ color: '#006400', fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
            Welcome to Joe Farm
          </Typography>

          <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#228B22' }, '&:hover fieldset': { borderColor: '#32CD32' }, '&.Mui-focused fieldset': { borderColor: '#228B22' } } }}
            />

            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#228B22' }, '&:hover fieldset': { borderColor: '#32CD32' }, '&.Mui-focused fieldset': { borderColor: '#228B22' } } }}
            />

            <Button variant="contained" fullWidth onClick={handleSignIn} sx={{ backgroundColor: '#228B22', '&:hover': { backgroundColor: '#32CD32' }, color: 'white', fontWeight: 'bold' }}>
              Log in
            </Button>
            {error && <Typography color="error">{error}</Typography>}

            <Button variant="text" sx={{ mt: 1, color: '#228B22', '&:hover': { color: '#32CD32' } }} onClick={() => setShowForgotPassword(true)}>
              Forgot Password?
            </Button>
          </Box>

          {showForgotPassword && (
            <Box sx={{ mt: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>
                Reset Password
              </Typography>
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="contained" color="primary" onClick={handleForgotPassword}>
                  Send Reset Email
                </Button>
                <Button variant="outlined" onClick={() => setShowForgotPassword(false)}>
                  Cancel
                </Button>
              </Box>
            </Box>
          )}

          <Button variant="outlined" fullWidth sx={{ mt: 2, color: '#228B22', borderColor: '#228B22', '&:hover': { borderColor: '#32CD32', color: '#32CD32' } }} onClick={onSignUp}>
            Create New Account
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default SignIn;
