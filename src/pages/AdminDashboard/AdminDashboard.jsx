import React, { useState, useEffect } from 'react';
import api from '../../services/api'; 
import CardExpandido from '../../componentes/CardExpandido/CardExpandido';
import DashboardComponent from '../../componentes/Dashboard/Dashboard';

export default function AdminDashboard() {
  const [selectedAtm, setSelectedAtm] = useState(null);
  const [atms, setAtms] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [debugInfo, setDebugInfo] = useState('Iniciando busca...'); // 🟢 DEBUG

  useEffect(() => {
    buscarPedidos();
  }, []);

  const buscarPedidos = async () => {
    setCarregando(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) setDebugInfo("ERRO: Você não tem accessToken no localStorage!");

      const resposta = await api.get('/admin/transportes');
      
      setDebugInfo(`Sucesso! Recebi ${resposta.data.length} pedidos do banco.`); // 🟢 DEBUG
      setAtms(resposta.data);
    } catch (erro) {
      // 🟢 Se der erro, ele vai escrever o erro na tela para você ler
      setDebugInfo("ERRO NA API: " + (erro.response?.data?.erro || erro.message));
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      {/* ⚠️ CAIXA DE DEBUG TEMPORÁRIA ⚠️ */}
      <div style={{ background: '#000', color: '#0f0', padding: '10px', marginBottom: '10px', fontSize: '12px', fontFamily: 'monospace' }}>
        STATUS DO SISTEMA: {debugInfo} <br/>
        TOKEN PRESENTE: {localStorage.getItem('accessToken') ? 'SIM' : 'NÃO'}
      </div>

      <DashboardComponent 
        atms={atms} 
        carregando={carregando} 
        onOpenAtm={(atm) => setSelectedAtm(atm)} 
      />

      <CardExpandido 
        atm={selectedAtm} 
        onClose={() => setSelectedAtm(null)}
        onAtmUpdated={() => { setSelectedAtm(null); buscarPedidos(); }} 
      />
    </div>
  );
}