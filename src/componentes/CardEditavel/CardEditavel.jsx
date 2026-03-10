// CardEditavel.jsx
import React, { useState } from 'react';

const SaveIcon = ({ size = 18 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;

export default function CardEditavel({ atm, onCancelar, onSalvar }) {
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);
    
    const formData = new FormData(e.target);
    const dadosAtualizados = Object.fromEntries(formData.entries());

    try {
      const resposta = await fetch(`http://localhost:3001/api/admin/transportes/${atm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: dadosAtualizados.status,
          cotacao_bid: dadosAtualizados.valor_frete,
          nf: dadosAtualizados.nf,
          pedido_compra: dadosAtualizados.pedido_compra,
          observacoes: dadosAtualizados.observacoes,
          // Novos campos enviados para atualização:
          peso: dadosAtualizados.peso,
          volume: dadosAtualizados.volume,
          medidas: dadosAtualizados.medidas,
          veiculo: dadosAtualizados.veiculo,
          tipo_frete: dadosAtualizados.tipo_frete,
          transportadora: { nome: dadosAtualizados.transportadora },
          data_entrega: dadosAtualizados.data_entrega
        }),
      });

      if (resposta.ok) {
        onSalvar(); 
      } else {
        alert('Erro ao atualizar o pedido no servidor.');
      }
    } catch (erro) {
      alert('Erro de conexão ao tentar salvar.');
    } finally {
      setSalvando(false);
    }
  };

  const inputStyle = { width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', outline: 'none', backgroundColor: '#fff' };
  const labelStyle = { fontWeight: 'bold', color: '#374151', fontSize: '0.85rem', marginBottom: '0.25rem', display: 'block' };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body" style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto', backgroundColor: '#f9fafb' }}>
        
        {/* CONTEXTO DA ROTA (Apenas Leitura para o Admin não se perder) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: '#e5e7eb', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
            <strong style={{ display: 'block', color: '#1f2937' }}>Coleta:</strong>
            {atm.origem?.logradouro}, {atm.origem?.numero} - {atm.origem?.bairro}<br/>
            {atm.origem?.municipio} - {atm.origem?.uf} (CEP: {atm.origem?.cep})
          </div>
          <div style={{ backgroundColor: '#e5e7eb', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
            <strong style={{ display: 'block', color: '#1f2937' }}>Entrega:</strong>
            {atm.destino?.logradouro}, {atm.destino?.numero} - {atm.destino?.bairro}<br/>
            {atm.destino?.municipio} - {atm.destino?.uf} (CEP: {atm.destino?.cep})
          </div>
        </div>

        {/* CAMPOS EDITÁVEIS - STATUS E VALORES */}
        <h4 style={{ fontSize: '1rem', borderBottom: '2px solid #d1d5db', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Financeiro & Status</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Status do Transporte</label>
            <select name="status" defaultValue={atm.status} style={inputStyle}>
              <option value="Aguardando Aprovação">Aguardando Aprovação</option>
              <option value="Aprovado">Aprovado</option>
              <option value="Em Trânsito">Em Trânsito</option>
              <option value="Entregue">Entregue</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Valor do Frete (R$)</label>
            <input type="number" step="0.01" name="valor_frete" defaultValue={atm.cotacao_bid || atm.valor_frete || ''} placeholder="Ex: 1500.00" style={inputStyle} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Pedido de Compra</label>
            <input type="text" name="pedido_compra" defaultValue={atm.pedido_compra || ''} placeholder="Atualizar Pedido..." style={inputStyle} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Nota Fiscal</label>
            <input type="text" name="nf" defaultValue={atm.nf || ''} placeholder="Atualizar NF..." style={inputStyle} />
          </div>
        </div>

        {/* CAMPOS EDITÁVEIS - LOGÍSTICA */}
        <h4 style={{ fontSize: '1rem', borderBottom: '2px solid #d1d5db', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Carga & Logística</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <label style={labelStyle}>Peso (kg)</label>
            <input type="number" step="0.01" name="peso" defaultValue={atm.peso || ''} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Volume (m³)</label>
            <input type="number" step="0.01" name="volume" defaultValue={atm.volume || ''} style={inputStyle} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Medidas (C x L x A)</label>
            <input type="text" name="medidas" defaultValue={atm.medidas || ''} placeholder="Ex: 2x1x1.5" style={inputStyle} />
          </div>
          
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Transportadora</label>
            <input type="text" name="transportadora" defaultValue={atm.transportadora?.nome || ''} placeholder="Nome da empresa..." style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Veículo</label>
            <input type="text" name="veiculo" defaultValue={atm.veiculo || ''} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Tipo de Frete</label>
            <input type="text" name="tipo_frete" defaultValue={atm.tipo_frete || ''} style={inputStyle} />
          </div>
        </div>

        {/* OBSERVAÇÕES */}
        <div>
          <label style={labelStyle}>Observações / Anotações Internas</label>
          <textarea name="observacoes" defaultValue={atm.observacoes || ''} rows="3" placeholder="Anotações..." style={{ ...inputStyle, resize: 'vertical' }}></textarea>
        </div>

      </div>

      <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', backgroundColor: '#fff' }}>
        <button type="button" onClick={onCancelar} style={{ padding: '0.625rem 1.5rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', cursor: 'pointer', backgroundColor: 'transparent', fontWeight: 'bold', color: '#374151' }}>
          Cancelar
        </button>
        <button type="submit" disabled={salvando} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#2563eb', color: 'white', padding: '0.625rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
          {salvando ? 'A Salvar...' : <><SaveIcon size={18} /> Salvar Alterações</>}
        </button>
      </div>
    </form>
  );
}