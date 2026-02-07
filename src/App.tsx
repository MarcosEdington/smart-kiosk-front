import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import UsuariosPage from './pages/UsuariosPage';
import LoginPage from './pages/LoginPage';

// Sidebar global (única, com animação e tema amarelo)
const Sidebar = () => {
  const loc = useLocation();
  // Não mostra na tela de login
  if (loc.pathname === '/') return null;

  return (
    <div className="sidebar-premium animate__animated animate__fadeInLeft">
      <div className="mb-5 d-flex align-items-center">
        <div className="bg-warning p-2 rounded-3 me-3 shadow-warning">
          <i className="bi bi-display text-dark fs-4"></i>
        </div>
        <h5 className="mb-0 fw-bold text-white">SMART<span className="text-warning">KIOSK</span></h5>
      </div>
      <nav className="nav flex-column gap-2">
        <Link to="/dashboard" className="nav-link-custom text-decoration-none">
          <i className="bi bi-grid-fill me-2"></i> Painel Geral
        </Link>
        <Link to="/usuarios" className="nav-link-custom text-decoration-none">
          <i className="bi bi-shield-lock-fill me-2"></i> Acessos/Login
        </Link>
      </nav>
      <div className="mt-auto border-top border-secondary pt-3">
        <Link 
          to="/" 
          onClick={() => {
            localStorage.clear();
            window.location.href = '/'; // força reload pra limpar estado
          }} 
          className="text-danger text-decoration-none fw-bold small d-flex align-items-center p-2 hover-nav"
        >
          <i className="bi bi-box-arrow-left me-2"></i> SAIR DO SISTEMA
        </Link>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="app-container d-flex">
        <Sidebar />
        <main className="main-content flex-grow-1">
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage onLogout={() => {}} />} />
            <Route path="/usuarios" element={<UsuariosPage onLogout={() => {}} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;