import React, { useState, useEffect } from 'react';
import './home.css';

// --- Ícones SVG embutidos ---
const Truck = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-9h-5V5H10"/><path d="M17 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M7 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg>;
const ChartLine = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>;
const UserGear = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19.5 13.5v.5c0 .28.22.5.5.5h.5a.5.5 0 0 0 .5-.5v-.5a.5.5 0 0 0-.5-.5h-.5a.5.5 0 0 0-.5.5Z"/><path d="m20.5 13-1-1"/><path d="m19 14.5-1 1"/><path d="M20.5 16l-1-1"/><path d="m19 12.5-1 1"/></svg>;
const UserCircle = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>;
const LogOut = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;
const Search = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>;
const TableList = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="3" x2="21" y1="15" y2="15"/><line x1="9" x2="9" y1="9" y2="21"/></svg>;
const FolderOpen = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/></svg>;
const X = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const FileText = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>;

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAtm, setSelectedAtm] = useState(null);
  
  // ESTADOS PARA OS DADOS DO BANCO
  const [atms, setAtms] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroTela, setErroTela] = useState(null); // NOVO: Guarda o erro para mostrar na tela

  // BUSCA OS DADOS NO BACK-END QUANDO A TELA ABRE
  useEffect(() => {
    if (activeTab === 'dashboard') {
      buscarPedidos();
    }
  }, [activeTab]);

  const buscarPedidos = async () => {
    setCarregando(true);
    setErroTela(null); // Limpa o erro antes de tentar
    try {
      // ATENÇÃO AQUI: Mudámos a porta para 3001!
      const resposta = await fetch('http://localhost:3001/api/admin/transportes');
      const dados = await resposta.json();
      
      if (resposta.ok) {
        setAtms(dados);
      } else {
        setErroTela("ERRO DO SERVIDOR: " + JSON.stringify(dados));
      }
    } catch (erro) {
      setErroTela("ERRO DE CONEXÃO: O servidor Node.js está rodando na porta 3001? Detalhe: " + erro.message);
    } finally {
      setCarregando(false);
    }
  };

  // SISTEMA DE BUSCA (FILTRO)
  const atmsFiltrados = atms.filter(atm => {
    const termo = searchTerm.toLowerCase();
    return (
      (atm.pedido_compra && atm.pedido_compra.toLowerCase().includes(termo)) ||
      (atm.nf && atm.nf.toLowerCase().includes(termo)) ||
      (atm.wbs && atm.wbs.toLowerCase().includes(termo)) ||
      (atm.id && atm.id.toLowerCase().includes(termo))
    );
  });

  const getStatusClass = (status) => {
    if (status === 'Entregue') return 'badge-success';
    if (status === 'Em Trânsito' || status === 'Aprovado') return 'badge-info';
    if (status === 'Aguardando Aprovação') return 'badge-warning';
    return 'badge-default';
  };

  // Encurta o ID (UUID) para mostrar na tela sem quebrar o layout
  const shortId = (id) => id ? id.substring(0, 8).toUpperCase() : '';

  return (
    <div className="home-layout">
      
      {/* MENU LATERAL */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Truck size={28} className="text-primary" />
          <h1 className="sidebar-title">ATM<span className="text-primary">Log</span></h1>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} 
            onClick={() => setActiveTab('dashboard')}
          >
            <ChartLine size={20} /><span>Tabela Principal</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'perfil' ? 'active' : ''}`} 
            onClick={() => setActiveTab('perfil')}
          >
            <UserGear size={20} /><span>Meu Perfil</span>
          </button>
        </nav>

        <div className="sidebar-footer">Sistema Ativo</div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="main-content">
        <header className="topbar">
          <h2 className="topbar-title">
            {activeTab === 'dashboard' ? 'Painel Principal' : 'Meu Perfil'}
          </h2>
          <div className="user-controls">
            <div className="user-info-wrapper">
              <div className="user-avatar"><UserCircle size={20} /></div>
              <div className="user-details">
                <span className="user-name">Usuário Teste</span>
                <span className="user-status"><span className="status-dot"></span> Online</span>
              </div>
            </div>
            <button className="btn-logout" title="Sair do sistema"><LogOut size={20} /></button>
          </div>
        </header>

        <div className="content-area">
          {/* TELA 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <section className="fade-in section-dashboard">
              <div className="section-header">
                <h3 className="section-title"><TableList size={24} className="text-primary" /> Banco de Dados (ATMs)</h3>
                <div className="search-wrapper">
                  <Search className="search-icon" size={18} />
                  <input 
                    type="text" 
                    placeholder="Buscar por ID, NF ou WBS..." 
                    className="search-input" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                  />
                </div>
              </div>

              {/* MENSAGEM DE ERRO NA TELA (MUITO IMPORTANTE) */}
              {erroTela && (
                <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #ef4444', borderRadius: '8px', marginBottom: '1rem' }}>
                  <strong>Atenção:</strong> {erroTela}
                </div>
              )}

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID ATM</th><th>Pedido</th><th>Nota Fiscal</th><th>Solicitante</th><th>WBS</th><th>Coleta / Entrega</th><th>Tipo de Frete</th><th>Status</th><th className="text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carregando ? (
                      <tr><td colSpan="9" className="text-center" style={{padding: '2rem'}}>Carregando pedidos...</td></tr>
                    ) : atmsFiltrados.length === 0 ? (
                      <tr><td colSpan="9" className="text-center" style={{padding: '2rem'}}>Nenhum pedido encontrado. (Tente criar um novo no formulário do cliente!)</td></tr>
                    ) : (
                      atmsFiltrados.map((atm) => (
                        <tr key={atm.id}>
                          <td className="font-bold" title={atm.id}>#{shortId(atm.id)}</td>
                          <td className="font-mono">{atm.pedido_compra || '-'}</td>
                          <td>{atm.nf || '-'}</td>
                          <td className="text-muted">{atm.solicitacao}</td>
                          <td className="font-medium">{atm.wbs || '-'}</td>
                          <td>
                            <div className="route-info">De: <span>{atm.origem?.municipio} - {atm.origem?.uf}</span></div>
                            <div className="route-info">Para: <span>{atm.destino?.municipio} - {atm.destino?.uf}</span></div>
                          </td>
                          <td className="text-muted">{atm.tipo_frete}</td>
                          <td><span className={`badge ${getStatusClass(atm.status)}`}>{atm.status}</span></td>
                          <td className="text-center">
                            <button className="btn-action" onClick={() => setSelectedAtm(atm)}>
                              <FolderOpen size={16} /> Abrir
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TELA 2: PERFIL */}
          {activeTab === 'perfil' && (
            <section className="fade-in form-card-container">
              <div className="form-card max-w-2xl text-center">
                <div className="profile-icon"><UserGear size={40} /></div>
                <h3 className="profile-title">Perfil do Usuário</h3>
                <form className="mt-6 text-left" onSubmit={(e) => { e.preventDefault(); alert("Perfil atualizado!"); }}>
                  <div className="input-group mb-4">
                    <label>Nome Completo</label>
                    <input type="text" className="input-field" defaultValue="Usuário Teste" />
                  </div>
                  <div className="input-group mb-4">
                    <label>E-mail</label>
                    <input type="email" className="input-field input-disabled" disabled defaultValue="usuario@empresa.com" />
                  </div>
                  <div className="input-group mb-6">
                    <label>Departamento</label>
                    <input type="text" className="input-field" placeholder="Ex: Logística" />
                  </div>
                  <button type="submit" className="btn-dark w-full">Salvar Alterações</button>
                </form>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* MODAL DE DETALHES */}
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
    </div>
  );
}