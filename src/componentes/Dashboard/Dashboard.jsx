// src/componentes/Dashboard/Dashboard.jsx
import React, { useState } from 'react';
import FiltroOP from '../FiltroOP/FiltroOP'; 
import FiltroFat from '../FiltroFat/FiltroFat';
import BtnExcel from '../BtnExcel/BtnExcel';

const TableList = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="3" x2="21" y1="15" y2="15"/><line x1="9" x2="9" y1="9" y2="21"/></svg>;
const FolderOpen = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/></svg>;

export default function Dashboard({ atms, carregando, onOpenAtm }) {
  // ESTADO QUE GUARDA OS FILTROS DOS DOIS LADOS JUNTOS
  const [filtros, setFiltros] = useState({ 
    id: '', solicitante: '', pedido: '', nf: '', // Filtros OP
    fatura: '', elemento_pep: '', registrado_sap: '' // Filtros FAT
  });
  
  const [abertoFiltroOp, setAbertoFiltroOp] = useState(false);
  const [abertoFiltroFat, setAbertoFiltroFat] = useState(false);

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

  const atmsFiltrados = atms.filter(atm => {
    const idCurtoAtm = shortId(atm.id);
    const atmNum = atm.numero_atm ? String(atm.numero_atm).toUpperCase().trim() : '';
    const valorComparacao = atmNum || idCurtoAtm;

    let matchId = true;

    if (filtros.id) {
      const busca = filtros.id.toUpperCase().trim();
      if (busca.includes(',')) {
        const termos = busca.split(',').map(t => t.trim()).filter(t => t);
        matchId = termos.some(termo => idCurtoAtm.includes(termo) || atmNum.includes(termo));
      } else if (busca.includes('-')) {
        const [inicio, fim] = busca.split('-').map(t => t.trim());
        if (inicio && fim) {
          if (!isNaN(inicio) && !isNaN(fim) && !isNaN(valorComparacao)) {
            matchId = Number(valorComparacao) >= Number(inicio) && Number(valorComparacao) <= Number(fim);
          } else {
            matchId = valorComparacao >= inicio && valorComparacao <= fim;
          }
        } else {
          matchId = idCurtoAtm.includes(busca) || atmNum.includes(busca);
        }
      } else {
        matchId = idCurtoAtm.includes(busca) || atmNum.includes(busca);
      }
    }

    const matchSolicitante = !filtros.solicitante || atm.solicitacao?.toLowerCase().includes(filtros.solicitante.toLowerCase().trim());
    const matchPedido = !filtros.pedido || atm.pedido_compra?.toLowerCase().includes(filtros.pedido.toLowerCase().trim());
    const matchNf = !filtros.nf || atm.nf?.toLowerCase().includes(filtros.nf.toLowerCase().trim());
    
    const matchFatura = !filtros.fatura || atm.fatura_cte?.toLowerCase().includes(filtros.fatura.toLowerCase().trim());
    const matchPep = !filtros.elemento_pep || atm.elemento_pep_cc_wbs?.toLowerCase().includes(filtros.elemento_pep.toLowerCase().trim());
    
    let matchSap = true;
    if (filtros.registrado_sap) {
      const sapValue = atm.registrado_sap ? atm.registrado_sap.toUpperCase() : 'NÃO';
      matchSap = sapValue === filtros.registrado_sap;
    }
    
    return matchId && matchSolicitante && matchPedido && matchNf && matchFatura && matchPep && matchSap;
  });

  const getStatusClass = (status) => {
    if (status === 'Entregue') return 'badge-success';
    if (status === 'Aguardando Aprovação') return 'badge-warning';
    return 'badge-info';
  };

  return (
    // Adicionado style para forçar 100% de largura
    <section className="fade-in section-dashboard" style={{ width: '100%', maxWidth: '100%', margin: '0 auto' }}>
      <div className="section-header" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 className="section-title" style={{ margin: 0 }}>
          <TableList size={24} className="text-primary" /> Painel de Controle (Logística e Faturamento)
        </h3>
        <BtnExcel atmsFiltrados={atmsFiltrados} />
      </div>

      <FiltroOP 
        atms={atms} filtros={filtros} onFiltroChange={handleFiltroChange} 
        onLimpar={() => { setFiltros(prev => ({...prev, id:'', solicitante:'', pedido:'', nf:''})) }} 
        aberto={abertoFiltroOp} onClose={() => setAbertoFiltroOp(false)}
      />
      
      <FiltroFat 
        atms={atms} filtros={filtros} onFiltroChange={handleFiltroChange} 
        onLimpar={() => { setFiltros(prev => ({...prev, fatura:'', elemento_pep:'', registrado_sap:''})) }} 
        aberto={abertoFiltroFat} onClose={() => setAbertoFiltroFat(false)}
      />
      
      {/* Tabela expandida para ocupar o máximo espaço possível */}
      <div className="table-container" style={{ overflowX: 'auto', width: '100%' }}>
        <table className="data-table" style={{ whiteSpace: 'nowrap', width: '100%', minWidth: 'max-content' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              
              {/* O colSpan PASSOU DE 8 PARA 9 PARA COBRIR A COLUNA "WBS" */}
              <th colSpan="9" style={{ borderRight: '2px solid #e5e7eb', color: '#1e3a8a', padding: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '0.85rem', letterSpacing: '0.05em' }}>DADOS DA OPERAÇÃO</span>
                  <button onClick={() => setAbertoFiltroOp(true)} style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#ffffff', border: '1px solid #bfdbfe', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', color: '#1d4ed8', fontWeight: 'bold', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                    FILTRAR
                    {(filtros.id || filtros.solicitante || filtros.pedido || filtros.nf) && <span style={{ width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%', marginLeft: '2px' }}></span>}
                  </button>
                </div>
              </th>

              <th colSpan="8" style={{ color: '#047857', padding: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '0.85rem', letterSpacing: '0.05em' }}>FATURAMENTO / SAP</span>
                  <button onClick={() => setAbertoFiltroFat(true)} style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#ffffff', border: '1px solid #a7f3d0', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', color: '#059669', fontWeight: 'bold', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                    FILTRAR
                    {(filtros.fatura || filtros.elemento_pep || filtros.registrado_sap) && <span style={{ width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%', marginLeft: '2px' }}></span>}
                  </button>
                </div>
              </th>
              <th style={{ backgroundColor: '#f9fafb' }}></th>
            </tr>
            <tr>
              {/* ADICIONADO <th>WBS</th> AQUI */}
              <th>ID ATM</th><th>WBS</th><th>Solicitante</th><th>Pedido</th><th>NF</th><th>Rota</th><th>T. Frete</th><th>Veículo</th><th style={{ borderRight: '2px solid #e5e7eb' }}>Status</th>
              <th>Tipo Doc.</th><th>Data Map.</th><th>Fatura</th><th>Valor (R$)</th><th>Emissão/Venc.</th><th>Elem. PEP</th><th>Valid. PEP</th><th>SAP</th>
              <th style={{ position: 'sticky', right: 0, backgroundColor: '#f9fafb', zIndex: 10, borderLeft: '1px solid #e5e7eb', boxShadow: '-2px 0 5px rgba(0,0,0,0.05)' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr><td colSpan="18" className="text-center" style={{padding: '2rem'}}>Carregando dados...</td></tr>
            ) : atmsFiltrados.length === 0 ? (
              <tr><td colSpan="18" className="text-center" style={{padding: '2rem', color: '#6b7280'}}>Nenhum resultado encontrado.</td></tr>
            ) : atmsFiltrados.map((atm) => (
              <tr key={atm.id}>
                <td className="font-bold" title={atm.id}>#{shortId(atm.id)}</td>
                
                {/* ADICIONADO <td>{atm.wbs || '-'}</td> AQUI */}
                <td>{atm.wbs || '-'}</td>
                
                <td>{atm.solicitacao || '-'}</td><td>{atm.pedido_compra || '-'}</td><td>{atm.nf || '-'}</td>
                <td style={{ fontSize: '0.8rem' }}>De: {atm.origem?.municipio}<br/>Para: {atm.destino?.municipio}</td>
                <td>{atm.tipo_frete || '-'}</td><td>{atm.veiculo || '-'}</td>
                <td style={{ borderRight: '2px solid #e5e7eb' }}><span className={`badge ${getStatusClass(atm.status)}`}>{atm.status}</span></td>
                
                <td>{atm.tipo_documento || '-'}</td><td>{formatarDataCurta(atm.data_mapeamento)}</td>
                <td className="font-bold text-gray-700">{atm.fatura_cte || '-'}</td>
                <td className="text-green-600 font-bold">{(atm.valor || atm.valor_nf) ? Number(atm.valor || atm.valor_nf).toLocaleString('pt-BR', {minimumFractionDigits: 2}) : '-'}</td>
                <td style={{ fontSize: '0.85rem' }}>E: {formatarDataCurta(atm.data_emissao)}<br/>V: <strong className="text-red-600">{formatarDataCurta(atm.vencimento)}</strong></td>
                <td>{atm.elemento_pep_cc_wbs || atm.wbs || '-'}</td><td>{atm.validacao_pep || '-'}</td>
                <td>
                  <span className={atm.registrado_sap === 'SIM' ? 'text-green-600 font-bold' : 'text-gray-400'}>{atm.registrado_sap || 'NÃO'}</span><br/>
                  <span style={{ fontSize: '0.8rem' }}>{atm.registro_sap || '-'}</span>
                </td>
                
                <td style={{ position: 'sticky', right: 0, backgroundColor: 'white', borderLeft: '1px solid #e5e7eb', boxShadow: '-2px 0 5px rgba(0,0,0,0.05)' }}>
                  <button className="btn-action" onClick={() => onOpenAtm(atm)}>
                    <FolderOpen size={16} /> Abrir Ficha
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}