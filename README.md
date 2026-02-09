🚀 Smart Kiosk - Gerenciador de Mídia Indoor
Sistema profissional de sinalização digital e gestão financeira familiar. Este repositório contém o Dashboard Administrativo (React/TS) e o Reprodutor de Mídia (JS/jQuery) que compõem o ecossistema Smart Kiosk.

🛠️ Desafio Técnico (Technical Challenge)
Sincronização de um loop contínuo de mídia de alta resolução e iframes externos. O desafio consistiu em criar um sequenciador customizado que gerencia o ciclo de vida da mídia sem vazamentos de memória (memory leaks), integrado a um ecossistema Full Stack (C#/.NET & React) que permite a gestão remota da playlist e consumo de dados em tempo real via APIs públicas, utilizando JSON para persistência ágil de dados.

📦 Tecnologias & Arquitetura
Dashboard: React.js + TypeScript + Bootstrap (Interface administrativa).

Player (Kiosk): JavaScript Vanilla + jQuery (Motor de renderização otimizado).

Back-end: API em C# .NET 8 (Hospedada no Render).

Infraestrutura: Deploy automatizado via Netlify.

Segurança: Implementação de camadas de proteção contra inspeção de código e bloqueio de cópia de dados.

✨ Funcionalidades Principais
Gestão de Playlist: Upload dinâmico de vídeos MP4 e integração de IFrames externos.

Motor de Saúde Financeira: Algoritmo que calcula o status do orçamento e gera alertas estratégicos para identificar onde agir na melhoria da situação financeira.

Dashboard em Tempo Real: Indicadores de mídias ativas, duração total do ciclo de exibição e prévia visual do Kiosk.

Controle de Ciclo de Vida: Gestão automática de transições entre conteúdos pesados e widgets de API (Clima, Finanças, Notícias).

🚀 Como Rodar o Projeto
Clonar o repositório:

Bash
git clone https://github.com/MarcosEdington/controle-gastos-familiar-front.git
Instalar dependências:

Bash
npm install
Executar em modo desenvolvimento:

Bash
npm start
Build para produção:

Bash
npm run build
🔒 Proteção de Código
O Dashboard conta com proteções ativas contra engenharia reversa e cópia de informações sensíveis, incluindo:

Bloqueio de menu de contexto (Botão direito).

Desativação de atalhos de desenvolvedor (F12, Ctrl+Shift+I).

Prevenção de seleção de texto via CSS.
