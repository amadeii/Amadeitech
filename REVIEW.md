# Refinamento V3 — resultado verificado

## Alterações

AT extrudido com três órbitas tridimensionais, arcos luminosos e satélites em movimento contínuo. Limite de30 renders/s e suspensão fora da tela/aba oculta; pausa acessível no hero também interrompe as faixas. Globo movido antes dos projetos, com rotação2.2π pelo progresso sticky e controles discretos. Quatro composições próprias e tecnologias grandes em loop, sem setas laterais, com exploração por arraste/toque/teclado e pausa por hover/foco.

Stacks verificadas nas pastas fornecidas pelo usuário, registradas em scripts/project-stack-evidence.json. Nenhuma inferência de backend/infraestrutura operacional. Nenhuma alteração nas pastas dos clientes.

## Validação

- Build, lint e typecheck aprovados. Permanece aviso do chunk Three.js (~514.56kB minificado/131.01kB gzip).
- QA-v3 aprovado em320/390/768/1440/1920px, sem overflow e com errors:[]: menu/Escape/foco, previews, quatro faixas, teclado, globo/scroll/range/fallback, formulário inválido/válido sem envio e movimento reduzido.
- Pausa/retomada do hero verificadas por pixels. Comparação tolera até4 níveisRGB por canal para não confundir dithering do compositor com movimento; sem mudança da pose enquanto pausado.
- Movimento reduzido do globo: igualdade de captura com scroll e diferença após orientação manual90graus, qa-reduced-v2 reaplicado à produção atual.
- Cenas V3:2.4telas desktop/2.3mobile, todos os capítulos presentes. Amostra headless166frames mediana6.9ms, zero acima de34ms; não comprova desempenho em hardware móvel.
- Capturas e resultados: .impeccable/review/v3/ e .taste-skill/scenes-v3/. Revisão renderizada desktop/tablet/mobile; ajustadas colisões de texto nas composições dos projetos.
- Detector Impeccable da rodada: apenas advisories de tamanhos/cores/raios do design system, ligados às faixas grandes e cores contextuais dos clientes; sem achados funcionais. Não equivale a aprovação estética automática.

O ambiente Windows declara movimento reduzido; a versão acessível é preservada. Testes de movimento normal usam no-preference explicitamente sem alterar o sistema. Sem publicação, push ou instalação. Dispositivos físicos e Safari não testados. Nenhum novo veredito de subagente foi realizado nesta rodada de refinamento; a revisão independente abaixo pertence à V2.

---

## Histórico da V2

# Revisão da reformulação — v2 (histórico)

## Implementação

Dark Tech Premium com AT extrudido em Three.js, cobalto difuso, órbitas, projetos reais em cenas grandes com frames desktop e capturas mobile, carrossel manual da stack deste site, globo sticky narrativo, serviços interativos e contato escuro. JPEG original preservado na navegação; o AT 3D é aproximação visual para a cena, sem status de novo logo oficial.

React 19, TypeScript, Vite e Three.js preservados, sem nova dependência. Formulário mantém validação e preparação do WhatsApp, sem backend ou envio de mensagem. Sem repositório Git disponível, push ou deploy.

## Decisões e exceções

- Implementação direta autorizada pelo pedido de começar sem planejamento extenso; sem rodada de conceitos ou aprovação formal de comp.
- Taste sorteou `dense-tiles`, seed `1309014507`. Board denso e nameband não foram seguidos literalmente porque contrariavam o pedido de AT espacial e cenas amplas. Work strips e marquee inspiraram adaptações no carrossel manual. Não se declara correspondência à ficha.
- Allowances de gradient, shadow, hairline, outlined-box e icon-cards sustentam iluminação solicitada, frames, controles e símbolos da stack; não são autorização genérica para futuras telas.
- React, TypeScript, Three.js e Vite pertencem a este site, comprovados pelo package. Stacks dos quatro clientes seguem pendentes.

## Verificações finais

Resultados da última execução, após correção dos capítulos:

