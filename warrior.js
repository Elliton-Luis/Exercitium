/* ================================================================
   EXERCITIUM — Guerreiro visual
   O corpo é dimensionado pelo histórico REAL de treino (séries por
   músculo). Arquitetura em camadas/slots pronta para receber novos
   equipamentos: basta registrar itens no ARMARIO e equipá-los.
   ================================================================ */

const Warrior = (() => {

  const CAP_PONTOS = 50; // séries-equivalentes para um grupo chegar a 100%

  /* ---- catálogo de cosméticos por slot ----
     origem: {tipo:"padrao"} | {tipo:"loja",preco[,nivel]}
             | {tipo:"nivel"|"recordes"|"treinos"|"volume", qtd/nivel/kg}
     raridade: comum | incomum | raro | epico | lendario            */
  const RARIDADES = {
    comum:    { nome: "Comum",    cor: "#97814f" },
    incomum:  { nome: "Incomum",  cor: "#6fa84a" },
    raro:     { nome: "Raro",     cor: "#5b8fb8" },
    epico:    { nome: "Épico",    cor: "#9a68c0" },
    lendario: { nome: "Lendário", cor: "#d9822b" }
  };

  const SLOTS = {
    cabeca:    { icone: "🪖", plural: "Capacetes",  padrao: "elmo_ferro" },
    corpo:     { icone: "🛡", plural: "Armaduras",  padrao: "tunica_pano" },
    capa:      { icone: "🧣", plural: "Capas",      padrao: "capa_nenhuma" },
    luvas:     { icone: "🧤", plural: "Luvas",      padrao: "luvas_couro" },
    calcas:    { icone: "👖", plural: "Calças",     padrao: "calcas_couro" },
    botas:     { icone: "👢", plural: "Botas",      padrao: "botas_couro" },
    acessorio: { icone: "📿", plural: "Acessórios", padrao: "colar_pano" },
    arma:      { icone: "⚔", plural: "Armas",       padrao: "espada_ferro" }
  };

  const COSMETICOS = [
    // cabeça
    { id: "elmo_ferro",      slot: "cabeca", nome: "Elmo de Ferro",     raridade: "comum",
      origem: { tipo: "padrao" } },
    { id: "elmo_simples",    slot: "cabeca", nome: "Elmo Simples",      raridade: "comum",
      origem: { tipo: "loja", preco: 80 } },
    { id: "capuz_couro",     slot: "cabeca", nome: "Capuz de Couro",    raridade: "incomum",
      origem: { tipo: "loja", preco: 120 } },
    { id: "elmo_chifres",    slot: "cabeca", nome: "Elmo com Chifres",  raridade: "raro",
      origem: { tipo: "loja", preco: 350, nivel: 8 } },
    { id: "elmo_fechado",    slot: "cabeca", nome: "Elmo Fechado",      raridade: "raro",
      origem: { tipo: "loja", preco: 400, nivel: 10 } },
    { id: "elmo_cavaleiro",  slot: "cabeca", nome: "Elmo do Cavaleiro", raridade: "epico",
      origem: { tipo: "loja", preco: 900, nivel: 15 } },
    { id: "coroa_conquista", slot: "cabeca", nome: "Coroa da Vitória",  raridade: "lendario",
      origem: { tipo: "recordes", qtd: 20 } },
    // corpo
    { id: "tunica_pano",     slot: "corpo",  nome: "Túnica de Pano",    raridade: "comum",
      origem: { tipo: "padrao" } },
    { id: "armadura_couro",  slot: "corpo",  nome: "Armadura de Couro", raridade: "incomum",
      origem: { tipo: "loja", preco: 200 } },
    { id: "armadura_ferro",  slot: "corpo",  nome: "Armadura de Ferro", raridade: "comum",
      origem: { tipo: "loja", preco: 150 } },
    { id: "cota_malha",      slot: "corpo",  nome: "Cota de Malha",     raridade: "incomum",
      origem: { tipo: "loja", preco: 300 } },
    { id: "armadura_pesada", slot: "corpo",  nome: "Armadura Pesada",   raridade: "raro",
      origem: { tipo: "loja", preco: 600, nivel: 12 } },
    { id: "armadura_negra",  slot: "corpo",  nome: "Armadura Negra",    raridade: "epico",
      origem: { tipo: "recordes", qtd: 100 } },
    { id: "armadura_forja",  slot: "corpo",  nome: "Armadura da Forja", raridade: "epico",
      origem: { tipo: "volume", kg: 50000 } },
    { id: "armadura_dourada",slot: "corpo",  nome: "Armadura Dourada",  raridade: "lendario",
      origem: { tipo: "loja", preco: 2000, nivel: 20 } },
    // capa
    { id: "capa_nenhuma",    slot: "capa",   nome: "Sem Capa",          raridade: "comum",
      origem: { tipo: "padrao" } },
    { id: "capa_viajante",   slot: "capa",   nome: "Capa do Viajante",  raridade: "comum",
      origem: { tipo: "loja", preco: 100 } },
    { id: "capa_branca",     slot: "capa",   nome: "Capa Branca",       raridade: "incomum",
      origem: { tipo: "loja", preco: 450 } },
    { id: "capa_guerreiro",  slot: "capa",   nome: "Capa do Guerreiro", raridade: "incomum",
      origem: { tipo: "loja", preco: 500, nivel: 10 } },
    { id: "capa_sombria",    slot: "capa",   nome: "Capa Sombria",      raridade: "raro",
      origem: { tipo: "loja", preco: 700, nivel: 12 } },
    { id: "capa_campeao",    slot: "capa",   nome: "Capa do Campeão",   raridade: "raro",
      origem: { tipo: "loja", preco: 1000, nivel: 15 } },
    { id: "capa_ornamentada",slot: "capa",   nome: "Capa Ornamentada",  raridade: "epico",
      origem: { tipo: "loja", preco: 1200, nivel: 18 } },
    { id: "manto_real",      slot: "capa",   nome: "Manto Real",        raridade: "lendario",
      origem: { tipo: "loja", preco: 1800, nivel: 25 } },
    { id: "manto_veterano",  slot: "capa",   nome: "Manto do Veterano", raridade: "epico",
      origem: { tipo: "treinos", qtd: 50 } },
    // luvas
    { id: "luvas_couro",     slot: "luvas",  nome: "Luvas de Couro",    raridade: "comum",
      origem: { tipo: "padrao" } },
    { id: "manoplas_forja",  slot: "luvas",  nome: "Manoplas da Forja", raridade: "incomum",
      origem: { tipo: "loja", preco: 120 } },
    { id: "manoplas_aco",    slot: "luvas",  nome: "Manoplas de Aço",   raridade: "raro",
      origem: { tipo: "loja", preco: 300, nivel: 10 } },
    // calças
    { id: "calcas_couro",    slot: "calcas", nome: "Calça de Couro",    raridade: "comum",
      origem: { tipo: "padrao" } },
    { id: "calcas_aco",      slot: "calcas", nome: "Calça de Aço",      raridade: "incomum",
      origem: { tipo: "loja", preco: 180 } },
    { id: "calca_pesada",    slot: "calcas", nome: "Calça Pesada",      raridade: "raro",
      origem: { tipo: "loja", preco: 350, nivel: 10 } },
    // botas
    { id: "botas_couro",     slot: "botas",  nome: "Botas de Couro",    raridade: "comum",
      origem: { tipo: "padrao" } },
    { id: "botas_viajante",  slot: "botas",  nome: "Botas do Viajante", raridade: "comum",
      origem: { tipo: "loja", preco: 90 } },
    { id: "coturnos_forja",  slot: "botas",  nome: "Coturnos da Forja", raridade: "incomum",
      origem: { tipo: "loja", preco: 160 } },
    { id: "grevas_aco",      slot: "botas",  nome: "Grevas de Aço",     raridade: "raro",
      origem: { tipo: "loja", preco: 320, nivel: 10 } },
    { id: "botas_pesadas",   slot: "botas",  nome: "Botas Pesadas",     raridade: "raro",
      origem: { tipo: "loja", preco: 420, nivel: 12 } },
    // acessório
    { id: "colar_pano",      slot: "acessorio", nome: "Cordão de Pano", raridade: "comum",
      origem: { tipo: "padrao" } },
    { id: "amuleto_ouro",    slot: "acessorio", nome: "Amuleto de Ouro", raridade: "incomum",
      origem: { tipo: "loja", preco: 250 } },
    { id: "amuleto_runico",  slot: "acessorio", nome: "Amuleto Rúnico", raridade: "raro",
      origem: { tipo: "loja", preco: 500, nivel: 12 } },
    { id: "talisma_forja",   slot: "acessorio", nome: "Talismã da Forja", raridade: "epico",
      origem: { tipo: "treinos", qtd: 100 } },
    // arma
    { id: "espada_ferro",    slot: "arma",   nome: "Espada de Ferro",     raridade: "comum",
      origem: { tipo: "padrao" } },
    { id: "machado_batalha", slot: "arma",   nome: "Machado de Batalha",  raridade: "incomum",
      origem: { tipo: "loja", preco: 220 } },
    { id: "lanca_caca",      slot: "arma",   nome: "Lança de Caça",       raridade: "incomum",
      origem: { tipo: "loja", preco: 260 } },
    { id: "martelo_forja",   slot: "arma",   nome: "Martelo da Forja",    raridade: "raro",
      origem: { tipo: "loja", preco: 380, nivel: 8 } },
    { id: "espadao_guerreiro", slot: "arma", nome: "Espadão do Guerreiro", raridade: "raro",
      origem: { tipo: "loja", preco: 550, nivel: 12 } },
    { id: "espada_campeao",  slot: "arma",   nome: "Espada do Campeão",   raridade: "epico",
      origem: { tipo: "loja", preco: 800, nivel: 12 } }
  ];

  /* paletas/detalhes de desenho por item */
  const ESTILOS = {
    // cabeça
    elmo_ferro:        { metal: "#8a744a", escuro: "#42351c" },
    elmo_simples:      { metal: "#9aa2ab", escuro: "#4a4e55" },
    capuz_couro:       { cor: "#4a2f18", sombra: "#241708" },
    elmo_chifres:      { metal: "#6d7480", escuro: "#3a3f47", chifre: "#d8cbb0" },
    elmo_fechado:      { metal: "#707682", escuro: "#33373d", visor: "#171009" },
    elmo_cavaleiro:    { metal: "#aab1bc", escuro: "#33373d", detalhe: "#e0b34d", asa: "#e8cd85" },
    coroa_conquista:   { ouro: "#d9b345", escuro: "#6b5210" },
    // corpo (bulk = impacto na silhueta; saia/malha/detalhe = extras)
    tunica_pano:       { claro: "#8a6f4a", medio: "#6b543a", escuro: "#40301e", bulk: 0 },
    armadura_couro:    { claro: "#7c5a34", medio: "#5c4224", escuro: "#33200f", bulk: .8 },
    cota_malha:        { claro: "#8d939e", medio: "#666c76", escuro: "#363a41", malha: true, bulk: 1.2 },
    armadura_ferro:    { claro: "#99a0ac", medio: "#6d7480", escuro: "#3a3f47", bulk: 1.5 },
    armadura_pesada:   { claro: "#a8afb9", medio: "#757d89", escuro: "#383c44", bulk: 3, saia: true },
    armadura_negra:    { claro: "#3d4048", medio: "#26282e", escuro: "#101114", detalhe: "#c0392b", bulk: 2.2 },
    armadura_forja:    { claro: "#c09a52", medio: "#86622a", escuro: "#42300f", detalhe: "#e0b34d", bulk: 2 },
    armadura_dourada:  { claro: "#eccf78", medio: "#c19a3c", escuro: "#7a5c14", detalhe: "#fff0c4", bulk: 2.2 },
    // capa (comp = comprimento; hem/pele/ornamento = extras)
    capa_viajante:     { cor: "#6b4a2a", borda: "#33200f", comp: 112 },
    capa_branca:       { cor: "#ddd2b5", borda: "#8a744a", comp: 120 },
    capa_guerreiro:    { cor: "#7c1f14", borda: "#380d06", comp: 126 },
    capa_sombria:      { cor: "#23202a", borda: "#0d0c11", comp: 136 },
    capa_campeao:      { cor: "#26436b", borda: "#101f38", comp: 128, hem: "#e0b34d" },
    capa_ornamentada:  { cor: "#2e4a2e", borda: "#14260f", comp: 132, hem: "#e0b34d", ornamento: true },
    manto_real:        { cor: "#5c2015", borda: "#2c0e06", comp: 142, pele: "#e3d0a0", hem: "#e0b34d" },
    manto_veterano:    { cor: "#31502b", borda: "#16260f", comp: 138, hem: "#e0b34d" },
    // luvas / calças / botas
    luvas_couro:       { cor: "#4a2f18" },
    manoplas_forja:    { cor: "#565c66" },
    manoplas_aco:      { cor: "#99a0ac" },
    calcas_couro:      { cor: "#43301c" },
    calcas_aco:        { cor: "#565c66" },
    calca_pesada:      { cor: "#3d3a35", pesada: true },
    botas_couro:       { cor: "#33200f", h: 17 },
    botas_viajante:    { cor: "#55402a", h: 14 },
    coturnos_forja:    { cor: "#1c130a", h: 19, tira: true },
    grevas_aco:        { cor: "#757d89", h: 20, joelho: true },
    botas_pesadas:     { cor: "#241708", h: 22, pesada: true },
    // acessório
    colar_pano:        { cordao: "#97814f" },
    amuleto_ouro:      { cordao: "#c9a13b", pedra: "#c0392b" },
    amuleto_runico:    { cordao: "#8d939e", pedra: "#26436b", runico: true },
    talisma_forja:     { cordao: "#c09a52", pedra: "#cf7227", brilho: true },
    // armas (tipo define a silhueta)
    espada_ferro:      { tipo: "espada", lamina: "#c9ced6", guarda: "#c9a13b", punho: "#3a2412" },
    espada_campeao:    { tipo: "espada", lamina: "#eef3fa", guarda: "#e0b34d", punho: "#5c2015", brilho: true },
    espadao_guerreiro: { tipo: "espadao", lamina: "#b9c2cc", guarda: "#8a6a35", punho: "#2c1d10" },
    machado_batalha:   { tipo: "machado", cabo: "#5c4224", metal: "#9aa2ab", corte: "#d6dbe2" },
    martelo_forja:     { tipo: "martelo", cabo: "#4a3520", metal: "#757d89" },
    lanca_caca:        { tipo: "lanca", cabo: "#6b4a2a", ponta: "#c9ced6" }
  };

  const PADRAO = {};
  for (const [slot, def] of Object.entries(SLOTS)) PADRAO[slot] = def.padrao;

  const porId = id => COSMETICOS.find(c => c.id === id) || null;
  const estiloDe = id => ESTILOS[id] || null;
  function equipado(s, slot) {
    const map = s.personagem.equipamento || {};
    const id = map[slot] || SLOTS[slot].padrao;
    return porId(id) ? id : SLOTS[slot].padrao;
  }

  /* ---- posse e requisitos ---- */
  function requisitoAtendido(s, o) {
    switch (o.tipo) {
      case "nivel":    return s.personagem.nivel >= o.nivel;
      case "recordes": return recordesQuebrados(s) >= o.qtd;
      case "treinos":  return s.treinos.length >= o.qtd;
      case "volume":   return volumeTotalGeral(s) >= o.kg;
      default:         return true;
    }
  }

  function reqTexto(o) {
    switch (o.tipo) {
      case "nivel":    return `Nível ${o.nivel}`;
      case "recordes": return `${o.qtd} recordes`;
      case "treinos":  return `${o.qtd} treinos completos`;
      case "volume":   return `${fmtNum(o.kg)} kg de volume`;
      case "loja":
        return o.nivel ? `${fmtNum(o.preco)} 🪙 · Nível ${o.nivel}` : `${fmtNum(o.preco)} 🪙`;
      default: return "";
    }
  }

  function possui(s, id) {
    const c = porId(id);
    if (!c) return false;
    if (c.origem.tipo === "padrao") return true;
    if (c.origem.tipo === "loja") return Array.isArray(s.inventario) && s.inventario.includes(id);
    return requisitoAtendido(s, c.origem);
  }

  function statusItem(s, item) {
    if ((s.personagem.equipamento || {})[item.slot] === item.id)
      return { acao: "equipado", motivo: "Equipado" };
    if (possui(s, item.id))
      return { acao: "equipar", motivo: "Possui" };
    if (item.origem.tipo === "loja") {
      if (item.origem.nivel && s.personagem.nivel < item.origem.nivel)
        return { acao: "bloqueado", motivo: `🔒 Nível ${item.origem.nivel}` };
      if (s.personagem.ouro < item.origem.preco)
        return { acao: "caro", motivo: `🔒 Faltam ${fmtNum(item.origem.preco - s.personagem.ouro)} 🪙` };
      return { acao: "comprar", motivo: `${fmtNum(item.origem.preco)} 🪙` };
    }
    if (!requisitoAtendido(s, item.origem))
      return { acao: "bloqueado", motivo: `🔒 ${reqTexto(item.origem)}` };
    return { acao: "reivindicar", motivo: "Recompensa desbloqueada!" };
  }

  /* ---- cálculo muscular com pesos centralizados ---- */
  function calcMusculos(s) {
    const vol = {};
    const pesoP = (typeof PESO_PRINCIPAL !== "undefined" ? PESO_PRINCIPAL : 1.0);
    const pesoS = (typeof PESO_SECUNDARIO !== "undefined" ? PESO_SECUNDARIO : 0.5);
    for (const t of s.treinos) {
      const ex = State.exercicioPorId(t.exercicioId);
      if (!ex) continue;
      const n = t.series.length;
      for (const m of ex.principal) vol[m] = (vol[m] || 0) + n * pesoP;
      for (const m of ex.secundarios) vol[m] = (vol[m] || 0) + n * pesoS;
    }
    return vol;
  }

  const pctDe = vol => Math.min(100, Math.round((vol || 0) / CAP_PONTOS * 100));

  // curva suave para visual (evita desproporção)
  function curvaPct(pct) {
    const n = Math.min(1, Math.max(0, pct / 100));
    return Math.pow(n, 0.72); // 0.72 torna início mais perceptível e topo mais contido
  }

  /* ---- agrupamentos macro + detalhamento fino ---- */
  const MACRO = [
    { nome: "Peito",  musculos: ["Peitoral"] },
    { nome: "Costas", musculos: ["Dorsais", "Trapézio"] },
    { nome: "Ombros", musculos: ["Deltoide Anterior", "Deltoide Lateral", "Deltoide Posterior"] },
    { nome: "Braços", musculos: ["Bíceps", "Tríceps", "Braquial", "Flexores do Antebraço", "Extensores do Antebraço"] },
    { nome: "Pernas", musculos: ["Quadríceps", "Posterior", "Glúteos", "Panturrilha"] },
    { nome: "Core",   musculos: ["Abdômen", "Lombar"] }
  ];

  // para renderização detalhada do mapa (ordem sugerida no spec)
  const DETALHE_MAPA = [
    { grupo: "Peito", itens: ["Peitoral"] },
    { grupo: "Costas", itens: ["Dorsais", "Trapézio"] },
    { grupo: "Ombros", itens: ["Deltoide Anterior", "Deltoide Lateral", "Deltoide Posterior"] },
    { grupo: "Braços", itens: ["Bíceps", "Tríceps", "Braquial", "Flexores do Antebraço", "Extensores do Antebraço"] },
    { grupo: "Pernas", itens: ["Quadríceps", "Posterior", "Glúteos", "Panturrilha"] },
    { grupo: "Core", itens: ["Abdômen", "Lombar"] }
  ];

  const NIVEIS_MUSCULARES = [
    { romano: "–",  nome: "Não treinado" },
    { romano: "I",  nome: "Iniciante" },
    { romano: "II", nome: "Desenvolvido" },
    { romano: "III",nome: "Avançado" },
    { romano: "IV", nome: "Elite" }
  ];

  function nivelDePontos(p) {
    return p <= 0 ? 0 : p < 13 ? 1 : p < 26 ? 2 : p < 38 ? 3 : 4;
  }

  function gruposMacroPontos(s) {
    const v = calcMusculos(s);
    return MACRO.map(({ nome, musculos }) => ({
      nome,
      musculos,
      pontos: musculos.reduce((n, m) => n + (v[m] || 0), 0)
    }));
  }

  function rankGuerreiro(s) {
    const gs = gruposMacroPontos(s);
    const lvl = Math.max(...gs.map(g => nivelDePontos(g.pontos)));
    return { lvl, ...NIVEIS_MUSCULARES[lvl] };
  }

  function balanco(s) {
    const gs = gruposMacroPontos(s);
    const total = gs.reduce((n, g) => n + g.pontos, 0);
    const res = gs.map(g => ({
      nome: g.nome,
      share: total > 0 ? g.pontos / total * 100 : 0
    }));
    if (total > 0) {
      for (const g of res) g.share = Math.round(g.share);
      const maior = res.reduce((a, b) => (b.share > a.share ? b : a), res[0]);
      maior.share += 100 - res.reduce((n, g) => n + g.share, 0);
    }
    return res;
  }

  /* percentual fino + aliases legados para compatibilidade */
  function mapaPct(s) {
    const v = calcMusculos(s);
    const base = {};
    for (const m of MUSCULOS) base[m] = pctDe(v[m]);
    // aliases legados
    base["Costas"] = base["Dorsais"] || 0;
    base["Ombros"] = Math.round((base["Deltoide Anterior"] + base["Deltoide Lateral"] + base["Deltoide Posterior"]) / 3);
    base["Core"] = Math.round((base["Abdômen"] + (base["Lombar"]||0)) / 2);
    base["Antebraço"] = Math.round(((base["Flexores do Antebraço"]||0) + (base["Extensores do Antebraço"]||0))/2);
    // compat: Posterior já é o nome interno; mantém
    return base;
  }

  // detalhado por músculo individual
  function mapaDetalhado(s) {
    const v = calcMusculos(s);
    return MUSCULOS.map(m => ({
      nome: m,
      vol: v[m] || 0,
      pct: pctDe(v[m]),
      lvl: nivelDePontos(v[m] || 0)
    }));
  }

  function mapaRelativo(s) {
    const v = calcMusculos(s);
    const grupos = [
      "Peitoral", "Dorsais", "Trapézio",
      "Deltoide Anterior", "Deltoide Lateral", "Deltoide Posterior",
      "Bíceps", "Tríceps", "Braquial",
      "Flexores do Antebraço", "Extensores do Antebraço",
      "Quadríceps", "Posterior", "Glúteos", "Panturrilha",
      "Abdômen", "Lombar"
    ];
    const total = grupos.reduce((n, g) => n + (v[g] || 0), 0);
    const res = grupos.map(g => ({
      nome: g,
      vol: v[g] || 0,
      share: total > 0 ? (v[g] || 0) / total * 100 : 0
    }));
    if (total > 0) {
      for (const g of res) g.share = Math.round(g.share);
      const maior = res.reduce((a, b) => (b.share > a.share ? b : a), res[0]);
      maior.share += 100 - res.reduce((n, g) => n + g.share, 0);
    }
    return res;
  }

  function calor(ratio, alpha) {
    const r = Math.round(184 + (196 - 184) * ratio);
    const g = Math.round(146 + (58 - 146) * ratio);
    const b = Math.round(58 + (42 - 58) * ratio);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function fatores(p) {
    // p é mapa pct (0-100)
    const f = x => curvaPct(Math.min(100, x||0));
    // deltoides individuais
    const fTrap = f(p["Trapézio"]);
    const fAnt = f(p["Deltoide Anterior"]);
    const fLat = f(p["Deltoide Lateral"]);
    const fPost = f(p["Deltoide Posterior"]);
    return {
      torso:  f(Math.max(p["Peitoral"]||0, p["Dorsais"]||0, p["Costas"]||0)),
      ombros: f(Math.max(p["Deltoide Lateral"]||0, p["Deltoide Anterior"]||0, p["Ombros"]||0)),
      trap: fTrap,
      lateral: fLat,
      anterior: fAnt,
      posterior: fPost,
      bracos: f(Math.max(p["Bíceps"]||0, p["Tríceps"]||0, p["Braquial"]||0)),
      biceps: f(p["Bíceps"]),
      triceps: f(p["Tríceps"]),
      braquial: f(p["Braquial"]),
      flexores: f(p["Flexores do Antebraço"]),
      extensores: f(p["Extensores do Antebraço"]),
      pernas: f(Math.max(p["Quadríceps"]||0, p["Posterior"]||0, p["Glúteos"]||0, p["Panturrilha"]||0)),
      quad: f(p["Quadríceps"]),
      posteriorCoxa: f(p["Posterior"]),
      gluteos: f(p["Glúteos"]),
      pant: f(p["Panturrilha"]),
      core:   f(Math.max(p["Abdômen"]||0, p["Core"]||0)),
      abdomen: f(p["Abdômen"]),
      lombar: f(p["Lombar"])
    };
  }

  /* ---- desenho do guerreiro (SVG em camadas) ---- */
  function svg(s, opts = {}) {
    if (opts.equipamento) {
      s = { ...s, personagem: { ...s.personagem,
        equipamento: { ...s.personagem.equipamento, ...opts.equipamento } } };
    }
    const p = mapaPct(s);
    const f = fatores(p);
    const cx = 60;

    const idCorpo = equipado(s, "corpo");
    const stCorpo = estiloDe(idCorpo) || {};
    const bulk     = stCorpo.bulk != null ? stCorpo.bulk : 1.5;

    // ombros: lateral domina largura, anterior/posterior contribuem menos
    const ombrosComp = f.lateral*0.6 + f.anterior*0.2 + f.posterior*0.2;
    const sh    = 17 + ombrosComp * 9 + bulk * 1.6;
    const waist = 11 + f.core * 4 + bulk * .8;
    const quadW = 9 + f.quad * 4.5 + f.gluteos*1.2;
    const postW = 8 + f.posteriorCoxa * 4;
    const gluteH = 3 + f.gluteos * 5.5;
    const trapW = 8 + f.trap * 6;
    const legW  = 9 + f.pernas * 7; // fallback compat
    // braços: bíceps+braquial vs tríceps; antebraço separado
    const upperW = 8 + Math.max(f.biceps,f.braquial,f.triceps)*6 + bulk * .7;
    const foreW  = 6.5 + Math.max(f.flexores, f.extensores)*4.5;
    let   pdR   = (idCorpo === "tunica_pano" ? 3.2 : 5.5)
                + ombrosComp * 4.5 + bulk * .9;

    const stCab   = estiloDe(equipado(s, "cabeca"));
    const idCab   = equipado(s, "cabeca");
    const stCalc  = estiloDe(equipado(s, "calcas"));
    const stBotas = estiloDe(equipado(s, "botas"));
    const stLuvas = estiloDe(equipado(s, "luvas"));
    const stArma  = estiloDe(equipado(s, "arma"));
    const idCapa  = equipado(s, "capa");
    const stCapa  = estiloDe(idCapa);

    const uid = "wg" + Math.random().toString(36).slice(2, 7);

    const rk = rankGuerreiro(s);
    const aura = rk.lvl > 0
      ? `<ellipse cx="${cx}" cy="88" rx="${42 + rk.lvl * 2.5}" ry="${68 + rk.lvl * 2}"
           fill="rgba(184,146,58,${(.05 + .03 * rk.lvl).toFixed(2)})"/>`
      : "";

    let capa = "";
    if (idCapa !== "capa_nenhuma" && stCapa) {
      const comp = stCapa.comp || 120;
      const larg = comp > 130 ? 21 : 17;
      const fundo = 40 + comp;
      const hem = stCapa.hem
        ? `<rect x="${cx - larg - 2}" y="${fundo - 4}" width="${(larg + 2) * 2}" height="3" fill="${stCapa.hem}"/>` : "";
      const pele = stCapa.pele
        ? `<path d="M ${cx - 15},44 Q ${cx},39 ${cx + 15},44 L ${cx + 16},52 Q ${cx},57 ${cx - 16},52 Z"
             fill="${stCapa.pele}" stroke="#8a744a"/>` : "";
      const orna = stCapa.ornamento
        ? `<circle cx="${cx}" cy="${(44 + fundo) / 2}" r="3" fill="#e0b34d" stroke="#241708"/>
           <line x1="${cx}" y1="${44 + comp * .25}" x2="${cx}" y2="${fundo - 6}"
                 stroke="#e0b34d" stroke-width=".8" opacity=".7"/>` : "";
      capa = `
        <path d="M ${cx - 15},45 Q ${cx},41 ${cx + 15},45
                 L ${cx + larg},${fundo} Q ${cx},${fundo + 6} ${cx - larg},${fundo} Z"
              fill="${stCapa.cor}" stroke="${stCapa.borda}" stroke-width="2"/>
        <line x1="${cx - 8}" y1="48" x2="${cx - larg + 4}" y2="${fundo - 6}"
              stroke="${stCapa.borda}" stroke-width="1" opacity=".5"/>
        <line x1="${cx + 8}" y1="48" x2="${cx + larg - 4}" y2="${fundo - 6}"
              stroke="${stCapa.borda}" stroke-width="1" opacity=".5"/>
        ${hem}${pele}${orna}`;
    }

    // pernas com glúteos e posteriores separados
    let pernas = "";
    const bH = stBotas.h || 17;
    const bExtra = stBotas.pesada ? 1.5 : 0;
    for (const side of [-1, 1]) {
      const lx = side < 0 ? cx - 4 - quadW : cx + 4;
      // glúteo como volume extra atrás
      const glute = `<ellipse cx="${lx + quadW/2}" cy="91" rx="${quadW*0.55}" ry="${gluteH}" fill="${stCalc.cor}" stroke="#171009" opacity="${0.35 + f.gluteos*0.45}"/>`;
      // coxa posterior (atrás) sutil faixa
      const post = `<rect x="${lx}" y="98" width="${quadW}" height="18" rx="2" fill="#2b1d0c" opacity="${0.18 + f.posteriorCoxa*0.32}" stroke="none"/>`;
      pernas += `
        ${glute}
        <rect x="${lx}" y="93" width="${quadW}" height="${126 - 93}" rx="2" fill="${stCalc.cor}" stroke="#171009"/>
        ${post}
        <rect x="${lx - 1 - bExtra}" y="${140 - bH}" width="${quadW + 2 + bExtra * 2}" height="${bH}" rx="2"
              fill="${stBotas.cor}" stroke="#171009"/>
        <rect x="${lx - 1 - bExtra}" y="${140 - bH}" width="${quadW + 2 + bExtra * 2}" height="3" fill="#ffffff" opacity=".12"/>
        ${stBotas.joelho ? `<circle cx="${lx + quadW / 2}" cy="${140 - bH}" r="2.4" fill="#c9ced6" stroke="#171009"/>` : ""}
        ${stBotas.tira ? `<rect x="${lx - 1 - bExtra}" y="${140 - bH + 5}" width="${quadW + 2 + bExtra * 2}" height="2.5" fill="#97814f"/>` : ""}`;
    }

    // trapézio como triângulo atrás do pescoço
    const trapezio = f.trap > 0.02 ? `
      <path d="M ${cx - trapW},38 Q ${cx},30 ${cx + trapW},38 L ${cx + trapW*0.7},44 Q ${cx},42 ${cx - trapW*0.7},44 Z"
            fill="${stCorpo.medio}" stroke="${stCorpo.escuro}" stroke-width="1" opacity="${0.45 + f.trap*0.45}"/>` : "";

    const torso = `
      ${trapezio}
      <path d="M ${cx - sh},40 Q ${cx},36 ${cx + sh},40
               L ${cx + waist + 2},91 L ${cx - waist - 2},91 Z"
            fill="url(#${uid}-m)" stroke="${stCorpo.escuro}" stroke-width="1.5"/>
      <!-- peitoral: duas metades com destaque por Anterior vs Peitoral -->
      <path d="M ${cx - sh * .62},53 Q ${cx - sh * .31},60 ${cx},54
               Q ${cx + sh * .31},60 ${cx + sh * .62},53"
            stroke="${stCorpo.escuro}" fill="none" stroke-width="1.6"
            opacity="${(.3 + f.torso * .6).toFixed(2)}"/>
      <!-- deltoide anterior como brilho frontal -->
      <ellipse cx="${cx - sh*0.72}" cy="46" rx="${2.2 + f.anterior*3}" ry="${3 + f.anterior*3.5}" fill="#ffffff" opacity="${0.06 + f.anterior*0.14}" stroke="none"/>
      <ellipse cx="${cx + sh*0.72}" cy="46" rx="${2.2 + f.anterior*3}" ry="${3 + f.anterior*3.5}" fill="#ffffff" opacity="${0.06 + f.anterior*0.14}" stroke="none"/>
      <path d="M ${cx},60 L ${cx},72 M ${cx - 5},64 L ${cx + 5},64 M ${cx - 4},70 L ${cx + 4},70"
            stroke="${stCorpo.escuro}" stroke-width="1.2" fill="none"
            opacity="${(.15 + f.core * .55).toFixed(2)}"/>
      <rect x="${cx - waist - 3}" y="85" width="${(waist + 3) * 2}" height="7"
            fill="#4a2f18" stroke="#241708"/>
      <rect x="${cx - 3.5}" y="85.5" width="7" height="6" fill="#c9a13b" stroke="#241708"/>
      ${stCorpo.malha ? `
      <g opacity=".35">
        ${[0,1,2,3].map(r => [0,1,2,3].map(c =>
          `<circle cx="${cx - waist + 4 + c * ((waist*2-8)/3)}" cy="${48 + r * 9}" r="1.3" fill="#171009"/>`).join("")).join("")}
      </g>` : ""}
      ${stCorpo.saia ? `
      <path d="M ${cx - waist - 3},91 L ${cx - waist - 7},106 L ${cx - 4},106 L ${cx - 3},92 Z"
            fill="${stCorpo.medio}" stroke="${stCorpo.escuro}" stroke-width="1"/>
      <path d="M ${cx + waist + 3},91 L ${cx + waist + 7},106 L ${cx + 4},106 L ${cx + 3},92 Z"
            fill="${stCorpo.medio}" stroke="${stCorpo.escuro}" stroke-width="1"/>` : ""}
      ${stCorpo.detalhe ? `
      <path d="M ${cx - sh * .75},42.5 Q ${cx},46.5 ${cx + sh * .75},42.5"
            fill="none" stroke="${stCorpo.detalhe}" stroke-width="1.4"/>
      <rect x="${cx - 2.4}" y="66" width="4.8" height="4.8"
            transform="rotate(45 ${cx} 68.4)" fill="${stCorpo.detalhe}" stroke="#171009" stroke-width=".6"/>` : ""}
      ${(function(){
          const stAcc = estiloDe(equipado(s, "acessorio"));
          if (!stAcc) return "";
          if (equipado(s, "acessorio") === "amuleto_ouro")
            return `<path d="M ${cx - 7},49 Q ${cx},56 ${cx + 7},49" fill="none" stroke="${stAcc.cordao}" stroke-width="1"/>
                    <circle cx="${cx}" cy="57.5" r="2.6" fill="${stAcc.cordao}" stroke="#241708"/>
                    <circle cx="${cx}" cy="57.5" r="1" fill="${stAcc.pedra}"/>`;
          return `<path d="M ${cx - 6},48 Q ${cx},53 ${cx + 6},48" fill="none" stroke="${stAcc.cordao}" stroke-width="1.2"/>`;
        })()}`;

    // braços com antebraço segmentado
    let bracos = "";
    for (const side of [-1, 1]) {
      const px = cx + side * (sh - 2);
      const biR = 3 + f.biceps*2.2;
      const triExtra = f.triceps*1.6;
      const braExtra = f.braquial*1.2;
      // antebraço flexores vs extensores como dois semi-retângulos
      const flexW = foreW * (0.55 + f.flexores*0.22);
      const extW = foreW * (0.45 + f.extensores*0.22);
      bracos += `
        <g transform="rotate(${side * 9} ${px} 47)">
          <!-- bíceps / tríceps volume -->
          <rect x="${px - upperW / 2}" y="44" width="${upperW}" height="30" rx="${upperW / 2}"
                fill="${stCorpo.medio}" stroke="#171009"/>
          <!-- destaque braquial -->
          <ellipse cx="${px}" cy="58" rx="${biR + braExtra}" ry="${5 + f.braquial*3}" fill="#ffffff" opacity="${0.07 + f.braquial*0.12}" stroke="none"/>
          <!-- tríceps posterior -->
          <rect x="${px - upperW/2 + (side<0? upperW*0.15:0)}" y="46" width="${upperW*0.28 + triExtra}" height="26" rx="2" fill="#000" opacity="${0.10 + f.triceps*0.18}"/>
          <!-- antebraço dividido -->
          <rect x="${px - foreW / 2}" y="70" width="${flexW}" height="16" rx="2"
                fill="#4a2f18" stroke="#171009"/>
          <rect x="${px - foreW/2 + flexW}" y="70" width="${extW}" height="16" rx="2"
                fill="#5c3a20" stroke="#171009" opacity="${0.85 + f.extensores*0.15}"/>
          <circle cx="${px}" cy="89" r="3.2" fill="${stLuvas.cor}" stroke="#171009"/>
        </g>
        <!-- deltoide lateral pauldrons (crescem com lateral) -->
        <circle cx="${px}" cy="46" r="${pdR}" fill="${stCorpo.claro}" stroke="#171009" stroke-width="1.4"/>
        <circle cx="${px}" cy="46" r="${pdR * .45}" fill="none" stroke="${stCorpo.escuro}" opacity=".6"/>
        <!-- deltoide posterior brilho traseiro -->
        <ellipse cx="${px}" cy="47" rx="${2 + f.posterior*2.5}" ry="${2.2 + f.posterior*2.8}" fill="#ffffff" opacity="${f.posterior*0.12}" />`;
    }

    let cabeca = `
      <rect x="${cx - 3}" y="31" width="6" height="7" fill="#b98d63" stroke="#171009"/>
      <circle cx="${cx}" cy="25" r="8.5" fill="#c79b6f" stroke="#171009"/>`;

    if (idCab === "capuz_couro") {
      capuz = `
        <path d="M ${cx - 11},27 Q ${cx - 12},13 ${cx},12 Q ${cx + 12},13 ${cx + 11},27
                 L ${cx + 10},33 Q ${cx},29 ${cx - 10},33 Z"
              fill="${stCab.cor}" stroke="#171009"/>
        <ellipse cx="${cx}" cy="25" rx="5.5" ry="4.5" fill="${stCab.sombra}"/>
        <circle cx="${cx - 2.5}" cy="24" r=".9" fill="#000"/>
        <circle cx="${cx + 2.5}" cy="24" r=".9" fill="#000"/>`;
      cabeca += capuz;

    } else if (idCab === "coroa_conquista") {
      cabeca += `
        <path d="M ${cx - 9},24 L ${cx - 9},15 L ${cx - 4.5},18.5 L ${cx},13
                 L ${cx + 4.5},18.5 L ${cx + 9},15 L ${cx + 9},24 Z"
              fill="${stCab.ouro}" stroke="${stCab.escuro}" stroke-width="1"/>
        <circle cx="${cx}" cy="20.5" r="1.4" fill="#c0392b" stroke="${stCab.escuro}" stroke-width=".5"/>`;

    } else if (idCab === "elmo_chifres") {
      cabeca += `
        <path d="M ${cx - 10},25 A 10 10 0 0 1 ${cx + 10},25 L ${cx + 10},29
                 L ${cx - 10},29 Z" fill="${stCab.metal}" stroke="${stCab.escuro}" stroke-width="1.2"/>
        <rect x="${cx - 1}" y="26" width="2" height="6" fill="${stCab.metal}" stroke="${stCab.escuro}" stroke-width=".6"/>
        <path d="M ${cx - 9},19 Q ${cx - 16},16 ${cx - 17},8 Q ${cx - 11},12 ${cx - 7},16 Z"
              fill="${stCab.chifre}" stroke="#171009"/>
        <path d="M ${cx + 9},19 Q ${cx + 16},16 ${cx + 17},8 Q ${cx + 11},12 ${cx + 7},16 Z"
              fill="${stCab.chifre}" stroke="#171009"/>`;

    } else if (idCab === "elmo_fechado") {
      cabeca += `
        <path d="M ${cx - 10},26 A 10 10 0 0 1 ${cx + 10},26 L ${cx + 10},32
                 L ${cx - 10},32 Z" fill="${stCab.metal}" stroke="${stCab.escuro}" stroke-width="1.2"/>
        <rect x="${cx - 10}" y="24.5" width="20" height="4" rx="1" fill="${stCab.visor}" stroke="${stCab.escuro}" stroke-width=".8"/>
        <line x1="${cx - 6}" y1="26.5" x2="${cx + 6}" y2="26.5" stroke="#e8cd85" stroke-width=".8" opacity=".8"/>
        <rect x="${cx - 1}" y="30" width="2" height="4" fill="${stCab.visor}"/>
        <circle cx="${cx - 4}" cy="31.5" r=".7" fill="#171009"/>
        <circle cx="${cx}" cy="31.5" r=".7" fill="#171009"/>
        <circle cx="${cx + 4}" cy="31.5" r=".7" fill="#171009"/>`;

    } else if (idCab === "elmo_cavaleiro") {
      cabeca += `
        <path d="M ${cx - 10},26 A 10 10 0 0 1 ${cx + 10},26 L ${cx + 10},33
                 L ${cx - 10},33 Z" fill="${stCab.metal}" stroke="${stCab.escuro}" stroke-width="1.2"/>
        <path d="M ${cx - 10},20 Q ${cx},14 ${cx + 10},20 L ${cx + 10},24 L ${cx - 10},24 Z"
              fill="${stCab.detalhe}" stroke="${stCab.escuro}" stroke-width=".9"/>
        <rect x="${cx - 10.5}" y="23.5" width="21" height="2.4" fill="${stCab.metal}" stroke="${stCab.escuro}" stroke-width=".8"/>
        <line x1="${cx - 5}" y1="28" x2="${cx + 5}" y2="28" stroke="#171009" stroke-width="1.6"/>
        <path d="M ${cx - 10},22 Q ${cx - 18},14 ${cx - 14},6 Q ${cx - 8},12 ${cx - 9},20 Z"
              fill="${stCab.asa}" stroke="${stCab.escuro}" stroke-width=".8"/>
        <path d="M ${cx + 10},22 Q ${cx + 18},14 ${cx + 14},6 Q ${cx + 8},12 ${cx + 9},20 Z"
              fill="${stCab.asa}" stroke="${stCab.escuro}" stroke-width=".8"/>`;

    } else {
      cabeca += `
        <path d="M ${cx - 10},25 A 10 10 0 0 1 ${cx + 10},25 L ${cx + 10},29
                 L ${cx - 10},29 Z" fill="${stCab.metal}" stroke="${stCab.escuro}" stroke-width="1.2"/>
        <rect x="${cx - 1}" y="26" width="2" height="7" fill="${stCab.metal}" stroke="${stCab.escuro}" stroke-width=".6"/>
        <path d="M ${cx - 10},25 L ${cx},17 L ${cx + 10},25" fill="none"
              stroke="${stCab.escuro}" stroke-width="1.4"/>`;
    }

    const sx = cx + sh + upperW + 9;
    let arma = "";
    const tipoArma = stArma.tipo || "espada";

    if (tipoArma === "machado") {
      arma = `
        <g transform="rotate(8 ${sx} 60)">
          <rect x="${sx - 1.4}" y="34" width="2.8" height="58" rx="1" fill="${stArma.cabo}" stroke="#171009"/>
          <path d="M ${sx - 1.4},36 Q ${sx - 12},38 ${sx - 11},52 Q ${sx - 5},48 ${sx - 1.4},50 Z"
                fill="${stArma.metal}" stroke="#171009"/>
          <path d="M ${sx + 1.4},36 Q ${sx + 12},38 ${sx + 11},52 Q ${sx + 5},48 ${sx + 1.4},50 Z"
                fill="${stArma.corte}" stroke="#171009"/>
          <rect x="${sx - 3}" y="50" width="6" height="2.5" fill="${stArma.metal}" stroke="#171009"/>
        </g>`;

    } else if (tipoArma === "martelo") {
      arma = `
        <g transform="rotate(5 ${sx} 60)">
          <rect x="${sx - 1.6}" y="36" width="3.2" height="56" rx="1" fill="${stArma.cabo}" stroke="#171009"/>
          <rect x="${sx - 8}" y="24" width="16" height="13" rx="2"
                fill="${stArma.metal}" stroke="#171009" stroke-width="1.1"/>
          <rect x="${sx - 8}" y="27" width="16" height="2.4" fill="#ffffff" opacity=".18"/>
          <rect x="${sx - 2}" y="35" width="4" height="3" fill="${stArma.metal}" stroke="#171009"/>
        </g>`;

    } else if (tipoArma === "lanca") {
      arma = `
        <g transform="rotate(4 ${sx} 60)">
          <line x1="${sx}" y1="104" x2="${sx}" y2="16" stroke="${stArma.cabo}" stroke-width="2.6"/>
          <line x1="${sx - .8}" y1="104" x2="${sx - .8}" y2="16" stroke="#171009" stroke-width=".5" opacity=".6"/>
          <path d="M ${sx - 3.4},18 L ${sx},6 L ${sx + 3.4},18 Q ${sx},14 ${sx - 3.4},18 Z"
                fill="${stArma.ponta}" stroke="#4a4e55"/>
          <rect x="${sx - 4.5}" y="20" width="9" height="2.4" rx="1" fill="#97814f" stroke="#171009"/>
        </g>`;

    } else {
      const ehEspadao = tipoArma === "espadao";
      const bW = ehEspadao ? 5 : 3.2;
      const bH = ehEspadao ? 58 : 49;
      const gW = ehEspadao ? 18 : 14;
      arma = `
        <g transform="rotate(${ehEspadao ? 3 : 6} ${sx} 60)">
          <rect x="${sx - bW / 2}" y="${92 - bH}" width="${bW}" height="${bH}"
                fill="${stArma.lamina}" stroke="#4a4e55" stroke-width=".7"/>
          <path d="M ${sx - bW / 2},${92 - bH} L ${sx},${85 - bH} L ${sx + bW / 2},${92 - bH} Z"
                fill="${stArma.lamina}" stroke="#4a4e55" stroke-width=".7"/>
          ${stArma.brilho ? `<line x1="${sx - .5}" y1="${96 - bH}" x2="${sx - .5}" y2="72"
               stroke="#ffffff" stroke-width=".8" opacity=".65"/>` : ""}
          ${ehEspadao ? `<line x1="${sx}" y1="${90 - bH}" x2="${sx}" y2="86" stroke="#4a4e55" stroke-width="1"/>` : ""}
          <rect x="${sx - gW / 2}" y="80" width="${gW}" height="4" rx="1"
                fill="${stArma.guarda}" stroke="#241708"/>
          <rect x="${sx - 2.2}" y="84" width="4.4" height="10" rx="1.5"
                fill="${stArma.punho}" stroke="#171009"/>
          <circle cx="${sx}" cy="97" r="3" fill="${stArma.guarda}" stroke="#241708"/>
        </g>`;
    }

    return `
    <svg class="warrior-svg" viewBox="0 0 120 170" role="img"
         aria-label="Guerreiro do personagem" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${uid}-m" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${stCorpo.claro}"/>
          <stop offset="1" stop-color="${stCorpo.medio}"/>
        </linearGradient>
      </defs>
      ${aura}
      ${capa}
      ${pernas}
      ${torso}
      ${bracos}
      ${cabeca}
      ${arma}
    </svg>`;
  }

  /* ---- mapa de músculos: pips por nível + % — legível e temático --- */
  function mapaHTML(s) {
    const gs = gruposMacroPontos(s).map(g => {
      const pct = Math.min(100, Math.round(g.pontos / CAP_PONTOS * 100));
      return { ...g, pct, lvl: nivelDePontos(g.pontos) };
    });
    const maxPt = Math.max(...gs.map(g => g.pontos), 1);
    const det = mapaDetalhado(s);
    const detMap = Object.fromEntries(det.map(d=>[d.nome,d]));

    const heat = (...nomes) => {
      const pts = nomes.reduce((n, nome) => {
        if (nome.includes(",")) {
          // multi fallback
          return Math.max(n, ...nome.split(",").map(x=> detMap[x.trim()]?.vol||0));
        }
        const g = gs.find(x => x.nome === nome);
        if (g) return Math.max(n, g.pontos);
        const d = detMap[nome];
        return Math.max(n, d ? d.vol : 0);
      }, 0);
      const r = pts / maxPt;
      return `rgba(${Math.round(184 + 12 * r)},${Math.round(146 - 88 * r)},${Math.round(58 - 16 * r)},${(r > 0 ? .3 + .7 * r : .08).toFixed(2)})`;
    };
    // calor fino por músculo individual (para silhueta detalhada)
    const heatFine = (nome) => {
      const d = detMap[nome];
      if (!d) return heat(nome);
      const maxVol = Math.max(...det.map(x=>x.vol),1);
      const r = d.vol / maxVol;
      return `rgba(${Math.round(184 + 12 * r)},${Math.round(146 - 88 * r)},${Math.round(58 - 16 * r)},${(r > 0 ? .35 + .6 * r : .08).toFixed(2)})`;
    };

    const silhuetaFrente = `
      <svg class="mapa-silhueta" viewBox="0 0 100 170" aria-hidden="true">
        <g stroke="#171009" stroke-width=".9">
          <!-- base corporal sutil para unificar silhueta -->
          <path d="M33,29 L36,32 L38,33 L39,47 L26,49 L22,60 L24,80 L27,84 L38,84 L40,86 L48,86 L48,127 L44,137 L44,148 L49,148 L51,148 L56,148 L56,137 L52,127 L52,86 L62,84 L73,84 L76,80 L78,60 L74,49 L61,47 L62,33 L64,32 L67,29 Q50,22 33,29 Z" fill="#b98d63" opacity="0.14" stroke="none"/>
          <circle cx="50" cy="13" r="8" fill="#c79b6f"/>
          <rect x="46" y="21" width="8" height="6" fill="#b98d63"/>
          <!-- trapézio integrado ao pescoço/ombros -->
          <path d="M41,26 L46,27.5 L50,24 L54,27.5 L59,26 L64,31 L61,36 L50,30 L39,36 L36,31 Z" fill="${heatFine("Trapézio")}"/>
          <!-- peitoral com separação central realista -->
          <path d="M38.2,33.5 L49.2,33.5 L49.2,47.5 Q43.5,52 38.2,47.8 Z" fill="${heatFine("Peitoral")}"/>
          <path d="M50.8,33.5 L61.8,33.5 L61.8,47.8 Q56.5,52 50.8,47.5 Z" fill="${heatFine("Peitoral")}"/>
          <path d="M49.5,34 L50.5,34 L50.5,48 L49.5,48 Z" fill="#171009" opacity="0.22"/>
          <!-- deltoides: lateral (ombro largo) + anterior (frente) contíguos ao peitoral -->
          <ellipse cx="31.5" cy="38.5" rx="8" ry="7.2" fill="${heatFine("Deltoide Lateral")}"/>
          <ellipse cx="68.5" cy="38.5" rx="8" ry="7.2" fill="${heatFine("Deltoide Lateral")}"/>
          <ellipse cx="31.8" cy="43.2" rx="4.6" ry="4.2" fill="${heatFine("Deltoide Anterior")}" stroke="#171009" stroke-width="0.6"/>
          <ellipse cx="68.2" cy="43.2" rx="4.6" ry="4.2" fill="${heatFine("Deltoide Anterior")}" stroke="#171009" stroke-width="0.6"/>
          <!-- braços: bíceps (frente) e braquial interno, tríceps fica atrás então sutil na frente -->
          <path d="M23.8,46.5 L29.2,46.5 Q31,51 29.2,56 Q26.5,60 23.2,56 Q21.5,51 23.8,46.5 Z" fill="${heatFine("Bíceps")}"/>
          <path d="M70.8,46.5 L76.2,46.5 Q78,51 76.2,56 Q73.5,60 70.2,56 Q68.5,51 70.8,46.5 Z" fill="${heatFine("Bíceps")}"/>
          <ellipse cx="26.8" cy="54.5" rx="2.6" ry="3.8" fill="${heatFine("Braquial")}" />
          <ellipse cx="73.2" cy="54.5" rx="2.6" ry="3.8" fill="${heatFine("Braquial")}" />
          <!-- antebraço: flexores (volar) + extensores (dorsal) lado a lado sem vão -->
          <g>
            <path d="M22.2,60.5 L28.0,60.5 L27.2,80.2 L22.8,80.2 Z" fill="${heatFine("Flexores do Antebraço")}"/>
            <path d="M28.0,60.5 L30.6,60.5 L29.8,80.2 L27.2,80.2 Z" fill="${heatFine("Extensores do Antebraço")}"/>
          </g>
          <g>
            <path d="M69.4,60.5 L71.9,60.5 L72.8,80.2 L71.9,80.2 L69.4,60.5 Z" fill="${heatFine("Extensores do Antebraço")}"/>
            <path d="M71.9,60.5 L77.8,60.5 L77.2,80.2 L72.8,80.2 Z" fill="${heatFine("Flexores do Antebraço")}"/>
          </g>
          <circle cx="26.5" cy="83.6" r="2.7" fill="#c79b6f"/>
          <circle cx="73.5" cy="83.6" r="2.7" fill="#c79b6f"/>
          <!-- abdômen em blocos 3x2 com separação realista -->
          <g>
            <rect x="41.2" y="60.5" width="7.8" height="6.2" rx="1.4" fill="${heatFine("Abdômen")}"/>
            <rect x="51" y="60.5" width="7.8" height="6.2" rx="1.4" fill="${heatFine("Abdômen")}"/>
            <rect x="41.2" y="67.8" width="7.8" height="6.2" rx="1.4" fill="${heatFine("Abdômen")}"/>
            <rect x="51" y="67.8" width="7.8" height="6.2" rx="1.4" fill="${heatFine("Abdômen")}"/>
            <rect x="42.2" y="75.2" width="7" height="6" rx="1.3" fill="${heatFine("Abdômen")}"/>
            <rect x="50.8" y="75.2" width="7" height="6" rx="1.3" fill="${heatFine("Abdômen")}"/>
            <line x1="50" y1="60.5" x2="50" y2="81.5" stroke="#171009" stroke-width="0.7" opacity="0.9"/>
          </g>
          <!-- pernas: quadríceps frontal com separação vasto -->
          <path d="M39.2,86.5 L49.3,86.5 L48.2,127 L40.2,127 Z" fill="${heatFine("Quadríceps")}"/>
          <path d="M50.7,86.5 L60.8,86.5 L59.8,127 L51.8,127 Z" fill="${heatFine("Quadríceps")}"/>
          <path d="M44,86.5 L45,86.5 L44.2,127 L43.2,127 Z" fill="#171009" opacity="0.18"/>
          <path d="M55,86.5 L56,86.5 L55.2,127 L54.2,127 Z" fill="#171009" opacity="0.18"/>
          <!-- panturrilha integrada à perna -->
          <ellipse cx="44.6" cy="137" rx="5.6" ry="10.8" fill="${heatFine("Panturrilha")}"/>
          <ellipse cx="55.4" cy="137" rx="5.6" ry="10.8" fill="${heatFine("Panturrilha")}"/>
          <rect x="39" y="148" width="10" height="5.5" rx="1.5" fill="#33200f"/>
          <rect x="51" y="148" width="10" height="5.5" rx="1.5" fill="#33200f"/>
        </g>
      </svg>`;

    const silhuetaCostas = `
      <svg class="mapa-silhueta" viewBox="0 0 100 170" aria-hidden="true">
        <g stroke="#171009" stroke-width=".9">
          <path d="M33,29 L36,32 L38,33 L39,47 L26,52 L22,62 L24,80 L27,84 L38,84 L40,86 L48,86 L48,127 L44,143 L44,153 L49,153 L51,153 L56,153 L56,143 L52,127 L52,86 L62,84 L73,84 L76,80 L78,62 L74,52 L61,47 L62,33 L64,32 L67,29 Q50,22 33,29 Z" fill="#a87e56" opacity="0.12" stroke="none"/>
          <circle cx="50" cy="13" r="8" fill="#b98d63"/>
          <rect x="46" y="21" width="8" height="6" fill="#a87e56"/>
          <!-- trapézio em diamante superior integrado -->
          <path d="M41,26 L46,27.5 L50,22 L54,27.5 L59,26 L63.5,32 L50,38 L36.5,32 Z" fill="${heatFine("Trapézio")}"/>
          <!-- deltoide posterior como capa do ombro -->
          <ellipse cx="31.5" cy="39.2" rx="8.2" ry="7.5" fill="${heatFine("Deltoide Posterior")}"/>
          <ellipse cx="68.5" cy="39.2" rx="8.2" ry="7.5" fill="${heatFine("Deltoide Posterior")}"/>
          <!-- dorsais em asas largas conectadas à coluna -->
          <path d="M37.2,36.5 L46.8,36.5 L45.2,70 L40.5,65 L37.2,55 Z" fill="${heatFine("Dorsais")}"/>
          <path d="M62.8,36.5 L53.2,36.5 L54.8,70 L59.5,65 L62.8,55 Z" fill="${heatFine("Dorsais")}"/>
          <line x1="50" y1="33" x2="50" y2="78" stroke="#171009" stroke-width="1.5"/>
          <!-- tríceps posterior do braço -->
          <ellipse cx="26.5" cy="53" rx="5.4" ry="8.5" fill="${heatFine("Tríceps")}"/>
          <ellipse cx="73.5" cy="53" rx="5.4" ry="8.5" fill="${heatFine("Tríceps")}"/>
          <!-- antebraço extensores (dominante atrás) + flexores lateral -->
          <g>
            <path d="M22.2,61.5 L28.5,61.5 L27.8,80.5 L22.6,80.5 Z" fill="${heatFine("Extensores do Antebraço")}"/>
            <path d="M28.5,61.5 L30.6,61.5 L29.9,80.5 L27.8,80.5 Z" fill="${heatFine("Flexores do Antebraço")}" opacity="0.9"/>
          </g>
          <g>
            <path d="M71.5,61.5 L77.8,61.5 L77.4,80.5 L71.5,80.5 Z" fill="${heatFine("Extensores do Antebraço")}"/>
            <path d="M69.4,61.5 L71.5,61.5 L71.5,80.5 L69.8,80.5 Z" fill="${heatFine("Flexores do Antebraço")}" opacity="0.9"/>
          </g>
          <circle cx="26.5" cy="84.2" r="2.7" fill="#c79b6f"/>
          <circle cx="73.5" cy="84.2" r="2.7" fill="#c79b6f"/>
          <!-- lombar paravertebral -->
          <rect x="42.5" y="71" width="15" height="10.5" rx="2" fill="${heatFine("Lombar")}"/>
          <line x1="50" y1="71" x2="50" y2="81.5" stroke="#171009" stroke-width="0.6" opacity="0.7"/>
          <!-- glúteos com forma arredondada e separação central -->
          <path d="M39.2,83.5 Q39.2,82 41,82 L48.5,82 Q49.5,82 49.5,84 L49.5,94 Q49.5,98 44.5,98 Q39.2,98 39.2,94 Z" fill="${heatFine("Glúteos")}"/>
          <path d="M50.5,82 Q50.5,82 51.5,82 L59,82 Q60.8,82 60.8,83.5 L60.8,94 Q60.8,98 55.5,98 Q50.5,98 50.5,94 Z" fill="${heatFine("Glúteos")}"/>
          <line x1="50" y1="82" x2="50" y2="98" stroke="#171009" stroke-width="0.7" opacity="0.9"/>
          <!-- posteriores coxa posterior -->
          <path d="M40.2,99 L49.2,99 L48.2,132.5 L40.8,132.5 Z" fill="${heatFine("Posterior")}"/>
          <path d="M50.8,99 L59.8,99 L59.2,132.5 L51.8,132.5 Z" fill="${heatFine("Posterior")}"/>
          <line x1="50" y1="99" x2="50" y2="132.5" stroke="#171009" stroke-width="0.6" opacity="0.8"/>
          <!-- panturrilha posterior em gota -->
          <ellipse cx="44.6" cy="143" rx="5.6" ry="10.2" fill="${heatFine("Panturrilha")}"/>
          <ellipse cx="55.4" cy="143" rx="5.6" ry="10.2" fill="${heatFine("Panturrilha")}"/>
          <rect x="39" y="153" width="10" height="5.5" rx="1.5" fill="#33200f"/>
          <rect x="51" y="153" width="10" height="5.5" rx="1.5" fill="#33200f"/>
        </g>
      </svg>`;

    const silhueta = `
      <div class="mapa-views">
        <div class="mapa-view">${silhuetaFrente}<span>Frente</span></div>
        <div class="mapa-view">${silhuetaCostas}<span>Costas</span></div>
      </div>`;

    const pips = lvl => {
      let out = "";
      for (let i = 1; i <= 4; i++)
        out += `<span class="pip${i <= lvl ? " on lv" + i : ""}">◆</span>`;
      return out;
    };

    // macro bars
    const linhasMacro = gs.map(g => {
      const nv = NIVEIS_MUSCULARES[g.lvl];
      return `
      <div class="gm">
        <div class="gm-top">
          <span class="gm-nome">${g.nome}</span>
          <span class="gm-pips" title="${nv.nome}">${pips(g.lvl)}</span>
          <span class="gm-pct">${g.pct}%</span>
        </div>
        <div class="gm-bar"><div class="lv${g.lvl}" style="width:${g.pct}%"></div></div>
      </div>`;
    }).join("");

    // detalhado expandível
    const linhasDetalhe = DETALHE_MAPA.map(grp => {
      const grpPct = gs.find(x=>x.nome===grp.grupo)?.pct || 0;
      const inner = grp.itens.map(nome => {
        const m = detMap[nome];
        const nv = NIVEIS_MUSCULARES[m.lvl];
        return `
          <div class="gm sub">
            <div class="gm-top">
              <span class="gm-nome sub">${nome}</span>
              <span class="gm-pips small" title="${nv.nome}">${pips(m.lvl)}</span>
              <span class="gm-pct small">${m.pct}%</span>
            </div>
            <div class="gm-bar small"><div class="lv${m.lvl}" style="width:${m.pct}%"></div></div>
          </div>`;
      }).join("");
      return `
        <div class="gm-grupo">
          <div class="gm-grupo-title">${grp.grupo} <span class="gm-grupo-pct">${grpPct}%</span></div>
          ${inner}
        </div>`;
    }).join("");

    return `
      <div class="mapa-wrap">
        ${silhueta}
        <div class="mapa-bars">${linhasMacro}</div>
      </div>
      <p class="mapa-legend">◆ I Iniciante · II Desenvolvido · III Avançado · IV Elite</p>
      <details class="mapa-detalhe" style="margin-top:.8rem;">
        <summary style="cursor:pointer;font-family:var(--font-title);color:var(--gold);font-size:.82rem;letter-spacing:.06em;">▸ Ver músculos individuais</summary>
        <div style="margin-top:.6rem;display:flex;flex-direction:column;gap:.6rem;">${linhasDetalhe}</div>
      </details>`;
  }

  function balancoHTML(s) {
    const rows = balanco(s)
      .slice()
      .sort((a, b) => b.share - a.share)
      .map(g => `
        <div class="mrow">
          <span class="mlabel">${g.nome}</span>
          <div class="mbar"><div style="width:${g.share}%"></div></div>
          <span class="mpct">${g.share}%</span>
        </div>`).join("");
    return `<div class="mapa-bars">${rows}</div>`;
  }

  return { svg, mapaHTML, balancoHTML, mapaPct, mapaDetalhado, balanco,
           rankGuerreiro, gruposMacroPontos, nivelDePontos, calcMusculos,
           fatores, NIVEIS_MUSCULARES, DETALHE_MAPA, COSMETICOS, SLOTS, PADRAO,
           RARIDADES, porId, estiloDe, possui, statusItem, reqTexto };
})();
