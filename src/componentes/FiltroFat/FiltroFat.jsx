// src/componentes/FiltroFat/FiltroFat.jsx
import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';

const XCircle = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
);
const X = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

export default function FiltroFat({ atms, filtros, onFiltroChange, onLimpar, aberto, onClose }) {
  
  const opcoesFiltro = useMemo(() => {
    const faturas = new Set();
    const peps = new Set();

    atms.forEach(atm => {
      if (atm.fatura_cte) faturas.add(atm.fatura_cte);
      if (atm.elemento_pep_cc_wbs) peps.add(atm.elemento_pep_cc_wbs);
    });

    return {
      faturas: Array.from(faturas),
      peps: Array.from(peps)
    };
  }, [atms]);

  const temFiltroAtivo = filtros.fatura !== '' || filtros.elemento_pep !== '' || filtros.registrado_sap !== '';

  const inputStyle = { width: '100%', padding: '0.6rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', outline: 'none', backgroundColor: '#ffffff', color: '#111827' };

  if (!aberto) return null;

  return createPortal(
    <div className="modal-overlay" style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content fade-in" style={{ maxWidth: '500px', width: '100%', backgroundColor: 'white', borderRadius: '0.5rem', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <div>
            <span className="modal-subtitle" style={{ fontSize: '0.875rem', color: '#6b7280' }}>Refine sua busca</span>
            <h2 className="modal-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#047857' }}>Filtros de Faturamento</h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '0.5rem', borderRadius: '0.375rem', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div>
            <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#4b5563', display: 'block', marginBottom: '0.4rem' }}>Fatura</label>
            <input type="text" name="fatura" list="lista-faturas" placeholder="Nº da Fatura" value={filtros.fatura} onChange={onFiltroChange} style={inputStyle} />
            <datalist id="lista-faturas">{opcoesFiltro.faturas.map((fat, idx) => <option key={idx} value={fat} />)}</datalist>
          </div>

          <div>
            <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#4b5563', display: 'block', marginBottom: '0.4rem' }}>Elemento PEP</label>
            <input type="text" name="elemento_pep" list="lista-peps" placeholder="Código PEP" value={filtros.elemento_pep} onChange={onFiltroChange} style={inputStyle} />
            <datalist id="lista-peps">{opcoesFiltro.peps.map((pep, idx) => <option key={idx} value={pep} />)}</datalist>
          </div>

          <div>
            <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#4b5563', display: 'block', marginBottom: '0.4rem' }}>Registrado SAP</label>
            <select name="registrado_sap" value={filtros.registrado_sap} onChange={onFiltroChange} style={inputStyle}>
              <option value="">Todos</option>
              <option value="SIM">SIM</option>
              <option value="NÃO">NÃO</option>
            </select>
          </div>

        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb', padding: '1rem 1.5rem' }}>
          <div>
            {temFiltroAtivo ? (
              <button onClick={() => { onLimpar(); onClose(); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: '1px solid #fca5a5', backgroundColor: '#fee2e2', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer' }}>
                <XCircle size={16} /> Limpar
              </button>
            ) : <div />}
          </div>
          <button onClick={onClose} style={{ backgroundColor: '#059669', color: 'white', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer' }}>
            Aplicar e Fechar
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}