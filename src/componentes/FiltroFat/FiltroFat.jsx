// src/componentes/FiltroFat/FiltroFat.jsx
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Select from 'react-select';
import './FiltroFat.css'; // <-- Importando o novo arquivo CSS

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

  if (!aberto) return null;

  return createPortal(
    <div className="filtro-modal-overlay">
      <div className="filtro-modal-content fade-in">
        
        <div className="filtro-modal-header">
          <div>
            <span className="filtro-modal-subtitle">Refine sua busca financeira</span>
            <h2 className="filtro-modal-title">Filtros de Faturamento</h2>
          </div>
          <button onClick={onClose} className="filtro-btn-close">
            <X size={24} />
          </button>
        </div>

        <div className="filtro-modal-body">
          
          <div className="filtro-grid">
            
            {/* BLOCO: FATURA */}
            <div className="filtro-bloco">
              <div className="filtro-bloco-header">
                <label className="filtro-label">Fatura</label>
                <div className="filtro-btn-group">
                  <button type="button" onClick={() => alternarModo('fatura', 'especifico')} className={`filtro-btn-modo ${modoFatura === 'especifico' ? 'ativo' : ''}`}>Específicas</button>
                  <button type="button" onClick={() => alternarModo('fatura', 'lote')} className={`filtro-btn-modo ${modoFatura === 'lote' ? 'ativo' : ''}`}>Intervalo</button>
                </div>
              </div>
              {modoFatura === 'especifico' ? (
                <Select isMulti options={opcoesFiltro.faturas} value={getMultiValue(filtros.fatura)} onChange={(opts) => handleMultiSelectChange('fatura', opts)} placeholder="Selecionar Faturas..." styles={selectStyles} />
              ) : (
                <div className="filtro-range-container">
                  <div className="filtro-range-item"><Select options={opcoesFiltro.faturas} value={rangeFatura.currentDe} onChange={(opt) => handleRangeChange('fatura', 'de', opt)} placeholder="De" styles={selectStyles} isClearable /></div>
                  <span className="filtro-range-sep">até</span>
                  <div className="filtro-range-item"><Select options={opcoesFiltro.faturas} value={rangeFatura.currentAte} onChange={(opt) => handleRangeChange('fatura', 'ate', opt)} placeholder="Até" styles={selectStyles} isClearable /></div>
                </div>
              )}
            </div>

            {/* BLOCO: ELEMENTO PEP */}
            <div className="filtro-bloco">
              <div className="filtro-bloco-header">
                <label className="filtro-label">Elemento PEP</label>
                <div className="filtro-btn-group">
                  <button type="button" onClick={() => alternarModo('pep', 'especifico')} className={`filtro-btn-modo ${modoPep === 'especifico' ? 'ativo' : ''}`}>Específicos</button>
                  <button type="button" onClick={() => alternarModo('pep', 'lote')} className={`filtro-btn-modo ${modoPep === 'lote' ? 'ativo' : ''}`}>Intervalo</button>
                </div>
              </div>
              {modoPep === 'especifico' ? (
                <Select isMulti options={opcoesFiltro.peps} value={getMultiValue(filtros.elemento_pep)} onChange={(opts) => handleMultiSelectChange('elemento_pep', opts)} placeholder="Selecionar PEPs..." styles={selectStyles} />
              ) : (
                <div className="filtro-range-container">
                  <div className="filtro-range-item"><Select options={opcoesFiltro.peps} value={rangePep.currentDe} onChange={(opt) => handleRangeChange('elemento_pep', 'de', opt)} placeholder="De" styles={selectStyles} isClearable /></div>
                  <span className="filtro-range-sep">até</span>
                  <div className="filtro-range-item"><Select options={opcoesFiltro.peps} value={rangePep.currentAte} onChange={(opt) => handleRangeChange('elemento_pep', 'ate', opt)} placeholder="Até" styles={selectStyles} isClearable /></div>
                </div>
              )}
            </div>

            {/* BLOCO: DATA MAPEAMENTO */}
            <div className="filtro-bloco">
               <div className="filtro-bloco-header">
                <label className="filtro-label">Data Mapeamento</label>
                <div className="filtro-btn-group">
                  <button type="button" onClick={() => alternarModo('data_map', 'especifico')} className={`filtro-btn-modo ${modoDataMap === 'especifico' ? 'ativo' : ''}`}>Específicos</button>
                  <button type="button" onClick={() => alternarModo('data_map', 'lote')} className={`filtro-btn-modo ${modoDataMap === 'lote' ? 'ativo' : ''}`}>Intervalo</button>
                </div>
               </div>
               {modoDataMap === 'especifico' ? (
                 <Select isMulti options={opcoesFiltro.datasMap} value={getMultiValueData(filtros.data_map_especifica)} onChange={(opts) => handleMultiSelectChange('data_map_especifica', opts)} placeholder="Selecionar dias..." styles={selectStyles} noOptionsMessage={() => "Nenhuma data"} />
               ) : (
                 <div className="filtro-range-container">
                    <div className="filtro-range-item"><input type="date" name="data_map_inicio" value={filtros.data_map_inicio || ''} onChange={onFiltroChange} className="filtro-input" /></div>
                    <span className="filtro-range-sep">a</span>
                    <div className="filtro-range-item"><input type="date" name="data_map_fim" value={filtros.data_map_fim || ''} onChange={onFiltroChange} className="filtro-input" /></div>
                 </div>
               )}
            </div>

            {/* BLOCO: DATA EMISSÃO */}
            <div className="filtro-bloco">
               <div className="filtro-bloco-header">
                <label className="filtro-label">Data Emissão</label>
                <div className="filtro-btn-group">
                  <button type="button" onClick={() => alternarModo('data_emi', 'especifico')} className={`filtro-btn-modo ${modoDataEmi === 'especifico' ? 'ativo' : ''}`}>Específicos</button>
                  <button type="button" onClick={() => alternarModo('data_emi', 'lote')} className={`filtro-btn-modo ${modoDataEmi === 'lote' ? 'ativo' : ''}`}>Intervalo</button>
                </div>
               </div>
               {modoDataEmi === 'especifico' ? (
                 <Select isMulti options={opcoesFiltro.datasEmi} value={getMultiValueData(filtros.data_emi_especifica)} onChange={(opts) => handleMultiSelectChange('data_emi_especifica', opts)} placeholder="Selecionar dias..." styles={selectStyles} noOptionsMessage={() => "Nenhuma data"} />
               ) : (
                 <div className="filtro-range-container">
                    <div className="filtro-range-item"><input type="date" name="data_emissao_inicio" value={filtros.data_emissao_inicio || ''} onChange={onFiltroChange} className="filtro-input" /></div>
                    <span className="filtro-range-sep">a</span>
                    <div className="filtro-range-item"><input type="date" name="data_emissao_fim" value={filtros.data_emissao_fim || ''} onChange={onFiltroChange} className="filtro-input" /></div>
                 </div>
               )}
            </div>

            {/* BLOCO: DATA VENCIMENTO */}
            <div className="filtro-bloco">
               <div className="filtro-bloco-header">
                <label className="filtro-label">Data Vencimento</label>
                <div className="filtro-btn-group">
                  <button type="button" onClick={() => alternarModo('data_venc', 'especifico')} className={`filtro-btn-modo ${modoDataVenc === 'especifico' ? 'ativo' : ''}`}>Específicos</button>
                  <button type="button" onClick={() => alternarModo('data_venc', 'lote')} className={`filtro-btn-modo ${modoDataVenc === 'lote' ? 'ativo' : ''}`}>Intervalo</button>
                </div>
               </div>
               {modoDataVenc === 'especifico' ? (
                 <Select isMulti options={opcoesFiltro.datasVenc} value={getMultiValueData(filtros.data_venc_especifica)} onChange={(opts) => handleMultiSelectChange('data_venc_especifica', opts)} placeholder="Selecionar dias..." styles={selectStyles} noOptionsMessage={() => "Nenhuma data"} />
               ) : (
                 <div className="filtro-range-container">
                    <div className="filtro-range-item"><input type="date" name="data_venc_inicio" value={filtros.data_venc_inicio || ''} onChange={onFiltroChange} className="filtro-input" /></div>
                    <span className="filtro-range-sep">a</span>
                    <div className="filtro-range-item"><input type="date" name="data_venc_fim" value={filtros.data_venc_fim || ''} onChange={onFiltroChange} className="filtro-input" /></div>
                 </div>
               )}
            </div>

            {/* BLOCO: REGISTRADO SAP */}
            <div className="filtro-bloco">
              <label className="filtro-label filtro-label-block">Registrado SAP?</label>
              <select name="registrado_sap" value={filtros.registrado_sap || ''} onChange={onFiltroChange} className="filtro-input">
                <option value="">Todos (Ignorar SAP)</option>
                <option value="SIM">SIM (Já registrado)</option>
                <option value="NÃO">NÃO (Pendente registro)</option>
              </select>
            </div>

            {/* BLOCO: TIPO DOC */}
            <div className="filtro-bloco">
              <label className="filtro-label filtro-label-block">Tipo Documento</label>
              <Select isMulti options={opcoesFiltro.tiposDoc} value={getMultiValue(filtros.tipo_documento)} onChange={(opts) => handleMultiSelectChange('tipo_documento', opts)} placeholder="Ex: NFSe..." styles={selectStyles} />
            </div>

            {/* BLOCO: VALIDAÇÃO PEP */}
            <div className="filtro-bloco">
              <label className="filtro-label filtro-label-block">Validação PEP</label>
              <Select isMulti options={opcoesFiltro.validacoes} value={getMultiValue(filtros.validacao_pep)} onChange={(opts) => handleMultiSelectChange('validacao_pep', opts)} placeholder="Ex: OK..." styles={selectStyles} />
            </div>

          </div>

        </div>

        <div className="filtro-modal-footer">
          <div>
            {temFiltroAtivo ? (
              <button onClick={() => { onLimpar(); onClose(); }} className="filtro-btn-limpar">
                <XCircle size={16} /> Limpar Filtros
              </button>
            ) : <div />}
          </div>
          <button onClick={onClose} className="filtro-btn-resultados">
            Ver Resultados
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}