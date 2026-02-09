🤖 Smart Kiosk System
O Smart Kiosk é um ecossistema completo de sinalização digital (Media Indoor). O sistema permite a gestão remota de uma playlist de mídias de alta resolução e a exibição sincronizada em totens ou monitores, com integração de dados em tempo real.

🚀 Tecnologias Utilizadas
Front-end (Dashboard): React com TypeScript e Styled Components.

Front-end (Player/Kiosk): JavaScript Vanilla (ES6+), jQuery e CSS3.

Back-end (API): C# .NET 8 com persistência em JSON.

Infraestrutura: Hospedado no Render (API) e Netlify (Front-end).

📋 Funcionalidades Principais
Gestão de Playlist: Upload de vídeos MP4 e integração de IFrames externos.

Dashboard Administrativo: Monitoramento de status das mídias, tempo total de ciclo e saúde do sistema.

Sequenciador Inteligente: Sistema customizado que gerencia o ciclo de vida da mídia (Play/End/Transition) garantindo performance contínua.

Segurança de Interface: Bloqueio de inspeção de código e cópia de dados sensíveis no painel administrativo.

🛠️ Desafio Técnico (Technical Challenge)
Sincronização de um loop contínuo de mídia de alta resolução e iframes externos. O desafio consistiu em criar um sequenciador customizado que gerencia o ciclo de vida da mídia sem vazamentos de memória (memory leaks), integrado a um ecossistema Full Stack que permite a gestão remota da playlist e consumo de dados em tempo real via APIs públicas, utilizando JSON para persistência ágil de dados.

💻 Scripts Disponíveis
No diretório do projeto, você pode rodar:

npm start
Roda o Dashboard em modo de desenvolvimento em http://localhost:3000.

npm run build
Gera a versão de produção otimizada na pasta build. O código é minificado e os nomes de arquivos incluem hashes para cache inteligente.

⚙️ Configuração de Ambiente
Para o funcionamento correto, o front-end deve apontar para a URL da API no Render: BASE_API_URL = "https://smart-kiosk-api.onrender.com"
