import sharp from "file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.mjs";
import fs from "node:fs/promises";
const dir = ".taste-skill/mobile-pro";
const ids = ["wandyfitt", "ares", "beaute", "alanna"];
const names = [
  "WandyFitt",
  "Ares Studio Pilates",
  "29 Beauté",
  "Alanna Foto Pet",
];
const label = (text, width = 350) =>
  Buffer.from(
    `<svg width="${width}" height="48" xmlns="http://www.w3.org/2000/svg"><text x="20" y="30" fill="#c6d5ee" font-family="Arial" font-size="17">${text}</text></svg>`,
  );
const sheet = await sharp({
  create: { width: 1400, height: 860, channels: 3, background: "#070d19" },
})
  .composite(
    await Promise.all(
      ids.flatMap((id, i) => [
        { input: label(names[i]), top: 0, left: i * 350 },
        sharp(`${dir}/after/${id}-393.png`)
          .resize({
            width: 330,
            height: 790,
            fit: "contain",
            background: "#070d19",
          })
          .toBuffer()
          .then((input) => ({ input, top: 55, left: i * 350 + 10 })),
      ]),
    ),
  )
  .png()
  .toFile(`${dir}/four-showcases.png`);
const comparisons = [];
for (const [i, phase] of ["before", "after"].entries()) {
  comparisons.push({
    input: label(
      i ? "Depois · iPhone refinado" : "Antes · moldura anterior",
      393,
    ),
    top: 0,
    left: i * 393,
  });
  comparisons.push({
    input: await sharp(`${dir}/${phase}/wandyfitt-393.png`)
      .resize({
        width: 393,
        height: 820,
        fit: "contain",
        background: "#070d19",
      })
      .toBuffer(),
    top: 48,
    left: i * 393,
  });
}
await sharp({
  create: { width: 786, height: 880, channels: 3, background: "#070d19" },
})
  .composite(comparisons)
  .png()
  .toFile(`${dir}/before-after.png`);
const checks = JSON.parse(await fs.readFile(`${dir}/motion-checks.json`));
const performance = checks.checks.find((c) => c.performance);
const evidence = JSON.parse(await fs.readFile(`${dir}/sources/evidence.json`));
const before = JSON.parse(await fs.readFile(`${dir}/before/entrances.json`));
const after = JSON.parse(await fs.readFile(`${dir}/after/entrances.json`));
const delayed = before.frames
  .filter((f) => f.visible > 0 && f.animations === 0)
  .slice(0, 10);
