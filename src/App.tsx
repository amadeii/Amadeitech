import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { FormEvent, CSSProperties } from "react";
import { projects, studio, founder } from "./content";
import type { Project } from "./content";
import { motionPreference } from "./motion";
import TextRevealWall from "./TextRevealWall";
import StaggerFlip from "./effects/StaggerFlip";
import TextVaporize from "./effects/TextVaporize";
import { observeViewportReplay } from "./viewportReplay";
import CinematicText from "./CinematicText";
import type { TextDirection } from "./CinematicText";
import ProjectShowcase from "./ProjectShowcase";
import FounderPortrait from "./FounderPortrait";
import OrionOrbit from "./OrionOrbit";
const HeroScene = lazy(() => import("./HeroScene"));
const NetworkLines = lazy(() => import("./NetworkField"));
const Globe = lazy(() => import("./Globe"));

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d={diagonal ? "M5 19 19 5M5 5h14v14" : "M4 12h16m-7-7 7 7-7 7"}
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
function useMotion() {
  useEffect(() => {
    const reduced = motionPreference();
    const animations = new Map<Element, Animation>();
    const finish = () => {
      if (reduced.matches)
        animations.forEach((animation) => animation.cancel());
    };
    reduced.addEventListener("change", finish);
    const observers = Array.from(
      document.querySelectorAll<HTMLElement>(
        "[data-reveal=service], [data-reveal=system], [data-reveal=founder], .intro-section > div, .section-heading > p, .contact-intro > p, .brief-form, .hero-content > p, .hero-actions, .hero-art",
      ),
    ).map((element) =>
      observeViewportReplay(element, {
        onEnter() {
          if (!reduced.matches && !document.hidden) {
            const kind = element.dataset.reveal;
            const heroCopy = element.matches(
              ".hero-content > p, .hero-actions",
            );
            const heroArt = element.matches(".hero-art");
            const frames = heroArt
              ? [
                  { transform: "translateY(30px) scale(0.94)", opacity: 0.2 },
                  { transform: "translateY(0) scale(1)", opacity: 1 },
                ]
              : heroCopy
                ? [
                    { transform: "translateY(38px)", opacity: 0.15 },
                    { transform: "translateY(0)", opacity: 1 },
                  ]
                : kind === "service"
                  ? [
                      { transform: "translateX(24px)", opacity: 0.45 },
                      { transform: "translateX(0)", opacity: 1 },
                    ]
                  : [
                      { transform: "translateY(24px)", opacity: 0.45 },
                      { transform: "translateY(0)", opacity: 1 },
                    ];
            animations.get(element)?.cancel();
            const animation = element.animate(frames, {
              duration: heroArt
                ? 1500
                : heroCopy
                  ? 1100
                  : kind === "service"
                    ? 250
                    : 500,
              delay:
                kind === "founder"
                  ? 140 +
                    Array.from(
                      document.querySelectorAll(
                        ".founder-copy [data-reveal=founder]",
                      ),
                    ).indexOf(element) *
                      70
                  : heroCopy
                    ? element.matches(".hero-actions")
                      ? 240
                      : 160
                    : 0,
              easing: "cubic-bezier(0.23, 1, 0.32, 1)",
              fill: "backwards",
            });
            animations.set(element, animation);
            void animation.finished.then(
              () => {
                if (animations.get(element) === animation)
                  animations.delete(element);
              },
              () => {},
            );
          }
        },
        onExit() {
          animations.get(element)?.cancel();
          animations.delete(element);
        },
      }),
    );
    return () => {
      observers.forEach((observer) => observer.dispose());
      reduced.removeEventListener("change", finish);
      animations.forEach((animation) => animation.cancel());
    };
  }, []);
}
function ProjectFeature({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const direction: TextDirection[] = [
    "energy",
    "balance",
    "luxury",
    "photograph",
  ];
  const titleLines = [
    ["WandyFitt"],
    ["Ares Studio", "Pilates"],
    ["29 Beauté"],
    ["Alanna", "Foto Pet"],
  ];
  return (
    <article
      id={`project-${project.id}`}
      className={`project showcase-story story-${project.id}`}
      data-project={project.id}
      style={{ "--project-color": project.color } as CSSProperties}
    >
      <div className="story-title">
        <h3 aria-label={project.name}>
          <CinematicText
            lines={titleLines[index]}
            direction={direction[index]}
          />
        </h3>
        <p className="story-category">{project.category}</p>
      </div>
      <ProjectShowcase project={project} />
      <div className="story-copy">
        <p>{project.description}</p>
        <a
          className="text-link project-link"
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Visitar site <Arrow diagonal />
        </a>
        <TechnologyMarquee
          items={project.technologies}
          label={`Tecnologias de ${project.name}; arraste ou use as teclas de seta`}
          variant={project.id}
        />
        {index < projects.length - 1 && (
          <a
            className="project-next"
            href={`#project-${projects[index + 1].id}`}
          >
            Próximo: {projects[index + 1].name} <Arrow />
          </a>
        )}
      </div>
    </article>
  );
}

function GlobeSection() {
  const ref = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: "450px" },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <section
      className="globe-flow"
      id="experiencia"
      ref={ref}
      aria-labelledby="globe-flow-heading"
    >
      <div className="globe-flow-copy">
        <TextRevealWall />
        <h2 id="globe-flow-heading">
          <CinematicText lines={["Design que aproxima."]} direction="balance" />
        </h2>
        <p>
          Design e desenvolvimento juntos para dar forma ao que o seu negócio
          precisa.
        </p>
        <a className="text-link" href="#contato">
          Vamos criar o seu projeto <Arrow diagonal />
        </a>
      </div>
      <div className="globe-flow-art">
        {ready ? (
          <Suspense
            fallback={
              <div className="globe-placeholder" role="status">
                Preparando globo…
              </div>
            }
          >
            <Globe />
          </Suspense>
        ) : (
          <div className="globe-placeholder" aria-hidden="true" />
        )}
      </div>
    </section>
  );
}
const services = [
  {
    name: "Sites & experiências",
    text: "Para apresentar o seu negócio com clareza e personalidade.",
    detail: "Sites institucionais, landing pages e portfólios.",
  },
  {
    name: "Lojas & vendas",
    text: "Para transformar interesse em uma jornada de compra simples.",
    detail: "E-commerce, catálogos e experiências de pedidos online.",
  },
  {
    name: "Sistemas sob medida",
    text: "Para organizar processos que as ferramentas prontas não resolvem.",
    detail: "Sistemas web, painéis administrativos e soluções personalizadas.",
  },
];
function FounderSection() {
  return (
    <section
      className="founder-section"
      id="quem-cria"
      aria-labelledby="founder-heading"
    >
      <FounderPortrait />
      <div className="founder-copy">
        <h2 id="founder-heading">
          <CinematicText
            lines={["Por trás da", "AmadeiTech"]}
            direction="balance"
          />
        </h2>
        <div>
          <h3 data-reveal="founder">{founder.name || founder.signature}</h3>
          <p data-reveal="founder">
            Sou desenvolvedor e trabalho com sites, sistemas empresariais,
            backend e integrações. Na AmadeiTech, conecto essas frentes para
            criar soluções digitais sob medida.
          </p>
          <p data-reveal="founder">
            Da interface às regras de negócio e à comunicação entre sistemas,
            cada parte precisa fazer sentido para quem usa.
          </p>
          <ul
            className="founder-specialties"
            aria-label="Áreas de atuação"
            data-reveal="founder"
          >
            <li>Sites & experiências</li>
            <li>Sistemas empresariais</li>
            <li>Backend & APIs</li>
            <li>Integrações</li>
          </ul>
          {founder.github && (
            <a
              className="text-link founder-github"
              data-reveal="founder"
              href={founder.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              Conheça meu GitHub <Arrow diagonal />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
function Contact() {
  const [status, setStatus] = useState("");
  const [link, setLink] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const need = String(data.get("need") ?? "").trim();
    const contact = String(data.get("contact") ?? "").trim();
    const phoneDigits = contact.replace(/\D/g, "");
    if (
      !/^\+?[\d\s().-]+$/.test(contact) ||
      phoneDigits.length < 10 ||
      phoneDigits.length > 15
    ) {
      setStatus("Informe um número de WhatsApp válido, com DDD.");
      form.querySelector<HTMLInputElement>('[name="contact"]')?.focus();
      return;
    }
    if (name.length < 2 || need.length < 10) {
      setStatus(
        "Preencha seu nome e descreva o projeto com pelo menos 10 caracteres.",
      );
      return;
    }
    const message = `Olá, AmadeiTech! Quero conversar sobre um projeto.\n\nNome: ${name}\nNegócio: ${String(data.get("company") ?? "").trim() || "Não informado"}\nProjeto: ${data.get("type")}\nNecessidade: ${need}\nWhatsApp: ${contact}`;
    const url = `https://wa.me/${studio.whatsapp}?text=${encodeURIComponent(message)}`;
    setLink(url);
    setStatus(
      "Confira seu pedido no WhatsApp e toque em Enviar. Se não abriu, use o link abaixo.",
    );
    window.open(url, "_blank", "noopener,noreferrer");
  }
  return (
    <section
      className="contact-section contact-refined"
      id="contato"
      aria-labelledby="contact-heading"
    >
      <div className="contact-intro">
        <h2 id="contact-heading" aria-label="Vamos conversar sobre sua ideia?">
          <CinematicText
            lines={["Vamos conversar", "sobre sua ideia?"]}
            direction="balance"
          />
        </h2>
        <p>
          Conte o que você tem em mente. Vamos entender a sua necessidade e
          conversar sobre o próximo passo.
        </p>
        <a
          className="text-link"
          href={`https://wa.me/${studio.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Prefere conversar direto? <Arrow diagonal />
        </a>
      </div>
      <form
        onSubmit={submit}
        className="brief-form"
        onChange={() => {
          setLink("");
          setStatus("");
        }}
      >
        <div className="field-row">
          <label>
            Seu nome
            <input
              name="name"
              autoComplete="name"
              placeholder="Como podemos chamar você?"
              minLength={2}
              maxLength={100}
              required
            />
          </label>
          <label>
            Seu negócio <span>(opcional)</span>
            <input
              name="company"
              autoComplete="organization"
              placeholder="Nome da empresa ou projeto"
              maxLength={120}
            />
          </label>
        </div>
        <label>
          O que vamos criar?
          <select name="type" required defaultValue="">
            <option value="" disabled>
              Selecione o tipo de projeto
            </option>
            <option>Site institucional</option>
            <option>Landing page</option>
            <option>E-commerce</option>
            <option>Sistema web ou painel</option>
            <option>Solução personalizada</option>
            <option>Quero ajuda para decidir</option>
          </select>
        </label>
        <label>
          Conte um pouco sobre a sua ideia
          <textarea
            name="need"
            placeholder="O que você precisa resolver? Existe algum prazo ou referência?"
            minLength={10}
            maxLength={3000}
            rows={3}
            required
          />
        </label>
        <label>
          Número do WhatsApp
          <input
            name="contact"
            type="tel"
            inputMode="tel"
            placeholder="(41) 99999-9999"
            autoComplete="tel"
            maxLength={25}
            aria-describedby="whatsapp-help"
            required
          />
        </label>
        <p className="form-note" id="whatsapp-help">
          O WhatsApp abre com seu pedido preenchido. Toque em Enviar para
          concluir.
        </p>
        <button className="button button-dark" type="submit">
          Enviar pelo WhatsApp <Arrow diagonal />
        </button>
        <div className="form-feedback" role="status" aria-live="polite">
          {status}
          {link && (
            <a
              className="button button-dark"
              href={link}
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir WhatsApp novamente <Arrow diagonal />
            </a>
          )}
        </div>
      </form>
    </section>
  );
}
const technologySymbols: Record<string, string> = {
  "Node.js": "node",
  PostgreSQL: "postgresql",
  "Tailwind CSS": "tailwind",
  React: "react",
  TypeScript: "ts",
  "Three.js": "three",
  Vite: "vite",
  CSS: "css",
  JavaScript: "js",
};
function TechnologySymbol({ name }: { name: string }) {
  const symbol = technologySymbols[name];
  return (
    <svg
      className={`tech-symbol ${symbol}`}
      aria-hidden="true"
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      {symbol === "node" ? (
        <>
          <path d="m50 5 39 22v46L50 95 11 73V27Z" strokeWidth="5" />
          <text
            x="50"
            y="66"
            fontSize="38"
            fontWeight="600"
            textAnchor="middle"
            stroke="none"
            fill="currentColor"
          >
            JS
          </text>
        </>
      ) : symbol === "postgresql" ? (
        <>
          <image href="/technologies/postgresql.svg" width="100" height="100" />
        </>
      ) : symbol === "tailwind" ? (
        <>
          <path
            d="M8 40q14-28 36-13t40-7q-10 29-33 14T8 40Zm8 30q14-28 36-13t40-7q-10 29-33 14T16 70Z"
            fill="currentColor"
            stroke="none"
          />
        </>
      ) : symbol === "css" ? (
        <>
          <path d="M14 8h72l-7 72-29 11-29-11Z" />
          <path d="M30 28h41l-3 38-18 7-19-7-2-15h27v-9H30Z" />
          <text
            x="50"
            y="20"
            fontSize="10"
            textAnchor="middle"
            stroke="none"
            fill="currentColor"
          >
            CSS
          </text>
        </>
      ) : symbol === "js" ? (
        <>
          <rect x="7" y="7" width="86" height="86" rx="3" fill="currentColor" />
          <text
            x="29"
            y="77"
            fontSize="48"
            fontWeight="600"
            stroke="none"
            fill="#080d1b"
          >
            JS
          </text>
        </>
      ) : symbol === "react" ? (
        <>
          <ellipse cx="50" cy="50" rx="45" ry="17" />
          <ellipse
            cx="50"
            cy="50"
            rx="45"
            ry="17"
            transform="rotate(60 50 50)"
          />
          <ellipse
            cx="50"
            cy="50"
            rx="45"
            ry="17"
            transform="rotate(120 50 50)"
          />
          <circle cx="50" cy="50" r="6" fill="currentColor" />
        </>
      ) : symbol === "ts" ? (
        <>
          <rect x="7" y="7" width="86" height="86" rx="4" fill="currentColor" />
          <text
            x="30"
            y="77"
            fontSize="48"
            fontWeight="600"
            stroke="none"
            fill="#080d1b"
          >
            TS
          </text>
        </>
      ) : symbol === "three" ? (
        <>
          <path d="M12 8 92 28 35 94Z M12 8 52 18 23 51 64 61 35 94 M52 18 64 61 92 28 M23 51 77 44 M35 94 44 68" />
        </>
      ) : (
        <>
          <path d="m8 18 42 75 43-75-42 8Z" />
          <path d="M58 4 37 51h17l-8 30 28-47H57l10-30Z" fill="currentColor" />
        </>
      )}
    </svg>
  );
}
function TechnologyMarquee({
  items,
  label,
  variant = "studio",
}: {
  items: string[];
  label: string;
  variant?: string;
}) {
  const rail = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ x: number; scroll: number; active: boolean } | null>(
    null,
  );
  const [held, setHeld] = useState(false);
  useEffect(() => {
    const element = rail.current?.parentElement;
    if (!element) return;
    const observer = new IntersectionObserver((entries) =>
      element.classList.toggle("is-offscreen", !entries[0].isIntersecting),
    );
    observer.observe(element);
    const resize = new ResizeObserver(() => {
      element.style.setProperty(
        "--marquee-viewport",
        `${rail.current?.clientWidth ?? 0}px`,
      );
    });
    resize.observe(element);
    return () => {
      observer.disconnect();
      resize.disconnect();
    };
  }, []);
  return (
    <div
      className={`technology-marquee technology-${variant} ${held ? "is-held" : ""}`}
    >
      <div
        className="marquee-viewport"
        ref={rail}
        tabIndex={0}
        role="region"
        aria-label={label}
        onScroll={(event) => {
          const width = event.currentTarget.scrollWidth / 3;
          if (
            !motionPreference().matches &&
            event.currentTarget.scrollLeft >= width
          )
            event.currentTarget.scrollLeft -= width;
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            rail.current?.scrollBy({
              left: event.key === "ArrowRight" ? 280 : -280,
              behavior: "auto",
            });
          }
        }}
        onPointerDown={(event) => {
          if (event.pointerType === "mouse") {
            gesture.current = {
              x: event.clientX,
              scroll: event.currentTarget.scrollLeft,
              active: true,
            };
            event.currentTarget.setPointerCapture(event.pointerId);
          }
          setHeld(true);
        }}
        onPointerMove={(event) => {
          const g = gesture.current;
          if (g?.active)
            event.currentTarget.scrollLeft = g.scroll + g.x - event.clientX;
        }}
        onPointerUp={() => {
          gesture.current = null;
          setHeld(false);
        }}
        onPointerCancel={() => {
          gesture.current = null;
          setHeld(false);
        }}
      >
        <div className="marquee-belt">
          {[0, 1, 2].map((copy) => (
            <div
              className="marquee-group"
              key={copy}
              aria-hidden={copy > 0 ? true : undefined}
            >
              {[...new Set(items)]
                .filter((name) => name !== "HTML")
                .map((name) => (
                  <div className="technology-word" key={name}>
                    <TechnologySymbol name={name} />
                    <span>{name}</span>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function EnterpriseSystems() {
  const captureDialog = useRef<HTMLDialogElement>(null);
  const captureTrigger = useRef<HTMLButtonElement>(null);
  const backdropPointer = useRef(false);
  return (
    <section
      className="systems-section"
      id="sistemas"
      aria-labelledby="systems-heading"
    >
      <div className="section-heading">
        <h2 id="systems-heading">
          <CinematicText
            lines={["Sistemas", "empresariais"]}
            direction="horizon"
          />
        </h2>
        <p>
          Software desenvolvido para organizar operações e simplificar a rotina
          das empresas.
        </p>
      </div>
      <article className="system-feature" aria-labelledby="orion-heading">
        <div className="system-copy" data-reveal="system">
          <div className="system-title">
            <OrionOrbit />
            <h3 id="orion-heading">
              ORION <span>Empresarial</span>
            </h3>
            <span className="system-status">EM BREVE</span>
          </div>
          <p className="system-lead">
            Gestão inteligente de compras, do pedido ao recebimento.
          </p>
          <p>
            O ORION é um sistema empresarial desenvolvido para centralizar,
            organizar e simplificar o processo de compras de empresas com
            múltiplas unidades.
          </p>
          <p>
            Em uma única plataforma, permite gerenciar fornecedores, produtos,
            cotações e solicitações de compras, consolidar pedidos de diferentes
            lojas e acompanhar as etapas até o recebimento das mercadorias.
          </p>
          <p>
            Com recursos de conferência, histórico de preços e controle de
            divergências, o ORION oferece mais organização e rastreabilidade
            para as operações.
          </p>
          <p className="system-complement">
            Menos processos manuais. Mais controle sobre cada compra.
          </p>
          <p className="system-availability">
            Apresentação futura · ainda não disponível
          </p>
        </div>
        <figure className="system-visual" data-reveal="system">
          <div className="orion-capture-stage">
            <button
              className="orion-capture-trigger"
              ref={captureTrigger}
              type="button"
              aria-label="Ampliar captura real do ORION Empresarial"
              aria-haspopup="dialog"
              onClick={() => captureDialog.current?.showModal()}
            >
              <span className="orion-window-bar" aria-hidden="true">
                <span className="orion-window-mark">
                  <span />
                  <span />
                  <span />
                </span>
                <span>ORION Empresarial</span>
                <span className="orion-capture-expand">
                  Ampliar <Arrow diagonal />
                </span>
              </span>
              <span className="orion-capture-crop">
                <img
                  src="/projects/orion-real.png"
                  width="1910"
                  height="1000"
                  loading="lazy"
                  alt="Tela inicial real do ORION Empresarial: menu lateral, cotações, pedidos das lojas, consolidação, pedidos a fornecedores e resumo da operação."
                />
              </span>
            </button>
          </div>
          <figcaption>
            Captura real do ORION Empresarial · visão inicial da rotina de
            compras.
          </figcaption>
          <dialog
            className="orion-capture-dialog"
            ref={captureDialog}
            aria-labelledby="orion-capture-heading"
            onPointerDown={(event) => {
              backdropPointer.current = event.target === event.currentTarget;
            }}
            onClick={(event) => {
              if (
                backdropPointer.current &&
                event.target === event.currentTarget
              ) {
                const rect = event.currentTarget.getBoundingClientRect();
                if (
                  event.clientX < rect.left ||
                  event.clientX > rect.right ||
                  event.clientY < rect.top ||
                  event.clientY > rect.bottom
                ) {
                  event.currentTarget.close();
                }
              }
              backdropPointer.current = false;
            }}
            onClose={() =>
              captureTrigger.current?.focus({ preventScroll: true })
            }
          >
            <div className="orion-capture-heading">
              <h4 id="orion-capture-heading">
                Captura completa do ORION Empresarial
              </h4>
              <button
                type="button"
                autoFocus
                aria-label="Fechar captura ampliada do ORION"
                onClick={() => captureDialog.current?.close()}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
            <p>
              Imagem original completa. Role para explorar todos os detalhes.
            </p>
            <div
              className="orion-capture-full"
              tabIndex={0}
              aria-label="Captura completa; use as setas para percorrer a imagem"
            >
              <img
                src="/projects/orion-real.png"
                width="1910"
                height="1000"
                alt="Captura original completa da tela inicial do ORION, incluindo a região inferior da interface."
              />
            </div>
          </dialog>
        </figure>
        <dl className="system-capabilities" data-reveal="system">
          {[
            [
              "Compras multiunidade",
              "Organização das solicitações de diferentes lojas.",
            ],
            [
              "Consolidação de pedidos",
              "Agrupamento das necessidades por fornecedor.",
            ],
            [
              "Cotações e fornecedores",
              "Organização de preços e condições comerciais.",
            ],
            [
              "Recebimento e conferência",
              "Acompanhamento de quantidades e divergências.",
            ],
          ].map(([title, description]) => (
            <div key={title}>
              <dt>{title}</dt>
              <dd>{description}</dd>
            </div>
          ))}
        </dl>
      </article>
    </section>
  );
}
export default function App() {
  useMotion();
  const [menu, setMenu] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const hero = useRef<HTMLElement>(null);
  return (
    <div className="portfolio">
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <header
        className="site-header"
        onKeyDown={(event) => {
          if (event.key === "Escape" && menu) {
            setMenu(false);
            menuButton.current?.focus();
          }
        }}
      >
        <a href="#inicio" className="brand" aria-label="AmadeiTech — início">
          <span className="logo-crop">
            <img
              src="/brand/amadeitech-original.jpeg"
              alt=""
              width="1254"
              height="1254"
            />
          </span>
          <span>AmadeiTech</span>
        </a>
        <button
          ref={menuButton}
          className="menu-toggle"
          aria-expanded={menu}
          aria-controls="main-navigation"
          onClick={() => setMenu(!menu)}
        >
          {menu ? "Fechar" : "Menu"}
          <span aria-hidden="true">{menu ? "−" : "+"}</span>
        </button>
        <nav
          id="main-navigation"
          className={menu ? "navigation is-open" : "navigation"}
          aria-label="Principal"
        >
          <a href="#projetos" onClick={() => setMenu(false)}>
            Sites
          </a>
          <a href="#sistemas" onClick={() => setMenu(false)}>
            Sistemas
          </a>
          <a href="#servicos" onClick={() => setMenu(false)}>
            Serviços
          </a>
          <a
            href="#contato"
            className="nav-contact"
            onClick={() => setMenu(false)}
          >
            Vamos conversar <Arrow diagonal />
          </a>
        </nav>
      </header>
      <main id="conteudo">
        <section className="hero" id="inicio" ref={hero}>
          <div className="hero-content">
            <TextVaporize />
            <p>
              Design e desenvolvimento para levar
              <br className="desktop-break" /> o seu negócio além do comum.
            </p>
            <div className="hero-actions">
              <a href="#projetos" className="button button-blue">
                Explore os sites <Arrow diagonal />
              </a>
              <a href="#contato" className="text-link">
                Vamos criar juntos <Arrow diagonal />
              </a>
            </div>
          </div>
          <div className="hero-art">
            <div className="network-field" aria-hidden="true">
              <Suspense fallback={null}>
                <NetworkLines
                  background="transparent"
                  baseColor="#406bc9"
                  accentColor="#a1caff"
                  density={138}
                  dotSize={50}
                  linkDistance={135}
                  speed={50}
                />
              </Suspense>
            </div>
            <Suspense fallback={null}>
              <HeroScene />
            </Suspense>
            <span className="object-caption">AmadeiTech · Design & código</span>
          </div>
          <div className="hero-bottom">
            <span>
              Sites. Lojas. Sistemas.
              <br />
              Experiências feitas sob medida.
            </span>
            <a href="#experiencia">
              Continue explorando <span className="scroll-arrow">↓</span>
            </a>
          </div>
        </section>
        <section className="intro-section" id="sobre" data-reveal>
          <h2 aria-label="Seu negócio tem um jeito próprio.">
            <CinematicText
              lines={["Seu negócio tem", "um jeito próprio."]}
              direction="atelier"
            />
          </h2>
          <div>
            <p className="intro-lead">
              A gente transforma isso em presença digital.
            </p>
            <p>
              Na AmadeiTech, design e desenvolvimento caminham juntos. Criamos
              sites, lojas e sistemas personalizados a partir do que o seu
              negócio realmente precisa.
            </p>
            <p>
              Da forma de apresentar uma ideia à maneira de organizar uma
              operação: cada decisão tem uma razão para estar ali.
            </p>
          </div>
        </section>
        <GlobeSection />
        <section className="services-section" id="servicos">
          <div className="section-heading" data-reveal="heading">
            <StaggerFlip text="Ideias em outra dimensão." />
            <p>
              Uma página ou uma operação inteira.
              <br />O ponto de partida é a sua necessidade.
            </p>
          </div>
          <div className="services-list">
            {services.map((service) => (
              <a
                href="#contato"
                className="service"
                key={service.name}
                data-reveal="service"
              >
                <h3>{service.name}</h3>
                <div>
                  <p>{service.text}</p>
                  <p>{service.detail}</p>
                </div>
                <span className="service-arrow">
                  <Arrow diagonal />
                </span>
              </a>
            ))}
          </div>
          <a className="text-link" href="#contato">
            Conte o que você precisa <Arrow diagonal />
          </a>
        </section>
        <section className="work-section" id="projetos">
          <div className="section-heading" data-reveal="heading">
            <h2>
              <CinematicText
                lines={["Sites que", "ganharam forma."]}
                direction="horizon"
              />
            </h2>
            <p>
              Negócios diferentes.
              <br />
              Experiências com identidade própria.
            </p>
          </div>
          <nav className="project-index" aria-label="Explorar os quatro sites">
            {projects.map((project) => (
              <a key={project.id} href={`#project-${project.id}`}>
                {project.name} <Arrow diagonal />
              </a>
            ))}
          </nav>
          <div className="project-grid">
            {projects.map((project, index) => (
              <ProjectFeature
                project={project}
                index={index}
                key={project.id}
              />
            ))}
          </div>
        </section>
        <EnterpriseSystems />
        <FounderSection />
        <Contact />
      </main>
      <footer className="site-footer">
        <div className="footer-top">
          <p>
            Vamos dar forma
            <br />à sua próxima ideia.
          </p>
          <div>
            <a
              href={studio.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram <Arrow diagonal />
            </a>
            <a
              href={`https://wa.me/${studio.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp <Arrow diagonal />
            </a>
          </div>
          <p className="footer-note">Design & desenvolvimento sob medida.</p>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} AmadeiTech</span>
          <span className="developer-signature">
            Desenvolvido por AmadeiDev
          </span>
          <a href="#inicio" className="back-top">
            Voltar ao início <Arrow diagonal />
          </a>
        </div>
      </footer>
    </div>
  );
}
