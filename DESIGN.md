---
name: AmadeiTech
description: Dark Tech Premium com assinatura AT espacial e projetos reais.
colors:
  bg: "#060a15"
  surface: "#0d162c"
  ink: "#f1f5ff"
  muted: "#aab9d4"
  blue: "#315cff"
  blue-hover: "#477bff"
  focus: "#8fb1ff"
  contact-bg: "#0c1429"
  field-border: "#51607f"
  white: "#ffffff"
typography:
  display:
    fontFamily: '"Barlow Condensed", sans-serif'
    fontSize: "clamp(74px, 8.3vw, 156px)"
    fontWeight: 500
    lineHeight: 0.97
    letterSpacing: "-0.035em"
  headline:
    fontFamily: '"Barlow Condensed", sans-serif'
    fontSize: "clamp(48px, 6.2vw, 94px)"
    fontWeight: 500
    lineHeight: 1.02
    letterSpacing: "-0.025em"
  title:
    fontFamily: '"Barlow Condensed", sans-serif'
    fontSize: "clamp(34px, 4vw, 58px)"
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Barlow, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Barlow, sans-serif"
    fontSize: "16px"
    fontWeight: 500
rounded:
  square: "0"
  button: "3px"
  scene: "6px"
  mobile-screen: "16px"
  pill: "30px"
spacing:
  gutter: "clamp(22px, 4.5vw, 86px)"
  related: "24px"
  section: "140px"
components:
  button-primary:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.white}"
    rounded: "{rounded.button}"
    padding: "17px 24px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.blue-hover}"
  input:
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "13px 0"
  preview-switch:
    backgroundColor: "#080d1b"
    rounded: "{rounded.pill}"
    padding: "4px"
  preview-switch-selected:
    backgroundColor: "#edf3ff"
    textColor: "#080d1b"
---

# Design System: AmadeiTech

## Overview

**Creative North Star: "Assinatura AT espacial"**

A direção Dark Tech Premium combina preto azulado, luz cobalto difusa, órbitas e profundidade. O hero associa mensagem em escala ampla a uma interpretação extrudida do AT; os projetos entram em composições compactas com capturas reais.

O JPEG original permanece na navegação. A geometria do hero é uma aproximação visual para a cena tridimensional, sem status de novo logo oficial. A implementação direta atende ao pedido de começar sem uma rodada extensa de conceitos; não houve aprovação de comp nem concept-seed Impeccable. Taste sorteou `dense-tiles`, seed `1309014507`, adaptado ao briefing sem correspondência literal à ficha.

**Key Characteristics:**

- Cobalto como luz, ação e matéria tridimensional.
- Tipografia condensada, texto curto e projetos em escala ampla.
- Captura principal, texto editorial e painel quando confirmado.
- Globo autônomo em composição única no fluxo normal, com alternativa de movimento reduzido.

## Colors

Os tokens normativos estão no frontmatter e refletem o CSS atual. `bg` é o preto espacial; `surface` oferece marinho de apoio. `ink` e `muted` organizam a leitura. `blue` aciona CTAs e órbitas; `blue-hover` responde ao ponteiro. `focus` delimita teclado com contorno de 3px e afastamento de 6px, reduzido a 3px nos campos. O contato usa `contact-bg` escuro e `field-border` na linha dos inputs.

Gradientes e iluminação foram explicitamente solicitados para profundidade. Cores dos clientes ficam nos enquadramentos dos próprios projetos, sem se tornarem novos acentos da marca.

## Typography

Barlow Condensed para títulos; Barlow para corpo, navegação e controles. Fontes WOFF2 locais com licenças OFL. O display do frontmatter corresponde ao hero desktop; no mobile usa `clamp(58px, 14.5vw, 92px)` e 48px até 360px. Seções e projetos preservam hierarquia própria; o nome amplo no rodapé é assinatura de fechamento.

Corpo varia entre 16px e 20px conforme contexto, com linhas curtas; introdução em 28px. Não extrapolar a escala do rodapé para conteúdo funcional.

## Layout

Gutter fluido. Hero desktop em duas massas com objeto à direita; tablet de 651–900px empilha texto e objeto. Mobile até 650px usa hero de 960px e conteúdo em coluna. Os projetos têm quadro visual estável de 280–340px no desktop; no mobile a captura acompanha a largura sem mockup de telefone.

Projetos em duas colunas, com quadro visual de aproximadamente 45% da linha e intervalo de 40px no desktop / 24px mobile. Linhas pares invertem imagem e texto a partir de 1000px. Faixas tecnológicas compactas em loop contínuo, sem setas. Arraste, toque e teclado permitem exploração manual; hover/foco/gesto pausam a faixa. Sem controle manual de pausa ou aviso de demonstração. Contato em duas colunas passa a uma no mobile.

Globo em composição única ao lado de “Design que aproxima.” no desktop e abaixo do texto no mobile. Sem sticky, capítulos, indicadores de etapas ou controle de conteúdo por scroll. O usuário segue diretamente aos projetos.

## Elevation & Depth

Profundidade combina luz difusa, WebGL e composição das capturas. Frames desktop usam `0 30px 60px #0005`; capturas mobile, `0 24px 45px #0008`. Órbita do contato: `0 15px 70px #1d54db20`. Essas sombras sustentam objetos e luz, sem transformar todo conteúdo em cartões.

Projetos usam entrada discreta por opacidade; capturas ficam estáveis, sem perspectiva ou parallax durante o scroll. Serviços entram lateralmente e recebem faixa luminosa no hover. Globo gira por tempo, sem mouse, arraste ou scroll; AT continua respondendo ao ponteiro. Movimento reduzido remove entradas/parallax, estabiliza a cena e preserva controles manuais.

