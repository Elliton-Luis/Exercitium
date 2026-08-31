/* ================================================================
   EXERCITIUM — Dados estáticos
   Biblioteca de exercícios padrão + conquistas + cardio
   ================================================================ */

const GRUPOS = [
  "Peito", "Costas", "Ombros", "Bíceps", "Tríceps",
  "Antebraço", "Pernas", "Abdômen"
];

// Músculos fine-grained (segmentação anatômica para tracker)
// Mantém compatibilidade: nomes antigos são aliases migrados em state.js
const MUSCULOS = [
  "Peitoral",
  "Dorsais",
  "Trapézio",
  "Deltoide Anterior",
  "Deltoide Lateral",
  "Deltoide Posterior",
  "Bíceps",
  "Tríceps",
  "Braquial",
  "Flexores do Antebraço",
  "Extensores do Antebraço",
  "Quadríceps",
  "Posterior",
  "Glúteos",
  "Panturrilha",
  "Abdômen",
  "Lombar"
];

// Aliases legados -> novo nome (usado na migração)
const MUSCULO_ALIASES = {
  "Costas": "Dorsais",
  "Ombros": "Deltoide Lateral",
  "Core": "Abdômen",
  "Antebraço": "Flexores do Antebraço"
};

// Peso por tipo de contribuição (centralizado)
const PESO_PRINCIPAL = 1.0;
const PESO_SECUNDARIO = 0.5;

