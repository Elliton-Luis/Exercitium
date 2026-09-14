/* ================================================================
   EXERCITIUM — Análise histórica de séries (estimativa, não regra)
   Estatística simples, explicável e offline. Sem dependências.

   Ideia: transformar as séries VÁLIDAS do próprio histórico em uma
   faixa provável de carga × repetições para o próximo treino.
   Nunca afirma carga "ideal": tudo é apresentado como estimativa.

   1RM estimado (Epley): peso * (1 + reps/30). Usado só como esforço
   relativo para comparar séries diferentes, nunca como verdade.
   ================================================================ */

const Analise = (() => {

  function estimar1RM(peso, reps) {
    const p = +peso || 0;
    const r = Math.max(1, Math.min(30, parseInt(reps, 10) || 0));
    if (p <= 0 || r <= 0) return 0;
    return p * (1 + r / 30);
  }

  function mediana(vals) {
    const v = [...vals].sort((a, b) => a - b);
    if (!v.length) return 0;
    const m = Math.floor(v.length / 2);
    return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
  }

  function quartis(vals) {
    const v = [...vals].sort((a, b) => a - b);
    if (!v.length) return { q1: 0, med: 0, q3: 0 };
    const med = mediana(v);
    const lo = v.filter(x => x < med);
    const hi = v.filter(x => x > med);
    // para n pequeno, usa min/med/max como fallback explicável
    return {
      q1: lo.length ? mediana(lo) : v[0],
      med,
      q3: hi.length ? mediana(hi) : v[v.length - 1]
    };
  }

  function media(vals) {
    if (!vals.length) return 0;
    return vals.reduce((n, x) => n + x, 0) / vals.length;
  }

  function desvioPadrao(vals, m) {
    if (vals.length < 2) return 0;
    const avg = m !== undefined ? m : media(vals);
    const v = vals.reduce((n, x) => n + (x - avg) * (x - avg), 0) / vals.length;
    return Math.sqrt(v);
  }

  // Mediana ponderada: pares {v, w} ordenados por v.
  function medianaPonderada(pares) {
    const ps = [...pares].filter(p => p.w > 0).sort((a, b) => a.v - b.v);
    if (!ps.length) return 0;
    const total = ps.reduce((n, p) => n + p.w, 0);
    let acc = 0;
    for (const p of ps) {
      acc += p.w;
      if (acc >= total / 2) return p.v;
    }
    return ps[ps.length - 1].v;
  }

  function arredondarCarga(v) {
    if (!isFinite(v) || v <= 0) return 0;
    return Math.round(v * 2) / 2; // passo de 0,5 kg: aproximado de propósito
  }

  /* Coleta e normaliza o histórico válido de um exercício.
     Retorna pontos cronológicos [{carga, reps, data, treinoId, ordem, peso}].
     `peso` é o peso de recência (antigas ~1, recentes ~2) — sem descartar nada. */
  function coletarHistorico(exId) {
    let series = [];
    try {
      if (typeof State !== "undefined" && State.s && typeof State.historicoValido === "function") {
        series = State.historicoValido(exId);
      }
    } catch (e) { series = []; }
    const pts = series
      .filter(s => (+s.peso || 0) > 0 && (parseInt(s.reps, 10) || 0) > 0)
      .sort((a, b) => (a.data - b.data) || (a.ordem - b.ordem))
      .map((s, i, arr) => ({
        carga: +s.peso,
        reps: parseInt(s.reps, 10),
        data: s.data,
        treinoId: s.treinoId,
        ordem: s.ordem || 0,
        // recência linear: mais nova vale até 2x a mais antiga
        peso: arr.length > 1 ? 1 + i / (arr.length - 1) : 1,
        e1rm: estimar1RM(s.peso, s.reps)
      }));
    return pts;
  }

  function contarIgnoradas(exId) {
    try {
      if (typeof State !== "undefined" && State.s && typeof State.historicoSeries === "function") {
        return State.historicoSeries(exId)
          .filter(s => !State.serieContaParaAnalise(s)).length;
      }
    } catch (e) {}
    return 0;
  }

  function nivelConfianca(n, nSessoes, cv) {
    if (n <= 0) return null;
    let nivel;
    if (n <= 2) nivel = "baixa";
    else if (n <= 7) nivel = cv > 0.25 ? "baixa" : "media";
    else nivel = cv < 0.12 ? "alta" : (cv < 0.22 ? "media" : "baixa");
    // séries de um único dia valem menos: teto em "média"
    if (nSessoes < 2 && nivel === "alta") nivel = "media";
    return nivel;
  }

  /* Análise principal. Sempre explicável e tolerante a pouco histórico. */
  function analisar(exId) {
    const pontos = coletarHistorico(exId);
    const n = pontos.length;
    const nSessoes = new Set(pontos.map(p => p.treinoId)).size;
    const nIgnoradas = contarIgnoradas(exId);

    if (!n) {
      return {
        estado: "sem-dados", n: 0, nSessoes: 0, nIgnoradas,
        confianca: null, pontos,
        mensagem: "Ainda tenho poucos dados para estimar.",
        detalhe: "Registre séries válidas para eu sugerir uma faixa."
      };
    }

    // Robustez: remove outliers só com histórico suficiente (IQR),
    // sem deixar uma única série distorcer o resultado.
    let base = pontos;
    let removeuOutliers = 0;
    if (n >= 6) {
      const e1 = pontos.map(p => p.e1rm).sort((a, b) => a - b);
      const q = quartis(e1);
      const iqr = Math.max(q.q3 - q.q1, 1e-9);
      const lo = q.q1 - 1.5 * iqr, hi = q.q3 + 1.5 * iqr;
      const filtrada = pontos.filter(p => p.e1rm >= lo && p.e1rm <= hi);
      if (filtrada.length >= Math.ceil(n * 0.7)) {
        removeuOutliers = n - filtrada.length;
        base = filtrada;
      }
    }

    const e1rmMed = medianaPonderada(base.map(p => ({ v: p.e1rm, w: p.peso })));
    const m = media(base.map(p => p.e1rm));
    const dp = desvioPadrao(base.map(p => p.e1rm), m);
    const cv = m > 0 ? dp / m : 1;

    // Alvo de reps: mediana observada (o que o usuário realmente faz)
    const repsMed = Math.max(1, Math.min(30, Math.round(mediana(base.map(p => p.reps)))));
    const repsAlvo = { min: Math.max(1, repsMed - 1), max: Math.min(30, repsMed + 1) };

    // Carga sugerida: 1RM mediano convertido de volta para o alvo de reps
    const cargaBruta = e1rmMed / (1 + repsMed / 30);
    const cargaSugerida = arredondarCarga(cargaBruta);

    // Faixa provável: quartis quando há dados, min–max quando há poucos
    const cargas = base.map(p => p.carga);
    const reps = base.map(p => p.reps);
    let faixaCarga, faixaReps;
    if (base.length >= 4) {
      const qc = quartis(cargas), qr = quartis(reps);
      faixaCarga = { min: arredondarCarga(qc.q1), max: arredondarCarga(qc.q3) };
      faixaReps = { min: Math.min(...reps) === Math.max(...reps) ? reps[0] : Math.round(qr.q1), max: Math.round(qr.q3) };
      if (faixaCarga.min === faixaCarga.max) {
        faixaCarga = { min: arredondarCarga(Math.min(...cargas)), max: arredondarCarga(Math.max(...cargas)) };
      }
    } else {
      faixaCarga = { min: arredondarCarga(Math.min(...cargas)), max: arredondarCarga(Math.max(...cargas)) };
      faixaReps = { min: Math.min(...reps), max: Math.max(...reps) };
    }

    // Tendência: metade recente vs metade antiga (evolução da carga)
    let tendenciaPct = 0;
    if (base.length >= 4) {
      const metade = Math.floor(base.length / 2);
      const antiga = mediana(base.slice(0, metade).map(p => p.e1rm));
      const recente = mediana(base.slice(metade).map(p => p.e1rm));
      if (antiga > 0) tendenciaPct = Math.round((recente - antiga) / antiga * 100);
    }

    const frequentes = {};
    for (const p of base) frequentes[p.carga] = (frequentes[p.carga] || 0) + 1;
    const cargaFrequente = +Object.entries(frequentes).sort((a, b) => b[1] - a[1])[0][0];

    const confianca = nivelConfianca(base.length, nSessoes, cv);
    const estado = base.length <= 2 ? "poucos-dados" : "ok";

    const mensagem = estado === "poucos-dados"
      ? "Ainda tenho poucos dados para estimar."
      : `Com base no seu histórico, ${cargaSugerida} kg parece uma boa faixa para ${repsAlvo.min}–${repsAlvo.max} repetições.`;

    const detalhe = estado === "poucos-dados"
      ? `Estimativa inicial baseada em ${base.length} série${base.length === 1 ? "" : "s"} válida${base.length === 1 ? "" : "s"}.`
      : `Estimativa baseada em ${base.length} séries válidas de ${nSessoes} sessão${nSessoes === 1 ? "" : "ões"}` +
        (removeuOutliers ? ` (${removeuOutliers} discrepante${removeuOutliers === 1 ? "" : "s"} suavizada${removeuOutliers === 1 ? "" : "s"}).` : ".");

    return {
      estado, n: base.length, nSessoes, nIgnoradas, confianca, pontos: base,
      e1rmMediano: Math.round(e1rmMed * 10) / 10,
      cargaSugerida, repsAlvo, faixaCarga, faixaReps,
      cargaFrequente, tendenciaPct, cv: Math.round(cv * 100) / 100,
      mensagem, detalhe
    };
  }

  function textoConfianca(a) {
    if (!a || !a.confianca) return "";
    if (a.estado === "sem-dados") return "Confiança: —";
    const rotulo = a.confianca === "alta" ? "alta" : a.confianca === "media" ? "média" : "baixa";
    return `Confiança: ${rotulo}`;
  }

  /* Escapa texto para SVG/HTML sem depender da UI. */
  function _esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
  }

  /* Gráfico carga (X) × reps (Y) com a faixa estimada como retângulo
     tracejado — visualmente uma estimativa, nunca uma regra. */
  function scatterSVG(a, opts = {}) {
    const w = opts.w || 300, h = opts.h || 170;
    const padL = 30, padR = 10, padT = 12, padB = 22;
    const pts = (a && a.pontos) || [];
    if (!pts.length) return `<p class="empty-msg" style="padding:.6rem">Sem séries válidas para o gráfico.</p>`;

    let minC = Math.min(...pts.map(p => p.carga));
    let maxC = Math.max(...pts.map(p => p.carga));
    let minR = Math.min(...pts.map(p => p.reps));
    let maxR = Math.max(...pts.map(p => p.reps));
    if (a.faixaCarga) {
      minC = Math.min(minC, a.faixaCarga.min);
      maxC = Math.max(maxC, a.faixaCarga.max);
    }
    if (a.faixaReps) {
      minR = Math.min(minR, a.faixaReps.min);
      maxR = Math.max(maxR, a.faixaReps.max);
    }
    if (minC === maxC) { minC -= 2.5; maxC += 2.5; }
    if (minR === maxR) { minR -= 1; maxR += 1; }
    const padC = (maxC - minC) * 0.12 || 1;
    const padRp = (maxR - minR) * 0.2 || 1;
    minC -= padC; maxC += padC; minR -= padRp; maxR += padRp;

    const X = c => padL + (c - minC) / (maxC - minC) * (w - padL - padR);
    const Y = r => padT + (1 - (r - minR) / (maxR - minR)) * (h - padT - padB);

    // cor por recência: antigas apagadas, recentes douradas
    const ordenados = [...pts].sort((x, y) => x.data - y.data);
    const idxDe = new Map(ordenados.map((p, i) => [p, i]));

    let faixa = "";
    if (a.faixaCarga && a.faixaReps) {
      faixa = `<rect x="${X(a.faixaCarga.min)}" y="${Y(a.faixaReps.max)}" ` +
        `width="${Math.max(4, X(a.faixaCarga.max) - X(a.faixaCarga.min))}" ` +
        `height="${Math.max(4, Y(a.faixaReps.min) - Y(a.faixaReps.max))}" ` +
        `fill="rgba(184,146,58,.12)" stroke="#b8923a" stroke-width="1" stroke-dasharray="5 3" rx="3">` +
        `<title>Faixa estimada (aproximada)</title></rect>`;
    }

    const bolhas = pts.map(p => {
      const i = idxDe.get(p) || 0;
      const t = pts.length > 1 ? i / (pts.length - 1) : 1; // 0 antiga → 1 recente
      const fill = t > 0.66 ? "#e8cd85" : t > 0.33 ? "#b8923a" : "#6e5626";
      const op = (0.45 + t * 0.55).toFixed(2);
      const d = new Date(p.data).toLocaleDateString("pt-BR");
      return `<circle cx="${X(p.carga).toFixed(1)}" cy="${Y(p.reps).toFixed(1)}" r="4" ` +
        `fill="${fill}" fill-opacity="${op}" stroke="#241300" stroke-width="1">` +
        `<title>${p.carga} kg × ${p.reps} (${d})</title></circle>`;
    }).join("");

    return `<svg class="analise-scatter" viewBox="0 0 ${w} ${h}" role="img" ` +
      `aria-label="Carga por repetições (estimativa tracejada)">` +
      `<line x1="${padL}" y1="${h - padB}" x2="${w - padR}" y2="${h - padB}" stroke="#4e381a"/>` +
      `<line x1="${padL}" y1="${padT}" x2="${padL}" y2="${h - padB}" stroke="#4e381a"/>` +
      `${faixa}${bolhas}` +
      `<text x="${(w + padL) / 2}" y="${h - 7}" text-anchor="middle" fill="#97814f" font-size="10">carga (kg)</text>` +
      `<text x="9" y="${(h) / 2}" text-anchor="middle" fill="#97814f" font-size="10" transform="rotate(-90 9 ${h / 2})">reps</text>` +
      `<text x="${w - padR}" y="${h - 7}" text-anchor="end" fill="#97814f" font-size="9">╌ estimativa</text>` +
      `</svg>`;
  }

  return {
    estimar1RM, mediana, medianaPonderada, arredondarCarga,
    coletarHistorico, analisar, textoConfianca, scatterSVG
  };
})();

/* Exporta para testes em Node sem quebrar o navegador. */
if (typeof module !== "undefined" && module.exports) module.exports = Analise;
