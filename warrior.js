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
    // ids de versões antigas que não existem mais caem no padrão do slot
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
    return requisitoAtendido(s, c.origem); // recompensas são derivadas do progresso
  }

  /* estado de um item na loja/inventário */
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

  /* ---- agrupamento em 6 grandes grupos + níveis de treino ----
     série em exercício principal vale 1 ponto; secundário, 0.5     */
  function calcMusculos(s) {
    const vol = {};
    for (const t of s.treinos) {
      const ex = State.exercicioPorId(t.exercicioId);
      if (!ex) continue;
      const n = t.series.length;
      for (const m of ex.principal) vol[m] = (vol[m] || 0) + n;
      for (const m of ex.secundarios) vol[m] = (vol[m] || 0) + n * 0.5;
    }
    return vol;
  }

  const pctDe = vol => Math.min(100, Math.round((vol || 0) / CAP_PONTOS * 100));

  /* ---- agrupamento em 6 grandes grupos + níveis de treino ----
     Nível muscular (pontos = séries-equivalentes, teto 50):
       0 Não treinado · I Iniciante · II Desenvolvido ·
       III Avançado · IV Elite                                    */
  const MACRO = [
    { nome: "Peito",  musculos: ["Peitoral"] },
    { nome: "Costas", musculos: ["Costas"] },
    { nome: "Ombros", musculos: ["Ombros"] },
    { nome: "Braços", musculos: ["Bíceps", "Tríceps", "Antebraço"] },
    { nome: "Pernas", musculos: ["Quadríceps", "Posterior", "Glúteos", "Panturrilha"] },
    { nome: "Core",   musculos: ["Core"] }
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

  /* pontos por grupo macro */
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

  /* fatia % de cada grupo macro no volume total (soma = 100) */
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

  /* percentual (0–100) por grupo muscular fino (mantido p/ compatibilidade) */
  function mapaPct(s) {
    const v = calcMusculos(s);
    return {
      "Peitoral":    pctDe(v["Peitoral"]),
      "Costas":      pctDe(v["Costas"]),
      "Ombros":      pctDe(v["Ombros"]),
      "Bíceps":      pctDe(v["Bíceps"]),
      "Tríceps":     pctDe(v["Tríceps"]),
      "Quadríceps":  pctDe(v["Quadríceps"]),
      "Posterior":   pctDe(v["Posterior"]),
      "Glúteos":     pctDe(v["Glúteos"]),
      "Core":        pctDe(v["Core"]),
      "Panturrilha": pctDe(v["Panturrilha"])
    };
  }

  /* ---- mapa RELATIVO ao total treinado ----
     Cada grupo recebe sua fatia do volume total (soma = 100%).
     A cor acompanha a proporção: o grupo mais treinado fica no
     vermelho intenso; os demais, proporcionais a ele (escala de
     calor dourado -> vermelho). Ex.: só tríceps+ombros+peito
     treinados => cada um ~33%, todos em tom avermelhado forte. */
  function mapaRelativo(s) {
    const v = calcMusculos(s);
    const grupos = [
      "Peitoral", "Costas", "Ombros", "Bíceps", "Tríceps",
      "Quadríceps", "Posterior", "Glúteos", "Core", "Panturrilha"
    ];
    const total = grupos.reduce((n, g) => n + (v[g] || 0), 0);
    const res = grupos.map(g => ({
      nome: g,
      vol: v[g] || 0,
      share: total > 0 ? (v[g] || 0) / total * 100 : 0
    }));
    if (total > 0) {
      // arredonda e fecha a soma exata em 100%, ajustando o maior grupo
      for (const g of res) g.share = Math.round(g.share);
      const maior = res.reduce((a, b) => (b.share > a.share ? b : a), res[0]);
      maior.share += 100 - res.reduce((n, g) => n + g.share, 0);
    }
    return res;
  }

  /* escala de calor: ratio 0 = dourado apagado, 1 = vermelho intenso */
  function calor(ratio, alpha) {
    const r = Math.round(184 + (196 - 184) * ratio);   // 184 -> 196
    const g = Math.round(146 + (58 - 146) * ratio);    // 146 -> 58
    const b = Math.round(58 + (42 - 58) * ratio);      // 58 -> 42
    return `rgba(${r},${g},${b},${alpha})`;
  }

  /* fatores corporais 0–1 usados para dimensionar o desenho */
  function fatores(p) {
    const f = x => Math.min(1, (x || 0) / 100);
    return {
      torso:  f(Math.max(p["Peitoral"], p["Costas"])),
      ombros: f(p["Ombros"]),
      bracos: f(Math.max(p["Bíceps"], p["Tríceps"])),
      pernas: f(Math.max(p["Quadríceps"], p["Posterior"], p["Glúteos"], p["Panturrilha"])),
      core:   f(p["Core"])
    };
  }

  /* ---- desenho do guerreiro (SVG em camadas) ---- */
  function svg(s, opts = {}) {
    // prévia da Forja: opts.equipamento sobrepõe temporariamente os slots
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

    const sh    = 17 + f.ombros * 9 + bulk * 1.6;   // ombros alargam com armadura
    const waist = 11 + f.core * 4 + bulk * .8;      // cintura também engrossa
    const legW  = 9 + f.pernas * 7;
    const armW  = 8 + f.bracos * 6 + bulk * .7;     // braços mais volumosos
    let   pdR   = (idCorpo === "tunica_pano" ? 3.2 : 5.5)
                + f.ombros * 4.5 + bulk * .9;       // pauldrons crescem com o bulk

    const stCab   = estiloDe(equipado(s, "cabeca"));
    const idCab   = equipado(s, "cabeca");
    const stCalc  = estiloDe(equipado(s, "calcas"));
    const stBotas = estiloDe(equipado(s, "botas"));
    const stLuvas = estiloDe(equipado(s, "luvas"));
    const stArma  = estiloDe(equipado(s, "arma"));
    const idCapa  = equipado(s, "capa");
    const stCapa  = estiloDe(idCapa);

    const uid = "wg" + Math.random().toString(36).slice(2, 7);

    // aura discreta que cresce com o nível muscular geral
    const rk = rankGuerreiro(s);
    const aura = rk.lvl > 0
      ? `<ellipse cx="${cx}" cy="88" rx="${42 + rk.lvl * 2.5}" ry="${68 + rk.lvl * 2}"
           fill="rgba(184,146,58,${(.05 + .03 * rk.lvl).toFixed(2)})"/>`
      : "";

    // camada: capa (atrás de tudo; ausente se "Sem Capa")
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

    // camada: pernas + grevas
    let pernas = "";
    const bH = stBotas.h || 17;
    const bExtra = stBotas.pesada ? 1.5 : 0;
    for (const side of [-1, 1]) {
      const lx = side < 0 ? cx - 4 - legW : cx + 4;
      pernas += `
        <rect x="${lx}" y="93" width="${legW}" height="${126 - 93}" rx="2" fill="${stCalc.cor}" stroke="#171009"/>
        <rect x="${lx - 1 - bExtra}" y="${140 - bH}" width="${legW + 2 + bExtra * 2}" height="${bH}" rx="2"
              fill="${stBotas.cor}" stroke="#171009"/>
        <rect x="${lx - 1 - bExtra}" y="${140 - bH}" width="${legW + 2 + bExtra * 2}" height="3" fill="#ffffff" opacity=".12"/>
        ${stBotas.joelho ? `<circle cx="${lx + legW / 2}" cy="${140 - bH}" r="2.4" fill="#c9ced6" stroke="#171009"/>` : ""}
        ${stBotas.tira ? `<rect x="${lx - 1 - bExtra}" y="${140 - bH + 5}" width="${legW + 2 + bExtra * 2}" height="2.5" fill="#97814f"/>` : ""}`;
    }

    // camada: torso (largura por peito/costas, cintura por core)
    const torso = `
      <path d="M ${cx - sh},40 Q ${cx},36 ${cx + sh},40
               L ${cx + waist + 2},91 L ${cx - waist - 2},91 Z"
            fill="url(#${uid}-m)" stroke="${stCorpo.escuro}" stroke-width="1.5"/>
      <path d="M ${cx - sh * .62},53 Q ${cx - sh * .31},60 ${cx},54
               Q ${cx + sh * .31},60 ${cx + sh * .62},53"
            stroke="${stCorpo.escuro}" fill="none" stroke-width="1.6"
            opacity="${(.3 + f.torso * .6).toFixed(2)}"/>
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

    // camada: braços + bracers + mãos
    let bracos = "";
    for (const side of [-1, 1]) {
      const px = cx + side * (sh - 2);
      bracos += `
        <g transform="rotate(${side * 9} ${px} 47)">
          <rect x="${px - armW / 2}" y="44" width="${armW}" height="30" rx="${armW / 2}"
                fill="${stCorpo.medio}" stroke="#171009"/>
          <rect x="${px - armW / 2}" y="70" width="${armW}" height="16" rx="2"
                fill="#4a2f18" stroke="#171009"/>
          <circle cx="${px}" cy="89" r="3.2" fill="${stLuvas.cor}" stroke="#171009"/>
        </g>
        <circle cx="${px}" cy="46" r="${pdR}" fill="${stCorpo.claro}" stroke="#171009" stroke-width="1.4"/>
        <circle cx="${px}" cy="46" r="${pdR * .45}" fill="none" stroke="${stCorpo.escuro}" opacity=".6"/>`;
    }

    // camada: cabeça + capacete (cada elmo muda a silhueta da cabeça)
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
        <!-- asas laterais -->
        <path d="M ${cx - 10},22 Q ${cx - 18},14 ${cx - 14},6 Q ${cx - 8},12 ${cx - 9},20 Z"
              fill="${stCab.asa}" stroke="${stCab.escuro}" stroke-width=".8"/>
        <path d="M ${cx + 10},22 Q ${cx + 18},14 ${cx + 14},6 Q ${cx + 8},12 ${cx + 9},20 Z"
              fill="${stCab.asa}" stroke="${stCab.escuro}" stroke-width=".8"/>`;

    } else {
      // elmo_ferro e elmo_simples: domo simples (cores diferentes)
      cabeca += `
        <path d="M ${cx - 10},25 A 10 10 0 0 1 ${cx + 10},25 L ${cx + 10},29
                 L ${cx - 10},29 Z" fill="${stCab.metal}" stroke="${stCab.escuro}" stroke-width="1.2"/>
        <rect x="${cx - 1}" y="26" width="2" height="7" fill="${stCab.metal}" stroke="${stCab.escuro}" stroke-width=".6"/>
        <path d="M ${cx - 10},25 L ${cx},17 L ${cx + 10},25" fill="none"
              stroke="${stCab.escuro}" stroke-width="1.4"/>`;
    }

    /* camada: arma — cada tipo tem silhueta própria */
    const sx = cx + sh + armW + 9;
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
      // espadas: normal, do campeão e espadão (mais larga/longa)
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

    // silhueta: calor pela intensidade relativa de cada região
    const heat = (...nomes) => {
      const pts = nomes.reduce((n, nome) => {
        const g = gs.find(x => x.nome === nome);
        return Math.max(n, g ? g.pontos : 0);
      }, 0);
      const r = pts / maxPt;
      return `rgba(${Math.round(184 + 12 * r)},${Math.round(146 - 88 * r)},${Math.round(58 - 16 * r)},${(r > 0 ? .3 + .7 * r : .08).toFixed(2)})`;
    };

    /* silhueta frontal (músculos visíveis de frente) */
    const silhuetaFrente = `
      <svg class="mapa-silhueta" viewBox="0 0 100 170" aria-hidden="true">
        <g stroke="#171009" stroke-width=".9">
          <circle cx="50" cy="13" r="8" fill="#c79b6f"/>
          <rect x="46" y="21" width="8" height="6" fill="#b98d63"/>
          <path d="M33,28 Q50,23 67,28 L66,34 Q50,29 34,34 Z" fill="${heat("Costas")}"/>
          <ellipse cx="32" cy="38" rx="7.5" ry="6.5" fill="${heat("Ombros")}"/>
          <ellipse cx="68" cy="38" rx="7.5" ry="6.5" fill="${heat("Ombros")}"/>
          <rect x="39" y="33" width="10.4" height="13" rx="4" fill="${heat("Peito")}"/>
          <rect x="50.6" y="33" width="10.4" height="13" rx="4" fill="${heat("Peito")}"/>
          <ellipse cx="26.5" cy="51" rx="5.2" ry="8.5" fill="${heat("Braços")}"/>
          <ellipse cx="73.5" cy="51" rx="5.2" ry="8.5" fill="${heat("Braços")}"/>
          <polygon points="22.5,60 30.5,60 28.5,79 24.5,79" fill="${heat("Braços")}"/>
          <polygon points="69.5,60 77.5,60 75.5,79 71.5,79" fill="${heat("Braços")}"/>
          <circle cx="26.5" cy="83" r="3" fill="#b98d63"/>
          <circle cx="73.5" cy="83" r="3" fill="#b98d63"/>
          <rect x="42" y="63" width="7" height="5.4" rx="1.5" fill="${heat("Core")}"/>
          <rect x="51" y="63" width="7" height="5.4" rx="1.5" fill="${heat("Core")}"/>
          <rect x="42" y="70" width="7" height="5.4" rx="1.5" fill="${heat("Core")}"/>
          <rect x="51" y="70" width="7" height="5.4" rx="1.5" fill="${heat("Core")}"/>
          <rect x="43" y="77" width="6" height="5" rx="1.5" fill="${heat("Core")}"/>
          <rect x="51" y="77" width="6" height="5" rx="1.5" fill="${heat("Core")}"/>
          <polygon points="39,86 49.5,86 48,126 40,126" fill="${heat("Pernas")}"/>
          <polygon points="50.5,86 61,86 60,126 52,126" fill="${heat("Pernas")}"/>
          <ellipse cx="44.5" cy="137" rx="5.4" ry="10.5" fill="${heat("Pernas")}"/>
          <ellipse cx="55.5" cy="137" rx="5.4" ry="10.5" fill="${heat("Pernas")}"/>
          <rect x="39" y="148" width="12" height="5.5" rx="1.5" fill="#33200f"/>
          <rect x="49" y="148" width="12" height="5.5" rx="1.5" fill="#33200f"/>
        </g>
      </svg>`;

    /* silhueta posterior (costas, lombar, glúteos e posterior de coxa) */
    const silhuetaCostas = `
      <svg class="mapa-silhueta" viewBox="0 0 100 170" aria-hidden="true">
        <g stroke="#171009" stroke-width=".9">
          <circle cx="50" cy="13" r="8" fill="#b98d63"/>
          <rect x="46" y="21" width="8" height="6" fill="#a87e56"/>
          <path d="M35,26 Q50,21 65,26 L61,38 Q50,33 39,38 Z" fill="${heat("Costas")}"/>
          <path d="M46,30 L50,44 L54,30 L50,34 Z" fill="${heat("Ombros")}" opacity=".55"/>
          <ellipse cx="32" cy="38" rx="7.5" ry="6.5" fill="${heat("Ombros")}"/>
          <ellipse cx="68" cy="38" rx="7.5" ry="6.5" fill="${heat("Ombros")}"/>
          <!-- dorsais (Costas), asas ao lado da coluna -->
          <polygon points="37,36 47,35 45,70 40,64" fill="${heat("Costas")}"/>
          <polygon points="63,36 53,35 55,70 60,64" fill="${heat("Costas")}"/>
          <line x1="50" y1="34" x2="50" y2="78" stroke="#171009" stroke-width="1.4"/>
          <!-- tríceps (Braços) -->
          <ellipse cx="26.5" cy="52" rx="5.2" ry="9" fill="${heat("Braços")}"/>
          <ellipse cx="73.5" cy="52" rx="5.2" ry="9" fill="${heat("Braços")}"/>
          <polygon points="22.5,62 30.5,62 28.5,80 24.5,80" fill="${heat("Braços")}"/>
          <polygon points="69.5,62 77.5,62 75.5,80 71.5,80" fill="${heat("Braços")}"/>
          <circle cx="26.5" cy="84" r="3" fill="#b98d63"/>
          <circle cx="73.5" cy="84" r="3" fill="#b98d63"/>
          <!-- lombares (Core) -->
          <rect x="42" y="72" width="16" height="10" rx="2" fill="${heat("Core")}"/>
          <!-- glúteos (Pernas) -->
          <rect x="39" y="83" width="10.5" height="15" rx="5" fill="${heat("Pernas")}"/>
          <rect x="50.5" y="83" width="10.5" height="15" rx="5" fill="${heat("Pernas")}"/>
          <!-- posterior de coxa (Pernas) -->
          <polygon points="40,99 49.5,99 48,132 41,132" fill="${heat("Pernas")}"/>
          <polygon points="50.5,99 60,99 59,132 52,132" fill="${heat("Pernas")}"/>
          <!-- panturrilhas (Panturrilha/Pernas) -->
          <ellipse cx="44.5" cy="143" rx="5.4" ry="10" fill="${heat("Panturrilha", "Pernas")}"/>
          <ellipse cx="55.5" cy="143" rx="5.4" ry="10" fill="${heat("Panturrilha", "Pernas")}"/>
          <rect x="39" y="153" width="12" height="5.5" rx="1.5" fill="#33200f"/>
          <rect x="49" y="153" width="12" height="5.5" rx="1.5" fill="#33200f"/>
        </g>
      </svg>`;

    /* duas vistas lado a lado: frente e costas */
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

    const linhas = gs.map(g => {
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

    return `
      <div class="mapa-wrap">
        ${silhueta}
        <div class="mapa-bars">${linhas}</div>
      </div>
      <p class="mapa-legend">◆ I Iniciante · II Desenvolvido · III Avançado · IV Elite</p>`;
  }

  /* ---- balanço: fatia de cada grupo no total (ordenado) ---- */
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

  return { svg, mapaHTML, balancoHTML, mapaPct, balanco,
           rankGuerreiro, gruposMacroPontos, nivelDePontos, calcMusculos,
           fatores, NIVEIS_MUSCULARES, COSMETICOS, SLOTS, PADRAO,
           RARIDADES, porId, estiloDe, possui, statusItem, reqTexto };
})();