// Biblioteca padrão — id, nome, grupo, principal[], secundarios[]
// secundários recebem 50% do estímulo (PESO_SECUNDARIO)
const BIBLIOTECA_PADRAO = [
  // Peito
  { nome: "Supino Reto",         grupo: "Peito",   principal: ["Peitoral"],    secundarios: ["Tríceps", "Deltoide Anterior"] },
  { nome: "Supino Inclinado",    grupo: "Peito",   principal: ["Peitoral"],    secundarios: ["Tríceps", "Deltoide Anterior"] },
  { nome: "Supino Máquina",      grupo: "Peito",   principal: ["Peitoral"],    secundarios: ["Tríceps"] },
  { nome: "Crucifixo",           grupo: "Peito",   principal: ["Peitoral"],    secundarios: ["Deltoide Anterior"] },
  { nome: "Peck Deck",           grupo: "Peito",   principal: ["Peitoral"],    secundarios: ["Deltoide Anterior"] },
  { nome: "Crossover",           grupo: "Peito",   principal: ["Peitoral"],    secundarios: ["Deltoide Anterior"] },

  // Costas
  { nome: "Puxada Alta",         grupo: "Costas",  principal: ["Dorsais"],      secundarios: ["Bíceps", "Trapézio"] },
  { nome: "Remada",              grupo: "Costas",  principal: ["Dorsais"],      secundarios: ["Bíceps", "Trapézio", "Deltoide Posterior", "Lombar"] },
  { nome: "Remada Máquina",      grupo: "Costas",  principal: ["Dorsais"],      secundarios: ["Bíceps", "Trapézio"] },
  { nome: "Barra Fixa",          grupo: "Costas",  principal: ["Dorsais"],      secundarios: ["Bíceps", "Trapézio", "Abdômen"] },
  { nome: "Pulldown",            grupo: "Costas",  principal: ["Dorsais"],      secundarios: ["Bíceps", "Trapézio"] },
  { nome: "Remada Baixa",        grupo: "Costas",  principal: ["Dorsais"],      secundarios: ["Bíceps", "Trapézio"] },

  // Ombros — deltoides separados
  { nome: "Desenvolvimento",     grupo: "Ombros",  principal: ["Deltoide Anterior", "Deltoide Lateral"], secundarios: ["Tríceps", "Trapézio"] },
  { nome: "Desenvolvimento Máquina", grupo: "Ombros", principal: ["Deltoide Anterior", "Deltoide Lateral"], secundarios: ["Tríceps", "Trapézio"] },
  { nome: "Elevação Lateral",    grupo: "Ombros",  principal: ["Deltoide Lateral"],      secundarios: ["Trapézio"] },
  { nome: "Elevação Frontal",    grupo: "Ombros",  principal: ["Deltoide Anterior"],     secundarios: ["Peitoral"] },
  { nome: "Crucifixo Inverso",   grupo: "Ombros",  principal: ["Deltoide Posterior"],    secundarios: ["Dorsais", "Trapézio"] },

  // Bíceps
  { nome: "Rosca Direta",        grupo: "Bíceps",  principal: ["Bíceps"],      secundarios: ["Braquial", "Flexores do Antebraço"] },
  { nome: "Rosca Alternada",     grupo: "Bíceps",  principal: ["Bíceps"],      secundarios: ["Braquial", "Flexores do Antebraço"] },
  { nome: "Rosca Martelo",       grupo: "Bíceps",  principal: ["Braquial", "Flexores do Antebraço"], secundarios: ["Bíceps"] },
  { nome: "Rosca Scott",         grupo: "Bíceps",  principal: ["Bíceps"],      secundarios: [] },

  // Tríceps
  { nome: "Tríceps Pulley",      grupo: "Tríceps", principal: ["Tríceps"],     secundarios: ["Extensores do Antebraço"] },
  { nome: "Tríceps Francês",     grupo: "Tríceps", principal: ["Tríceps"],     secundarios: [] },
  { nome: "Tríceps Testa",       grupo: "Tríceps", principal: ["Tríceps"],     secundarios: [] },
  { nome: "Tríceps Máquina",     grupo: "Tríceps", principal: ["Tríceps"],     secundarios: [] },

  // Pernas — posteriores e glúteos separados
  { nome: "Agachamento",         grupo: "Pernas",  principal: ["Quadríceps"],  secundarios: ["Glúteos", "Posterior", "Abdômen", "Lombar"] },
  { nome: "Leg Press",           grupo: "Pernas",  principal: ["Quadríceps"],  secundarios: ["Glúteos"] },
  { nome: "Cadeira Extensora",   grupo: "Pernas",  principal: ["Quadríceps"],  secundarios: [] },
  { nome: "Mesa Flexora",        grupo: "Pernas",  principal: ["Posterior"],   secundarios: [] },
  { nome: "Cadeira Flexora",     grupo: "Pernas",  principal: ["Posterior"],   secundarios: [] },
  { nome: "Stiff",               grupo: "Pernas",  principal: ["Posterior"],   secundarios: ["Glúteos", "Lombar"] },
  { nome: "Afundo",              grupo: "Pernas",  principal: ["Quadríceps"],  secundarios: ["Glúteos"] },
  { nome: "Passada",             grupo: "Pernas",  principal: ["Quadríceps"],  secundarios: ["Glúteos"] },
  { nome: "Elevação Pélvica",    grupo: "Pernas",  principal: ["Glúteos"],     secundarios: ["Posterior"] },
  { nome: "Panturrilha",         grupo: "Pernas",  principal: ["Panturrilha"], secundarios: [] },

  // Abdômen / Core
  { nome: "Abdominal",           grupo: "Abdômen", principal: ["Abdômen"],        secundarios: [] },
  { nome: "Abdominal Máquina",   grupo: "Abdômen", principal: ["Abdômen"],        secundarios: [] },
  { nome: "Elevação de Pernas",  grupo: "Abdômen", principal: ["Abdômen"],        secundarios: ["Quadríceps"] },
  { nome: "Prancha",             grupo: "Abdômen", principal: ["Abdômen"],        secundarios: ["Lombar", "Deltoide Anterior"] }
];

/* ================= CARDIO ================= */

