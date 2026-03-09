import React, { useState, useEffect } from 'react';
import { jsPDF } from "jspdf"; // IMPORTAÇÃO OBRIGATÓRIA PARA O PDF

// --- Ícones SVG embutidos ---
const Search = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>;
const TableList = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="3" x2="21" y1="15" y2="15"/><line x1="9" x2="9" y1="9" y2="21"/></svg>;
const FolderOpen = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/></svg>;
const X = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const FileText = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>;

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAtm, setSelectedAtm] = useState(null);
  const [atms, setAtms] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    buscarPedidos();
  }, []);

  const buscarPedidos = async () => {
    setCarregando(true);
    try {
      const resposta = await fetch('http://localhost:3001/api/admin/transportes');
      const dados = await resposta.json();
      if (resposta.ok) setAtms(dados);
    } catch (erro) {
      console.error(erro);
    } finally {
      setCarregando(false);
    }
  };

  // ========================================================
  // FILTRO BLINDADO - MOSTRA TUDO SE ESTIVER VAZIO!
  // ========================================================
  const atmsFiltrados = atms.filter(atm => {
    if (!searchTerm) return true; // Se não digitou nada, mostra todos!

    const termo = searchTerm.toLowerCase();
    return (
      atm.pedido_compra?.toLowerCase().includes(termo) || 
      atm.nf?.toLowerCase().includes(termo) || 
      atm.wbs?.toLowerCase().includes(termo) ||
      atm.id?.toLowerCase().includes(termo)
    );
  });

  const getStatusClass = (status) => {
    if (status === 'Entregue') return 'badge-success';
    if (status === 'Aguardando Aprovação') return 'badge-warning';
    return 'badge-info';
  };

  const shortId = (id) => id ? id.substring(0, 8).toUpperCase() : 'N/A';

  const formatarData = (dataStr) => {
    if (!dataStr) return 'Não informada';
    const partes = dataStr.split('-');
    if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
    return dataStr;
  };

  // ========================================================
  // FUNÇÃO QUE GERA O PDF EXATAMENTE IGUAL AO SEU MODELO
  // ========================================================
  const gerarPDF = (atm) => {
    const doc = new jsPDF();
    let y = 20;

    // --- CABEÇALHO ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("ATM - AUTORIZAÇÃO DE TRANSPORTE DE MERCADORIA", 105, y, { align: "center" });
    y += 8;
    
    doc.setFontSize(12);
    doc.text("SISTEMA DE GESTÃO LOGÍSTICA", 105, y, { align: "center" });
    y += 10;
    
    doc.setFontSize(11);
    doc.text(`N° ATM: ${shortId(atm.id)}`, 105, y, { align: "center" });
    y += 10;

    // Função de ajuda para desenhar linhas de dados robustas
    const addRow = (label1, val1, label2 = "", val2 = "") => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(label1, 20, y);
      
      doc.setFont("helvetica", "normal");
      doc.text(val1 ? String(val1) : "Não informado", 65, y); // Margem alinhada
      
      if (label2) {
        doc.setFont("helvetica", "bold");
        doc.text(label2, 120, y);
        doc.setFont("helvetica", "normal");
        doc.text(val2 ? String(val2) : "Não informado", 155, y);
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

    // --- 1. IDENTIFICAÇÃO ---
    addSectionTitle("1. IDENTIFICAÇÃO");
    addRow("Solicitante:", atm.solicitacao, "Data da Solicitação:", formatarData(atm.data_solicitacao));
    addRow("Centro de Custo / WBS:", atm.wbs, "", "");
    y += 2;

    // --- 2. LOCAL DA COLETA (ORIGEM) ---
    addSectionTitle("2. LOCAL DA COLETA (ORIGEM)");
    const enderecoOrigem = `${atm.origem?.nome_local || 'Não informado'}, ${atm.origem?.municipio || ''}`;
    addRow("Endereço de Coleta:", enderecoOrigem);
    
    const dataCriacao = atm.created_at ? atm.created_at.split('T')[0] : '';
    addRow("Data Previsão:", formatarData(dataCriacao)); 
    y += 2;

    // --- 3. LOCAL DA ENTREGA (DESTINO) ---
    addSectionTitle("3. LOCAL DA ENTREGA (DESTINO)");
    const enderecoDestino = `${atm.destino?.nome_local || 'Destinatário'}, ${atm.destino?.municipio || ''}`;
    addRow("Endereço de Entrega:", enderecoDestino);
    addRow("Data Previsão:", formatarData(atm.data_entrega));
    y += 2;

    // --- 4. DADOS DO MATERIAL E FRETE ---
    addSectionTitle("4. DADOS DO MATERIAL E FRETE");
    addRow("Transportadora:", atm.transportadora?.nome || "A Definir");
    addRow("Peso Estimado:", atm.peso ? `${atm.peso} kg` : "Não informado", "Volume:", atm.volume ? `${atm.volume} m³` : "Não informado");
    addRow("Tipo Veículo:", atm.veiculo, "Tipo de Frete:", atm.tipo_frete);
    addRow("Pedido de Compra:", atm.pedido_compra, "Nota Fiscal:", atm.nf);
    y += 2;

    // --- 5. OBSERVAÇÕES ---
    addSectionTitle("5. OBSERVAÇÕES");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const obsText = String(atm.observacoes || "Nenhuma observação.");
    const linhasObs = doc.splitTextToSize(obsText, 170);
    doc.text(linhasObs, 20, y);
    y += (linhasObs.length * 6) + 20; // Espaço grande para a assinatura

    // --- ASSINATURA ---
    doc.setFont("helvetica", "bold");
    const nomeSolicitante = String(atm.solicitacao || 'SISTEMA').toUpperCase();
    doc.text(`ASSINATURA DO SOLICITANTE: ${nomeSolicitante}`, 20, y);
    y += 10;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Documento gerado eletronicamente via ATM Log.", 20, y);

    // Salva o PDF no computador
    doc.save(`ATM_${shortId(atm.id)}_Autorizacao.pdf`);
  };

  return (
    <>
      <section className="fade-in section-dashboard">
        <div className="section-header">
          <h3 className="section-title"><TableList size={24} className="text-primary" /> Banco de Dados (ATMs)</h3>
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input type="text" placeholder="Buscar..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr><th>ID ATM</th><th>Pedido</th><th>NF</th><th>WBS</th><th>Rota</th><th>Veículo</th><th>Status</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {carregando ? (<tr><td colSpan="8" className="text-center" style={{padding: '2rem'}}>Carregando...</td></tr>) : atmsFiltrados.map((atm) => (
                <tr key={atm.id}>
                  <td className="font-bold" title={atm.id}>#{shortId(atm.id)}</td>
                  <td>{atm.pedido_compra || '-'}</td><td>{atm.nf || '-'}</td><td>{atm.wbs || '-'}</td>
                  <td>De: {atm.origem?.municipio} <br/>Para: {atm.destino?.municipio}</td>
                  <td>{atm.veiculo}</td>
                  <td><span className={`badge ${getStatusClass(atm.status)}`}>{atm.status}</span></td>
                  <td><button className="btn-action" onClick={() => setSelectedAtm(atm)}><FolderOpen size={16} /> Abrir</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL */}
      {selectedAtm && (
        <div className="modal-overlay">
          <div className="modal-content fade-in">
            <div className="modal-header">
              <div>
                <span className="modal-subtitle">Ficha Cadastral Logística</span>
                <h2 className="modal-title">ATM #{shortId(selectedAtm.id)}</h2>
              </div>
              <button className="btn-close" onClick={() => setSelectedAtm(null)}><X size={24} /></button>
            </div>
            
            <div className="modal-body">
              <div className="modal-grid">
                <div className="modal-section">
                  <h4>Identificação</h4>
                  <ul>
                    <li><span>Solicitante:</span> <strong>{selectedAtm.solicitacao || 'Não informado'}</strong></li>
                    <li><span>Pedido:</span> <strong>{selectedAtm.pedido_compra || 'Não informado'}</strong></li>
                    <li><span>Nota Fiscal:</span> <strong>{selectedAtm.nf || 'Não informado'}</strong></li>
                    <li><span>WBS:</span> <strong>{selectedAtm.wbs || 'Não informado'}</strong></li>
                  </ul>
                </div>
                <div className="modal-section">
                  <h4>Carga e Veículo</h4>
                  <ul>
                    <li><span>Peso:</span> <strong>{selectedAtm.peso ? `${selectedAtm.peso} kg` : 'Não informado'}</strong></li>
                    <li><span>Volume:</span> <strong>{selectedAtm.volume ? `${selectedAtm.volume} m³` : 'Não informado'}</strong></li>
                    <li><span>Veículo:</span> <strong>{selectedAtm.veiculo || 'Não informado'}</strong></li>
                    <li><span>Status:</span> <span className={`badge ${getStatusClass(selectedAtm.status)}`}>{selectedAtm.status}</span></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-danger" onClick={() => gerarPDF(selectedAtm)}>
                <FileText size={18}/> Gerar PDF
              </button>
              <button className="btn-secondary" onClick={() => setSelectedAtm(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}