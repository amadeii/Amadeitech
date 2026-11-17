# AmadeiTech — revisão cinematográfica

> Atualização posterior: WandyFitt e 29 Beauté receberam composições integradas e movimento próprio; foi adicionada a apresentação de AmadeiDev, e o contato agora usa “Vamos conversar sobre sua ideia?”. A descrição abaixo registra a primeira rodada. O estado atual e suas validações estão em [.taste-skill/refinements/REVIEW.md](.taste-skill/refinements/REVIEW.md).

Implementação local de 16/11/2026. Prévia: http://127.0.0.1:5173/. Build de produção para inspeção: http://127.0.0.1:4173/.

## Direção implementada

A profundidade da assinatura AT passa para a tipografia: linhas, palavras e letras entram como planos, com máscaras que contêm o movimento. O portfólio funciona como uma sequência de quatro composições, com uma conclusão tipográfica ampla no contato. Azul profundo, fontes Barlow locais, conteúdo comercial e capturas existentes permanecem.

Taste ofereceu `contact-sheet`, `name-as-monument` e `uneven-photographs`. Foi escolhida **The name as a monument**, seed **794496356**, preservando paleta e tipografia. A direção foi adaptada ao briefing: o hero aprovado continua com AT, órbitas e Vaporize; a escala monumental aparece nos nomes e no contato. Não se adotou a sugestão de narrativa presa ao scroll, pois a navegação nativa e a liberdade de avançar são requisitos. Não houve novos sorteios nem uso das fotografias atmosféricas da ficha: as imagens são as capturas reais já disponíveis.

Inventário que orientou a composição: assinatura AT extrudida, órbitas azuis, rede de conexões, globo de pontos, texto de partículas, parede tipográfica, quatro sites com identidades próprias, capturas desktop/mobile, dois painéis de gestão e convite a um próximo projeto. A interação central é explorar essas apresentações, alternar site/painel e ampliar interfaces; o índice e os links de próximo projeto conectam os capítulos.

## Seções e movimento

| Trecho | Implementação |
| --- | --- |
| Seu negócio tem um jeito próprio. | Duas máscaras independentes; subida com perspectiva, rotação X e pequeno ajuste de inclinação. |
| Design que aproxima. | Palavras entram por planos suaves junto ao globo e à parede tipográfica preservados. |
| Sites que ganharam forma. | Revelação horizontal por palavras, com inclinação que termina no alinhamento editorial. |
| WandyFitt | Título amplo; letras com deslocamentos e rotações alternadas; imagem abre lateralmente. Captura e texto ocupam proporções diferentes. |
| Ares Studio Pilates | Título em duas linhas; palavras em perspectiva suave; imagem vertical revela um recorte orgânico. Captura mobile aparece em telas menores; no desktop há um estudo mobile sobre a imagem. |
| 29 Beauté | Nome central em escala maior; letras descem por máscaras; imagem abre do centro em um enquadramento panorâmico. Texto e ferramentas ficam abaixo. |
| Alanna Foto Pet | Nome em dois planos, com stagger por letra, profundidade alternada e rotação Y. Imagem entra como uma fotografia, com estudo mobile sobreposto. |
| Sistemas empresariais | Revelação horizontal, sem alterar o conteúdo ou os controles do ORION. |
| O próximo projeto pode ser o seu. | Duas linhas em escala ampla, com perspectiva e mudança de escala; texto e formulário seguem abaixo. |

Entradas usam Web Animations API, a curva existente `cubic-bezier(0.23, 1, 0.32, 1)` e durações entre 1,1 e 1,4 segundo. Stagger de letras: 35 ms; palavras: 65 ms; linhas: 140 ms. As imagens usam transform e clip-path. O parallax é discreto, de até 14 px em cada direção, apenas no desktop; roda em resposta ao scroll e somente para imagens visíveis. Não há biblioteca nova, blur animado ou substituição do scroll.

Setas dos nomes, índice, links de próximo projeto e controles de visita respondem de forma coordenada ao ponteiro. Os efeitos de hover ficam restritos a mouse com ponteiro preciso.

## Preservação e acessibilidade

Globo 3D, AT, órbitas, Network Lines, Vaporize, Flip 3D, Text Reveal Wall e carrosséis foram preservados. As entradas simples dos títulos transformados e a apresentação repetida dos projetos foram substituídas. Os sites públicos aparecem inicialmente; os painéis continuam disponíveis nos seletores e diálogos.

As entradas só rearmam após saída completa do viewport. Pequenos deslocamentos não reiniciam a sequência. Ao sair, trocar a preferência ou ocultar a aba, as animações temporárias são canceladas e o estado final permanece legível. O DOM não depende de uma classe inicial invisível. Títulos e links mantêm nomes acessíveis; não há cópia sobreposta para simular letras. Um `noscript` oferece apresentação básica, links dos quatro projetos e contato caso o JavaScript esteja desativado.

A política central existente em `motion.ts` permanece: desenvolvimento em host local usa movimento completo por padrão, mesmo com o sistema em reduce. Opções explícitas:

- `http://127.0.0.1:5173/?motion=reduce`: movimento reduzido.
- `http://127.0.0.1:5173/?motion=system`: preferência nativa.
- `http://127.0.0.1:5173/?motion=full`: demonstração completa.

O build ignora esses parâmetros e respeita a preferência nativa, inclusive mudanças dinâmicas. Nenhum `matchMedia` ou ajuste persistente do sistema foi modificado.

## Arquivos

