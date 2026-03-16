// src/componentes/Filtro.jsx
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Select from 'react-select'; // <-- NOVA IMPORTAÇÃO

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
  const [modoId, setModoId] = useState('especifico'); // 'especifico' ou 'lote'

  const shortId = (id) => id ? id.substring(0, 8).toUpperCase() : 'N/A';

  // Opções extraídas automaticamente do banco
  const opcoesFiltro = useMemo(() => {
    const ids = new Set();
    const solicitantes = new Set();
    const pedidos = new Set();
    const nfs = new Set();

    atms.forEach(atm => {
      // Usa o número do ATM real ou o ID curto
      if (atm.numero_atm) ids.add(String(atm.numero_atm));
      else if (atm.id) ids.add(shortId(atm.id)); 
      
      if (atm.solicitacao) solicitantes.add(atm.solicitacao);
      if (atm.pedido_compra) pedidos.add(atm.pedido_compra);
      if (atm.nf) nfs.add(atm.nf);
    });

    // Ordena os IDs para a Combo Box ficar organizada
    const idsOrdenados = Array.from(ids).sort((a, b) => a.localeCompare(b, undefined, {numeric: true}));

    return {
      ids: idsOrdenados.map(id => ({ value: id, label: id })), // Formato para o react-select
      solicitantes: Array.from(solicitantes),
      pedidos: Array.from(pedidos),
      nfs: Array.from(nfs)
    };
  }, [atms]);

  const temFiltroAtivo = Object.values(filtros).some(valor => valor !== '');

  // ==========================================
  // LÓGICA DO SMART COMBO BOX (REACT-SELECT)
  // ==========================================
  const alternarModo = (modo) => {
    setModoId(modo);
    onFiltroChange({ target: { name: 'id', value: '' } }); // Limpa o ID ao trocar de modo
  };

  const handleEspecificoChange = (selectedOptions) => {
    const valores = selectedOptions ? selectedOptions.map(opt => opt.value).join(',') : '';
    onFiltroChange({ target: { name: 'id', value: valores } });
  };

  const handleRangeChange = (tipo, selectedOption) => {
    let de = '';
    let ate = '';
    
    if (filtros.id && filtros.id.includes('-')) {
      [de, ate] = filtros.id.split('-').map(s => s.trim());
    }

    if (tipo === 'de') de = selectedOption ? selectedOption.value : '';
    if (tipo === 'ate') ate = selectedOption ? selectedOption.value : '';

    const novoValor = (de || ate) ? `${de}-${ate}` : '';
    onFiltroChange({ target: { name: 'id', value: novoValor } });
  };

  // Mapeia o texto do estado de volta para objetos do react-select
  let currentEspecifico = [];
  let currentDe = null;
  let currentAte = null;

  if (filtros.id) {
    if (modoId === 'lote' && filtros.id.includes('-')) {
      const [de, ate] = filtros.id.split('-').map(s => s.trim());
      currentDe = de ? { value: de, label: de } : null;
      currentAte = ate ? { value: ate, label: ate } : null;
    } else if (modoId === 'especifico') {
      const vals = filtros.id.split(',').map(s => s.trim()).filter(Boolean);
      currentEspecifico = vals.map(v => ({ value: v, label: v }));
    }
  }

  // Estilos da Combo Box (Para combinar perfeitamente com o seu sistema)
  const selectStyles = {
    control: (base) => ({ ...base, borderColor: '#d1d5db', boxShadow: 'none', '&:hover': { borderColor: '#9ca3af' }, borderRadius: '0.375rem', padding: '0.1rem' }),
    multiValue: (base) => ({ ...base, backgroundColor: '#dbeafe', borderRadius: '0.25rem' }),
    multiValueLabel: (base) => ({ ...base, color: '#1e40af', fontWeight: 'bold' }),
    multiValueRemove: (base) => ({ ...base, color: '#1e40af', ':hover': { backgroundColor: '#bfdbfe', color: '#1e3a8a' } }),
  };

  const inputStyle = { width: '100%', padding: '0.6rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', outline: 'none', backgroundColor: '#ffffff', color: '#111827' };

  return (
    <>
      <button 
        onClick={() => setAberto(true)}
        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', cursor: 'pointer', backgroundColor: temFiltroAtivo ? '#eff6ff' : '#ffffff', border: `1px solid ${temFiltroAtivo ? '#bfdbfe' : '#e5e7eb'}`, borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', transition: 'all 0.2s', fontWeight: '600', color: temFiltroAtivo ? '#1d4ed8' : '#374151' }}
      >
        <FilterIcon /> Filtros de Pesquisa
        {temFiltroAtivo && (<span style={{ backgroundColor: '#dbeafe', color: '#1e40af', fontSize: '0.75rem', padding: '0.1rem 0.5rem', borderRadius: '9999px', fontWeight: 'bold' }}>Ativos</span>)}
      </button>

      {aberto && createPortal(
        <div className="modal-overlay" style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content fade-in" style={{ maxWidth: '600px', width: '100%', backgroundColor: 'white', borderRadius: '0.5rem', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
              <div>
                <span className="modal-subtitle" style={{ fontSize: '0.875rem', color: '#6b7280' }}>Refine sua busca</span>
                <h2 className="modal-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>Filtros de Pesquisa</h2>
              </div>
              <button onClick={() => setAberto(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '0.5rem', borderRadius: '0.375rem', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflow: 'visible' }}>
              
              {/* ======================================= */}
              {/* SEÇÃO INTELIGENTE DO ID ATM */}
              {/* ======================================= */}
              <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#4b5563', margin: 0 }}>Filtro de ATMs</label>
                  
                  {/* Botoes de Alternancia */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" onClick={() => alternarModo('especifico')} style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', borderRadius: '0.25rem', border: '1px solid', backgroundColor: modoId === 'especifico' ? '#eff6ff' : 'white', borderColor: modoId === 'especifico' ? '#3b82f6' : '#d1d5db', color: modoId === 'especifico' ? '#1d4ed8' : '#6b7280', cursor: 'pointer', fontWeight: modoId === 'especifico' ? 'bold' : 'normal', transition: 'all 0.2s' }}>
                      Específicos (Tags)
                    </button>
                    <button type="button" onClick={() => alternarModo('lote')} style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', borderRadius: '0.25rem', border: '1px solid', backgroundColor: modoId === 'lote' ? '#eff6ff' : 'white', borderColor: modoId === 'lote' ? '#3b82f6' : '#d1d5db', color: modoId === 'lote' ? '#1d4ed8' : '#6b7280', cursor: 'pointer', fontWeight: modoId === 'lote' ? 'bold' : 'normal', transition: 'all 0.2s' }}>
                      Intervalo (Lote)
                    </button>
                  </div>
                </div>

                {modoId === 'especifico' ? (
                  <Select 
                    isMulti 
                    options={opcoesFiltro.ids} 
                    value={currentEspecifico} 
                    onChange={handleEspecificoChange} 
                    placeholder="Selecione um ou mais ATMs..."
                    styles={selectStyles}
                    noOptionsMessage={() => "Nenhum ATM encontrado"}
                  />
                ) : (
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <Select 
                        options={opcoesFiltro.ids} value={currentDe} onChange={(opt) => handleRangeChange('de', opt)}
                        placeholder="ID Inicial (De)" styles={selectStyles} isClearable
                      />
                    </div>
                    <span style={{ color: '#6b7280', fontWeight: 'bold' }}>até</span>
                    <div style={{ flex: 1 }}>
                      <Select 
                        options={opcoesFiltro.ids} value={currentAte} onChange={(opt) => handleRangeChange('ate', opt)}
                        placeholder="ID Final (Até)" styles={selectStyles} isClearable
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* OUTROS INPUTS MANTIDOS IGUAIS */}
              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#4b5563', display: 'block', marginBottom: '0.4rem' }}>Solicitante</label>
                <input type="text" name="solicitante" list="lista-solicitantes" placeholder="Ex: João Silva" value={filtros.solicitante} onChange={onFiltroChange} style={inputStyle} />
                <datalist id="lista-solicitantes">{opcoesFiltro.solicitantes.map((sol, index) => <option key={index} value={sol} />)}</datalist>
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#4b5563', display: 'block', marginBottom: '0.4rem' }}>Pedido (PC)</label>
                <input type="text" name="pedido" list="lista-pedidos" placeholder="Nº Pedido" value={filtros.pedido} onChange={onFiltroChange} style={inputStyle} />
                <datalist id="lista-pedidos">{opcoesFiltro.pedidos.map((ped, index) => <option key={index} value={ped} />)}</datalist>
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#4b5563', display: 'block', marginBottom: '0.4rem' }}>Nota Fiscal (NF)</label>
                <input type="text" name="nf" list="lista-nfs" placeholder="Nº Nota Fiscal" value={filtros.nf} onChange={onFiltroChange} style={inputStyle} />
                <datalist id="lista-nfs">{opcoesFiltro.nfs.map((nf, index) => <option key={index} value={nf} />)}</datalist>
              </div>

            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb', padding: '1rem 1.5rem' }}>
              <div>
                {temFiltroAtivo ? (
                  <button onClick={() => { onLimpar(); setAberto(false); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: '1px solid #fca5a5', backgroundColor: '#fee2e2', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fecaca'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}>
                    <XCircle size={16} /> Limpar Filtros
                  </button>
                ) : <div />}
              </div>
              <button onClick={() => setAberto(false)} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}>
                Ver Resultados
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
}