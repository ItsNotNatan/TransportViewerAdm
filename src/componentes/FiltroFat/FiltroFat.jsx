// src/componentes/FiltroFat/FiltroFat.jsx
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Select from 'react-select';

const XCircle = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
);
const X = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

export default function FiltroFat({ atms, filtros, onFiltroChange, onLimpar, aberto, onClose }) {
  // ESTADOS DOS MODOS DE PESQUISA
  const [modoFatura, setModoFatura] = useState('especifico');
  const [modoPep, setModoPep] = useState('especifico');
  const [modoDataMap, setModoDataMap] = useState('lote');
  const [modoDataEmi, setModoDataEmi] = useState('lote');
  const [modoDataVenc, setModoDataVenc] = useState('lote');

  const opcoesFiltro = useMemo(() => {
    const faturas = new Set();
    const peps = new Set();
    const tiposDoc = new Set();
    const validacoes = new Set();
    const datasMap = new Set();
    const datasEmi = new Set();
    const datasVenc = new Set();

    atms.forEach(atm => {
      if (atm.fatura_cte) faturas.add(atm.fatura_cte.trim());
      if (atm.elemento_pep_cc_wbs) peps.add(atm.elemento_pep_cc_wbs.trim());
      else if (atm.wbs) peps.add(atm.wbs.trim());
      if (atm.tipo_documento) tiposDoc.add(atm.tipo_documento.trim());
      if (atm.validacao_pep) validacoes.add(atm.validacao_pep.trim());
      
      // Coletando datas
      if (atm.data_mapeamento) datasMap.add(atm.data_mapeamento.split('T')[0]);
      if (atm.data_emissao) datasEmi.add(atm.data_emissao.split('T')[0]);
      if (atm.vencimento) datasVenc.add(atm.vencimento.split('T')[0]);
    });

    const formatarOpcoes = (set) => Array.from(set).filter(Boolean).sort().map(item => ({ value: item, label: item }));
    
    const formatarData = (set) => Array.from(set).filter(Boolean).sort().map(d => {
      const [ano, mes, dia] = d.split('-');
      return { value: d, label: `${dia}/${mes}/${ano}` };
    });

    return {
      faturas: formatarOpcoes(faturas),
      peps: formatarOpcoes(peps),
      tiposDoc: formatarOpcoes(tiposDoc),
      validacoes: formatarOpcoes(validacoes),
      datasMap: formatarData(datasMap),
      datasEmi: formatarData(datasEmi),
      datasVenc: formatarData(datasVenc)
    };
  }, [atms]);

  const temFiltroAtivo = [
    filtros.fatura, filtros.elemento_pep, filtros.registrado_sap, 
    filtros.tipo_documento, filtros.validacao_pep,
    filtros.data_map_inicio, filtros.data_map_fim, filtros.data_map_especifica,
    filtros.data_emissao_inicio, filtros.data_emissao_fim, filtros.data_emi_especifica,
    filtros.data_venc_inicio, filtros.data_venc_fim, filtros.data_venc_especifica
  ].some(valor => valor !== '' && valor !== undefined);

  const alternarModo = (campo, modo) => {
    if (campo === 'fatura') { setModoFatura(modo); onFiltroChange({ target: { name: 'fatura', value: '' } }); }
    if (campo === 'pep') { setModoPep(modo); onFiltroChange({ target: { name: 'elemento_pep', value: '' } }); }
    if (campo === 'data_map') { setModoDataMap(modo); onFiltroChange({ target: { name: 'data_map_inicio', value: '' } }); onFiltroChange({ target: { name: 'data_map_fim', value: '' } }); onFiltroChange({ target: { name: 'data_map_especifica', value: '' } }); }
    if (campo === 'data_emi') { setModoDataEmi(modo); onFiltroChange({ target: { name: 'data_emissao_inicio', value: '' } }); onFiltroChange({ target: { name: 'data_emissao_fim', value: '' } }); onFiltroChange({ target: { name: 'data_emi_especifica', value: '' } }); }
    if (campo === 'data_venc') { setModoDataVenc(modo); onFiltroChange({ target: { name: 'data_venc_inicio', value: '' } }); onFiltroChange({ target: { name: 'data_venc_fim', value: '' } }); onFiltroChange({ target: { name: 'data_venc_especifica', value: '' } }); }
  };

  const handleMultiSelectChange = (name, selectedOptions) => {
    const valores = selectedOptions ? selectedOptions.map(opt => opt.value).join(',') : '';
    onFiltroChange({ target: { name, value: valores } });
  };

  const handleRangeChange = (campo, tipo, selectedOption) => {
    let de = ''; let ate = '';
    if (filtros[campo] && filtros[campo].includes('-')) {
      [de, ate] = filtros[campo].split('-').map(s => s.trim());
    }
    if (tipo === 'de') de = selectedOption ? selectedOption.value : '';
    if (tipo === 'ate') ate = selectedOption ? selectedOption.value : '';
    onFiltroChange({ target: { name: campo, value: (de || ate) ? `${de}-${ate}` : '' } });
  };

  const getMultiValue = (str) => {
    if (!str) return [];
    return str.split(',').filter(Boolean).map(v => ({ value: v.trim(), label: v.trim() }));
  };

  const getMultiValueData = (str) => {
    if (!str) return [];
    return str.split(',').filter(Boolean).map(v => {
      const [ano, mes, dia] = v.trim().split('-');
      return { value: v.trim(), label: `${dia}/${mes}/${ano}` };
    });
  };

  const getRangeValues = (campo, modo) => {
    let currentDe = null; let currentAte = null;
    if (filtros[campo] && modo === 'lote' && filtros[campo].includes('-')) {
      const [de, ate] = filtros[campo].split('-').map(s => s.trim());
      currentDe = de ? { value: de, label: de } : null;
      currentAte = ate ? { value: ate, label: ate } : null;
    }
    return { currentDe, currentAte };
  };

  const rangeFatura = getRangeValues('fatura', modoFatura);
  const rangePep = getRangeValues('elemento_pep', modoPep);

  const selectStyles = {
    control: (base) => ({ ...base, borderColor: '#d1d5db', boxShadow: 'none', '&:hover': { borderColor: '#a7f3d0' }, borderRadius: '0.375rem', padding: '0.1rem' }),
    multiValue: (base) => ({ ...base, backgroundColor: '#d1fae5', borderRadius: '0.25rem' }),
    multiValueLabel: (base) => ({ ...base, color: '#065f46', fontWeight: 'bold' }),
    multiValueRemove: (base) => ({ ...base, color: '#065f46', ':hover': { backgroundColor: '#a7f3d0', color: '#064e3b' } }),
  };

  const inputStyle = { width: '100%', padding: '0.55rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', outline: 'none', backgroundColor: '#ffffff', color: '#111827' };

  if (!aberto) return null;

  return createPortal(
    <div className="modal-overlay" style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content fade-in" style={{ maxWidth: '850px', width: '100%', backgroundColor: 'white', borderRadius: '0.5rem', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <div>
            <span className="modal-subtitle" style={{ fontSize: '0.875rem', color: '#6b7280' }}>Refine sua busca financeira</span>
            <h2 className="modal-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#047857' }}>Filtros de Faturamento</h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '0.5rem', borderRadius: '0.375rem', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            
            {/* BLOCO: FATURA */}
            <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4b5563', margin: 0 }}>Fatura / CTe</label>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button type="button" onClick={() => alternarModo('fatura', 'especifico')} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', borderRadius: '0.25rem', border: '1px solid', backgroundColor: modoFatura === 'especifico' ? '#ecfdf5' : 'white', borderColor: modoFatura === 'especifico' ? '#10b981' : '#d1d5db', color: modoFatura === 'especifico' ? '#047857' : '#6b7280', cursor: 'pointer', fontWeight: modoFatura === 'especifico' ? 'bold' : 'normal' }}>Específicas</button>
                  <button type="button" onClick={() => alternarModo('fatura', 'lote')} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', borderRadius: '0.25rem', border: '1px solid', backgroundColor: modoFatura === 'lote' ? '#ecfdf5' : 'white', borderColor: modoFatura === 'lote' ? '#10b981' : '#d1d5db', color: modoFatura === 'lote' ? '#047857' : '#6b7280', cursor: 'pointer', fontWeight: modoFatura === 'lote' ? 'bold' : 'normal' }}>Intervalo</button>
                </div>
              </div>
              {modoFatura === 'especifico' ? (
                <Select isMulti options={opcoesFiltro.faturas} value={getMultiValue(filtros.fatura)} onChange={(opts) => handleMultiSelectChange('fatura', opts)} placeholder="Selecionar Faturas..." styles={selectStyles} />
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}><Select options={opcoesFiltro.faturas} value={rangeFatura.currentDe} onChange={(opt) => handleRangeChange('fatura', 'de', opt)} placeholder="De" styles={selectStyles} isClearable /></div>
                  <span style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: 'bold' }}>até</span>
                  <div style={{ flex: 1 }}><Select options={opcoesFiltro.faturas} value={rangeFatura.currentAte} onChange={(opt) => handleRangeChange('fatura', 'ate', opt)} placeholder="Até" styles={selectStyles} isClearable /></div>
                </div>
              )}
            </div>

            {/* BLOCO: ELEMENTO PEP */}
            <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4b5563', margin: 0 }}>Elemento PEP / WBS</label>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button type="button" onClick={() => alternarModo('pep', 'especifico')} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', borderRadius: '0.25rem', border: '1px solid', backgroundColor: modoPep === 'especifico' ? '#ecfdf5' : 'white', borderColor: modoPep === 'especifico' ? '#10b981' : '#d1d5db', color: modoPep === 'especifico' ? '#047857' : '#6b7280', cursor: 'pointer', fontWeight: modoPep === 'especifico' ? 'bold' : 'normal' }}>Específicos</button>
                  <button type="button" onClick={() => alternarModo('pep', 'lote')} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', borderRadius: '0.25rem', border: '1px solid', backgroundColor: modoPep === 'lote' ? '#ecfdf5' : 'white', borderColor: modoPep === 'lote' ? '#10b981' : '#d1d5db', color: modoPep === 'lote' ? '#047857' : '#6b7280', cursor: 'pointer', fontWeight: modoPep === 'lote' ? 'bold' : 'normal' }}>Intervalo</button>
                </div>
              </div>
              {modoPep === 'especifico' ? (
                <Select isMulti options={opcoesFiltro.peps} value={getMultiValue(filtros.elemento_pep)} onChange={(opts) => handleMultiSelectChange('elemento_pep', opts)} placeholder="Selecionar PEPs..." styles={selectStyles} />
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}><Select options={opcoesFiltro.peps} value={rangePep.currentDe} onChange={(opt) => handleRangeChange('elemento_pep', 'de', opt)} placeholder="De" styles={selectStyles} isClearable /></div>
                  <span style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: 'bold' }}>até</span>
                  <div style={{ flex: 1 }}><Select options={opcoesFiltro.peps} value={rangePep.currentAte} onChange={(opt) => handleRangeChange('elemento_pep', 'ate', opt)} placeholder="Até" styles={selectStyles} isClearable /></div>
                </div>
              )}
            </div>

            {/* BLOCO: DATA MAPEAMENTO */}
            <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4b5563', margin: 0 }}>Data Mapeamento</label>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button type="button" onClick={() => alternarModo('data_map', 'especifico')} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', borderRadius: '0.25rem', border: '1px solid', backgroundColor: modoDataMap === 'especifico' ? '#ecfdf5' : 'white', borderColor: modoDataMap === 'especifico' ? '#10b981' : '#d1d5db', color: modoDataMap === 'especifico' ? '#047857' : '#6b7280', cursor: 'pointer', fontWeight: modoDataMap === 'especifico' ? 'bold' : 'normal' }}>Específicos</button>
                  <button type="button" onClick={() => alternarModo('data_map', 'lote')} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', borderRadius: '0.25rem', border: '1px solid', backgroundColor: modoDataMap === 'lote' ? '#ecfdf5' : 'white', borderColor: modoDataMap === 'lote' ? '#10b981' : '#d1d5db', color: modoDataMap === 'lote' ? '#047857' : '#6b7280', cursor: 'pointer', fontWeight: modoDataMap === 'lote' ? 'bold' : 'normal' }}>Intervalo</button>
                </div>
               </div>
               {modoDataMap === 'especifico' ? (
                 <Select isMulti options={opcoesFiltro.datasMap} value={getMultiValueData(filtros.data_map_especifica)} onChange={(opts) => handleMultiSelectChange('data_map_especifica', opts)} placeholder="Selecionar dias..." styles={selectStyles} noOptionsMessage={() => "Nenhuma data"} />
               ) : (
                 <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}><input type="date" name="data_map_inicio" value={filtros.data_map_inicio || ''} onChange={onFiltroChange} style={inputStyle} /></div>
                    <span style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: 'bold' }}>a</span>
                    <div style={{ flex: 1 }}><input type="date" name="data_map_fim" value={filtros.data_map_fim || ''} onChange={onFiltroChange} style={inputStyle} /></div>
                 </div>
               )}
            </div>

            {/* BLOCO: DATA EMISSÃO */}
            <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4b5563', margin: 0 }}>Data Emissão</label>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button type="button" onClick={() => alternarModo('data_emi', 'especifico')} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', borderRadius: '0.25rem', border: '1px solid', backgroundColor: modoDataEmi === 'especifico' ? '#ecfdf5' : 'white', borderColor: modoDataEmi === 'especifico' ? '#10b981' : '#d1d5db', color: modoDataEmi === 'especifico' ? '#047857' : '#6b7280', cursor: 'pointer', fontWeight: modoDataEmi === 'especifico' ? 'bold' : 'normal' }}>Específicos</button>
                  <button type="button" onClick={() => alternarModo('data_emi', 'lote')} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', borderRadius: '0.25rem', border: '1px solid', backgroundColor: modoDataEmi === 'lote' ? '#ecfdf5' : 'white', borderColor: modoDataEmi === 'lote' ? '#10b981' : '#d1d5db', color: modoDataEmi === 'lote' ? '#047857' : '#6b7280', cursor: 'pointer', fontWeight: modoDataEmi === 'lote' ? 'bold' : 'normal' }}>Intervalo</button>
                </div>
               </div>
               {modoDataEmi === 'especifico' ? (
                 <Select isMulti options={opcoesFiltro.datasEmi} value={getMultiValueData(filtros.data_emi_especifica)} onChange={(opts) => handleMultiSelectChange('data_emi_especifica', opts)} placeholder="Selecionar dias..." styles={selectStyles} noOptionsMessage={() => "Nenhuma data"} />
               ) : (
                 <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}><input type="date" name="data_emissao_inicio" value={filtros.data_emissao_inicio || ''} onChange={onFiltroChange} style={inputStyle} /></div>
                    <span style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: 'bold' }}>a</span>
                    <div style={{ flex: 1 }}><input type="date" name="data_emissao_fim" value={filtros.data_emissao_fim || ''} onChange={onFiltroChange} style={inputStyle} /></div>
                 </div>
               )}
            </div>

            {/* BLOCO: DATA VENCIMENTO */}
            <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4b5563', margin: 0 }}>Data Vencimento</label>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button type="button" onClick={() => alternarModo('data_venc', 'especifico')} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', borderRadius: '0.25rem', border: '1px solid', backgroundColor: modoDataVenc === 'especifico' ? '#ecfdf5' : 'white', borderColor: modoDataVenc === 'especifico' ? '#10b981' : '#d1d5db', color: modoDataVenc === 'especifico' ? '#047857' : '#6b7280', cursor: 'pointer', fontWeight: modoDataVenc === 'especifico' ? 'bold' : 'normal' }}>Específicos</button>
                  <button type="button" onClick={() => alternarModo('data_venc', 'lote')} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', borderRadius: '0.25rem', border: '1px solid', backgroundColor: modoDataVenc === 'lote' ? '#ecfdf5' : 'white', borderColor: modoDataVenc === 'lote' ? '#10b981' : '#d1d5db', color: modoDataVenc === 'lote' ? '#047857' : '#6b7280', cursor: 'pointer', fontWeight: modoDataVenc === 'lote' ? 'bold' : 'normal' }}>Intervalo</button>
                </div>
               </div>
               {modoDataVenc === 'especifico' ? (
                 <Select isMulti options={opcoesFiltro.datasVenc} value={getMultiValueData(filtros.data_venc_especifica)} onChange={(opts) => handleMultiSelectChange('data_venc_especifica', opts)} placeholder="Selecionar dias..." styles={selectStyles} noOptionsMessage={() => "Nenhuma data"} />
               ) : (
                 <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}><input type="date" name="data_venc_inicio" value={filtros.data_venc_inicio || ''} onChange={onFiltroChange} style={inputStyle} /></div>
                    <span style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: 'bold' }}>a</span>
                    <div style={{ flex: 1 }}><input type="date" name="data_venc_fim" value={filtros.data_venc_fim || ''} onChange={onFiltroChange} style={inputStyle} /></div>
                 </div>
               )}
            </div>

            {/* BLOCO: REGISTRADO SAP */}
            <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4b5563', display: 'block', marginBottom: '0.4rem' }}>Registrado SAP?</label>
              <select name="registrado_sap" value={filtros.registrado_sap || ''} onChange={onFiltroChange} style={inputStyle}>
                <option value="">Todos (Ignorar SAP)</option>
                <option value="SIM">SIM (Já registrado)</option>
                <option value="NÃO">NÃO (Pendente registro)</option>
              </select>
            </div>

            {/* BLOCO: TIPO DOC E VALIDAÇÃO PEP */}
            <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4b5563', display: 'block', marginBottom: '0.4rem' }}>Tipo Documento</label>
              <Select isMulti options={opcoesFiltro.tiposDoc} value={getMultiValue(filtros.tipo_documento)} onChange={(opts) => handleMultiSelectChange('tipo_documento', opts)} placeholder="Ex: NFSe..." styles={selectStyles} />
            </div>

            <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4b5563', display: 'block', marginBottom: '0.4rem' }}>Validação PEP</label>
              <Select isMulti options={opcoesFiltro.validacoes} value={getMultiValue(filtros.validacao_pep)} onChange={(opts) => handleMultiSelectChange('validacao_pep', opts)} placeholder="Ex: OK..." styles={selectStyles} />
            </div>

          </div>

        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb', padding: '1rem 1.5rem' }}>
          <div>
            {temFiltroAtivo ? (
              <button onClick={() => { onLimpar(); onClose(); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: '1px solid #fca5a5', backgroundColor: '#fee2e2', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer' }}>
                <XCircle size={16} /> Limpar Filtros
              </button>
            ) : <div />}
          </div>
          <button onClick={onClose} style={{ backgroundColor: '#059669', color: 'white', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer' }}>
            Ver Resultados
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}