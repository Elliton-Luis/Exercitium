/* ================================================================
   EXERCITIUM — Estado & Persistência (localStorage)
   ================================================================ */

const SAVE_KEY = "exercitium_save_v1";
const SESSAO_KEY = "exercitium_sessao_v1";
const SCHEMA_VERSAO = 2;

const State = {
  s: null, // estado atual

  novo() {
    return {
      versao: SCHEMA_VERSAO,
      criadoEm: Date.now(),
      personagem: {
        nome: "Aventureiro",
        nivel: 1,
        xp: 0,
        ouro: 0,
        equipamento: {
          cabeca: "elmo_ferro",
          corpo: "armadura_ferro",
          capa: "capa_nenhuma",
          luvas: "luvas_couro",
          calcas: "calcas_couro",
          botas: "botas_couro",
          acessorio: "colar_pano",
          arma: "espada_ferro"
        }
      },
      inventario: [],       // ids de cosméticos comprados/possuídos
      exercicios: [],       // personalizados [{id, nome, grupo, principal[], secundarios[], custom:true, equipamento?}]
      rotinas: [],          // [{id, nome, itens:[{exercicioId, series}]}]
      treinos: [],          // [{id, exercicioId, data, series:[{peso,reps}]}]
      cardios: [],          // [{id, modalidade, data, duracaoMin, distanciaKm, ...}]
      favoritos: [],        // ids de exercícios favoritados (p* e c*)
      recordes: {},         // por exercicioId: {maiorPeso:{valor,reps,data}, maiorReps:{...}, melhorSerie:{...}, melhorVolumeTreino:{...}, quebras}
      streak: { atual: 0, melhor: 0, ultimoDia: null },
      conquistas: {},       // id -> {data}
      config: { som: true }
    };
  },

  /* migração de músculos antigos para novos */
  _migrarMusculos(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.map(m => {
      if (MUSCULOS.includes(m)) return m;
      if (MUSCULO_ALIASES && MUSCULO_ALIASES[m]) return MUSCULO_ALIASES[m];
      return m;
    }).filter(m => MUSCULOS.includes(m));
  },

  migrar(parsed) {
    // já na versão atual
    if (parsed.versao === SCHEMA_VERSAO) return parsed;
    if (!parsed.versao || parsed.versao < 2) {
      // migrar exercícios custom com nomes antigos
      if (Array.isArray(parsed.exercicios)) {
        for (const ex of parsed.exercicios) {
          ex.principal = this._migrarMusculos(ex.principal);
          ex.secundarios = this._migrarMusculos(ex.secundarios);
          // se vazio por migração, garante pelo menos um
          if (!ex.principal.length && ex.secundarios.length) {
            ex.principal = [ex.secundarios.shift()];
          }
        }
      }
      if (!Array.isArray(parsed.cardios)) parsed.cardios = [];
      parsed.versao = 2;
    }
    return parsed;
  },

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.personagem) return false;
      // migração de schema
      const migrado = this.migrar(parsed);
      // merge defensivo com estrutura nova (para saves antigos)
      this.s = Object.assign(this.novo(), migrado);
      this.s.personagem = Object.assign({ nome:"Aventureiro", nivel:1, xp:0, ouro:0 }, migrado.personagem);
      this.s.streak = Object.assign({ atual:0, melhor:0, ultimoDia:null }, migrado.streak);
      this.s.config = Object.assign({ som:true }, migrado.config);
      // migração defensiva: campos novos em saves antigos
      if (!Array.isArray(this.s.rotinas)) this.s.rotinas = [];
      if (!Array.isArray(this.s.inventario)) this.s.inventario = [];
      if (!Array.isArray(this.s.cardios)) this.s.cardios = [];
      if (!Array.isArray(this.s.exercicios)) this.s.exercicios = [];
      if (!Array.isArray(this.s.treinos)) this.s.treinos = [];
      if (!Array.isArray(this.s.favoritos)) this.s.favoritos = [];
      else this.s.favoritos = this.s.favoritos.filter(id => typeof id === "string");
      if (typeof this.s.recordes !== "object" || this.s.recordes === null) this.s.recordes = {};
      if (typeof this.s.conquistas !== "object" || this.s.conquistas === null) this.s.conquistas = {};
      this.s.personagem.equipamento = Object.assign({
        cabeca: "elmo_ferro", corpo: "armadura_ferro", capa: "capa_nenhuma",
        luvas: "luvas_couro", calcas: "calcas_couro", botas: "botas_couro",
        acessorio: "colar_pano", arma: "espada_ferro"
      }, migrado.personagem.equipamento || {});
      // sanitizar cardios: remover entradas inválidas
      this.s.cardios = this.s.cardios.filter(c => c && typeof c.duracaoMin === "number" && c.duracaoMin > 0);
      if (migrado.versao !== SCHEMA_VERSAO) {
        this.s.versao = SCHEMA_VERSAO;
        this.save();
      }
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
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.s));
    } catch (e) {
      console.error("Erro ao salvar:", e);
    }
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
    if (!id || typeof id !== "string") return null;
    if (id.startsWith("p")) {
      const idx = parseInt(id.slice(1), 10);
      if (!isNaN(idx) && BIBLIOTECA_PADRAO[idx]) return { id, padrao: true, ...BIBLIOTECA_PADRAO[idx] };
      return null;
    }
    return this.s.exercicios.find(e => e.id === id) || null;
  },

  sanitizarMusculos(principal, secundarios) {
    const clean = (arr) => {
      if (!Array.isArray(arr)) return [];
      const mapped = arr.map(m => {
        if (MUSCULOS.includes(m)) return m;
        if (MUSCULO_ALIASES && MUSCULO_ALIASES[m]) return MUSCULO_ALIASES[m];
        return null;
      }).filter(Boolean);
      return [...new Set(mapped)];
    };
    let p = clean(principal);
    let s = clean(secundarios);
    // evita intersecção
    s = s.filter(m => !p.includes(m));
    // garante pelo menos um principal
    if (!p.length && s.length) p = [s.shift()];
    if (!p.length) p = ["Peitoral"];
    return { principal: p, secundarios: s };
  },

  addExercicioCustom(nome, grupo, principal, secundarios, equipamento) {
    const clean = this.sanitizarMusculos(principal, secundarios);
    const ex = {
      id: "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      nome: String(nome).trim().slice(0, 40) || "Exercício",
      grupo: GRUPOS.includes(grupo) ? grupo : "Peito",
      principal: clean.principal, secundarios: clean.secundarios,
      equipamento: equipamento ? String(equipamento).slice(0,20) : null,
      custom: true
    };
    this.s.exercicios.push(ex);
    this.save();
    return ex;
  },

  updateExercicioCustom(id, nome, grupo, principal, secundarios, equipamento) {
    const ex = this.s.exercicios.find(e => e.id === id);
    if (!ex) return;
    const clean = this.sanitizarMusculos(principal, secundarios);
    Object.assign(ex, {
      nome: String(nome).trim().slice(0, 40) || ex.nome,
      grupo: GRUPOS.includes(grupo) ? grupo : ex.grupo,
      principal: clean.principal, secundarios: clean.secundarios,
      equipamento: equipamento ? String(equipamento).slice(0,20) : null
    });
    this.save();
  },

  removeExercicio(id) {
    this.s.exercicios = this.s.exercicios.filter(e => e.id !== id);
    this.s.favoritos = this.s.favoritos.filter(f => f !== id);
    this.save();
  },

  toggleFavorito(id) {
    if (!this.exercicioPorId(id)) return false;
    const idx = this.s.favoritos.indexOf(id);
    if (idx >= 0) this.s.favoritos.splice(idx,1);
    else {
      if (this.s.favoritos.length >= 30) this.s.favoritos.shift();
      this.s.favoritos.push(id);
    }
    this.save();
    return idx < 0;
  },
  isFavorito(id){ return this.s.favoritos.includes(id); },
  favoritosExercicios(){
    return this.s.favoritos.map(id=> this.exercicioPorId(id)).filter(Boolean);
  },
  recentesExercicios(limite=6){
    const seen = new Set();
    const ordem = [...this.s.treinos].sort((a,b)=>b.data-a.data);
    const out=[];
    for (const t of ordem){
      if (!seen.has(t.exercicioId) && this.exercicioPorId(t.exercicioId)){
        seen.add(t.exercicioId);
        out.push(this.exercicioPorId(t.exercicioId));
        if (out.length>=limite) break;
      }
    }
    return out;
  },
  usoCount(id){ return this.s.treinos.filter(t=>t.exercicioId===id).length; },

  /* ---------- Rotinas (treinos pré-definidos) ---------- */
  rotinaPorId(id) {
    return this.s.rotinas.find(r => r.id === id) || null;
  },

  addRotina(nome, itens) {
    const cleanNome = String(nome).trim().slice(0, 40) || "Rotina";
    const r = {
      id: "r" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      nome: cleanNome,
      itens: itens.filter(i => this.exercicioPorId(i.exercicioId)).map(i => ({ exercicioId: i.exercicioId, series: Math.max(1, Math.min(20, +i.series || 3)) }))
    };
    if (!r.itens.length) return null;
    this.s.rotinas.push(r);
    this.save();
    return r;
  },

  updateRotina(id, nome, itens) {
    const r = this.rotinaPorId(id);
    if (!r) return;
    const cleanNome = String(nome).trim().slice(0, 40) || r.nome;
    const cleanItens = itens.filter(i => this.exercicioPorId(i.exercicioId)).map(i => ({ exercicioId: i.exercicioId, series: Math.max(1, Math.min(20, +i.series || 3)) }));
    if (!cleanItens.length) return;
    Object.assign(r, { nome: cleanNome, itens: cleanItens });
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
    if (!this.exercicioPorId(exId)) return null;
    const cleanSeries = series.map(s => ({ peso: Math.max(0, +s.peso), reps: Math.max(1, Math.min(100, +s.reps|0)) }))
      .filter(s => s.peso > 0 && s.reps > 0 && s.peso <= 1000);
    if (!cleanSeries.length) return null;
    const t = {
      id: "t" + Date.now().toString(36),
      exercicioId: exId,
      data: Date.now(),
      series: cleanSeries
    };
    this.s.treinos.push(t);
    this.save();
    return t;
  },

  /* ---------- Cardio ---------- */
  validarCardio(dados) {
    const erros = [];
    if (!dados.modalidade || !cardioModalidadePorId(dados.modalidade)) erros.push("Modalidade inválida.");
    const dur = parseFloat(dados.duracaoMin);
    if (isNaN(dur) || dur <= 0) erros.push("Duração deve ser maior que 0.");
    else if (dur > 600) erros.push("Duração máxima é 600 minutos.");
    if (dados.distanciaKm !== undefined && dados.distanciaKm !== "" && dados.distanciaKm !== null) {
      const d = parseFloat(dados.distanciaKm);
      if (isNaN(d) || d < 0) erros.push("Distância não pode ser negativa.");
      else if (d > 300) erros.push("Distância máxima é 300 km.");
    }
    if (dados.calorias !== undefined && dados.calorias !== "" && dados.calorias !== null) {
      const c = parseFloat(dados.calorias);
      if (isNaN(c) || c < 0) erros.push("Calorias não pode ser negativa.");
      else if (c > 20000) erros.push("Calorias muito altas.");
    }
    if (dados.inclinacao !== undefined && dados.inclinacao !== "" && dados.inclinacao !== null) {
      const v = parseFloat(dados.inclinacao);
      if (isNaN(v) || v < 0 || v > 60) erros.push("Inclinação deve estar entre 0 e 60.");
    }
    if (dados.andares !== undefined && dados.andares !== "" && dados.andares !== null) {
      const v = parseInt(dados.andares, 10);
      if (isNaN(v) || v < 0 || v > 5000) erros.push("Andares inválido.");
    }
    return erros;
  },

  addCardio(dados) {
    const erros = this.validarCardio(dados);
    if (erros.length) return { ok: false, erros };
    const modalidade = dados.modalidade;
    const dur = Math.max(1, Math.min(600, parseFloat(dados.duracaoMin)));
    const distRaw = dados.distanciaKm;
    const dist = (distRaw === "" || distRaw == null) ? null : Math.max(0, Math.min(300, parseFloat(distRaw)));
    const calRaw = dados.calorias;
    const calorias = (calRaw === "" || calRaw == null) ? null : Math.max(0, Math.min(20000, parseInt(calRaw,10)));
    if (dist != null && isNaN(dist)) return { ok:false, erros:["Distância inválida"] };
    // cálculo derivado
    let velocidade = null, pace = null;
    if (dist != null && dur > 0) {
      velocidade = +(dist / (dur / 60)).toFixed(2); // km/h
      const paceMin = dur / dist;
      pace = isFinite(paceMin) ? paceMin : null;
    }
    if (dados.velocidade != null && dados.velocidade !== "" ) {
      const v = parseFloat(dados.velocidade);
      if (!isNaN(v) && v > 0) velocidade = Math.min(60, v);
    }
    const c = {
      id: "k" + Date.now().toString(36) + Math.random().toString(36).slice(2,4),
      modalidade,
      data: Date.now(),
      duracaoMin: dur,
      distanciaKm: dist,
      velocidadeKmH: velocidade,
      paceMinPerKm: pace,
      calorias,
      inclinacao: dados.inclinacao != null && dados.inclinacao !== "" ? parseFloat(dados.inclinacao) : null,
      resistencia: dados.resistencia != null && dados.resistencia !== "" ? String(dados.resistencia).slice(0,20) : null,
      andares: dados.andares != null && dados.andares !== "" ? Math.max(0, Math.min(5000, parseInt(dados.andares,10))) : null,
      estilo: dados.estilo ? String(dados.estilo).slice(0,30) : null,
      obs: dados.obs ? String(dados.obs).slice(0, 200) : null
    };
    // sanitizar NaNs para null
    if (c.inclinacao != null && isNaN(c.inclinacao)) c.inclinacao = null;
    if (c.andares != null && isNaN(c.andares)) c.andares = null;
    this.s.cardios.push(c);
    this.save();
    return { ok: true, cardio: c };
  },

  removeCardio(id) {
    this.s.cardios = this.s.cardios.filter(c => c.id !== id);
    this.save();
  },

  statsCardio() {
    const cs = this.s.cardios || [];
    if (!cs.length) return { total:0, tempo:0, dist:0, modalidades:{} };
    const tempo = cs.reduce((n,c)=>n+(c.duracaoMin||0),0);
    const dist = cs.reduce((n,c)=>n+(c.distanciaKm||0),0);
    const porMod = {};
    for (const c of cs) porMod[c.modalidade] = (porMod[c.modalidade]||0)+1;
    const maisPraticada = Object.entries(porMod).sort((a,b)=>b[1]-a[1])[0];
    const maiorDist = Math.max(...cs.map(c=>c.distanciaKm||0),0);
    const maiorDur = Math.max(...cs.map(c=>c.duracaoMin||0),0);
    // melhor pace (menor min/km) entre os que têm pace
    const paces = cs.filter(c=>c.paceMinPerKm && c.paceMinPerKm>0 && c.distanciaKm>0).map(c=>c.paceMinPerKm);
    const melhorPace = paces.length ? Math.min(...paces) : null;
    return { total: cs.length, tempo, dist, porMod, maisPraticada, maiorDist, maiorDur, melhorPace };
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
      if (typeof data.personagem.nivel !== "number" || data.personagem.nivel < 1 || data.personagem.nivel > 999) {
        throw new Error("Nível inválido");
      }
      const migrado = this.migrar(Object.assign(this.novo(), data));
      // valida estruturas críticas
      if (data.treinos && !Array.isArray(data.treinos)) throw new Error("Treinos inválido");
      if (data.cardios && !Array.isArray(data.cardios)) throw new Error("Cardios inválido");
      this.s = Object.assign(this.novo(), migrado);
      // merge defensivo já feito no migrar, mas garante novamente
      this.s.personagem = Object.assign({ nome:"Aventureiro", nivel:1, xp:0, ouro:0 }, migrado.personagem);
      this.s.streak = Object.assign({ atual:0, melhor:0, ultimoDia:null }, migrado.streak);
      this.s.config = Object.assign({ som:true }, migrado.config);
      if (!Array.isArray(this.s.cardios)) this.s.cardios = [];
      this.save();
      return true;
    } catch (e) {
      console.error("Import falhou:", e);
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
    try {
      localStorage.setItem(SESSAO_KEY, JSON.stringify(dados));
    } catch(e) {}
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
  },

  /* ---------- Cosméticos do guerreiro ---------- */
  comprarCosmetico(id, preco) {
    const p = this.s.personagem;
    if (typeof preco !== "number" || preco <= 0) return false;
    if (p.ouro < preco) return false;
    if (this.s.inventario.includes(id)) return false;
    p.ouro -= preco;
    this.s.inventario.push(id);
    this.save();
    return true;
  },

  equiparCosmetico(slot, id) {
    if (!this.s.personagem.equipamento) return false;
    if (!Warrior || !Warrior.SLOTS || !Warrior.SLOTS[slot]) return false;
    const exists = Warrior.porId(id);
    if (!exists || exists.slot !== slot) {
      if (id !== Warrior.SLOTS[slot].padrao) return false;
    } else {
      // bloqueia equipar item da loja/recompensa não possuído
      if (typeof Warrior.possui === "function" && !Warrior.possui(this.s, id)) return false;
    }
    this.s.personagem.equipamento[slot] = id;
    this.save();
    return true;
  }
};
