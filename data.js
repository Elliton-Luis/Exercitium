/* ================================================================
   EXERCITIUM — Dados estáticos
   Biblioteca de exercícios padrão + conquistas
   ================================================================ */

const GRUPOS = [
  "Peito", "Costas", "Ombros", "Bíceps", "Tríceps",
  "Pernas", "Abdômen"
];

const MUSCULOS = [
  "Peitoral", "Costas", "Ombros", "Bíceps", "Tríceps",
  "Quadríceps", "Posterior", "Glúteos", "Panturrilha",
  "Core", "Antebraço"
];

// Biblioteca padrão — id, nome, grupo, principal[], secundarios[]
const BIBLIOTECA_PADRAO = [
  // Peito
  { nome: "Supino Reto",         grupo: "Peito",   principal: ["Peitoral"],    secundarios: ["Tríceps", "Ombros"] },
  { nome: "Supino Inclinado",    grupo: "Peito",   principal: ["Peitoral"],    secundarios: ["Tríceps", "Ombros"] },
  { nome: "Supino Máquina",      grupo: "Peito",   principal: ["Peitoral"],    secundarios: ["Tríceps"] },
  { nome: "Crucifixo",           grupo: "Peito",   principal: ["Peitoral"],    secundarios: ["Ombros"] },
  { nome: "Peck Deck",           grupo: "Peito",   principal: ["Peitoral"],    secundarios: ["Ombros"] },
  { nome: "Crossover",           grupo: "Peito",   principal: ["Peitoral"],    secundarios: ["Ombros"] },

  // Costas
  { nome: "Puxada Alta",         grupo: "Costas",  principal: ["Costas"],      secundarios: ["Bíceps"] },
  { nome: "Remada",              grupo: "Costas",  principal: ["Costas"],      secundarios: ["Bíceps", "Core"] },
  { nome: "Remada Máquina",      grupo: "Costas",  principal: ["Costas"],      secundarios: ["Bíceps"] },
  { nome: "Barra Fixa",          grupo: "Costas",  principal: ["Costas"],      secundarios: ["Bíceps", "Core"] },
  { nome: "Pulldown",            grupo: "Costas",  principal: ["Costas"],      secundarios: ["Bíceps"] },
  { nome: "Remada Baixa",        grupo: "Costas",  principal: ["Costas"],      secundarios: ["Bíceps"] },

  // Ombros
  { nome: "Desenvolvimento",     grupo: "Ombros",  principal: ["Ombros"],      secundarios: ["Tríceps"] },
  { nome: "Desenvolvimento Máquina", grupo: "Ombros", principal: ["Ombros"],   secundarios: ["Tríceps"] },
  { nome: "Elevação Lateral",    grupo: "Ombros",  principal: ["Ombros"],      secundarios: [] },
  { nome: "Elevação Frontal",    grupo: "Ombros",  principal: ["Ombros"],      secundarios: ["Peitoral"] },
  { nome: "Crucifixo Inverso",   grupo: "Ombros",  principal: ["Ombros"],      secundarios: ["Costas"] },

  // Bíceps
  { nome: "Rosca Direta",        grupo: "Bíceps",  principal: ["Bíceps"],      secundarios: ["Antebraço"] },
  { nome: "Rosca Alternada",     grupo: "Bíceps",  principal: ["Bíceps"],      secundarios: ["Antebraço"] },
  { nome: "Rosca Martelo",       grupo: "Bíceps",  principal: ["Bíceps"],      secundarios: ["Antebraço"] },
  { nome: "Rosca Scott",         grupo: "Bíceps",  principal: ["Bíceps"],      secundarios: [] },

  // Tríceps
  { nome: "Tríceps Pulley",      grupo: "Tríceps", principal: ["Tríceps"],     secundarios: [] },
  { nome: "Tríceps Francês",     grupo: "Tríceps", principal: ["Tríceps"],     secundarios: [] },
  { nome: "Tríceps Testa",       grupo: "Tríceps", principal: ["Tríceps"],     secundarios: [] },
  { nome: "Tríceps Máquina",     grupo: "Tríceps", principal: ["Tríceps"],     secundarios: [] },

  // Pernas
  { nome: "Agachamento",         grupo: "Pernas",  principal: ["Quadríceps"],  secundarios: ["Glúteos", "Posterior", "Core"] },
  { nome: "Leg Press",           grupo: "Pernas",  principal: ["Quadríceps"],  secundarios: ["Glúteos"] },
  { nome: "Cadeira Extensora",   grupo: "Pernas",  principal: ["Quadríceps"],  secundarios: [] },
  { nome: "Mesa Flexora",        grupo: "Pernas",  principal: ["Posterior"],   secundarios: [] },
  { nome: "Cadeira Flexora",     grupo: "Pernas",  principal: ["Posterior"],   secundarios: [] },
  { nome: "Stiff",               grupo: "Pernas",  principal: ["Posterior"],   secundarios: ["Glúteos", "Core"] },
  { nome: "Afundo",              grupo: "Pernas",  principal: ["Quadríceps"],  secundarios: ["Glúteos"] },
  { nome: "Passada",             grupo: "Pernas",  principal: ["Quadríceps"],  secundarios: ["Glúteos"] },
  { nome: "Elevação Pélvica",    grupo: "Pernas",  principal: ["Glúteos"],     secundarios: ["Posterior"] },
  { nome: "Panturrilha",         grupo: "Pernas",  principal: ["Panturrilha"], secundarios: [] },

  // Abdômen
  { nome: "Abdominal",           grupo: "Abdômen", principal: ["Core"],        secundarios: [] },
  { nome: "Abdominal Máquina",   grupo: "Abdômen", principal: ["Core"],        secundarios: [] },
  { nome: "Elevação de Pernas",  grupo: "Abdômen", principal: ["Core"],        secundarios: [] },
  { nome: "Prancha",             grupo: "Abdômen", principal: ["Core"],        secundarios: ["Ombros"] }
];

