import React, { useState, useEffect } from 'react';
import CardExpandido from '../../componentes/CardExpandido/CardExpandido';
import DashboardComponent from '../../componentes/Dashboard/Dashboard'; // Importando a tabela

export default function AdminDashboard() {
  const [selectedAtm, setSelectedAtm] = useState(null);
  const [atms, setAtms] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    buscarPedidos();
  }, []);

  const buscarPedidos = async () => {
    setCarregando(true);
    try {
      const resposta = await fetch('http://localhost:3001/api/admin/transportes');
      const dados = await resposta.json();
      if (resposta.ok) setAtms(dados);
    } catch (erro) {
      console.error(erro);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <>
      {/* 1. COMPONENTE DA TABELA E FILTROS */}
      <DashboardComponent 
        atms={atms} 
        carregando={carregando} 
        onOpenAtm={(atm) => setSelectedAtm(atm)} // Recebe o ATM clicado na tabela
      />

      {/* 2. COMPONENTE MODAL (CARDS EXPANDIDOS E EDIÇÃO) */}
      <CardExpandido 
        atm={selectedAtm} 
        onClose={() => setSelectedAtm(null)}
        onAtmUpdated={() => {
          setSelectedAtm(null); 
          buscarPedidos(); // Recarrega os dados após edição
        }} 
      />
    </>
  );
}