import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import Login from './pages/Login/login';
import AdminProfile from './pages/AdminProfile/AdminProfile';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import Layout from './componentes/layout/layout';

// ======================================================
// COMPONENTE DE PROTEÇÃO (SISTEMA DE DOIS TOKENS)
// ======================================================
const RotaPrivada = ({ children }) => {
  // 🟢 AGORA: Verificamos o accessToken (o crachá de curta duração)
  const token = localStorage.getItem('accessToken'); 
  
  if (!token) {
    // Se não tem nem o token básico, manda para o login
    return <Navigate to="/login" replace />;
  }
  
  // Se tem token, o Layout é renderizado. 
  // Se o token expirar durante o uso, o Axios renovará automaticamente.
  return children;
};

// ======================================================
// CONFIGURAÇÃO DAS ROTAS ATMLOG
// ======================================================
export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <RotaPrivada>
        <Layout />
      </RotaPrivada>
    ), 
    children: [
      {
        path: "", // Rota: /
        element: <AdminDashboard /> 
      },
      {
        path: "perfil", // Rota: /perfil
        element: <AdminProfile /> 
      }
    ]
  },
  {
    path: "/login",
    element: <Login />, 
  },
  // Rota de fallback: se digitar qualquer coisa errada, volta pro Dash ou Login
  {
    path: "*",
    element: <Navigate to="/" replace />
  }
]);