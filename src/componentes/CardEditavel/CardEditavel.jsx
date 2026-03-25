// src/components/CardEditavel/CardEditavel.jsx
import React, { useState } from 'react';
import api from '../../services/api'; // 🟢 Usando nosso Axios configurado

const SaveIcon = ({ size = 18 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;

export default function CardEditavel({ atm, onCancelar, onSalvar }) {
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);
    
    const formData = new FormData(e.target);
    const d = Object.fromEntries(formData.entries());

    // Montando o objeto exatamente como o Backend gosta
    const dadosParaEnviar = {
      status: d.status,
      valor: d.valor_frete,
      nf: d.nf,
      pedido_compra: d.pedido_compra,
      wbs: d.wbs,
      observacoes: d.observacoes,
      peso: d.peso,
      volume: d.volume,
      medidas: d.medidas,
      veiculo: d.veiculo,
      tipo_frete: d.tipo_frete,
      nome_transportadora: d.transportadora, // Ajustado para facilitar no backend
      data_entrega: d.data_entrega,
      // Edição de Endereços inclusa:
      origem: {
        logradouro: d.origem_rua,
        numero: d.origem_num,
        municipio: d.origem_cidade,
        uf: d.origem_uf
      },
      destino: {
        logradouro: d.destino_rua,
        numero: d.destino_num,
        municipio: d.destino_cidade,
        uf: d.destino_uf
      }
    };

    try {
      // 🟢 Usando o API.PUT com Token automático
      await api.put(`/admin/transportes/${atm.id}`, dadosParaEnviar);
      alert('✅ Alterações salvas com sucesso!');
      onSalvar(); // Fecha o modal e atualiza a lista
    } catch (erro) {
      console.error(erro);
      alert('❌ Erro ao salvar: ' + (erro.response?.data?.erro || 'Falha na conexão'));
    } finally {
      setSalvando(false);
    }
  };

  const inputStyle = { width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.9rem' };
  const labelStyle = { fontWeight: 'bold', fontSize: '0.75rem', color: '#666', marginBottom: '4px', display: 'block', textTransform: 'uppercase' };

  return (
    <form onSubmit={handleSubmit} style={{ backgroundColor: '#fff' }}>
      <div style={{ padding: '1.5rem', maxHeight: '75vh', overflowY: 'auto' }}>
        
        {/* SEÇÃO 1: STATUS E FINANCEIRO */}
        <h4 style={{ color: '#2563eb', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Financeiro & Controle</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '1.5rem' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Status Atual</label>
            <select name="status" defaultValue={atm.status} style={inputStyle}>
              <option value="Aguardando Aprovação">Aguardando Aprovação</option>
              <option value="Aprovado">Aprovado</option>
              <option value="Em Trânsito">Em Trânsito</option>
              <option value="Entregue">Entregue</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Valor Frete (R$)</label>
            <input type="number" step="0.01" name="valor_frete" defaultValue={atm.valor || atm.valor_frete || ''} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>NF</label>
            <input type="text" name="nf" defaultValue={atm.nf} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Pedido</label>
            <input type="text" name="pedido_compra" defaultValue={atm.pedido_compra} style={inputStyle} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>WBS / Centro de Custo</label>
            <input type="text" name="wbs" defaultValue={atm.wbs} style={inputStyle} />
          </div>
        </div>

        {/* SEÇÃO 2: ENDEREÇOS (AGORA EDITÁVEIS!) */}
        <h4 style={{ color: '#2563eb', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Endereços de Rota</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '1.5rem' }}>
          {/* Origem */}
          <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#1e40af' }}>COLETA (Origem)</span>
            <input type="text" name="origem_rua" defaultValue={atm.origem?.logradouro} placeholder="Rua" style={{ ...inputStyle, marginTop: '8px' }} />
            <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
              <input type="text" name="origem_num" defaultValue={atm.origem?.numero} placeholder="Nº" style={{ ...inputStyle, width: '60px' }} />
              <input type="text" name="origem_cidade" defaultValue={atm.origem?.municipio} placeholder="Cidade" style={inputStyle} />
              <input type="text" name="origem_uf" defaultValue={atm.origem?.uf} placeholder="UF" style={{ ...inputStyle, width: '50px' }} />
            </div>
          </div>
          {/* Destino */}
          <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#1e40af' }}>ENTREGA (Destino)</span>
            <input type="text" name="destino_rua" defaultValue={atm.destino?.logradouro} placeholder="Rua" style={{ ...inputStyle, marginTop: '8px' }} />
            <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
              <input type="text" name="destino_num" defaultValue={atm.destino?.numero} placeholder="Nº" style={{ ...inputStyle, width: '60px' }} />
              <input type="text" name="destino_cidade" defaultValue={atm.destino?.municipio} placeholder="Cidade" style={inputStyle} />
              <input type="text" name="destino_uf" defaultValue={atm.destino?.uf} placeholder="UF" style={{ ...inputStyle, width: '50px' }} />
            </div>
          </div>
        </div>

        {/* SEÇÃO 3: DETALHES TÉCNICOS */}
        <h4 style={{ color: '#2563eb', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Carga & Transportadora</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Nome Transportadora</label>
            <input type="text" name="transportadora" defaultValue={atm.transportadora?.nome} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Data Entrega</label>
            <input type="date" name="data_entrega" defaultValue={atm.data_entrega} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Peso (kg)</label>
            <input type="number" name="peso" defaultValue={atm.peso} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Volume (m³)</label>
            <input type="number" name="volume" defaultValue={atm.volume} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Veículo</label>
            <input type="text" name="veiculo" defaultValue={atm.veiculo} style={inputStyle} />
          </div>
        </div>
      </div>

      {/* RODAPÉ FIXO */}
      <div style={{ padding: '1rem', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button type="button" onClick={onCancelar} style={{ padding: '8px 20px', borderRadius: '6px', border: '1px solid #ccc', cursor: 'pointer' }}>Cancelar</button>
        <button type="submit" disabled={salvando} style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {salvando ? 'Salvando...' : <><SaveIcon /> Salvar Tudo</>}
        </button>
      </div>
    </form>
  );
}