const copy = `# AmadeiTech — revisão mobile\n\nImplementação local. Sem commit, push ou deploy.\n\n## Diagnóstico e correções\n\n| Antes | Depois | Motivo |\n| --- | --- | --- |\n| WandyFitt aparecia com opacidade 1 durante ${delayed.length} amostras antes de entrar; quase 100 px já visíveis | Preparação fora do viewport e entrada na primeira interseção, somente no mobile | Elimina a composição final seguida de uma segunda aparição |\n| Gatilho aguardava 12% e margem de 32 px | Observer responsivo preserva integralmente o caminho desktop | Corrige a origem do ciclo, sem ocultar um componente antigo |\n| Resize de altura cancelava WAAPI | Altura isolada não cancela a entrada mobile | Barras do navegador não devem interromper a apresentação |\n| Eventos de visibilidade reiniciavam texto já visível | Texto mobile não reinicia ao retornar à aba | Replay acontece após saída completa |\n| Moldura sem detalhes físicos e ilha sobre o site | Hardware SVG autoral, titânio, botões, lentes, reflexos discretos, barra de status reservada | Melhor hierarquia e fidelidade física sem esconder o cabeçalho real |\n| Capturas de outra proporção | 12 capturas reais a 393 × 804 CSS px, exportadas em 786 × 1608 px | Área útil sem deformação; originais PNG preservados |\n\n## Direção e movimento\n\nEntradas de apresentação (explicação espacial): WAAPI, transform e opacidade, curva cubic-bezier(0.23,1,0.32,1), 900–1200 ms. WandyFitt gira no eixo Y para dentro; Ares se inclina no eixo X; Beauté abre no sentido oposto; Alanna mantém um leve giro editorial. Transições de telas distintas e interruptíveis por CSS continuam preservadas. Não foi adicionada animação contínua ao aparelho. Vaporize, Flip 3D, Text Reveal Wall, globo e ORION mantêm seus códigos e efeitos.\n\n## Validação\n\n- 320, 375, 393 e 430 px: quatro projetos, swipe horizontal, scroll vertical nativo, toque, teclado, centralização e ausência de overflow.\n- Scroll lento, rápido, reverso, oscilações, replay após saída completa, manutenção da tela selecionada, resize de altura e recarregamento em posições reais.\n- Desktop 1440 e 1920 px: geometria idêntica nas oito comparações; sete PNGs idênticos e um com variação máxima de 1/255 em 371 canais de cor (quantização do compositor). O observer e as keyframes desktop aprovadas foram preservados.\n- Desenvolvimento com movimento completo sob preferência nativa reduce; alternativas locais reduce/system; produção com reduce/no-preference, mudança dinâmica e parâmetros de demonstração ignorados.\n- Console sem erros nos testes. Medição com Chrome emulado e CPU 4×: p95 ${performance?.p95FrameMs?.toFixed(1)} ms; não representa benchmark de iPhone físico.\n- Lint, typecheck e build registrados separadamente na entrega. Aviso de bundle HeroScene acima de 500 kB permanece fora deste escopo.\n\n## Parecer\n\n**Interrupção e timing:** defeito de entrada tardia reproduzido e corrigido no mobile. Rearme somente após saída completa.\n\n**Física e coesão:** moldura autoral usa proporções do [iPhone 16 Pro — Apple](https://support.apple.com/pt-br/121031), sem modelo de terceiros, marca Apple ou interface fictícia do cliente.\n\n**Acessibilidade:** movimento reduzido elimina transformações das novas entradas. Navegação por teclado, foco visível, pan-y e pinch-zoom preservados.\n\n**Decisão:** aprovado nos cenários automatizados e na inspeção visual local. Validação em Safari/iPhone físico permanece pendente, pois o ambiente disponível é Chrome no Windows.\n\n## Evidências\n\n- [Quatro vitrines](four-showcases.png)\n- [Antes/depois](before-after.png)\n- [Movimento e ciclo](motion-checks.json)\n- [Layout e gestos](qa/layout-checks.json)\n- [Proveniência das capturas](sources/evidence.json)\n\nTotal dos 12 WebP: ${(evidence.reduce((s, r) => s + r.bytes, 0) / 1024).toFixed(0)} KiB; originais a 2× preservados.\n`;
await fs.writeFile(`${dir}/REVIEW.md`, copy);
const html = `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AmadeiTech · revisão mobile</title><style>body{background:#070d19;color:#dce6f6;font:17px/1.6 system-ui;margin:0}main{max-width:1400px;margin:auto;padding:48px 24px}h1{font-size:clamp(32px,5vw,64px);line-height:1.08;font-weight:500;letter-spacing:-.04em}h2{font-weight:500;margin-top:60px}p{max-width:75ch;color:#abbdd8}a{color:#8db5ff}img{max-width:100%;height:auto;display:block}figure{margin:24px 0}.compare{max-width:786px}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}@media(max-width:800px){.grid{grid-template-columns:repeat(2,1fr)}}</style><main><p>AMADEITECH / REVISÃO LOCAL / 17.11.2026</p><h1>Precisão no aparelho.<br>Continuidade no movimento.</h1><p>Quatro projetos reais dentro de hardware SVG autoral, com entradas mobile corrigidas e desktop preservado. Sem publicação em produção.</p><p><a href="http://127.0.0.1:5173/">Abrir aplicação</a> · <a href="http://127.0.0.1:5173/?motion=reduce">Testar movimento reduzido</a> · <a href="REVIEW.md">Relatório e limites dos testes</a></p><figure><img src="four-showcases.png" alt="Capturas reais das quatro vitrines mobile atualizadas"></figure><h2>Antes e depois</h2><p>A vitrine antiga já mostrava quase 100 px antes de iniciar a entrada. O novo ciclo prepara o elemento fora da tela e anima a primeira aparição, sem reiniciar durante oscilações do scroll.</p><figure class="compare"><img src="before-after.png" alt="WandyFitt antes e depois"></figure><h2>Capturas individuais · 393 px</h2><div class="grid">${ids.map((id, i) => `<figure><figcaption>${names[i]}</figcaption><a href="after/${id}-393.png"><img src="after/${id}-393.png" alt="${names[i]} dentro da nova moldura"></a></figure>`).join("")}</div><h2>Validação</h2><p>320 / 375 / 393 / 430 px: swipe, toque, teclado, centralização, scroll, replay e recarregamento. Desktop 1440 / 1920 px: oito geometrias idênticas; sete PNGs iguais e uma variação máxima de 1/255 na imagem restante. Movimento reduzido testado separadamente em produção.</p><p>Chrome no Windows com emulação e CPU 4×: p95 ${performance?.p95FrameMs?.toFixed(1)} ms. Ainda é necessária uma conferência em Safari/iPhone físico.</p><p><a href="motion-checks.json">Resultados de movimento</a> · <a href="qa/layout-checks.json">Layout e gestos</a> · <a href="sources/evidence.json">Proveniência das 12 capturas</a></p></main></html>`;
await fs.writeFile(`${dir}/review.html`, html);
console.log(
  "Review, comparison and four-showcase sheet generated",
  sheet.width,
  after.frames.length,
);
