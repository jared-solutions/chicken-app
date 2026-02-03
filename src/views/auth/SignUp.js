import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  InputAdornment,
  IconButton,
  Alert
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Lock,
  Badge,
  AgriculturalBusiness
} from '@mui/icons-material';
import './SignUp.css';

// Backend API URL - Update this when deploying to production
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://joe-farm-backend.onrender.com';

const SignUp = ({ onSignUpSuccess }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('worker');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          password,
          role
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        alert('Sign Up Successful! You are now logged in.');
        onSignUpSuccess(data.user);
      } else {
        const data = await response.json();
        // Handle specific error messages from Django REST framework
        if (data.email && data.email[0]) {
          setError(`Email error: ${data.email[0]}`);
        } else if (data.username && data.username[0]) {
          setError(`Username error: ${data.username[0]}`);
        } else if (data.password && data.password[0]) {
          setError(`Password error: ${data.password[0]}`);
        } else if (data.detail) {
          setError(data.detail);
        } else if (data.non_field_errors && data.non_field_errors[0]) {
          setError(data.non_field_errors[0]);
        } else {
          setError('Registration failed. Please check your information.');
        }
      }
    } catch (error) {
      setError('Registration failed. Please check your internet connection.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Card 
        elevation={6} 
        sx={{ 
          mt: 8, 
          p: 2,
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(240, 255, 240, 0.95))',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(34, 139, 34, 0.2)',
          borderRadius: 3
        }}
      >
        <CardContent>
          <Box textAlign="center" mb={3}>
            <AgriculturalBusiness 
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
                color: '#1b5e20', 
                fontWeight: 'bold',
                textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              Join Joe Farm
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Create your account to get started
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSignUp}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Username"
                  variant="outlined"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Account Type</InputLabel>
                  <Select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    label="Account Type"
                    startAdornment={
                      <InputAdornment position="start">
                        <Badge color="action" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="worker">Worker</MenuItem>
                    <MenuItem value="owner">Owner</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  variant="outlined"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{
                    mt: 1,
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
                  Create Account
                </Button>
              </Grid>
            </Grid>
          </form>

          <Box mt={3} textAlign="center">
            <Typography variant="body2" color="textSecondary">
              Note: Your account will need to be approved by an owner before you can log in.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default SignUp;
