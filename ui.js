/* ================================================================
   EXERCITIUM — Interface & Fluxos
   ================================================================ */

const UI = {

  /* ================= INICIALIZAÇÃO / ROTEAMENTO ================= */
  telaAtual: "tavern",
  treinoAtual: null, // {exId, series:[], el: {...}}

  init() {
    State.init();
    this.bindGlobal();
    this.showScreen("tavern");
    this.updateHUD();
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
    document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
    const scr = document.getElementById("screen-" + nome);
    if (scr) { scr.classList.remove("hidden"); scr.innerHTML = ""; }
    this.updateHUD();
    if (this["render_" + nome]) this["render_" + nome](scr);
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
    "goto-tavern":      function () { this.showScreen("tavern"); },
    "start-workout":    function () { this.showScreen("exercises"); this._modoTreino = true; },
    "goto-exercises":   function () { this._modoTreino = false; this.showScreen("exercises"); },
    "goto-records":     function () { this.showScreen("records"); },
    "goto-character":   function () { this.showScreen("character"); },
    "goto-achievements":function () { this.showScreen("achievements"); },
    "goto-history":     function () { this.showScreen("history"); },
    "goto-saves":       function () { this.showScreen("saves"); },
    "back":             function () { this.showScreen("tavern"); },

    "select-exercise": function (id) {
      if (this._modoTreino) {
        this.iniciarTreino(id);
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

    "add-set":         function () { this.registrarSerie(); },
    "remove-set":      function (idx) { this.removerSerie(+idx); },
    "chip-fill":       function (arg, btn) {
      document.getElementById("inp-peso").value = btn.dataset.peso;
      document.getElementById("inp-reps").value = btn.dataset.reps;
      document.getElementById("inp-peso").focus();
    },
    "finish-workout":  function () { this.finalizarTreino(false); },
    "finish-workout-save": function () { this.finalizarTreino(true); },

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
      State.resetarTudo();
      this.fecharModal();
      this.toast("🔄 Jogo reiniciado.");
      this.showScreen("tavern");
    },
    "next-celebration": function () {
      this.fecharModal();
      this.proximaCelebracao();
    }
  },

  /* ================= TAVERNA ================= */
  render_tavern(scr) {
    const p = State.s.personagem;
    const st = State.s.streak;
    const stats = this.statsGlobais();
    const need = Game.xpNecessario(p.nivel);

    scr.innerHTML = `
      <div class="tavern-banner">
        <h1 class="game-title">EXERCITIUM</h1>
        <p class="game-subtitle">⚔ Crônicas do Ferro ⚔</p>
      </div>

      <div class="parchment character-summary">
        <div class="cs-name">${escapar(p.nome)}</div>
        <div class="cs-row"><span>Nível</span><span class="cs-val">${p.nivel}</span></div>
        <div class="cs-row"><span>Ouro</span><span class="cs-val">🪙 ${fmtNum(p.ouro)}</span></div>
        <div class="cs-row"><span>Streak</span><span class="cs-val">🔥 ${st.atual} dias</span></div>
        <div class="cs-row"><span>Treinos</span><span class="cs-val">⚒ ${stats.numTreinos}</span></div>
        <div class="cs-row"><span>Recordes quebrados</span><span class="cs-val">💥 ${stats.recordes}</span></div>
        <div class="xpbar big"><div class="xpbar-fill" style="width:${Math.min(100, p.xp/need*100)}%"></div><span class="xpbar-text">NV ${p.nivel} · ${p.xp}/${need} XP</span></div>
      </div>

      <button class="btn btn-primary btn-big" data-action="start-workout">⚔ INICIAR TREINO</button>

      <nav class="menu">
        <button class="menu-item" data-action="goto-exercises"><span class="mi-icon">📜</span><span>Exercícios</span></button>
        <button class="menu-item" data-action="goto-records"><span class="mi-icon">🏆</span><span>Recordes</span></button>
        <button class="menu-item" data-action="goto-character"><span class="mi-icon">👤</span><span>Personagem</span></button>
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

  /* ================= EXERCÍCIOS ================= */
  render_exercises(scr) {
    const busca = this._busca || "";
    const todos = State.todosExercicios()
      .filter(e => e.nome.toLowerCase().includes(busca.toLowerCase()))
      .sort((a, b) =>
        GRUPOS.indexOf(a.grupo) - GRUPOS.indexOf(b.grupo) ||
        a.nome.localeCompare(b.nome));

    let html = `
      <div class="workout-head">
        <h1 class="workout-ex-name">📜 ${this._modoTreino ? "Escolha seu desafio" : "Biblioteca de Exercícios"}</h1>
        <button class="btn btn-ghost" data-action="back" style="width:auto;margin:.6rem auto;padding:.4rem 1.2rem;font-size:.8rem;">← Taverna</button>
      </div>
      <input type="search" id="busca-ex" class="search-input" placeholder="Buscar exercício..." value="${escapar(busca)}">
      <button class="btn" data-action="new-exercise" style="margin-bottom:.8rem;">✒ Criar Exercício Personalizado</button>
    `;

    if (todos.length === 0) html += `<p class="empty-msg">Nenhum exercício encontrado.</p>`;

    let grupoAtual = null;
    html += `<div class="ex-list">`;
    for (const ex of todos) {
      if (ex.grupo !== grupoAtual) {
        grupoAtual = ex.grupo;
        html += `<div class="group-header">${grupoAtual}</div>`;
      }
      const st = State.statsExercicio(ex.id);
      const musc = [ex.principal.join(", "), ex.secundarios.join(", ")].filter(Boolean).join(" · ");
      html += `
        <div style="display:flex;gap:.35rem;align-items:stretch;">
          <button class="ex-item" style="flex:1" data-action="select-exercise" data-arg="${ex.id}">
            <div class="ex-info">
              <div>${ex.nome}${ex.padrao ? "" : ' <span title="Personalizado">✒</span>'}</div>
              <div class="ex-muscles">${musc}</div>
            </div>
            <div class="ex-stats">
              ${st.maiorPeso ? `🏅 ${st.maiorPeso.valor}kg<br>⚒ ${st.numTreinos}` : ""}
            </div>
          </button>
          ${!this._modoTreino ? `
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
        novoInp.focus();
        novoInp.setSelectionRange(pos, pos);
      }, 200);
    });
  },

  formExercicio(id) {
    const ex = id ? State.exercicioPorId(id) : null;
    const chipsMusculos = (selecionados) => MUSCULOS.map(m =>
      `<button type="button" class="check-chip${(selecionados || []).includes(m) ? " on" : ""}" data-action="toggle-muscle" data-musculo="${m}">${m}</button>`
    ).join("");

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
    const nome = document.getElementById("fex-nome").value.trim();
    if (!nome) { this.toast("⚠ Dê um nome ao exercício."); return; }
    const grupo = document.getElementById("fex-grupo").value;
    const pegar = (elId) => [...document.querySelectorAll(`#${elId} .check-chip.on`)].map(c => c.dataset.musculo);
    const principal = pegar("fex-principal");
    const secundarios = pegar("fex-sec");

    if (id) {
      if (String(id).startsWith("p")) {
        // padrão: cria cópia personalizada editada
        State.addExercicioCustom(nome, grupo, principal, secundarios);
        this.toast("✒ Cópia personalizada criada.");
      } else {
        State.updateExercicioCustom(id, nome, grupo, principal, secundarios);
        this.toast("✔ Exercício atualizado.");
      }
    } else {
      State.addExercicioCustom(nome, grupo, principal, secundarios);
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

  /* ================= TREINO ================= */
  iniciarTreino(exId) {
    const ex = State.exercicioPorId(exId);
    if (!ex) return;
    this._modoTreino = false;
    const st = State.statsExercicio(exId);
    this.treinoAtual = { exId, series: [] };

    const ultimasSeries = st.ultimo ? st.ultimo.series.map(s => `${s.peso}×${s.reps}`).join("  ") : null;

    let html = `
      <div class="workout-head">
        <h1 class="workout-ex-name">⚔ ${escapar(ex.nome.toUpperCase())}</h1>
        <p class="workout-sub">${ex.grupo} · Principal: ${ex.principal.join(", ")}${ex.secundarios.length ? " · Sec.: " + ex.secundarios.join(", ") : ""}</p>
        <button class="btn btn-ghost" data-action="back" style="width:auto;margin:.5rem auto;padding:.4rem 1.2rem;font-size:.8rem;">← Cancelar</button>
      </div>

      <div class="panel">
        <div class="panel-title">Registrar Série</div>
        <div class="inputs-grid">
          <div class="field">
            <label>Peso (kg)</label>
            <input type="number" id="inp-peso" inputmode="decimal" min="0" step="0.5" placeholder="30">
          </div>
          <div class="times-sep">×</div>
          <div class="field">
            <label>Repetições</label>
            <input type="number" id="inp-reps" inputmode="numeric" min="1" step="1" placeholder="10">
          </div>
        </div>
        <div class="quick-chips" id="quick-chips"></div>
        <button class="btn btn-primary" data-action="add-set">＋ REGISTRAR SÉRIE</button>
        ${ultimasSeries ? `<p class="last-session" style="margin-top:.7rem;text-align:center;">Último treino: <b>${ultimasSeries}</b></p>` : `<p class="last-session" style="margin-top:.7rem;text-align:center;"><i>Primeira vez neste exercício!</i></p>`}
      </div>

      <div class="panel">
        <div class="panel-title">Séries de Hoje</div>
        <div class="sets-table" id="sets-table"><p class="empty-msg" style="padding:.8rem">Nenhuma série ainda.</p></div>
      </div>

      <button class="btn btn-danger" data-action="finish-workout">🏁 FINALIZAR TREINO</button>
    `;
    const scr = document.getElementById("screen-workout");
    scr.innerHTML = html;

    this.renderQuickChips(st);
    const peso = document.getElementById("inp-peso");
    const reps = document.getElementById("inp-reps");
    reps.focus({ preventScroll: true });
    [peso, reps].forEach(inp => inp.addEventListener("keydown", e => {
      if (e.key === "Enter") this.registrarSerie();
    }));
    peso.addEventListener("input", () => this.renderQuickChips(null));
  },

  renderQuickChips(st) {
    const cont = document.getElementById("quick-chips");
    if (!cont) return;
    let base;
    const pesoAtual = parseFloat(document.getElementById("inp-peso")?.value);
    if (!isNaN(pesoAtual)) base = pesoAtual;
    else if (st && st.ultimo) base = st.ultimo.series[0]?.peso ?? null;
    else base = null;

    if (base == null) { cont.innerHTML = ""; return; }
    const combos = [
      [base, 10], [base, 12], [base, 8],
      [base + 2.5, 10], [base + 5, 8]
    ];
    cont.innerHTML = combos.filter(c => c[0] >= 0).map(([p, r]) =>
      `<button class="chip" data-action="chip-fill" data-peso="${p}" data-reps="${r}">${p}×${r}</button>`
    ).join("");
  },

  registrarSerie() {
    const t = this.treinoAtual;
    if (!t) return;
    const pesoEl = document.getElementById("inp-peso");
    const repsEl = document.getElementById("inp-reps");
    const peso = parseFloat(pesoEl.value);
    const reps = parseInt(repsEl.value, 10);
    if (isNaN(peso) || peso <= 0 || isNaN(reps) || reps <= 0) {
      this.toast("⚠ Informe peso e repetições válidos.");
      return;
    }
    t.series.push({ peso, reps });
    this.floatXP("+10 XP");
    this.ganharXPSilencioso(10, 2);

    // atualiza tabela
    const table = document.getElementById("sets-table");
    table.innerHTML = t.series.map((s, i) => `
      <div class="set-row">
        <div class="set-num">${i + 1}</div>
        <div class="set-data">${s.peso} kg × ${s.reps}<small> · vol ${fmtNum(s.peso * s.reps)} kg</small></div>
        <button class="set-del" data-action="remove-set" data-arg="${i}" title="Remover série">🗑</button>
      </div>`).join("");

    // prefill para próxima série
    pesoEl.value = peso;
    repsEl.value = "";
    repsEl.focus();
    this.renderQuickChips(null);

    // scroll suave até a última série
    table.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  },

  ganharXPSilencioso(xp, ouro) {
    const evts = Game.ganharXP(xp);
    Game.ganharOuro(ouro);
    this.updateHUD();
    if (evts.length) {
      // adia celebração para depois do fluxo do treino
      this._levelupsPendentes = (this._levelupsPendentes || []).concat(evts);
    }
  },

  removerSerie(idx) {
    const t = this.treinoAtual;
    if (!t) return;
    t.series.splice(idx, 1);
    const table = document.getElementById("sets-table");
    if (t.series.length === 0) {
      table.innerHTML = `<p class="empty-msg" style="padding:.8rem">Nenhuma série ainda.</p>`;
    } else {
      table.innerHTML = t.series.map((s, i) => `
        <div class="set-row">
          <div class="set-num">${i + 1}</div>
          <div class="set-data">${s.peso} kg × ${s.reps}<small> · vol ${fmtNum(s.peso * s.reps)} kg</small></div>
          <button class="set-del" data-action="remove-set" data-arg="${i}">🗑</button>
        </div>`).join("");
    }
  },

  finalizarTreino(autoSalvou) {
    const t = this.treinoAtual;
    if (!t || t.series.length === 0) {
      this.treinoAtual = null;
      this.toast("Treino descartado (nenhuma série registrada).");
      this.showScreen("tavern");
      return;
    }

    const ex = State.exercicioPorId(t.exId);
    const eventos = [];

    // 1. Recordes (antes de salvar para comparação limpa)
    const quebras = Game.checarRecordes(t.exId, t.series);
    for (const q of quebras) {
      const xpRec = 50;
      this.ganharXPSilencioso(xpRec, 10);
      eventos.push({ ...q, tipo: "record", exNome: ex.nome, xp: xpRec });
    }

    // 2. Salva treino
    State.addTreino(t.exId, t.series);
    this.treinoAtual = null;

    // 3. Streak
    const streakNovo = Game.atualizarStreak();

    // 4. XP por finalizar exercício/treino
    this.ganharXPSilencioso(25 + t.series.length * 5, 5 + t.series.length);

    // 5. Conquistas
    const novasConq = Game.checarConquistas();
    for (const c of novasConq) {
      this.ganharXPSilencioso(c.xp, c.ouro);
      eventos.push({ tipo: "conquista", icone: c.icone, nome: c.nome, desc: c.desc, xp: c.xp, ouro: c.ouro });
    }

    // 6. Level-ups pendentes entram na fila por último? Não — primeiro levelups, depois conquistas visuais.
    const pendentes = (this._levelupsPendentes || []);
    this._levelupsPendentes = [];

    // ordem: records -> levelup -> conquistas
    const ordenado = [
      ...eventos.filter(e => e.tipo === "record"),
      ...pendentes.map(e => ({ tipo: "levelup", ...e })),
      ...eventos.filter(e => e.tipo === "conquista")
    ];

    if (streakNovo && State.s.streak.atual > 1) {
      this.toast(`🔥 ${State.s.streak.atual} dias consecutivos!`);
    }

    this.updateHUD();

    // resumo + celebrações
    const volTotal = t.series.reduce((v, s) => v + s.peso * s.reps, 0);
    this.modal(`
      <div class="m-icon">🏁</div>
      <h2>TREINO REGISTRADO!</h2>
      <p class="m-sub">${escapar(ex.nome)}</p>
      <div class="m-big">${t.series.length} séries · ${fmtNum(volTotal)} kg</div>
      <div class="m-gain">+XP e 🪙 conquistados!</div>
      <button class="btn btn-primary" id="btn-continuar-treino">CONTINUAR</button>
    `);
    // enfileira celebrações após o resumo
    this.filaCelebracoes.push(...ordenado);

    document.getElementById("btn-continuar-treino").onclick = () => {
      this.fecharModal();
      this.proximaCelebracao();
      if (!this.filaCelebracoes.length) {
        setTimeout(() => this.showScreen("tavern"), 400);
      }
    };
  },

  /* ================= DETALHE DO EXERCÍCIO ================= */
  detalheExercicio(id) {
    const ex = State.exercicioPorId(id);
    if (!ex) return;
    const st = State.statsExercicio(id);
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
      <div class="m-buttons">
        <button class="btn btn-ghost" data-action="close-modal">FECHAR</button>
        <button class="btn btn-primary" onclick="UI.fecharModal();UI._modoTreino=true;UI.iniciarTreino('${id}')">⚔ TREINAR</button>
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
  render_character(scr) {
    const p = State.s.personagem;
    const st = State.s.streak;
    const g = this.statsGlobais();
    const need = Game.xpNecessario(p.nivel);

    // Estatísticas derivadas (0–100, visuais)
    const forca = Math.min(100, Math.round(Math.log10(g.volume + 1) * 22));
    const vigor = Math.min(100, Math.round(Math.sqrt(g.volume / 500)));
    const disciplina = Math.min(100, Math.round(st.melhor * 3.3));

    const titulo = p.nivel >= 40 ? "Lenda Viva"
      : p.nivel >= 25 ? "Cavaleiro de Ferro"
      : p.nivel >= 15 ? "Guerreiro"
      : p.nivel >= 8 ? "Escudeiro"
      : "Novato da Taverna";

    scr.innerHTML = `
      <div class="workout-head">
        <h1 class="workout-ex-name">👤 Ficha do Herói</h1>
        <button class="btn btn-ghost" data-action="back" style="width:auto;margin:.6rem auto;padding:.4rem 1.2rem;font-size:.8rem;">← Taverna</button>
      </div>

      <div class="parchment char-sheet">
        <div class="char-avatar">🛡</div>
        <div class="char-name">${escapar(p.nome)}</div>
        <div class="char-class">${titulo} · Nível ${p.nivel}</div>
        <div class="xpbar big" style="border-color:#7a5c2e;margin-top:.6rem;">
          <div class="xpbar-fill" style="width:${Math.min(100,p.xp/need*100)}%"></div>
          <span class="xpbar-text">${p.xp}/${need} XP</span>
        </div>

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
        <button class="btn" data-action="rename-character" style="margin-top:.8rem;width:auto;padding:.45rem 1.2rem;font-size:.78rem;margin-left:auto;margin-right:auto;">✒ Renomear Herói</button>
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
    const treinos = [...State.s.treinos].sort((a, b) => b.data - a.data).slice(0, 60);
    let html = `
      <div class="workout-head">
        <h1 class="workout-ex-name">📖 Crônicas de Treino</h1>
        <button class="btn btn-ghost" data-action="back" style="width:auto;margin:.6rem auto;padding:.4rem 1.2rem;font-size:.8rem;">← Taverna</button>
      </div>
    `;
    if (!treinos.length) {
      html += `<p class="empty-msg">Sua história ainda não começou.<br>Registre o primeiro capítulo! ⚔</p>`;
    } else {
      let diaAtual = null;
      html += `<div class="hist-day">`;
      for (const t of treinos) {
        const dia = new Date(t.data).toLocaleDateString("pt-BR",
          { weekday: "long", day: "numeric", month: "long" });
        if (dia !== diaAtual) {
          if (diaAtual) html += `</div><div class="hist-day">`;
          diaAtual = dia;
          html += `<div class="hist-date">${dia}</div>`;
        }
        const ex = State.exercicioPorId(t.exercicioId);
        html += `
          <div class="hist-entry">
            <span class="he-ex">${ex ? escapar(ex.nome) : "?"}</span>
            <span class="he-sets">${t.series.map(s => `${s.peso}×${s.reps}`).join(" ")}</span>
          </div>`;
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
          Apagar todos os dados e começar uma nova jornada. Esta ação é irreversível.
        </p>
        <button class="btn btn-danger" data-action="reset-all">🔥 REINICIAR AVENTURA</button>
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
      <div class="m-icon">💀</div>
      <h2>APAGAR TUDO?</h2>
      <p>Sua jornada inteira será perdida:<br>
      nível, ouro, recordes, treinos e conquistas.</p>
      <div class="m-buttons">
        <button class="btn btn-ghost" data-action="close-modal">MANTER MEU SAVE</button>
        <button class="btn btn-danger" data-action="do-reset">APAGAR E RECOMEÇAR</button>
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
