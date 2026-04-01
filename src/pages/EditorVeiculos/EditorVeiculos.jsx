import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './EditorVeiculos.css';

// --- Ícones ---
const Plus = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const Save = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;
const Trash = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;

export default function EditorVeiculos() {
  const [veiculos, setVeiculos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [selecionado, setSelecionado] = useState(null);

  // Estado do Formulário
  const [formData, setFormData] = useState({
    nome: '',
    comp: '',
    larg: '',
    alt: ''
  });

  // Busca os veículos ao carregar
  useEffect(() => {
    fetchVeiculos();
  }, []);

  const fetchVeiculos = async () => {
    setCarregando(true);
    try {
      const response = await api.get('/admin/veiculos');
      setVeiculos(response.data);
    } catch (error) {
      console.error("Erro ao carregar veículos:", error);
    } finally {
      setCarregando(false);
    }
  };

  const handleSelect = (v) => {
    setSelecionado(v);
    setFormData({
      nome: v.nome,
      comp: v.comp,
      larg: v.larg,
      alt: v.alt
    });
  };

  const handleNovo = () => {
    setSelecionado(null);
    setFormData({ nome: '', comp: '', larg: '', alt: '' });
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    try {
      if (selecionado) {
        // Atualizar
        await api.put(`/admin/veiculos/${selecionado.id}`, formData);
        alert("Veículo atualizado com sucesso!");
      } else {
        // Criar novo
        await api.post('/admin/veiculos', formData);
        alert("Novo veículo cadastrado!");
      }
      fetchVeiculos();
      handleNovo();
    } catch (error) {
      alert("Erro ao salvar dados do veículo.");
    }
  };

  const handleExcluir = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este veículo?")) return;
    try {
      await api.delete(`/admin/veiculos/${id}`);
      fetchVeiculos();
      handleNovo();
    } catch (error) {
      alert("Erro ao excluir veículo.");
    }
  };

  return (
    <div className="editor-veiculos-page fade-in">
      <div className="editor-container">
        
        {/* LISTA DE VEÍCULOS (Esquerda) */}
        <aside className="veiculos-list-panel">
          <div className="panel-header">
            <h3>Frota Cadastrada</h3>
            <button className="btn-icon-add" onClick={handleNovo} title="Adicionar Novo">
              <Plus />
            </button>
          </div>
          
          <div className="list-scroll">
            {carregando ? <p className="msg-status">Carregando...</p> : 
              veiculos.map(v => (
                <div 
                  key={v.id} 
                  className={`veiculo-card-item ${selecionado?.id === v.id ? 'active' : ''}`}
                  onClick={() => handleSelect(v)}
                >
                  <div className="v-info">
                    <strong>{v.nome}</strong>
                    <span>{v.comp}m x {v.larg}m x {v.alt}m</span>
                  </div>
                  <button className="btn-del-small" onClick={(e) => { e.stopPropagation(); handleExcluir(v.id); }}>
                    <Trash />
                  </button>
                </div>
              ))
            }
          </div>
        </aside>

        {/* FORMULÁRIO DE EDIÇÃO (Direita) */}
        <main className="veiculo-form-panel">
          <div className="panel-header">
            <h3>{selecionado ? `Editando: ${selecionado.nome}` : 'Cadastrar Novo Veículo'}</h3>
          </div>

          <form onSubmit={handleSalvar} className="form-edit-v">
            <div className="form-row-full">
              <label>Nome do Modelo / Tipo</label>
              <input 
                type="text" 
                required 
                value={formData.nome} 
                onChange={e => setFormData({...formData, nome: e.target.value})} 
                placeholder="Ex: Carreta LS, Truck, Fiorino..."
              />
            </div>

            <div className="form-grid-dimensions">
              <div className="field-group">
                <label>Comprimento (m)</label>
                <input 
                  type="number" step="0.01" required 
                  value={formData.comp} 
                  onChange={e => setFormData({...formData, comp: e.target.value})} 
                />
              </div>
              <div className="field-group">
                <label>Largura (m)</label>
                <input 
                  type="number" step="0.01" required 
                  value={formData.larg} 
                  onChange={e => setFormData({...formData, larg: e.target.value})} 
                />
              </div>
              <div className="field-group">
                <label>Altura (m)</label>
                <input 
                  type="number" step="0.01" required 
                  value={formData.alt} 
                  onChange={e => setFormData({...formData, alt: e.target.value})} 
                />
              </div>
            </div>

            <div className="volume-preview-card">
              <span>Volume Máximo Estimado:</span>
              <strong>
                {(formData.comp * formData.larg * formData.alt).toFixed(2)} m³
              </strong>
            </div>

            <div className="form-actions-v">
              <button type="button" className="btn-cancel" onClick={handleNovo}>Cancelar</button>
              <button type="submit" className="btn-save-v">
                <Save /> {selecionado ? 'Salvar Alterações' : 'Cadastrar Veículo'}
              </button>
            </div>
          </form>
        </main>

      </div>
    </div>
  );
}