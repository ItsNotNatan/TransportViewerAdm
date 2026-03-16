// src/componentes/Filtro.jsx
import React, { useState, useMemo } from 'react';

// Ícone de "X" para limpar
const XCircle = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
);

// Novo Ícone de Funil para o botão
const FilterIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
);

export default function Filtro({ atms, filtros, onFiltroChange, onLimpar }) {
  // Novo estado para controlar se o card está aberto ou fechado
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
    <div style={{ marginBottom: '1.5rem' }}>
      
      {/* Botão de Toggle (Abre/Fecha) */}
      <button 
        onClick={() => setAberto(!aberto)}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          padding: '0.5rem 1rem', 
          borderRadius: '0.5rem', 
          border: temFiltroAtivo ? '1px solid #93c5fd' : '1px solid #d1d5db', 
          backgroundColor: temFiltroAtivo ? '#eff6ff' : '#ffffff', 
          color: temFiltroAtivo ? '#1d4ed8' : '#374151', 
          fontWeight: 'bold', 
          cursor: 'pointer', 
          transition: 'all 0.2s' 
        }}
      >
        <FilterIcon size={18} />
        {temFiltroAtivo ? 'Filtros Ativos' : 'Filtrar'}
      </button>

      {/* Card Expansível - Só aparece se 'aberto' for true */}
      {aberto && (
        <div style={{ 
          marginTop: '0.75rem',
          display: 'flex', 
          gap: '1rem', 
          flexWrap: 'wrap', // Mudei para wrap para ser mais responsivo se a tela for menor
          alignItems: 'flex-end', 
          backgroundColor: '#f9fafb', 
          padding: '1.25rem', 
          borderRadius: '0.5rem', 
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' // Adicionei uma sombra leve
        }}>
          
          <div style={{ flex: '1', minWidth: '130px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#6b7280', display: 'block', marginBottom: '0.4rem' }}>ID ATM</label>
            <input 
              type="text" name="id" list="lista-ids" placeholder="Ex: 8A4F..." 
              value={filtros.id} onChange={onFiltroChange} style={inputStyle} 
            />
            <datalist id="lista-ids">
              {opcoesFiltro.ids.map((id, index) => <option key={index} value={id} />)}
            </datalist>
          </div>

          <div style={{ flex: '1', minWidth: '150px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#6b7280', display: 'block', marginBottom: '0.4rem' }}>Solicitante</label>
            <input 
              type="text" name="solicitante" list="lista-solicitantes" placeholder="Ex: João Silva" 
              value={filtros.solicitante} onChange={onFiltroChange} style={inputStyle} 
            />
            <datalist id="lista-solicitantes">
              {opcoesFiltro.solicitantes.map((sol, index) => <option key={index} value={sol} />)}
            </datalist>
          </div>

          <div style={{ flex: '1', minWidth: '130px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#6b7280', display: 'block', marginBottom: '0.4rem' }}>Pedido (PC)</label>
            <input 
              type="text" name="pedido" list="lista-pedidos" placeholder="Nº Pedido" 
              value={filtros.pedido} onChange={onFiltroChange} style={inputStyle} 
            />
            <datalist id="lista-pedidos">
              {opcoesFiltro.pedidos.map((ped, index) => <option key={index} value={ped} />)}
            </datalist>
          </div>

          <div style={{ flex: '1', minWidth: '130px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#6b7280', display: 'block', marginBottom: '0.4rem' }}>Nota Fiscal (NF)</label>
            <input 
              type="text" name="nf" list="lista-nfs" placeholder="Nº Nota Fiscal" 
              value={filtros.nf} onChange={onFiltroChange} style={inputStyle} 
            />
            <datalist id="lista-nfs">
              {opcoesFiltro.nfs.map((nf, index) => <option key={index} value={nf} />)}
            </datalist>
          </div>

          {temFiltroAtivo && (
            <div style={{ flexShrink: 0 }}>
              <button 
                onClick={onLimpar}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 1rem', height: '38px', borderRadius: '0.375rem', border: '1px solid #fca5a5', backgroundColor: '#fee2e2', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s' }}
              >
                <XCircle size={16} /> Limpar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}