- `npm run lint`, `npm run typecheck` e `npm run build`: aprovados. Build mantém aviso de tamanho do chunk Three.js.
- `scripts/qa-v2.mjs`: aprovado em 320, 390, 768, 1440 e 1920px, com `errors: []` em `.impeccable/review/v2/qa-results.json`.
- Fluxos cobertos: hero por ponteiro, ausência de overflow, menu/Escape/foco, preview Desktop/Mobile, carrossel, globo por scroll/teclado/fallback, formulário obrigatório/inválido/válido e link/reset do resumo, mudança dinâmica de movimento reduzido com restauração de interatividade.
- Cenas: `scripts/taste-motion-check.mjs scenes http://127.0.0.1:4174 --scene '#experiencia' --steps 5 --out .taste-skill/scenes-v2`, executado com Node 24; recaptura final sem problemas detectados, evidências em `.taste-skill/scenes-v2/`.
- Taste final: 0 FAIL / 3 WARN em `.taste-skill/after/`. Avisos: quantidade de tamanhos tipográficos, ausência de footage e rolagem lateral localizada no carrossel. Carrossel é manual e o movimento principal é WebGL; não foi adicionado vídeo decorativo.
- `scripts/qa-reduced-v2.mjs`: aprovado; hash do canvas idêntico antes/depois do scroll em movimento reduzido e diferente após rotação manual de 90 graus.
- Revisor independente: P2 dos textos do globo resolvido; disposition `ship` no escopo dessa correção. Capturas em 0/20/40/60/80/100% desktop/mobile mostram a narrativa legível. Esse veredito não implica auditoria estética irrestrita.

O wrapper `scripts/taste-motion-check.mjs` especifica `no-preference` para a inspeção normal, pois o host Windows declarou movimento reduzido. Não modifica a skill original nem suprime testes reduzidos. Autoavaliação visual interna em `.taste-skill/critique-v2.md`: 7,9; não é nota externa.

## Revisão de movimento

| Antes | Depois | Motivo |
| --- | --- | --- |
| Opacidade dos capítulos caía nos intervalos do scroll | `Math.round(p * 2)` mantém um capítulo ativo com opacidade 1; demais ocultos e inert | Leitura contínua durante toda a narrativa |
| Troca dependia do fade por progresso | Entrada breve de 500ms com máscara e opacidade inicial .72 | Preservar transição sem apagar o texto |
| Cena sticky no fluxo normal | Movimento reduzido mostra todos os capítulos em fluxo e câmera estável | Conteúdo e controles acessíveis sem trajetória de scroll |

CSS/WAAPI para entradas; máscara/escala nos projetos, parallax por scroll e reveal lateral nos serviços. Hover restrito a ponteiro fino. Cenas Three.js sob demanda, pausadas fora da tela/aba oculta, com descarte de recursos. Nenhum estado React atualizado por frame. DPR: hero 1.5; globo 1.25 mobile / 1.75 desktop.

## Custo e limites

Three.js compartilhado: aproximadamente 514.55KB minificado / 131KB gzip, com aviso Vite. O hero precisa desse chunk na entrada; apenas o componente do globo permanece tardio. Amostra headless de 191 frames: mediana 6,9ms e zero acima de 34ms. É observação do ambiente de teste, sem promessa de 60fps ou desempenho em telefone físico.

Chrome emulado não substitui aparelhos físicos ou Safari. WhatsApp validado por URL, sem envio de mensagens. Original vetorial/transparente da marca e stacks individuais seguem pendentes. Nenhuma equipe, métrica, depoimento ou prazo inventado.

## Histórico separado — primeira versão

`.impeccable/review/qa-results.json`, `motion-results.json`, `independent-review.md`, capturas fora de `v2` e `.taste-skill/final/` pertencem à versão anterior. Sua composição era `name-as-monument`, seed `1259202569`, contato claro e Three.js solicitado apenas perto do globo. Os testes e o antigo veredito “ship” não aprovam a reformulação v2; a evidência atual é a descrita acima.

Audit histórico: zero vulnerabilidades de produção e 12 alertas moderados na cadeia de desenvolvimento ESLint/minimatch. Não aplicada correção forçada; não se apresenta esse resultado como nova auditoria.


## V4 — 04/11/2026

Esta rodada aplica o briefing atual; as avaliações V1–V3 acima são históricas.

Implementação: efeitos adaptados diretamente de GlobeStudy2.tsx e NetworkLines.tsx fornecidos pelo usuário, com originais preservados. Máscara geográfica e renderização de pontos/caracteres mantidas; rotação por scroll e manual integradas. O Network Lines mantém os shaders e a conexão por proximidade, com máscara ao redor do AT. Monograma com extrusão .5 e material refinado; morph de marca entre Amadei e Tech. Nenhuma dependência instalada.

