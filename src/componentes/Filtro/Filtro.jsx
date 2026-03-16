// src/componentes/Filtro.jsx
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom'; // <-- IMPORTAÇÃO NOVA E MÁGICA AQUI!

// Ícones
const XCircle = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
);

const FilterIcon = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
);

const X = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

export default function Filtro({ atms, filtros, onFiltroChange, onLimpar }) {
  const [aberto, setAberto] = useState(false);

  const shortId = (id) => id ? id.substring(0, 8).toUpperCase() : 'N/A';

  const opcoesFiltro = useMemo(() => {
    const ids = new Set();
    const solicitantes = new Set();
    const pedidos = new Set();
    const nfs = new Set();

    atms.forEach(atm => {
      if (atm.id) ids.add(shortId(atm.id)); 
      if (atm.solicitacao) solicitantes.add(atm.solicitacao);
      if (atm.pedido_compra) pedidos.add(atm.pedido_compra);
      if (atm.nf) nfs.add(atm.nf);
    });

    return {
      ids: Array.from(ids),
      solicitantes: Array.from(solicitantes),
      pedidos: Array.from(pedidos),
      nfs: Array.from(nfs)
    };
  }, [atms]);

  const temFiltroAtivo = Object.values(filtros).some(valor => valor !== '');

  const inputStyle = { 
    width: '100%', 
    padding: '0.6rem 0.75rem', 
    borderRadius: '0.375rem', 
    border: '1px solid #d1d5db', 
    outline: 'none',
    backgroundColor: '#ffffff', 
    color: '#111827' 
  };

  return (
    <>
      {/* BOTÃO DE ACIONAMENTO DO FILTRO */}
      <button 
        onClick={() => setAberto(true)}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          padding: '0.75rem 1.25rem', 
          cursor: 'pointer',
          backgroundColor: temFiltroAtivo ? '#eff6ff' : '#ffffff',
          border: `1px solid ${temFiltroAtivo ? '#bfdbfe' : '#e5e7eb'}`,
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s',
          fontWeight: '600',
          color: temFiltroAtivo ? '#1d4ed8' : '#374151'
        }}
      >
        <FilterIcon />
        Filtros de Pesquisa
        {temFiltroAtivo && (
          <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', fontSize: '0.75rem', padding: '0.1rem 0.5rem', borderRadius: '9999px', fontWeight: 'bold' }}>
            Ativos
          </span>
        )}
      </button>

      {/* O PORTAL JOGA O MODAL DIRETO PARA O BODY DO SITE, FORÇANDO TELA CHEIA */}
      {aberto && createPortal(
        <div 
          className="modal-overlay" 
          style={{ 
            zIndex: 9999,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', /* Fundo escuro */
            backdropFilter: 'blur(5px)',           /* O EFEITO DE EMBAÇAR A TELA */
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div className="modal-content fade-in" style={{ maxWidth: '600px', width: '100%', backgroundColor: 'white', borderRadius: '0.5rem', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
              <div>
                <span className="modal-subtitle" style={{ fontSize: '0.875rem', color: '#6b7280' }}>Refine sua busca</span>
                <h2 className="modal-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>Filtros de Pesquisa</h2>
              </div>
              <button 
                className="btn-close" 
                onClick={() => setAberto(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.375rem', transition: 'background-color 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X size={24} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#4b5563', display: 'block', marginBottom: '0.4rem' }}>ID ATM</label>
                <input 
                  type="text" name="id" list="lista-ids" placeholder="Ex: 8A4F..." 
                  value={filtros.id} onChange={onFiltroChange} style={inputStyle} 
                />
                <datalist id="lista-ids">
                  {opcoesFiltro.ids.map((id, index) => <option key={index} value={id} />)}
                </datalist>
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#4b5563', display: 'block', marginBottom: '0.4rem' }}>Solicitante</label>
                <input 
                  type="text" name="solicitante" list="lista-solicitantes" placeholder="Ex: João Silva" 
                  value={filtros.solicitante} onChange={onFiltroChange} style={inputStyle} 
                />
                <datalist id="lista-solicitantes">
                  {opcoesFiltro.solicitantes.map((sol, index) => <option key={index} value={sol} />)}
                </datalist>
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#4b5563', display: 'block', marginBottom: '0.4rem' }}>Pedido (PC)</label>
                <input 
                  type="text" name="pedido" list="lista-pedidos" placeholder="Nº Pedido" 
                  value={filtros.pedido} onChange={onFiltroChange} style={inputStyle} 
                />
                <datalist id="lista-pedidos">
                  {opcoesFiltro.pedidos.map((ped, index) => <option key={index} value={ped} />)}
                </datalist>
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#4b5563', display: 'block', marginBottom: '0.4rem' }}>Nota Fiscal (NF)</label>
                <input 
                  type="text" name="nf" list="lista-nfs" placeholder="Nº Nota Fiscal" 
                  value={filtros.nf} onChange={onFiltroChange} style={inputStyle} 
                />
                <datalist id="lista-nfs">
                  {opcoesFiltro.nfs.map((nf, index) => <option key={index} value={nf} />)}
                </datalist>
              </div>

            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb', padding: '1rem 1.5rem' }}>
              <div>
                {temFiltroAtivo ? (
                  <button 
                    onClick={() => {
                      onLimpar();
                      setAberto(false);
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: '1px solid #fca5a5', backgroundColor: '#fee2e2', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                  >
                    <XCircle size={16} /> Limpar Filtros
                  </button>
                ) : <div />}
              </div>
              
              <button 
                className="btn-secondary" 
                onClick={() => setAberto(false)}
                style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              >
                Ver Resultados
              </button>
            </div>

          </div>
        </div>,
        document.body // <-- ESTA É A MÁGICA DO PORTAL!
      )}
    </>
  );
}