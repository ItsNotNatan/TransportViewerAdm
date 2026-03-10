// CardExpandido.jsx
import React, { useState } from 'react';
import BtnPdf from '../BtnPdf/BtnPdf'; 
import CardEditavel from '../CardEditavel/CardEditavel';

const X = ({ size = 24 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const EditIcon = ({ size = 18 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;

export default function CardExpandido({ atm, onClose, onAtmUpdated }) {
  const [modoEdicao, setModoEdicao] = useState(false);

  if (!atm) return null;

  const shortId = (id) => id ? id.substring(0, 8).toUpperCase() : 'N/A';
  
  const getStatusClass = (status) => {
    if (status === 'Entregue') return 'badge-success';
    if (status === 'Aguardando Aprovação') return 'badge-warning';
    return 'badge-info';
  };
  
  const formatarData = (dataStr) => {
    if (!dataStr) return 'Não informada';
    const partes = dataStr.split('-');
    if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
    return dataStr;
  };
  
  const formatarValor = (valor) => {
    if (!valor || isNaN(valor)) return 'Sob Consulta';
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const lidarComSalvar = () => {
    setModoEdicao(false); 
    if (onAtmUpdated) onAtmUpdated(); 
  };

  // Estilo reutilizável para a lista de itens
  const liStyle = { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.25rem' };
  const spanStyle = { color: '#6b7280', fontSize: '0.9rem' };
  const strongStyle = { color: '#111827', fontSize: '0.9rem', textAlign: 'right', maxWidth: '60%' };

  return (
    <div className="modal-overlay">
      <div className="modal-content fade-in" style={{ maxWidth: '1000px' }}> {/* Aumentei a largura máxima para caber mais dados */}
        
        <div className="modal-header">
          <div>
            <span className="modal-subtitle">{modoEdicao ? 'Editando Informações' : 'Ficha Cadastral Logística Detalhada'}</span>
            <h2 className="modal-title">ATM #{shortId(atm.id)}</h2>
          </div>
          <button className="btn-close" onClick={onClose}><X size={24} /></button>
        </div>

        {modoEdicao ? (
          <CardEditavel atm={atm} onCancelar={() => setModoEdicao(false)} onSalvar={lidarComSalvar} />
        ) : (
          <>
            <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto', padding: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                
                {/* 1. IDENTIFICAÇÃO */}
                <div>
                  <h4 style={{ fontSize: '1.1rem', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>Identificação do Pedido</h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <li style={liStyle}><span style={spanStyle}>Solicitante:</span> <strong style={strongStyle}>{atm.solicitacao || 'Não informado'}</strong></li>
                    <li style={liStyle}><span style={spanStyle}>ID do Sistema:</span> <strong style={strongStyle}>{atm.id}</strong></li>
                    <li style={liStyle}><span style={spanStyle}>Data Solicitação:</span> <strong style={strongStyle}>{formatarData(atm.data_solicitacao || atm.created_at?.split('T')[0])}</strong></li>
                    <li style={liStyle}><span style={spanStyle}>Pedido de Compra:</span> <strong style={strongStyle}>{atm.pedido_compra || 'Não informado'}</strong></li>
                    <li style={liStyle}><span style={spanStyle}>Nota Fiscal:</span> <strong style={strongStyle}>{atm.nf || 'Não informado'}</strong></li>
                    <li style={liStyle}><span style={spanStyle}>WBS / C. Custo:</span> <strong style={strongStyle}>{atm.wbs || 'Não informado'}</strong></li>
                  </ul>
                </div>

                {/* 2. CARGA E TRANSPORTE */}
                <div>
                  <h4 style={{ fontSize: '1.1rem', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>Características da Carga</h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <li style={liStyle}><span style={spanStyle}>Peso Estimado:</span> <strong style={strongStyle}>{atm.peso ? `${atm.peso} kg` : 'Não informado'}</strong></li>
                    <li style={liStyle}><span style={spanStyle}>Volume:</span> <strong style={strongStyle}>{atm.volume ? `${atm.volume} m³` : 'Não informado'}</strong></li>
                    <li style={liStyle}><span style={spanStyle}>Medidas (CxLxA):</span> <strong style={strongStyle}>{atm.medidas || 'Não informado'}</strong></li>
                    <li style={liStyle}><span style={spanStyle}>Veículo / Modal:</span> <strong style={strongStyle}>{atm.veiculo || 'Não informado'}</strong></li>
                    <li style={liStyle}><span style={spanStyle}>Tipo de Frete:</span> <strong style={strongStyle}>{atm.tipo_frete || 'Não informado'}</strong></li>
                    <li style={liStyle}><span style={spanStyle}>Transportadora:</span> <strong style={strongStyle}>{atm.transportadora?.nome || 'A Definir'}</strong></li>
                  </ul>
                </div>

                {/* 3. ORIGEM E DESTINO (DETALHADO) */}
                <div style={{ gridColumn: 'span 2' }}>
                  <h4 style={{ fontSize: '1.1rem', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>Rota Detalhada</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    
                    {/* ORIGEM */}
                    <div style={{ backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 'bold' }}>Origem (Coleta)</span>
                      <strong style={{ display: 'block', color: '#111827', marginTop: '0.5rem', fontSize: '1.1rem' }}>{atm.origem?.nome_local || 'Fornecedor não especificado'}</strong>
                      
                      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.9rem', color: '#4b5563' }}>
                        <div><strong>CEP:</strong> {atm.origem?.cep || 'N/A'}</div>
                        <div><strong>Endereço:</strong> {atm.origem?.logradouro || 'N/A'}, {atm.origem?.numero || 'S/N'}</div>
                        <div><strong>Bairro:</strong> {atm.origem?.bairro || 'N/A'}</div>
                        <div><strong>Cidade/UF:</strong> {atm.origem?.municipio} - {atm.origem?.uf}</div>
                      </div>
                      
                      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <span style={{ color: '#6b7280' }}>Previsão de Coleta:</span>
                        <strong style={{ color: '#111827' }}>{formatarData(atm.created_at?.split('T')[0])}</strong>
                      </div>
                    </div>

                    {/* DESTINO */}
                    <div style={{ backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 'bold' }}>Destino (Entrega)</span>
                      <strong style={{ display: 'block', color: '#111827', marginTop: '0.5rem', fontSize: '1.1rem' }}>{atm.destino?.nome_local || 'Destinatário não especificado'}</strong>
                      
                      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.9rem', color: '#4b5563' }}>
                        <div><strong>CEP:</strong> {atm.destino?.cep || 'N/A'}</div>
                        <div><strong>Endereço:</strong> {atm.destino?.logradouro || 'N/A'}, {atm.destino?.numero || 'S/N'}</div>
                        <div><strong>Bairro:</strong> {atm.destino?.bairro || 'N/A'}</div>
                        <div><strong>Cidade/UF:</strong> {atm.destino?.municipio} - {atm.destino?.uf}</div>
                      </div>

                      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <span style={{ color: '#6b7280' }}>Previsão de Entrega:</span>
                        <strong style={{ color: '#111827' }}>{formatarData(atm.data_entrega)}</strong>
                      </div>
                    </div>

                  </div>
                </div>

                {/* 4. FINANCEIRO E OBSERVAÇÕES */}
                <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>Controle Financeiro</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span style={{ color: '#6b7280', fontSize: '0.95rem' }}>Status Atual:</span> 
                      <span className={`badge ${getStatusClass(atm.status)}`} style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>{atm.status}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ecfdf5', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #a7f3d0' }}>
                      <span style={{ color: '#065f46', fontWeight: 'bold' }}>Valor Final do Frete:</span> 
                      <strong style={{ color: '#059669', fontSize: '1.3rem' }}>{formatarValor(atm.valor_nf || atm.cotacao_bid)}</strong>
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '1.1rem', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>Observações e Histórico</h4>
                    <div style={{ backgroundColor: '#fffbeb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #fde68a', height: '100%' }}>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#92400e', whiteSpace: 'pre-wrap' }}>{atm.observacoes || 'Nenhuma observação extra registada no sistema.'}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
              <BtnPdf atm={atm} />
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => setModoEdicao(true)} 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: '#fef3c7', color: '#d97706' }}>
                  <EditIcon size={18} /> Editar Pedido
                </button>
                <button className="btn-secondary" onClick={onClose}>Fechar</button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}