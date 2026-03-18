// src/componentes/BtnPdf/BtnPdf.jsx
import React, { useState } from 'react';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

try {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
} catch (e) {
  console.error("Erro ao carregar fontes do PDF:", e);
}

const FileText = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
);

export default function BtnPdf({ atm }) {
  const [gerando, setGerando] = useState(false);

  if (!atm) return null;

  const formatarData = (dataStr) => {
    if (!dataStr) return 'N/A';
    const partes = dataStr.split('T')[0].split('-');
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : dataStr;
  };

  const handleGerarPdf = () => {
    setGerando(true);

    try {
      const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 40, 40, 40],
        content: [
          // CABEÇALHO [cite: 1, 2]
          { text: 'ATM -AUTORIZAÇÃO DE TRANSPORTE DE MERCADORIA', style: 'headerMain' },
          { text: 'SISTEMA DE GESTÃO LOGÍSTICA', style: 'headerSub' },
          { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1.5, lineColor: '#333333' }] },
          
          // NÚMERO E TRANSPORTADORA [cite: 3]
          {
            margin: [0, 20, 0, 20],
            columns: [
              { text: [{ text: 'Nº ATM: ', bold: true }, atm.numero_atm || (atm.id ? atm.id.substring(0,8).toUpperCase() : 'N/A')] },
              { text: [{ text: 'Transportadora: ', bold: true }, atm.transportadora?.nome || 'A DEFINIR'], alignment: 'right' }
            ]
          },

          // IDENTIFICAÇÃO [cite: 4, 5]
          { text: 'IDENTIFICAÇÃO', style: 'sectionTitle' },
          {
            table: {
              widths: [150, '*'],
              body: [
                [
                  { text: 'Solicitante:', bold: true, margin: [0, 5] },
                  { text: atm.solicitacao || 'N/A', margin: [0, 5] }
                ],
                [
                  { text: 'Data da Solicitação:', bold: true, margin: [0, 5] },
                  { text: formatarData(atm.data_solicitacao || atm.created_at), margin: [0, 5] }
                ],
                [
                  { text: 'Centro de Custo / WBS:', bold: true, margin: [0, 5] },
                  { text: atm.wbs || 'N/A', margin: [0, 5] }
                ]
              ]
            }
          },

          // COLETA (ORIGEM) [cite: 6, 7, 8, 9, 10]
          { text: 'LOCAL DA COLETA (ORIGEM)', style: 'sectionTitle', margin: [0, 20, 0, 5] },
          {
            table: {
              widths: ['*', 150],
              body: [
                [
                  { text: [{ text: 'Endereço de Coleta: ', bold: true }, `${atm.origem?.logradouro || ''}, ${atm.origem?.numero || ''} - ${atm.origem?.municipio || ''}/${atm.origem?.uf || ''}`], margin: [0, 5] },
                  { text: [{ text: 'Data Previsão: ', bold: true }, formatarData(atm.created_at)], alignment: 'right', margin: [0, 5] }
                ]
              ]
            }
          },

          // ENTREGA (DESTINO) [cite: 11, 12, 13]
          { text: 'LOCAL DA ENTREGA (DESTINO)', style: 'sectionTitle', margin: [0, 20, 0, 5] },
          {
            table: {
              widths: ['*', 150],
              body: [
                [
                  { text: [{ text: 'Endereço de Entrega: ', bold: true }, `${atm.destino?.logradouro || ''}, ${atm.destino?.numero || ''} - ${atm.destino?.municipio || ''}/${atm.destino?.uf || ''}`], margin: [0, 5] },
                  { text: [{ text: 'Data Previsão: ', bold: true }, formatarData(atm.data_entrega)], alignment: 'right', margin: [0, 5] }
                ]
              ]
            }
          },

          // DADOS MATERIAL E FRETE [cite: 14, 15]
          { text: 'DADOS DO MATERIAL E FRETE', style: 'sectionTitle', margin: [0, 20, 0, 5] },
          {
            table: {
              widths: ['*', '*', '*'],
              body: [
                [
                  { text: [{ text: 'Peso Estimado: ', bold: true }, atm.peso ? `${atm.peso} kg` : 'N/A'], margin: [0, 5] },
                  { text: [{ text: 'Volume: ', bold: true }, atm.volume ? `${atm.volume} m³` : 'N/A'], margin: [0, 5] },
                  { text: [{ text: 'Tipo Veículo: ', bold: true }, atm.veiculo || 'N/A'], margin: [0, 5] }
                ],
                [
                  { text: [{ text: 'Tipo de Frete: ', bold: true }, atm.tipo_frete || 'N/A'], margin: [0, 5] },
                  { text: [{ text: 'Pedido de Compra: ', bold: true }, atm.pedido_compra || 'N/A'], margin: [0, 5] },
                  { text: [{ text: 'Nota Fiscal: ', bold: true }, atm.nf || 'N/A'], margin: [0, 5] }
                ]
              ]
            }
          },

          // OBSERVAÇÕES [cite: 16]
          { text: 'OBSERVAÇÕES', style: 'sectionTitle', margin: [0, 20, 0, 5] },
          {
            table: {
              widths: ['*'],
              heights: 60,
              body: [[{ text: atm.observacoes || 'Nenhuma observação extra.', fontSize: 10, margin: [5, 5, 5, 5] }]]
            }
          },

          // ASSINATURAS [cite: 17, 18, 19, 20]
          {
            margin: [0, 60, 0, 0],
            columns: [
              {
                stack: [
                  { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 220, y2: 0, lineWidth: 1 }] },
                  { text: 'ASSINATURA DO SOLICITANTE: ENGENHARIA', style: 'signatureLabel' },
                  { text: 'Documento gerado eletronicamente via ATM Log', fontSize: 8, color: 'gray', margin: [0, 2] }
                ],
                alignment: 'center'
              },
              {
                stack: [
                  { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 220, y2: 0, lineWidth: 1 }] },
                  { text: 'VISTO LOGÍSTICA / TRANSPORTADORA', style: 'signatureLabel' },
                  { text: `Data de Emissão: ${new Date().toLocaleDateString()}`, fontSize: 8, color: 'gray', margin: [0, 2] }
                ],
                alignment: 'center'
              }
            ]
          }
        ],
        styles: {
          headerMain: { fontSize: 18, bold: true, alignment: 'center', color: '#000000' },
          headerSub: { fontSize: 12, alignment: 'center', margin: [0, 2, 0, 5], color: '#444444' },
          sectionTitle: { fontSize: 12, bold: true, color: '#000000', margin: [0, 10, 0, 5], background: '#F0F0F0' },
          signatureLabel: { fontSize: 10, bold: true, margin: [0, 8, 0, 0] }
        },
        defaultStyle: { 
          fontSize: 11,
          columnGap: 20 
        }
      };

      pdfMake.createPdf(docDefinition).download(`ATM_${atm.numero_atm || 'doc'}.pdf`);
    } catch (error) {
      console.error("Erro detalhado ao gerar PDF:", error);
      alert("Erro ao gerar PDF. Verifique os dados.");
    } finally {
      setGerando(false);
    }
  };

  return (
    <button 
      onClick={handleGerarPdf}
      disabled={gerando}
      style={{ 
        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.5rem', 
        borderRadius: '0.5rem', border: '1px solid #fca5a5', cursor: gerando ? 'not-allowed' : 'pointer', 
        fontWeight: 'bold', backgroundColor: '#fee2e2', color: '#ef4444', transition: 'all 0.2s',
        opacity: gerando ? 0.7 : 1, fontSize: '1rem'
      }}
    >
      <FileText size={20} /> 
      {gerando ? 'Processando...' : 'Gerar Autorização (PDF)'}
    </button>
  );
}