// src/componentes/Dashboard/Dashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import FiltroOP from '../FiltroOP/FiltroOP'; 
import FiltroFat from '../FiltroFat/FiltroFat';
import BtnExcel from '../BtnExcel/BtnExcel';

const TableList = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="3" x2="21" y1="15" y2="15"/><line x1="9" x2="9" y1="9" y2="21"/></svg>;
const FolderOpen = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>;

export default function Dashboard({ atms, carregando, onOpenAtm }) {
  const [filtros, setFiltros] = useState({ 
    id: '', solicitante: '', pedido: '', nf: '', data_inicio: '', data_fim: '', status: '', transportadora: '',
    fatura: '', elemento_pep: '', registrado_sap: '' 
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

  const atmsFiltrados = atms.filter(atm => {
    const idCurtoAtm = shortId(atm.id);
    const atmNum = atm.numero_atm ? String(atm.numero_atm).toUpperCase().trim() : '';
    const valorComparacao = atmNum || idCurtoAtm;
    let matchId = true;
    if (filtros.id) {
      const busca = filtros.id.toUpperCase().trim();
      if (busca.includes(',')) {
        const termos = busca.split(',').map(t => t.trim()).filter(Boolean);
        matchId = termos.some(termo => idCurtoAtm.includes(termo) || atmNum.includes(termo));
      } else if (busca.includes('-')) {
        const [inicio, fim] = busca.split('-').map(t => t.trim());
        if (inicio && fim) {
          if (!isNaN(inicio) && !isNaN(fim) && !isNaN(valorComparacao)) {
            matchId = Number(valorComparacao) >= Number(inicio) && Number(valorComparacao) <= Number(fim);
          } else {
            matchId = valorComparacao >= inicio && valorComparacao <= fim;
          }
        }
      } else {
        matchId = idCurtoAtm.includes(busca) || atmNum.includes(busca);
      }
    }
    const matchSolicitante = matchMultiSelect(atm.solicitacao, filtros.solicitante);
    const matchPedido = matchMultiSelect(atm.pedido_compra, filtros.pedido);
    const matchNf = matchMultiSelect(atm.nf, filtros.nf);
    const matchStatus = matchMultiSelect(atm.status, filtros.status);
    const matchTransportadora = matchMultiSelect(atm.transportadora?.nome, filtros.transportadora);
    let matchData = true;
    if (filtros.data_inicio || filtros.data_fim) {
      const atmDate = atm.data_solicitacao ? new Date(atm.data_solicitacao.split('T')[0]) : null;
      if (!atmDate) matchData = false;
      else {
        if (filtros.data_inicio && atmDate < new Date(filtros.data_inicio)) matchData = false;
        if (filtros.data_fim && atmDate > new Date(filtros.data_fim)) matchData = false;
      }
    }
    const matchFatura = !filtros.fatura || atm.fatura_cte?.toLowerCase().includes(filtros.fatura.toLowerCase());
    const matchPep = !filtros.elemento_pep || atm.elemento_pep_cc_wbs?.toLowerCase().includes(filtros.elemento_pep.toLowerCase());
    let matchSap = true;
    if (filtros.registrado_sap) matchSap = (atm.registrado_sap || 'NÃO').toUpperCase() === filtros.registrado_sap;

    return matchId && matchData && matchSolicitante && matchPedido && matchNf && matchStatus && matchTransportadora && matchFatura && matchPep && matchSap;
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

  const btnFilterStyle = (color) => ({
    display: 'flex', alignItems: 'center', gap: '6px', 
    backgroundColor: '#ffffff', border: `1px solid ${color}`, 
    padding: '4px 10px', borderRadius: '6px', cursor: 'pointer',
    fontSize: '0.75rem', color: color, fontWeight: 'bold',
    boxShadow: '0 1px 2px rgba(0,0,0,0.08)', transition: 'all 0.2s'
  });

  return (
    <section className="fade-in section-dashboard" style={{ width: '100%', maxWidth: '100%', padding: '20px' }}>
      <div className="section-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TableList size={28} className="text-primary" /> 
          Painel de Controle <span style={{color: '#9ca3af', fontSize: '0.9rem', fontWeight: 'normal'}}>(Logística e Faturamento)</span>
        </h3>
        <BtnExcel atmsFiltrados={atmsFiltrados} />
      </div>

      <FiltroOP atms={atms} filtros={filtros} onFiltroChange={handleFiltroChange} onLimpar={() => setFiltros({id:'', solicitante:'', pedido:'', nf:'', data_inicio:'', data_fim:'', status:'', transportadora:''})} aberto={abertoFiltroOp} onClose={() => setAbertoFiltroOp(false)} />
      <FiltroFat atms={atms} filtros={filtros} onFiltroChange={handleFiltroChange} onLimpar={() => setFiltros({fatura:'', elemento_pep:'', registrado_sap:''})} aberto={abertoFiltroFat} onClose={() => setAbertoFiltroFat(false)} />
      
      {/* BARRA DE ROLAGEM FIXA NO TOPO */}
      <div 
        ref={topScrollRef} 
        onScroll={handleTopScroll} 
        style={{ 
          position: 'sticky', 
          top: '0', 
          zIndex: 100, 
          backgroundColor: '#f8fafc', 
          overflowX: 'auto', 
          width: '100%',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          borderRadius: '8px 8px 0 0'
        }}
      >
        <div style={{ width: `${tableWidth}px`, height: '8px' }}></div>
      </div>
      
      <div 
        className="table-container" 
        ref={tableScrollRef} 
        onScroll={handleTableScroll}
        // 👇 A MÁGICA DO SCROLL VERTICAL ESTÁ AQUI (maxHeight e overflowY) 👇
        style={{ overflowX: 'hidden', overflowY: 'auto', maxHeight: '65vh', width: '100%', borderTop: 'none', backgroundColor: 'white', borderRadius: '0 0 8px 8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
      >
        <table className="data-table" ref={tableContentRef} style={{ whiteSpace: 'nowrap', width: '100%', borderCollapse: 'collapse' }}>
          
          {/* 👇 O THEAD AGORA TEM POSITION: STICKY PARA CONGELAR O CABEÇALHO 👇 */}
          <thead style={{ position: 'sticky', top: 0, zIndex: 20, boxShadow: '0 4px 6px -2px rgba(0,0,0,0.1)' }}>
            
            <tr style={{ backgroundColor: '#f1f5f9' }}>
              <th colSpan="9" style={{ borderRight: '2px solid #e2e8f0', color: '#1e3a8a', padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                  <span style={{ fontWeight: '800', fontSize: '0.85rem', letterSpacing: '0.05em' }}>DADOS DA OPERAÇÃO</span>
                  <button onClick={() => setAbertoFiltroOp(true)} style={btnFilterStyle('#2563eb')}>
                    <FilterIcon /> FILTRAR
                    {(filtros.id || filtros.status || filtros.solicitante) && <span style={{width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444'}}></span>}
                  </button>
                </div>
              </th>
              <th colSpan="8" style={{ color: '#065f46', padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                  <span style={{ fontWeight: '800', fontSize: '0.85rem', letterSpacing: '0.05em' }}>FATURAMENTO / SAP</span>
                  <button onClick={() => setAbertoFiltroFat(true)} style={btnFilterStyle('#059669')}>
                    <FilterIcon /> FILTRAR
                    {(filtros.fatura || filtros.elemento_pep) && <span style={{width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444'}}></span>}
                  </button>
                </div>
              </th>
              <th style={{ backgroundColor: '#f8fafc' }}></th>
            </tr>

            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{padding: '12px'}}>ID ATM</th><th>WBS</th><th>Solicitante</th><th>Pedido</th><th>NF</th><th>Rota</th><th>T. Frete</th><th>Veículo</th><th style={{ borderRight: '2px solid #e2e8f0' }}>Status</th>
              <th>Tipo Doc.</th><th>Data Map.</th><th>Fatura</th><th>Valor (R$)</th><th>Emissão/Venc.</th><th>Elem. PEP</th><th>Valid. PEP</th><th>SAP</th>
              <th style={{ position: 'sticky', right: 0, backgroundColor: '#f8fafc', zIndex: 30, borderLeft: '1px solid #e2e8f0', textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          
          <tbody>
            {carregando ? (
              <tr><td colSpan="18" style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>Carregando dados mestre...</td></tr>
            ) : atmsExibidos.map((atm) => (
              <tr key={atm.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td className="font-bold" style={{color: '#1e293b'}}>#{shortId(atm.id)}</td>
                <td>{atm.wbs || '-'}</td>
                <td>{atm.solicitacao || '-'}</td>
                <td>{atm.pedido_compra || '-'}</td>
                <td>{atm.nf || '-'}</td>
                <td style={{ fontSize: '0.75rem', lineHeight: '1.2' }}>
                  <span style={{color: '#64748b'}}>De:</span> {atm.origem?.municipio}<br/>
                  <span style={{color: '#64748b'}}>Para:</span> {atm.destino?.municipio}
                </td>
                <td><small>{atm.tipo_frete || '-'}</small></td>
                <td>{atm.veiculo || '-'}</td>
                <td style={{ borderRight: '2px solid #f1f5f9' }}>
                  <span className={`badge ${getStatusClass(atm.status)}`} style={{fontSize: '0.7rem'}}>{atm.status}</span>
                </td>
                <td>{atm.tipo_documento || '-'}</td>
                <td><small>{formatarDataCurta(atm.data_mapeamento)}</small></td>
                <td className="font-bold" style={{color: '#475569'}}>{atm.fatura_cte || '-'}</td>
                <td style={{color: '#059669', fontWeight: 'bold'}}>
                  {(atm.valor || atm.valor_nf) ? Number(atm.valor || atm.valor_nf).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}) : '-'}
                </td>
                <td style={{ fontSize: '0.75rem' }}>
                  {formatarDataCurta(atm.data_emissao)}<br/>
                  <strong style={{color: '#dc2626'}}>{formatarDataCurta(atm.vencimento)}</strong>
                </td>
                <td><small>{atm.elemento_pep_cc_wbs || atm.wbs || '-'}</small></td>
                <td>{atm.validacao_pep || '-'}</td>
                <td style={{textAlign: 'center'}}>
                  <span style={{color: atm.registrado_sap === 'SIM' ? '#059669' : '#94a3b8', fontWeight: 'bold'}}>
                    {atm.registrado_sap || 'NÃO'}
                  </span>
                </td>
                <td style={{ position: 'sticky', right: 0, backgroundColor: 'white', borderLeft: '1px solid #e2e8f0', textAlign: 'center', padding: '8px', zIndex: 5 }}>
                  <button className="btn-action" onClick={() => onOpenAtm(atm)} style={{padding: '6px 12px', fontSize: '0.8rem'}}>
                    <FolderOpen size={14} /> Abrir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINAÇÃO */}
        {!carregando && totalPaginas > 1 && (
          <div style={{ position: 'sticky', bottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', zIndex: 20 }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Mostrando <strong>{atmsExibidos.length}</strong> de <strong>{atmsFiltrados.length}</strong> pedidos filtrados
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                onClick={() => setPaginaAtual(p => Math.max(p-1, 1))} 
                disabled={paginaAtual === 1}
                style={{ padding: '5px 12px', borderRadius: '4px', border: '1px solid #e2e8f0', backgroundColor: paginaAtual === 1 ? '#f1f5f9' : 'white', cursor: paginaAtual === 1 ? 'not-allowed' : 'pointer' }}
              >
                Anterior
              </button>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Página {paginaAtual} / {totalPaginas}</span>
              <button 
                onClick={() => setPaginaAtual(p => Math.min(p+1, totalPaginas))} 
                disabled={paginaAtual === totalPaginas}
                style={{ padding: '5px 12px', borderRadius: '4px', border: '1px solid #e2e8f0', backgroundColor: paginaAtual === totalPaginas ? '#f1f5f9' : 'white', cursor: paginaAtual === totalPaginas ? 'not-allowed' : 'pointer' }}
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