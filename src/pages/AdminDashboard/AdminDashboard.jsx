// AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import CardExpandido from '../../componentes/CardExpandido/CardExpandido'; // IMPORTANDO O NOSSO NOVO COMPONENTE

// --- Ícones SVG embutidos ---
const Search = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>;
const TableList = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="3" x2="21" y1="15" y2="15"/><line x1="9" x2="9" y1="9" y2="21"/></svg>;
const FolderOpen = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/></svg>;

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
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

  const atmsFiltrados = atms.filter(atm => {
    if (!searchTerm) return true; 
    const termo = searchTerm.toLowerCase();
    return (
      atm.pedido_compra?.toLowerCase().includes(termo) || 
      atm.nf?.toLowerCase().includes(termo) || 
      atm.wbs?.toLowerCase().includes(termo) ||
      atm.id?.toLowerCase().includes(termo)
    );
  });

  const getStatusClass = (status) => {
    if (status === 'Entregue') return 'badge-success';
    if (status === 'Aguardando Aprovação') return 'badge-warning';
    return 'badge-info';
  };

  const shortId = (id) => id ? id.substring(0, 8).toUpperCase() : 'N/A';

  return (
    <>
      <section className="fade-in section-dashboard">
        <div className="section-header">
          <h3 className="section-title"><TableList size={24} className="text-primary" /> Banco de Dados (ATMs)</h3>
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input type="text" placeholder="Buscar por ID, NF, Pedido..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr><th>ID ATM</th><th>Pedido</th><th>NF</th><th>WBS</th><th>Rota</th><th>Veículo</th><th>Status</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {carregando ? (<tr><td colSpan="8" className="text-center" style={{padding: '2rem'}}>Carregando...</td></tr>) : atmsFiltrados.map((atm) => (
                <tr key={atm.id}>
                  <td className="font-bold" title={atm.id}>#{shortId(atm.id)}</td>
                  <td>{atm.pedido_compra || '-'}</td><td>{atm.nf || '-'}</td><td>{atm.wbs || '-'}</td>
                  <td>De: {atm.origem?.municipio} <br/>Para: {atm.destino?.municipio}</td>
                  <td>{atm.veiculo}</td>
                  <td><span className={`badge ${getStatusClass(atm.status)}`}>{atm.status}</span></td>
                  <td>
                    {/* AQUI A MÁGICA ACONTECE. Clicou, selecionou o ATM. */}
                    <button className="btn-action" onClick={() => setSelectedAtm(atm)}>
                      <FolderOpen size={16} /> Abrir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* RENDERIZANDO O NOSSO COMPONENTE MODAL MODULAR */}
      <CardExpandido 
        atm={selectedAtm} 
        onClose={() => setSelectedAtm(null)} 
      />
    </>
  );
}