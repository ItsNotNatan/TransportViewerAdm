// AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import CardExpandido from '../../componentes/CardExpandido/CardExpandido'; 

// --- Ícones SVG embutidos ---
const Search = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>;
const TableList = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="3" x2="21" y1="15" y2="15"/><line x1="9" x2="9" y1="9" y2="21"/></svg>;
const FolderOpen = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/></svg>;
const XCircle = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>;

export default function AdminDashboard() {
  // ESTADOS DOS FILTROS SIMULTÂNEOS
  const [filtros, setFiltros] = useState({
    id: '',
    solicitante: '',
    pedido: '',
    nf: ''
  });
  
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

  // Função para atualizar os filtros dinamicamente
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  // Função para limpar todos os filtros de uma vez
  const limparFiltros = () => {
    setFiltros({ id: '', solicitante: '', pedido: '', nf: '' });
  };

  // ========================================================
  // LÓGICA DE FILTRAGEM SIMULTÂNEA (AND)
  // ========================================================
  const atmsFiltrados = atms.filter(atm => {
    // Se o campo do filtro estiver vazio, ele passa no teste automaticamente (retorna true)
    // Se tiver texto, ele verifica se inclui a palavra pesquisada
    const matchId = !filtros.id || atm.id?.toLowerCase().includes(filtros.id.toLowerCase().trim());
    const matchSolicitante = !filtros.solicitante || atm.solicitacao?.toLowerCase().includes(filtros.solicitante.toLowerCase().trim());
    const matchPedido = !filtros.pedido || atm.pedido_compra?.toLowerCase().includes(filtros.pedido.toLowerCase().trim());
    const matchNf = !filtros.nf || atm.nf?.toLowerCase().includes(filtros.nf.toLowerCase().trim());

    // Só exibe o pedido se ele passar em TODOS os filtros que estiverem preenchidos
    return matchId && matchSolicitante && matchPedido && matchNf;
  });

  const getStatusClass = (status) => {
    if (status === 'Entregue') return 'badge-success';
    if (status === 'Aguardando Aprovação') return 'badge-warning';
    return 'badge-info';
  };

  const shortId = (id) => id ? id.substring(0, 8).toUpperCase() : 'N/A';

  const formatarDataCurta = (dataStr) => {
    if (!dataStr) return '-';
    const partes = dataStr.split('T')[0].split('-');
    if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0].substring(2,4)}`; 
    return dataStr;
  };

  // Verifica se há algum filtro ativo para mostrar o botão de limpar
  const temFiltroAtivo = Object.values(filtros).some(valor => valor !== '');

  return (
    <>
      <section className="fade-in section-dashboard">
        
        {/* CABEÇALHO */}
        <div className="section-header" style={{ marginBottom: '1rem' }}>
          <h3 className="section-title" style={{ margin: 0, marginBottom: '1rem' }}>
            <TableList size={24} className="text-primary" /> Painel de Controle (Logística e Faturamento)
          </h3>
          
          {/* BARRA DE FILTROS SIMULTÂNEOS */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
            
            <div style={{ flex: '1 1 200px', minWidth: '150px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#6b7280', display: 'block', marginBottom: '0.25rem' }}>ID ATM</label>
              <input type="text" name="id" placeholder="Buscar ID..." value={filtros.id} onChange={handleFiltroChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', outline: 'none' }} />
            </div>

            <div style={{ flex: '1 1 200px', minWidth: '150px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#6b7280', display: 'block', marginBottom: '0.25rem' }}>Solicitante</label>
              <input type="text" name="solicitante" placeholder="Buscar Solicitante..." value={filtros.solicitante} onChange={handleFiltroChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', outline: 'none' }} />
            </div>

            <div style={{ flex: '1 1 200px', minWidth: '150px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#6b7280', display: 'block', marginBottom: '0.25rem' }}>Pedido (PC)</label>
              <input type="text" name="pedido" placeholder="Buscar Pedido..." value={filtros.pedido} onChange={handleFiltroChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', outline: 'none' }} />
            </div>

            <div style={{ flex: '1 1 200px', minWidth: '150px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#6b7280', display: 'block', marginBottom: '0.25rem' }}>Nota Fiscal (NF)</label>
              <input type="text" name="nf" placeholder="Buscar NF..." value={filtros.nf} onChange={handleFiltroChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', outline: 'none' }} />
            </div>

            {/* BOTÃO LIMPAR FILTROS (Aparece só se houver algo digitado) */}
            {temFiltroAtivo && (
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button 
                  onClick={limparFiltros}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', height: '37px', borderRadius: '0.375rem', border: 'none', backgroundColor: '#fee2e2', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  <XCircle size={16} /> Limpar
                </button>
              </div>
            )}

          </div>
        </div>
        
        {/* TABELA DE DADOS COMPLETA */}
        <div className="table-container" style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ whiteSpace: 'nowrap', width: '100%' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th colSpan="8" style={{ borderRight: '2px solid #e5e7eb', textAlign: 'center', color: '#1e3a8a' }}>DADOS DA OPERAÇÃO</th>
                <th colSpan="8" style={{ textAlign: 'center', color: '#047857' }}>FATURAMENTO / SAP</th>
                <th style={{ backgroundColor: '#f9fafb' }}></th>
              </tr>
              <tr>
                {/* BLOCO: OPERAÇÃO */}
                <th>ID ATM</th>
                <th>Solicitante</th>
                <th>Pedido</th>
                <th>NF</th>
                <th>Rota</th>
                <th>T. Frete</th>
                <th>Veículo</th>
                <th style={{ borderRight: '2px solid #e5e7eb' }}>Status</th>
                
                {/* BLOCO: FATURAMENTO E SAP */}
                <th>Tipo Doc.</th>
                <th>Data Map.</th>
                <th>Fatura CT-e</th>
                <th>Valor (R$)</th>
                <th>Emissão/Venc.</th>
                <th>Elem. PEP/WBS</th>
                <th>Valid. PEP</th>
                <th>SAP (S/N) / Cód</th>
                
                {/* AÇÕES (Fixa à direita) */}
                <th style={{ position: 'sticky', right: 0, backgroundColor: '#f9fafb', zIndex: 10, borderLeft: '1px solid #e5e7eb', boxShadow: '-2px 0 5px rgba(0,0,0,0.05)' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr><td colSpan="17" className="text-center" style={{padding: '2rem'}}>Carregando dados...</td></tr>
              ) : atmsFiltrados.length === 0 ? (
                <tr><td colSpan="17" className="text-center" style={{padding: '2rem', color: '#6b7280'}}>Nenhum resultado encontrado com os filtros atuais.</td></tr>
              ) : atmsFiltrados.map((atm) => (
                <tr key={atm.id}>
                  {/* OPERAÇÃO */}
                  <td className="font-bold" title={atm.id}>#{shortId(atm.id)}</td>
                  <td>{atm.solicitacao || '-'}</td>
                  <td>{atm.pedido_compra || '-'}</td>
                  <td>{atm.nf || '-'}</td>
                  <td style={{ fontSize: '0.8rem' }}>De: {atm.origem?.municipio}<br/>Para: {atm.destino?.municipio}</td>
                  <td>{atm.tipo_frete || '-'}</td>
                  <td>{atm.veiculo || '-'}</td>
                  <td style={{ borderRight: '2px solid #e5e7eb' }}>
                    <span className={`badge ${getStatusClass(atm.status)}`}>{atm.status}</span>
                  </td>

                  {/* FATURAMENTO E SAP */}
                  <td>{atm.tipo_documento || '-'}</td>
                  <td>{formatarDataCurta(atm.data_mapeamento)}</td>
                  <td className="font-bold text-gray-700">{atm.fatura_cte || '-'}</td>
                  <td className="text-green-600 font-bold">
                    {(atm.valor || atm.valor_nf) ? Number(atm.valor || atm.valor_nf).toLocaleString('pt-BR', {minimumFractionDigits: 2}) : '-'}
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    E: {formatarDataCurta(atm.data_emissao)}<br/>
                    V: <strong className="text-red-600">{formatarDataCurta(atm.vencimento)}</strong>
                  </td>
                  <td>{atm.elemento_pep_cc_wbs || atm.wbs || '-'}</td>
                  <td>{atm.validacao_pep || '-'}</td>
                  <td>
                    <span className={atm.registrado_sap === 'SIM' ? 'text-green-600 font-bold' : 'text-gray-400'}>
                      {atm.registrado_sap || 'NÃO'}
                    </span>
                    <br/>
                    <span style={{ fontSize: '0.8rem' }}>{atm.registro_sap || '-'}</span>
                  </td>

                  {/* AÇÕES (Botão fixo) */}
                  <td style={{ position: 'sticky', right: 0, backgroundColor: 'white', borderLeft: '1px solid #e5e7eb', boxShadow: '-2px 0 5px rgba(0,0,0,0.05)' }}>
                    <button className="btn-action" onClick={() => setSelectedAtm(atm)}>
                      <FolderOpen size={16} /> Abrir Ficha
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* RENDERIZANDO O NOSSO COMPONENTE MODAL */}
      <CardExpandido 
        atm={selectedAtm} 
        onClose={() => setSelectedAtm(null)}
        onAtmUpdated={() => {
          setSelectedAtm(null); 
          buscarPedidos();      
        }} 
      />
    </>
  );
}