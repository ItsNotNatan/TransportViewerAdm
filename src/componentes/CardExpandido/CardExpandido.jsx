// AtmModal.jsx
import React from 'react';
import { jsPDF } from "jspdf";

const X = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const FileText = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>;

export default function CardExpandido({ atm, onClose }) {
  if (!atm) return null;

  const shortId = (id) => id ? id.toString().substring(0, 8).toUpperCase() : 'N/A';

  const getStatusClass = (status) => {
    if (status === 'Entregue') return 'badge-success';
    if (status === 'Aguardando Aprovação') return 'badge-warning';
    return 'badge-info';
  };

  const formatarData = (dataStr) => {
    if (!dataStr) return '';
    if (dataStr.includes('/')) return dataStr; // Já está formatada
    const partes = dataStr.split('-');
    if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
    return dataStr;
  };

  const formatarValor = (valor) => {
    if (!valor || isNaN(valor)) return 'Sob Consulta';
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // ========================================================
  // GERADOR DE PDF (IDÊNTICO AO MODELO)
  // ========================================================
  const gerarPDF = () => {
    const doc = new jsPDF();
    let y = 20;

    // Cabeçalho
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("ATM - AUTORIZAÇÃO DE TRANSPORTE DE", 105, y, { align: "center" });
    y += 6;
    doc.text("MERCADORIA", 105, y, { align: "center" });
    y += 8;
    
    doc.setFontSize(12);
    doc.text("SISTEMA DE GESTÃO LOGÍSTICA", 105, y, { align: "center" });
    y += 10;
    
    doc.setFontSize(11);
    doc.text(`N° ATM: ${atm.id || ''}`, 105, y, { align: "center" });
    y += 10;

    const addRow = (label1, val1, label2 = "", val2 = "") => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(label1, 20, y);
      
      doc.setFont("helvetica", "normal");
      doc.text(val1 ? String(val1) : "", 65, y); 
      
      if (label2) {
        doc.setFont("helvetica", "bold");
        doc.text(label2, 120, y);
        doc.setFont("helvetica", "normal");
        doc.text(val2 ? String(val2) : "", 155, y);
      }
      y += 8;
    };

    const addSectionTitle = (title) => {
      y += 2;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(title, 20, y);
      y += 8;
    };

    // 1. IDENTIFICAÇÃO
    addSectionTitle("1. IDENTIFICAÇÃO");
    addRow("Solicitante:", atm.solicitacao || "");
    addRow("Data da Solicitação:", formatarData(atm.data_solicitacao));
    
    // Quebra de linha específica do modelo para Centro de Custo/WBS
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Centro de Custo /", 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(atm.wbs || "", 65, y + 4); 
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.text("WBS:", 20, y);
    y += 10;

    // 2. LOCAL DA COLETA (ORIGEM)
    addSectionTitle("2. LOCAL DA COLETA (ORIGEM)");
    const enderecoOrigem = atm.origem?.nome_local || atm.origem?.municipio || atm.origem || "";
    addRow("Endereço de Coleta:", enderecoOrigem);
    const dataColeta = atm.data_coleta || (atm.created_at ? atm.created_at.split('T')[0] : '');
    addRow("Data Previsão:", formatarData(dataColeta)); 
    y += 2;

    // 3. LOCAL DA ENTREGA (DESTINO)
    addSectionTitle("3. LOCAL DA ENTREGA (DESTINO)");
    const enderecoDestino = atm.destino?.nome_local || atm.destino?.municipio || atm.destino || "";
    addRow("Endereço de Entrega:", enderecoDestino);
    addRow("Data Previsão:", formatarData(atm.data_entrega));
    y += 2;

    // 4. DADOS DO MATERIAL E FRETE
    addSectionTitle("4. DADOS DO MATERIAL E FRETE");
    addRow("Transportadora:", atm.transportadora?.nome || atm.transportadora || "A Definir");
    addRow("Peso Estimado:", atm.peso ? `${atm.peso} kg` : "", "Volume:", atm.volume ? `${atm.volume} m³` : "");
    addRow("Tipo Veículo:", atm.veiculo || "", "Tipo de Frete:", atm.tipo_frete || "");
    addRow("Pedido de Compra:", atm.pedido_compra || "", "Nota Fiscal:", atm.nf || "");
    y += 2;

    // 5. OBSERVAÇÕES
    addSectionTitle("5. OBSERVAÇÕES");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const obsText = String(atm.observacoes || "Nenhuma observação.");
    const linhasObs = doc.splitTextToSize(obsText, 170);
    doc.text(linhasObs, 20, y);
    y += (linhasObs.length * 6) + 20;

    // ASSINATURA E RODAPÉ
    doc.setFont("helvetica", "bold");
    const nomeSolicitante = String(atm.solicitacao || '').toUpperCase();
    doc.text(`ASSINATURA DO SOLICITANTE: ${nomeSolicitante}`, 20, y);
    y += 10;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Documento gerado eletronicamente via ATM Log.", 20, y);

    doc.save(`ATM_${shortId(atm.id)}_Autorizacao.pdf`);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content fade-in" style={{ maxWidth: '900px' }}>
        <div className="modal-header">
          <div>
            <span className="modal-subtitle">Ficha Cadastral Logística</span>
            <h2 className="modal-title">ATM #{shortId(atm.id)}</h2>
          </div>
          <button className="btn-close" onClick={onClose}><X size={24} /></button>
        </div>
        
        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', padding: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
            
            {/* BLOCO 1: IDENTIFICAÇÃO */}
            <div>
              <h4 style={{ fontSize: '1.1rem', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>Identificação Básica</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{color: '#6b7280'}}>Solicitante:</span> <strong style={{color: '#111827'}}>{atm.solicitacao || 'Não informado'}</strong></li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{color: '#6b7280'}}>Data Solicitação:</span> <strong style={{color: '#111827'}}>{formatarData(atm.data_solicitacao || atm.created_at?.split('T')[0])}</strong></li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{color: '#6b7280'}}>Pedido de Compra:</span> <strong style={{color: '#111827'}}>{atm.pedido_compra || 'Não informado'}</strong></li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{color: '#6b7280'}}>Nota Fiscal:</span> <strong style={{color: '#111827'}}>{atm.nf || 'Não informado'}</strong></li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{color: '#6b7280'}}>WBS / C. Custo:</span> <strong style={{color: '#111827'}}>{atm.wbs || 'Não informado'}</strong></li>
              </ul>
            </div>

            {/* BLOCO 2: LOGÍSTICA */}
            <div>
              <h4 style={{ fontSize: '1.1rem', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>Carga e Transporte</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{color: '#6b7280'}}>Peso Estimado:</span> <strong style={{color: '#111827'}}>{atm.peso ? `${atm.peso} kg` : 'Não informado'}</strong></li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{color: '#6b7280'}}>Volume:</span> <strong style={{color: '#111827'}}>{atm.volume ? `${atm.volume} m³` : 'Não informado'}</strong></li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{color: '#6b7280'}}>Veículo / Modal:</span> <strong style={{color: '#111827'}}>{atm.veiculo || 'Não informado'}</strong></li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{color: '#6b7280'}}>Tipo de Frete:</span> <strong style={{color: '#111827'}}>{atm.tipo_frete || 'Não informado'}</strong></li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{color: '#6b7280'}}>Transportadora:</span> <strong style={{color: '#111827'}}>{atm.transportadora?.nome || atm.transportadora || 'A Definir'}</strong></li>
              </ul>
            </div>

            {/* BLOCO 3: ROTA DETALHADA */}
            <div>
              <h4 style={{ fontSize: '1.1rem', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>Rota (Origem e Destino)</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 'bold' }}>De: (Coleta)</span>
                  <strong style={{ display: 'block', color: '#111827', marginTop: '0.25rem', fontSize: '1rem' }}>{atm.origem?.nome_local || atm.origem || 'Não informado'}</strong>
                  <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>{atm.origem?.municipio} {atm.origem?.uf ? `- ${atm.origem.uf}` : ''}</span>
                </div>
                <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 'bold' }}>Para: (Entrega)</span>
                  <strong style={{ display: 'block', color: '#111827', marginTop: '0.25rem', fontSize: '1rem' }}>{atm.destino?.nome_local || atm.destino || 'Não informado'}</strong>
                  <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>{atm.destino?.municipio} {atm.destino?.uf ? `- ${atm.destino.uf}` : ''}</span>
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ color: '#6b7280' }}>Data Previsão:</span>
                    <strong style={{ color: '#111827' }}>{formatarData(atm.data_entrega)}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* BLOCO 4: VALORES E OBSERVAÇÕES */}
            <div>
              <h4 style={{ fontSize: '1.1rem', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>Acompanhamento Financeiro</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ color: '#6b7280', fontSize: '0.95rem' }}>Status Atual:</span> 
                <span className={`badge ${getStatusClass(atm.status)}`} style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>{atm.status || 'Não informado'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', backgroundColor: '#ecfdf5', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #a7f3d0' }}>
                <span style={{ color: '#065f46', fontWeight: 'bold' }}>Valor do Frete:</span> 
                <strong style={{ color: '#059669', fontSize: '1.2rem' }}>{formatarValor(atm.valor_nf || atm.cotacao_bid)}</strong>
              </div>
              <div style={{ backgroundColor: '#fffbeb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #fde68a' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#92400e', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  <FileText size={14} /> Observações do Solicitante
                </span>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#92400e', lineHeight: '1.5' }}>
                  {atm.observacoes || 'Nenhuma observação extra registrada.'}
                </p>
              </div>
            </div>

          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-danger" onClick={gerarPDF}>
            <FileText size={18}/> Gerar PDF Oficial
          </button>
          <button className="btn-secondary" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
}