## Shapes

Botões com 3px, cenas com 6px e telas mobile com 16px; alternância de preview e setas usam formas arredondadas. Campos mantêm cantos retos e linha inferior. Órbitas elípticas pertencem à linguagem espacial. Não aplicar um raio único em todos os elementos.

## Components

### Navigation

JPEG original recortado por CSS com nome textual ao lado. Links desktop recebem sublinhado. Mobile usa menu expansível com Escape e devolução de foco. Preservar skip link e foco visível.

### Buttons and Fields

CTA cobalto com seta, altura mínima de 58px desktop. Hover de ponteiro fino move 3px; active usa escala .97. Campos transparentes sobre contato escuro com labels persistentes e validação nativa. Formulário exige número de WhatsApp com DDD e abre `wa.me/5541991543278` com o pedido completo; o visitante toca em Enviar no WhatsApp para concluir. Editar o briefing invalida o resumo anterior.

### Project Scenes

Capturas reais em frame de navegador, descrição externa e URL pública. Sem mockups mobile. WandyFitt e 29 Beauté mostram o CP por padrão, com alternância Site público/Painel de comando, X funcional e ampliação em diálogo nativo; capturas locais sem dados de clientes. Preservar identidade dos clientes; não acrescentar métricas ou stacks sem evidência.

### Technology Rail

React, TypeScript, Three.js e Vite descrevem o portfólio. Cada projeto tem sua faixa apenas com logo e nome, sem HTML ou subtítulos. Logos dos projetos de36px (+20%). Node.js integra os stacks de Beauté e WandyFitt por confirmação do usuário. Stacks históricos confirmados em código: Beauté usa React/TypeScript/Vite/CSS/PostgreSQL; Alanna usa React/TypeScript/Vite/CSS; WandyFitt apresenta HTML/CSS/JavaScript/PostgreSQL conforme confirmação do usuário; Ares usa HTML/JavaScript/Tailwind CSS/Vite. Cada ciclo mostra cada tecnologia uma vez e é maior que o viewport mais um item; três cópias internas, ocultas da árvore acessível, permitem o loop sem repetir nomes simultaneamente; interrompe fora da tela, em hover, foco, gesto e movimento reduzido de produção.

### Globe

Sem opções de visualização ou versão leve manual. A rotação é autônoma e constante; o canvas sempre é tentado, com poster apenas em falha real de renderização. A mensagem permanece visível no fluxo, sem alternância de capítulos.

## Do's and Don'ts

### Do:

- **Do** preservar a marca original e distinguir a interpretação 3D do logo oficial.
- **Do** manter capturas reais, contraste legível, teclado e movimento reduzido.
- **Do** limitar renders ao necessário e pausar fora de tela/aba oculta.
- **Do** manter o texto legível em todo o intervalo de cada capítulo.

### Don't:

- **Don't** atribuir stacks, resultados, depoimentos ou prazos aos clientes sem confirmação.
- **Don't** condicionar conteúdo ou contato ao funcionamento de WebGL.
- **Don't** reintroduzir controles de pausa, aviso de demonstração ou versão leve manual sem pedido do usuário. Preservar a preferência de movimento reduzido de produção.
- **Don't** usar órbitas e sombras como licença para decorar toda superfície.


## Refinamento V3

AT com extrusão .42, acabamento metálico e três órbitas tridimensionais com arcos e satélites. Movimento limitado a 30 renders/s, pausado fora de tela, com aba oculta, preferência reduzida de produção. O globo fica entre a apresentação do estúdio e os projetos, com rotação autônoma no fluxo normal, sem sticky.

Quatro cenas próprias: Beauté mineral clara; WandyFitt verde com composição dividida; Alanna com enquadramento de fotografia impressa; Ares com composição arquitetônica em dois tons. Faixas de projeto usam símbolos de 110px desktop/82px mobile e nomes de 74px/55px; faixa geral usa símbolos até190px e nomes até112px. Cores locais pertencem aos projetos, sem alterar a paleta global.

## Refinamento V4 — vigente

Globe Study 2 e Network Lines foram adaptados diretamente dos arquivos fornecidos pelo usuário. A máscara de terra, os pontos, os caracteres e seus buckets de profundidade foram preservados no Canvas 2D. O globo usa #749dff; o campo usa #406bc9 e #a1caff, com máscara elíptica atrás do AT. As dimensões fixas de 1200×800 foram removidas. O loop compartilhado limita a 30 renders/s e para fora da tela, em aba oculta, movimento reduzido de produção. Licença registrada em THIRD_PARTY.md.

AT com extrusão .5, metalness .66 e roughness .16. Morph CSS em ciclo de 8s com curva cubic-bezier(.77,0,.175,1), deslocamento de 6px e blur máximo de 8px. É uma assinatura de marca; não muda informações essenciais. A alternativa reduzida mostra Amadei estático e o nome completo permanece na navegação. A prévia local por ?motion=preview exige DEV e localhost, exibe aviso e não persiste estado.

Projetos com imagem principal de cerca de 506px de altura em 1440px, antes de cerca de 792px; em 390px passa de 490px para cerca de 268px. Stack com ícones de 42px/36px, nomes de 23px/21px e funções de 13px. O vidro é reservado às faixas solicitadas: fundo translúcido, brilho de borda estático e blur de 12px sem animação do filtro.

A seção V3 acima é histórica quando conflitar com esta descrição. O sidecar .impeccable/design.json é anterior a esta rodada e não foi regenerado.

