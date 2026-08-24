# Exercitium — Crônicas do Ferro

Tracker de treino pessoal transformado em um pequeno RPG medieval retrô.
Escolha exercício → registre séries → ganhe XP → quebre recordes → suba de nível → desbloqueie conquistas.

Não é um sistema de academia: é um save de RPG no qual o treino é a forma de evoluir o personagem.

## Como executar

Abra `index.html` no navegador — funciona 100% offline, sem backend.

Ou, se preferir servir localmente:

```bash
python3 -m http.server 8080
```

## Funcionalidades

- **Treinos pré-definidos**: crie rotinas reutilizáveis (nome, exercícios em ordem, séries planejadas por exercício) e execute-as com avanço automático
- **Treino livre**: adicione qualquer exercício na hora e registre quantas séries quiser
- **Rotina como guia**: pule exercícios, volte atrás, faça séries extras e adicione exercícios não planejados — tudo conta normalmente para XP, volume e recordes
- **Pré-preenchimento inteligente**: os campos de peso/repetições vêm preenchidos com a última performance do exercício
- **Biblioteca de exercícios** com 39 exercícios populares (músculos principais e secundários já definidos) + criação de exercícios personalizados
- **Sistema de RPG**: XP com curva progressiva, níveis, ouro, streak de dias treinados
- **Recordes automáticos**: maior peso, mais repetições, melhor série e maior volume de treino, com celebração ao quebrar
- **Conquistas** desbloqueáveis registradas permanentemente
- **Ficha do personagem** com estatísticas derivadas (FORÇA, VIGOR, DISCIPLINA)
- **Exportar/Importar save** em JSON, como um save de videogame

## Tecnologias

- HTML5, CSS3 e JavaScript puros (sem frameworks, sem dependências)
- Persistência via `localStorage`
- Fontes Google Fonts (Cinzel, IM Fell English, VT323)

## Estrutura

```
index.html   estrutura das telas
style.css    identidade visual RPG medieval retrô
data.js      biblioteca padrão de exercícios + conquistas + curva de XP
state.js     estado e persistência (localStorage), CRUDs, export/import
game.js      regras de jogo (XP, níveis, recordes, streak, conquistas)
ui.js        telas, fluxos e feedback visual
```

## Screenshots

<!-- Adicione screenshots aqui -->
