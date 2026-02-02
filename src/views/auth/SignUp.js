import React, { useState } from 'react';
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
        // Since we have the token, we can consider them signed in
        // But onSignUpSuccess just goes back to sign-in, so we need to modify App.js to handle this
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
      setError('Registration failed');
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up for Joe Farm</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSignUp}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
        >
          <option value="worker">Worker</option>
          <option value="owner">Owner</option>
        </select>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;
