# Efeitos aprovados — 04/11/2026

Originais TextRevealWall.tsx e TypoTorus.tsx lidos integralmente e preservados nesta pasta. Licença reconferida: https://www.originkit.dev/docs/licensing. Permite uso comercial e adaptação no site; proíbe redistribuição como biblioteca, template, tema ou starter. Nenhuma dependência instalada.

## Text Reveal Wall — implementado

Adaptação em src/TextRevealWall.tsx, dentro de GlobeSection (src/App.tsx), imediatamente acima de “Design que aproxima.”. Quatro linhas com DESIGN, CÓDIGO, CONEXÃO e AMADEITECH; Barlow local, azuis da marca, preenchimento suave, varredura reversa, stagger, revelação, assentamento, pausa e dissolução. Título e CTA estáveis, sem sticky, capítulos ou bloqueio de scroll.

O original usa GSAP e reescreve HTML por quadro. A adaptação conserva células e fases visuais em Canvas 2D, sem adicionar GSAP/Framer. Até 30 fps e DPR 1,5; pausa fora da tela/aba oculta e descarte na desmontagem. Política central: movimento completo local; palavras estáveis no modo reduzido; produção acompanha preferência nativa e mudanças dinâmicas. Canvas decorativo aria-hidden, título HTML semântico.

## Typo Torus — APROVADO PARA USO FUTURO, NÃO IMPLEMENTADO

Referência canônica: TypoTorus.tsx nesta pasta; componente MottoHoops. Dois toros entrelaçados em WebGL2, ray marching GLSL, lettering com textura Canvas 2D de 4096×256, rotação, arraste com inércia, molas e resposta ao toque. Apenas React e APIs do navegador; exige WebGL2.

Reserva visual aprovada pelo usuário, sem importação, rota ou custo no bundle. Sugestão futura: página de experimento de marca ou abertura de case autoral, com área própria. Não competir com AT e globo nesta página.

Antes de integrar: substituir matchMedia direto pela política central, suspender loop fora da tela/aba oculta, definir fallback e recuperação de contexto e medir desempenho mobile. Shader com até 90 passos por pixel; loop original agenda continuamente até 75 fps, DPR máximo 2. Reduce para o relógio automático, mas permite física ao ponteiro: revisar ao integrar. Preset contém controles legados fora de Advanced. Análise estática, sem homologação do efeito em execução nesta rodada, conforme pedido de não implementá-lo.
