import React, { useState, useEffect, useRef } from 'react';
import FiltroOP from '../FiltroOP/FiltroOP'; 
import FiltroFat from '../FiltroFat/FiltroFat';
import BtnExcel from '../BtnExcel/BtnExcel';
import './Dashboard.css';

// --- Ícones (Mantidos) ---
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

  const tableContentRef = useRef(null);
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
    const valorStr = String(valorBanco || '').toUpperCase().trim();
    const busca = stringFiltro.toUpperCase().trim();
    if (busca.includes(',')) { 
      return busca.split(',').map(t => t.trim()).some(termo => valorStr.includes(termo));
    } 
    return valorStr.includes(busca);
  };

  const isDataNoIntervalo = (dataBancoStr, dataFiltroInicio, dataFiltroFim) => {
    if (!dataFiltroInicio && !dataFiltroFim) return true;
    if (!dataBancoStr) return false;
    const dBanco = new Date(dataBancoStr.split('T')[0]);
    if (dataFiltroInicio && dBanco < new Date(dataFiltroInicio)) return false;
    if (dataFiltroFim && dBanco > new Date(dataFiltroFim)) return false;
    return true;
  };

  // ==========================================
  // LÓGICA DE FILTRAGEM (CORRIGIDA PARA JOIN)
  // ==========================================
  const atmsFiltrados = atms.filter(atm => {
    // 🟢 Dados da Operação (Tabela Principal)
    const matchId = matchFiltroComIntervalo(atm.numero_atm || shortId(atm.id), filtros.id);
    const matchPedido = matchFiltroComIntervalo(atm.pedido_compra, filtros.pedido);
    const matchNf = matchFiltroComIntervalo(atm.nf, filtros.nf);
    const matchSolicitante = matchMultiSelect(atm.solicitacao, filtros.solicitante);
    const matchStatus = matchMultiSelect(atm.status, filtros.status);
    const matchTransportadora = matchMultiSelect(atm.transportadora?.nome, filtros.transportadora);
    
    // 🟢 Dados de Faturamento (Vem do objeto 'faturamento')
    const fat = atm.faturamento || {}; 
    const matchFatura = matchFiltroComIntervalo(fat.fatura_cte, filtros.fatura);
    const matchPep = matchFiltroComIntervalo(fat.elemento_pep_cc_wbs || atm.wbs, filtros.elemento_pep);
    const matchTipoDoc = matchMultiSelect(fat.tipo_documento, filtros.tipo_documento);
    const matchValidPep = matchMultiSelect(fat.validacao_pep, filtros.validacao_pep);
    const matchSap = filtros.registrado_sap ? (fat.registrado_sap || 'NÃO') === filtros.registrado_sap : true;

    // Filtros de Data (Operação)
    const matchDataOp = isDataNoIntervalo(atm.data_solicitacao, filtros.data_inicio, filtros.data_fim);
    
    // Filtros de Data (Faturamento)
    const matchDataMap = isDataNoIntervalo(fat.data_mapeamento, filtros.data_map_inicio, filtros.data_map_fim);
    const matchDataEmi = isDataNoIntervalo(fat.data_emissao, filtros.data_emissao_inicio, filtros.data_emissao_fim);
    const matchDataVenc = isDataNoIntervalo(fat.vencimento, filtros.data_venc_inicio, filtros.data_venc_fim);

    return matchId && matchDataOp && matchSolicitante && matchPedido && matchNf && matchStatus && matchTransportadora && 
           matchFatura && matchPep && matchTipoDoc && matchValidPep && matchDataMap && matchDataEmi && matchDataVenc && matchSap;
  });

  const getStatusClass = (status) => {
    if (status === 'Entregue') return 'badge-success';
    if (status === 'Aguardando Aprovação') return 'badge-warning';
    return 'badge-info';
  };

  const totalPaginas = Math.ceil(atmsFiltrados.length / itensPorPagina);
  const atmsExibidos = atmsFiltrados.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);

  return (
    <section className="fade-in section-dashboard">
      <div className="dashboard-header">
        <h3 className="dashboard-title">
          <TableList size={28} className="text-primary" /> 
          Painel de Controle <span className="dashboard-title-sub">(Logística e Faturamento)</span>
        </h3>
        <BtnExcel atmsFiltrados={atmsFiltrados} />
      </div>

      <FiltroOP atms={atms} filtros={filtros} onFiltroChange={handleFiltroChange} onLimpar={() => {}} aberto={abertoFiltroOp} onClose={() => setAbertoFiltroOp(false)} />
      <FiltroFat atms={atms} filtros={filtros} onFiltroChange={handleFiltroChange} onLimpar={() => {}} aberto={abertoFiltroFat} onClose={() => setAbertoFiltroFat(false)} />
      
      <div className="table-main-wrapper">
        <div className="table-scroll-container">
          <table className="dashboard-table" ref={tableContentRef}>
            <thead className="sticky-thead">
              <tr>
                <th colSpan="9" className="th-group-op">DADOS DA OPERAÇÃO</th>
                <th colSpan="9" className="th-group-fat">FATURAMENTO / SAP</th>
                <th style={{ backgroundColor: '#f8fafc' }}></th>
              </tr>
              <tr className="tr-subheader">
                <th>ID ATM</th><th>WBS</th><th>Solicitante</th><th>Pedido</th><th>NF</th><th>Rota</th><th>T. Frete</th><th>Veículo</th><th style={{ borderRight: '2px solid #e2e8f0' }}>Status</th>
                <th>Tipo Doc.</th><th>Data Map.</th><th>Fatura</th><th>Valor (R$)</th><th>Data Emissão</th><th>Vencimento</th><th>Elem. PEP</th><th>Valid. PEP</th><th>SAP</th>
                <th className="th-sticky-action">Ações</th>
              </tr>
            </thead>
            
            <tbody>
              {carregando ? (
                <tr><td colSpan="19" className="td-empty-state">Carregando dados mestre...</td></tr>
              ) : atmsExibidos.length === 0 ? (
                <tr><td colSpan="19" className="td-empty-state">Nenhum resultado encontrado.</td></tr>
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
                    <span className={`badge ${getStatusClass(atm.status)}`}>{atm.status}</span>
                  </td>
                  
                  {/* 🟢 DADOS QUE VEM DO OBJETO FATURAMENTO 🟢 */}
                  <td>{atm.faturamento?.tipo_documento || '-'}</td>
                  <td><small>{formatarDataCurta(atm.faturamento?.data_mapeamento)}</small></td>
                  <td className="td-fatura">{atm.faturamento?.fatura_cte || '-'}</td>
                  <td className="td-valor">
                    {Number(atm.faturamento?.valor || atm.valor_nf || 0).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                  </td>
                  <td>{formatarDataCurta(atm.faturamento?.data_emissao)}</td>
                  <td><strong className="td-vencimento">{formatarDataCurta(atm.faturamento?.vencimento)}</strong></td>
                  <td><small>{atm.faturamento?.elemento_pep_cc_wbs || atm.wbs || '-'}</small></td>
                  <td>{atm.faturamento?.validacao_pep || '-'}</td>
                  <td style={{textAlign: 'center'}}>
                    <span style={{color: atm.faturamento?.registrado_sap === 'SIM' ? '#059669' : '#94a3b8', fontWeight: 'bold'}}>
                      {atm.faturamento?.registrado_sap || 'NÃO'}
                    </span>
                  </td>
                  <td className="th-sticky-action">
                    <button className="btn-action" onClick={() => onOpenAtm(atm)}>
                      <FolderOpen size={14} /> Abrir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}