// Conquistas — check(state) => bool
const CONQUISTAS = [
  {
    id: "primeiro_sangue", icone: "🩸", nome: "Primeiro Sangue",
    desc: "Registre sua primeira série.",
    xp: 50, ouro: 25,
    check: s => s.treinos.length > 0 || totalSeries(s) > 0
  },
  {
    id: "aprendiz_forja", icone: "🔨", nome: "Aprendiz da Forja",
    desc: "Alcance o nível 5.",
    xp: 100, ouro: 50,
    check: s => s.personagem.nivel >= 5
  },
  {
    id: "quebrador_recordes", icone: "💥", nome: "Quebrador de Recordes",
    desc: "Quebre seu primeiro recorde.",
    xp: 75, ouro: 40,
    check: s => recordesQuebrados(s) >= 1
  },
  {
    id: "forjado_ferro", icone: "⚒", nome: "Forjado no Ferro",
    desc: "Complete 10 treinos.",
    xp: 150, ouro: 80,
    check: s => s.treinos.length >= 10
  },
  {
    id: "disciplina", icone: "🕯", nome: "Disciplina",
    desc: "Treine durante 7 dias consecutivos.",
    xp: 150, ouro: 80,
    check: s => s.streak.melhor >= 7
  },
  {
    id: "veterano", icone: "🛡", nome: "Veterano",
    desc: "Complete 50 treinos.",
    xp: 400, ouro: 250,
    check: s => s.treinos.length >= 50
  },
  {
    id: "lenda", icone: "👑", nome: "Lenda",
    desc: "Alcance o nível 50.",
    xp: 2000, ouro: 1000,
    check: s => s.personagem.nivel >= 50
  },
  {
    id: "volume_mil", icone: "🏔", nome: "Montanha de Ferro",
    desc: "Acumule 10.000 kg de volume total.",
    xp: 200, ouro: 100,
    check: s => volumeTotalGeral(s) >= 10000
  },
  {
    id: "arqueologo", icone: "🗺", nome: "Explorador da Taverna",
    desc: "Treine 10 exercícios diferentes.",
    xp: 120, ouro: 60,
    check: s => new Set(s.treinos.map(t => t.exercicioId)).size >= 10
  },
  {
    id: "chama_eterna", icone: "🔥", nome: "Chama Eterna",
    desc: "Mantenha uma sequência de 30 dias.",
    xp: 500, ouro: 300,
    check: s => s.streak.melhor >= 30
  }
];

// XP necessário por nível (nível atual -> XP para o próximo).
// Crescimento progressivo: 100, 250, 450, 700, ...
function xpParaProximoNivel(nivel) {
  const n = nivel - 1;
  return 100 + n * 150 + n * (n - 1) * 25;
}

/* ---------- helpers usados pelas conquistas ---------- */
function totalSeries(s) {
  return s.treinos.reduce((n, t) => n + t.series.length, 0);
}
function volumeTotalGeral(s) {
  return s.treinos.reduce(
    (n, t) => n + t.series.reduce((v, se) => v + se.peso * se.reps, 0), 0
  );
}
function recordesQuebrados(s) {
  return Object.values(s.recordes)
    .reduce((n, r) => n + (r.quebras || 0), 0);
}
