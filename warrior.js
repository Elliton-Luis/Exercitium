/* ================================================================
   EXERCITIUM — Guerreiro visual
   O corpo é dimensionado pelo histórico REAL de treino (séries por
   músculo). Arquitetura em camadas/slots pronta para receber novos
   equipamentos: basta registrar itens no ARMARIO e equipá-los.
   ================================================================ */

const Warrior = (() => {

  const CAP_PONTOS = 50; // séries-equivalentes para um grupo chegar a 100%

  /* ---- registro de equipamentos por slot ---- */
  const ARMARIO = {
    cabeca: { "capacete_ferro": { metal: "#8a744a", escuro: "#42351c" } },
    corpo:  { "armadura_ferro": { claro: "#99a0ac", medio: "#6d7480", escuro: "#3a3f47" } },
    bracos: { "bracers_ferro":  { couro: "#4a2f18", metal: "#6d7480" } },
    pernas: { "grevas_ferro":   { tecido: "#31241a", metal: "#565c66" } },
    capa:   { "capa_couro":     { cor: "#5c2015", borda: "#2c0e06" } },
    arma:   { "espada_ferro":   { lamina: "#c9ced6", guarda: "#c9a13b", punho: "#3a2412" } }
  };

  /* slots equipados no momento (futuro: mover para o save do jogador) */
  const EQUIPADO = {
    cabeca: "capacete_ferro",
    corpo:  "armadura_ferro",
    bracos: "bracers_ferro",
    pernas: "grevas_ferro",
    capa:   "capa_couro",
    arma:   "espada_ferro"
  };

  const eq = slot => ARMARIO[slot][EQUIPADO[slot]];

  /* ---- volume por músculo derivado do histórico real ----
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
  function svg(s) {
    const p = mapaPct(s);
    const f = fatores(p);
    const cx = 60;

    const sh    = 17 + f.ombros * 9;   // meia-largura dos ombros
    const waist = 11 + f.core * 4;     // meia-largura da cintura
    const legW  = 9 + f.pernas * 7;    // largura de cada perna
    const armW  = 8 + f.bracos * 6;    // espessura do braço
    const pdR   = 5.5 + f.ombros * 4.5;// raio da pauldron

    const cor = eq("corpo"), cap = eq("capa"), cab = eq("cabeca"),
          per = eq("pernas"), br = eq("bracos"), arm = eq("arma");

    const uid = "wg" + Math.random().toString(36).slice(2, 7);

    // camada: capa (atrás de tudo)
    const capa = `
      <path d="M ${cx - 15},45 Q ${cx},41 ${cx + 15},45
               L ${cx + 19},127 Q ${cx},133 ${cx - 19},127 Z"
            fill="${cap.cor}" stroke="${cap.borda}" stroke-width="2"/>
      <path d="M ${cx - 8},48 L ${cx - 11},122 M ${cx + 8},48 L ${cx + 11},122"
            stroke="${cap.borda}" stroke-width="1" opacity=".5" fill="none"/>`;

    // camada: pernas + grevas
    let pernas = "";
    for (const side of [-1, 1]) {
      const lx = side < 0 ? cx - 4 - legW : cx + 4;
      pernas += `
        <rect x="${lx}" y="93" width="${legW}" height="33" rx="2" fill="${per.tecido}" stroke="#171009"/>
        <rect x="${lx - 1}" y="123" width="${legW + 2}" height="17" rx="2" fill="${per.metal}" stroke="#171009"/>
        <rect x="${lx - 1}" y="123" width="${legW + 2}" height="3" fill="#ffffff" opacity=".12"/>`;
    }

    // camada: torso (largura por peito/costas, cintura por core)
    const torso = `
      <path d="M ${cx - sh},40 Q ${cx},36 ${cx + sh},40
               L ${cx + waist + 2},91 L ${cx - waist - 2},91 Z"
            fill="url(#${uid}-m)" stroke="${cor.escuro}" stroke-width="1.5"/>
      <path d="M ${cx - sh * .62},53 Q ${cx - sh * .31},60 ${cx},54
               Q ${cx + sh * .31},60 ${cx + sh * .62},53"
            stroke="${cor.escuro}" fill="none" stroke-width="1.6"
            opacity="${(.3 + f.torso * .6).toFixed(2)}"/>
      <path d="M ${cx},60 L ${cx},72 M ${cx - 5},64 L ${cx + 5},64 M ${cx - 4},70 L ${cx + 4},70"
            stroke="${cor.escuro}" stroke-width="1.2" fill="none"
            opacity="${(.15 + f.core * .55).toFixed(2)}"/>
      <rect x="${cx - waist - 3}" y="85" width="${(waist + 3) * 2}" height="7"
            fill="#4a2f18" stroke="#241708"/>
      <rect x="${cx - 3.5}" y="85.5" width="7" height="6" fill="#c9a13b" stroke="#241708"/>`;

    // camada: braços + bracers + mãos
    let bracos = "";
    for (const side of [-1, 1]) {
      const px = cx + side * (sh - 2);
      bracos += `
        <g transform="rotate(${side * 9} ${px} 47)">
          <rect x="${px - armW / 2}" y="44" width="${armW}" height="30" rx="${armW / 2}"
                fill="${cor.medio}" stroke="#171009"/>
          <rect x="${px - armW / 2}" y="70" width="${armW}" height="16" rx="2"
                fill="${br.couro}" stroke="#171009"/>
          <circle cx="${px}" cy="89" r="3.2" fill="${br.metal}" stroke="#171009"/>
        </g>
        <circle cx="${px}" cy="46" r="${pdR}" fill="${cor.claro}" stroke="#171009" stroke-width="1.4"/>
        <circle cx="${px}" cy="46" r="${pdR * .45}" fill="none" stroke="${cor.escuro}" opacity=".6"/>`;
    }

    // camada: cabeça + capacete
    const cabeca = `
      <rect x="${cx - 3}" y="31" width="6" height="7" fill="#b98d63" stroke="#171009"/>
      <circle cx="${cx}" cy="25" r="8.5" fill="#c79b6f" stroke="#171009"/>
      <path d="M ${cx - 10},25 A 10 10 0 0 1 ${cx + 10},25 L ${cx + 10},29
               L ${cx - 10},29 Z" fill="${cab.metal}" stroke="${cab.escuro}" stroke-width="1.2"/>
      <rect x="${cx - 1}" y="26" width="2" height="7" fill="${cab.metal}" stroke="${cab.escuro}" stroke-width=".6"/>
      <path d="M ${cx - 10},25 L ${cx},17 L ${cx + 10},25" fill="none"
            stroke="${cab.escuro}" stroke-width="1.4"/>`;

    // camada: espada (mão direita)
    const sx = cx + sh + armW + 9;
    const espada = `
      <g transform="rotate(6 ${sx} 60)">
        <rect x="${sx - 1.6}" y="28" width="3.2" height="49" fill="${arm.lamina}" stroke="#4a4e55" stroke-width=".7"/>
        <path d="M ${sx - 1.6},28 L ${sx},21 L ${sx + 1.6},28 Z" fill="${arm.lamina}" stroke="#4a4e55" stroke-width=".7"/>
        <rect x="${sx - 7}" y="77" width="14" height="3.6" rx="1" fill="${arm.guarda}" stroke="#241708"/>
        <rect x="${sx - 2}" y="80.6" width="4" height="9" rx="1.5" fill="${arm.punho}" stroke="#171009"/>
        <circle cx="${sx}" cy="92" r="2.8" fill="${arm.guarda}" stroke="#241708"/>
      </g>`;

    return `
    <svg class="warrior-svg" viewBox="0 0 120 170" role="img"
         aria-label="Guerreiro do personagem" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${uid}-m" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${cor.claro}"/>
          <stop offset="1" stop-color="${cor.medio}"/>
        </linearGradient>
      </defs>
      ${capa}
      ${pernas}
      ${torso}
      ${bracos}
      ${cabeca}
      ${espada}
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

    const silhueta = `
      <svg class="mapa-silhueta" viewBox="0 0 90 150" aria-hidden="true">
        <g stroke="#7a5c2e" stroke-width="1.5">
          <circle cx="45" cy="16" r="9"/>
          <rect x="39" y="26" width="12" height="5"/>
          <rect x="24" y="31" width="42" height="10" rx="3" fill="${heat("Ombros")}"/>
          <rect x="29" y="42" width="32" height="18" rx="3" fill="${heat("Peito", "Costas")}"/>
          <rect x="12" y="32" width="10" height="34" rx="5" fill="${heat("Braços")}"/>
          <rect x="68" y="32" width="10" height="34" rx="5" fill="${heat("Braços")}"/>
          <rect x="30" y="61" width="30" height="16" rx="3" fill="${heat("Core")}"/>
          <rect x="30" y="79" width="12" height="46" rx="5" fill="${heat("Pernas")}"/>
          <rect x="48" y="79" width="12" height="46" rx="5" fill="${heat("Pernas")}"/>
          <rect x="29" y="127" width="14" height="10" rx="2" fill="${heat("Pernas")}"/>
          <rect x="47" y="127" width="14" height="10" rx="2" fill="${heat("Pernas")}"/>
        </g>
      </svg>`;

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
           fatores, NIVEIS_MUSCULARES, ARMARIO, EQUIPADO };
})();