Projetos sem apresentação mobile, em composições compactas e alternadas. Descrições enriquecidas a partir das evidências disponíveis. Somente WandyFitt tem painel comprovado nas fontes consultadas. Captura HTML/CSS local de pedidos, sem scripts de autenticação, sem backend ou dados de clientes, com alternância e ampliação. Presença de telas e integração não comprova operação em produção.

Stacks por projeto mantidas conforme scripts/project-stack-evidence.json; apresentação com vidro discreto, nome e função de cada tecnologia, teclado, toque e arraste, sem setas. A imagem principal do primeiro projeto passa de aproximadamente 792px para 506px em 1440px; em 390px, de 490px para 268px. O espaço total de apresentação também diminui porque a descrição fica ao lado e a faixa tem ícones de 42px, antes de 110px.

### Verificações de movimento e desempenho

`scripts/qa-preview-v4.mjs`: preferência do navegador continua reduzida durante a prévia local; produção ignora o parâmetro; retorno à URL normal restaura a alternativa acessível. Globo e Network Lines medidos em 32 renders por 1,1s; rede sem renders quando fora de tela. Pausa e retomada; rotação manual em movimento reduzido; rotação por scroll testada com deriva e ASCII pausados, comparando o bitmap do canvas; toque com pan-y; poster em falha de Canvas 2D. Sem erros de página. Resultado em `.impeccable/review/v4/motion-results.json`.

O teste antigo por screenshots podia confundir deriva com rotação por scroll; o novo teste isola a causa e lê diretamente o canvas, sem controles HTML sobrepostos. A ligação com scroll foi corrigida durante esta revisão.

### Review Animations

| Antes | Depois | Motivo |
| --- | --- | --- |
| Loop das referências sempre ativo | effectLoop compartilhado, 30 renders/s, visibilidade e pausa | Evitar trabalho fora da tela e manter controle sobre movimento contínuo |
| Dimensões mínimas de 1200×800 | Componente dimensionado pelo layout | Preservar composição em telefone e tablet |
| Roda e touch-action none no globo | Zoom por roda desabilitado; pan-y | Preservar a rolagem da página no mouse e no toque |
| Sem alternativa reduzida nas referências | Canvas estático, capítulos no fluxo e rotação por range | Preservar conteúdo e controle manual |
| Entradas de serviço em 600ms e projetos em 850ms | 250ms e 500ms | Feedback mais rápido; entrada editorial usa orçamento de marketing |
| Liberação de recursos WebGL incompleta no Network Lines | Descarte de buffers, shaders e programas | Evitar retenção na remontagem, inclusive StrictMode |

Decisão da revisão de código e da sessão Chrome: aprovar os movimentos alterados. Efeitos contínuos cumprem função de assinatura/exposição de marca; morph usa CSS, curva forte ease-in-out, blur máximo de 8px e pausa. Controles de painel mudam instantaneamente e hover de deslocamento fica restrito a ponteiro fino. Não há estado React por frame. O custo visual do vidro é estático. Medições locais não comprovam desempenho em aparelhos físicos, Safari ou outros drivers.

### Inspeção visual

Taste executado antes e depois, com inspeção manual dos mosaicos e capturas desktop/mobile/tablet. Foram corrigidos rótulos acima dos títulos, funções tecnológicas menores que 13px e posicionamento dos controles do globo no tablet. Exceções intencionais: gradientes e sombras da direção premium, contornos e vidro nas faixas solicitadas, carrosséis horizontais e sobreposição entre as duas palavras do morph. O aviso de tipografia mista vem dos nomes tecnológicos e suas legendas; o suposto vazio na faixa geral vem do conteúdo duplicado para o loop horizontal. Não se trata de espaço vazio vertical na página.

O detector Impeccable foi executado uma vez e apresentou avisos de alinhamento ao DESIGN.md/sidecar (cores, tamanhos e raios). O sidecar `.impeccable/design.json` é anterior a esta rodada; não foi regenerado nem foram ativados hooks. DESIGN.md foi atualizado para registrar a implementação vigente.

### Limites e pendências factuais

