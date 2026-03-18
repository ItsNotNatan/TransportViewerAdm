// src/componentes/BtnPdf/BtnPdf.jsx
import React, { useState } from 'react';

// Ícone do Documento
const FileText = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

export default function BtnPdf({ atm }) {
  const [gerandoPdf, setGerandoPdf] = useState(false);

  // Função auxiliar para encurtar o ID caso o ATM ainda não tenha número
  const shortId = (id) => id ? id.substring(0, 8).toUpperCase() : 'N/A';

  // LÓGICA REAL DO BOTÃO DE PDF/WORD
  const handleGerarPdf = async () => {
    setGerandoPdf(true);
    
    try {
      // Faz a chamada ao seu backend (Node.js) enviando os dados do ATM
      const resposta = await fetch('http://localhost:3001/api/gerar-atm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(atm), 
      });

      if (!resposta.ok) {
        throw new Error('Falha ao gerar o documento no servidor.');
      }

      // Recebe o arquivo pronto e força o download no navegador
      const blob = await resposta.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Nome do arquivo que será baixado
      link.setAttribute('download', `Autorizacao_ATM_${atm.numero_atm || shortId(atm.id)}.docx`);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

    } catch (erro) {
      console.error(erro);
      alert("Erro ao tentar gerar o documento. O servidor Node.js está a rodar e a rota /api/gerar-atm foi criada?");
    } finally {
      setGerandoPdf(false);
    }
  };

  return (
    <button 
      onClick={handleGerarPdf}
      disabled={gerandoPdf}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem', 
        padding: '0.6rem 1.25rem', 
        borderRadius: '0.5rem', 
        border: '1px solid #fca5a5', 
        cursor: gerandoPdf ? 'not-allowed' : 'pointer', 
        fontWeight: 'bold', 
        backgroundColor: '#fee2e2', 
        color: '#ef4444',
        transition: 'background-color 0.2s',
        opacity: gerandoPdf ? 0.7 : 1
      }}
      onMouseOver={(e) => { if(!gerandoPdf) e.currentTarget.style.backgroundColor = '#fecaca' }} 
      onMouseOut={(e) => { if(!gerandoPdf) e.currentTarget.style.backgroundColor = '#fee2e2' }}
    >
      <FileText size={18} /> 
      {gerandoPdf ? 'Gerando Documento...' : 'Gerar Autorização'}
    </button>
  );
}