// src/componentes/FiltroOP/FiltroOP.jsx
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Select from 'react-select';

const XCircle = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
);
const X = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

export default function FiltroOP({ atms, filtros, onFiltroChange, onLimpar, aberto, onClose }) {
  const [modoId, setModoId] = useState('especifico');

  const shortId = (id) => id ? id.substring(0, 8).toUpperCase() : 'N/A';

  // Extrai todas as opções únicas disponíveis nos ATMs
  const opcoesFiltro = useMemo(() => {
    const ids = new Set();
    const solicitantes = new Set();
    const pedidos = new Set();
    const nfs = new Set();
    const statusList = new Set();
    const transportadoras = new Set();

    atms.forEach(atm => {
      if (atm.numero_atm) ids.add(String(atm.numero_atm));
      else if (atm.id) ids.add(shortId(atm.id)); 
      
      if (atm.solicitacao) solicitantes.add(atm.solicitacao);
      if (atm.pedido_compra) pedidos.add(atm.pedido_compra);
      if (atm.nf) nfs.add(atm.nf);
      if (atm.status) statusList.add(atm.status);
      if (atm.transportadora?.nome) transportadoras.add(atm.transportadora.nome);
    });

    const formatarOpcoes = (set) => Array.from(set).filter(Boolean).sort().map(item => ({ value: item, label: item }));

    return {
      ids: Array.from(ids).sort((a, b) => a.localeCompare(b, undefined, {numeric: true})).map(id => ({ value: id, label: id })),
      solicitantes: formatarOpcoes(solicitantes),
      pedidos: formatarOpcoes(pedidos),
      nfs: formatarOpcoes(nfs),
      status: formatarOpcoes(statusList),
      transportadoras: formatarOpcoes(transportadoras)
    };
  }, [atms]);

  // Verifica se há pelo menos um filtro de Operação ativo
  const temFiltroAtivo = [filtros.id, filtros.solicitante, filtros.pedido, filtros.nf, filtros.status, filtros.transportadora, filtros.data_inicio, filtros.data_fim].some(valor => valor !== '');

  const alternarModo = (modo) => {
    setModoId(modo);
    onFiltroChange({ target: { name: 'id', value: '' } });
  };

  // Lida com todos os Selects múltiplos
  const handleMultiSelectChange = (name, selectedOptions) => {
    const valores = selectedOptions ? selectedOptions.map(opt => opt.value).join(',') : '';
    onFiltroChange({ target: { name, value: valores } });
  };

  const handleRangeChange = (tipo, selectedOption) => {
    let de = ''; let ate = '';
    if (filtros.id && filtros.id.includes('-')) [de, ate] = filtros.id.split('-').map(s => s.trim());
    if (tipo === 'de') de = selectedOption ? selectedOption.value : '';
    if (tipo === 'ate') ate = selectedOption ? selectedOption.value : '';
    onFiltroChange({ target: { name: 'id', value: (de || ate) ? `${de}-${ate}` : '' } });
  };

  // Funções para converter a string separada por vírgula em Objetos para o react-select ler
  const getMultiValue = (str) => {
    if (!str) return [];
    return str.split(',').filter(Boolean).map(v => ({ value: v.trim(), label: v.trim() }));
  };

  let currentDe = null; let currentAte = null;
  if (filtros.id && modoId === 'lote' && filtros.id.includes('-')) {
    const [de, ate] = filtros.id.split('-').map(s => s.trim());
    currentDe = de ? { value: de, label: de } : null;
    currentAte = ate ? { value: ate, label: ate } : null;
  }

  const selectStyles = {
    control: (base) => ({ ...base, borderColor: '#d1d5db', boxShadow: 'none', '&:hover': { borderColor: '#9ca3af' }, borderRadius: '0.375rem', padding: '0.1rem' }),
    multiValue: (base) => ({ ...base, backgroundColor: '#dbeafe', borderRadius: '0.25rem' }),
    multiValueLabel: (base) => ({ ...base, color: '#1e40af', fontWeight: 'bold' }),
    multiValueRemove: (base) => ({ ...base, color: '#1e40af', ':hover': { backgroundColor: '#bfdbfe', color: '#1e3a8a' } }),
  };

  const inputStyle = { width: '100%', padding: '0.6rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', outline: 'none', backgroundColor: '#ffffff', color: '#111827' };

  if (!aberto) return null;

  return createPortal(
    <div className="modal-overlay" style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content fade-in" style={{ maxWidth: '750px', width: '100%', backgroundColor: 'white', borderRadius: '0.5rem', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <div>
            <span className="modal-subtitle" style={{ fontSize: '0.875rem', color: '#6b7280' }}>Refine sua busca</span>
            <h2 className="modal-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>Filtros da Operação</h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '0.5rem', borderRadius: '0.375rem', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflow: 'visible' }}>
          
          {/* BLOCO 1: ID ATM */}
          <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#4b5563', margin: 0 }}>ID ATM</label>
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
              <Select isMulti options={opcoesFiltro.ids} value={getMultiValue(filtros.id)} onChange={(opts) => handleMultiSelectChange('id', opts)} placeholder="Selecione um ou mais ATMs..." styles={selectStyles} noOptionsMessage={() => "Nenhum ATM encontrado"} />
            ) : (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ flex: 1 }}><Select options={opcoesFiltro.ids} value={currentDe} onChange={(opt) => handleRangeChange('de', opt)} placeholder="ID Inicial (De)" styles={selectStyles} isClearable /></div>
                <span style={{ color: '#6b7280', fontWeight: 'bold' }}>até</span>
                <div style={{ flex: 1 }}><Select options={opcoesFiltro.ids} value={currentAte} onChange={(opt) => handleRangeChange('ate', opt)} placeholder="ID Final (Até)" styles={selectStyles} isClearable /></div>
              </div>
            )}
          </div>

          {/* BLOCO 2: PERÍODO DE SOLICITAÇÃO */}
          <div>
             <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#4b5563', display: 'block', marginBottom: '0.4rem' }}>Período da Solicitação</label>
             <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <input type="date" name="data_inicio" value={filtros.data_inicio || ''} onChange={onFiltroChange} style={inputStyle} />
                </div>
                <span style={{ color: '#6b7280', fontWeight: 'bold' }}>até</span>
                <div style={{ flex: 1 }}>
                  <input type="date" name="data_fim" value={filtros.data_fim || ''} onChange={onFiltroChange} style={inputStyle} />
                </div>
             </div>
          </div>

          {/* BLOCO 3: GRID COM OS OUTROS FILTROS (2 COLUNAS PARA ECONOMIZAR ESPAÇO) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            
            <div>
              <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#4b5563', display: 'block', marginBottom: '0.4rem' }}>Status</label>
              <Select isMulti options={opcoesFiltro.status} value={getMultiValue(filtros.status)} onChange={(opts) => handleMultiSelectChange('status', opts)} placeholder="Ex: Entregue..." styles={selectStyles} />
            </div>

            <div>
              <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#4b5563', display: 'block', marginBottom: '0.4rem' }}>Transportadora</label>
              <Select isMulti options={opcoesFiltro.transportadoras} value={getMultiValue(filtros.transportadora)} onChange={(opts) => handleMultiSelectChange('transportadora', opts)} placeholder="Selecione..." styles={selectStyles} />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#4b5563', display: 'block', marginBottom: '0.4rem' }}>Solicitante(s)</label>
              <Select isMulti options={opcoesFiltro.solicitantes} value={getMultiValue(filtros.solicitante)} onChange={(opts) => handleMultiSelectChange('solicitante', opts)} placeholder="Selecione..." styles={selectStyles} />
            </div>

            <div>
              <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#4b5563', display: 'block', marginBottom: '0.4rem' }}>Pedido(s) (PC)</label>
              <Select isMulti options={opcoesFiltro.pedidos} value={getMultiValue(filtros.pedido)} onChange={(opts) => handleMultiSelectChange('pedido', opts)} placeholder="Selecione..." styles={selectStyles} />
            </div>

            <div>
              <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#4b5563', display: 'block', marginBottom: '0.4rem' }}>Nota(s) Fiscal (NF)</label>
              <Select isMulti options={opcoesFiltro.nfs} value={getMultiValue(filtros.nf)} onChange={(opts) => handleMultiSelectChange('nf', opts)} placeholder="Selecione..." styles={selectStyles} />
            </div>

          </div>

        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb', padding: '1rem 1.5rem' }}>
          <div>
            {temFiltroAtivo ? (
              <button onClick={() => { onLimpar(); onClose(); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: '1px solid #fca5a5', backgroundColor: '#fee2e2', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fecaca'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}>
                <XCircle size={16} /> Limpar Filtros
              </button>
            ) : <div />}
          </div>
          <button onClick={onClose} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}>
            Ver Resultados
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}