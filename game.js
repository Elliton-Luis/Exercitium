/* ================================================================
   EXERCITIUM — Lógica de jogo
   XP, níveis, ouro, streak, recordes, conquistas
   ================================================================ */

const Game = {

  /* ---------- XP / Nível ---------- */
  xpAtualDoNivel() {
    // total de xp acumado dentro do nível atual
    return State.s.personagem.xp;
  },
  xpNecessario(nivel) {
    return xpParaProximoNivel(nivel);
  },

  ganharXP(qtd) {
    const p = State.s.personagem;
    const eventos = [];
    p.xp += qtd;
    while (p.xp >= this.xpNecessario(p.nivel)) {
      p.xp -= this.xpNecessario(p.nivel);
      p.nivel++;
      const ouroGanho = 20 + p.nivel * 5;
      p.ouro += ouroGanho;
      eventos.push({ tipo: "levelup", nivel: p.nivel, ouro: ouroGanho });
    }
    State.save();
    return eventos;
  },

  ganharOuro(qtd) {
    State.s.personagem.ouro += qtd;
    State.save();
  },

  /* ---------- Streak ---------- */
  hojeStr(d = new Date()) {
    return d.toISOString().slice(0, 10);
  },
  ontemStr() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  },

  atualizarStreak() {
    const st = State.s.streak;
    const hoje = this.hojeStr();
    if (st.ultimoDia === hoje) return false; // já contou hoje
    if (st.ultimoDia === this.ontemStr()) {
      st.atual++;
    } else {
      st.atual = 1; // perdeu dias -> recomeça (sem punição extra)
    }
    st.ultimoDia = hoje;
    if (st.atual > st.melhor) st.melhor = st.atual;
    State.save();
    return true;
  },

  /* ---------- Recordes ----------
     Compara as séries do treino recém-finalizado com os recordes
     salvos e retorna a lista de recordes quebrados.             */
  checarRecordes(exId, series) {
    const rec = State.s.recordes[exId] || {};
    const quebrados = [];

    for (const se of series) {
      const vol = se.peso * se.reps;

      if (!rec.maiorPeso || se.peso > rec.maiorPeso.valor) {
        quebrados.push({
          tipo: "maiorPeso",
          label: "Maior Peso",
          novo: `${se.peso} kg × ${se.reps}`,
          antigo: rec.maiorPeso ? `${rec.maiorPeso.valor} kg` : null
        });
        rec.maiorPeso = { valor: se.peso, reps: se.reps };
      }
      if (!rec.maiorReps || se.reps > rec.maiorReps.reps) {
        quebrados.push({
          tipo: "maiorReps",
          label: "Mais Repetições",
          novo: `${se.reps} reps × ${se.peso} kg`,
          antigo: rec.maiorReps ? `${rec.maiorReps.reps} reps` : null
        });
        rec.maiorReps = { valor: se.reps, peso: se.peso };
      }
      if (!rec.melhorSerie || vol > rec.melhorSerie.vol) {
        quebrados.push({
          tipo: "melhorSerie",
          label: "Melhor Série",
          novo: `${se.peso} kg × ${se.reps}`,
          antigo: rec.melhorSerie ? `${rec.melhorSerie.peso} kg × ${rec.melhorSerie.reps}` : null
        });
        rec.melhorSerie = { valor: se.peso, reps: se.reps, vol };
      }
    }

    // maior volume em um único treino deste exercício
    const volTreino = series.reduce((v, s) => v + s.peso * s.reps, 0);
    if (!rec.melhorVolumeTreino || volTreino > rec.melhorVolumeTreino.vol) {
      quebrados.push({
        tipo: "melhorVolumeTreino",
        label: "Volume do Treino",
        novo: `${fmtNum(volTreino)} kg`,
        antigo: rec.melhorVolumeTreino ? `${fmtNum(rec.melhorVolumeTreino.vol)} kg` : null
      });
      rec.melhorVolumeTreino = { valor: volTreino, vol: volTreino };
    }

    rec.quebras = (rec.quebras || 0) + quebrados.length;
    State.s.recordes[exId] = rec;
    State.save();
    return quebrados;
  },

  /* ---------- Conquistas ---------- */
  checarConquistas() {
    const desbloq = [];
    for (const c of CONQUISTAS) {
      if (!State.s.conquistas[c.id] && c.check(State.s)) {
        State.s.conquistas[c.id] = { data: Date.now() };
        desbloq.push(c);
      }
    }
    if (desbloq.length) State.save();
    return desbloq;
  }
};

function fmtNum(n) {
  return n.toLocaleString("pt-BR");
}
