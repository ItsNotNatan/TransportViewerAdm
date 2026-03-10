import React, { useRef, useState } from 'react';
import html2pdf from 'html2pdf.js';

// Importação da logo (certifique-se de que o caminho está correto)
import logoComau from '../../assets/logo-comau.png';

// Ícone do botão
const FileText = ({ size = 24 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>;

export default function BtnPdf({ atm }) {
  const pdfRef = useRef();
  const [gerando, setGerando] = useState(false);

  if (!atm) return null;

  // Funções de formatação específicas para o PDF
  const shortId = (id) => id ? id.substring(0, 8).toUpperCase() : 'N/A';
  const formatarData = (dataStr) => {
    if (!dataStr) return '';
    const partes = dataStr.split('-');
    if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
    return dataStr;
  };

  const gerarPDF = async () => {
    setGerando(true);
    const element = pdfRef.current;
    
    element.style.display = 'block';

    const opt = {
      margin:       10,
      filename:     `ATM_${shortId(atm.id)}_Autorizacao.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true }, 
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      await html2pdf().from(element).set(opt).save();
    } finally {
      element.style.display = 'none';
      setGerando(false);
    }
  };

  return (
    <>
      {/* BOTÃO VISÍVEL */}
      <button className="btn-danger" onClick={gerarPDF} disabled={gerando}>
        <FileText size={18}/> {gerando ? 'Gerando...' : 'Gerar PDF Oficial'}
      </button>

      {/* TEMPLATE DO PDF ESCONDIDO */}
      <div style={{ display: 'none' }}>
        <div ref={pdfRef} style={{ width: '800px', padding: '40px', backgroundColor: 'white', color: 'black', fontFamily: 'sans-serif' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            
            {/* 👇 AQUI ESTÁ A LOGO SUBSTITUINDO O TEXTO 👇 */}
            <div style={{ width: '25%', display: 'flex', alignItems: 'center' }}>
               <img src={logoComau} alt="Logo Comau" style={{ maxHeight: '60px', maxWidth: '100%', objectFit: 'contain' }} />
            </div>
            {/* 👆 ========================================== 👆 */}

            <div style={{ width: '50%', textAlign: 'center' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>ATM - Autorização de Transporte<br/>de Mercadoria</h1>
              <h2 style={{ fontSize: '16px', fontWeight: '600', textTransform: 'uppercase', marginTop: '8px', color: '#4b5563' }}>Sistema de Gestão Logística</h2>
            </div>
            <div style={{ width: '25%' }}></div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ display: 'inline-block', border: '2px solid black', padding: '8px 16px', fontSize: '18px', fontWeight: 'bold' }}>
              N° ATM: {shortId(atm.id)}
            </div>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ fontWeight: 'bold', fontSize: '16px', backgroundColor: '#f3f4f6', border: '1px solid black', padding: '8px', marginBottom: '15px', margin: 0 }}>1. IDENTIFICAÇÃO</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', padding: '0 10px', marginTop: '10px' }}>
              <div style={{ borderBottom: '1px solid black', paddingBottom: '4px' }}><strong>Solicitante:</strong> {atm.solicitacao || 'N/A'}</div>
              <div style={{ borderBottom: '1px solid black', paddingBottom: '4px' }}><strong>Data da Solicitação:</strong> {formatarData(atm.data_solicitacao)}</div>
              <div style={{ borderBottom: '1px solid black', paddingBottom: '4px', gridColumn: 'span 2' }}><strong>Centro de Custo / WBS:</strong> {atm.wbs || 'N/A'}</div>
            </div>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ fontWeight: 'bold', fontSize: '16px', backgroundColor: '#f3f4f6', border: '1px solid black', padding: '8px', marginBottom: '15px', margin: 0 }}>2. LOCAL DA COLETA (ORIGEM)</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', padding: '0 10px', marginTop: '10px' }}>
              <div style={{ borderBottom: '1px solid black', paddingBottom: '4px' }}><strong>Endereço de Coleta:</strong> {atm.origem?.nome_local}, {atm.origem?.municipio}-{atm.origem?.uf}</div>
              <div style={{ borderBottom: '1px solid black', paddingBottom: '4px' }}><strong>Data Previsão:</strong> {formatarData(atm.created_at?.split('T')[0])}</div>
            </div>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ fontWeight: 'bold', fontSize: '16px', backgroundColor: '#f3f4f6', border: '1px solid black', padding: '8px', marginBottom: '15px', margin: 0 }}>3. LOCAL DA ENTREGA (DESTINO)</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', padding: '0 10px', marginTop: '10px' }}>
              <div style={{ borderBottom: '1px solid black', paddingBottom: '4px' }}><strong>Endereço de Entrega:</strong> {atm.destino?.nome_local}, {atm.destino?.municipio}-{atm.destino?.uf}</div>
              <div style={{ borderBottom: '1px solid black', paddingBottom: '4px' }}><strong>Data Previsão:</strong> {formatarData(atm.data_entrega)}</div>
            </div>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ fontWeight: 'bold', fontSize: '16px', backgroundColor: '#f3f4f6', border: '1px solid black', padding: '8px', marginBottom: '15px', margin: 0 }}>4. DADOS DO MATERIAL E FRETE</h4>
            <div style={{ padding: '0 10px', marginTop: '10px' }}>
              <div style={{ borderBottom: '1px solid black', paddingBottom: '4px', marginBottom: '15px' }}><strong>Transportadora:</strong> {atm.transportadora?.nome || 'A Definir'}</div>
              
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '14px' }}>
                <tbody>
                  <tr>
                    <th style={{ border: '1px solid black', padding: '8px', backgroundColor: '#f9fafb', width: '25%', textAlign: 'left' }}>Peso Estimado:</th>
                    <td style={{ border: '1px solid black', padding: '8px', width: '25%' }}>{atm.peso ? `${atm.peso} kg` : '-'}</td>
                    <th style={{ border: '1px solid black', padding: '8px', backgroundColor: '#f9fafb', width: '25%', textAlign: 'left' }}>Volume:</th>
                    <td style={{ border: '1px solid black', padding: '8px', width: '25%' }}>{atm.volume ? `${atm.volume} m³` : '-'}</td>
                  </tr>
                  <tr>
                    <th style={{ border: '1px solid black', padding: '8px', backgroundColor: '#f9fafb', textAlign: 'left' }}>Tipo Veículo:</th>
                    <td style={{ border: '1px solid black', padding: '8px' }}>{atm.veiculo || '-'}</td>
                    <th style={{ border: '1px solid black', padding: '8px', backgroundColor: '#f9fafb', textAlign: 'left' }}>Tipo de Frete:</th>
                    <td style={{ border: '1px solid black', padding: '8px' }}>{atm.tipo_frete || '-'}</td>
                  </tr>
                  <tr>
                    <th style={{ border: '1px solid black', padding: '8px', backgroundColor: '#f9fafb', textAlign: 'left' }}>Pedido de Compra:</th>
                    <td style={{ border: '1px solid black', padding: '8px' }}>{atm.pedido_compra || '-'}</td>
                    <th style={{ border: '1px solid black', padding: '8px', backgroundColor: '#f9fafb', textAlign: 'left' }}>Nota Fiscal:</th>
                    <td style={{ border: '1px solid black', padding: '8px' }}>{atm.nf || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <h4 style={{ fontWeight: 'bold', fontSize: '16px', backgroundColor: '#f3f4f6', border: '1px solid black', padding: '8px', marginBottom: '15px', margin: 0 }}>5. OBSERVAÇÕES</h4>
            <div style={{ padding: '10px', border: '1px solid #d1d5db', minHeight: '60px' }}>
              {atm.observacoes || 'Nenhuma observação registrada.'}
            </div>
          </div>

          <div style={{ marginTop: '80px', textAlign: 'center' }}>
            <div style={{ width: '60%', borderTop: '2px solid black', margin: '0 auto', paddingTop: '10px', fontWeight: 'bold' }}>
              ASSINATURA DO SOLICITANTE
            </div>
            <div style={{ marginTop: '10px', textTransform: 'uppercase' }}>
              {atm.solicitacao || 'N/A'}
            </div>
            <p style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic', marginTop: '40px' }}>
              Documento gerado eletronicamente via ATM Log.
            </p>
          </div>

        </div>
      </div>
    </>
  );
}