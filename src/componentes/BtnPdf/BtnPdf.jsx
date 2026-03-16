// src/componentes/BtnPdf/BtnPdf.jsx
import React, { useRef, useState } from 'react';
import html2pdf from 'html2pdf.js';
import ModeloPDF from '../ModeloPDF/ModeloPDF';

const FileText = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
  </svg>
);

export default function BtnPdf({ atm }) {
  const pdfRef = useRef();
  const [gerando, setGerando] = useState(false);

  if (!atm) return null;

  const gerarPDF = async () => {
    setGerando(true);
    const element = pdfRef.current;
    
    // Nome do ficheiro mais inteligente (usa o numero_atm se existir)
    const idNome = atm.numero_atm ? String(atm.numero_atm) : atm.id?.substring(0, 8).toUpperCase();

    const opt = {
      margin:       10, 
      filename:     `ATM_${idNome}_Autorizacao.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false }, 
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      // Como o elemento não está em display:none, o html2pdf consegue capturá-lo diretamente!
      await html2pdf().from(element).set(opt).save();
    } catch (erro) {
      console.error("Erro ao gerar PDF:", erro);
      alert("Houve um erro ao gerar o PDF.");
    } finally {
      setGerando(false);
    }
  };

  return (
    <>
      <button className="btn-danger" onClick={gerarPDF} disabled={gerando} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FileText size={18}/> {gerando ? 'A Gerar Documento...' : 'Gerar PDF Oficial'}
      </button>

      {/* Renderiza o modelo escondido na tela */}
      <ModeloPDF ref={pdfRef} atm={atm} />
    </>
  );
}