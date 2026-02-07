import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulando um tempo maior para o Skeleton (ideal para o Render acordar)
        const minLoadingTime = new Promise(resolve => setTimeout(resolve, 3500));

        try {
            // Dispara a chamada da API e o timer simultaneamente
            const [res] = await Promise.all([api.get('/Usuarios'), minLoadingTime]);
            
            const usuarios = res.data;
            const usuarioValido = usuarios.find((u: any) => u.email === email && u.senha === senha);

            if (usuarioValido) {
                localStorage.setItem('user_name', usuarioValido.nome);
                localStorage.setItem('auth', 'true');
                navigate('/dashboard');
            } else {
                setLoading(false);
                Swal.fire('Erro', 'Usuário ou senha incorretos', 'error');
            }
        } catch (error) {
            setLoading(false);
            Swal.fire('Erro', 'Falha ao conectar ao servidor. A API pode estar iniciando...', 'warning');
        }
    };

    return (
        <div style={{ 
            height: '100vh', width: '100vw', display: 'flex', 
            alignItems: 'center', justifyContent: 'center',
            backgroundImage: 'url("https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80")',
            backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative'
        }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1 }}></div>

            <div className="animate__animated animate__zoomIn" style={{ 
                width: '900px', minHeight: '550px', display: 'flex',
                borderRadius: '30px', overflow: 'hidden', zIndex: 2,
                boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
                backdropFilter: 'blur(20px)', backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                
                {/* LADO ESQUERDO: FORMULÁRIO OU SKELETON */}
                <div style={{ flex: 1, padding: '50px', position: 'relative', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                    {loading ? (
                        <div className="skeleton-wrapper">
                            <div className="skeleton skeleton-title"></div>
                            <div className="skeleton skeleton-text"></div>
                            <div className="skeleton skeleton-input"></div>
                            <div className="skeleton skeleton-input"></div>
                            <div className="skeleton skeleton-button"></div>
                        </div>
                    ) : (
                        <>
                            <div className="mb-5 text-center">
                                <h2 className="fw-black text-white mb-0" style={{ letterSpacing: '2px' }}>
                                    SMART<span className="text-warning">KIOSK</span>
                                </h2>
                                <p className="text-white-50 small fw-bold mt-2">LOGIN ADMINISTRATIVO</p>
                            </div>

                            <form onSubmit={handleLogin}>
                                <div className="mb-4">
                                    <label className="text-warning small mb-2 fw-bold">E-MAIL</label>
                                    <input type="email" className="form-control custom-input" placeholder="seu@email.com" onChange={e => setEmail(e.target.value)} required />
                                </div>
                                <div className="mb-5">
                                    <label className="text-warning small mb-2 fw-bold">SENHA</label>
                                    <input type="password" className="form-control custom-input" placeholder="••••••••" onChange={e => setSenha(e.target.value)} required />
                                </div>
                                <button type="submit" className="btn btn-warning w-100 py-3 fw-black shadow-lg" style={{ borderRadius: '12px' }}>
                                    ACESSAR PAINEL
                                </button>
                            </form>
                        </>
                    )}
                </div>

                {/* LADO DIREITO: INFORMAÇÕES PREMIUM */}
                <div className="d-none d-md-flex" style={{ 
                    flex: 1.2, padding: '50px', 
                    background: 'linear-gradient(135deg, rgba(255,193,7,0.1), rgba(0,0,0,0.4))',
                    flexDirection: 'column', justifyContent: 'center',
                    borderLeft: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <h3 className="text-white fw-black mb-4">Gestão Inteligente de Mídia Indoor</h3>
                    
                    <div className="d-flex align-items-start mb-4">
                        <i className="bi bi-check-circle-fill text-warning mt-1 me-3 fs-5"></i>
                        <div>
                            <h6 className="text-white fw-bold mb-1">Monitoramento em Tempo Real</h6>
                            <p className="text-white-50 small">Gerencie todos os seus terminais e telas de qualquer lugar do mundo.</p>
                        </div>
                    </div>

                    <div className="d-flex align-items-start mb-4">
                        <i className="bi bi-check-circle-fill text-warning mt-1 me-3 fs-5"></i>
                        <div>
                            <h6 className="text-white fw-bold mb-1">Playlist Dinâmica</h6>
                            <p className="text-white-50 small">Atualize vídeos e conteúdos instantaneamente nos elevadores e totens.</p>
                        </div>
                    </div>

                    <div className="d-flex align-items-start">
                        <i className="bi bi-check-circle-fill text-warning mt-1 me-3 fs-5"></i>
                        <div>
                            <h6 className="text-white fw-bold mb-1">Segurança de Dados</h6>
                            <p className="text-white-50 small">Infraestrutura robusta garantindo 99.9% de uptime para seus anúncios.</p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-input {
                    background-color: rgba(0, 0, 0, 0.3) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    color: white !important;
                    padding: 12px 15px !important;
                    border-radius: 10px !important;
                }
                .custom-input:focus {
                    border-color: #ffc107 !important;
                    box-shadow: 0 0 10px rgba(255, 193, 7, 0.2) !important;
                }
                .fw-black { font-weight: 900; }

                /* SKELETON ANIMATION */
                .skeleton {
                    background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
                    background-size: 200% 100%;
                    animation: loading-skeleton 1.5s infinite;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }
                @keyframes loading-skeleton {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                .skeleton-title { height: 40px; width: 60%; margin: 0 auto 10px; }
                .skeleton-text { height: 15px; width: 40%; margin: 0 auto 40px; }
                .skeleton-input { height: 50px; width: 100%; }
                .skeleton-button { height: 55px; width: 100%; margin-top: 20px; border-radius: 12px; }
            `}</style>
        </div>
    );
};

export default LoginPage;