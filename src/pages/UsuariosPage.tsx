import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  senha: string;
  ativo: boolean;
}

interface UsuariosProps {
  onLogout: () => void;
}

const UsuariosPage: React.FC<UsuariosProps> = ({ onLogout }) => {
 // const userName = localStorage.getItem('user_name') || 'Admin';

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Estados do formulário inline
  const [showForm, setShowForm] = useState(false);
  const [fadeIn, setFadeIn] = useState(false); // controla a animação suave
  const [isEditing, setIsEditing] = useState(false);
  const [currentUsuario, setCurrentUsuario] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    telefone: '',
    senha: '',
    ativo: true,
  });

  const loadUsuarios = async () => {
    setLoading(true);
    try {
      const res = await api.get('/Usuarios');
      setUsuarios(res.data);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      Swal.fire('Erro', 'Falha ao carregar usuários.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, []);

  const filteredUsuarios = usuarios.filter(u =>
    u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.cpf.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredUsuarios.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredUsuarios.length / recordsPerPage);

  const openForm = () => {
    setShowForm(true);
    // Pequeno delay para garantir que o componente monte antes da animação
    setTimeout(() => setFadeIn(true), 10);
  };

  const closeForm = () => {
    setFadeIn(false);
    // Espera a animação de fade-out terminar antes de remover do DOM
    setTimeout(() => {
      resetForm();
    }, 300); // tempo igual ao da transition no CSS
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      cpf: '',
      telefone: '',
      senha: '',
      ativo: true,
    });
    setIsEditing(false);
    setCurrentUsuario(null);
    setShowForm(false);
  };

  const handleNovoUsuario = () => {
    resetForm();
    openForm();
  };

  const handleEditarUsuario = (usuario: Usuario) => {
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      cpf: usuario.cpf,
      telefone: usuario.telefone,
      senha: '', // não pré-preenche senha
      ativo: usuario.ativo,
    });
    setCurrentUsuario(usuario);
    setIsEditing(true);
    openForm();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome || !formData.email || !formData.cpf) {
      Swal.fire('Atenção', 'Preencha os campos obrigatórios (Nome, E-mail, CPF).', 'warning');
      return;
    }

    try {
      if (isEditing && currentUsuario) {
        const payload = {
          ...formData,
          senha: formData.senha || currentUsuario.senha,
        };
        await api.put(`/Usuarios/${currentUsuario.id}`, payload);
        Swal.fire('Sucesso', 'Usuário atualizado!', 'success');
      } else {
        await api.post('/Usuarios', formData);
        Swal.fire('Sucesso', 'Usuário criado!', 'success');
      }
      closeForm();
      loadUsuarios();
    } catch (error) {
      console.error(error);
      Swal.fire('Erro', 'Falha ao salvar usuário.', 'error');
    }
  };

  const handleDeletarUsuario = async (id: number, nome: string) => {
    const result = await Swal.fire({
      title: 'Confirma exclusão?',
      text: `Excluir "${nome}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/Usuarios/${id}`);
        Swal.fire('Excluído', 'Usuário removido.', 'success');
        loadUsuarios();
      } catch (error) {
        Swal.fire('Erro', 'Falha ao excluir.', 'error');
      }
    }
  };

  return (
    <div className="d-flex" style={{ backgroundColor: '#121212', minHeight: '100vh' }}>
      {/* SIDEBAR */}
      <div className="bg-dark text-white p-4 vh-100 shadow" style={{ width: '280px', position: 'fixed', borderRight: '1px solid #333' }}>
        <div className="mb-5 d-flex align-items-center">
          <div className="bg-warning p-2 rounded-3 me-3">
            <i className="bi bi-display text-dark fs-4"></i>
          </div>
          <h4 className="fw-bold mb-0 text-white">SMART<span className="text-warning">KIOSK</span></h4>
        </div>

        <nav className="nav flex-column gap-2 flex-grow-1">
          <button className="nav-link text-start border-0 rounded-3 p-3 bg-transparent hover-nav w-100">
            <i className="bi bi-grid-fill me-3"></i> Painel Geral
          </button>
          <button className="nav-link text-start border-0 rounded-3 p-3 bg-warning text-dark fw-bold shadow-sm w-100">
            <i className="bi bi-people me-3"></i> Usuários
          </button>
        </nav>

        <button onClick={onLogout} className="btn btn-outline-danger w-100 mt-auto border-2 fw-bold">
          <i className="bi bi-box-arrow-left me-2"></i> SAIR
        </button>
      </div>

      <main className="flex-grow-1 p-5" style={{ marginLeft: '280px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold text-white mb-0">USUÁRIOS</h2>
            <p className="text-white-50 small">Gerenciamento de contas do sistema</p>
          </div>
          <button onClick={handleNovoUsuario} className="btn btn-warning fw-bold">
            <i className="bi bi-plus-lg me-1"></i> NOVO USUÁRIO
          </button>
        </div>

        {/* Formulário inline com animação suave */}
        {showForm && (
          <div 
            className={`card border-0 rounded-4 p-4 mb-4 shadow-lg transition-form ${fadeIn ? 'visible' : ''}`}
            style={{ backgroundColor: '#1e1e1e' }}
          >
            <h5 className="text-warning fw-bold mb-4">
              {isEditing ? 'Editar Usuário' : 'Cadastrar Novo Usuário'}
            </h5>
            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label text-white-50 small fw-bold">NOME COMPLETO *</label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    className="form-control bg-dark text-white border-secondary"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-white-50 small fw-bold">E-MAIL *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-control bg-dark text-white border-secondary"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-white-50 small fw-bold">CPF *</label>
                  <input
                    type="text"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    className="form-control bg-dark text-white border-secondary"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-white-50 small fw-bold">TELEFONE</label>
                  <input
                    type="text"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    className="form-control bg-dark text-white border-secondary"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-white-50 small fw-bold">
                    {isEditing ? 'NOVA SENHA (opcional)' : 'SENHA *'}
                  </label>
                  <input
                    type="password"
                    name="senha"
                    value={formData.senha}
                    onChange={handleInputChange}
                    className="form-control bg-dark text-white border-secondary"
                    {...(!isEditing && { required: true })}
                  />
                </div>
                <div className="col-md-6 d-flex align-items-end">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      name="ativo"
                      checked={formData.ativo}
                      onChange={handleInputChange}
                      className="form-check-input"
                      id="ativoCheck"
                      style={{ accentColor: '#ffc107' }}
                    />
                    <label className="form-check-label text-white ms-2" htmlFor="ativoCheck">
                      Usuário Ativo
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-end">
                <button
                  type="button"
                  className="btn btn-secondary me-3"
                  onClick={closeForm}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-warning fw-bold">
                  {isEditing ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Busca */}
        <div className="card border-0 rounded-4 p-3 mb-4 shadow-sm" style={{ backgroundColor: '#1e1e1e' }}>
          <div className="d-flex align-items-center">
            <i className="bi bi-search text-warning ms-3 fs-5"></i>
            <input
              type="text"
              className="form-control bg-transparent border-0 text-white ms-2 shadow-none"
              placeholder="Buscar por nome, email ou CPF..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>

        {/* Tabela (o resto permanece igual) */}
        <div className="card border-0 rounded-4 p-4 shadow-sm" style={{ backgroundColor: '#1e1e1e' }}>
          {/* ... conteúdo da tabela e paginação igual ao anterior ... */}
          {loading ? (
            <div className="text-center py-5 text-warning">Carregando...</div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle mb-0">
                  {/* thead e tbody como antes */}
                  <thead>
                    <tr className="text-white-50 small">
                      <th className="ps-4">ID</th>
                      <th>NOME</th>
                      <th>EMAIL</th>
                      <th>CPF</th>
                      <th>TELEFONE</th>
                      <th className="text-center">STATUS</th>
                      <th className="text-end pe-4">AÇÕES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.map(u => (
                      <tr key={u.id}>
                        <td className="ps-4 fw-bold text-warning">#{u.id}</td>
                        <td className="fw-bold">{u.nome}</td>
                        <td className="text-white-50">{u.email}</td>
                        <td className="text-white-50">{u.cpf}</td>
                        <td className="text-white-50">{u.telefone || '-'}</td>
                        <td className="text-center">
                          <span className={`badge ${u.ativo ? 'bg-success' : 'bg-danger'} px-3 py-2`}>
                            {u.ativo ? 'ATIVO' : 'INATIVO'}
                          </span>
                        </td>
                        <td className="text-end pe-4">
                          <button
                            onClick={() => handleEditarUsuario(u)}
                            className="btn btn-sm btn-outline-primary me-2"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            onClick={() => handleDeletarUsuario(u.id, u.nome)}
                            className="btn btn-sm btn-outline-danger"
                          >
                            <i className="bi bi-trash3"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-4 px-3">
                  <span className="text-white-50 small">Página {currentPage} de {totalPages}</span>
                  <div className="btn-group">
                    <button
                      className="btn btn-outline-warning btn-sm px-4"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                    >
                      Anterior
                    </button>
                    <button
                      className="btn btn-outline-warning btn-sm px-4"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => p + 1)}
                    >
                      Próximo
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Estilos da animação */}
      <style>{`
        .transition-form {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.3s ease-out, transform 0.3s ease-out;
        }
        .transition-form.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .card {
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default UsuariosPage;