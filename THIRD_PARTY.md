# Componentes de referência

`src/effects/GlobeStudy.tsx` e `src/effects/NetworkLines.tsx` foram adaptados dos códigos Originkit fornecidos pelo usuário em `amadeitech-referencias-codex/`. Os originais foram preservados para comparação.

Licença consultada em 04/11/2026: [Originkit — Licensing & Usage](https://www.originkit.dev/docs/licensing). Autoriza uso comercial, modificações e incorporação em sites e aplicações; não exige atribuição. Proíbe redistribuição como biblioteca, catálogo, template, tema ou starter kit. Este projeto é o portfólio da AmadeiTech, não uma distribuição de componentes.

Os componentes recebidos importam somente React. O globo usa Canvas 2D e máscara geográfica inline; o Network Lines usa a API WebGL do navegador. Não houve instalação de dependências. A fonte da demonstração foi substituída por Barlow local, cuja licença já está em `public/fonts/`.

Adaptações: dimensões responsivas; cores da marca; escopo visual ao redor do AT; rotação autônoma do globo (sem scroll/mouse/roda nesta versão); pausa global; alternativa reduzida; pausa fora da tela e em aba oculta; limite de 30 renders/s e DPR 1.5; limpeza de recursos. Preservados o algoritmo de pontos/caracteres/máscara e os shaders/conexões por proximidade das referências.

`public/technologies/postgresql.svg`: logo monocromático oficial do PostgreSQL, obtido da [página de logos do projeto](https://wiki.postgresql.org/wiki/Logo), versão azul. Uso identificador da tecnologia nos projetos, sujeito à [política de marcas do PostgreSQL](https://www.postgresql.org/about/policies/trademarks/). Não representa endosso do projeto PostgreSQL.

## Text Reveal Wall e Typo Torus — 04/11/2026

Originais fornecidos em amadeitech-efeitos-originkit/referencias-efeitos. Licença oficial reconferida: permite adaptação comercial neste site. Text Reveal Wall adaptado em src/TextRevealWall.tsx, com Canvas 2D no lugar de GSAP/HTML por quadro, mantendo a lógica visual de células, varredura e stagger. Typo Torus apenas analisado e reservado, sem importação. Decisão e análise em amadeitech-efeitos-originkit/referencias-efeitos/REVIEW.md.

## 3D Stagger Flip e Text Vaporize — 06/11/2026

Originais completos preservados em `amadeitech-efeitos-titulos/referencias-efeitos-titulos/`. [Licença oficial](https://www.originkit.dev/docs/licensing) reconferida nesta data: permite uso e adaptação no portfólio comercial, sem atribuição obrigatória. As restrições de redistribuição como catálogo, componente, template ou starter continuam aplicáveis.

- `src/effects/StaggerFlip.tsx`: adapta a estrutura de duas faces, perspectiva de 800px e transformações `translateZ(±0.5lh)`/`rotateX(±90deg)` do original. O controle `useAnimate` de Framer Motion foi substituído por WAAPI, com amostras da solução da mola original (damping 30, stiffness 300, mass 1), mantendo stagger de 50ms. Entrada por IntersectionObserver e replay por hover de mouse, sem falsa interação em toque. A mesma cor nas faces evita troca abrupta no retorno à posição de repouso.
- `src/effects/TextVaporize.tsx` e `src/effects/vaporizeParticles.ts`: reaproveitam os algoritmos originais de amostragem dos glifos, `updateParticles`, `renderParticles`, `assignStarts`, `assignScatter`, `resetParticles`, `localProgress`, `calculateVaporizeSpread` e curva Bézier. Mantido o ciclo de dissolução/reconstrução/repouso. Adaptados os tipos, medição de duas linhas responsivas, fonte Barlow Condensed local, espaçamento real das letras, densidade, dispersão limitada e reconstrução do mesmo título.
- A política central `motion.ts` e o ciclo `effectLoop.ts` garantem demonstração completa local, preferência nativa em produção, pausa fora da tela/aba oculta e limite de 30 quadros por segundo. Canvas limitado a DPR 1.5 e 30px de margem; sem partículas em outras seções. Os títulos semânticos permanecem acessíveis; o texto HTML assume a apresentação em movimento reduzido ou sem Canvas 2D.

Nenhuma biblioteca, fonte ou binário foi instalado. O original do Flip importa `framer-motion`; o Vaporize importa apenas React. As fontes de demonstração Inter foram substituídas pelas fontes locais já licenciadas.

## Restauração de Network Lines e replay — 06/11/2026

Restauradas as conexões originais por proximidade no hero (`linkDistance=135`), tanto no componente WebGL Originkit quanto na alternativa Canvas já existente. O modelo AT, as cores e os shaders foram preservados. A remoção de linhas isoladas de outras áreas permanece.

As entradas passaram a consumir `src/viewportReplay.ts`: ponto de disparo com margem interna, rearme somente após saída completa do viewport e descarte explícito dos observers. Flip mantém as faces e a mola existentes; Vaporize reinicia pela fase de reconstrução; Text Reveal Wall reinicia sua varredura. Não há remount ou reinício global de globo, partículas, carrosséis ou estado dos painéis. A licença e a origem dos algoritmos acima permanecem as mesmas.
