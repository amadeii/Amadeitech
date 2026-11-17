# AmadeiTech — portfólio V4

React 19, TypeScript, Vite e Three.js. Identidade Dark Tech Premium, com AT extrudido, projetos reais e efeitos adaptados dos componentes Originkit fornecidos pelo usuário.

## Executar localmente

Com as dependências existentes, execute `npm run dev` e abra [o portfólio](http://127.0.0.1:5173/).

O servidor de desenvolvimento abre com **movimento completo por padrão**, inclusive quando o Windows ou Chrome informa `prefers-reduced-motion: reduce`. Não é necessário configurar o DevTools. Não há aviso ou controles visuais de demonstração; os parâmetros abaixo continuam disponíveis exclusivamente para QA local.

| Ambiente / URL | Política |
| --- | --- |
| `npm run dev`, URL normal | Demonstração com movimento completo |
| `?motion=system` | Segue a preferência real do navegador |
| `?motion=reduce` | Força movimento reduzido para teste local |
| `?motion=full` ou `?motion=preview` | Movimento completo local (compatibilidade) |
| `npm run build` + `npm run preview` | Sempre segue o navegador; ignora todos os parâmetros acima |

`matchMedia('(prefers-reduced-motion: reduce)').matches` continua mostrando o valor real do sistema. A política efetiva fica em `document.documentElement.dataset.motion` (`full` ou `reduce`). Nada é salvo em localStorage, cookies ou configurações do navegador.

Para reutilizar em projetos Vite, use `src/motion.ts` como ponto único de decisão: todos os efeitos JavaScript consultam `motionPreference().matches`; o CSS usa `:root[data-motion="reduce"]` para a alternativa acessível e `:root[data-motion="full"]` para efeitos condicionais. Importe o módulo antes da renderização. Em outras stacks, substitua `import.meta.env.DEV` pela constante equivalente eliminada no build. Bibliotecas futuras como GSAP ou Motion também devem consumir essa política, sem consultar a preferência nativa por um segundo caminho. O override exige simultaneamente build de desenvolvimento e host de loopback; nenhuma variável de ambiente pode habilitá-lo no build de produção.

`npm run build` gera `dist/`; `npm run preview -- --port 4174` serve a produção local. `npm run lint` e `npm run typecheck` verificam o código. O wrapper `scripts/toolchain.mjs` usa o Node compatível já disponível no Codex, sem alterar PATH ou instalar runtimes.

## Implementação atual

- AT com profundidade e acabamento metálico, envolvido pelo Network Lines original: partículas azuis com conexões dinâmicas por proximidade. Restaurado `linkDistance=135`; o modelo 3D foi preservado. Linhas isoladas, diagonais decorativas e anéis do contato continuam removidos. Pequeno texto alternado Amadei/Tech acima do hero removido; marca institucional preservada.
- Hero “Criamos o que vem depois.” com Text Vaporize contínuo; Serviços “Ideias em outra dimensão.” com 3D Stagger Flip na entrada e no hover de mouse. Adaptações dos códigos Originkit fornecidos, sem instalar Framer Motion. Fontes Barlow locais, títulos semânticos e versão HTML estática para movimento reduzido/falha de Canvas. Navegação “Sites” mantém a âncora `#projetos` e Sistemas empresariais continua separado.
- Entradas reutilizam `src/viewportReplay.ts`: ponto de disparo com margem interna de 32px e rearme apenas após sair completamente do viewport real. Oscilações em torno do limiar não reiniciam o efeito. Reveals e entradas do hero usam WAAPI; Flip cancela a execução anterior com proteção contra conclusão assíncrona antiga; Vaporize reinicia na reconstrução; Text Reveal Wall reinicia sua varredura. Nenhum remount React é usado; painéis mantêm seu estado. Globo, rede e faixas continuam pausando/retomando conforme a visibilidade, sem reset global.
- Globe Study 2 autônomo: rotação contínua e constante, sem controle por scroll, mouse, arraste ou roda. Mantida a máscara geográfica e renderização Canvas 2D da referência. Composição única “Design que aproxima.” no fluxo normal, sem palco sticky, três capítulos ou indicadores de etapas.
- Projetos editoriais em duas colunas, alternados no desktop, com captura estável ocupando aproximadamente 45% da linha e quadro entre 280–340px. Sem inclinação/parallax, mockups mobile ou botões Desktop/Mobile. Estilos consolidados em `src/projects.css`.
- WandyFitt e 29 Beauté com CP visível por padrão, alternância Site público/Painel de comando, X para voltar ao site e ampliação por diálogo nativo (X ou Escape). WandyFitt usa a captura HTML/CSS local existente. A 29 Beauté usa o frontend administrativo Norium existente, renderizado localmente com fixtures vazias e sessão offline apenas no navegador de captura. Sem dados de clientes, backend ou consultas a produção.
- PostgreSQL e Node.js na apresentação de WandyFitt e 29 Beauté conforme confirmação explícita do usuário. A fonte local do backend Norium também usa PostgreSQL. As evidências históricas das integrações permanecem preservadas.
- Faixas tecnológicas próprias em cada projeto, apenas com logo e nome; sem HTML ou subtítulos descritivos. Logos dos projetos em 36px (+20%). Cada ciclo é mais largo que sua área visível, evitando o mesmo nome duas vezes simultaneamente. Vidro discreto, movimento linear, arraste, toque, teclado, pausa e alternativa reduzida; sem setas laterais.
- TypeScript presente nos quatro projetos por solicitação do usuário, preservando as demais tecnologias. A antiga seção geral “Matéria-prima de novas ideias” foi removida; as faixas individuais continuam ativas.
- “Sistemas empresariais” após os projetos, com acesso “Sistemas” no menu. ORION Empresarial permanece “EM BREVE”, sem acesso público ou chamada de contratação. `public/projects/orion-real.png` é a captura original fornecida pelo usuário, copiada sem modificar a interface. Substitui a ilustração temporária na seção. Texto e quatro destaques descrevem os fluxos locais existentes de compras, consolidação, cotações e recebimento; não anunciam integração externa concluída. Histórico de preços confirmado em `Purchasing.tsx` e conferência/divergências em `App.tsx`/`OrionHelp.tsx` do projeto ORION local, sem acesso a bancos.

Validação da captura real: `node scripts/qa-orion-real.mjs`, com desenvolvimento em 5175 e preview do build em 4178. Edge headless em 1440/1024/768/390/320px; verifica identidade binária da captura, conteúdo, quatro destaques, selo, ausência de acesso público, carregamento das imagens dos quatro projetos, menu mobile, overflow e console. Mede transformações entre quadros, replay após saída completa, opções locais reduce/system e preferência nativa dinâmica no build (que ignora `motion=full`). Evidências em `.impeccable/review/orion-real/`. Não substitui validação funcional do aplicativo ORION nem comprova integração ERP.

Refinamento do enquadramento: a prévia usa recorte CSS dos primeiros 700px da captura original e moldura desktop. No celular, aproxima a região superior esquerda; a ampliação disponibiliza a imagem completa com rolagem horizontal/vertical, sem distorção. O PNG original permanece intacto. O diálogo nativo mantém o foco dentro da ampliação e devolve-o ao acionador ao fechar por X, Escape ou clique no fundo. `node scripts/qa-orion-frame.mjs` verifica esses caminhos, posição de rolagem preservada, proporção original e acesso aos limites inferior/direito. Comparações antes/depois e resultados em `.impeccable/review/orion-frame/`; 1440/1024/768/390/320px. Texto comercial, selo, funcionalidades, componentes externos à seção e seus estilos permanecem preservados.

Os dois efeitos de referência usam `src/effectLoop.ts`: limite de 30 renders/s, suspensão fora da tela, aba oculta e preferência reduzida de produção. Sem botões de pausa, aviso de demonstração ou opção manual de versão leve. O globo sempre tenta animar e oferece poster apenas em falha real de Canvas 2D. Em movimento reduzido de produção, o globo fica estático e a composição continua legível no fluxo.

`src/content.ts` centraliza projetos e contatos. O formulário exige número do WhatsApp com DDD, valida o briefing e abre diretamente `wa.me/5541991543278` com todos os campos na mensagem. O visitante toca em Enviar no WhatsApp para concluir. Um link de reabertura atende bloqueadores de popup; editar dados invalida o link anterior. Não há backend nem confirmação automática de entrega.

## Fontes e evidências

- Originais preservados em `amadeitech-referencias-codex/`; adaptações em `src/effects/`. Uso e licença: [THIRD_PARTY.md](THIRD_PARTY.md).
- Capturas públicas: `scripts/project-evidence.json`; stacks históricas: `scripts/project-stack-evidence.json`; CP WandyFitt: `scripts/panel-evidence.json`; CP 29 Beauté: `scripts/beaute-panel-evidence.json` e script reproduzível `scripts/capture-beaute-panel.mjs`.
- Sites: [29 Beauté](https://29beaute.com.br/), [WandyFitt](https://wandyfitt.com.br/), [Alanna Foto Pet](https://alannafotopet.com.br/) e [Ares Studio Pilates](https://aresstudiopilates.com.br/).
- Logo JPEG original na navegação. O AT tridimensional é uma interpretação visual; arquivo vetorial original permanece pendente.
- Barlow e Barlow Condensed locais, com licenças em `public/fonts/`. Poster V4 capturado do próprio Canvas 2D.

## Verificações

`scripts/qa-viewport-replay.mjs` é a suíte desta rodada, em Chrome real, desenvolvimento em 5173 e build local em 4174. Mede conexões WebGL variando entre quadros, pausa fora de tela, replay das entradas, jitter, retornos rápidos, navegação para cima/baixo, Vaporize, Flip, Wall e preservação do estado dos painéis. Evidências em `.impeccable/review/viewport-replay/`. As expectativas de ausência de conexões na suíte histórica `qa-orion.mjs` pertencem à rodada anterior e foram substituídas pela restauração explicitamente solicitada.

`scripts/qa-title-effects.mjs` testa os efeitos no Chrome em 1440/768/390/320px, com preferência nativa reduce e demonstração local completa. Mede partículas fora dos pixels originais dos glifos (distinguindo dispersão de fade), reconstrução idêntica, rotação 3D e stagger das letras, hover, pausa fora da tela, fallback HTML, movimento reduzido e mudança dinâmica na produção local. Inclui regressão de âncoras, menu, painéis, carrosséis, globo e ORION. Resultados e capturas em `.impeccable/review/title-effects/`; desenvolvimento em 5174 e produção para QA em 4174.

`scripts/qa-orion.mjs` usa desenvolvimento em 5174 e produção local em 4174. Verifica o checklist desta rodada em 1440/768/390/320px, navegação mobile, painéis, presença de TypeScript, ciclos das faixas sem repetição visual, ausência de conexões decorativas, movimento real do AT/partículas/globo, redução local e mudança dinâmica da preferência em produção. Evidências em `.impeccable/review/orion/`. Para revisar esta rodada, `npm run dev -- --port 5174` e [Sistemas empresariais](http://127.0.0.1:5174/#sistemas).

`scripts/qa-contact-whatsapp.mjs` valida os controles removidos, animações automáticas, formulário, telefone inválido, mensagem completa, destino, popup bloqueado e edição posterior em 1440/390/320. Intercepta a navegação `wa.me` antes de qualquer chamada externa: não envia mensagens reais. Resultados/capturas em `.impeccable/review/contact-whatsapp/`.

`scripts/qa-motion-demo.mjs` valida a política atual com os servidores dev em 5173 e produção local em 4174: pixels das órbitas e partículas, ciclo Amadei/Tech, deslocamento das cinco faixas, globo em repouso e scroll isolado, redução explícita, preferência dinâmica, produção sem override e mobile em 320/390px. `scripts/qa-motion-interactions.mjs` valida mouse, hover, quadros de entrada de seção/capítulo e bloqueio dos parâmetros no build. Salvam resultados e quadros em `.impeccable/review/motion-demo/`; relatório em [REPORT.md](.impeccable/review/motion-demo/REPORT.md). Usam Chrome e Playwright já disponíveis, sem baixar navegadores.

`scripts/qa-projects-refine.mjs` cobre projetos em 320, 390, 768, 1440 e 1920px: escala, overflow, X, ampliação/Escape, ausência de mockups mobile, stack, movimento real e repetição visual das tecnologias em seis posições de cada ciclo. Também compara pixels do globo autônomo, ausência de listeners de entrada, invariância a scroll/mouse/roda com tempo pausado e preferência de produção. `scripts/capture-projects-refine.mjs before|after` registra a mesma matriz de resoluções e dimensões. Evidências em `.impeccable/review/projects-refine/`.

Evidências anteriores em `.impeccable/review/v4/` e `.taste-skill/final-v4/`; resultados em `REVIEW.md`. Scripts V1–V4, incluindo `qa-preview-v4`, documentam versões anteriores com globo interativo e não são a suíte vigente para o comportamento autônomo.

O build ainda emite o aviso de chunk acima de 500KB por Three.js no hero. O globo V4 não usa mais Three.js nem textura externa. Nenhuma dependência foi instalada nesta rodada. Não foram realizados push ou deploy. Esta pasta não possui repositório Git.

## Efeitos desta rodada

Text Reveal Wall: src/TextRevealWall.tsx, acima de “Design que aproxima.”, adaptado ao loop e à política de movimento do site. Typo Torus reservado sem importação; originais e análise em amadeitech-efeitos-originkit/referencias-efeitos/REVIEW.md. scripts/qa-visual-refine.mjs mede alturas, pixels do wall, rodapé, responsividade e preferência reduzida/dinâmica. Capturas/resultados em .impeccable/review/visual-refine/.

HeroRenderer e NetworkField oferecem movimento também sem WebGL (SVG e Canvas 2D). scripts/qa-no-webgl.mjs verifica Chrome com WebGL desabilitado, perda/restauração de contexto e produção. O antigo qa-hero-fallback.mjs registra a versão textual anterior e foi substituído por essa suíte.
