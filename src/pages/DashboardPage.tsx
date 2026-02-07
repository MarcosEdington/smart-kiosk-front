import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';

interface KioskMedia {
  id: number;
  chave: string;
  fonte: string;
  tipo: string;
  duracao: number;
  posicao: number;
  ativo: boolean;
}

interface DashboardProps {
  onLogout: () => void;
}

const DashboardPage: React.FC<DashboardProps> = ({ onLogout }) => {
  const userName = localStorage.getItem('user_name') || 'Admin';

  const [playlist, setPlaylist] = useState<KioskMedia[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [totalVideos, setTotalVideos] = useState(0);
  const [totalAtivos, setTotalAtivos] = useState(0);
  const [totalTempoMinutos, setTotalTempoMinutos] = useState(0);

  // Estados para Busca e Paginação
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  const loadPlaylist = async () => {
    setLoading(true);
    try {
      const res = await api.get('/Playlist');
      const data: KioskMedia[] = res.data;
      // Ordenar por posicao para garantir sequência correta na exibição
      const sortedData = data.sort((a, b) => a.posicao - b.posicao);
      setPlaylist(sortedData);

      setTotalVideos(sortedData.length);
      setTotalAtivos(sortedData.filter(x => x.ativo).length);
      const tempoTotalMs = sortedData.reduce((acc, item) => acc + item.duracao, 0);
      setTotalTempoMinutos(Math.floor(tempoTotalMs / 60000)); // em minutos
    } catch (error) {
      console.error("Erro ao carregar playlist:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylist();
  }, []);

  // Lógica de Filtro
  const filteredPlaylist = playlist.filter(item => 
    item.chave.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.fonte.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Lógica de Paginação
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredPlaylist.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredPlaylist.length / recordsPerPage);

  const handleAdicionarVideo = async () => {
    const { value: file } = await Swal.fire({
      title: 'UPLOAD DE NOVA MÍDIA',
      input: 'file',
      inputAttributes: {
        'accept': 'video/mp4',
        'aria-label': 'Selecione o vídeo MP4'
      },
      showCancelButton: true,
      confirmButtonText: 'PRÓXIMO PASSO',
      confirmButtonColor: '#ffc107',
      background: '#1a1a1a',
      color: '#fff'
    });

    if (file) {
      const { value: formValues } = await Swal.fire({
        title: 'CONFIGURAÇÕES DA MÍDIA',
        background: '#1a1a1a',
        color: '#fff',
        html: `
          <input id="swal-chave" class="swal2-input" placeholder="Chave (Ex: PROMO_NATAL)" style="background:#252525; color:#fff;">
          <input id="swal-duracao" type="number" class="swal2-input" placeholder="Duração em Segundos" style="background:#252525; color:#fff;">
        `,
        focusConfirm: false,
        preConfirm: () => {
          return {
            chave: (document.getElementById('swal-chave') as HTMLInputElement).value,
            duracao: (document.getElementById('swal-duracao') as HTMLInputElement).value
          }
        }
      });

      if (formValues && formValues.chave) {
        try {
          Swal.fire({ title: 'Enviando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

          // 1. Faz o Upload do arquivo físico
          const formData = new FormData();
          formData.append('videoFile', file);
          formData.append('chave', formValues.chave);

          const uploadRes = await api.post('/Playlist/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

          // 2. Salva o registro no seu JSON/Banco
          const novoItem = {
            id: playlist.length > 0 ? Math.max(...playlist.map(p => p.id)) + 1 : 1,
            chave: formValues.chave,
            fonte: uploadRes.data.url, // URL retornada pelo C# (videos/nome.mp4)
            tipo: "video",
            duracao: parseInt(formValues.duracao) * 1000,
            posicao: playlist.length + 1,
            ativo: true
          };

          await api.post('/Playlist/item', novoItem);
          
          Swal.fire('Sucesso!', 'Vídeo enviado e cadastrado.', 'success');
          loadPlaylist();
        } catch (error) {
          Swal.fire('Erro', 'Falha no upload ou cadastro.', 'error');
        }
      }
    }
  };

  const handleEditarVideo = async (item: KioskMedia) => {
    // Parsear fonte para preencher campos
    let pastaInicial = '';
    let nomeArquivoInicial = item.fonte;
    if (item.fonte.endsWith('.mp4')) {
      nomeArquivoInicial = item.fonte.slice(0, -4);
    }
    if (nomeArquivoInicial.startsWith('videos/')) {
      pastaInicial = 'videos/';
      nomeArquivoInicial = nomeArquivoInicial.replace('videos/', '');
    }

    const segundos = Math.floor(item.duracao / 1000);

    const { value: formValues } = await Swal.fire({
      title: '<span style="color: #ffc107; font-weight: 900; letter-spacing: 1px;">EDITAR MÍDIA</span>',
      background: '#1a1a1a',
      color: '#fff',
      width: '550px',
      showCancelButton: true,
      confirmButtonText: 'ATUALIZAR CONFIGURAÇÃO',
      confirmButtonColor: '#ffc107',
      cancelButtonText: 'CANCELAR',
      cancelButtonColor: '#333',
      html: `
        <div style="text-align: left; font-family: 'Segoe UI', sans-serif; padding: 10px;">
          <div style="margin-bottom: 20px;">
             <label style="color: #888; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; display: block;">IDENTIFICAÇÃO DA MÍDIA (CHAVE)</label>
             <input id="swal-chave" class="swal2-input" value="${item.chave}" style="background: #252525; color: #fff; border: 1px solid #333; border-radius: 8px; width: 100%; margin: 0; padding: 0 15px; box-sizing: border-box;">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
            <div>
              <label style="color: #888; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; display: block;">LOCAL DO ARQUIVO</label>
              <select id="swal-pasta" class="swal2-input" style="background: #252525; color: #fff; border: 1px solid #333; border-radius: 8px; width: 100%; margin: 0; box-sizing: border-box;">
                <option value="videos/" ${pastaInicial === 'videos/' ? 'selected' : ''}>Pasta /videos</option>
                <option value="" ${pastaInicial === '' ? 'selected' : ''}>Raiz do Sistema</option>
              </select>
            </div>
            <div>
              <label style="color: #888; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; display: block;">DURAÇÃO (SEGUNDOS)</label>
              <input id="swal-duracao" type="number" class="swal2-input" value="${segundos}" style="background: #252525; color: #fff; border: 1px solid #333; border-radius: 8px; width: 100%; margin: 0; padding: 0 15px; box-sizing: border-box;">
            </div>
          </div>
          <div>
             <label style="color: #888; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; display: block;">NOME DO ARQUIVO (SEM EXTENSÃO)</label>
             <input id="swal-nome-arquivo" class="swal2-input" value="${nomeArquivoInicial}" style="background: #252525; color: #fff; border: 1px solid #333; border-radius: 8px; width: 100%; margin: 0; padding: 0 15px; box-sizing: border-box;">
             <small style="color: #ffc107; font-size: 10px; margin-top: 5px; display: block;">* O sistema adicionará automaticamente o formato .mp4</small>
          </div>
        </div>
      `,
      preConfirm: () => {
        const chave = (document.getElementById('swal-chave') as HTMLInputElement).value.trim();
        const pasta = (document.getElementById('swal-pasta') as HTMLSelectElement).value;
        const nomeArquivo = (document.getElementById('swal-nome-arquivo') as HTMLInputElement).value.trim();
        const segundos = parseInt((document.getElementById('swal-duracao') as HTMLInputElement).value);

        if (!chave || !nomeArquivo || isNaN(segundos) || segundos <= 0) {
          Swal.showValidationMessage('Preencha todos os campos corretamente!');
          return false;
        }

        const fonteFinal = `${pasta}${nomeArquivo}.mp4`;
        const duracaoMs = segundos * 1000;

        return { ...item, chave, fonte: fonteFinal, duracao: duracaoMs };
      }
    });

    if (formValues) {
      try {
        const listaAtualizada = playlist.map(i => 
          i.id === item.id ? { ...formValues as KioskMedia } : i
        );
        await api.post('/Playlist', listaAtualizada);
        Swal.fire({ icon: 'success', title: 'MÍDIA ATUALIZADA', background: '#1a1a1a', color: '#fff', confirmButtonColor: '#ffc107' });
        loadPlaylist();
      } catch (error) {
        Swal.fire('Erro', 'Falha ao atualizar no servidor.', 'error');
      }
    }
  };

  const handleDeletarVideo = async (item: KioskMedia) => {
    const confirm = await Swal.fire({
      title: 'CONFIRMAR EXCLUSÃO',
      text: `Tem certeza que deseja excluir a mídia "${item.chave}"?`,
      icon: 'warning',
      background: '#1a1a1a',
      color: '#fff',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#333',
      confirmButtonText: 'SIM, EXCLUIR',
      cancelButtonText: 'CANCELAR'
    });

    if (confirm.isConfirmed) {
      try {
        const listaAtualizada = playlist.filter(i => i.id !== item.id);
        // Reajustar posições após exclusão
        const listaReordenada = listaAtualizada.map((i, index) => ({
          ...i,
          posicao: index + 1
        }));
        await api.post('/Playlist', listaReordenada);
        Swal.fire({ icon: 'success', title: 'MÍDIA EXCLUÍDA', background: '#1a1a1a', color: '#fff', confirmButtonColor: '#ffc107' });
        loadPlaylist();
      } catch (error) {
        Swal.fire('Erro', 'Falha ao excluir no servidor.', 'error');
      }
    }
  };



const [showHint1, setShowHint1] = useState(true); // Balão do Kiosk
const [showHint2, setShowHint2] = useState(false); // Balão do Vídeo (começa escondido)

useEffect(() => {
  // 1. O primeiro balão aparece por 5 segundos
  const timer1 = setTimeout(() => {
    setShowHint1(false);
    setShowHint2(true); // 2. Quando o primeiro some, o segundo aparece
  }, 5000);

  // 3. O segundo balão some após mais 5 segundos
  const timer2 = setTimeout(() => {
    setShowHint2(false);
  }, 10000);

  return () => {
    clearTimeout(timer1);
    clearTimeout(timer2);
  };
}, []);

 const handleAbrirKioskLocal = () => {
    const urlFinal = "https://smartkioskview.netlify.app/leme.html";

    Swal.fire({
      title: '<span style="color: #ffc107; font-weight: 900;">VISUALIZAÇÃO DO KIOSK</span>',
      html: `
        <div style="
          background: #000; 
          border-radius: 10px; 
          position: relative; 
          height: 700px; 
          width: 100%; 
          overflow: hidden;
          box-sizing: border-box;
        ">
          
          <div id="kiosk-loader" style="
            position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
            background: #111; display: flex; flex-direction: column; 
            justify-content: center; align-items: center; z-index: 10;
          ">
            <div style="font-size: 50px; margin-bottom: 20px; animation: pulse 2s infinite;">🤖</div>
            <div style="color: #ffc107; font-family: monospace; font-weight: bold; letter-spacing: 2px;">
              CONECTANDO AO SERVIDOR...
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 10px;">
              O primeiro carregamento pode demorar alguns segundos.
            </p>
            <div style="width: 200px; height: 4px; background: #222; margin-top: 20px; border-radius: 10px; overflow: hidden;">
                <div style="width: 50%; height: 100%; background: #ffc107; animation: loadingBar 7s infinite ease-in-out;"></div>
            </div>
          </div>

          <iframe 
            id="kiosk-iframe"
            src="${urlFinal}" 
            style="width: 100%; height: 100%; border: none; display: block; opacity: 0; transition: opacity 0.5s;"
            title="Kiosk Preview"
            onload="setTimeout(() => { 
                document.getElementById('kiosk-loader').style.display='none'; 
                document.getElementById('kiosk-iframe').style.opacity='1'; 
            }, 500);"
          >
          </iframe>

        </div>

        <style>
          /* Remove scroll horizontal/vertical indesejado na modal */
          .swal2-html-container {
            overflow: hidden !important;
            margin: 1em 1.5em 0.5em !important;
          }
          @keyframes pulse {
            0% { transform: scale(1); filter: drop-shadow(0 0 0px #ffc107); }
            50% { transform: scale(1.1); filter: drop-shadow(0 0 15px #ffc107); }
            100% { transform: scale(1); filter: drop-shadow(0 0 0px #ffc107); }
          }
          @keyframes loadingBar {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
        </style>
      `,
      width: '1200px',
      background: '#1a1a1a',
      color: '#fff',
      showCloseButton: true,
      showConfirmButton: false, 
      focusConfirm: false,
      customClass: {
        popup: 'border border-secondary'
      }
    });
  };
  
  return (
    <div className="d-flex" style={{ backgroundColor: '#121212', minHeight: '100vh' }}>
      
      {/* SIDEBAR FIXA */}
      {/* <div className="bg-dark text-white p-4 vh-100 shadow" style={{ width: '280px', position: 'fixed', borderRight: '1px solid #333' }}>
        <div className="mb-5 d-flex align-items-center">
          <div className="bg-warning p-2 rounded-3 me-3">
            <i className="bi bi-display text-dark fs-4"></i>
          </div>
          <h4 className="fw-bold mb-0 text-white">SMART<span className="text-warning">KIOSK</span></h4>
        </div>

        <nav className="nav flex-column gap-2 flex-grow-1">
          <button className="nav-link text-start border-0 rounded-3 p-3 bg-warning text-dark fw-bold shadow-sm w-100">
            <i className="bi bi-grid-fill me-3"></i> Painel Geral
          </button>
          <button className="nav-link text-white text-start border-0 rounded-3 p-3 bg-transparent hover-nav w-100">
            <i className="bi bi-people me-3"></i> Usuários
          </button>
        </nav>

        <button onClick={onLogout} className="btn btn-outline-danger w-100 mt-auto border-2 fw-bold">
          <i className="bi bi-box-arrow-left me-2"></i> SAIR
        </button>
      </div> */}

      <main className="flex-grow-1 p-5" style={{ marginLeft: '280px' }}>
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h2 className="fw-black text-white mb-0">OLÁ, <span className="text-warning">{userName.toUpperCase()}</span></h2>
            <p className="text-white-50 small">Gerenciamento de mídias e totens.</p>
          </div>
        </div>

        {/* CARDS INDICADORES */}
        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <div className="card border-0 rounded-4 p-4 shadow-sm" style={{ backgroundColor: '#1e1e1e', borderLeft: '5px solid #ffc107' }}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-white-50 small fw-bold mb-1">MÍDIAS NO TOTAL</p>
                  <h2 className="fw-black text-white mb-0">{totalVideos}</h2>
                </div>
                <i className="bi bi-play-circle-fill text-warning fs-1 opacity-50"></i>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 rounded-4 p-4 shadow-sm" style={{ backgroundColor: '#1e1e1e', borderLeft: '5px solid #198754' }}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-white-50 small fw-bold mb-1">ATIVAS AGORA</p>
                  <h2 className="fw-black text-white mb-0 text-success">{totalAtivos}</h2>
                </div>
                <i className="bi bi-check-circle-fill text-success fs-1 opacity-50"></i>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 rounded-4 p-4 shadow-sm" style={{ backgroundColor: '#1e1e1e', borderLeft: '5px solid #0dcaf0' }}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-white-50 small fw-bold mb-1">DURAÇÃO DO CICLO</p>
                  <h2 className="fw-black text-white mb-0 text-info">{totalTempoMinutos} min</h2>
                </div>
                <div className="clock-container">
                  <div className="clock">
                    <div className="hour-hand"></div>
                    <div className="minute-hand"></div>
                    <div className="second-hand"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LISTA DE VÍDEOS COM PAGINAÇÃO */}
        <div className="p-4 rounded-4 shadow-sm animate__animated animate__fadeInUp" style={{ backgroundColor: '#1e1e1e' }}>
          
         <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="text-white fw-bold mb-0">Playlist do Dispositivo</h5>
            
            <div className="d-flex gap-3">
              
              {/* BOTAO 1: TESTAR KIOSK */}
              <div className="button-wrapper" style={{ position: 'relative' }}>
                <button onClick={handleAbrirKioskLocal} className="btn btn-outline-info btn-sm fw-bold">
                  <i className="bi bi-play-fill me-1"></i> TESTAR KIOSK (LOCAL)
                </button>
                
                {/* O balão agora está SEMPRE no HTML, mas o CSS controla a visibilidade */}
                <div className={`hint-balloon ${showHint1 ? 'tutorial-active' : ''}`} style={{ top: '45px', left: '0' }}>
                  <div style={{fontSize: '10px', color: 'rgba(0,0,0,0.5)', marginBottom: '5px'}}>INFORMAÇÃO</div>
                  🚀 <strong>MODO VISUALIZAÇÃO:</strong><br/> 
                  Clique aqui para abrir o reprodutor sincronizado. Você verá exatamente o que o cliente vê no totem físico!
                </div>
              </div>

              {/* BOTAO 2: NOVO VÍDEO */}
              <div className="button-wrapper" style={{ position: 'relative' }}>
                <button onClick={handleAdicionarVideo} className="btn btn-warning btn-sm fw-bold">
                  <i className="bi bi-plus-lg me-1"></i> NOVO VÍDEO
                </button>
                
                <div className={`hint-balloon balloon-white ${showHint2 ? 'tutorial-active' : ''}`} style={{ top: '45px', right: '0' }}>
                  <div style={{fontSize: '10px', color: '#999', marginBottom: '5px'}}>INFORMAÇÃO</div>
                  ➕ <strong>GERENCIAR MÍDIA:</strong><br/>
                  Adicione novos anúncios ou vídeos institucionais. O sistema processa o arquivo e atualiza a grade automaticamente.
                </div>
              </div>

            </div>
          </div>

          {/* BUSCA INTEGRADA NO CARD DA TABELA */}
          <div className="card border-0 rounded-4 p-3 mb-4 shadow-sm" style={{ backgroundColor: '#252525' }}>
            <div className="d-flex align-items-center">
              <i className="bi bi-search text-warning ms-3 fs-5"></i>
              <input 
                type="text" 
                className="form-control bg-transparent border-0 text-white ms-2 shadow-none" 
                placeholder="Buscar por chave ou nome do arquivo..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5 text-warning">Carregando mídias...</div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle mb-0">
                  <thead>
                    <tr className="text-white-50 small">
                      <th className="ps-4">ID / POS</th>
                      <th>CHAVE</th>
                      <th>FONTE (CAMINHO)</th>
                      <th>TIPO</th>
                      <th>DURAÇÃO</th>
                      <th className="text-center">STATUS</th>
                      <th className="text-end pe-4">AÇÕES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.map((item) => (
                      
                      <tr key={item.id} style={{ borderBottom: '1px solid #2a2a2a' }}>
                        <td className="ps-4 fw-bold text-warning">
                          #{item.id} <small className="text-white-50 ms-2">({item.posicao}º)</small>
                        </td>
                        <td className="fw-bold">{item.chave}</td>
                        <td className="text-white-50 small">{item.fonte}</td>
                        <td><span className="badge bg-dark border border-secondary">{item.tipo}</span></td>
                        <td>{Math.floor(item.duracao / 1000)}s</td>
                        <td className="text-center">
                          <span className={`badge ${item.ativo ? 'bg-success' : 'bg-danger'} px-3`}>
                            {item.ativo ? 'ATIVO' : 'INATIVO'}
                          </span>
                        </td>
                        <td className="text-end pe-4">
                          <button 
                            onClick={() => handleEditarVideo(item)}
                            className="btn btn-sm btn-outline-primary border-2 fw-bold me-2"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button 
                            onClick={() => handleDeletarVideo(item)}
                            className="btn btn-sm btn-outline-danger border-2 fw-bold"
                          >
                            <i className="bi bi-trash3"></i>
                          </button>
                          
                        </td>
                      </tr>
                      
                    ))}
                  </tbody>
                </table>
              </div>

              {/* CONTROLES DE PAGINAÇÃO */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-4 px-3">
                  <span className="text-white-50 small">Página {currentPage} de {totalPages}</span>
                  <div className="btn-group">
                    <button 
                      className="btn btn-outline-warning btn-sm px-3" 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      ANTERIOR
                    </button>
                    <button 
                      className="btn btn-outline-warning btn-sm px-3" 
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      PRÓXIMO
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <style>{`
        .hover-nav:hover {
          background-color: rgba(255, 215, 0, 0.1) !important;
          color: #FFD700 !important;
          transition: 0.3s;
        }
        .swal2-popup { border-radius: 15px !important; border: 1px solid #333 !important; }
        .swal2-input:focus { border-color: #ffc107 !important; box-shadow: none !important; }

        /* Relógio Analógico Animado */
        .clock-container {
          width: 40px;
          height: 40px;
          position: relative;
          opacity: 0.5;
        }
        .clock {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 2px solid #0dcaf0;
          position: relative;
        }
        .clock::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 4px;
          height: 4px;
          background: #0dcaf0;
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }
        .hour-hand, .minute-hand, .second-hand {
          position: absolute;
          background: #0dcaf0;
          border-radius: 2px;
          transform-origin: bottom center;
          left: 50%;
          transform: translateX(-50%);
        }
        .hour-hand {
          width: 3px;
          height: 12px;
          top: 8px;
          animation: rotateHour 720s linear infinite;
        }
        .minute-hand {
          width: 2px;
          height: 15px;
          top: 5px;
          animation: rotateMinute 60s linear infinite;
        }
        .second-hand {
          width: 1px;
          height: 18px;
          top: 2px;
          animation: rotateSecond 60s steps(60) infinite;
        }
        @keyframes rotateHour {
          0% { transform: translateX(-50%) rotate(0deg); }
          100% { transform: translateX(-50%) rotate(360deg); }
        }
        @keyframes rotateMinute {
          0% { transform: translateX(-50%) rotate(0deg); }
          100% { transform: translateX(-50%) rotate(360deg); }
        }
        @keyframes rotateSecond {
          0% { transform: translateX(-50%) rotate(0deg); }
          100% { transform: translateX(-50%) rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;