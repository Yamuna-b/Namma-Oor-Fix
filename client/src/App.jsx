// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './Pages/Landing';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Home from './Pages/Home';
import Profile from './Pages/Profile';
import Settings from './Pages/Settings';
import Navbar from './Components/Navbar';
import './App.css';

// Auth context to manage user state
export const AuthContext = React.createContext();

function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }
    
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 to-yellow-400 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      <Router>
        <div className="App">
         {/* {isAuthenticated && <Navbar user={user} />}  */}
          <Routes>
            <Route 
              path="/" 
              element={isAuthenticated ? <Navigate to="/home" /> : <Landing />} 
            />
            <Route 
              path="/login" 
              element={isAuthenticated ? <Navigate to="/home" /> : <Login />} 
            />
            <Route 
              path="/register" 
              element={isAuthenticated ? <Navigate to="/home" /> : <Register />} 
            />
            <Route 
              path="/home" 
              element={isAuthenticated ? <Home /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/profile" 
              element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/settings" 
              element={isAuthenticated ? <Settings /> : <Navigate to="/login" />} 
            />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
