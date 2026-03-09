import React, { useState, useEffect } from 'react';

// --- Ícones SVG embutidos ---
const Search = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>;
const TableList = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="3" x2="21" y1="15" y2="15"/><line x1="9" x2="9" y1="9" y2="21"/></svg>;
const FolderOpen = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/></svg>;
const X = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const FileText = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>;

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
    const termo = searchTerm.toLowerCase();
    return (atm.pedido_compra?.toLowerCase().includes(termo) || atm.nf?.toLowerCase().includes(termo) || atm.wbs?.toLowerCase().includes(termo));
  });

  const getStatusClass = (status) => {
    if (status === 'Entregue') return 'badge-success';
    if (status === 'Aguardando Aprovação') return 'badge-warning';
    return 'badge-info';
  };

  const shortId = (id) => id ? id.substring(0, 8).toUpperCase() : '';

  return (
    <>
      <section className="fade-in section-dashboard">
        <div className="section-header">
          <h3 className="section-title"><TableList size={24} className="text-primary" /> Banco de Dados (ATMs)</h3>
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input type="text" placeholder="Buscar..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
                  <td className="font-bold">#{shortId(atm.id)}</td>
                  <td>{atm.pedido_compra || '-'}</td><td>{atm.nf || '-'}</td><td>{atm.wbs || '-'}</td>
                  <td>De: {atm.origem?.municipio} <br/>Para: {atm.destino?.municipio}</td>
                  <td>{atm.veiculo}</td>
                  <td><span className={`badge ${getStatusClass(atm.status)}`}>{atm.status}</span></td>
                  <td><button className="btn-action" onClick={() => setSelectedAtm(atm)}><FolderOpen size={16} /> Abrir</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL RESTAURADO COM O CSS CORRETO */}
      {selectedAtm && (
        <div className="modal-overlay">
          <div className="modal-content fade-in">
            <div className="modal-header">
              <div>
                <span className="modal-subtitle">Ficha Cadastral Logística</span>
                <h2 className="modal-title">ATM #{shortId(selectedAtm.id)}</h2>
              </div>
              <button className="btn-close" onClick={() => setSelectedAtm(null)}><X size={24} /></button>
            </div>
            
            <div className="modal-body">
              <div className="modal-grid">
                <div className="modal-section">
                  <h4>Identificação</h4>
                  <ul>
                    <li><span>Solicitante:</span> <strong>{selectedAtm.solicitacao}</strong></li>
                    <li><span>Pedido:</span> <strong>{selectedAtm.pedido_compra || 'N/A'}</strong></li>
                    <li><span>Nota Fiscal:</span> <strong>{selectedAtm.nf || 'N/A'}</strong></li>
                    <li><span>WBS:</span> <strong>{selectedAtm.wbs || 'N/A'}</strong></li>
                  </ul>
                </div>
                <div className="modal-section">
                  <h4>Carga e Veículo</h4>
                  <ul>
                    <li><span>Peso:</span> <strong>{selectedAtm.peso} kg</strong></li>
                    <li><span>Volume:</span> <strong>{selectedAtm.volume} m³</strong></li>
                    <li><span>Veículo:</span> <strong>{selectedAtm.veiculo}</strong></li>
                    <li><span>Status:</span> <span className={`badge ${getStatusClass(selectedAtm.status)}`}>{selectedAtm.status}</span></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-danger" onClick={() => alert('PDF não disponível')}><FileText size={18}/> PDF</button>
              <button className="btn-secondary" onClick={() => setSelectedAtm(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}