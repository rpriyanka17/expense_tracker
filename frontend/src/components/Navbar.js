import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">💰 Kashé</div>
      <div className="navbar-links">
        <Link to="/">DashBoard</Link>
        <Link to="/activity">My Expenses</Link>
        <Link to="/split">Split & Settle</Link>
      </div>
      <div className="navbar-user">
        <span>Hi, {user?.name}</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
} 