- `src/CinematicText.tsx`: entradas tipográficas, máscaras, stagger e ciclo de replay.
- `src/useProjectMotion.ts`: revelações de imagens e parallax limitado ao conteúdo visível.
- `src/cinematic.css`: composições, escalas, responsividade e alternativas reduzidas.
- `src/App.tsx`: aplicação dos efeitos, índice, navegação entre projetos e capturas responsivas.
- `src/main.tsx`: importação dos estilos.
- `index.html`: versão básica sem JavaScript.
- `scripts/qa-cinematic.mjs`: fluxos, replay, medidas de movimento, larguras e preferências.
- `scripts/qa-cinematic-effects.mjs`: regressão dos efeitos preservados e capturas finais no build.
- `scripts/look-cinematic.mjs`: inspeção inicial e comparação visual.

## Validações executadas

Chrome headless instalado, usando Playwright já disponível no runtime. Viewports: **1920, 1440, 768, 390 e 320 px**. As capturas foram abertas e inspecionadas, incluindo entradas e estados finais.

- `lint`, `typecheck` e `build`: aprovados.
- Movimento físico dos novos títulos: transformações diferentes entre quadros nas cinco larguras.
- Replay: retorna após saída completa; não reinicia com pequenos deslocamentos.
- Scroll: entrada inicial, wheel lento, saltos rápidos e retorno às seções.
- Funcionalidade: índice, links internos, links públicos preservados, seletores site/painel, ampliação, fechamento por Escape, menu mobile e carrosséis por teclado.
- Redução de movimento: modos locais explícitos, build com reduce/no-preference, parâmetros de demonstração ignorados no build e mudança dinâmica nos dois sentidos.
- Efeitos preservados: diferenças reais de pixels das órbitas, raster de Network Lines, Vaporize, globo e parede; transformação do Flip 3D e parallax durante scroll. Rede, globo e órbitas ficam estáticos em reduce; retomada dinâmica confirmada.
- Composição final do build: imagens visíveis carregadas e ausência de overflow horizontal nas cinco larguras.
- Sem JavaScript: apresentação básica e cinco links disponíveis.
- Erros de console e exceções nos testes: nenhum.

Evidências: `.taste-skill/cinematic/results.json`, `.taste-skill/cinematic/effects-results.json`, capturas `final-*-{largura}.png` e `*-entry-{largura}.png`.

O inspector Taste no build terminou com **0 FAIL e 5 WARN**, com exceções explícitas para gradientes/sombra já aprovados, status comercial do ORION e contagem de movimento sob preferência nativa reduzida. A verificação separada mediu o movimento completo. Os avisos remanescentes correspondem ao subtítulo do ORION em outra escala, divisor existente de funcionalidades, escala tipográfica ampla, ausência de vídeo e quatro carrosséis laterais preservados. Não se removeu funcionalidade ou identidade para satisfazer uma regra estética da ferramenta. Lint Taste dos três novos arquivos: **0 FAIL e 0 WARN**.

## Autocrítica visual

### ROUND 1

Seen in one second: assinatura espacial preservada; o conteúdo abaixo passa a ter escala de exposição.

Idea (one sentence): a profundidade do AT transforma os nomes dos projetos em matéria tipográfica.

Live thing: exploração dos quatro projetos, com navegação, capturas e painéis.

Layout words by section: hero=espacial / estúdio=planos / sites=índice / WandyFitt=expansão / Ares=equilíbrio / Beauté=panorama / Alanna=fotografia / contato=monumento.

Scores: design 7,5 · usability 7,8 · creativity 7,6 · content 8,0 → overall 7,6 (autoavaliação subjetiva do escopo).

Caps applied: preservação dos efeitos aprovados prevalece sobre proibições estéticas da ficha.

Top three problems:

1. O título de Sites virava três linhas no tablet: composição alterada para liberar toda a largura.
2. A captura desktop do Ares cortava o texto na coluna estreita: alinhamento e fontes responsivas de imagem corrigidos.
3. Textos secundários de 12 px enfraqueciam a leitura mobile: aumentados para 13 px nos trechos inspecionados.

### ROUND 2

Seen in one second: tipografia ampla conduz quatro apresentações diferentes e fecha no convite ao próximo projeto.

Idea (one sentence): a assinatura AT organiza a profundidade; os nomes dos clientes estabelecem o ritmo de cada capítulo.

Live thing: índice de projetos, links de continuidade e interfaces ampliáveis.

Layout words by section: hero=espacial / estúdio=planos / sites=índice / WandyFitt=largura / Ares=vertical / Beauté=simetria / Alanna=impressão / contato=conclusão.

Scores: design 8,1 · usability 8,3 · creativity 8,0 · content 8,0 → overall 8,1 (autoavaliação subjetiva, sem equivalência a premiação ou teste externo).

Caps applied: mesmas exceções de marca e preservação da rodada anterior.

Top three remaining limits:

1. O portfólio usa capturas estáticas de sites, não vídeos dos projetos; os enquadramentos são recortes intencionais, com links para exploração.
2. O chunk da cena 3D continua acima de 500 kB; o Vite emite aviso. A cena permanece em importação dinâmica.
3. Viewports mobile foram simulados no Chrome. Não houve medição em aparelho intermediário físico, Safari/iOS ou auditoria formal com leitor de tela.

Nenhuma dependência foi instalada. Nenhum site de cliente foi alterado. Não houve deploy ou push. O diretório atual não possui `.git`, portanto não foi possível fornecer diff ou status de branch.
