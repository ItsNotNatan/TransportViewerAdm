import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import Login from './pages/Login/login';
import AdminProfile from './pages/AdminProfile/AdminProfile';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import Layout from './componentes/layout/layout';

// 🟢 NOVAS IMPORTAÇÕES
import EditorVeiculos from './pages/EditorVeiculos/EditorVeiculos';

// ======================================================
// COMPONENTE DE PROTEÇÃO (SISTEMA DE DOIS TOKENS)
// ======================================================
const RotaPrivada = ({ children }) => {
  const token = localStorage.getItem('accessToken'); 
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
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
        path: "", // Rota: / (Dashboard Principal)
        element: <AdminDashboard /> 
      },
      {
        path: "perfil", // Rota: /perfil
        element: <AdminProfile /> 
      },
      // 🟢 ROTA DO SIMULADOR 3D
      {
        path: "simulador-veiculo", // Rota: /simulador-veiculo
        element: <EditorVeiculos />
      },
      // 🟢 ROTA DE GESTÃO DE FROTA (CRUD)
      {
        path: "gestao-veiculos", // Rota: /gestao-veiculos
        element: <EditorVeiculos />
      }
    ]
  },
  {
    path: "/login",
    element: <Login />, 
  },
  {
    path: "*",
    element: <Navigate to="/" replace />
  }
]);