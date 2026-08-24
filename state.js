/* ================================================================
   EXERCITIUM — Estado & Persistência (localStorage)
   ================================================================ */

const SAVE_KEY = "exercitium_save_v1";
const SESSAO_KEY = "exercitium_sessao_v1";

const State = {
  s: null, // estado atual

  novo() {
    return {
      versao: 1,
      criadoEm: Date.now(),
      personagem: {
        nome: "Aventureiro",
        nivel: 1,
        xp: 0,
        ouro: 0
      },
      exercicios: [],       // personalizados [{id, nome, grupo, principal[], secundarios[], custom:true}]
      rotinas: [],          // [{id, nome, itens:[{exercicioId, series}]}]
      treinos: [],          // [{id, exercicioId, data, series:[{peso,reps}]}]
      recordes: {},         // por exercicioId: {maiorPeso:{valor,reps,data}, maiorReps:{...}, melhorSerie:{...}, melhorVolumeTreino:{...}, quebras}
      streak: { atual: 0, melhor: 0, ultimoDia: null },
      conquistas: {},       // id -> {data}
      config: { som: true }
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.personagem) return false;
      // merge defensivo com estrutura nova (para saves antigos)
      this.s = Object.assign(this.novo(), parsed);
      this.s.personagem = Object.assign({ nome:"Aventureiro", nivel:1, xp:0, ouro:0 }, parsed.personagem);
      this.s.streak = Object.assign({ atual:0, melhor:0, ultimoDia:null }, parsed.streak);
      this.s.config = Object.assign({ som:true }, parsed.config);
      // migração defensiva: campos novos em saves antigos
      if (!Array.isArray(this.s.rotinas)) this.s.rotinas = [];
      return true;
    } catch (e) {
      console.error("Erro ao carregar save:", e);
      return false;
    }
  },

  init() {
    if (!this.load()) {
      this.s = this.novo();
      this.save();
    }
  },

  save() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(this.s));
  },

  /* ---------- Exercícios ---------- */
  todosExercicios() {
    const padroes = BIBLIOTECA_PADRAO.map((e, i) => ({
      id: "p" + i,
      padrao: true,
      ...e
    }));
    return [...padroes, ...this.s.exercicios];
  },

  exercicioPorId(id) {
    if (id.startsWith("p")) {
      const idx = parseInt(id.slice(1), 10);
      return BIBLIOTECA_PADRAO[idx] ? { id, padrao: true, ...BIBLIOTECA_PADRAO[idx] } : null;
    }
    return this.s.exercicios.find(e => e.id === id) || null;
  },

  addExercicioCustom(nome, grupo, principal, secundarios) {
    const ex = {
      id: "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      nome, grupo,
      principal, secundarios,
      custom: true
    };
    this.s.exercicios.push(ex);
    this.save();
    return ex;
  },

  updateExercicioCustom(id, nome, grupo, principal, secundarios) {
    const ex = this.s.exercicios.find(e => e.id === id);
    if (!ex) return;
    Object.assign(ex, { nome, grupo, principal, secundarios });
    this.save();
  },

  removeExercicio(id) {
    this.s.exercicios = this.s.exercicios.filter(e => e.id !== id);
    this.save();
  },

  /* ---------- Rotinas (treinos pré-definidos) ---------- */
  rotinaPorId(id) {
    return this.s.rotinas.find(r => r.id === id) || null;
  },

  addRotina(nome, itens) {
    const r = {
      id: "r" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      nome,
      itens: itens.map(i => ({ exercicioId: i.exercicioId, series: +i.series || 3 }))
    };
    this.s.rotinas.push(r);
    this.save();
    return r;
  },

  updateRotina(id, nome, itens) {
    const r = this.rotinaPorId(id);
    if (!r) return;
    Object.assign(r, { nome, itens: itens.map(i => ({ exercicioId: i.exercicioId, series: +i.series || 3 })) });
    this.save();
  },

  removeRotina(id) {
    this.s.rotinas = this.s.rotinas.filter(r => r.id !== id);
    this.save();
  },

  /* ---------- Treinos ---------- */
  treinosDoExercicio(exId) {
    return this.s.treinos
      .filter(t => t.exercicioId === exId)
      .sort((a, b) => b.data - a.data);
  },

  addTreino(exId, series) {
    const t = {
      id: "t" + Date.now().toString(36),
      exercicioId: exId,
      data: Date.now(),
      series: series.map(s => ({ peso: +s.peso, reps: +s.reps }))
    };
    this.s.treinos.push(t);
    this.save();
    return t;
  },

  /* ---------- Recordes de um exercício ---------- */
  statsExercicio(exId) {
    const ts = this.treinosDoExercicio(exId);
    let maiorPeso = null, maiorReps = null, melhorSerie = null;
    let volumeTotal = 0;
    for (const t of ts) {
      let volTreino = 0;
      for (const se of t.series) {
        volTreino += se.peso * se.reps;
        if (!maiorPeso || se.peso > maiorPeso.valor)
          maiorPeso = { valor: se.peso, reps: se.reps, data: t.data };
        if (!maiorReps || se.reps > maiorReps.reps ||
            (se.reps === maiorReps.reps && se.peso > maiorReps.valor))
          maiorReps = { valor: se.reps, peso: se.peso, data: t.data };
        const score = se.peso * se.reps;
        if (!melhorSerie || score > melhorSerie.valor * melhorSerie.reps)
          melhorSerie = { valor: se.peso, reps: se.reps };
      }
      volumeTotal += volTreino;
    }
    return { ultimo: ts[0] || null, maiorPeso, maiorReps, melhorSerie, volumeTotal, numTreinos: ts.length };
  },

  /* ---------- Save/Load externo ---------- */
  exportar() {
    const blob = new Blob([JSON.stringify(this.s, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const d = new Date();
    a.href = url;
    a.download = `exercitium_save_${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importar(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (!data || typeof data !== "object" || !data.personagem) {
        throw new Error("Formato inválido");
      }
      this.s = Object.assign(this.novo(), data);
      this.save();
      return true;
    } catch (e) {
      return false;
    }
  },

  /* Zera tudo: remove o save do localStorage e recria o estado inicial.
     A biblioteca padrão de exercícios não é afetada (vive em data.js).  */
  resetarTudo() {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(SESSAO_KEY);
    this.s = this.novo();
    this.save();
  },

  /* ---------- Sessão de treino em andamento ("save game") ----------
     Persistida em chave própria, imediatamente após cada ação relevante.
     status "in_progress" enquanto ativa; removida ao finalizar/descartar. */
  salvarSessao(sessao) {
    if (!sessao) { this.apagarSessao(); return; }
    const dados = JSON.parse(JSON.stringify(sessao));
    dados.status = "in_progress";
    dados.salvoEm = Date.now();
    localStorage.setItem(SESSAO_KEY, JSON.stringify(dados));
  },

  carregarSessao() {
    try {
      const raw = localStorage.getItem(SESSAO_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      // validação leve: estrutura mínima esperada
      if (!s || s.status !== "in_progress" || !Array.isArray(s.items) || !s.tipo) {
        localStorage.removeItem(SESSAO_KEY);
        return null;
      }
      return s;
    } catch (e) {
      return null;
    }
  },

  apagarSessao() {
    localStorage.removeItem(SESSAO_KEY);
  }
};
