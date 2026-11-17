export const studio = {
  name: "AmadeiTech",
  whatsapp: "5541991543278",
  instagram: "https://www.instagram.com/amadei.dev/",
};
// Fill the display name when provided; never infer identity from a handle.
export const founder = {
  name: "",
  signature: "AmadeiDev",
  photo: "/brand/amadeidev-portrait.jpg",
  github: "https://github.com/amadeii",
};
export type Project = {
  id: string;
  name: string;
  category: string;
  description: string;
  url: string;
  color: string;
  technologies: string[];
  panel?: {
    image: string;
    alt: string;
    caption: string;
    modules: { name: string; image: string; description: string }[];
  };
};
export const projects: Project[] = [
  {
    id: "wandyfitt",
    name: "WandyFitt",
    category: "Alimentação · Pedidos online",
    description:
      "Do cardápio público à organização do preparo, o projeto reúne a experiência de quem pede e as telas de quem opera. O painel separa pedidos, cozinha e cardápio para dar clareza às tarefas do dia a dia.",
    panel: {
      image: "/projects/wandyfitt-panel.png",
      alt: "Tela local do painel WandyFitt com navegação de pedidos, entregas e operação",
      caption:
        "Painel de comando · captura local da interface, sem dados de clientes.",
      modules: [
        {
          name: "Pedidos",
          image: "/projects/wandyfitt-pedidos.png",
          description:
            "A área de pedidos reúne a consulta e as ações de andamento e cancelamento. É o ponto de acompanhamento da operação, com acesso separado ao monitor de entregas.",
        },
        {
          name: "Cozinha",
          image: "/projects/wandyfitt-cozinha.png",
          description:
            "O quadro de produção separa fila, preparo, saída e concluídos. Os comandos de avançar etapa e imprimir comanda mantêm o foco no que precisa ser preparado a seguir.",
        },
        {
          name: "Cardápio",
          image: "/projects/wandyfitt-cardapio.png",
          description:
            "Cadastro e edição dos itens do cardápio, com categoria, descrição, preço e imagem. A manutenção da oferta fica em uma área própria, sem misturar essa tarefa com a fila da cozinha.",
        },
      ],
    },
    url: "https://wandyfitt.com.br/",
    color: "#a6b99c",
    technologies: ["CSS", "JavaScript", "TypeScript", "PostgreSQL", "Node.js"],
  },
  {
    id: "ares",
    name: "Ares Studio Pilates",
    category: "Bem-estar · Site institucional",
    description:
      "Site institucional para apresentar as aulas e a proposta de cuidado do studio. Composição acolhedora e responsiva, com HTML, JavaScript e Tailwind CSS.",
    url: "https://aresstudiopilates.com.br/",
    color: "#9f9990",
    technologies: ["JavaScript", "TypeScript", "Tailwind CSS", "Vite"],
  },
  {
    id: "beaute",
    name: "29 Beauté",
    category: "Skincare · Apresentação de marca",
    description:
      "Uma apresentação de marca para o público e um espaço de gestão para a equipe. O painel organiza catálogo, pedidos e estoque, reunindo as informações de cada área em telas dedicadas à rotina da loja.",
    url: "https://29beaute.com.br/",
    color: "#aaa79c",
    technologies: [
      "React",
      "TypeScript",
      "Vite",
      "CSS",
      "PostgreSQL",
      "Node.js",
    ],
    panel: {
      image: "/projects/beaute-panel.png",
      alt: "Interface real do painel administrativo Norium da 29 Beauté, na área de produtos",
      caption:
        "CP 29 Beauté · interface Norium capturada localmente, sem dados de clientes.",
      modules: [
        {
          name: "Produtos",
          image: "/projects/beaute-produtos.png",
          description:
            "Catálogo organizado por marca, SKU e situação do produto. A equipe encontra os itens por busca e filtros e conta com cadastro de nome, descrição e preço no mesmo espaço.",
        },
        {
          name: "Pedidos",
          image: "/projects/beaute-pedidos.png",
          description:
            "Consulta de pedidos com busca e filtros por marca e etapa, do pagamento à entrega. Uma visão para localizar cada compra e acompanhar sua situação sem percorrer todo o catálogo.",
        },
        {
          name: "Estoque",
          image: "/projects/beaute-estoque.png",
          description:
            "Consulta por produto, variante ou SKU, com saldos físico, reservado e disponível. O filtro de baixo estoque ajuda a identificar quais itens precisam de atenção na reposição.",
        },
      ],
    },
  },
  {
    id: "alanna",
    name: "Alanna Foto Pet",
    category: "Fotografia · Campanha de Natal",
    description:
      "Campanha Memórias Natalinas 2026 para fotografia pet. Fotos e proposta do ensaio conduzem a experiência, em uma interface React com composição responsiva.",
    url: "https://alannafotopet.com.br/",
    color: "#d1b9aa",
    technologies: ["React", "TypeScript", "Vite", "CSS"],
  },
];
