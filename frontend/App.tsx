import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginComponent from './components/login-component';
import RegisterComponent from './components/RegisterComponent';
import EmailVerificationComponent from './components/EmailVerificationComponent';

/**
 * App Component - Main Application Router
 * 
 * Implements routing for the authentication flow:
 * - /login - Login page
 * - /register - Registration page
 * - / - Redirects to login by default
 * 
 * Architecture:
 * - Uses React Router v6 for client-side routing
 * - BrowserRouter provides HTML5 history API
 * - Routes are protected and can be extended with authentication guards
 */
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route - redirects to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Login route */}
        <Route path="/login" element={<LoginComponent />} />
        
        {/* Register route */}
        <Route path="/register" element={<RegisterComponent />} />
        
        {/* Email Verification route */}
        <Route path="/verify-email" element={<EmailVerificationComponent />} />
        
        {/* Catch-all route - redirects to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
