// src/componentes/Dashboard/Dashboard.jsx
import React, { useState } from 'react';
import Filtro from '../Filtro/Filtro'; 
import * as XLSX from 'xlsx';

import templateExcel from '../../../public/GestaoFretesTemplate.xlsx';

// --- Ícones SVG ---
const TableList = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="3" x2="21" y1="15" y2="15"/><line x1="9" x2="9" y1="9" y2="21"/></svg>;
const FolderOpen = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/></svg>;
const DownloadIcon = ({ size = 20, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;

export default function Dashboard({ atms, carregando, onOpenAtm }) {
  const [filtros, setFiltros] = useState({ id: '', solicitante: '', pedido: '', nf: '' });

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const limparFiltros = () => {
    setFiltros({ id: '', solicitante: '', pedido: '', nf: '' });
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
    const matchId = !filtros.id || idCurtoAtm.includes(filtros.id.toUpperCase().trim());
    const matchSolicitante = !filtros.solicitante || atm.solicitacao?.toLowerCase().includes(filtros.solicitante.toLowerCase().trim());
    const matchPedido = !filtros.pedido || atm.pedido_compra?.toLowerCase().includes(filtros.pedido.toLowerCase().trim());
    const matchNf = !filtros.nf || atm.nf?.toLowerCase().includes(filtros.nf.toLowerCase().trim());
    return matchId && matchSolicitante && matchPedido && matchNf;
  });

  const getStatusClass = (status) => {
    if (status === 'Entregue') return 'badge-success';
    if (status === 'Aguardando Aprovação') return 'badge-warning';
    return 'badge-info';
  };

  // ========================================================
  // LÓGICA DE EXPORTAÇÃO PARA EXCEL MODO "TEMPLATE"
  // ========================================================
  const exportarExcel = async () => {
    if (atmsFiltrados.length === 0) {
      alert("Não há dados para exportar com os filtros atuais.");
      return;
    }

    try {
      // 1. Busca o arquivo template na pasta 'public'
      // ATENÇÃO: O arquivo precisa estar na pasta public do seu projeto e se chamar GestaoFretesTemplate.xlsx
      // Onde estava: fetch('/GestaoFretesTemplate.xlsx')
const response = await fetch(templateExcel);
      
      if (!response.ok) {
        alert("Template não encontrado! Certifique-se de que o arquivo 'GestaoFretesTemplate.xlsx' está na pasta 'public' do seu projeto.");
        return;
      }
      
      const arrayBuffer = await response.arrayBuffer();

      // 2. Lê o arquivo excel completo, preservando todas as abas
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });

      // 3. Define a aba alvo
      const abaNome = "ATM";
      const worksheet = workbook.Sheets[abaNome];

      if (!worksheet) {
        alert(`A aba "${abaNome}" não foi encontrada no template.`);
        return;
      }

      // 4. Mapeia os dados filtrados em uma Matriz (Array de Arrays)
      // A ordem deve seguir rigorosamente as colunas de A a AR do template.
      const dadosMatriz = atmsFiltrados.map(atm => {
        
        // Formata a Rota
        const rotaStr = (atm.origem?.municipio && atm.destino?.municipio) 
          ? `${atm.origem.uf} ${atm.origem.municipio} x ${atm.destino.municipio} ${atm.destino.uf}`
          : '-';

        // Lógica simples para pegar Mês e Ano
        let mesText = '-';
        let mesAnoText = '-';
        if (atm.data_solicitacao) {
          const date = new Date(atm.data_solicitacao);
          const meses = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
          mesText = meses[date.getMonth()];
          mesAnoText = `${date.getFullYear()} ${mesText}`;
        }

        return [
          atm.data_solicitacao ? atm.data_solicitacao.split('T')[0] : '-', // A: DATA DA SOLICITAÇÃO
          atm.numero_atm || shortId(atm.id),                               // B: ATM
          atm.pedido_compra || '-',                                        // C: PEDIDO DE COMPRA
          atm.nf || '-',                                                   // D: NF
          atm.wbs || '-',                                                  // E: WBS
          atm.origem?.uf || '-',                                           // F: UF
          atm.origem?.municipio || '-',                                    // G: MUNICIPIO
          atm.origem?.nome_local || '-',                                   // H: LOCAL DE COLETA
          "x",                                                             // I: X
          atm.destino?.nome_local || '-',                                  // J: LOCAL DA ENTREGA
          atm.destino?.uf || '-',                                          // K: UF 2
          atm.destino?.municipio || '-',                                   // L: MUNICIPIO 2
          atm.tipo_frete || '-',                                           // M: Fracionado/Dedicado
          atm.solicitacao || '-',                                          // N: SOLICITAÇÃO
          atm.veiculo || atm.modal || '-',                                 // O: VEÍCULO
          atm.transportadora?.nome || '-',                                 // P: TRANSPORTADORA
          atm.cotacao_bid ? "Cotação" : (atm.valor_bid ? "BID" : '-'),     // Q: COTAÇÃO/BID
          atm.valor_nf || '',                                              // R: VALOR NF
          atm.volume || '',                                                // S: VOLUME
          atm.peso || '',                                                  // T: PESO
          atm.valor_bid_dedicado || '',                                    // U: VALOR BID (Dedicado)
          atm.data_entrega ? atm.data_entrega.split('T')[0] : '-',         // V: DATA DE ENTREGA
          atm.status || '-',                                               // W: STATUS
          atm.observacoes || '-',                                          // X: OBSERVAÇÕES
          atm.valor_bid || atm.cotacao_bid || '',                          // Y: Valor BID
          rotaStr,                                                         // Z: ROTA
          mesText,                                                         // AA: Mês
          mesAnoText,                                                      // AB: Mês Ano
          "",                                                              // AC: Coluna 1
          "",                                                              // AD: Coluna 2
          atm.tipo_documento || '-',                                       // AE: TIPO
          atm.data_mapeamento ? atm.data_mapeamento.split('T')[0] : '-',   // AF: DATA MAPEAMENTO
          atm.fatura_cte || '-',                                           // AG: CTE
          atm.valor || '',                                                 // AH: VALOR
          atm.data_emissao ? atm.data_emissao.split('T')[0] : '-',         // AI: DATA EMISSÃO
          atm.vencimento ? atm.vencimento.split('T')[0] : '-',             // AJ: VENCIMENTO
          atm.elemento_pep_cc_wbs || '-',                                  // AK: ELEMENTO PEP - CC / WBS
          atm.validacao_pep || '-',                                        // AL: VALIDAÇÃO PEP
          "",                                                              // AM: Lançamento E-gate
          "",                                                              // AN: ID E-gate
          atm.registrado_sap || '-',                                       // AO: Registrado SAP (S/N)
          "",                                                              // AP: FRS
          atm.lancamento_fi || '-',                                        // AQ: Lançamento FI (S/N)
          atm.processo_lancamento_fi || '-'                                // AR: Processo lançamento FI
        ];
      });

      // 5. Escreve os dados na aba alvo, iniciando da célula A5 (preserva as 4 primeiras linhas do arquivo base)
      XLSX.utils.sheet_add_aoa(worksheet, dadosMatriz, { origin: "A5" });

      // 6. Faz o download do arquivo alterado
      XLSX.writeFile(workbook, "Gestao_de_Fretes_Atualizada.xlsx");
      
    } catch (error) {
      console.error("Falha ao exportar excel: ", error);
      alert("Houve um problema ao gerar o arquivo. Veja o console (F12) para detalhes.");
    }
  };

  return (
    <section className="fade-in section-dashboard">
      
      {/* CABEÇALHO */}
      <div className="section-header" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 className="section-title" style={{ margin: 0 }}>
          <TableList size={24} className="text-primary" /> Painel de Controle (Logística e Faturamento)
        </h3>
        
        {/* BOTÃO EXPORTAR EXCEL */}
        <button 
          onClick={exportarExcel} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
          title="Baixar Tabela no Formato Original"
        >
          <DownloadIcon size={18} /> Exportar Gestão de Fretes
        </button>
      </div>

      {/* COMPONENTE DE FILTRO */}
      <div style={{ marginBottom: '1rem' }}>
        <Filtro 
          atms={atms}
          filtros={filtros}
          onFiltroChange={handleFiltroChange}
          onLimpar={limparFiltros}
        />
      </div>
      
      {/* TABELA DE DADOS NA TELA (Resumo visual, não muda) */}
      <div className="table-container" style={{ overflowX: 'auto' }}>
        <table className="data-table" style={{ whiteSpace: 'nowrap', width: '100%' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th colSpan="8" style={{ borderRight: '2px solid #e5e7eb', textAlign: 'center', color: '#1e3a8a' }}>DADOS DA OPERAÇÃO</th>
              <th colSpan="8" style={{ textAlign: 'center', color: '#047857' }}>FATURAMENTO / SAP</th>
              <th style={{ backgroundColor: '#f9fafb' }}></th>
            </tr>
            <tr>
              <th>ID ATM</th><th>Solicitante</th><th>Pedido</th><th>NF</th><th>Rota</th><th>T. Frete</th><th>Veículo</th><th style={{ borderRight: '2px solid #e5e7eb' }}>Status</th>
              <th>Tipo Doc.</th><th>Data Map.</th><th>Fatura CT-e</th><th>Valor (R$)</th><th>Emissão/Venc.</th><th>Elem. PEP/WBS</th><th>Valid. PEP</th><th>SAP (S/N) / Cód</th>
              <th style={{ position: 'sticky', right: 0, backgroundColor: '#f9fafb', zIndex: 10, borderLeft: '1px solid #e5e7eb', boxShadow: '-2px 0 5px rgba(0,0,0,0.05)' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr><td colSpan="17" className="text-center" style={{padding: '2rem'}}>Carregando dados...</td></tr>
            ) : atmsFiltrados.length === 0 ? (
              <tr><td colSpan="17" className="text-center" style={{padding: '2rem', color: '#6b7280'}}>Nenhum resultado encontrado com os filtros atuais.</td></tr>
            ) : atmsFiltrados.map((atm) => (
              <tr key={atm.id}>
                <td className="font-bold" title={atm.id}>#{shortId(atm.id)}</td>
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