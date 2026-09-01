/* ================================================================
   EXERCITIUM — Interface & Fluxos
   ================================================================ */

const UI = {

  /* ================= INICIALIZAÇÃO / ROTEAMENTO ================= */
  telaAtual: "tavern",
  sessao: null,
  _forjaAba: "cabeca",     // aba ativa na Forja
  _forjaPrevia: null,      // prévia de equipamento {slot,id}     // sessão de treino em andamento
  _pickCtx: null,   // contexto de seleção de exercício ({modo:"rotina"|"livre"})
  _rotEdit: null,   // rascunho do editor de rotina
  _finalizando: false,          // proteção contra finalização dupla
  _cooldownMs: 10000,           // intervalo entre séries registradas
  _cooldownAte: 0,              // timestamp em que o cooldown expira
  _cooldownTimer: null,         // intervalo de atualização do contador
  _chronoTimer: null,
  _chronoStart: 0,
  _chronoPaused: 0,
  _chronoAcc: 0,
  _salvandoCardio: false,
  _cardioMod: "esteira",
  _cardioDraftKey: "exercitium_cardio_draft_v1",
  _histFiltro: "todos",
  _exFiltro: "Todos",
  _exSubFiltro: "Todos",
  _busca: "",
  _buscaTimer: null,
  _comprando: false,

  init() {
    State.init();
    this.bindGlobal();
    this.showScreen("tavern");
    this.updateHUD();
  },

  /* persiste a sessão atual imediatamente ("save game") */
  _persistirSessao() {
    if (this.sessao) State.salvarSessao(this.sessao);
  },

  bindGlobal() {
    document.body.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const a = btn.dataset.action;
      const arg = btn.dataset.arg;
      const fn = this.actions[a];
      if (fn) fn.call(this, arg, btn);
    });
  },

  showScreen(nome) {
    this.telaAtual = nome;
    // parar cronômetro se saiu do treino
    if (nome !== "workout") this._stopChrono();
    document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
    const scr = document.getElementById("screen-" + nome);
    if (scr) { scr.classList.remove("hidden"); scr.innerHTML = ""; }
    this.updateHUD();
    if (this["render_" + nome]) this["render_" + nome](scr);
    if (nome === "workout" && this.sessao) this._startChrono();
  },

  updateHUD() {
    const hud = document.getElementById("hud");
    hud.classList.remove("hidden");
    const p = State.s.personagem;
    document.getElementById("hud-name").textContent = `${p.nome} · NV ${p.nivel}`;
    document.getElementById("hud-gold").textContent = `🪙 ${fmtNum(p.ouro)}`;
    document.getElementById("hud-streak").textContent = `🔥 ${State.s.streak.atual}`;
    const need = Game.xpNecessario(p.nivel);
    const pct = Math.min(100, Math.round((p.xp / need) * 100));
    const bar = document.querySelector("#hud-xpbar .xpbar-fill");
    bar.style.width = pct + "%";
    document.getElementById("hud-xptext").textContent = `${p.xp}/${need} XP`;
  },

  /* ================= HELPERS DE MODAL / TOAST ================= */
  modal(html) {
    const ov = document.getElementById("overlay");
    document.getElementById("modal-root").innerHTML = `<div class="modal">${html}</div>`;
    ov.classList.remove("hidden");
  },
  fecharModal() {
    document.getElementById("overlay").classList.add("hidden");
  },
  toast(msg) {
    const t = document.createElement("div");
    t.className = "toast";
    t.style.setProperty("--life", "2.4s");
    t.innerHTML = msg;
    document.getElementById("toasts").appendChild(t);
    setTimeout(() => t.remove(), 2900);
  },
  floatXP(texto, dourado = false) {
    const f = document.createElement("div");
    f.className = "float-xp" + (dourado ? " float-gold" : "");
    f.textContent = texto;
    f.style.left = (50 + (Math.random() * 20 - 10)) + "%";
    f.style.top = "40%";
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 1200);
  },
  confete() {
    const emojis = ["✨", "⚔", "🏆", "🪙", "⭐"];
    for (let i = 0; i < 18; i++) {
      const c = document.createElement("div");
      c.className = "confetti-bit";
      c.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      c.style.left = (5 + Math.random() * 90) + "%";
      c.style.top = "-5%";
      c.style.animationDelay = (Math.random() * .4) + "s";
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 2200);
    }
  },

  /* ---------- Celebrações em fila ---------- */
  filaCelebracoes: [],
  celebrar(eventos) {
    // eventos: [{tipo:"record"...},{tipo:"levelup"...},{tipo:"conquista"...}]
    this.filaCelebracoes.push(...eventos);
    this.proximaCelebracao();
  },
  proximaCelebracao() {
    const ev = this.filaCelebracoes.shift();
    if (!ev) return;
    if (ev.tipo === "levelup") {
      this.confete();
      this.modal(`
        <div class="m-icon">⚔</div>
        <h2>NÍVEL AUMENTOU!</h2>
        <p>Você alcançou o <b>nível ${ev.nivel}</b>.</p>
        <p class="m-sub">Recompensa: 🪙 +${ev.ouro} de ouro</p>
        <div class="ornament">✦ ✦ ✦</div>
        <button class="btn btn-primary" data-action="next-celebration">CONTINUAR</button>
      `);
    } else if (ev.tipo === "record") {
      this.modal(`
        <div class="m-icon">🏆</div>
        <h2>NOVO RECORDE!</h2>
        <p class="m-sub">${ev.exNome}</p>
        <p style="margin-top:.3rem">${ev.label}</p>
        <div class="m-big">${ev.novo}</div>
        ${ev.antigo ? `<p class="m-old">Antigo recorde: ${ev.antigo}</p>` : `<p class="m-old">Primeiro registro!</p>`}
        <div class="m-gain">+${ev.xp} XP</div>
        <div class="ornament">✦ ✦ ✦</div>
        <button class="btn btn-primary" data-action="next-celebration">CONTINUAR</button>
      `);
    } else if (ev.tipo === "conquista") {
      this.confete();
      this.modal(`
        <div class="m-icon">${ev.icone}</div>
        <h2>CONQUISTA DESBLOQUEADA</h2>
        <p><b>${ev.nome}</b></p>
        <p class="m-sub">${ev.desc}</p>
        <div class="m-gain">+${ev.xp} XP · 🪙 +${ev.ouro}</div>
        <div class="ornament">✦ ✦ ✦</div>
        <button class="btn btn-primary" data-action="next-celebration">CONTINUAR</button>
      `);
    }
  },

  /* ================= AÇÕES GLOBAIS ================= */
  actions: {
    "goto-tavern":      function () { this._stopChrono(); this.showScreen("tavern"); }, // sessão em andamento permanece salva
    "start-workout":    function () { this.showScreen("workoutstart"); },
    "goto-exercises":   function () { this._modoTreino = false; this._pickCtx = null; this.showScreen("exercises"); },
    "goto-cardio":      function () { this._cardioMod = this._cardioMod || "esteira"; this.showScreen("cardio"); },
    "select-cardio-mod":function (id) { this._cardioMod = id; this._salvarCardioDraft(); this.render_cardio(document.getElementById("screen-cardio")); },
    "submit-cardio":    function () { this._salvarCardio(); },
    "delete-cardio":    function (id) { this.confirmarDeleteCardio(id); },
    "confirm-delete-cardio": function(id){ State.removeCardio(id); this.fecharModal(); this.toast("🗑 Cardio removido."); this.render_cardio(document.getElementById("screen-cardio")); this.updateHUD(); },
    "filter-history":   function (f) { this._histFiltro = f || "todos"; this.render_history(document.getElementById("screen-history")); },
    "filter-grupo":     function (g) { this._exFiltro = g || "Todos"; this._exSubFiltro="Todos"; this.render_exercises(document.getElementById("screen-exercises")); },
    "filter-sub":       function (s) { this._exSubFiltro = s || "Todos"; this.render_exercises(document.getElementById("screen-exercises")); },
    "toggle-favorito":  function (id) { const fav = State.toggleFavorito(id); this.toast(fav? "⭐ Favoritado":"☆ Removido dos favoritos"); this.render_exercises(document.getElementById("screen-exercises")); },
    "chrono-toggle":    function () { this._toggleChrono(); },
    "chrono-reset":     function () { this._resetChrono(); },
    "goto-records":     function () { this.showScreen("records"); },
    "goto-character":   function () { this.showScreen("character"); },
    "goto-achievements":function () { this.showScreen("achievements"); },
    "goto-history":     function () { this.showScreen("history"); },
    "goto-saves":       function () { this.showScreen("saves"); },
    "goto-stats":       function () { this.showScreen("stats"); },
    "goto-forja":       function () { this._forjaPrevia = null; this.showScreen("forja"); },
    "forja-aba":        function (slot) { this._forjaAba = slot; this._forjaPrevia = null; this.render_forja(document.getElementById("screen-forja")); },
    "select-item":      function (id) {
      const item = Warrior.porId(id);
      if (!item) return;
      const st = Warrior.statusItem(State.s, item);
      if (st.acao === "bloqueado" || st.acao === "caro") {
        this.toast(`🔒 ${st.motivo}`);
        return;
      }
      this._forjaPrevia = { slot: item.slot, id };
      this.render_forja(document.getElementById("screen-forja"));
    },
    "confirm-preview":  function () { this.confirmarPrevia(); },
    "cancel-preview":   function () { this.cancelarPrevia(); },
    "buy-item":         function (id) { this.comprarItem(id); },
    "equip-item":       function (id) {
      const item = Warrior.porId(id);
      if (!item) return;
      if (!Warrior.possui(State.s, id)) {
        const st = Warrior.statusItem(State.s, item);
        this.toast(`🔒 ${st.motivo}`);
        return;
      }
      if (!State.equiparCosmetico(item.slot, id)) {
        this.toast(`🔒 Não foi possível equipar.`);
        return;
      }
      this.toast(`⚔ ${escapar(item.nome)} equipado!`);
      this.render_forja(document.getElementById("screen-forja"));
    },
    "unequip-item":     function (slot) {
      State.equiparCosmetico(slot, Warrior.SLOTS[slot].padrao);
      this.render_forja(document.getElementById("screen-forja"));
    },
    "back":             function () { this.showScreen("tavern"); },

    "select-evolution": function (id) { this.detalheExercicio(id); },
    "select-exercise": function (id) {
      if (this._pickCtx) { this._pickExercicio(id); return; }
      if (this._modoTreino) {
        this.iniciarSessaoUnica(id);
      } else {
        this.detalheExercicio(id);
      }
    },
    "new-exercise": function () { this.formExercicio(); },
    "edit-exercise": function (id) { this.formExercicio(id); },
    "delete-exercise": function (id) { this.confirmarDeleteExercicio(id); },
    "toggle-muscle": function (arg, btn) {
      btn.classList.toggle("on");
    },
    "submit-exercise": function () { this.salvarExercicioForm(); },

    /* ---- rotinas ---- */
    "start-free":       function () { this.iniciarSessaoLivre(); },
    "start-routine":    function (id) { this.iniciarSessaoRotina(id); },
    "new-routine":      function () {
      this._rotEdit = { id: null, nome: "", itens: [] };
      this.showScreen("rotinaedit");
    },
    "edit-routine":     function (id) {
      const r = State.rotinaPorId(id);
      if (!r) return;
      this._rotEdit = JSON.parse(JSON.stringify(r));
      this.showScreen("rotinaedit");
    },
    "delete-routine":   function (id) { this.confirmarDeleteRotina(id); },
    "confirm-delete-routine": function (id) {
      State.removeRotina(id);
      this.fecharModal();
      this.toast("🗑 Rotina removida.");
      this.render_workoutstart(document.getElementById("screen-workoutstart"));
    },
    "routine-add-exercise": function () {
      this._pickCtx = { modo: "rotina" };
      this.showScreen("exercises");
    },
    "rot-move": function (arg, btn) {
      const [idxStr, dirStr] = arg.split(":");
      const itens = this._rotEdit.itens;
      const i = +idxStr, j = i + (+dirStr);
      if (j < 0 || j >= itens.length) return;
      [itens[i], itens[j]] = [itens[j], itens[i]];
      this.render_rotinaedit(document.getElementById("screen-rotinaedit"));
    },
    "rot-series": function (arg, btn) {
      const [idxStr, delta] = arg.split(":");
      const it = this._rotEdit.itens[+idxStr];
      if (!it) return;
      it.series = Math.max(1, Math.min(20, it.series + +delta));
      this.render_rotinaedit(document.getElementById("screen-rotinaedit"));
    },
    "rot-remove-item": function (idx, btn) {
      this._rotEdit.itens.splice(+idx, 1);
      this.render_rotinaedit(document.getElementById("screen-rotinaedit"));
    },
    "save-routine": function () { this.salvarRotina(); },
    "cancel-routine-edit": function () {
      this._rotEdit = null;
      this.showScreen("workoutstart");
    },

    /* ---- sessão de treino ---- */
    "add-set":          function () { this.registrarSerieSessao(); },
    "remove-set":       function (arg) {
      const [itemIdx, setIdx] = arg.split(":").map(Number);
      this.removerSerieSessao(itemIdx, setIdx);
    },
    "sess-active":      function (idx) { this.ativarItemSessao(+idx); },
    "sess-goto":        function (idx) {
      const s = this.sessao;
      if (!s) return;
      const novo = +idx;
      if (novo >= 0 && novo < s.items.length) {
        s.idx = novo;
        this._persistirSessao();
      }
      this.render_workout(document.getElementById("screen-workout"));
    },
    "chip-fill":       function (arg, btn) {
      document.getElementById("inp-peso").value = btn.dataset.peso;
      document.getElementById("inp-reps").value = btn.dataset.reps;
      document.getElementById("inp-peso").focus();
    },
    "finish-session":  function () { this.finalizarSessao(); }, // funciona mesmo durante o cooldown
    "discard-session": function () { this.confirmarDescarte(); },
    "confirm-discard-session": function () {
      this._encerrarEstadoTreino();
      this.fecharModal();
      this.toast("Treino descartado.");
      this.showScreen("tavern");
    },
    /* ---- recuperação de sessão salva ---- */
    "recover-session": function () {
      const salva = State.carregarSessao();
      if (!salva) return;
      // normaliza campos essenciais para retomar exatamente de onde parou
      this.sessao = {
        tipo: salva.tipo,
        rotinaId: salva.rotinaId,
        nome: salva.nome || "Treino",
        items: salva.items.map(i => ({
          exId: i.exId,
          planejadas: +i.planejadas || 0,
          series: (i.series || []).map(x => ({ peso: +x.peso, reps: +x.reps }))
        })),
        idx: Math.min(+salva.idx || 0, salva.items.length - 1),
        iniciadaEm: salva.iniciadaEm || Date.now()
      };
      State.salvarSessao(this.sessao); // continua in_progress
      this.showScreen("workout");
    },
    "ask-discard-saved": function () { this.confirmarDescarte(); },
    "add-session-exercise": function () {
      this._pickCtx = { modo: "livre" };
      this.showScreen("exercises");
    },
    "remove-session-item": function (idx) {
      const s = this.sessao;
      if (!s || s.items.length <= 1) return;
      s.items.splice(+idx, 1);
      s.idx = Math.min(s.idx, s.items.length - 1);
      this._persistirSessao();
      this.render_workout(document.getElementById("screen-workout"));
    },
    "back-to-session": function () {
      this._pickCtx = null;
      this.showScreen("workout");
    },
    "goto-rotinaedit": function () {
      this._pickCtx = null;
      this.showScreen("rotinaedit");
    },

    "export-save": function () { State.exportar(); this.toast("💾 Save exportado!"); },
    "import-save": function () { this.importarSave(); },
    "reset-all": function () { this.confirmarReset(); },
    "rename-character": function () { this.renomearPersonagem(); },

    "close-modal": function () { this.fecharModal(); },
    "confirm-delete-exercise": function (id) {
      State.removeExercicio(id);
      this.fecharModal();
      this.toast("🗑 Exercício removido.");
      this.render_exercises(document.getElementById("screen-exercises"));
    },
    "do-reset": function () {
      this._encerrarEstadoTreino();
      this._rotEdit = null;
      this._busca = "";
      State.resetarTudo();
      this.fecharModal();
      this.toast("🔄 Dados zerados. Uma nova jornada começa!");
      // reinicializa a interface no estado inicial (biblioteca padrão intacta)
      this.showScreen("tavern");
    },
    "next-celebration": function () {
      this.fecharModal();
      this.proximaCelebracao();
    },
    "finish-continue": function () {
      this.fecharModal();
      this.proximaCelebracao();
    }
  },

  tituloPorNivel(nivel) {
    return nivel >= 40 ? "Lenda Viva"
      : nivel >= 25 ? "Cavaleiro de Ferro"
      : nivel >= 15 ? "Guerreiro"
      : nivel >= 8 ? "Escudeiro"
      : "Novato da Taverna";
  },

  /* ================= TAVERNA ================= */
  render_tavern(scr) {
    const p = State.s.personagem;
    const st = State.s.streak;
    const stats = this.statsGlobais();
    const need = Game.xpNecessario(p.nivel);

    // tendência de volume: mês atual vs mês anterior
    const meses = Stats.volumePorPeriodo(State.s, "mes", 2);
    let volLinha = "";
    if (meses.length && meses[meses.length - 1].valor > 0) {
      const atual = meses[meses.length - 1].valor;
      const anterior = meses.length > 1 ? meses[0].valor : 0;
      if (anterior > 0) {
        const delta = Math.round((atual - anterior) / anterior * 100);
        volLinha = `<div class="cs-row"><span>📈 Volume este mês</span><span class="cs-val">${fmtNum(atual)} kg (${delta >= 0 ? "+" : ""}${delta}%)</span></div>`;
      } else {
        volLinha = `<div class="cs-row"><span>📈 Volume este mês</span><span class="cs-val">${fmtNum(atual)} kg</span></div>`;
      }
    }

    scr.innerHTML = `
      <div class="tavern-banner">
        <h1 class="game-title">EXERCITIUM</h1>
        <p class="game-subtitle">⚔ Crônicas do Ferro ⚔</p>
      </div>

      ${this._htmlRecuperacao()}

      <div class="parchment character-summary">
        <div class="sum-top">
          <div class="sum-warrior" title="Veja a ficha completa em Personagem">${Warrior.svg(State.s)}</div>
          <div class="sum-id">
            <div class="cs-name">${escapar(p.nome)}</div>
            <div class="char-class">${this.tituloPorNivel(p.nivel)}</div>
          </div>
        </div>
        <div class="xpbar big"><div class="xpbar-fill" style="width:${Math.min(100, p.xp/need*100)}%"></div><span class="xpbar-text">Nível ${p.nivel} · ${fmtNum(p.xp)}/${fmtNum(need)} XP</span></div>
        <div class="cs-row"><span>🪙 Ouro</span><span class="cs-val">🪙 ${fmtNum(p.ouro)}</span></div>
        <div class="cs-row"><span>🔥 Streak</span><span class="cs-val">${st.atual} dias</span></div>
        <div class="cs-row"><span>⚔ Treinos</span><span class="cs-val">${stats.numTreinos}</span></div>
        <div class="cs-row"><span>🏆 Recordes</span><span class="cs-val">${stats.recordes}</span></div>
        ${volLinha}
      </div>

      <button class="btn btn-primary btn-big" data-action="start-workout">⚔ INICIAR TREINO</button>
      <button class="btn" data-action="goto-cardio" style="margin-top:.6rem;">🏃 REGISTRAR CARDIO</button>

      <nav class="menu">
        <button class="menu-item" data-action="goto-exercises"><span class="mi-icon">📜</span><span>Exercícios</span></button>
        <button class="menu-item" data-action="goto-cardio"><span class="mi-icon">🏃</span><span>Cardio</span></button>
        <button class="menu-item" data-action="goto-stats"><span class="mi-icon">📈</span><span>Evolução</span></button>
        <button class="menu-item" data-action="goto-character"><span class="mi-icon">👤</span><span>Personagem</span></button>
        <button class="menu-item" data-action="goto-forja"><span class="mi-icon">🏪</span><span>Forja</span></button>
        <button class="menu-item" data-action="goto-records"><span class="mi-icon">🏆</span><span>Recordes</span></button>
        <button class="menu-item" data-action="goto-achievements"><span class="mi-icon">🎖</span><span>Conquistas</span></button>
        <button class="menu-item" data-action="goto-history"><span class="mi-icon">📖</span><span>Histórico</span></button>
        <button class="menu-item" data-action="goto-saves"><span class="mi-icon">💾</span><span>Saves</span></button>
      </nav>
    `;
  },

  statsGlobais() {
    const s = State.s;
    return {
      numTreinos: s.treinos.length,
      numSeries: totalSeries(s),
      volume: volumeTotalGeral(s),
      recordes: recordesQuebrados(s)
    };
  },

  _norm(s){ return String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim(); },
  _subcategoriaPeito(nome){ const n=this._norm(nome); if(n.includes("inclinado")||n.includes("superior")) return "Superior"; if(n.includes("declinado")||n.includes("inferior")||n.includes("dips")) return "Inferior"; return "Geral"; },
  _subcategoriaCostas(ex){ const n=this._norm(ex.nome); const p=(ex.principal||[]).join(" "); if(p.includes("Trapézio")|| n.includes("encolhimento")|| n.includes("face pull")|| n.includes("remada alta")) return "Trapézio"; if(n.includes("remada")) return "Espessura"; return "Dorsais"; },
  _subcategoriaOmbro(ex){ const p=(ex.principal||[]).join(" "); if(p.includes("Deltoide Anterior")) return "Anterior"; if(p.includes("Deltoide Posterior")) return "Posterior"; if(p.includes("Deltoide Lateral")) return "Lateral"; return "Geral"; },
  _subcategoriaPerna(ex){ const p=(ex.principal||[]).join(" "); if(p.includes("Panturrilha")) return "Panturrilha"; if(p.includes("Glúteos")&&!p.includes("Quadríceps")) return "Glúteos"; if(p.includes("Posterior")) return "Posteriores"; if(p.includes("Quadríceps")) return "Quadríceps"; return "Geral"; },
  _matchFiltro(ex,filtro){
    if(filtro==="Todos") return true;
    if(filtro==="Peito") return ex.grupo==="Peito";
    if(filtro==="Costas") return ex.grupo==="Costas";
    if(filtro==="Ombros") return ex.grupo==="Ombros";
    if(filtro==="Braços") return ex.grupo==="Bíceps"||ex.grupo==="Tríceps";
    if(filtro==="Antebraço") return ex.grupo==="Antebraço";
    if(filtro==="Pernas") return ex.grupo==="Pernas";
    if(filtro==="Glúteos") return (ex.principal||[]).includes("Glúteos");
    if(filtro==="Core") return ex.grupo==="Abdômen";
    return true;
  },
  _matchSub(ex,sub){
    if(sub==="Todos") return true;
    const g=this._exFiltro;
    if(g==="Peito") return this._subcategoriaPeito(ex.nome)===sub;
    if(g==="Costas") return this._subcategoriaCostas(ex)===sub;
    if(g==="Ombros") return this._subcategoriaOmbro(ex)===sub;
    if(g==="Pernas") return this._subcategoriaPerna(ex)===sub;
    return true;
  },

  /* ================= EXERCÍCIOS ================= */
  render_exercises(scr) {
    const busca = this._busca || "";
    const filtro = this._exFiltro || "Todos";
    const sub = this._exSubFiltro || "Todos";
    const buscaNorm = this._norm(busca);
    const termos = buscaNorm ? buscaNorm.split(/\s+/).filter(Boolean) : [];
    const todosRaw = State.todosExercicios();
    const filtrados = todosRaw.filter(e=>{
      if(!this._matchFiltro(e,filtro)) return false;
      if(!this._matchSub(e,sub)) return false;
      if(termos.length){
        const hay = this._norm(e.nome+" "+e.grupo+" "+(e.principal||[]).join(" ")+" "+(e.secundarios||[]).join(" ")+" "+(e.equipamento||""));
        return termos.every(t=> hay.includes(t));
      }
      return true;
    }).sort((a, b) =>
        GRUPOS.indexOf(a.grupo) - GRUPOS.indexOf(b.grupo) ||
        a.nome.localeCompare(b.nome));

    let titulo = "📜 Biblioteca de Exercícios";
    if (this._pickCtx?.modo === "rotina") titulo = "📜 Adicionar à Rotina";
    else if (this._pickCtx?.modo === "livre") titulo = "📜 Exercício do Treino Livre";
    else if (this._modoTreino) titulo = "📜 Escolha seu desafio";

    const voltarAction = this._pickCtx
      ? (this._pickCtx.modo === "rotina" ? "goto-rotinaedit" : "back-to-session")
      : "back";

    const FILTROS = ["Todos","Peito","Costas","Ombros","Braços","Antebraço","Pernas","Glúteos","Core"];
    const subMap = {
      "Peito": ["Todos","Superior","Geral","Inferior"],
      "Costas": ["Todos","Dorsais","Espessura","Trapézio"],
      "Ombros": ["Todos","Anterior","Lateral","Posterior"],
      "Pernas": ["Todos","Quadríceps","Posteriores","Glúteos","Panturrilha"]
    };
    const subs = subMap[filtro] || null;

    let html = `
      <div class="workout-head">
        <h1 class="workout-ex-name">${titulo}</h1>
        <button class="btn btn-ghost" data-action="${voltarAction}" style="width:auto;margin:.6rem auto;padding:.4rem 1.2rem;font-size:.8rem;">← Voltar</button>
      </div>
      <input type="search" id="busca-ex" class="search-input" placeholder="🔎 Buscar exercício... (ex: supino, peito maquina, lateral)" value="${escapar(busca)}">
      <div style="display:flex;gap:.35rem;flex-wrap:wrap;margin-bottom:.6rem;">
        ${FILTROS.map(f=> `<button class="chip ${f===filtro?"on":""}" data-action="filter-grupo" data-arg="${f}" style="${f===filtro?"background:rgba(184,146,58,.18);border-color:var(--gold);color:var(--gold-bright)":""}">${f}</button>`).join("")}
      </div>
      ${subs? `<div style="display:flex;gap:.3rem;flex-wrap:wrap;margin-bottom:.7rem;">${subs.map(s=> `<button class="chip ${s===sub?"on":""}" data-action="filter-sub" data-arg="${s}" style="font-size:.82rem;${s===sub?"background:rgba(184,146,58,.18);border-color:var(--gold);color:var(--gold-bright)":""}">${s}</button>`).join("")}</div>`:""}
    `;

    // Favoritos e Recentes apenas quando sem busca e filtro Todos e sem contexto de pick
    if(!buscaNorm && filtro==="Todos" && !this._pickCtx){
      const favs = State.favoritosExercicios();
      const recentes = State.recentesExercicios(6);
      if(favs.length){
        html += `<div class="group-header">⭐ MEUS FAVORITOS</div><div class="ex-list">`;
        for(const ex of favs){
          const st = State.statsExercicio(ex.id);
          html += `<div style="display:flex;gap:.35rem;align-items:stretch;">
            <button class="ex-item" style="flex:1;border-left-color:var(--gold)" data-action="select-exercise" data-arg="${ex.id}">
              <div class="ex-info"><div>⭐ ${ex.nome}</div><div class="ex-muscles">${ex.grupo} · ${ex.principal.join(", ")}</div></div>
              <div class="ex-stats">${st.numTreinos?`⚒ ${st.numTreinos}`:""}</div>
            </button>
            <button class="icon-btn" data-action="toggle-favorito" data-arg="${ex.id}" title="Desfavoritar">⭐</button>
          </div>`;
        }
        html += `</div>`;
      }
      if(recentes.length){
        html += `<div class="group-header">🕘 MAIS USADOS</div><div class="ex-list">`;
        for(const ex of recentes){
          const st = State.statsExercicio(ex.id);
          html += `<div style="display:flex;gap:.35rem;align-items:stretch;">
            <button class="ex-item" style="flex:1" data-action="select-exercise" data-arg="${ex.id}">
              <div class="ex-info"><div>${ex.nome}</div><div class="ex-muscles">${ex.grupo} · ${ex.principal.join(", ")}</div></div>
              <div class="ex-stats">⚒ ${State.usoCount(ex.id)} · ${st.maiorPeso? st.maiorPeso.valor+"kg":""}</div>
            </button>
            <button class="icon-btn ${State.isFavorito(ex.id)?"on":""}" data-action="toggle-favorito" data-arg="${ex.id}" title="Favoritar">${State.isFavorito(ex.id)?"⭐":"☆"}</button>
          </div>`;
        }
        html += `</div>`;
      }
    }

    html += `<div style="display:flex;justify-content:space-between;align-items:center;margin:.6rem 0 .3rem;"><span class="m-sub" style="font-size:.82rem;color:var(--text-dim)">${filtrados.length} exercícios</span><button class="btn" data-action="new-exercise" style="width:auto;padding:.35rem .9rem;font-size:.72rem;">✒ Criar Personalizado</button></div>`;

    if (filtrados.length === 0) html += `<p class="empty-msg">Nenhum exercício encontrado.<br>Tente termos diferentes ou limpe os filtros.</p>`;

    let grupoAtual = null;
    html += `<div class="ex-list">`;
    for (const ex of filtrados) {
      if (ex.grupo !== grupoAtual) {
        grupoAtual = ex.grupo;
        html += `<div class="group-header">${grupoAtual}</div>`;
      }
      const st = State.statsExercicio(ex.id);
      const musc = [ex.principal.join(", "), ex.secundarios.join(", ")].filter(Boolean).join(" · ");
      const equip = ex.equipamento ? ` · ${ex.equipamento}` : "";
      const fav = State.isFavorito(ex.id);
      html += `
        <div style="display:flex;gap:.35rem;align-items:stretch;">
          <button class="ex-item" style="flex:1" data-action="select-exercise" data-arg="${ex.id}">
            <div class="ex-info">
              <div>${ex.nome}${ex.padrao ? "" : ' <span title="Personalizado">✒</span>'}${equip? `<small style="color:var(--text-dim)"> ${escapar(equip)}</small>`:""}</div>
              <div class="ex-muscles">${musc}</div>
            </div>
            <div class="ex-stats">
              ${st.maiorPeso ? `🏅 ${st.maiorPeso.valor}kg<br>⚒ ${st.numTreinos}` : ""}
            </div>
          </button>
          <button class="icon-btn ${fav?"on":""}" data-action="toggle-favorito" data-arg="${ex.id}" title="${fav?"Desfavoritar":"Favoritar"}">${fav?"⭐":"☆"}</button>
          ${!this._modoTreino && !this._pickCtx ? `
            <button class="icon-btn" data-action="edit-exercise" data-arg="${ex.id}" title="Editar">✏</button>
            <button class="icon-btn danger" data-action="delete-exercise" data-arg="${ex.id}" title="Apagar">✕</button>` : ""}
        </div>`;
    }
    html += `</div>`;
    scr.innerHTML = html;

    const inp = document.getElementById("busca-ex");
    inp.addEventListener("input", () => {
      this._busca = inp.value;
      clearTimeout(this._buscaTimer);
      this._buscaTimer = setTimeout(() => {
        const pos = inp.selectionStart;
        this.render_exercises(scr);
        const novoInp = document.getElementById("busca-ex");
        if(novoInp){ novoInp.focus(); novoInp.setSelectionRange(pos, pos); }
      }, 180);
    });
  },

  formExercicio(id) {
    const ex = id ? State.exercicioPorId(id) : null;
    const chipsMusculos = (selecionados) => MUSCULOS.map(m =>
      `<button type="button" class="check-chip${(selecionados || []).includes(m) ? " on" : ""}" data-action="toggle-muscle" data-musculo="${m}">${m}</button>`
    ).join("");
    const EQUIPS = ["Barra","Halteres","Máquina","Smith","Cabo","Peso Corporal","Outro"];

    this.modal(`
      <h2>${ex ? "EDITAR EXERCÍCIO" : "NOVO EXERCÍCIO"}</h2>
      <div class="form-field">
        <label>Nome</label>
        <input type="text" id="fex-nome" maxlength="40" value="${ex ? escapar(ex.nome) : ""}" placeholder="Ex.: Elevação Y">
      </div>
      <div class="form-field">
        <label>Grupo muscular principal</label>
        <select id="fex-grupo">
          ${GRUPOS.map(g => `<option ${ex && ex.grupo === g ? "selected" : ""}>${g}</option>`).join("")}
        </select>
      </div>
      <div class="form-field">
        <label>Equipamento</label>
        <select id="fex-equip">
          <option value="">—</option>
          ${EQUIPS.map(e=> `<option ${ex && ex.equipamento===e?"selected":""}>${e}</option>`).join("")}
        </select>
      </div>
      <div class="form-field">
        <label>Músculos principais</label>
        <div class="check-group" id="fex-principal">${chipsMusculos(ex ? ex.principal : [])}</div>
      </div>
      <div class="form-field">
        <label>Músculos secundários</label>
        <div class="check-group" id="fex-sec">${chipsMusculos(ex ? ex.secundarios : [])}</div>
      </div>
      <div class="m-buttons">
        <button class="btn btn-ghost" data-action="close-modal">CANCELAR</button>
        <button class="btn btn-primary" data-action="submit-exercise" ${ex ? `data-arg="${ex.id}"` : ""}>SALVAR</button>
      </div>
    `);
  },

  salvarExercicioForm(id) {
    const nomeEl = document.getElementById("fex-nome");
    const nome = nomeEl.value.trim();
    if (!nome) {
      nomeEl.classList.add("input-err");
      this.toast("⚠ Dê um nome ao exercício (1–40 caracteres).");
      nomeEl.focus();
      return;
    }
    if (nome.length > 40) { this.toast("⚠ Nome muito longo (máx 40)."); return; }
    const grupo = document.getElementById("fex-grupo").value;
    if (!GRUPOS.includes(grupo)) { this.toast("⚠ Grupo inválido."); return; }
    const equipamento = document.getElementById("fex-equip")?.value || null;
    const pegar = (elId) => [...document.querySelectorAll(`#${elId} .check-chip.on`)].map(c => c.dataset.musculo);
    const principal = pegar("fex-principal");
    const secundarios = pegar("fex-sec");
    if (!principal.length) { this.toast("⚠ Selecione ao menos um músculo principal."); return; }
    // evita salvar duplicado rapidly
    if (this._salvandoEx) return; this._salvandoEx = true; setTimeout(()=> this._salvandoEx=false, 1200);
    if (id) {
      const alvoId = document.querySelector("[data-action='submit-exercise']")?.dataset.arg || id;
      if (String(alvoId).startsWith("p")) {
        State.addExercicioCustom(nome, grupo, principal, secundarios, equipamento);
        this.toast("✒ Cópia personalizada criada.");
      } else {
        State.updateExercicioCustom(alvoId, nome, grupo, principal, secundarios, equipamento);
        this.toast("✔ Exercício atualizado.");
      }
    } else {
      State.addExercicioCustom(nome, grupo, principal, secundarios, equipamento);
      this.toast("✒ Exercício criado!");
    }
    this.fecharModal();
    this.render_exercises(document.getElementById("screen-exercises"));
  },

  confirmarDeleteExercicio(id) {
    const ex = State.exercicioPorId(id);
    if (!ex) return;
    const temTreinos = State.treinosDoExercicio(id).length > 0;
    this.modal(`
      <div class="m-icon">☠</div>
      <h2>REMOVER EXERCÍCIO?</h2>
      <p><b>${escapar(ex.nome)}</b></p>
      ${temTreinos ? `<p class="m-sub">O histórico de treinos dele permanecerá salvo.</p>` : ""}
      ${ex.padrao ? `<p class="m-sub">Este é um exercício padrão da biblioteca.</p>` : ""}
      <div class="m-buttons">
        <button class="btn btn-ghost" data-action="close-modal">CANCELAR</button>
        <button class="btn btn-danger" data-action="confirm-delete-exercise" data-arg="${id}">REMOVER</button>
      </div>
    `);
  },

  confirmarDescarte() {
    this.modal(`
      <div class="m-icon">⚠</div>
      <h2>DESCARTAR TREINO?</h2>
      <p>Todo o progresso deste treino será perdido.</p>
      <p class="m-sub" style="margin-top:.4rem;">Essa ação não pode ser desfeita.</p>
      <div class="m-buttons">
        <button class="btn btn-ghost" data-action="close-modal">CANCELAR</button>
        <button class="btn btn-danger" data-action="confirm-discard-session">DESCARTAR</button>
      </div>
    `);
  },

  /* banner de treino em andamento, exibido na taverna */
  _htmlRecuperacao() {
    const salva = State.carregarSessao();
    if (!salva) return "";
    const numSeries = salva.items.reduce((n, i) => n + (i.series ? i.series.length : 0), 0);
    const data = salva.salvoEm ? new Date(salva.salvoEm).toLocaleString("pt-BR") : null;
    return `
      <div class="panel recovery">
        <div class="panel-title">⚔ Treino em Andamento</div>
        <p style="margin-bottom:.5rem;">Você possui um treino que ainda não foi finalizado.</p>
        <div class="cs-row"><span>${escapar(salva.nome || "Treino")}</span><span class="cs-val" style="color:var(--gold-bright);font-family:var(--font-pixel)">⚔ ${numSeries} série${numSeries === 1 ? "" : "s"}</span></div>
        ${data ? `<p class="m-sub" style="color:var(--text-dim);font-size:.8rem;">Salvo em ${data}</p>` : ""}
        <div style="display:flex;flex-direction:column;gap:.45rem;margin-top:.7rem;">
          <button class="btn btn-primary" data-action="recover-session">▶ CONTINUAR TREINO</button>
          <button class="btn btn-danger" data-action="ask-discard-saved">🗑 DESCARTAR TREINO</button>
        </div>
      </div>`;
  },

  /* ================= ESCOLHA DO TREINO ================= */
  render_workoutstart(scr) {
    const rotinas = State.s.rotinas;
    let html = `
      <div class="workout-head">
        <h1 class="workout-ex-name">⚔ Escolha Seu Treino</h1>
        <button class="btn btn-ghost" data-action="back" style="width:auto;margin:.6rem auto;padding:.4rem 1.2rem;font-size:.8rem;">← Taverna</button>
      </div>
    `;

    if (rotinas.length) {
      html += `<div class="rot-list">`;
      for (const r of rotinas) {
        const totalSeriesR = r.itens.reduce((n, i) => n + i.series, 0);
        html += `
          <div style="display:flex;gap:.35rem;align-items:stretch;">
            <button class="rot-card" data-action="start-routine" data-arg="${r.id}">
              <div class="rot-nome">⚔ ${escapar(r.nome)}</div>
              <div class="rot-info">${r.itens.length} exercício${r.itens.length !== 1 ? "s" : ""} · ${totalSeriesR} séries</div>
              <div class="rot-exs">${r.itens.map(i => escapar(State.exercicioPorId(i.exercicioId)?.nome || "?")).join(" · ")}</div>
            </button>
            <button class="icon-btn" data-action="edit-routine" data-arg="${r.id}" title="Editar">✏</button>
            <button class="icon-btn danger" data-action="delete-routine" data-arg="${r.id}" title="Apagar">✕</button>
          </div>`;
      }
      html += `</div><div class="ornament">✦ ✦ ✦</div>`;
    }

    html += `
      <button class="btn btn-primary free-btn" data-action="start-free">🏋 TREINO LIVRE</button>
      <p class="m-sub" style="text-align:center;color:var(--text-dim);font-size:.85rem;margin-top:-.4rem;margin-bottom:.8rem;">Escolha seus exercícios na hora</p>
      <button class="btn" data-action="new-routine">＋ CRIAR NOVO TREINO</button>
    `;
    scr.innerHTML = html;
  },

  /* ================= EDITOR DE ROTINA ================= */
  render_rotinaedit(scr) {
    const d = this._rotEdit;
    if (!d) { this.showScreen("tavern"); return; }
    const totalSeriesR = d.itens.reduce((n, i) => n + i.series, 0);

    const itens = d.itens.map((it, i) => {
      const ex = State.exercicioPorId(it.exercicioId);
      return `
        <div class="panel rot-item">
          <div class="rot-item-head">
            <span class="rot-ordem">☰ ${i + 1}</span>
            <span class="rot-item-nome">${escapar(ex?.nome || "?")}</span>
          </div>
          <div class="rot-item-controls">
            <div class="stepper">
              <button class="step-btn" data-action="rot-series" data-arg="${i}:-1">−</button>
              <span class="step-val">${it.series} série${it.series > 1 ? "s" : ""}</span>
              <button class="step-btn" data-action="rot-series" data-arg="${i}:1">＋</button>
            </div>
            <span class="rot-item-nav">
              <button class="icon-btn" data-action="rot-move" data-arg="${i}:-1" title="Mover para cima" ${i === 0 ? "disabled" : ""}>▲</button>
              <button class="icon-btn" data-action="rot-move" data-arg="${i}:1" title="Mover para baixo" ${i === d.itens.length - 1 ? "disabled" : ""}>▼</button>
              <button class="icon-btn danger" data-action="rot-remove-item" data-arg="${i}" title="Remover">✕</button>
            </span>
          </div>
        </div>`;
    }).join("");

    scr.innerHTML = `
      <div class="workout-head">
        <h1 class="workout-ex-name">${d.id ? "✒ Editar Rotina" : "✒ Nova Rotina"}</h1>
        <button class="btn btn-ghost" data-action="cancel-routine-edit" style="width:auto;margin:.6rem auto;padding:.4rem 1.2rem;font-size:.8rem;">← Cancelar</button>
      </div>

      <div class="panel">
        <div class="form-field" style="margin-bottom:${d.itens.length ? "0" : ".8rem"};">
          <label>Nome do treino</label>
          <input type="text" id="rot-nome" maxlength="40" value="${escapar(d.nome)}" placeholder="Ex.: Treino A — Peito e Tríceps">
        </div>
        ${d.itens.length ? `<p class="m-sub" style="color:var(--text-dim);font-size:.85rem;text-align:center;">${d.itens.length} exercícios · ${totalSeriesR} séries</p>` : ""}
      </div>

      ${itens || `<p class="empty-msg">Nenhum exercício ainda.<br>Adicione o primeiro!</p>`}

      <button class="btn" data-action="routine-add-exercise" style="margin-bottom:.8rem;">＋ ADICIONAR EXERCÍCIO</button>
      <button class="btn btn-primary" data-action="save-routine" ${d.itens.length ? "" : "disabled"}>💾 SALVAR ROTINA</button>
    `;
  },

  salvarRotina() {
    const d = this._rotEdit;
    if (!d) return;
    const nomeEl = document.getElementById("rot-nome");
    const nome = nomeEl ? nomeEl.value.trim() : d.nome;
    if (!nome) { this.toast("⚠ Dê um nome ao treino."); return; }
    if (!d.itens.length) { this.toast("⚠ Adicione pelo menos um exercício."); return; }
    if (d.id) State.updateRotina(d.id, nome, d.itens);
    else State.addRotina(nome, d.itens);
    this._rotEdit = null;
    this.toast("💾 Rotina salva!");
    this.showScreen("workoutstart");
  },

  confirmarDeleteRotina(id) {
    const r = State.rotinaPorId(id);
    if (!r) return;
    this.modal(`
      <div class="m-icon">☠</div>
      <h2>REMOVER ROTINA?</h2>
      <p><b>${escapar(r.nome)}</b></p>
      <p class="m-sub">O histórico de treinos já realizados permanecerá salvo.</p>
      <div class="m-buttons">
        <button class="btn btn-ghost" data-action="close-modal">CANCELAR</button>
        <button class="btn btn-danger" data-action="confirm-delete-routine" data-arg="${id}">REMOVER</button>
      </div>
    `);
  },

  /* seleção de exercício em contexto (rotina / treino livre) */
  _pickExercicio(id) {
    const ctx = this._pickCtx;
    this._pickCtx = null;
    if (!ctx) return;
    if (ctx.modo === "rotina") {
      const d = this._rotEdit;
      if (d && !d.itens.some(i => i.exercicioId === id)) {
        d.itens.push({ exercicioId: id, series: 3 });
      }
      this.showScreen("rotinaedit");
    } else if (ctx.modo === "livre") {
      this.addSessaoItem(id);
    }
  },

  /* ================= SESSÃO DE TREINO =================
     Uma sessão cobre treino único (1 exercício), rotina
     guiada (ordem + séries planejadas) e treino livre.
     sessao = {
       tipo: "unica" | "rotina" | "livre",
       rotinaId?, nome,
       items: [{ exId, planejadas, series: [{peso,reps}] }],
       idx: índice do exercício ativo
     }                                                   */

  iniciarSessaoUnica(exId) {
    const ex = State.exercicioPorId(exId);
    if (!ex) return;
    this._modoTreino = false;
    this.sessao = { tipo: "unica", nome: ex.nome, items: [{ exId, planejadas: 0, series: [] }], idx: 0, iniciadaEm: Date.now() };
    this._persistirSessao();
    this.showScreen("workout");
  },

  iniciarSessaoLivre() {
    this.sessao = { tipo: "livre", nome: "Treino Livre", items: [], idx: -1, iniciadaEm: Date.now() };
    this._persistirSessao();
    this.showScreen("workout");
  },

  iniciarSessaoRotina(rid) {
    const r = State.rotinaPorId(rid);
    if (!r || !r.itens.length) return;
    this.sessao = {
      tipo: "rotina",
      rotinaId: rid,
      nome: r.nome,
      items: r.itens.map(i => ({ exId: i.exercicioId, planejadas: i.series, series: [] })),
      idx: 0,
      iniciadaEm: Date.now()
    };
    this._persistirSessao();
    this.showScreen("workout");
  },

  _encerrarEstadoTreino() {
    this.sessao = null;
    this._pickCtx = null;
    this._pararCooldownTimer();
    this._cooldownAte = 0;
    this._stopChrono();
    this._chronoAcc = 0;
    this._chronoPaused = 0;
    State.apagarSessao(); // remove o "save game" da sessão ativa
  },

  addSessaoItem(exId) {
    const s = this.sessao;
    if (!s || s.items.some(i => i.exId === exId)) return;
    s.items.push({ exId, planejadas: 0, series: [] });
    s.idx = s.items.length - 1;
    this._pickCtx = null;
    this._persistirSessao();
    this.showScreen("workout");
  },

  ativarItemSessao(idx) {
    const s = this.sessao;
    if (!s || !s.items[idx]) return;
    s.idx = idx;
    this._persistirSessao();
    this.render_workout(document.getElementById("screen-workout"));
  },

  /* pré-preenchimento: última performance deste exercício */
  prefillPara(item) {
    const hist = State.treinosDoExercicio(item.exId)[0];
    const fonte = item.series.length ? item.series[item.series.length - 1]
      : hist ? hist.series[Math.min(item.series.length, hist.series.length - 1)] : null;
    return fonte ? { peso: fonte.peso, reps: fonte.reps } : { peso: "", reps: "" };
  },

  /* ---------- TELA DA SESSÃO ---------- */
  render_workout(scr) {
    const s = this.sessao;
    if (!s) { this.showScreen("tavern"); return; }
    const chrono = this._chronoHTML();
    const inner = s.tipo === "livre" ? this._htmlSessaoLivre() : this._htmlSessaoGuiada();
    scr.innerHTML = chrono + inner;
    // iniciar/atualizar cronômetro
    if (!this._chronoTimer) this._startChrono(); else this._tickChrono();
    this._renderChips(s.items[s.idx]);
    this._atualizarCooldownUI();

    const peso = document.getElementById("inp-peso");
    const reps = document.getElementById("inp-reps");
    if (peso && reps) {
      [peso, reps].forEach(inp => inp.addEventListener("keydown", e => {
        if (e.key === "Enter") this.registrarSerieSessao();
      }));
      // validação live: destacar negativos
      [peso,reps].forEach(inp=>{
        inp.addEventListener("input", ()=>{
          const v = parseFloat(inp.value);
          if (!isNaN(v) && v <= 0) inp.classList.add("input-err");
          else inp.classList.remove("input-err");
        });
      });
      reps.focus({ preventScroll: true });
    }
  },

  /* sugestões rápidas baseadas na última performance */
  _renderChips(item) {
    const cont = document.getElementById("quick-chips");
    if (!cont || !item) return;
    const pf = this.prefillPara(item);
    if (pf.peso === "") { cont.innerHTML = ""; return; }
    const combos = [
      [pf.peso, pf.reps],
      [pf.peso, pf.reps + 2],
      [pf.peso + 2.5, pf.reps],
      [pf.peso + 5, Math.max(1, pf.reps - 2)]
    ];
    cont.innerHTML = combos.map(([p, r]) =>
      `<button class="chip" data-action="chip-fill" data-peso="${p}" data-reps="${r}">${p}×${r}</button>`
    ).join("");
  },

  /* bloco "Último / Melhor desempenho", separado dos controles */
  _htmlDesempenho(exId) {
    const st = State.statsExercicio(exId);
    const ultimo = st.ultimo ? st.ultimo.series.map(x => `${x.peso} kg × ${x.reps}`).join(",  ")
      : null;
    const melhor = st.melhorSerie ? `${st.melhorSerie.valor} kg × ${st.melhorSerie.reps}` : null;
    if (!ultimo && !melhor) return "";
    return `
      <div class="panel desempenho">
        <div class="panel-title">Desempenho</div>
        <div class="desempenho-grid">
          <div class="kv">
            <div class="k">Último desempenho</div>
            <div class="v">${ultimo ? `<span class="dv">${escapar(ultimo)}</span>` : "—"}</div>
          </div>
          <div class="kv">
            <div class="k">Melhor desempenho</div>
            <div class="v">🏆 ${melhor ? `<span class="dv">${melhor}</span>` : "—"}</div>
          </div>
        </div>
      </div>`;
  },

  _inputsRegistro(prefill, extraHtml = "") {
    return `
      <div class="inputs-grid">
        <div class="field">
          <label>Peso (kg)</label>
          <input type="number" id="inp-peso" inputmode="decimal" min="0" step="0.5" value="${prefill.peso}" placeholder="30">
        </div>
        <div class="times-sep">×</div>
        <div class="field">
          <label>Repetições</label>
          <input type="number" id="inp-reps" inputmode="numeric" min="1" step="1" value="${prefill.reps}" placeholder="10">
        </div>
      </div>
      ${extraHtml}
      <div id="cooldown-box" class="cooldown-box hidden">
        <div class="cd-title">✓ SÉRIE REGISTRADA</div>
        <div class="cd-sub">Próxima série disponível em <b id="cd-secs">10</b> segundos</div>
        <button class="btn cd-btn" disabled>🔒 AGUARDE</button>
      </div>
      <button class="btn btn-primary" id="btn-add-set" data-action="add-set">＋ REGISTRAR SÉRIE</button>`;
  },

  _linhaSet(itemIdx, se, i) {
    return `
      <div class="set-row">
        <div class="set-num">${i + 1}</div>
        <div class="set-data">${se.peso} kg × ${se.reps}<small> · vol ${fmtNum(se.peso * se.reps)} kg</small></div>
        <button class="set-del" data-action="remove-set" data-arg="${itemIdx}:${i}" title="Remover série">🗑</button>
      </div>`;
  },

  /* rotina guiada ou exercício único: foco no exercício atual */
  _htmlSessaoGuiada() {
    const s = this.sessao;
    const item = s.items[s.idx];
    const ex = State.exercicioPorId(item.exId);
    if (!ex) return "";

    // progresso geral (séries feitas / planejadas)
    const totalPlanejado = s.items.reduce((n, i) => n + i.planejadas, 0);
    const totalFeito = s.items.reduce((n, i) => n + i.series.length, 0);
    const pct = totalPlanejado ? Math.min(100, totalFeito / totalPlanejado * 100) : 0;

    const serieAtual = item.series.length + 1;
    const ehExtra = item.planejadas > 0 && serieAtual > item.planejadas;
    const statusSerie = item.planejadas > 0
      ? (ehExtra ? `Série extra nº ${serieAtual - item.planejadas}` : `Série ${serieAtual} de ${item.planejadas}`)
      : `${item.series.length} ${item.series.length === 1 ? "série registrada" : "séries registradas"}`;

    const prefill = this.prefillPara(item);

    // aviso de conclusão do exercício atual
    let proximoHtml = "";
    if (item.planejadas > 0 && item.series.length >= item.planejadas) {
      proximoHtml = s.idx < s.items.length - 1
        ? `<button class="btn btn-primary nav-next" data-action="sess-goto" data-arg="${s.idx + 1}">PRÓXIMO EXERCÍCIO →</button>`
        : `<button class="btn btn-primary nav-next" data-action="finish-session">🏁 FINALIZAR TREINO</button>`;
    }

    // lista compacta dos demais exercícios
    const outros = s.items.map((it, i) => {
      if (i === s.idx) return "";
      const oex = State.exercicioPorId(it.exId);
      const feito = it.series.length >= it.planejadas && it.planejadas > 0;
      return `<button class="mini-item${feito ? " done" : ""}" data-action="sess-goto" data-arg="${i}">
                <span>${feito ? "✓" : "•"} ${escapar(oex?.nome || "?")}</span>
                <span class="mini-info">${it.series.length}/${it.planejadas > 0 ? it.planejadas : "∞"}</span>
              </button>`;
    }).join("");

    const navAnterior = s.idx > 0
      ? `<button class="btn btn-ghost nav-btn" data-action="sess-goto" data-arg="${s.idx - 1}">← Anterior</button>` : "";
    const navProximoPular = s.idx < s.items.length - 1
      ? `<button class="btn btn-ghost nav-btn" data-action="sess-goto" data-arg="${s.idx + 1}">Pular →</button>` : "";

    return `
      <div class="workout-head">
        <p class="workout-sub sessao-nome">${s.tipo === "rotina" ? "⚔ " + escapar(s.nome.toUpperCase()) : "TREINO AVULSO"}</p>
        <h1 class="workout-ex-name">${escapar(ex.nome.toUpperCase())}</h1>
        <p class="workout-sub">${statusSerie}${ex.secundarios.length ? " · " + ex.principal.join(", ") : ""}</p>
        <button class="btn btn-ghost" data-action="discard-session" style="width:auto;margin:.5rem auto;padding:.4rem 1.2rem;font-size:.8rem;">✖ Abandonar</button>
      </div>

      ${totalPlanejado ? `
      <div class="prog-wrap">
        <div class="prog-bar"><div style="width:${pct}%"></div></div>
        <div class="prog-text">${totalFeito} de ${totalPlanejado} séries</div>
      </div>` : ""}

      <div class="panel">
        <div class="panel-title">Registrar Série</div>
        ${this._inputsRegistro(prefill)}
        <div class="quick-chips" id="quick-chips"></div>
      </div>

      ${this._htmlDesempenho(item.exId)}

      <div class="panel">
        <div class="panel-title">Séries Registradas</div>
        <div class="sets-table" id="sets-table">
          ${item.series.length ? item.series.map((se, i) => this._linhaSet(s.idx, se, i)).join("")
                               : `<p class="empty-msg" style="padding:.8rem">Nenhuma série ainda.</p>`}
        </div>
      </div>

      ${proximoHtml}
      <div class="nav-row">${navAnterior}${navProximoPular}</div>

      ${outros ? `<div class="group-header">Exercícios da Sessão</div><div class="mini-list">${outros}</div>` : ""}
      <button class="btn" data-action="add-session-exercise" style="margin-top:.6rem;">＋ EXERCÍCIO NÃO PLANEJADO</button>
      <button class="btn btn-danger finish-btn" data-action="finish-session">🏁 FINALIZAR TREINO</button>
    `;
  },

  /* treino livre: blocos por exercício, todos visíveis */
  _htmlSessaoLivre() {
    const s = this.sessao;

    const blocos = s.items.map((item, i) => {
      const ex = State.exercicioPorId(item.exId);
      if (!ex) return "";
      const ativo = i === s.idx;

      const corpo = ativo
        ? `<div class="sets-table">
             ${item.series.length ? item.series.map((se, j) => this._linhaSet(i, se, j)).join("")
                                  : `<p class="empty-msg" style="padding:.5rem">Nenhuma série ainda.</p>`}
           </div>
           ${this._inputsRegistro(this.prefillPara(item))}
           <div class="quick-chips" id="quick-chips"></div>
           ${this._htmlDesempenho(item.exId)}`
        : `<p class="bloco-resumo">${item.series.length} ${item.series.length === 1 ? "série registrada" : "séries registradas"}</p>
           <button class="btn" data-action="sess-active" data-arg="${i}">＋ SÉRIE</button>`;

      return `
        <div class="panel bloco-ex${ativo ? " active" : ""}">
          <div class="panel-title">${escapar(ex.nome)}
            ${s.items.length > 1 ? `<button class="icon-btn danger bloco-del" data-action="remove-session-item" data-arg="${i}" title="Remover do treino">✕</button>` : ""}
          </div>
          ${corpo}
        </div>`;
    }).join("");

    return `
      <div class="workout-head">
        <h1 class="workout-ex-name">🏋 TREINO LIVRE</h1>
        <button class="btn btn-ghost" data-action="discard-session" style="width:auto;margin:.5rem auto;padding:.4rem 1.2rem;font-size:.8rem;">✖ Abandonar</button>
      </div>

      ${blocos || `<p class="empty-msg">Escolha o primeiro exercício<br>e comece sua batalha! ⚔</p>`}

      <button class="btn ${blocos ? "" : "btn-primary"} add-free-btn" data-action="add-session-exercise">＋ ADICIONAR EXERCÍCIO</button>

      ${s.items.some(i => i.series.length)
        ? `<button class="btn btn-danger finish-btn" data-action="finish-session">🏁 FINALIZAR TREINO</button>`
        : ""}
    `;
  },

  /* XP/ouro silenciosos: aplica e enfileira level-ups para celebrar depois */
  ganharXPSilencioso(xp, ouro) {
    const evts = Game.ganharXP(xp);
    Game.ganharOuro(ouro);
    this.updateHUD();
    if (evts.length) {
      this._levelupsPendentes = (this._levelupsPendentes || []).concat(evts);
    }
  },

  registrarSerieSessao() {
    const s = this.sessao;
    const item = s && s.items[s.idx];
    if (!item) return;
    // proteção LÓGICA contra duplicação: bloqueado também via teclado/eventos
    if (this._emCooldown()) return;

    const pesoEl = document.getElementById("inp-peso");
    const repsEl = document.getElementById("inp-reps");
    if (!pesoEl || !repsEl) return;
    const peso = parseFloat(pesoEl.value);
    const reps = parseInt(repsEl.value, 10);
    // validação falhou: NÃO inicia cooldown, usuário pode corrigir já
    if (isNaN(peso) || peso <= 0 || isNaN(reps) || reps <= 0) {
      this.toast("⚠ Informe peso e repetições válidos.");
      return;
    }

    item.series.push({ peso, reps });
    this.floatXP("+10 XP");
    this.ganharXPSilencioso(10, 2);

    // salva imediatamente: mesmo que o navegador feche agora, a série está salva
    this._persistirSessao();

    // cooldown só começa depois do registro bem-sucedido
    this._iniciarCooldown();

    // rotina guiada: ao completar as séries planejadas, avança automaticamente
    let concluiu = false;
    if (s.tipo !== "livre" && item.planejadas > 0 && item.series.length === item.planejadas) {
      concluiu = true;
      if (s.idx < s.items.length - 1) {
        s.idx++;
        const prox = State.exercicioPorId(s.items[s.idx].exId);
        this.toast(`✔ Exercício concluído! Próximo: <b>${escapar(prox.nome)}</b>`);
      }
    }
    this._persistirSessao(); // persiste avanço de índice

    this.render_workout(document.getElementById("screen-workout"));
    document.getElementById("sets-table")
      ?.querySelector(".empty-msg")
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    if (concluiu) {
      document.getElementById("screen-workout")
        .scrollIntoView({ behavior: "smooth", block: "start" });
    }
  },

  removerSerieSessao(itemIdx, setIdx) {
    const s = this.sessao;
    const item = s && s.items[itemIdx];
    if (!item) return;
    item.series.splice(setIdx, 1);
    this._persistirSessao();
    this.render_workout(document.getElementById("screen-workout"));
  },

  /* ---------- Cooldown de registro (10s) ---------- */
  _emCooldown() {
    return Date.now() < this._cooldownAte;
  },

  _iniciarCooldown() {
    this._cooldownAte = Date.now() + this._cooldownMs;
    this._pararCooldownTimer();
    this._cooldownTimer = setInterval(() => this._atualizarCooldownUI(), 250);
    this._atualizarCooldownUI();
  },

  _pararCooldownTimer() {
    if (this._cooldownTimer) {
      clearInterval(this._cooldownTimer);
      this._cooldownTimer = null;
    }
  },

  /* aplica o estado atual do cooldown na interface (botão + caixa de aviso).
     Chamado pelo timer e após cada re-render, para o bloqueio sobreviver
     à navegação entre exercícios da sessão.                          */
  _atualizarCooldownUI() {
    const btn = document.querySelector("#btn-add-set");
    const box = document.getElementById("cooldown-box");
    if (!btn || !box) return;
    const restanteMs = this._cooldownAte - Date.now();
    if (restanteMs <= 0) {
      box.classList.add("hidden");
      btn.disabled = false;
      btn.innerHTML = "＋ REGISTRAR SÉRIE";
      this._pararCooldownTimer();
      return;
    }
    const segs = Math.ceil(restanteMs / 1000);
    box.classList.remove("hidden");
    const secsEl = document.getElementById("cd-secs");
    if (secsEl) secsEl.textContent = segs;
    btn.disabled = true;
    btn.innerHTML = `🔒 AGUARDE ${segs}s`;
  },

  finalizarSessao() {
    const s = this.sessao;
    if (!s || this._finalizando) return; // idempotente: cliques duplos não duplicam nada
    this._finalizando = true;

    try {
      const comSeries = s.items.filter(i => i.series.length > 0);

      if (!comSeries.length) {
        this._encerrarEstadoTreino();
        this.toast("Treino descartado (nenhuma série registrada).");
        this.showScreen("tavern");
        return;
      }

      // snapshot dos cosméticos por recompensa, para detectar novos desbloqueios
      const cosmAntes = Warrior.COSMETICOS
        .filter(c => c.origem.tipo === "recordes" || c.origem.tipo === "treinos" || c.origem.tipo === "volume")
        .filter(c => Warrior.possui(State.s, c.id))
        .map(c => c.id);

      const eventos = [];
      const totalSeriesSessao = comSeries.reduce((n, i) => n + i.series.length, 0);
      const volTotal = comSeries.reduce((v, i) =>
        v + i.series.reduce((x, se) => x + se.peso * se.reps, 0), 0);
      let xpRecordes = 0, ouroRecordes = 0;

      // por exercício: recordes -> salvar treino no histórico
      for (const item of comSeries) {
        const ex = State.exercicioPorId(item.exId);
        const quebras = Game.checarRecordes(item.exId, item.series);
        for (const q of quebras) {
          this.ganharXPSilencioso(50, 10);
          xpRecordes += 50;
          ouroRecordes += 10;
          eventos.push({ ...q, tipo: "record", exNome: ex.nome, xp: 50 });
        }
        State.addTreino(item.exId, item.series);
      }

      // encerra o estado temporário IMEDIATAMENTE após salvar:
      // a partir daqui não existe mais sessão ativa
      this._encerrarEstadoTreino();

      // streak
      const streakNovo = Game.atualizarStreak();
      if (streakNovo && State.s.streak.atual > 1) {
        this.toast(`🔥 ${State.s.streak.atual} dias consecutivos!`);
      }

      // XP e ouro de conclusão do treino
      const xpTreino = 25 + totalSeriesSessao * 5;
      const ouroTreino = 5 + totalSeriesSessao;
      this.ganharXPSilencioso(xpTreino, ouroTreino);

      // conquistas
      const novasConq = Game.checarConquistas();
      for (const c of novasConq) {
        this.ganharXPSilencioso(c.xp, c.ouro);
        eventos.push({ tipo: "conquista", icone: c.icone, nome: c.nome, desc: c.desc, xp: c.xp, ouro: c.ouro });
      }
      const xpConq = novasConq.reduce((n, c) => n + c.xp, 0);
      const ouroConq = novasConq.reduce((n, c) => n + c.ouro, 0);

      // novos cosméticos desbloqueados por feitos desta sessão
      const novosCosm = Warrior.COSMETICOS
        .filter(c => !cosmAntes.includes(c.id))
        .filter(c => Warrior.possui(State.s, c.id));
      for (const c of novosCosm) {
        this.toast(`🎁 Novo visual desbloqueado na Forja: <b>${escapar(c.nome)}</b>!`);
      }

      // fila de celebrações: records -> levelups -> conquistas
      const pendentes = (this._levelupsPendentes || []);
      this._levelupsPendentes = [];
      this.filaCelebracoes.push(
        ...eventos.filter(e => e.tipo === "record"),
        ...pendentes.map(e => ({ tipo: "levelup", ...e })),
        ...eventos.filter(e => e.tipo === "conquista")
      );

      // navega para a tela inicial ANTES dos modais:
      // mesmo se algo falhar nos modais, o usuário nunca fica preso
      this.showScreen("tavern");

      // duração do treino pelo cronômetro
      const durMs = this._elapsedMs();
      const durMin = Math.max(1, Math.round(durMs / 60000));
      const durStr = this._formatHMS(durMs);
      // resumo da conclusão (modal sobre a taverna), com botão delegado padrão
      const numRecordes = eventos.filter(e => e.tipo === "record").length;
      const xpTotal = xpTreino + xpRecordes + xpConq;
      const ouroTotal = ouroTreino + ouroRecordes + ouroConq;
      this.modal(`
        <div class="m-icon">⚔</div>
        <h2>TREINO CONCLUÍDO!</h2>
        <div class="m-big">${totalSeriesSessao} séries realizadas<br>${fmtNum(volTotal)} kg de volume</div>
        <p class="m-sub" style="margin-top:.4rem;">⏱ Duração: <b style="color:var(--gold-bright)">${durStr}</b> (${durMin} min)</p>
        <div style="margin:.6rem 0;display:flex;gap:.4rem;justify-content:center;flex-wrap:wrap;">
          <span class="m-sub">O cronômetro registrou <b>${durStr}</b>.</span>
        </div>
        <div class="m-gain">+${fmtNum(xpTotal)} XP · 🪙 +${fmtNum(ouroTotal)}</div>
        ${numRecordes ? `<p class="m-sub" style="margin-top:.4rem;">🏆 ${numRecordes} novo${numRecordes > 1 ? "s" : ""} recorde${numRecordes > 1 ? "s" : ""}</p>` : ""}
        <button class="btn btn-primary" data-action="finish-continue">CONTINUAR</button>
      `);
      // reset chrono para próximo treino
      this._stopChrono(); this._chronoAcc=0;
    } finally {
      this._finalizando = false;
    }
  },

  /* ================= DETALHE DO EXERCÍCIO ================= */
  detalheExercicio(id) {
    const ex = State.exercicioPorId(id);
    if (!ex) return;
    const st = State.statsExercicio(id);
    const sessoes = Stats.evolucaoExercicio(id);
    const ultimos = State.treinosDoExercicio(id).slice(0, 8);

    const linhas = ultimos.map(t => `
      <div class="hist-entry">
        <span class="he-ex">${new Date(t.data).toLocaleDateString("pt-BR")}</span>
        <span class="he-sets">${t.series.map(s => `${s.peso}×${s.reps}`).join("  ")}</span>
      </div>`).join("");

    this.modal(`
      <h2>${escapar(ex.nome.toUpperCase())}</h2>
      <p class="m-sub">${ex.grupo} · Principal: ${ex.principal.join(", ")}${ex.secundarios.length ? "<br>Secundários: " + ex.secundarios.join(", ") : ""}</p>
      <div class="ornament">✦ ✦ ✦</div>
      <div style="text-align:left;">
        <p class="m-sub" style="text-align:left">Último treino:</p>
        <p>${st.ultimo ? st.ultimo.series.map(s=>`${s.peso}×${s.reps}`).join("  ") : "—"}</p>
        <p class="m-sub" style="margin-top:.5rem;text-align:left">Melhor peso: <b style="color:var(--gold-bright)">${st.maiorPeso ? st.maiorPeso.valor + " kg" : "—"}</b></p>
        <p class="m-sub" style="text-align:left">Melhor série: <b style="color:var(--gold-bright)">${st.melhorSerie ? st.melhorSerie.valor + " × " + st.melhorSerie.reps : "—"}</b></p>
        <p class="m-sub" style="text-align:left">Volume total: <b style="color:var(--gold-bright)">${fmtNum(st.volumeTotal)} kg</b> · Treinos: <b style="color:var(--gold-bright)">${st.numTreinos}</b></p>
      </div>
      ${linhas ? `<div class="ornament">✦ ✦ ✦</div><div style="max-height:180px;overflow-y:auto;text-align:left;">${linhas}</div>` : ""}
      ${sessoes.length >= 2 ? `
        <div class="ornament">✦ ✦ ✦</div>
        <div class="panel-title" style="margin-bottom:.3rem;">Peso Máximo por Sessão</div>
        ${this._evolSVG(sessoes)}
        <p class="m-sub" style="color:var(--text-dim);font-size:.78rem;">${sessoes.length} sessões registradas</p>` : ""}
      <div class="m-buttons">
        <button class="btn btn-ghost" data-action="close-modal">FECHAR</button>
        <button class="btn btn-primary" onclick="UI.fecharModal();UI.iniciarSessaoUnica('${id}')">⚔ TREINAR</button>
      </div>
    `);
  },

  /* ================= RECORDES ================= */
  render_records(scr) {
    const recs = State.s.recordes;
    const ids = Object.keys(recs).filter(id => recs[id].quebras > 0 || recs[id].maiorPeso);
    let html = `
      <div class="workout-head">
        <h1 class="workout-ex-name">🏆 Hall dos Recordes</h1>
        <button class="btn btn-ghost" data-action="back" style="width:auto;margin:.6rem auto;padding:.4rem 1.2rem;font-size:.8rem;">← Taverna</button>
      </div>
    `;

    if (ids.length === 0) {
      html += `<p class="empty-msg">Nenhum recorde ainda.<br>Aventure-se na masmorra de ferro! ⚔</p>`;
    } else {
      for (const id of ids) {
        const ex = State.exercicioPorId(id);
        if (!ex) continue;
        const r = recs[id];
        html += `<div class="panel"><div class="panel-title">${escapar(ex.nome)}</div>`;
        const linhas = [];
        if (r.maiorPeso) linhas.push(["🏋 Maior peso", `${r.maiorPeso.valor} kg`, r.maiorPeso.reps]);
        if (r.maiorReps) linhas.push(["🔁 Mais repetições", `${r.maiorReps.reps} reps`, r.maiorReps.peso]);
        if (r.melhorSerie) linhas.push(["⚔ Melhor série", `${r.melhorSerie.valor} kg × ${r.melhorSerie.reps}`]);
        if (r.melhorVolumeTreino) linhas.push(["📦 Volume (treino)", fmtNum(r.melhorVolumeTreino.vol) + " kg"]);
        for (const [k, v, extra] of linhas) {
          html += `<div class="cs-row" style="font-size:1rem;color:var(--text);"><span>${k}</span><span style="color:var(--gold-bright);font-family:var(--font-pixel)">${v}${extra !== undefined ? ` <small style="color:var(--text-dim)">@${extra}kg</small>` : ""}</span></div>`;
        }
        html += `</div>`;
      }
    }
    scr.innerHTML = html;
  },

  /* ================= PERSONAGEM ================= */
  /* ================= FORJA — loja com prévia ao vivo ============= */

  comprarItem(id) {
    const item = Warrior.porId(id);
    if (!item) return;
    if (this._comprando) return;
    this._comprando = true; setTimeout(()=> this._comprando=false, 800);
    const st = Warrior.statusItem(State.s, item);
    if (st.acao !== "comprar") {
      if (st.acao === "caro" || st.acao === "bloqueado") this.toast(`🔒 ${st.motivo}`);
      return;
    }
    if (State.comprarCosmetico(id, item.origem.preco)) {
      this.toast(`🛒 ${escapar(item.nome)} comprado por ${fmtNum(item.origem.preco)} 🪙!`);
      this.floatXP(`-${fmtNum(item.origem.preco)} 🪙`, true);
      this._forjaPrevia = { slot: item.slot, id };
      this.updateHUD();
      this.render_forja(document.getElementById("screen-forja"));
    } else {
      this.toast(`🪙 Ouro insuficiente! Precisa de ${fmtNum(item.origem.preco)} 🪙`);
    }
  },

  /* confirma a prévia: torna permanente */
  confirmarPrevia() {
    const pv = this._forjaPrevia;
    if (!pv) return;
    const item = Warrior.porId(pv.id);
    if (!item) return;
    const st = Warrior.statusItem(State.s, item);
    // se precisa comprar, tenta comprar antes de equipar
    if (st.acao === "comprar") {
      if (!State.comprarCosmetico(item.id, item.origem.preco)) {
        this.toast(`🪙 Ouro insuficiente! Faltam ${fmtNum(item.origem.preco - State.s.personagem.ouro)} 🪙`);
        this.render_forja(document.getElementById("screen-forja"));
        return;
      }
      this.toast(`🛒 ${escapar(item.nome)} comprado por ${fmtNum(item.origem.preco)} 🪙!`);
      this.floatXP(`-${fmtNum(item.origem.preco)} 🪙`, true);
      this.updateHUD();
    } else if (st.acao === "bloqueado" || st.acao === "caro") {
      this.toast(`🔒 ${st.motivo}`);
      this.render_forja(document.getElementById("screen-forja"));
      return;
    } else if (!Warrior.possui(State.s, item.id)) {
      this.toast(`🔒 Você ainda não possui ${escapar(item.nome)}.`);
      return;
    }
    if (!State.equiparCosmetico(pv.slot, pv.id)) {
      this.toast(`🔒 Não foi possível equipar.`);
      return;
    }
    const nome = item.nome || "";
    this._forjaPrevia = null;
    this.toast(`⚔ ${escapar(nome)} equipado!`);
    this.render_forja(document.getElementById("screen-forja"));
  },

  cancelarPrevia() {
    this._forjaPrevia = null;
    this.render_forja(document.getElementById("screen-forja"));
  },

  /* linha da lista: selecionável para prévia + botão de ação */
  _forjaRow(s, item) {
    const st = Warrior.statusItem(s, item);
    const icone = Warrior.SLOTS[item.slot].icone;
    const rar = Warrior.RARIDADES[item.raridade];
    const selecionado = this._forjaPrevia && this._forjaPrevia.id === item.id;
    const slotEquipado = (s.personagem.equipamento || {})[item.slot] === item.id;

    let botao = "";
    if (st.acao === "comprar")
      botao = `<button class="btn btn-primary fi-btn" data-action="buy-item" data-arg="${item.id}">COMPRAR</button>`;
    else if (st.acao === "equipar")
      botao = `<button class="btn fi-btn" data-action="select-item" data-arg="${item.id}">EQUIPAR</button>`;
    else
      botao = `<span class="si-estado${st.acao === "equipado" ? " on" : ""}">${st.acao === "equipado" ? "✔ EQUIPADO" : st.motivo}</span>`;

    return `
      <div class="shop-item fi${selecionado ? " sel" : ""}${slotEquipado ? " eq" : ""}"
           data-action="select-item" data-arg="${item.id}">
        <span class="si-icon">${icone}</span>
        <div class="si-info">
          <div class="si-nome">${escapar(item.nome)}</div>
          <div class="si-motivo">
            <span class="rar-badge" style="color:${rar.cor};border-color:${rar.cor}">${rar.nome}</span>
            ${st.motivo}
          </div>
        </div>
        <div class="si-act" onclick="event.stopPropagation()">${botao}</div>
      </div>`;
  },

  render_forja(scr) {
    const s = State.s;
    const aba = this._forjaAba || "cabeca";
    const previa = this._forjaPrevia;

    // estado efetivo: prévia sobrepõe o slot em edição (só na visualização)
    const equipEfetivo = previa
      ? { ...s.personagem.equipamento, [previa.slot]: previa.id }
      : null;

    const itensAba = Warrior.COSMETICOS.filter(c => c.slot === aba)
      .sort((a, b) => {
        const ordem = { lendario: 0, epico: 1, raro: 2, incomum: 3, comum: 4 };
        return ordem[a.raridade] - ordem[b.raridade];
      });

    const atualSlot = previa ? previa.slot : aba;
    const idAtualEq = (s.personagem.equipamento || {})[atualSlot] || Warrior.SLOTS[atualSlot].padrao;
    const nomeAtual = Warrior.porId(idAtualEq)?.nome || "—";

    scr.innerHTML = `
      <div class="workout-head">
        <h1 class="workout-ex-name">⚒ Forja</h1>
        <p class="workout-sub">Forje e vista seu guerreiro</p>
        <button class="btn btn-ghost" data-action="back" style="width:auto;margin:.6rem auto;padding:.4rem 1.2rem;font-size:.8rem;">← Taverna</button>
      </div>

      <div class="panel forja-stage">
        <div class="forja-itens">
          <div class="forja-saldo cs-row"><span>🪙 Ouro</span><span class="cs-val">${fmtNum(s.personagem.ouro)}</span></div>

          <div class="forja-tabs">
            ${Object.entries(Warrior.SLOTS).map(([slot, def]) => `
              <button class="faba${slot === aba ? " on" : ""}" data-action="forja-aba" data-arg="${slot}">
                ${def.icone} ${def.plural}
              </button>`).join("")}
          </div>

          <div class="forja-lista">
            ${(() => {
              const seus = itensAba.filter(c => Warrior.possui(s, c.id));
              const vitrine = itensAba.filter(c => !Warrior.possui(s, c.id));
              let out = "";
              if (seus.length)
                out += `<div class="forja-grupo">Seus Itens</div>` +
                       seus.map(item => this._forjaRow(s, item)).join("");
              if (vitrine.length)
                out += `<div class="forja-grupo">Ainda Não Possui</div>` +
                       vitrine.map(item => this._forjaRow(s, item)).join("");
              return out;
            })()}
          </div>
        </div>

        <div class="forja-guerreiro">
          <div class="ficha-warrior big forja-preview">${Warrior.svg(State.s, {
            equipamento: equipEfetivo ? { [previa.slot]: previa.id } : null
          })}</div>
          ${(() => {
            if (!previa) return `<div class="cmp-box dica">Toque em um item<br>para ver no guerreiro</div>`;
            const itemPrev = Warrior.porId(previa.id);
            const stPrev = Warrior.statusItem(s, itemPrev);
            const preco = itemPrev?.origem?.preco;
            let custoInfo = "";
            let btnLabel = "EQUIPAR";
            let btnDisabled = "";
            if (stPrev.acao === "comprar") {
              btnLabel = `COMPRAR ${fmtNum(preco)} 🪙 E EQUIPAR`;
              custoInfo = `<div class="cmp-custo">Custo: <b>${fmtNum(preco)} 🪙</b> · Seu ouro: ${fmtNum(s.personagem.ouro)} → <b style="color:${s.personagem.ouro>=preco?"var(--xp)":"#ff9a80"}">${fmtNum(s.personagem.ouro - preco)}</b></div>`;
            } else if (stPrev.acao === "caro" || stPrev.acao === "bloqueado") {
              custoInfo = `<div class="cmp-custo" style="color:#ff9a80">${stPrev.motivo}</div>`;
              btnLabel = "🔒 BLOQUEADO";
              btnDisabled = "disabled";
            } else if (stPrev.acao === "equipar") {
              custoInfo = `<div class="cmp-custo" style="color:var(--xp)">✔ Já possui — pronto para equipar</div>`;
            } else if (stPrev.acao === "equipado") {
              custoInfo = `<div class="cmp-custo">✔ Já equipado</div>`;
              btnLabel = "EQUIPADO";
              btnDisabled = "disabled";
            }
            return `
            <div class="cmp-box">
              <div class="cmp-titulo">${escapar(itemPrev?.nome || "")}</div>
              <div class="cmp-linha"><span class="k">ATUAL</span><span>${escapar(nomeAtual)}</span></div>
              <div class="cmp-linha novo"><span class="k">NOVO</span><span>${escapar(itemPrev?.nome || "")}</span></div>
              ${custoInfo}
              <button class="btn btn-primary" data-action="confirm-preview" ${btnDisabled} style="margin-top:.5rem;">${btnLabel}</button>
              <button class="btn btn-ghost" data-action="cancel-preview" style="width:auto;margin:.4rem auto 0;padding:.35rem .9rem;font-size:.7rem;">CANCELAR</button>
            </div>`;
          })()}
        </div>
      </div>
    `;
  },

  /* ================= EVOLUÇÃO (estatísticas) ================= */

  /* gráfico de colunas temático: [{label, valor, titulo}] */
  _chartCols(dados) {
    if (!dados.length) return `<p class="empty-msg" style="padding:.8rem">Sem dados ainda.</p>`;
    const max = Math.max(...dados.map(d => d.valor), 1);
    return `
      <div class="chart-cols">
        ${dados.map(d => `
          <div class="vcol" title="${escapar(d.titulo)}: ${fmtNum(d.valor)} kg">
            <div class="vfill-wrap"><div class="vfill" style="height:${Math.max(2, d.valor / max * 100)}%"></div></div>
            <span class="vlabel">${d.label}</span>
          </div>`).join("")}
      </div>`;
  },

  render_stats(scr) {
    const s = State.s;
    const g = Stats.gerais(s);
    const cg = Stats.cardioEstatisticas(s);

    // volume semanal (últimas 8 semanas com dados) e mensal (6 meses)
    const semanas = Stats.volumePorPeriodo(s, "semana", 8);
    const meses = Stats.volumePorPeriodo(s, "mes", 6);
    const cardioSem = Stats.cardioVolumePorPeriodo(s, "semana", 8);

    // volume por grupo macro (kg distribuídos entre músculos principais)
    const volGrupo = Stats.volumePorGrupo(s);
    const macroVol = Warrior.gruposMacroPontos(s).map(gm => {
      const kg = gm.musculos.reduce((n, m) => n + (volGrupo[m] || 0), 0);
      return { nome: gm.nome, kg };
    });
    const maxKg = Math.max(...macroVol.map(m => m.kg), 1);

    // exercícios em destaque por volume acumulado
    const top = State.todosExercicios()
      .map(ex => ({ ex, st: State.statsExercicio(ex.id) }))
      .filter(x => x.st.numTreinos > 0)
      .sort((a, b) => b.st.volumeTotal - a.st.volumeTotal)
      .slice(0, 8);

    scr.innerHTML = `
      <div class="workout-head">
        <h1 class="workout-ex-name">📈 Evolução</h1>
        <button class="btn btn-ghost" data-action="back" style="width:auto;margin:.6rem auto;padding:.4rem 1.2rem;font-size:.8rem;">← Taverna</button>
      </div>

      <div class="panel">
        <div class="panel-title">Crônicas em Números</div>
        <div class="kv-grid">
          <div class="kv"><div class="k">Treinos</div><div class="v">⚒ ${g.treinos}</div></div>
          <div class="kv"><div class="k">Séries</div><div class="v">${g.series}</div></div>
          <div class="kv"><div class="k">Repetições</div><div class="v">${fmtNum(g.repeticoes)}</div></div>
          <div class="kv"><div class="k">Volume total</div><div class="v">${fmtNum(g.volume)}<small style="font-size:.8rem"> kg</small></div></div>
          <div class="kv"><div class="k">Peso máximo</div><div class="v">${g.pesoMax ? g.pesoMax + " kg" : "—"}</div></div>
          <div class="kv"><div class="k">Recordes</div><div class="v">💥 ${g.recordes}</div></div>
          <div class="kv"><div class="k">XP acumulado</div><div class="v">${fmtNum(g.xpTotal)}</div></div>
          <div class="kv"><div class="k">Streak</div><div class="v">🔥 ${g.streakAtual} · 🏅 ${g.streakMelhor}</div></div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-title">Volume por Semana</div>
        ${this._chartCols(semanas.map(w => ({
          label: w.label,
          valor: w.valor,
          titulo: "Semana de " + w.label
        })))}
      </div>

      <div class="panel">
        <div class="panel-title">Volume por Mês</div>
        ${this._chartCols(meses.map(m => ({
          label: m.label,
          valor: m.valor,
          titulo: m.label + "/" + m.chave.slice(0, 4)
        })))}
      </div>

      <div class="panel">
        <div class="panel-title">Volume por Grupo</div>
        ${macroVol.every(m => m.kg === 0) ? `<p class="empty-msg" style="padding:.8rem">Sem dados ainda.</p>`
          : macroVol.filter(m => m.kg > 0).sort((a, b) => b.kg - a.kg).map(m => `
            <div class="mrow">
              <span class="mlabel">${m.nome}</span>
              <div class="mbar"><div style="width:${m.kg / maxKg * 100}%"></div></div>
              <span class="mpct">${fmtNum(Math.round(m.kg))}<small style="font-size:.75rem">kg</small></span>
            </div>`).join("")}
      </div>

      <div class="panel">
        <div class="panel-title">Cardio — Visão Geral</div>
        ${cg.total===0 ? `<p class="empty-msg" style="padding:.6rem">Nenhum cardio ainda.</p>` : `
          <div class="kv-grid">
            <div class="kv"><div class="k">Sessões</div><div class="v">🏃 ${cg.total}</div></div>
            <div class="kv"><div class="k">Tempo total</div><div class="v">${Math.floor(cg.tempo/60)}h ${cg.tempo%60}min</div></div>
            <div class="kv"><div class="k">Distância</div><div class="v">${cg.dist.toFixed(1)} km</div></div>
            <div class="kv"><div class="k">Mais praticada</div><div class="v">${cg.maisPraticada? (cardioModalidadePorId(cg.maisPraticada[0])?.nome||cg.maisPraticada[0]):"—"}</div></div>
            <div class="kv"><div class="k">Maior distância</div><div class="v">${cg.maiorDist.toFixed(1)} km</div></div>
            <div class="kv"><div class="k">Melhor pace</div><div class="v">${cg.melhorPace? this._formatPace(cg.melhorPace):"—"}</div></div>
          </div>
          <div style="margin-top:.8rem;"><div class="panel-title" style="margin-bottom:.3rem;">Minutos por Semana (Cardio)</div>
          ${this._chartCols(cardioSem.map(w=>({label:w.label, valor:w.valor, titulo:w.label})))}
          </div>`}
      </div>

      <div class="panel">
        <div class="panel-title">Forjas Favoritas</div>
        ${top.length ? top.map(({ ex, st }) => `
          <button class="hist-entry evol-item" data-action="select-evolution" data-arg="${ex.id}">
            <span class="he-ex">${escapar(ex.nome)}</span>
            <span class="he-sets">${st.melhorSerie ? `${st.melhorSerie.valor}×${st.melhorSerie.reps}` : "—"} · ${fmtNum(st.volumeTotal)} kg</span>
          </button>`).join("")
        : `<p class="empty-msg">Nenhum treino registrado ainda.</p>`}
      </div>
    `;
  },

  /* mini-gráfico SVG: peso máximo por sessão */
  _evolSVG(sessoes) {
    if (!sessoes || sessoes.length < 2) return "";
    const w = 280, h = 80, padX = 6, padY = 10;
    const max = Math.max(...sessoes.map(x => x.maxPeso));
    const min = Math.min(...sessoes.map(x => x.maxPeso), 0);
    const span = Math.max(max - min, 1);
    const px = i => padX + i * ((w - padX * 2) / (sessoes.length - 1));
    const py = v => h - padY - (v - min) / span * (h - padY * 2);
    const pontos = sessoes.map((x, i) => `${px(i)},${py(x.maxPeso)}`).join(" ");
    const ultimo = sessoes[sessoes.length - 1];

    return `
      <svg class="evol-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="Peso máximo por sessão">
        <polyline points="${pontos}" fill="none" stroke="#b8923a" stroke-width="2"/>
        ${sessoes.map((x, i) =>
          `<circle cx="${px(i)}" cy="${py(x.maxPeso)}" r="3" fill="#e8cd85" stroke="#241300"/>`).join("")}
        <line x1="${padX}" y1="${h - 4}" x2="${w - padX}" y2="${h - 4}" stroke="#4e381a"/>
        <text x="${w / 2}" y="${py(ultimo.maxPeso) - 8}" text-anchor="middle"
              fill="#e8cd85" font-size="12">${ultimo.maxPeso} kg</text>
      </svg>`;
  },

  render_character(scr) {
    const p = State.s.personagem;
    const st = State.s.streak;
    const g = this.statsGlobais();
    const need = Game.xpNecessario(p.nivel);

    // Estatísticas derivadas (0–100, visuais)
    const forca = Math.min(100, Math.round(Math.log10(g.volume + 1) * 22));
    const vigor = Math.min(100, Math.round(Math.sqrt(g.volume / 500)));
    const disciplina = Math.min(100, Math.round(st.melhor * 3.3));

    scr.innerHTML = `
      <div class="workout-head">
        <h1 class="workout-ex-name">👤 Ficha do Herói</h1>
        <button class="btn btn-ghost" data-action="back" style="width:auto;margin:.6rem auto;padding:.4rem 1.2rem;font-size:.8rem;">← Taverna</button>
      </div>

      <div class="panel ficha char-big">
        <div class="ficha-top">
          <div class="ficha-warrior big">${Warrior.svg(State.s)}</div>
          <div class="ficha-id">
            <div class="char-name">${escapar(p.nome)}</div>
            <div class="char-class">${this.tituloPorNivel(p.nivel)}</div>
            <div class="cs-row"><span>Nível</span><span class="cs-val">${p.nivel}</span></div>
            <div class="xpbar" style="margin-top:.3rem;">
              <div class="xpbar-fill" style="width:${Math.min(100, p.xp / need * 100)}%"></div>
              <span class="xpbar-text">${fmtNum(p.xp)}/${fmtNum(need)} XP</span>
            </div>
            <p class="m-sub" style="color:var(--text-dim);font-size:.78rem;margin-top:.6rem;line-height:1.45;">
              Seu guerreiro reflete seu treino: cada grupo muscular desenvolvido
              no mundo real o torna mais forte aqui.
            </p>
          </div>
        </div>

        <div class="ornament">✦ ✦ ✦</div>

        <div class="stat-block">
          <div class="stat-box">
            <div class="stat-label">FORÇA</div>
            <div class="stat-value">${forca}</div>
            <div class="stat-bar"><div style="width:${forca}%"></div></div>
          </div>
          <div class="stat-box">
            <div class="stat-label">VIGOR</div>
            <div class="stat-value">${vigor}</div>
            <div class="stat-bar"><div style="width:${vigor}%"></div></div>
          </div>
          <div class="stat-box">
            <div class="stat-label">DISCIPLINA</div>
            <div class="stat-value">${disciplina}</div>
            <div class="stat-bar"><div style="width:${disciplina}%"></div></div>
          </div>
        </div>

        <div style="display:flex;gap:.5rem;justify-content:center;margin-top:.9rem;flex-wrap:wrap;">
          <button class="btn" data-action="goto-forja" style="width:auto;padding:.45rem 1rem;font-size:.72rem;">🏪 FORJA</button>
          <button class="btn" data-action="rename-character" style="width:auto;padding:.45rem 1rem;font-size:.72rem;">✒ Renomear</button>
        </div>
      </div>

      <div class="panel">
        <div class="panel-title">Mapa de Músculos</div>
        ${Warrior.mapaHTML(State.s)}
      </div>

      <div class="panel">
        <div class="panel-title">Diário de Batalha</div>
        <div class="kv-grid">
          <div class="kv"><div class="k">Treinos</div><div class="v">⚒ ${g.numTreinos}</div></div>
          <div class="kv"><div class="k">Séries</div><div class="v">${g.numSeries}</div></div>
          <div class="kv"><div class="k">Volume total</div><div class="v">${fmtNum(g.volume)}<small style="font-size:.8rem"> kg</small></div></div>
          <div class="kv"><div class="k">Ouro</div><div class="v">🪙 ${fmtNum(p.ouro)}</div></div>
          <div class="kv"><div class="k">Streak atual</div><div class="v">🔥 ${st.atual}</div></div>
          <div class="kv"><div class="k">Maior streak</div><div class="v">🏅 ${st.melhor}</div></div>
          <div class="kv"><div class="k">Recordes</div><div class="v">💥 ${g.recordes}</div></div>
          <div class="kv"><div class="k">Conquistas</div><div class="v">🎖 ${Object.keys(State.s.conquistas).length}/${CONQUISTAS.length}</div></div>
        </div>
      </div>
    `;
  },

  renomearPersonagem() {
    this.modal(`
      <h2>NOME DO HERÓI</h2>
      <div class="form-field">
        <input type="text" id="renome-input" maxlength="24" value="${escapar(State.s.personagem.nome)}">
      </div>
      <div class="m-buttons">
        <button class="btn btn-ghost" data-action="close-modal">CANCELAR</button>
        <button class="btn btn-primary" id="renome-ok">SALVAR</button>
      </div>
    `);
    const inp = document.getElementById("renome-input");
    inp.focus(); inp.select();
    const salvar = () => {
      const v = inp.value.trim();
      if (v) { State.s.personagem.nome = v; State.save(); this.updateHUD(); }
      this.fecharModal();
      this.render_character(document.getElementById("screen-character"));
    };
    document.getElementById("renome-ok").onclick = salvar;
    inp.addEventListener("keydown", e => { if (e.key === "Enter") salvar(); });
  },

  /* ================= CONQUISTAS ================= */
  render_achievements(scr) {
    let html = `
      <div class="workout-head">
        <h1 class="workout-ex-name">🎖 Sala de Troféus</h1>
        <button class="btn btn-ghost" data-action="back" style="width:auto;margin:.6rem auto;padding:.4rem 1.2rem;font-size:.8rem;">← Taverna</button>
      </div>
    `;
    for (const c of CONQUISTAS) {
      const desbloq = !!State.s.conquistas[c.id];
      html += `
        <div class="ach-item ${desbloq ? "unlocked" : "locked"}">
          <div class="ach-icon">${c.icone}</div>
          <div>
            <div class="ach-name">${c.nome}</div>
            <div class="ach-desc">${c.desc}</div>
          </div>
          <div class="ach-xp">+${c.xp} XP</div>
        </div>`;
    }
    scr.innerHTML = html;
  },

  /* ================= HISTÓRICO ================= */
  render_history(scr) {
    const filtro = this._histFiltro || "todos";
    const treinos = [...State.s.treinos].sort((a, b) => b.data - a.data);
    const cardios = [...(State.s.cardios||[])].sort((a,b)=>b.data-a.data);
    // mescla para ordenação unificada se filtro todos
    const todos = [
      ...treinos.map(t=>({tipo:"forca", data:t.data, treino:t})),
      ...cardios.map(c=>({tipo:"cardio", data:c.data, cardio:c}))
    ].sort((a,b)=>b.data-a.data).slice(0,80);
    let html = `
      <div class="workout-head">
        <h1 class="workout-ex-name">📖 Crônicas de Treino</h1>
        <button class="btn btn-ghost" data-action="back" style="width:auto;margin:.6rem auto;padding:.4rem 1.2rem;font-size:.8rem;">← Taverna</button>
        <div style="display:flex;gap:.4rem;justify-content:center;margin-top:.6rem;flex-wrap:wrap;">
          <button class="btn ${filtro==="todos"?"btn-primary":"btn-ghost"}" data-action="filter-history" data-arg="todos" style="width:auto;padding:.35rem .9rem;font-size:.72rem;">TODOS</button>
          <button class="btn ${filtro==="forca"?"btn-primary":"btn-ghost"}" data-action="filter-history" data-arg="forca" style="width:auto;padding:.35rem .9rem;font-size:.72rem;">⚔ FORÇA</button>
          <button class="btn ${filtro==="cardio"?"btn-primary":"btn-ghost"}" data-action="filter-history" data-arg="cardio" style="width:auto;padding:.35rem .9rem;font-size:.72rem;">🏃 CARDIO</button>
        </div>
      </div>
    `;
    const filtrados = todos.filter(x=> filtro==="todos" || x.tipo===filtro);
    if (!filtrados.length) {
      html += `<p class="empty-msg">Nenhum registro neste filtro.<br>Registre sua jornada! ⚔</p>`;
    } else {
      let diaAtual = null;
      html += `<div class="hist-day">`;
      for (const e of filtrados) {
        const dia = new Date(e.data).toLocaleDateString("pt-BR",{ weekday:"long", day:"numeric", month:"long" });
        if (dia !== diaAtual) {
          if (diaAtual) html += `</div><div class="hist-day">`;
          diaAtual = dia; html += `<div class="hist-date">${dia}</div>`;
        }
        if (e.tipo==="forca") {
          const ex = State.exercicioPorId(e.treino.exercicioId);
          html += `<div class="hist-entry"><span class="he-ex">${ex?escapar(ex.nome):"?"} </span><span class="he-sets">${e.treino.series.map(s=>`${s.peso}×${s.reps}`).join(" ")}</span></div>`;
        } else {
          const mm = cardioModalidadePorId(e.cardio.modalidade);
          html += `<div class="hist-entry cardio"><span class="he-ex">${mm?mm.icone:"🏃"} ${mm?mm.nome:e.cardio.modalidade} · ${e.cardio.duracaoMin}min ${e.cardio.distanciaKm?"· "+e.cardio.distanciaKm+"km":""} ${e.cardio.paceMinPerKm?"· pace "+this._formatPace(e.cardio.paceMinPerKm):""}</span><span class="he-sets">🏃</span></div>`;
        }
      }
      html += `</div>`;
    }
    scr.innerHTML = html;
  },

  /* ================= SAVES ================= */
  render_saves(scr) {
    scr.innerHTML = `
      <div class="workout-head">
        <h1 class="workout-ex-name">💾 Grimório de Saves</h1>
        <button class="btn btn-ghost" data-action="back" style="width:auto;margin:.6rem auto;padding:.4rem 1.2rem;font-size:.8rem;">← Taverna</button>
      </div>

      <div class="panel save-btns">
        <button class="btn" data-action="export-save">📤 EXPORTAR SAVE (JSON)</button>
        <button class="btn" data-action="import-save">📥 IMPORTAR SAVE</button>
      </div>

      <div class="panel danger-zone">
        <div class="panel-title">Zona Perigosa ☠</div>
        <p class="m-sub" style="color:var(--text-dim);font-size:.85rem;margin-bottom:.8rem;">
          Apaga personagem, XP, ouro, streak, treinos, rotinas, recordes e conquistas.
          Os exercícios padrão da biblioteca são recriados automaticamente.
        </p>
        <button class="btn btn-danger" data-action="reset-all">🗑 ZERAR TODOS OS DADOS</button>
      </div>
    `;
  },

  importarSave() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.onchange = () => {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const ok = State.importar(reader.result);
        if (ok) {
          this.toast("📥 Save restaurado com sucesso!");
          this.showScreen("tavern");
        } else {
          this.modal(`
            <div class="m-icon">⚠</div>
            <h2>SAVE INVÁLIDO</h2>
            <p class="m-sub">O arquivo escolhido não parece ser um save do Exercitium.</p>
            <div class="m-buttons"><button class="btn btn-primary" data-action="close-modal">OK</button></div>
          `);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  },

  confirmarReset() {
    this.modal(`
      <div class="m-icon">⚠</div>
      <h2>ZERAR TODOS OS DADOS?</h2>
      <p>Esta ação apagará todo o seu progresso, histórico, recordes, treinos personalizados e configurações.</p>
      <p class="m-sub" style="margin-top:.4rem;">Essa ação não pode ser desfeita.</p>
      <div class="m-buttons">
        <button class="btn btn-ghost" data-action="close-modal">CANCELAR</button>
        <button class="btn btn-danger" data-action="do-reset">ZERAR DADOS</button>
      </div>
    `);
  },

  /* ================= CRONÔMETRO DO TREINO ================= */
  _formatHMS(ms) {
    const s = Math.floor(ms / 1000);
    const h = String(Math.floor(s / 3600)).padStart(2,"0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2,"0");
    const sc = String(s % 60).padStart(2,"0");
    return h !== "00" ? `${h}:${m}:${sc}` : `${m}:${sc}`;
  },
  _elapsedMs() {
    if (!this.sessao || !this.sessao.iniciadaEm) return this._chronoAcc;
    if (this._chronoPaused) return this._chronoAcc;
    return this._chronoAcc + (Date.now() - this._chronoStart);
  },
  _startChrono() {
    if (this._chronoTimer) return;
    const base = this.sessao ? this.sessao.iniciadaEm : Date.now();
    const already = this._chronoAcc;
    if (!already) {
      const elapsedSinceStart = Date.now() - base;
      this._chronoAcc = elapsedSinceStart > 0 && elapsedSinceStart < 24*3600*1000 ? elapsedSinceStart : 0;
    }
    this._chronoStart = Date.now();
    this._chronoPaused = 0;
    this._chronoTimer = setInterval(() => this._tickChrono(), 1000);
    this._tickChrono();
  },
  _stopChrono() {
    if (this._chronoTimer) { clearInterval(this._chronoTimer); this._chronoTimer = null; }
    if (!this._chronoPaused && this._chronoStart) {
      this._chronoAcc += Date.now() - this._chronoStart;
    }
    this._chronoStart = 0;
  },
  _toggleChrono() {
    if (this._chronoPaused) {
      this._chronoPaused = 0; this._chronoStart = Date.now();
      this._chronoTimer = setInterval(() => this._tickChrono(), 1000);
    } else {
      if (this._chronoTimer) { clearInterval(this._chronoTimer); this._chronoTimer=null; }
      this._chronoAcc += Date.now() - this._chronoStart;
      this._chronoPaused = 1;
      this._chronoStart = 0;
    }
    this._tickChrono();
  },
  _resetChrono() {
    this._stopChrono();
    this._chronoAcc = 0; this._chronoPaused=0;
    if (this.sessao) this.sessao.iniciadaEm = Date.now();
    this._startChrono();
  },
  _tickChrono() {
    const el = document.getElementById("chrono-time");
    if (!el) return;
    el.textContent = this._formatHMS(this._elapsedMs());
    const btn = document.getElementById("chrono-toggle");
    if (btn) btn.textContent = this._chronoPaused ? "▶ RETOMAR" : "⏸ PAUSAR";
  },
  _chronoHTML() {
    return `
      <div class="chrono-bar">
        <span class="chrono-label">⏱ TEMPO</span>
        <span class="chrono-time" id="chrono-time">${this._formatHMS(this._elapsedMs())}</span>
        <button class="btn btn-ghost chrono-btn" id="chrono-toggle" data-action="chrono-toggle">${this._chronoPaused?"▶ RETOMAR":"⏸ PAUSAR"}</button>
        <button class="btn btn-ghost chrono-btn" data-action="chrono-reset">↺ ZERAR</button>
      </div>`;
  },

  /* ================= CARDIO ================= */
  _salvarCardioDraft() {
    try {
      const draft = {
        mod: this._cardioMod,
        vals: {
          duracao: document.getElementById("cardio-duracao")?.value || "",
          distancia: document.getElementById("cardio-distancia")?.value || "",
          velocidade: document.getElementById("cardio-velocidade")?.value || "",
          inclinacao: document.getElementById("cardio-inclinacao")?.value || "",
          resistencia: document.getElementById("cardio-resistencia")?.value || "",
          andares: document.getElementById("cardio-andares")?.value || "",
          estilo: document.getElementById("cardio-estilo")?.value || "",
          calorias: document.getElementById("cardio-calorias")?.value || "",
          obs: document.getElementById("cardio-obs")?.value || ""
        }
      };
      localStorage.setItem(this._cardioDraftKey, JSON.stringify(draft));
    } catch(e){}
  },
  _carregarCardioDraft() {
    try {
      const raw = localStorage.getItem(this._cardioDraftKey);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch(e){ return null; }
  },
  _limparCardioDraft(){ try{ localStorage.removeItem(this._cardioDraftKey);}catch(e){} },

  render_cardio(scr) {
    const draft = this._carregarCardioDraft();
    if (draft && draft.mod) this._cardioMod = draft.mod;
    const mod = cardioModalidadePorId(this._cardioMod) || CARDIO_MODALIDADES[0];
    const vals = draft?.vals || {};
    const recentes = [...(State.s.cardios||[])].sort((a,b)=>b.data-a.data).slice(0,8);
    const stats = Stats.cardioEstatisticas(State.s);
    scr.innerHTML = `
      <div class="workout-head">
        <h1 class="workout-ex-name">🏃 Cardio</h1>
        <p class="workout-sub">Registre sua atividade aeróbica</p>
        <button class="btn btn-ghost" data-action="back" style="width:auto;margin:.6rem auto;padding:.4rem 1.2rem;font-size:.8rem;">← Taverna</button>
      </div>

      <div class="panel">
        <div class="panel-title">Modalidade</div>
        <div class="cardio-modalidade-grid">
          ${CARDIO_MODALIDADES.map(m=>`
            <button class="cardio-mod-btn ${m.id===mod.id?"on":""}" data-action="select-cardio-mod" data-arg="${m.id}">${m.icone} ${m.nome}</button>
          `).join("")}
        </div>
      </div>

      <div class="panel" id="cardio-form">
        <div class="panel-title">${mod.icone} ${mod.nome}</div>
        ${this._cardioCamposHTML(mod, vals)}
        <div id="cardio-derived" class="cardio-derived"></div>
        <div id="cardio-erros" style="color:#ff9a80;margin:.5rem 0;"></div>
        <button class="btn btn-primary" data-action="submit-cardio">💾 REGISTRAR CARDIO</button>
        <p class="m-sub" style="text-align:center;color:var(--text-dim);font-size:.8rem;margin-top:.4rem;">Duração é obrigatória. Outros campos são opcionais.</p>
      </div>

      ${stats.total? `
      <div class="panel">
        <div class="panel-title">Estatísticas de Cardio</div>
        <div class="kv-grid">
          <div class="kv"><div class="k">Sessões</div><div class="v">${stats.total}</div></div>
          <div class="kv"><div class="k">Tempo total</div><div class="v">${Math.floor(stats.tempo/60)}h ${stats.tempo%60}min</div></div>
          <div class="kv"><div class="k">Distância</div><div class="v">${stats.dist.toFixed(1)} km</div></div>
          <div class="kv"><div class="k">Mais praticada</div><div class="v">${stats.maisPraticada? (cardioModalidadePorId(stats.maisPraticada[0])?.nome||stats.maisPraticada[0])+" ("+stats.maisPraticada[1]+")":"—"}</div></div>
          <div class="kv"><div class="k">Maior distância</div><div class="v">${stats.maiorDist.toFixed(1)} km</div></div>
          <div class="kv"><div class="k">Maior duração</div><div class="v">${stats.maiorDur} min</div></div>
          <div class="kv"><div class="k">Melhor pace</div><div class="v">${stats.melhorPace? this._formatPace(stats.melhorPace):"—"}</div></div>
          <div class="kv"><div class="k">Frequência</div><div class="v">${stats.freq}/mês</div></div>
        </div>
      </div>`:""}

      <div class="panel">
        <div class="panel-title">Histórico Recente</div>
        ${recentes.length? recentes.map(c=>{
          const mm = cardioModalidadePorId(c.modalidade);
          return `<div class="hist-entry cardio">
            <span class="he-ex">${mm?mm.icone:""} ${mm?mm.nome:c.modalidade} · ${c.duracaoMin}min ${c.distanciaKm? "· "+c.distanciaKm+"km":""} ${c.paceMinPerKm? "· pace "+this._formatPace(c.paceMinPerKm):""}</span>
            <span class="he-sets">${new Date(c.data).toLocaleDateString("pt-BR")}</span>
            <button class="icon-btn danger" data-action="delete-cardio" data-arg="${c.id}" title="Apagar">✕</button>
          </div>`;
        }).join("") : `<p class="empty-msg">Nenhum cardio registrado ainda.</p>`}
      </div>
    `;
    // listeners para draft e derivados
    setTimeout(()=>{
      const form = document.getElementById("cardio-form");
      if (!form) return;
      form.querySelectorAll("input,select,textarea").forEach(inp=>{
        inp.addEventListener("input", ()=>{ this._salvarCardioDraft(); this._atualizarCardioDerivados(); });
        inp.addEventListener("change", ()=>{ this._salvarCardioDraft(); this._atualizarCardioDerivados(); });
      });
      this._atualizarCardioDerivados();
    },0);
  },
  _cardioCamposHTML(mod, vals){
    const v = (k)=> escapar(vals[k]||"");
    const field = (id, label, placeholder, type="number", extra="")=>`
      <div class="form-field">
        <label>${label}</label>
        <input type="${type}" id="${id}" value="${v(id.replace("cardio-",""))}" placeholder="${placeholder}" ${extra}>
        <div class="field-error" id="${id}-err"></div>
      </div>`;
    let html = "";
    // duração sempre
    const durH = Math.floor((parseFloat(vals.duracao)||0)/60);
    const durM = (parseFloat(vals.duracao)||0)%60;
    html += `
      <div class="form-field">
        <label>Duração (minutos) *</label>
        <input type="number" id="cardio-duracao" inputmode="numeric" min="1" max="600" step="1" value="${v("duracao")}" placeholder="30">
        <div class="field-error" id="cardio-duracao-err"></div>
      </div>`;
    if (mod.campos.includes("distancia")) html += field("cardio-distancia","Distância (km)","5.0", "number", 'min="0" max="300" step="0.1"');
    if (mod.campos.includes("velocidade")) html += field("cardio-velocidade","Velocidade média (km/h)","10", "number", 'min="0" max="60" step="0.1"');
    if (mod.campos.includes("pace")) html += `<p class="m-sub" style="text-align:center">Pace será calculado automaticamente (tempo + distância).</p>`;
    if (mod.campos.includes("inclinacao")) html += field("cardio-inclinacao","Inclinação (%)","2", "number", 'min="0" max="60" step="0.5"');
    if (mod.campos.includes("resistencia")) html += `
      <div class="form-field"><label>Resistência / Nível</label><input type="text" id="cardio-resistencia" maxlength="20" value="${v("resistencia")}" placeholder="Nível 5"><div class="field-error" id="cardio-resistencia-err"></div></div>`;
    if (mod.campos.includes("andares")) html += field("cardio-andares","Andares / Subidas","20", "number", 'min="0" max="5000" step="1"');
    if (mod.campos.includes("estilo")) html += `
      <div class="form-field"><label>Estilo</label><select id="cardio-estilo"><option value="">—</option>${["Livre","Crawl","Peito","Costas","Borboleta","Medley"].map(o=>`<option ${v("estilo")===o?"selected":""}>${o}</option>`).join("")}</select></div>`;
    html += field("cardio-calorias","Calorias (kcal)","250", "number", 'min="0" max="20000" step="1"');
    html += `<div class="form-field"><label>Observações</label><textarea id="cardio-obs" maxlength="200" placeholder="Sensação, terreno...">${v("obs")}</textarea></div>`;
    return html;
  },
  _formatPace(p){
    const m = Math.floor(p); const s = Math.round((p-m)*60); return `${m}:${String(s).padStart(2,"0")} /km`;
  },
  _atualizarCardioDerivados(){
    const dur = parseFloat(document.getElementById("cardio-duracao")?.value);
    const dist = parseFloat(document.getElementById("cardio-distancia")?.value);
    const el = document.getElementById("cardio-derived");
    if (!el) return;
    if (dur>0 && dist>0) {
      const pace = dur/dist; const vel = dist/(dur/60);
      el.textContent = `→ Pace ${this._formatPace(pace)} · Vel ${vel.toFixed(1)} km/h`;
    } else if (dur>0 && !isNaN(parseFloat(document.getElementById("cardio-velocidade")?.value)) && !dist) {
      // nada
      el.textContent = "";
    } else el.textContent = "";
  },
  _salvarCardio(){
    if (this._salvandoCardio) return;
    this._salvandoCardio = true;
    setTimeout(()=> this._salvandoCardio=false, 1200);
    const mod = this._cardioMod || "esteira";
    const get = id=> document.getElementById(id)?.value?.trim() ?? "";
    const dados = {
      modalidade: mod,
      duracaoMin: get("cardio-duracao"),
      distanciaKm: get("cardio-distancia"),
      velocidade: get("cardio-velocidade"),
      inclinacao: get("cardio-inclinacao"),
      resistencia: get("cardio-resistencia"),
      andares: get("cardio-andares"),
      estilo: get("cardio-estilo"),
      calorias: get("cardio-calorias"),
      obs: get("cardio-obs")
    };
    // limpa erros anteriores
    document.querySelectorAll(".field-error").forEach(e=> e.textContent="");
    document.querySelectorAll(".input-err").forEach(e=> e.classList.remove("input-err"));
    const res = State.addCardio(dados);
    if (!res.ok) {
      const errBox = document.getElementById("cardio-erros");
      if (errBox) errBox.textContent = res.erros.join(" ");
      // destaca campo duração
      const dInp = document.getElementById("cardio-duracao");
      if (dInp && (!dados.duracaoMin || isNaN(parseFloat(dados.duracaoMin)) || parseFloat(dados.duracaoMin)<=0)) {
        dInp.classList.add("input-err");
        const e = document.getElementById("cardio-duracao-err"); if(e) e.textContent = "Informe duração válida (1-600 min).";
      }
      this.toast("⚠ Corrija os campos destacados.");
      return;
    }
    const info = Game.completarCardio(res.cardio);
    this._limparCardioDraft();
    this.updateHUD();
    // celebração
    const eventos = [];
    for (const c of info.novasConq) eventos.push({ tipo:"conquista", icone:c.icone, nome:c.nome, desc:c.desc, xp:c.xp, ouro:c.ouro });
    if (eventos.length) {
      this.filaCelebracoes.push(...eventos);
      this.proximaCelebracao();
    }
    this.toast(`🏃 Cardio registrado! +${info.xp} XP · 🪙 +${info.ouro}`);
    this.floatXP(`+${info.xp} XP`);
    this.render_cardio(document.getElementById("screen-cardio"));
  },
  confirmarDeleteCardio(id){
    this.modal(`
      <div class="m-icon">☠</div>
      <h2>REMOVER CARDIO?</h2>
      <p>Essa ação não pode ser desfeita.</p>
      <div class="m-buttons">
        <button class="btn btn-ghost" data-action="close-modal">CANCELAR</button>
        <button class="btn btn-danger" data-action="confirm-delete-cardio" data-arg="${id}">REMOVER</button>
      </div>
    `);
  }
};

/* ---------- utilidades ---------- */
function escapar(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[c]);
}

// fechar modal clicando fora (exceto durante celebrações)
document.getElementById("overlay").addEventListener("click", (e) => {
  if (e.target.id === "overlay" && UI.filaCelebracoes.length === 0) UI.fecharModal();
});
