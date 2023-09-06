import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './Components/LoginForm/LoginForm';
import Dashboard from './Components/Dashboard/Dashboard';
import Navbar from './Components/Navbar/Navbar';
import { handleLogin, handleLogout, handleConnectWallet, handleDashboardAction } from './authUtils';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState('');

  return (
    <Router>
      <div>
        <Navbar
          loggedIn={loggedIn}
          handleLogout={() => handleLogout(setLoggedIn, setRole)}
          handleConnectWallet={handleConnectWallet}
        />

        <Routes>
          <Route
            path="/"
            element={loggedIn ? (
              <Navigate to="/dashboard" />
              //<Dashboard role={role} handleDashboardAction={() => handleDashboardAction(role)} />
            ) : (
              <LoginForm handleLogin={(username, password) => handleLogin(username, password, setRole, setLoggedIn)} />
            )}
          />
          <Route
            path="/dashboard"
            element={loggedIn ? (
              <Dashboard role={role} handleDashboardAction={() => handleDashboardAction(role)} />
            ) : (
              <Navigate to="/" replace />
              //<LoginForm handleLogin={(username, password) => handleLogin(username, password, setRole, setLoggedIn)} />
            )}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
