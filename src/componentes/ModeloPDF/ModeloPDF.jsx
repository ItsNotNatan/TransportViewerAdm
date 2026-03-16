// src/componentes/ModeloPDF/ModeloPDF.jsx
import React, { forwardRef } from 'react';
import logoComau from '../../assets/logo-comau.png'; // Verifique se este caminho está correto no seu projeto

const ModeloPDF = forwardRef(({ atm }, ref) => {
  if (!atm) return null;

  const shortId = (id) => id ? id.substring(0, 8).toUpperCase() : 'N/A';
  const idExibicao = atm.numero_atm || shortId(atm.id);

  // Melhorada a função de data para lidar com o "T" caso venha do banco de dados
  const formatarData = (dataStr) => {
    if (!dataStr) return '';
    const partes = dataStr.split('T')[0].split('-');
    if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
    return dataStr;
  };

  return (
    // A GRANDE MÁGICA DE CSS AQUI: Oculta da visão do utilizador, mas deixa o HTML visível para a biblioteca fotograr
    <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
      
      {/* O width fixo em 800px garante que o PDF nunca sai esmagado, não importa o tamanho do ecrã do utilizador */}
      <div ref={ref} style={{ width: '800px', padding: '30px 40px', backgroundColor: 'white', color: 'black', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
        
        {/* Cabeçalho */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ width: '25%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
             <img src={logoComau} alt="Logo Comau" style={{ maxHeight: '90px', maxWidth: '100%', objectFit: 'contain' }} />
          </div>
          <div style={{ width: '50%', textAlign: 'center' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>ATM - Autorização de Transporte<br/>de Mercadoria</h1>
            <h2 style={{ fontSize: '15px', fontWeight: '600', textTransform: 'uppercase', marginTop: '6px', color: '#4b5563' }}>Sistema de Gestão Logística</h2>
          </div>
          <div style={{ width: '25%' }}></div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'inline-block', border: '2px solid black', padding: '6px 14px', fontSize: '16px', fontWeight: 'bold' }}>
            N° ATM: {idExibicao}
          </div>
        </div>

        {/* 1. IDENTIFICAÇÃO */}
        <div style={{ marginBottom: '15px' }}>
          <h4 style={{ fontWeight: 'bold', fontSize: '15px', backgroundColor: '#f3f4f6', border: '1px solid black', padding: '6px 8px', marginBottom: '10px', margin: 0 }}>1. IDENTIFICAÇÃO</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '0 10px', marginTop: '8px', boxSizing: 'border-box', fontSize: '14px' }}>
            <div style={{ borderBottom: '1px solid black', paddingBottom: '2px' }}><strong>Solicitante:</strong> {atm.solicitacao || 'N/A'}</div>
            <div style={{ borderBottom: '1px solid black', paddingBottom: '2px' }}><strong>Data da Solicitação:</strong> {formatarData(atm.data_solicitacao)}</div>
            <div style={{ borderBottom: '1px solid black', paddingBottom: '2px', gridColumn: 'span 2' }}><strong>Centro de Custo / WBS:</strong> {atm.wbs || 'N/A'}</div>
          </div>
        </div>

        {/* 2. LOCAL DA COLETA */}
        <div style={{ marginBottom: '15px' }}>
          <h4 style={{ fontWeight: 'bold', fontSize: '15px', backgroundColor: '#f3f4f6', border: '1px solid black', padding: '6px 8px', marginBottom: '10px', margin: 0 }}>2. LOCAL DA COLETA (ORIGEM)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '0 10px', marginTop: '8px', boxSizing: 'border-box', fontSize: '14px' }}>
            <div style={{ borderBottom: '1px solid black', paddingBottom: '2px' }}><strong>Endereço de Coleta:</strong> {atm.origem?.nome_local}, {atm.origem?.municipio}-{atm.origem?.uf}</div>
            <div style={{ borderBottom: '1px solid black', paddingBottom: '2px' }}><strong>Data Previsão:</strong> {formatarData(atm.data_solicitacao)}</div>
          </div>
        </div>

        {/* 3. LOCAL DA ENTREGA */}
        <div style={{ marginBottom: '15px' }}>
          <h4 style={{ fontWeight: 'bold', fontSize: '15px', backgroundColor: '#f3f4f6', border: '1px solid black', padding: '6px 8px', marginBottom: '10px', margin: 0 }}>3. LOCAL DA ENTREGA (DESTINO)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '0 10px', marginTop: '8px', boxSizing: 'border-box', fontSize: '14px' }}>
            <div style={{ borderBottom: '1px solid black', paddingBottom: '2px' }}><strong>Endereço de Entrega:</strong> {atm.destino?.nome_local}, {atm.destino?.municipio}-{atm.destino?.uf}</div>
            <div style={{ borderBottom: '1px solid black', paddingBottom: '2px' }}><strong>Data Previsão:</strong> {formatarData(atm.data_entrega)}</div>
          </div>
        </div>

        {/* 4. DADOS DO MATERIAL E FRETE */}
        <div style={{ marginBottom: '15px' }}>
          <h4 style={{ fontWeight: 'bold', fontSize: '15px', backgroundColor: '#f3f4f6', border: '1px solid black', padding: '6px 8px', marginBottom: '10px', margin: 0 }}>4. DADOS DO MATERIAL E FRETE</h4>
          <div style={{ padding: '0 10px', marginTop: '8px', boxSizing: 'border-box' }}>
            <div style={{ borderBottom: '1px solid black', paddingBottom: '2px', marginBottom: '10px', fontSize: '14px' }}><strong>Transportadora:</strong> {atm.transportadora?.nome || 'A Definir'}</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '13px', tableLayout: 'fixed' }}>
              <tbody>
                <tr>
                  <th style={{ border: '1px solid black', padding: '6px', backgroundColor: '#f9fafb', width: '25%', textAlign: 'left' }}>Peso Estimado:</th>
                  <td style={{ border: '1px solid black', padding: '6px', width: '25%', wordWrap: 'break-word' }}>{atm.peso ? `${atm.peso} kg` : '-'}</td>
                  <th style={{ border: '1px solid black', padding: '6px', backgroundColor: '#f9fafb', width: '25%', textAlign: 'left' }}>Volume:</th>
                  <td style={{ border: '1px solid black', padding: '6px', width: '25%', wordWrap: 'break-word' }}>{atm.volume ? `${atm.volume} m³` : '-'}</td>
                </tr>
                <tr>
                  <th style={{ border: '1px solid black', padding: '6px', backgroundColor: '#f9fafb', textAlign: 'left' }}>Tipo Veículo:</th>
                  <td style={{ border: '1px solid black', padding: '6px', wordWrap: 'break-word' }}>{atm.veiculo || '-'}</td>
                  <th style={{ border: '1px solid black', padding: '6px', backgroundColor: '#f9fafb', textAlign: 'left' }}>Tipo de Frete:</th>
                  <td style={{ border: '1px solid black', padding: '6px', wordWrap: 'break-word' }}>{atm.tipo_frete || '-'}</td>
                </tr>
                <tr>
                  <th style={{ border: '1px solid black', padding: '6px', backgroundColor: '#f9fafb', textAlign: 'left' }}>Pedido de Compra:</th>
                  <td style={{ border: '1px solid black', padding: '6px', wordWrap: 'break-word' }}>{atm.pedido_compra || '-'}</td>
                  <th style={{ border: '1px solid black', padding: '6px', backgroundColor: '#f9fafb', textAlign: 'left' }}>Nota Fiscal:</th>
                  <td style={{ border: '1px solid black', padding: '6px', wordWrap: 'break-word' }}>{atm.nf || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. OBSERVAÇÕES */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontWeight: 'bold', fontSize: '15px', backgroundColor: '#f3f4f6', border: '1px solid black', padding: '6px 8px', marginBottom: '10px', margin: 0 }}>5. OBSERVAÇÕES</h4>
          <div style={{ padding: '8px', border: '1px solid #d1d5db', minHeight: '40px', wordWrap: 'break-word', boxSizing: 'border-box', fontSize: '13px' }}>
            {atm.observacoes || 'Nenhuma observação registrada.'}
          </div>
        </div>

        {/* Rodapé e Assinaturas */}
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <div style={{ width: '60%', borderTop: '2px solid black', margin: '0 auto', paddingTop: '6px', fontWeight: 'bold', fontSize: '14px' }}>
            ASSINATURA DO SOLICITANTE
          </div>
          <div style={{ marginTop: '6px', textTransform: 'uppercase', fontSize: '14px' }}>
            {atm.solicitacao || 'N/A'}
          </div>
          <p style={{ fontSize: '11px', color: '#6b7280', fontStyle: 'italic', marginTop: '20px', marginBottom: 0 }}>
            Documento gerado eletronicamente via ATM Log.
          </p>
        </div>
      </div>
    </div>
  );
});

export default ModeloPDF;