# Exercitium — Crônicas do Ferro

Tracker de treino pessoal transformado em um pequeno RPG medieval retrô.
Escolha exercício → registre séries → ganhe XP → quebre recordes → suba de nível → desbloqueie conquistas.

Não é um sistema de academia: é um save de RPG no qual o treino é a forma de evoluir o personagem.

## Conceito

A interface segue a linguagem de **uma ficha de personagem de RPG medieval antigo**: fundo de pedra escura iluminada por tocha, painéis em madeira e couro com cantos ornamentados em bronze, botões com aparência de metal cinzelado, tipografia medieval legível (Cinzel/Cinzel Decorative para títulos, IM Fell English para texto, VT323 para números).

Na aba **Personagem** há um guerreiro desenhado em SVG cujo corpo cresce conforme os músculos realmente treinados, além do **Mapa de Músculos** com vista **frontal e posterior** do corpo. Cada grupo macro (Peito, Costas, Ombros, Braços, Pernas, Core) exibe nível em pips `◆` — I Iniciante, II Desenvolvido, III Avançado, IV Elite — e ao expandir revela os **músculos individuais**: Peitoral; Dorsais + Trapézio; Deltoide Anterior/Lateral/Posterior; Bíceps/Tríceps/Braquial/Flexores/Extensores do antebraço; Quadríceps/Posterior/Glúteos/Panturrilha; Abdômen/Lombar. O guerreiro reflete essa granularidade com curvas de crescimento e normalização: cada cabeça do deltoide, trapézio, braquial, antebraços e posteriores/glúteos evoluem separadamente e são visualmente perceptíveis sem quebrar a proporção.

A aba **Evolução** responde "como estou evoluindo?": estatísticas gerais, gráficos de volume por semana/mês, volume por grupo, exercícios mais treinados e agora **estatísticas de Cardio** (sessões, tempo total, distância, modalidade mais praticada, melhor pace, gráfico de minutos por semana).

Na **Forja 🏪**, o ouro conquistado treinando vira cosméticos para o guerreiro: mais de 40 itens em 8 slots, organizados por raridade — Comum, Incomum, Raro, Épico e Lendário — com prévia ao vivo e comparação ATUAL vs NOVO.

## Cardio

Nova categoria de treino com métricas próprias. Modalidades: Esteira, Bicicleta, Escada, Corrida ao ar livre, Natação, Caminhada, Elíptico, Remo e Outro. Cada modalidade exibe apenas campos relevantes (tempo obrigatório; distância, velocidade, inclinação, resistência, andares, estilo, calorias conforme faz sentido) e calcula automaticamente pace/velocidade quando possível. O cardio concede XP e ouro com fórmula balanceada baseada em duração e distância, com tetos anti-exploit, e conta para streak e conquistas próprias (Primeiros Passos, Estrada Aberta, Pulso de Ferro, Nadador, Escalador, Maratonista, Incansável, Homem de Ferro).

O **cronômetro** no topo do treino de força marca o tempo decorrido; ao finalizar, a duração é exibida no resumo para o usuário aceitar ou corrigir.

## Screenshots

<table>
  <tr>
    <td align="center"><img src="img/screenshots/inicio.jpeg" alt="Início" width="270"><br><sub><b>Início</b></sub></td>
    <td align="center"><img src="img/screenshots/ficha%20do%20heroi.jpeg" alt="Ficha do Herói" width="270"><br><sub><b>Ficha do Herói</b></sub></td>
    <td align="center"><img src="img/screenshots/biblioteca%20de%20exercicios.jpeg" alt="Biblioteca de Exercícios" width="270"><br><sub><b>Biblioteca de Exercícios</b></sub></td>
  </tr>
  <tr>
    <td align="center"><img src="img/screenshots/historico%20de%20treino.jpeg" alt="Histórico de Treino" width="270"><br><sub><b>Histórico de Treino</b></sub></td>
    <td align="center"><img src="img/screenshots/histórico.jpeg" alt="Histórico" width="270"><br><sub><b>Histórico</b></sub></td>
    <td align="center"><img src="img/screenshots/evolucao.jpeg" alt="Evolução" width="270"><br><sub><b>Evolução</b></sub></td>
  </tr>
  <tr>
    <td align="center"><img src="img/screenshots/mapa%20de%20musculos.jpeg" alt="Mapa de Músculos" width="270"><br><sub><b>Mapa de Músculos</b></sub></td>
    <td align="center"><img src="img/screenshots/forja.jpeg" alt="Forja" width="270"><br><sub><b>Forja</b></sub></td>
    <td align="center"><img src="img/screenshots/trofeus.jpeg" alt="Troféus" width="270"><br><sub><b>Troféus</b></sub></td>
  </tr>
  <tr>
    <td colspan="3" align="center"><img src="img/screenshots/saves.jpeg" alt="Saves" width="270"><br><sub><b>Saves</b></sub></td>
  </tr>
</table>

## Estrutura

```
index.html   estrutura das telas
style.css    identidade visual RPG medieval retrô
data.js      biblioteca padrão + músculos segmentados + modalidades de cardio + conquistas + curva de XP
state.js     estado e persistência (localStorage), CRUDs, migração v1→v2, export/import, cardio
game.js      regras de jogo (XP, níveis, recordes, streak, cardio XP/ouro, conquistas)
warrior.js   guerreiro visual em SVG + mapa de músculos detalhado (derivados do histórico)
stats.js     derivações estatísticas (força + cardio)
ui.js        telas, fluxos, cronômetro, validação e feedback visual
```

Tecnologias:

- HTML5, CSS3 e JavaScript puros (sem frameworks, sem dependências)
- Persistência via `localStorage` com versionamento e migração segura
- Fontes Google Fonts (Cinzel, IM Fell English, VT323)

## Características

- **Músculos segmentados**: 17 regiões (deltoides em 3 cabeças, trapézio, braquial, flexores/extensores do antebraço, posteriores vs glúteos, abdômen/lombar) com crescimento por curvas normalizadas e silhueta distinta
- **Mapa de músculos**: 6 grupos macro + detalhamento individual expansível; silhuetas frontal/posterior com calor por região
- **Biblioteca com pesos proporcionais**: principais 100% / secundários 50%, centralizado em `data.js`; exercícios customizados com seleção de músculos validada
- **Cardio completo**: 9 modalidades com campos dinâmicos, cálculo automático de pace/velocidade, validação, draft persistido e proteção contra duplo clique
- **Treinos pré-definidos** e **treino livre** com avanço automático
- **Cronômetro** no treino (pausar/zerar) com duração no resumo final
- **Salvamento automático** do treino em andamento (`status: in_progress`)
- **Cooldown de 10s** entre séries com proteção lógica e visual
- **Pré-preenchimento inteligente**, atalhos de séries e diferenciação Força vs Cardio no histórico/evolução
- **Conquistas de cardio** (8 novas) integradas ao sistema existente
- **Prevenção de erros**: bloqueio de valores negativos/absurdos, mensagens por campo, confirmação de ações destrutivas, import JSON validado, saves corrompidos tratados, navegação segura durante treino
- **Compatibilidade**: saves antigos migrados automaticamente; export/import preservado

## Como rodar

Abra `index.html` no navegador — funciona 100% offline, sem backend.

Ou, se preferir servir localmente:

```bash
python3 -m http.server 8080
```

## Licença

Livre para usar, modificar, distribuir e fazer o que quiser — sem garantias.
