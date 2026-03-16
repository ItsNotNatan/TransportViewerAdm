// src/componentes/Dashboard/Dashboard.jsx
import React, { useState } from 'react';
import Filtro from '../Filtro/Filtro'; 
import ExcelJS from 'exceljs';       // <-- Nova biblioteca de excel
import { saveAs } from 'file-saver'; // <-- Biblioteca para fazer o download

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

  // Lógica de Filtragem Avançada
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
    
    return matchId && matchSolicitante && matchPedido && matchNf;
  });

  const getStatusClass = (status) => {
    if (status === 'Entregue') return 'badge-success';
    if (status === 'Aguardando Aprovação') return 'badge-warning';
    return 'badge-info';
  };

  // ========================================================
  // LÓGICA DE EXPORTAÇÃO CRIANDO EXCEL DO ZERO (EXCELJS)
  // ========================================================
  const exportarExcel = async () => {
    if (atmsFiltrados.length === 0) {
      alert("Não há dados para exportar com os filtros atuais.");
      return;
    }

    try {
      // 1. Cria o ficheiro na memória
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('ATM');

      // 2. Cria os "Super Cabeçalhos" (como no seu original)
      worksheet.getCell('AA1').value = 'Controle de Ctes/ Nfe de Serviço';
      worksheet.getCell('AA1').font = { bold: true, size: 14 };
      worksheet.getCell('AA1').alignment = { horizontal: 'center' };
      
      worksheet.getCell('D2').value = 'Gestão de Fretes';
      worksheet.getCell('D2').font = { bold: true, size: 16 };

      // 3. Define a largura exata de cada coluna (da A até à AR)
      worksheet.columns = [
        { key: 'data_sol', width: 22 },           // A: DATA DA SOLICITAÇÃO
        { key: 'atm', width: 12 },                // B: ATM
        { key: 'pedido', width: 20 },             // C: PEDIDO DE COMPRA
        { key: 'nf', width: 15 },                 // D: NF
        { key: 'wbs', width: 15 },                // E: WBS
        { key: 'uf1', width: 6 },                 // F: UF
        { key: 'mun1', width: 20 },               // G: MUNICIPIO
        { key: 'coleta', width: 30 },             // H: LOCAL DE COLETA
        { key: 'x', width: 4 },                   // I: X
        { key: 'entrega', width: 30 },            // J: LOCAL DA ENTREGA
        { key: 'uf2', width: 6 },                 // K: UF 2
        { key: 'mun2', width: 20 },               // L: MUNICIPIO 2
        { key: 'tipo_frete', width: 22 },         // M: Fracionado/Dedicado
        { key: 'solicitacao', width: 20 },        // N: SOLICITAÇÃO
        { key: 'veiculo', width: 20 },            // O: VEÍCULO
        { key: 'transportadora', width: 25 },     // P: TRANSPORTADORA
        { key: 'cotacao', width: 15 },            // Q: COTAÇÃO/BID
        { key: 'valor_nf', width: 15 },           // R: VALOR NF
        { key: 'volume', width: 12 },             // S: VOLUME
        { key: 'peso', width: 12 },               // T: PESO
        { key: 'valor_previsto', width: 22 },     // U: Valor previsto do frete
        { key: 'col1', width: 12 },               // V: Column1
        { key: 'status', width: 15 },             // W: STATUS
        { key: 'obs', width: 35 },                // X: OBSERVAÇÕES
        { key: 'valor_bid', width: 15 },          // Y: Valor BID
        { key: 'rota', width: 40 },               // Z: ROTA
        { key: 'mes', width: 15 },                // AA: Mês
        { key: 'mes_ano', width: 15 },            // AB: Mês Ano
        { key: 'col_a', width: 10 },              // AC: Coluna 1
        { key: 'col_b', width: 10 },              // AD: Coluna 2
        { key: 'tipo_doc', width: 15 },           // AE: TIPO
        { key: 'data_map', width: 18 },           // AF: DATA MAPEAMENTO
        { key: 'fatura', width: 15 },             // AG: FATURA
        { key: 'valor', width: 15 },              // AH: VALOR
        { key: 'data_emissao', width: 15 },       // AI: DATA EMISSÃO
        { key: 'vencimento', width: 15 },         // AJ: VENCIMENTO
        { key: 'elemento_pep', width: 25 },       // AK: ELEMENTO PEP - CC / WBS
        { key: 'validacao_pep', width: 25 },      // AL: VALIDAÇÃO PEP - CC /WBS
        { key: 'lancamento_v360', width: 20 },    // AM: Lançamento V360
        { key: 'id_v360', width: 15 },            // AN: Id V360
        { key: 'registrado_sap', width: 22 },     // AO: Registrado SAP (S/N)
        { key: 'registro_sap', width: 18 },       // AP: Registro SAP
        { key: 'lancamento_fi', width: 22 },      // AQ: Lançamento FI (S/N)
        { key: 'processo_fi', width: 25 }         // AR: Processo lançamento FI
      ];

      // 4. Escreve os cabeçalhos das colunas (exatamente na Linha 4)
      const titulos = [
        "DATA DA SOLICITAÇÃO", "ATM", "PEDIDO DE COMPRA", "NF", "WBS", "UF", "MUNICIPIO", "LOCAL DE COLETA", "X", 
        "LOCAL DA ENTREGA", "UF 2", "MUNICIPIO 2", "Fracionado/Dedicado", "SOLICITAÇÃO", "VEÍCULO", "TRANSPORTADORA", 
        "COTAÇÃO/BID", "VALOR NF", "VOLUME", "PESO", "Valor previsto do frete", "Column1", "STATUS", "OBSERVAÇÕES", 
        "Valor BID", "ROTA", "Mês", "Mês Ano", "Coluna 1", "Coluna 2", "TIPO", "DATA MAPEAMENTO", "FATURA", "VALOR", 
        "DATA EMISSÃO", "VENCIMENTO", "ELEMENTO PEP - CC / WBS", "VALIDAÇÃO PEP - CC /WBS", "Lançamento V360", 
        "Id V360", "Registrado SAP (S/N)", "Registro SAP", "Lançamento FI (S/N)", "Processo lançamento FI"
      ];

      const linhaCabecalho = worksheet.getRow(4);
      linhaCabecalho.values = titulos;

      // 5. Estiliza o cabeçalho
      linhaCabecalho.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; 
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      });
      linhaCabecalho.height = 35;

      // 6. Insere os dados dos ATMs filtrados
      atmsFiltrados.forEach(atm => {
        const rotaStr = (atm.origem?.municipio && atm.destino?.municipio) 
          ? `${atm.origem.uf} ${atm.origem.municipio} x ${atm.destino.municipio} ${atm.destino.uf}` : '-';

        let mesText = '-';
        let mesAnoText = '-';
        if (atm.data_solicitacao) {
          const date = new Date(atm.data_solicitacao);
          const meses = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
          mesText = meses[date.getMonth()];
          mesAnoText = `${date.getFullYear()} ${mesText}`;
        }

        const row = worksheet.addRow({
          data_sol: atm.data_solicitacao ? atm.data_solicitacao.split('T')[0] : '-',
          atm: atm.numero_atm || shortId(atm.id),
          pedido: atm.pedido_compra || '-',
          nf: atm.nf || '-',
          wbs: atm.wbs || '-',
          uf1: atm.origem?.uf || '-',
          mun1: atm.origem?.municipio || '-',
          coleta: atm.origem?.nome_local || '-',
          x: 'x',
          entrega: atm.destino?.nome_local || '-',
          uf2: atm.destino?.uf || '-',
          mun2: atm.destino?.municipio || '-',
          tipo_frete: atm.tipo_frete || '-',
          solicitacao: atm.solicitacao || '-',
          veiculo: atm.veiculo || atm.modal || '-',
          transportadora: atm.transportadora?.nome || '-',
          cotacao: atm.cotacao_bid ? "Cotação" : (atm.valor_bid ? "BID" : '-'),
          valor_nf: atm.valor_nf || '',
          volume: atm.volume || '',
          peso: atm.peso || '',
          valor_previsto: atm.valor_bid_dedicado || '',
          col1: '',
          status: atm.status || '-',
          obs: atm.observacoes || '-',
          valor_bid: atm.valor_bid || atm.cotacao_bid || '',
          rota: rotaStr,
          mes: mesText,
          mes_ano: mesAnoText,
          col_a: '',
          col_b: '',
          tipo_doc: atm.tipo_documento || '-',
          data_map: atm.data_mapeamento ? atm.data_mapeamento.split('T')[0] : '-',
          fatura: atm.fatura_cte || '-',
          valor: atm.valor || '',
          data_emissao: atm.data_emissao ? atm.data_emissao.split('T')[0] : '-',
          vencimento: atm.vencimento ? atm.vencimento.split('T')[0] : '-',
          elemento_pep: atm.elemento_pep_cc_wbs || '-',
          validacao_pep: atm.validacao_pep || '-',
          lancamento_v360: '',
          id_v360: '',
          registrado_sap: atm.registrado_sap || '-',
          registro_sap: atm.registro_sap || '-',
          lancamento_fi: atm.lancamento_fi || '-',
          processo_fi: atm.processo_lancamento_fi || '-'
        });

        // Estiliza as linhas com os dados
        row.eachCell((cell) => {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = { top: { style: 'thin', color: { argb: 'FFE5E7EB' } }, bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } } };
        });
      });

      // 7. Salva e inicia o download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, "Gestao_de_Fretes.xlsx");

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
      
      {/* TABELA DE DADOS NA TELA */}
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
              <th>Tipo Doc.</th><th>Data Map.</th><th>Fatura</th><th>Valor (R$)</th><th>Emissão/Venc.</th><th>Elem. PEP/WBS</th><th>Valid. PEP</th><th>SAP (S/N) / Cód</th>
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