import React, { useState, useEffect, useRef } from 'react';
import FiltroOP from '../FiltroOP/FiltroOP'; 
import FiltroFat from '../FiltroFat/FiltroFat';
import BtnExcel from '../BtnExcel/BtnExcel';
import './Dashboard.css';

// --- Ícones ---
const TableList = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="3" x2="21" y1="15" y2="15"/><line x1="9" x2="9" y1="9" y2="21"/></svg>;
const FolderOpen = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/></svg>;
const ChevronLeft = ({ size = 18 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const ChevronRight = ({ size = 18 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
const FilterIcon = ({ size = 16 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>;

const temFiltroOpAtivo = () => {
  return !!(filtros.id || filtros.solicitante || filtros.pedido || filtros.nf || filtros.status || filtros.transportadora);
};

const temFiltroFatAtivo = () => {
  return !!(filtros.fatura || filtros.elemento_pep || filtros.registrado_sap || filtros.tipo_documento);
};

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

  useEffect(() => { setPaginaAtual(1); }, [filtros]);

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

  // Lógica de filtragem (Mantida)
  const matchMultiSelect = (v, f) => !f ? true : f.toUpperCase().split(',').some(t => String(v || '').toUpperCase().includes(t.trim()));
  const matchFiltro = (v, f) => !f ? true : String(v || '').toUpperCase().includes(f.toUpperCase().trim());
  
  const atmsFiltrados = atms.filter(atm => {
    const fat = atm.faturamento || {};
    return matchFiltro(atm.numero_atm || shortId(atm.id), filtros.id) &&
           matchFiltro(atm.pedido_compra, filtros.pedido) &&
           matchFiltro(atm.nf, filtros.nf) &&
           matchMultiSelect(atm.solicitacao, filtros.solicitante) &&
           matchMultiSelect(atm.status, filtros.status) &&
           matchMultiSelect(atm.transportadora?.nome, filtros.transportadora);
  });

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

<thead>
  <tr>
    {/* GRUPO OPERAÇÃO */}
    <th colSpan="11" className="th-group-op">
      <div className="th-group-content">
        <span className="th-group-title">DADOS DA OPERAÇÃO</span>
        <button className="btn-filter-header op" onClick={() => setAbertoFiltroOp(true)}>
          <FilterIcon size={14} /> Filtros
        </button>
      </div>
    </th>

    {/* GRUPO FATURAMENTO */}
    <th colSpan="9" className="th-group-fat">
      <div className="th-group-content">
        <span className="th-group-title">FATURAMENTO / SAP</span>
        <button className="btn-filter-header fat" onClick={() => setAbertoFiltroFat(true)}>
          <FilterIcon size={14} /> Filtros
        </button>
      </div>
    </th>
    <th className="th-sticky-action"></th>
  </tr>

  <tr className="tr-subheader">
    <th className="sticky-column-left">ID ATM</th>
    <th>WBS</th>
    <th>Solicitante</th>
    <th>Pedido</th>
    <th>NF</th>
    <th className="col-highlight">Transporte</th>
    <th className="col-highlight">Vlr. Frete</th>
    <th>Rota</th>
    <th>T. Frete</th>
    <th>Veículo</th>
    <th style={{ borderRight: '2px solid #e2e8f0' }}>Status</th>
    <th>Tipo Doc.</th>
    <th>Data Map.</th>
    <th>Fatura</th>
    <th>Valor (R$)</th>
    <th>Data Emissão</th>
    <th>Vencimento</th>
    <th>Elem. PEP</th>
    <th>Valid. PEP</th>
    <th>SAP</th>
    <th className="th-sticky-action">Ações</th>
  </tr>
</thead>
            
            <tbody>
              {carregando ? (
                <tr><td colSpan="21" className="td-empty-state">Carregando dados mestre...</td></tr>
              ) : atmsExibidos.length === 0 ? (
                <tr><td colSpan="21" className="td-empty-state">Nenhum resultado encontrado.</td></tr>
              ) : atmsExibidos.map((atm) => (
                <tr key={atm.id} className="tr-data">
                  <td className="td-id">#{shortId(atm.id)}</td>
                  <td>{atm.wbs || '-'}</td>
                  <td>{atm.solicitacao || '-'}</td>
                  <td>{atm.pedido_compra || '-'}</td>
                  <td>{atm.nf || '-'}</td>
                  
                  {/* NOVAS COLUNAS */}
                  <td style={{ fontWeight: '600' }}>{atm.transportadora?.nome || 'A DEFINIR'}</td>
                  <td style={{ fontWeight: 'bold' }}>
                    {Number(atm.valor_frete || atm.valor || 0).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                  </td>

                  <td className="td-route">
                    <span>De:</span> {atm.origem?.municipio}<br/>
                    <span>Para:</span> {atm.destino?.municipio}
                  </td>
                  <td><small>{atm.tipo_frete || '-'}</small></td>
                  <td>{atm.veiculo || '-'}</td>
                  <td style={{ borderRight: '2px solid #f1f5f9' }}>
                    <span className={`badge ${atm.status === 'Entregue' ? 'badge-success' : 'badge-info'}`}>{atm.status}</span>
                  </td>
                  
                  <td>{atm.faturamento?.tipo_documento || '-'}</td>
                  <td><small>{formatarDataCurta(atm.faturamento?.data_mapeamento)}</small></td>
                  <td className="td-fatura">{atm.faturamento?.fatura_cte || '-'}</td>
                  <td className="td-valor">
                    {Number(atm.faturamento?.valor || 0).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                  </td>
                  <td>{formatarDataCurta(atm.faturamento?.data_emissao)}</td>
                  <td><strong className="td-vencimento">{formatarDataCurta(atm.faturamento?.vencimento)}</strong></td>
                  <td><small>{atm.faturamento?.elemento_pep_cc_wbs || '-'}</small></td>
                  <td>{atm.faturamento?.validacao_pep || '-'}</td>
                  <td style={{textAlign: 'center'}}>{atm.faturamento?.registrado_sap || 'NÃO'}</td>
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

        {!carregando && atmsFiltrados.length > 0 && (
          <div className="pagination-wrapper">
            <div className="pagination-info">
              Mostrando <strong>{((paginaAtual - 1) * itensPorPagina) + 1}</strong> até <strong>{Math.min(paginaAtual * itensPorPagina, atmsFiltrados.length)}</strong> de <strong>{atmsFiltrados.length}</strong> registros
            </div>
            <div className="pagination-controls">
              <button className="pagination-btn" onClick={() => setPaginaAtual(p => Math.max(p-1, 1))} disabled={paginaAtual === 1}><ChevronLeft /> Anterior</button>
              <span className="pagination-page-text">{paginaAtual} / {totalPaginas}</span>
              <button className="pagination-btn" onClick={() => setPaginaAtual(p => Math.min(p+1, totalPaginas))} disabled={paginaAtual === totalPaginas}>Próxima <ChevronRight /></button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}