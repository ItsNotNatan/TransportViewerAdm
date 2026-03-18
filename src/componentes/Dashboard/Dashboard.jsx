// src/componentes/Dashboard/Dashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import FiltroOP from '../FiltroOP/FiltroOP'; 
import FiltroFat from '../FiltroFat/FiltroFat';
import BtnExcel from '../BtnExcel/BtnExcel';
import './Dashboard.css';

const TableList = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="3" x2="21" y1="15" y2="15"/><line x1="9" x2="9" y1="9" y2="21"/></svg>;
const FolderOpen = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>;

export default function Dashboard({ atms, carregando, onOpenAtm }) {
  const [filtros, setFiltros] = useState({ 
    id: '', solicitante: '', pedido: '', nf: '', data_inicio: '', data_fim: '', data_especifica: '', status: '', transportadora: '',
    fatura: '', elemento_pep: '', registrado_sap: '', tipo_documento: '', validacao_pep: '',
    data_map_inicio: '', data_map_fim: '', data_map_especifica: '',
    data_emissao_inicio: '', data_emissao_fim: '', data_emi_especifica: '',
    data_venc_inicio: '', data_venc_fim: '', data_venc_especifica: '' 
  });
  
  const [abertoFiltroOp, setAbertoFiltroOp] = useState(false);
  const [abertoFiltroFat, setAbertoFiltroFat] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 20;

  const topScrollRef = useRef(null);
  const tableScrollRef = useRef(null);
  const tableContentRef = useRef(null);
  const isSyncing = useRef(false);
  const [tableWidth, setTableWidth] = useState(0);

  useEffect(() => { setPaginaAtual(1); }, [filtros]);

  useEffect(() => {
    if (tableContentRef.current) {
      setTableWidth(tableContentRef.current.scrollWidth);
    }
  }, [atms, filtros, paginaAtual]);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const shortId = (id) => id ? id.substring(0, 8).toUpperCase() : 'N/A';

  const formatarDataCurta = (dataStr) => {
    if (!dataStr) return '-';
    const partes = dataStr.split('T')[0].split('-');
    if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0].substring(2,4)}`; 
    return dataStr;
  };

  const matchMultiSelect = (valorBanco, valorFiltro) => {
    if (!valorFiltro) return true; 
    const termos = valorFiltro.toUpperCase().split(',').map(t => t.trim()).filter(Boolean);
    return termos.some(termo => String(valorBanco || '').toUpperCase().includes(termo));
  };

  const matchFiltroComIntervalo = (valorBanco, stringFiltro) => {
    if (!stringFiltro) return true;
    if (!valorBanco) return false;

    const valorStr = String(valorBanco).toUpperCase().trim();
    const busca = stringFiltro.toUpperCase().trim();

    if (busca.includes(',')) { 
      const termos = busca.split(',').map(t => t.trim()).filter(Boolean);
      return termos.some(termo => valorStr.includes(termo));
    } 
    else if (busca.includes('-')) { 
      const [inicio, fim] = busca.split('-').map(t => t.trim());
      if (inicio && fim) {
        if (!isNaN(inicio) && !isNaN(fim) && !isNaN(valorStr)) {
          return Number(valorStr) >= Number(inicio) && Number(valorStr) <= Number(fim);
        } else {
          return valorStr >= inicio && valorStr <= fim; 
        }
      } else {
        return valorStr.includes(busca);
      }
    } 
    else {
      return valorStr.includes(busca);
    }
  };

  const isDataNoIntervalo = (dataBancoStr, dataFiltroInicio, dataFiltroFim) => {
    if (!dataFiltroInicio && !dataFiltroFim) return true;
    if (!dataBancoStr) return false;
    
    const dBanco = new Date(dataBancoStr.split('T')[0]);
    if (dataFiltroInicio && dBanco < new Date(dataFiltroInicio)) return false;
    if (dataFiltroFim && dBanco > new Date(dataFiltroFim)) return false;
    return true;
  };

  const atmsFiltrados = atms.filter(atm => {
    const idCurtoAtm = shortId(atm.id);
    const atmNum = atm.numero_atm ? String(atm.numero_atm).toUpperCase().trim() : '';
    const valorIdComparacao = atmNum || idCurtoAtm;

    const matchId = matchFiltroComIntervalo(valorIdComparacao, filtros.id);
    const matchPedido = matchFiltroComIntervalo(atm.pedido_compra, filtros.pedido);
    const matchNf = matchFiltroComIntervalo(atm.nf, filtros.nf);
    const matchSolicitante = matchMultiSelect(atm.solicitacao, filtros.solicitante);
    const matchStatus = matchMultiSelect(atm.status, filtros.status);
    const matchTransportadora = matchMultiSelect(atm.transportadora?.nome, filtros.transportadora);
    
    let matchDataOp = true;
    const atmDateOpStr = atm.data_solicitacao ? atm.data_solicitacao.split('T')[0] : null;
    if (filtros.data_especifica) {
      if (!atmDateOpStr) matchDataOp = false;
      else {
        const datasSelecionadas = filtros.data_especifica.split(',').map(d => d.trim());
        matchDataOp = datasSelecionadas.includes(atmDateOpStr);
      }
    } else {
      matchDataOp = isDataNoIntervalo(atmDateOpStr, filtros.data_inicio, filtros.data_fim);
    }
    
    const matchFatura = matchFiltroComIntervalo(atm.fatura_cte, filtros.fatura);
    const matchPep = matchFiltroComIntervalo(atm.elemento_pep_cc_wbs || atm.wbs, filtros.elemento_pep);
    const matchTipoDoc = matchMultiSelect(atm.tipo_documento, filtros.tipo_documento);
    const matchValidPep = matchMultiSelect(atm.validacao_pep, filtros.validacao_pep);
    
    let matchDataMap = true;
    const atmDataMapStr = atm.data_mapeamento ? atm.data_mapeamento.split('T')[0] : null;
    if (filtros.data_map_especifica) {
      if (!atmDataMapStr) matchDataMap = false;
      else matchDataMap = filtros.data_map_especifica.split(',').map(d => d.trim()).includes(atmDataMapStr);
    } else {
      matchDataMap = isDataNoIntervalo(atmDataMapStr, filtros.data_map_inicio, filtros.data_map_fim);
    }

    let matchDataEmi = true;
    const atmDataEmiStr = atm.data_emissao ? atm.data_emissao.split('T')[0] : null;
    if (filtros.data_emi_especifica) {
      if (!atmDataEmiStr) matchDataEmi = false;
      else matchDataEmi = filtros.data_emi_especifica.split(',').map(d => d.trim()).includes(atmDataEmiStr);
    } else {
      matchDataEmi = isDataNoIntervalo(atmDataEmiStr, filtros.data_emissao_inicio, filtros.data_emissao_fim);
    }

    let matchDataVenc = true;
    const atmDataVencStr = atm.vencimento ? atm.vencimento.split('T')[0] : null;
    if (filtros.data_venc_especifica) {
      if (!atmDataVencStr) matchDataVenc = false;
      else matchDataVenc = filtros.data_venc_especifica.split(',').map(d => d.trim()).includes(atmDataVencStr);
    } else {
      matchDataVenc = isDataNoIntervalo(atmDataVencStr, filtros.data_venc_inicio, filtros.data_venc_fim);
    }

    let matchSap = true;
    if (filtros.registrado_sap) matchSap = (atm.registrado_sap || 'NÃO').toUpperCase() === filtros.registrado_sap;

    return matchId && matchDataOp && matchSolicitante && matchPedido && matchNf && matchStatus && matchTransportadora && 
           matchFatura && matchPep && matchTipoDoc && matchValidPep && matchDataMap && matchDataEmi && matchDataVenc && matchSap;
  });

  const totalPaginas = Math.ceil(atmsFiltrados.length / itensPorPagina);
  const atmsExibidos = atmsFiltrados.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);

  const handleTopScroll = (e) => {
    if (isSyncing.current) return;
    isSyncing.current = true;
    tableScrollRef.current.scrollLeft = e.target.scrollLeft;
    window.requestAnimationFrame(() => isSyncing.current = false);
  };

  const handleTableScroll = (e) => {
    if (isSyncing.current) return;
    isSyncing.current = true;
    topScrollRef.current.scrollLeft = e.target.scrollLeft;
    window.requestAnimationFrame(() => isSyncing.current = false);
  };

  const getStatusClass = (status) => {
    if (status === 'Entregue') return 'badge-success';
    if (status === 'Aguardando Aprovação') return 'badge-warning';
    return 'badge-info';
  };

  const limparFiltrosOP = () => {
    setFiltros(prev => ({...prev, id:'', solicitante:'', pedido:'', nf:'', data_inicio:'', data_fim:'', data_especifica:'', status:'', transportadora:''}));
  };

  const limparFiltrosFat = () => {
    setFiltros(prev => ({
      ...prev, fatura:'', elemento_pep:'', registrado_sap:'', tipo_documento:'', validacao_pep:'', 
      data_map_inicio:'', data_map_fim:'', data_map_especifica: '',
      data_emissao_inicio:'', data_emissao_fim:'', data_emi_especifica: '',
      data_venc_inicio:'', data_venc_fim:'', data_venc_especifica: ''
    }));
  };

  const temFiltroFatAtivo = [
    filtros.fatura, filtros.elemento_pep, filtros.registrado_sap, filtros.tipo_documento, filtros.validacao_pep, 
    filtros.data_map_inicio, filtros.data_map_fim, filtros.data_map_especifica, 
    filtros.data_emissao_inicio, filtros.data_emissao_fim, filtros.data_emi_especifica, 
    filtros.data_venc_inicio, filtros.data_venc_fim, filtros.data_venc_especifica
  ].some(v => v !== '' && v !== undefined);

  return (
    <section className="fade-in section-dashboard">
      <div className="dashboard-header">
        <h3 className="dashboard-title">
          <TableList size={28} className="text-primary" /> 
          Painel de Controle <span className="dashboard-title-sub">(Logística e Faturamento)</span>
        </h3>
        <BtnExcel atmsFiltrados={atmsFiltrados} />
      </div>

      <FiltroOP atms={atms} filtros={filtros} onFiltroChange={handleFiltroChange} onLimpar={limparFiltrosOP} aberto={abertoFiltroOp} onClose={() => setAbertoFiltroOp(false)} />
      <FiltroFat atms={atms} filtros={filtros} onFiltroChange={handleFiltroChange} onLimpar={limparFiltrosFat} aberto={abertoFiltroFat} onClose={() => setAbertoFiltroFat(false)} />
      
      <div className="table-main-wrapper">
        
        <div ref={topScrollRef} onScroll={handleTopScroll} className="top-scroll-wrapper">
          <div style={{ width: `${tableWidth}px`, height: '8px' }}></div>
        </div>
        
        <div className="table-scroll-container" ref={tableScrollRef} onScroll={handleTableScroll}>
          <table className="dashboard-table" ref={tableContentRef}>
            
            <thead className="sticky-thead">
              <tr>
                <th colSpan="9" className="th-group-op">
                  <div className="th-group-content">
                    <span className="th-group-title">DADOS DA OPERAÇÃO</span>
                    <button onClick={() => setAbertoFiltroOp(true)} className="btn-filter-custom btn-filter-op">
                      <FilterIcon /> FILTRAR
                      {(filtros.id || filtros.status || filtros.solicitante || filtros.pedido || filtros.nf || filtros.data_inicio || filtros.data_fim || filtros.data_especifica || filtros.transportadora) && <span className="filter-indicator"></span>}
                    </button>
                  </div>
                </th>
                {/* O colSpan foi atualizado para 9 para cobrir a nova coluna de data separada */}
                <th colSpan="9" className="th-group-fat">
                  <div className="th-group-content">
                    <span className="th-group-title">FATURAMENTO / SAP</span>
                    <button onClick={() => setAbertoFiltroFat(true)} className="btn-filter-custom btn-filter-fat">
                      <FilterIcon /> FILTRAR
                      {temFiltroFatAtivo && <span className="filter-indicator"></span>}
                    </button>
                  </div>
                </th>
                <th style={{ backgroundColor: '#f8fafc' }}></th>
              </tr>
              <tr className="tr-subheader">
                <th>ID ATM</th><th>WBS</th><th>Solicitante</th><th>Pedido</th><th>NF</th><th>Rota</th><th>T. Frete</th><th>Veículo</th><th style={{ borderRight: '2px solid #e2e8f0' }}>Status</th>
                {/* Colunas de datas de emissão e vencimento separadas */}
                <th>Tipo Doc.</th><th>Data Map.</th><th>Fatura</th><th>Valor (R$)</th><th>Data Emissão</th><th>Vencimento</th><th>Elem. PEP</th><th>Valid. PEP</th><th>SAP</th>
                <th className="th-sticky-action">Ações</th>
              </tr>
            </thead>
            
            <tbody>
              {carregando ? (
                <tr><td colSpan="19" className="td-empty-state">Carregando dados mestre...</td></tr>
              ) : atmsExibidos.length === 0 ? (
                <tr><td colSpan="19" className="td-empty-state">Nenhum resultado encontrado com os filtros atuais.</td></tr>
              ) : atmsExibidos.map((atm) => (
                <tr key={atm.id} className="tr-data">
                  <td className="td-id">#{shortId(atm.id)}</td>
                  <td>{atm.wbs || '-'}</td>
                  <td>{atm.solicitacao || '-'}</td>
                  <td>{atm.pedido_compra || '-'}</td>
                  <td>{atm.nf || '-'}</td>
                  <td className="td-route">
                    <span>De:</span> {atm.origem?.municipio}<br/>
                    <span>Para:</span> {atm.destino?.municipio}
                  </td>
                  <td><small>{atm.tipo_frete || '-'}</small></td>
                  <td>{atm.veiculo || '-'}</td>
                  <td style={{ borderRight: '2px solid #f1f5f9' }}>
                    <span className={`badge ${getStatusClass(atm.status)}`} style={{fontSize: '0.7rem'}}>{atm.status}</span>
                  </td>
                  <td>{atm.tipo_documento || '-'}</td>
                  <td><small>{formatarDataCurta(atm.data_mapeamento)}</small></td>
                  <td className="td-fatura">{atm.fatura_cte || '-'}</td>
                  <td className="td-valor">
                    {(atm.valor || atm.valor_nf) ? Number(atm.valor || atm.valor_nf).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}) : '-'}
                  </td>
                  {/* Células de datas de emissão e vencimento separadas */}
                  <td className="td-dates">
                    {formatarDataCurta(atm.data_emissao)}
                  </td>
                  <td className="td-dates">
                    <strong className="td-vencimento">{formatarDataCurta(atm.vencimento)}</strong>
                  </td>
                  <td><small>{atm.elemento_pep_cc_wbs || atm.wbs || '-'}</small></td>
                  <td>{atm.validacao_pep || '-'}</td>
                  <td style={{textAlign: 'center'}}>
                    <span style={{color: atm.registrado_sap === 'SIM' ? '#059669' : '#94a3b8', fontWeight: 'bold'}}>
                      {atm.registrado_sap || 'NÃO'}
                    </span>
                  </td>
                  <td className="td-sticky-action">
                    <button className="btn-action" onClick={() => onOpenAtm(atm)} style={{padding: '6px 12px', fontSize: '0.8rem'}}>
                      <FolderOpen size={14} /> Abrir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!carregando && totalPaginas > 1 && (
          <div className="pagination-wrapper">
            <span className="pagination-info">
              Mostrando <strong>{atmsExibidos.length}</strong> de <strong>{atmsFiltrados.length}</strong> pedidos filtrados
            </span>
            <div className="pagination-controls">
              <button 
                onClick={() => setPaginaAtual(p => Math.max(p-1, 1))} 
                disabled={paginaAtual === 1}
                className="pagination-btn"
              >
                Anterior
              </button>
              <span className="pagination-page-text">Página {paginaAtual} / {totalPaginas}</span>
              <button 
                onClick={() => setPaginaAtual(p => Math.min(p+1, totalPaginas))} 
                disabled={paginaAtual === totalPaginas}
                className="pagination-btn"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}