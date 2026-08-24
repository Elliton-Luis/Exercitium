/* ================================================================
   EXERCITIUM — Derivações estatísticas
   Tudo calculado a partir dos treinos realmente registrados.
   ================================================================ */

const Stats = (() => {

  /* ---- números gerais ---- */
  function gerais(s) {
    const p = s.personagem;
    let repeticoes = 0, volume = 0, pesoMax = 0;

    for (const t of s.treinos) {
      for (const se of t.series) {
        repeticoes += se.reps;
        volume += se.peso * se.reps;
        if (se.peso > pesoMax) pesoMax = se.peso;
      }
    }

    // XP acumulado desde o nível 1 (XP atual dentro do nível + níveis passados)
    let xpTotal = p.xp;
    for (let i = 1; i < p.nivel; i++) xpTotal += xpParaProximoNivel(i);

    return {
      treinos: s.treinos.length,
      series: totalSeries(s),
      repeticoes,
      volume,
      pesoMax,
      recordes: recordesQuebrados(s),
      xpTotal,
      streakAtual: s.streak.atual,
      streakMelhor: s.streak.melhor
    };
  }

  /* ---- agregação de treinos por período ---- */
  function chaveSemana(data) {
    const d = new Date(data);
    const dia = (d.getDay() + 6) % 7; // segunda = 0
    d.setDate(d.getDate() - dia);
    return d.toISOString().slice(0, 10); // segunda-feira da semana
  }
  
  function rotuloSemana(seg) {
    const d = new Date(seg + "T12:00:00");
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  }

  function volumePorPeriodo(s, modo, limite) {
    // modo: "semana" | "mes"
    const acc = {};
    for (const t of s.treinos) {
      const d = new Date(t.data);
      const chave = modo === "semana" ? chaveSemana(t.data)
                                      : d.toISOString().slice(0, 7);
      acc[chave] = (acc[chave] || 0) +
        t.series.reduce((v, se) => v + se.peso * se.reps, 0);
    }
    const chaves = Object.keys(acc).sort().slice(-limite);
    return chaves.map(chave => ({
      chave,
      label: modo === "semana" ? rotuloSemana(chave)
                               : new Date(chave + "-01T12:00:00")
                                   .toLocaleDateString("pt-BR", { month: "short" }),
      valor: Math.round(acc[chave])
    }));
  }

  /* volume em kg distribuído entre os músculos principais de cada treino */
  function volumePorGrupo(s) {
    const vol = {};
    for (const t of s.treinos) {
      const ex = State.exercicioPorId(t.exercicioId);
      if (!ex || !ex.principal.length) continue;
      const v = t.series.reduce((x, se) => x + se.peso * se.reps, 0);
      const fatia = v / ex.principal.length;
      for (const m of ex.principal) vol[m] = (vol[m] || 0) + fatia;
    }
    return vol;
  }

  /* ---- evolução de um exercício (sessões em ordem cronológica) ---- */
  function evolucaoExercicio(exId) {
    const sessoes = State.treinosDoExercicio(exId)
      .slice()
      .sort((a, b) => a.data - b.data)
      .map(t => ({
        data: t.data,
        maxPeso: Math.max(...t.series.map(se => se.peso)),
        volume: t.series.reduce((v, se) => v + se.peso * se.reps, 0),
        numSeries: t.series.length
      }));
    return sessoes;
  }

  return { gerais, volumePorPeriodo, volumePorGrupo, evolucaoExercicio };
})();
