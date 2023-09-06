import React from 'react';
//import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ loggedIn, handleLogout, handleConnectWallet }) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo-container">
          <img src="logoprueba.png" alt="Logo" className="logo" />
          <div className='nav-textlogo'>ColdChainProject</div>
        </div>
        <ul className="navbar-list">
          {/*
          <li>
            <Link to="/" className="nav-link">Home</Link>
          </li>
          <li>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
          </li>
          */}
          <li>
            {loggedIn ? (
              <button onClick={handleLogout} className="nav-button">Logout</button>
            ) : (
              <button onClick={handleConnectWallet} className="nav-button">Conectar Wallet</button>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
