import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  Alert,
  Grid
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Agriculture
} from '@mui/icons-material';

// Backend API URL - Update this when deploying to production
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://joe-farm-backend.onrender.com';

const SignIn = ({ onSignIn, onSignUp }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
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
        const data = await response.json();
        if (data.error) {
          setError(data.error);
        } else {
          setError("Invalid credentials");
        }
      }
    } catch (error) {
      setError("Login failed. Please check your internet connection.");
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      setResetError("Please enter your email address");
      return;
    }

    setResetError("");
    setResetSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/password-reset/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });

      if (response.ok) {
        setResetSuccess(true);
      } else {
        setResetError("Failed to send password reset email");
      }
    } catch (error) {
      setResetError("Password reset failed. Please try again.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSignIn();
    }
  };

  return (
    <Container maxWidth="sm">
      <Card 
        elevation={0}
        sx={{ 
          mt: 8, 
          p: 2,
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: 3
        }}
      >
        <CardContent>
          <Box textAlign="center" mb={3}>
            <Agriculture 
              sx={{ 
                fontSize: 50, 
                color: '#2e7d32',
                mb: 1
              }} 
            />
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{ 
                color: '#fff', 
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
              }}
            >
              Welcome to Joe Farm
            </Typography>
            <Typography variant="body2" sx={{ color: '#fff', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
              Sign in to access your dashboard
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <TextField
              label="Email Address"
              type="email"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button 
              variant="contained" 
              fullWidth 
              onClick={handleSignIn} 
              sx={{ 
                py: 1.5,
                background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                fontSize: '16px',
                fontWeight: 'bold',
                textTransform: 'none',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1b5e20 0%, #0d3d0d 100%)',
                  boxShadow: '0 6px 16px rgba(46, 125, 50, 0.4)',
                },
              }}
            >
              Sign In
            </Button>

            <Button 
              variant="text" 
              sx={{ 
                mt: 1, 
                color: '#2e7d32', 
                '&:hover': { color: '#1b5e20' } 
              }} 
              onClick={() => setShowForgotPassword(true)}
            >
              Forgot Password?
            </Button>
          </Box>

          {showForgotPassword && (
            <Box sx={{ mt: 3, p: 3, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: 'rgba(255,255,255,0.5)' }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#1b5e20', fontWeight: 'bold' }}>
                Reset Password
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Enter your email address and we'll send you a code to reset your password.
              </Typography>
              
              {resetError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {resetError}
                </Alert>
              )}
              
              {resetSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Password reset instructions have been sent to your email.
                </Alert>
              )}
              
              <TextField
                label="Email Address"
                type="email"
                variant="outlined"
                fullWidth
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    onClick={handleForgotPassword}
                    sx={{ 
                      background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                      textTransform: 'none',
                    }}
                  >
                    Send Code
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetEmail("");
                      setResetError("");
                      setResetSuccess(false);
                    }}
                    sx={{ 
                      color: '#2e7d32',
                      borderColor: '#2e7d32',
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: '#1b5e20',
                        color: '#1b5e20',
                      },
                    }}
                  >
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}

          <Button 
            variant="outlined" 
            fullWidth 
            sx={{ 
              mt: 3, 
              color: '#2e7d32', 
              borderColor: '#2e7d32',
              py: 1.5,
              fontWeight: 'bold',
              textTransform: 'none',
              borderRadius: 2,
              '&:hover': { 
                borderColor: '#1b5e20',
                color: '#1b5e20',
                bgcolor: 'rgba(46, 125, 50, 0.08)'
              },
            }} 
            onClick={onSignUp}
          >
            Create New Account
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default SignIn;
