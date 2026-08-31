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
  { nome: "Prancha",             grupo: "Abdômen", principal: ["Abdômen"],        secundarios: ["Lombar", "Deltoide Anterior"] },

  // Antebraço — isolados para evidenciar Braquial / Flexores / Extensores no mapa
  { nome: "Rosca Punho",         grupo: "Antebraço", principal: ["Flexores do Antebraço"], secundarios: ["Braquial"] },
  { nome: "Extensão de Punho",   grupo: "Antebraço", principal: ["Extensores do Antebraço"], secundarios: [] },
  { nome: "Rosca Inversa",       grupo: "Antebraço", principal: ["Braquial", "Extensores do Antebraço"], secundarios: ["Bíceps"] },
  { nome: "Supino Reto com Barra", grupo: "Peito", principal: ["Peitoral"], secundarios: ["Tríceps","Deltoide Anterior"] },
  { nome: "Supino Reto com Halteres", grupo: "Peito", principal: ["Peitoral"], secundarios: ["Tríceps","Deltoide Anterior"] },
  { nome: "Supino Reto no Smith", grupo: "Peito", principal: ["Peitoral"], secundarios: ["Tríceps","Deltoide Anterior"] },
  { nome: "Supino Convergente na Máquina", grupo: "Peito", principal: ["Peitoral"], secundarios: ["Tríceps"] },
  { nome: "Chest Press", grupo: "Peito", principal: ["Peitoral"], secundarios: ["Tríceps","Deltoide Anterior"] },
  { nome: "Crucifixo com Halteres", grupo: "Peito", principal: ["Peitoral"], secundarios: ["Deltoide Anterior"] },
  { nome: "Crucifixo no Cabo", grupo: "Peito", principal: ["Peitoral"], secundarios: ["Deltoide Anterior"] },
  { nome: "Crossover Polia Alta", grupo: "Peito", principal: ["Peitoral"], secundarios: ["Deltoide Anterior"] },
  { nome: "Supino Inclinado com Barra", grupo: "Peito", principal: ["Peitoral"], secundarios: ["Tríceps","Deltoide Anterior"] },
  { nome: "Supino Inclinado com Halteres", grupo: "Peito", principal: ["Peitoral"], secundarios: ["Tríceps","Deltoide Anterior"] },
  { nome: "Supino Inclinado na Máquina", grupo: "Peito", principal: ["Peitoral"], secundarios: ["Tríceps","Deltoide Anterior"] },
  { nome: "Supino Inclinado no Smith", grupo: "Peito", principal: ["Peitoral"], secundarios: ["Tríceps","Deltoide Anterior"] },
  { nome: "Chest Press Inclinado", grupo: "Peito", principal: ["Peitoral"], secundarios: ["Tríceps","Deltoide Anterior"] },
  { nome: "Máquina de Peitoral Superior", grupo: "Peito", principal: ["Peitoral"], secundarios: ["Deltoide Anterior"] },
  { nome: "Crucifixo Inclinado com Halteres", grupo: "Peito", principal: ["Peitoral"], secundarios: ["Deltoide Anterior"] },
  { nome: "Crossover de Baixo para Cima", grupo: "Peito", principal: ["Peitoral"], secundarios: ["Deltoide Anterior"] },
  { nome: "Supino Declinado com Barra", grupo: "Peito", principal: ["Peitoral"], secundarios: ["Tríceps"] },
  { nome: "Supino Declinado com Halteres", grupo: "Peito", principal: ["Peitoral"], secundarios: ["Tríceps"] },
  { nome: "Supino Declinado no Smith", grupo: "Peito", principal: ["Peitoral"], secundarios: ["Tríceps"] },
  { nome: "Máquina de Peitoral Inferior", grupo: "Peito", principal: ["Peitoral"], secundarios: ["Tríceps"] },
  { nome: "Chest Press Declinado", grupo: "Peito", principal: ["Peitoral"], secundarios: ["Tríceps"] },
  { nome: "Crossover de Cima para Baixo", grupo: "Peito", principal: ["Peitoral"], secundarios: ["Deltoide Anterior"] },
  { nome: "Dips com Foco no Peito", grupo: "Peito", principal: ["Peitoral"], secundarios: ["Tríceps","Deltoide Anterior"] },
  { nome: "Barra Fixa Pronada", grupo: "Costas", principal: ["Dorsais"], secundarios: ["Bíceps","Trapézio"] },
  { nome: "Barra Fixa Supinada", grupo: "Costas", principal: ["Dorsais"], secundarios: ["Bíceps","Trapézio"] },
  { nome: "Barra Fixa Neutra", grupo: "Costas", principal: ["Dorsais"], secundarios: ["Bíceps","Trapézio"] },
  { nome: "Puxada Frontal Pronada", grupo: "Costas", principal: ["Dorsais"], secundarios: ["Bíceps","Trapézio"] },
  { nome: "Puxada Frontal Supinada", grupo: "Costas", principal: ["Dorsais"], secundarios: ["Bíceps","Trapézio"] },
  { nome: "Puxada Frontal Neutra", grupo: "Costas", principal: ["Dorsais"], secundarios: ["Bíceps","Trapézio"] },
  { nome: "Puxada Unilateral no Cabo", grupo: "Costas", principal: ["Dorsais"], secundarios: ["Bíceps"] },
  { nome: "Puxada na Máquina", grupo: "Costas", principal: ["Dorsais"], secundarios: ["Bíceps","Trapézio"] },
  { nome: "Pullover no Cabo", grupo: "Costas", principal: ["Dorsais"], secundarios: ["Peitoral","Tríceps"] },
  { nome: "Pullover na Máquina", grupo: "Costas", principal: ["Dorsais"], secundarios: ["Peitoral"] },
  { nome: "Remada Curvada com Barra", grupo: "Costas", principal: ["Dorsais"], secundarios: ["Bíceps","Trapézio","Deltoide Posterior","Lombar"] },
  { nome: "Remada Curvada com Halteres", grupo: "Costas", principal: ["Dorsais"], secundarios: ["Bíceps","Trapézio","Lombar"] },
  { nome: "Remada Unilateral com Halter", grupo: "Costas", principal: ["Dorsais"], secundarios: ["Bíceps","Trapézio"] },
  { nome: "Remada Cavalinho / T-Bar", grupo: "Costas", principal: ["Dorsais"], secundarios: ["Bíceps","Trapézio","Lombar"] },
  { nome: "Remada Baixa no Cabo com Triângulo", grupo: "Costas", principal: ["Dorsais"], secundarios: ["Bíceps","Trapézio"] },
  { nome: "Remada Articulada na Máquina", grupo: "Costas", principal: ["Dorsais"], secundarios: ["Bíceps","Trapézio"] },
  { nome: "Remada Unilateral na Máquina", grupo: "Costas", principal: ["Dorsais"], secundarios: ["Bíceps","Trapézio"] },
  { nome: "Remada no Smith", grupo: "Costas", principal: ["Dorsais"], secundarios: ["Bíceps","Trapézio","Lombar"] },
  { nome: "Remada Apoiado no Banco", grupo: "Costas", principal: ["Dorsais"], secundarios: ["Bíceps","Trapézio"] },
  { nome: "Encolhimento com Barra", grupo: "Costas", principal: ["Trapézio"], secundarios: ["Dorsais"] },
  { nome: "Encolhimento com Halteres", grupo: "Costas", principal: ["Trapézio"], secundarios: ["Dorsais"] },
  { nome: "Encolhimento no Smith", grupo: "Costas", principal: ["Trapézio"], secundarios: ["Dorsais"] },
  { nome: "Encolhimento na Máquina", grupo: "Costas", principal: ["Trapézio"], secundarios: [""] },
  { nome: "Encolhimento no Cabo", grupo: "Costas", principal: ["Trapézio"], secundarios: [""] },
  { nome: "Face Pull", grupo: "Costas", principal: ["Deltoide Posterior","Trapézio"], secundarios: ["Dorsais"] },
  { nome: "Remada Alta com Barra", grupo: "Costas", principal: ["Trapézio","Deltoide Lateral"], secundarios: ["Bíceps"] },
  { nome: "Desenvolvimento com Barra", grupo: "Ombros", principal: ["Deltoide Anterior","Deltoide Lateral"], secundarios: ["Tríceps","Trapézio"] },
  { nome: "Desenvolvimento com Halteres", grupo: "Ombros", principal: ["Deltoide Anterior","Deltoide Lateral"], secundarios: ["Tríceps","Trapézio"] },
  { nome: "Desenvolvimento no Smith", grupo: "Ombros", principal: ["Deltoide Anterior"], secundarios: ["Tríceps","Trapézio"] },
  { nome: "Desenvolvimento na Máquina", grupo: "Ombros", principal: ["Deltoide Anterior","Deltoide Lateral"], secundarios: ["Tríceps"] },
  { nome: "Desenvolvimento Articulado", grupo: "Ombros", principal: ["Deltoide Anterior"], secundarios: ["Tríceps","Trapézio"] },
  { nome: "Arnold Press", grupo: "Ombros", principal: ["Deltoide Anterior","Deltoide Lateral"], secundarios: ["Tríceps"] },
  { nome: "Elevação Frontal com Halteres", grupo: "Ombros", principal: ["Deltoide Anterior"], secundarios: ["Peitoral"] },
  { nome: "Elevação Frontal com Barra", grupo: "Ombros", principal: ["Deltoide Anterior"], secundarios: [""] },
  { nome: "Elevação Frontal no Cabo", grupo: "Ombros", principal: ["Deltoide Anterior"], secundarios: [""] },
  { nome: "Elevação Frontal na Máquina", grupo: "Ombros", principal: ["Deltoide Anterior"], secundarios: [""] },
  { nome: "Elevação Lateral com Halteres", grupo: "Ombros", principal: ["Deltoide Lateral"], secundarios: ["Trapézio"] },
  { nome: "Elevação Lateral no Cabo", grupo: "Ombros", principal: ["Deltoide Lateral"], secundarios: ["Trapézio"] },
  { nome: "Elevação Lateral Unilateral no Cabo", grupo: "Ombros", principal: ["Deltoide Lateral"], secundarios: ["Trapézio"] },
  { nome: "Elevação Lateral na Máquina", grupo: "Ombros", principal: ["Deltoide Lateral"], secundarios: ["Trapézio"] },
  { nome: "Elevação Lateral Inclinada", grupo: "Ombros", principal: ["Deltoide Lateral"], secundarios: ["Trapézio"] },
  { nome: "Máquina de Deltoide Lateral", grupo: "Ombros", principal: ["Deltoide Lateral"], secundarios: [""] },
  { nome: "Crucifixo Inverso com Halteres", grupo: "Ombros", principal: ["Deltoide Posterior"], secundarios: ["Dorsais","Trapézio"] },
  { nome: "Crucifixo Inverso na Máquina", grupo: "Ombros", principal: ["Deltoide Posterior"], secundarios: ["Trapézio"] },
  { nome: "Crucifixo Inverso no Cabo", grupo: "Ombros", principal: ["Deltoide Posterior"], secundarios: ["Trapézio"] },
  { nome: "Reverse Peck Deck", grupo: "Ombros", principal: ["Deltoide Posterior"], secundarios: ["Trapézio"] },
  { nome: "Elevação Posterior no Cabo", grupo: "Ombros", principal: ["Deltoide Posterior"], secundarios: ["Trapézio"] },
  { nome: "Rosca Direta com Barra W", grupo: "Bíceps", principal: ["Bíceps"], secundarios: ["Braquial"] },
  { nome: "Rosca Direta no Cabo", grupo: "Bíceps", principal: ["Bíceps"], secundarios: ["Braquial","Flexores do Antebraço"] },
  { nome: "Rosca Simultânea com Halteres", grupo: "Bíceps", principal: ["Bíceps"], secundarios: ["Braquial"] },
  { nome: "Rosca Martelo no Cabo", grupo: "Antebraço", principal: ["Braquial","Flexores do Antebraço"], secundarios: ["Bíceps"] },
  { nome: "Rosca Scott na Máquina", grupo: "Bíceps", principal: ["Bíceps"], secundarios: [""] },
  { nome: "Rosca Concentrada", grupo: "Bíceps", principal: ["Bíceps"], secundarios: [""] },
  { nome: "Rosca Inclinada com Halteres", grupo: "Bíceps", principal: ["Bíceps"], secundarios: ["Braquial"] },
  { nome: "Rosca Spider", grupo: "Bíceps", principal: ["Bíceps"], secundarios: [""] },
  { nome: "Rosca 21", grupo: "Bíceps", principal: ["Bíceps"], secundarios: ["Braquial"] },
  { nome: "Rosca Unilateral no Cabo", grupo: "Bíceps", principal: ["Bíceps"], secundarios: [""] },
  { nome: "Tríceps Pulley com Barra", grupo: "Tríceps", principal: ["Tríceps"], secundarios: ["Extensores do Antebraço"] },
  { nome: "Tríceps Pulley com Corda", grupo: "Tríceps", principal: ["Tríceps"], secundarios: ["Extensores do Antebraço"] },
  { nome: "Tríceps Unilateral no Cabo", grupo: "Tríceps", principal: ["Tríceps"], secundarios: [""] },
  { nome: "Tríceps Francês com Halter", grupo: "Tríceps", principal: ["Tríceps"], secundarios: [""] },
  { nome: "Tríceps Francês com Barra", grupo: "Tríceps", principal: ["Tríceps"], secundarios: [""] },
  { nome: "Tríceps Francês no Cabo", grupo: "Tríceps", principal: ["Tríceps"], secundarios: [""] },
  { nome: "Tríceps Testa com Barra W", grupo: "Tríceps", principal: ["Tríceps"], secundarios: [""] },
  { nome: "Tríceps Testa com Halteres", grupo: "Tríceps", principal: ["Tríceps"], secundarios: [""] },
  { nome: "Tríceps Testa no Cabo", grupo: "Tríceps", principal: ["Tríceps"], secundarios: [""] },
  { nome: "Tríceps Coice com Halter", grupo: "Tríceps", principal: ["Tríceps"], secundarios: ["Deltoide Posterior"] },
  { nome: "Tríceps Coice no Cabo", grupo: "Tríceps", principal: ["Tríceps"], secundarios: [""] },
  { nome: "Dips (Tríceps)", grupo: "Tríceps", principal: ["Tríceps"], secundarios: ["Peitoral","Deltoide Anterior"] },
  { nome: "Supino Fechado com Barra", grupo: "Tríceps", principal: ["Tríceps"], secundarios: ["Peitoral"] },
  { nome: "Rosca Inversa com Barra", grupo: "Antebraço", principal: ["Braquial","Extensores do Antebraço"], secundarios: ["Bíceps"] },
  { nome: "Rosca Inversa com Barra W", grupo: "Antebraço", principal: ["Braquial"], secundarios: ["Bíceps"] },
  { nome: "Rosca Inversa no Cabo", grupo: "Antebraço", principal: ["Braquial"], secundarios: [""] },
  { nome: "Flexão de Punho com Barra", grupo: "Antebraço", principal: ["Flexores do Antebraço"], secundarios: ["Braquial"] },
  { nome: "Flexão de Punho com Halter", grupo: "Antebraço", principal: ["Flexores do Antebraço"], secundarios: [""] },
  { nome: "Flexão de Punho no Cabo", grupo: "Antebraço", principal: ["Flexores do Antebraço"], secundarios: [""] },
  { nome: "Extensão de Punho com Barra", grupo: "Antebraço", principal: ["Extensores do Antebraço"], secundarios: [""] },
  { nome: "Extensão de Punho com Halter", grupo: "Antebraço", principal: ["Extensores do Antebraço"], secundarios: [""] },
  { nome: "Extensão de Punho no Cabo", grupo: "Antebraço", principal: ["Extensores do Antebraço"], secundarios: [""] },
  { nome: "Farmer's Walk", grupo: "Antebraço", principal: ["Flexores do Antebraço","Trapézio"], secundarios: ["Glúteos","Quadríceps"] },
  { nome: "Dead Hang", grupo: "Antebraço", principal: ["Flexores do Antebraço"], secundarios: ["Dorsais"] },
  { nome: "Pinch Grip Hold", grupo: "Antebraço", principal: ["Flexores do Antebraço"], secundarios: [""] },
  { nome: "Agachamento Livre com Barra", grupo: "Pernas", principal: ["Quadríceps"], secundarios: ["Glúteos","Posterior","Lombar"] },
  { nome: "Agachamento no Smith", grupo: "Pernas", principal: ["Quadríceps"], secundarios: ["Glúteos"] },
  { nome: "Agachamento Frontal com Barra", grupo: "Pernas", principal: ["Quadríceps"], secundarios: ["Glúteos","Abdômen"] },
  { nome: "Hack Squat", grupo: "Pernas", principal: ["Quadríceps"], secundarios: ["Glúteos"] },
  { nome: "Hack Squat na Máquina", grupo: "Pernas", principal: ["Quadríceps"], secundarios: ["Glúteos"] },
  { nome: "Leg Press 45°", grupo: "Pernas", principal: ["Quadríceps"], secundarios: ["Glúteos"] },
  { nome: "Leg Press Horizontal", grupo: "Pernas", principal: ["Quadríceps"], secundarios: ["Glúteos"] },
  { nome: "Leg Press Vertical", grupo: "Pernas", principal: ["Quadríceps"], secundarios: ["Glúteos"] },
  { nome: "Cadeira Extensora Unilateral", grupo: "Pernas", principal: ["Quadríceps"], secundarios: [""] },
  { nome: "Agachamento na Máquina", grupo: "Pernas", principal: ["Quadríceps"], secundarios: ["Glúteos"] },
  { nome: "Goblet Squat", grupo: "Pernas", principal: ["Quadríceps"], secundarios: ["Glúteos"] },
  { nome: "Afundo com Halteres", grupo: "Pernas", principal: ["Quadríceps"], secundarios: ["Glúteos"] },
  { nome: "Afundo no Smith", grupo: "Pernas", principal: ["Quadríceps"], secundarios: ["Glúteos"] },
  { nome: "Bulgarian Split Squat", grupo: "Pernas", principal: ["Quadríceps"], secundarios: ["Glúteos"] },
  { nome: "Step-up no Banco", grupo: "Pernas", principal: ["Quadríceps"], secundarios: ["Glúteos"] },
  { nome: "Mesa Flexora Unilateral", grupo: "Pernas", principal: ["Posterior"], secundarios: [""] },
  { nome: "Cadeira Flexora Unilateral", grupo: "Pernas", principal: ["Posterior"], secundarios: [""] },
  { nome: "Nordic Curl", grupo: "Pernas", principal: ["Posterior"], secundarios: ["Glúteos","Lombar"] },
  { nome: "Stiff com Halteres", grupo: "Pernas", principal: ["Posterior"], secundarios: ["Glúteos","Lombar"] },
  { nome: "Romanian Deadlift", grupo: "Pernas", principal: ["Posterior","Glúteos"], secundarios: ["Lombar"] },
  { nome: "Good Morning com Barra", grupo: "Pernas", principal: ["Posterior","Lombar"], secundarios: ["Glúteos"] },
  { nome: "Flexão de Joelho no Cabo", grupo: "Pernas", principal: ["Posterior"], secundarios: [""] },
  { nome: "Hip Thrust com Barra", grupo: "Pernas", principal: ["Glúteos"], secundarios: ["Posterior","Quadríceps"] },
  { nome: "Hip Thrust no Smith", grupo: "Pernas", principal: ["Glúteos"], secundarios: ["Posterior"] },
  { nome: "Hip Thrust na Máquina", grupo: "Pernas", principal: ["Glúteos"], secundarios: ["Posterior"] },
  { nome: "Glute Bridge", grupo: "Pernas", principal: ["Glúteos"], secundarios: ["Posterior"] },
  { nome: "Glute Bridge na Máquina", grupo: "Pernas", principal: ["Glúteos"], secundarios: ["Posterior"] },
  { nome: "Coice no Cabo (Glúteo)", grupo: "Pernas", principal: ["Glúteos"], secundarios: ["Posterior"] },
  { nome: "Coice na Máquina", grupo: "Pernas", principal: ["Glúteos"], secundarios: ["Posterior"] },
  { nome: "Glúteo 4 Apoios", grupo: "Pernas", principal: ["Glúteos"], secundarios: ["Posterior"] },
  { nome: "Abdução na Máquina", grupo: "Pernas", principal: ["Glúteos"], secundarios: [""] },
  { nome: "Abdução no Cabo", grupo: "Pernas", principal: ["Glúteos"], secundarios: [""] },
  { nome: "Agachamento Profundo", grupo: "Pernas", principal: ["Quadríceps","Glúteos"], secundarios: ["Posterior"] },
  { nome: "Panturrilha em Pé com Barra", grupo: "Pernas", principal: ["Panturrilha"], secundarios: [""] },
  { nome: "Panturrilha Sentado na Máquina", grupo: "Pernas", principal: ["Panturrilha"], secundarios: [""] },
  { nome: "Panturrilha no Leg Press", grupo: "Pernas", principal: ["Panturrilha"], secundarios: [""] },
  { nome: "Panturrilha no Smith", grupo: "Pernas", principal: ["Panturrilha"], secundarios: [""] },
  { nome: "Panturrilha na Máquina", grupo: "Pernas", principal: ["Panturrilha"], secundarios: [""] },
  { nome: "Panturrilha Unilateral com Halter", grupo: "Pernas", principal: ["Panturrilha"], secundarios: [""] },
  { nome: "Panturrilha no Degrau", grupo: "Pernas", principal: ["Panturrilha"], secundarios: [""] },
  { nome: "Donkey Calf Raise", grupo: "Pernas", principal: ["Panturrilha"], secundarios: [""] },
  { nome: "Abdominal Tradicional", grupo: "Abdômen", principal: ["Abdômen"], secundarios: [""] },
  { nome: "Abdominal no Cabo", grupo: "Abdômen", principal: ["Abdômen"], secundarios: [""] },
  { nome: "Abdominal Declinado", grupo: "Abdômen", principal: ["Abdômen"], secundarios: [""] },
  { nome: "Crunch", grupo: "Abdômen", principal: ["Abdômen"], secundarios: [""] },
  { nome: "Crunch no Cabo", grupo: "Abdômen", principal: ["Abdômen"], secundarios: [""] },
  { nome: "Elevação de Joelhos na Barra", grupo: "Abdômen", principal: ["Abdômen"], secundarios: ["Quadríceps"] },
  { nome: "Elevação de Pernas na Barra Fixa", grupo: "Abdômen", principal: ["Abdômen"], secundarios: [""] },
  { nome: "Abdominal Infra", grupo: "Abdômen", principal: ["Abdômen"], secundarios: [""] },
  { nome: "Abdominal Bicicleta", grupo: "Abdômen", principal: ["Abdômen"], secundarios: [""] },
  { nome: "Prancha Lateral", grupo: "Abdômen", principal: ["Abdômen","Lombar"], secundarios: [""] },
  { nome: "Russian Twist", grupo: "Abdômen", principal: ["Abdômen"], secundarios: ["Lombar"] },
  { nome: "Ab Wheel (Roda Abdominal)", grupo: "Abdômen", principal: ["Abdômen"], secundarios: ["Lombar","Deltoide Anterior"] },
  { nome: "Pallof Press", grupo: "Abdômen", principal: ["Abdômen"], secundarios: ["Lombar"] },
  { nome: "Woodchopper no Cabo", grupo: "Abdômen", principal: ["Abdômen"], secundarios: [""] },
  { nome: "Extensão Lombar no Solo", grupo: "Abdômen", principal: ["Lombar"], secundarios: ["Glúteos"] },
  { nome: "Hiperextensão no Banco Romano", grupo: "Abdômen", principal: ["Lombar"], secundarios: ["Glúteos","Posterior"] },
  { nome: "Extensão Lombar na Máquina", grupo: "Abdômen", principal: ["Lombar"], secundarios: [""] },
  { nome: "Good Morning", grupo: "Abdômen", principal: ["Lombar","Posterior"], secundarios: ["Glúteos"] },
  { nome: "Superman", grupo: "Abdômen", principal: ["Lombar"], secundarios: ["Glúteos","Dorsais"] },
  { nome: "Levantamento Terra", grupo: "Pernas", principal: ["Posterior","Glúteos","Lombar","Dorsais","Trapézio"], secundarios: ["Quadríceps","Antebraço"] },
  { nome: "Levantamento Terra Sumô", grupo: "Pernas", principal: ["Glúteos","Posterior","Lombar"], secundarios: ["Quadríceps","Trapézio"] },
  { nome: "Clean", grupo: "Pernas", principal: ["Quadríceps","Trapézio","Dorsais"], secundarios: ["Posterior","Glúteos"] },
  { nome: "Power Clean", grupo: "Pernas", principal: ["Quadríceps","Trapézio"], secundarios: ["Dorsais","Posterior"] },
  { nome: "Thruster", grupo: "Pernas", principal: ["Quadríceps","Deltoide Anterior"], secundarios: ["Glúteos","Tríceps"] },
  { nome: "Kettlebell Swing", grupo: "Pernas", principal: ["Posterior","Glúteos","Lombar"], secundarios: ["Dorsais","Quadríceps"] },
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