Build com aviso de chunk acima de 500KB por Three.js no hero. O globo agora usa Canvas 2D e não depende de Three.js ou textura remota. Não há validação em dispositivo físico/Safari. Não houve login, consultas ou alterações em produção; WhatsApp validado somente pelo link. Outros painéis precisam de evidência para serem apresentados; o vetor oficial do AT continua pendente. Direitos de uso dos componentes conferidos na documentação oficial e registrados em THIRD_PARTY.md. Sem push ou deploy; pasta sem repositório Git.

Resultado final de regressão: `qa-v4.mjs` passou em 320, 390, 768, 1440 e 1920px, sem overflow ou erros de console/página. Menu/Escape/foco, alternância de painel, carrossel/teclado, capítulos do globo, fallback, formulário e movimento reduzido dinâmico aprovados. `lint`, `typecheck` e `build` executados com sucesso. O build mantém o aviso de tamanho de Three.js descrito acima. Inspeção Taste final de tablet: 0 falhas e 6 avisos de composição intencional. No mobile estreito, a legenda decorativa do objeto foi removida para evitar colisão com o texto inferior do hero.

## Correção de homologação com movimento completo — 04/11/2026

Esta atualização substitui a exigência anterior de abrir `?motion=preview`: o servidor local de desenvolvimento agora demonstra movimento completo na URL normal, mesmo com o navegador em `reduce`. CSS e JavaScript usam a política central de `src/motion.ts`; `?motion=system` e `?motion=reduce` permitem validar acessibilidade. Produção ignora os parâmetros e acompanha a preferência nativa, inclusive mudanças dinâmicas.

`qa-motion-demo.mjs` e `qa-motion-interactions.mjs` passaram: movimento entre pixels de órbitas/partículas/globo, morph, cinco carrosséis, ponteiro, hover, entradas e capítulos; redução explícita; produção completa/reduzida/dinâmica; mobile 320/390 sem overflow e zero erros de console/página. Lint, typecheck e build aprovados. Mantido o aviso existente do chunk Three.js acima de 500KB.

Evidências, quadros antes/depois e resultados completos: [.impeccable/review/motion-demo/REPORT.md](.impeccable/review/motion-demo/REPORT.md). Diretriz global consolidada com backup; estratégia reutilizável no README. Identidade, conteúdo e seções preservados. Sem dependências novas, push ou deploy. Mobile emulado, sem validação em aparelho físico/Safari.
## Projetos compactos e globo autônomo — 04/11/2026

Nova composição dos quatro projetos, com coluna visual ~45%, imagens estáveis, tecnologias ao lado e CPs reais de 29 Beauté/WandyFitt visíveis por padrão. X funcional, alternância site/painel e ampliação com X/Escape. PostgreSQL nas duas apresentações conforme pedido. Ciclos das faixas dimensionados para não mostrar nomes repetidos simultaneamente. O globo agora gira por tempo, sem controle por mouse, roda, arraste ou scroll. Hero e demais seções preservados.

Seção em1440: 3122→2148px (−31,2%); em1920: 3828→2189px (−42,8%). Capturas antes/depois na mesma matriz de resoluções. Testes de navegador em320/390/768/1440/1920 aprovados, incluindo movimento real dos carrosséis, seis fases de cada ciclo, X/ampliação/Escape, invariância do globo a entradas e preferência reduzida em produção. Zero erros de console/página monitorados. Lint/typecheck/build aprovados, com aviso existente de chunk Three.js. Detector Impeccable sem achados de layout e revisão independente sem bloqueadores.

CP29 capturado do frontend Norium real, com catálogo vazio e sessão offline exclusivamente no navegador de captura; sem backend, autenticação real ou dados de clientes. Não comprova operação de serviços em produção. Nenhuma dependência nova, push ou deploy. Relatório, limitações e evidências: [.impeccable/review/projects-refine/REPORT.md](.impeccable/review/projects-refine/REPORT.md).
## Fluxo contínuo e stacks simplificadas — 04/11/2026

Removidos sticky, etapas e mensagens alternadas do globo; “Design que aproxima.” segue o fluxo normal até os projetos. HTML e subtítulos removidos de todos os carrosséis; logos dos projetos de30→36px; Node.js em WandyFitt/29Beauté. Preservados CPs, X/ampliação/Escape, carrosséis em movimento, prévias compactas, globo autônomo e identidade.