const CARDIO_MODALIDADES = [
  { id: "esteira",        nome: "Esteira",          icone: "🏃", campos: ["duracao","distancia","velocidade","inclinacao","calorias","obs"] },
  { id: "bicicleta",      nome: "Bicicleta",        icone: "🚴", campos: ["duracao","distancia","velocidade","resistencia","calorias","obs"] },
  { id: "escada",         nome: "Escada",           icone: "🪜", campos: ["duracao","andares","nivel","calorias","obs"] },
  { id: "corrida",        nome: "Corrida ao ar livre", icone: "🏃‍♂️", campos: ["duracao","distancia","pace","calorias","obs"] },
  { id: "natacao",        nome: "Natação",          icone: "🏊", campos: ["duracao","distancia","estilo","calorias","obs"] },
  { id: "caminhada",      nome: "Caminhada",        icone: "🚶", campos: ["duracao","distancia","calorias","obs"] },
  { id: "eliptico",       nome: "Elíptico",         icone: "〰️", campos: ["duracao","distancia","resistencia","calorias","obs"] },
  { id: "remo",           nome: "Remo",             icone: "🚣", campos: ["duracao","distancia","resistencia","calorias","obs"] },
  { id: "outro",          nome: "Outro",            icone: "⚡", campos: ["duracao","distancia","calorias","obs"] }
];

function cardioModalidadePorId(id) {
  return CARDIO_MODALIDADES.find(m => m.id === id) || null;
}

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
  },
  /* --- Cardio --- */
  {
    id: "primeiros_passos", icone: "👟", nome: "Primeiros Passos",
    desc: "Complete seu primeiro treino de cardio.",
    xp: 50, ouro: 25,
    check: s => (s.cardios || []).length >= 1
  },
  {
    id: "estrada_aberta", icone: "🛣", nome: "Estrada Aberta",
    desc: "Acumule 50 km correndo (corrida ou esteira).",
    xp: 200, ouro: 120,
    check: s => cardioDistanciaAcumulada(s, ["corrida","esteira"]) >= 50
  },
  {
    id: "pulso_ferro", icone: "⏱", nome: "Pulso de Ferro",
    desc: "Acumule 10 horas de cardio.",
    xp: 300, ouro: 180,
    check: s => cardioTempoTotal(s) >= 600
  },
  {
    id: "nadador", icone: "🏊", nome: "Nadador",
    desc: "Complete 5 km nadando.",
    xp: 180, ouro: 100,
    check: s => cardioDistanciaAcumulada(s, ["natacao"]) >= 5
  },
  {
    id: "escalador", icone: "🪜", nome: "Escalador",
    desc: "Complete 10 sessões na escada.",
    xp: 150, ouro: 80,
    check: s => (s.cardios || []).filter(c => c.modalidade === "escada").length >= 10
  },
  {
    id: "maratonista", icone: "🏅", nome: "Maratonista",
    desc: "Acumule 100 km de cardio no total.",
    xp: 600, ouro: 350,
    check: s => cardioDistanciaTotal(s) >= 100
  },
  {
    id: "incansavel", icone: "🔥", nome: "Incansável",
    desc: "Realize cardio em 5 dias consecutivos.",
    xp: 300, ouro: 180,
    check: s => cardioStreak(s) >= 5
  },
  {
    id: "homem_ferro", icone: "⚔️", nome: "Homem de Ferro",
    desc: "Complete 20 treinos de força e 20 sessões de cardio.",
    xp: 800, ouro: 500,
    check: s => s.treinos.length >= 20 && (s.cardios || []).length >= 20
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
function cardioTempoTotal(s) {
  return (s.cardios || []).reduce((n, c) => n + (c.duracaoMin || 0), 0);
}
function cardioDistanciaTotal(s) {
  return (s.cardios || []).reduce((n, c) => n + (c.distanciaKm || 0), 0);
}
function cardioDistanciaAcumulada(s, modalidades) {
  return (s.cardios || [])
    .filter(c => modalidades.includes(c.modalidade))
    .reduce((n, c) => n + (c.distanciaKm || 0), 0);
}
function cardioStreak(s) {
  const dias = [...new Set((s.cardios || []).map(c => new Date(c.data).toISOString().slice(0,10)))].sort();
  if (!dias.length) return 0;
  let best = 1, cur = 1;
  for (let i = 1; i < dias.length; i++) {
    const d1 = new Date(dias[i-1] + "T12:00:00");
    const d2 = new Date(dias[i] + "T12:00:00");
    const diff = (d2 - d1) / 86400000;
    if (diff === 1) cur++;
    else cur = 1;
    if (cur > best) best = cur;
  }
  return best;
}