QA atualizada aprovada em320/390/768/1440/1920, sem overflow ou erros de console/página; verificados fluxo sem retenção, stack/ícones, nomes únicos, movimento e produção reduzida. Lint/typecheck/build aprovados (aviso Three.js existente), detector sem achados e revisão independente sem bloqueadores. Sem push/deploy. Relatório: [.impeccable/review/flow-refine/REPORT.md](.impeccable/review/flow-refine/REPORT.md).
## Controles removidos e formulário WhatsApp — 04/11/2026

Removidos pausa manual, aviso de demonstração e opções/versão leve. Animações locais automáticas; globo tenta o canvas sem heurísticas de memória/economia de dados, com fallback em falha real. Preferência reduzida de produção preservada. Campo Número do WhatsApp substitui escolha de retorno/e-mail. Botão Enviar pelo WhatsApp abre diretamente a mensagem completa para5541991543278; visitante confirma o envio no aplicativo. Link de reabertura disponível se popup for bloqueado.

QA de navegador em1440/390/320 aprovada: movimento real, controles ausentes, formulário inválido, mensagem/destino, popup, fallback e edição posterior. WhatsApp interceptado localmente; nenhuma mensagem real enviada ou entrega comprovada. Zero erros monitorados. Lint/typecheck/build aprovados, mantendo aviso Three.js existente. Sem push/deploy. Evidências: [.impeccable/review/contact-whatsapp/REPORT.md](.impeccable/review/contact-whatsapp/REPORT.md).
## Correção de AT duplicado — 04/11/2026

O fallback textual era ativado ao perder o contexto WebGL sem ocultar o canvas, permanecendo sobre o modelo após restauração. Agora canvas e fallback são exclusivos; perda cancela o loop, restauração retoma a renderização e remove o fallback após o primeiro quadro bem-sucedido. Nova inicialização também limpa estado antigo de fallback.

`qa-hero-fallback.mjs` passou em1440/390: dois ciclos reais de WEBGL_lose_context por viewport, sem sobreposição, movimento retomado (3,79%/4,86% dos pixels mudaram) e alternativa isolada quando WebGL2 é indisponível. Zero erros de página monitorados. Lint e build aprovados (aviso Three.js existente). Resultados/capturas em `.impeccable/review/hero-fallback/`. Sem push/deploy.
## Refinamento visual e reserva de efeitos — 04/11/2026

Prévias dos projetos +20% de altura em todos os breakpoints (desktop 336–408px, tablet 336px, mobile 298–396px), preservando largura, CPs e alternância site/painel. Removido o wordmark gigante do rodapé, seus estilos e seletor de reveal; links e informações preservados com separador discreto.

Text Reveal Wall aplicado imediatamente acima de “Design que aproxima.”, em quatro linhas azuis com Barlow local e varredura reversa. Título/CTA permanecem estáveis; fluxo normal e globo autônomo preservados. Referência enviada e original oficial lidos; implementação adaptada em Canvas 2D sem GSAP adicional. Typo Torus aprovado como referência futura, sem implementação/importação; análise em amadeitech-efeitos-originkit/referencias-efeitos/REVIEW.md.

## Hero animado sem WebGL — atualização da correção anterior

Substitui a alternativa textual estática relatada anteriormente: HeroRenderer seleciona WebGL ou SVG animado com a mesma cena Three.js; perda de contexto muda para SVG e restauração retorna ao GPU sem sobreposição. NetworkField usa Canvas 2D animado se WebGL falhar. Teste real com Chrome --disable-webgl e WEBGL_lose_context em 1440/390, movimento de geometria e partículas entre quadros, recuperação e produção reduce/no-preference: scripts/qa-no-webgl.mjs, resultados em .impeccable/review/no-webgl/results.json. A sessão pessoal do Chrome não pôde ser controlada devido a erro do conector; validação realizada em instâncias locais de Chrome. Nenhuma configuração do navegador alterada.

Validação desta rodada: lint/typecheck/build e scripts qa-visual-refine.mjs / qa-projects-refine.mjs aprovados. Inspeção de desktop/mobile realizada. Relatório: .impeccable/review/visual-refine/REPORT.md. Mantido aviso de chunk Three.js com 532KB; sem dependências, push ou deploy.
