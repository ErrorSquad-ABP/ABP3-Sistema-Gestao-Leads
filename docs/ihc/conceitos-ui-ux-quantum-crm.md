<!--
Configuração recomendada para exportação em PDF A4:
- Papel: A4.
- Margens: superior e esquerda com 3 cm; inferior e direita com 2 cm.
- Fonte: Times New Roman ou Arial, tamanho 12.
- Espaçamento: 1,5 entre linhas no corpo do texto.
- Alinhamento: justificado.
- Recuo de primeira linha: 1,25 cm.
- Títulos: numerados, alinhados à esquerda, sem ponto final.
-->

<div style="text-align: center; margin-top: 3cm;">

**FACULDADE DE TECNOLOGIA DE JACAREÍ - FATEC JACAREÍ**  
**CURSO SUPERIOR DE TECNOLOGIA EM DESENVOLVIMENTO DE SOFTWARE MULTIPLATAFORMA**  
**3º SEMESTRE - ABP 2026-1**

<br><br><br><br>

**EQUIPE ERRORSQUAD-ABP**

<br><br><br><br>

# **CONCEITOS DE UI/UX APLICADOS AO QUANTUM CRM**

## **Sistema de Gestão de Leads com Dashboard Analítico**

<br><br><br><br><br><br>

**Jacareí - SP**  
**2026**

</div>

<div style="page-break-after: always;"></div>

<div style="text-align: center; margin-top: 3cm;">

**EQUIPE ERRORSQUAD-ABP**

</div>

<br>

**Integrantes identificados no repositório:**

- Arthur Facchinetti
- Caio Araujo
- Carlos Santo
- Felipe Pacheco
- João Victor Lopes Rosa
- Leonardo da Silva Irineu

<br><br><br>

# **CONCEITOS DE UI/UX APLICADOS AO QUANTUM CRM**

## **Sistema de Gestão de Leads com Dashboard Analítico**

<br><br>

Trabalho acadêmico apresentado à FATEC Jacareí como parte das atividades de Interação Humano-Computador no contexto da Aprendizagem Baseada em Projetos do 3º semestre do curso de Desenvolvimento de Software Multiplataforma.

<br><br>

**Instituição:** FATEC Jacareí  
**Curso:** Desenvolvimento de Software Multiplataforma  
**Metodologia:** Aprendizagem Baseada em Projetos  
**Projeto:** Sistema de Gestão de Leads com Dashboard Analítico  
**Produto:** Quantum CRM  
**Parceiro:** 1000 Valle Multimarcas  
**Professor focal point:** Prof. Arley Ferreira de Souza

<br><br><br><br>

<div style="text-align: center;">

**Jacareí - SP**  
**2026**

</div>

<div style="page-break-after: always;"></div>

## Resumo

Este documento descreve os principais conceitos de Interface de Usuário e Experiência do Usuário aplicados no desenvolvimento do Quantum CRM, sistema de gestão de leads com dashboard analítico desenvolvido pela equipe ErrorSquad-ABP. A análise contempla a estrutura de navegação, organização visual, componentes de interação, formulários, listagens, indicadores, modais, filtros, estados de sistema e recursos de acessibilidade presentes nas telas de clientes, leads, veículos, negociações, lojas, equipes, usuários e dashboards. O objetivo é demonstrar como princípios de Interação Humano-Computador foram utilizados de forma prática para reduzir carga cognitiva, aumentar clareza operacional, melhorar tomada de decisão e sustentar o uso cotidiano do sistema por perfis comerciais e administrativos.

**Palavras-chave:** Interação Humano-Computador. UI. UX. CRM. Usabilidade. Acessibilidade. Dashboard.

<div style="page-break-after: always;"></div>

## Sumário

1. Introdução  
2. Contexto do produto  
3. Metodologia de aplicação dos conceitos  
4. Conceitos de UI/UX implementados  
5. Aplicação por tela e funcionalidade  
6. Relação com heurísticas de usabilidade  
7. Acessibilidade e responsividade  
8. Considerações finais  
9. Referências

<div style="page-break-after: always;"></div>

## 1 Introdução

A Interação Humano-Computador estuda como pessoas utilizam sistemas computacionais e como esses sistemas podem ser projetados para serem úteis, compreensíveis, eficientes, seguros e agradáveis. No contexto do Quantum CRM, esses conceitos foram aplicados com foco em um ambiente operacional real: equipes comerciais precisam cadastrar clientes, acompanhar leads, registrar negociações, consultar veículos, analisar métricas e tomar decisões com rapidez.

O projeto não foi tratado apenas como um conjunto de telas. A interface foi organizada como uma ferramenta de trabalho, com hierarquia visual, navegação persistente, filtros, tabelas, cards, indicadores, modais padronizados e feedbacks claros. O objetivo de UI/UX foi reduzir esforço mental, facilitar comparação de informações e permitir que o usuário encontre rapidamente o próximo passo dentro do fluxo comercial.

## 2 Contexto do produto

O Quantum CRM é o produto desenvolvido no projeto **Sistema de Gestão de Leads com Dashboard Analítico**, no contexto do ABP 2026-1 do 3º semestre de DSM da FATEC Jacareí. O sistema atende ao domínio de relacionamento comercial e gestão de oportunidades para o parceiro 1000 Valle Multimarcas.

A aplicação possui módulos de:

- autenticação e sessão;
- dashboard operacional;
- dashboard analítico;
- gestão de clientes;
- gestão de leads;
- gestão de negociações;
- catálogo de veículos;
- gestão de lojas;
- gestão de equipes;
- gestão de usuários;
- relatórios e indicadores.

Do ponto de vista de IHC, o sistema atende usuários com diferentes responsabilidades: atendentes, gerentes comerciais, gerentes gerais e administradores. Por isso, a interface precisa equilibrar densidade informacional, segurança nas ações e clareza visual.

## 3 Metodologia de aplicação dos conceitos

A aplicação dos conceitos de UI/UX ocorreu de forma incremental durante a evolução das telas. O time partiu de necessidades do domínio e as traduziu em padrões visuais reutilizáveis. A refatoração recente das páginas de veículos, clientes e leads consolidou uma identidade visual mais consistente, com métricas no topo, listas operacionais no centro e gráficos ou resumos auxiliares em áreas secundárias.

Foram priorizados os seguintes critérios:

- clareza das informações críticas;
- consistência visual entre módulos;
- redução de ações redundantes;
- uso de componentes familiares;
- filtros próximos da listagem;
- tabelas densas para trabalho repetitivo;
- cards para visualização rápida;
- modais padronizados para criação, edição, detalhe e exclusão;
- feedback visual para status, erros, carregamento e confirmação;
- compatibilidade com dados reais vindos do backend.

## 4 Conceitos de UI/UX implementados

### 4.1 Quadro geral de conceitos

| Conceito | Como foi aplicado | Onde foi aplicado | Quando aparece para o usuário |
| --- | --- | --- | --- |
| Usabilidade | Fluxos principais foram organizados para cadastro, consulta, edição e análise com poucos passos. | Clientes, leads, veículos, negociações e dashboards. | Durante operações diárias de CRM. |
| Utilidade | Cada tela entrega uma tarefa concreta, evitando páginas meramente institucionais dentro do app. | Área autenticada em `/app`. | Ao acessar qualquer módulo operacional. |
| Arquitetura da informação | A navegação lateral agrupa módulos por contexto: dashboards, workspace e administração. | Sidebar principal. | Desde a entrada no sistema autenticado. |
| Hierarquia visual | Títulos, métricas, filtros, tabelas e gráficos seguem ordem de importância. | Páginas de clientes, leads e veículos. | Ao escanear uma tela para decidir o que fazer. |
| Consistência | Cards, badges, botões, tabelas, modais e filtros seguem padrões visuais semelhantes. | Todas as páginas refatoradas. | Em mudanças de contexto entre módulos. |
| Padrões de design | Uso de sidebar, top actions, cards de métricas, tabelas, menus de três pontos e modais. | App shell e páginas internas. | Na navegação e execução de ações. |
| Reconhecimento em vez de memorização | Ícones, labels e ações visíveis evitam que o usuário precise lembrar comandos. | Botões, filtros, status e menus. | Ao buscar, filtrar, editar ou consultar. |
| Redução de carga cognitiva | Informações são agrupadas em cards, seções e colunas previsíveis. | Listagens e dashboards. | Ao comparar muitos registros. |
| Agrupamento por proximidade | Elementos relacionados ficam próximos: filtros junto da lista, ações junto da linha. | Clientes, leads e veículos. | Ao manipular registros. |
| Lei de Hick | Opções foram reduzidas quando havia redundância, como remover botões extras quando o menu já continha as ações. | Tabelas de clientes, veículos e leads. | Ao escolher uma ação por registro. |
| Lei de Fitts | Botões principais têm área clicável adequada e ficam em posições previsíveis. | Botões "Novo cliente", "Novo lead", "Novo veículo" e ações de linha. | Ao executar comandos frequentes. |
| Affordance | Botões, selects, inputs e menus têm aparência de elementos interativos. | Formulários, filtros e ações. | Em qualquer interação de entrada de dados. |
| Significantes | Ícones como lupa, calendário, bomba de combustível, status e três pontos indicam função. | Busca, filtros, veículos, leads e clientes. | Ao interpretar rapidamente a interface. |
| Feedback | A interface mostra loading, erro, dados vazios, badges e alterações visuais de estado. | Consultas assíncronas e formulários. | Após buscar, salvar, excluir ou carregar dados. |
| Prevenção de erro | Campos usam validação, seletores e ações destrutivas pedem confirmação. | Modais de criação, edição e exclusão. | Antes de salvar dados inválidos ou excluir registros. |
| Recuperação de erro | Mensagens de erro são exibidas em áreas visíveis, preservando o contexto. | Formulários e carregamento de catálogos. | Quando API ou validação falha. |
| Controle e liberdade do usuário | Filtros podem ser limpos e modais podem ser cancelados. | Barras de filtro e dialogs. | Ao desfazer uma exploração ou edição. |
| Visibilidade do status do sistema | Status de cliente, lead, veículo e negociação são apresentados por badges coloridos. | Tabelas e cards. | Ao avaliar situação operacional. |
| Correspondência com o mundo real | Termos como "cliente", "lead", "negociação", "veículo", "reservado" e "vendido" seguem o domínio comercial. | Todo o CRM. | Durante interpretação dos dados. |
| Design centrado no usuário | A interface prioriza tarefas reais de equipe comercial, não apresentação institucional. | Área autenticada. | No uso recorrente do sistema. |
| Progressive disclosure | Detalhes ficam em modais ou menus, evitando sobrecarregar a lista principal. | Menus de três pontos e dialogs. | Quando o usuário precisa de detalhes. |
| Escaneabilidade | Tabelas usam colunas claras, avatares, subtítulos, valores e status para leitura rápida. | Clientes, leads e veículos. | Ao procurar registros em grande volume. |
| Densidade informacional controlada | Telas operacionais mostram muitos dados, mas com espaçamento, divisórias e agrupamento. | Tabelas de catálogo. | No acompanhamento diário. |
| Chunking | Métricas, filtros, lista e gráficos são blocos separados. | Clientes e leads. | Ao consumir a tela por partes. |
| Consistência cromática | Cores indicam categorias: verde para ativo/disponível, laranja para atenção, roxo para convertido/vendido, cinza para inativo. | Badges e cards. | Ao reconhecer estados sem ler todo o texto. |
| Iconografia funcional | Ícones são usados para reforçar significado, não apenas decoração. | Sidebar, métricas, ações e fontes de lead. | Na navegação e comparação visual. |
| Microcopy | Textos curtos explicam status e subtítulos sem sobrecarregar a tela. | Cards, badges e modais. | Ao interpretar um indicador ou campo. |
| Padrão de CTA primário | A ação principal da página fica destacada em laranja. | "Novo cliente", "Novo lead" e "Novo veículo". | Quando o usuário quer cadastrar. |
| Ações secundárias discretas | Ações menos frequentes ficam em botões neutros ou menus. | Menus de três pontos. | Ao editar, excluir, converter ou reatribuir. |
| Hierarquia de ação | Criar é destaque; consultar e editar são secundários; excluir exige confirmação. | Listagens e modais. | Em tarefas CRUD. |
| Modo de visualização alternativo | Veículos permitem alternar entre Cards e Tabela, adequando a visualização ao objetivo. | Página de veículos. | Ao comparar visualmente ou operar em massa. |
| Comparação visual | Preços, status, interesses e tempo parado são exibidos lado a lado. | Tabela de veículos. | Ao avaliar estoque. |
| Indicadores operacionais | Métricas resumem volume, conversão, interação e status. | Cards superiores das telas. | Ao abrir a página. |
| Visualização de dados | Gráficos de origem, localização, funil e destaque traduzem dados em padrões visuais. | Clientes e leads. | Ao analisar desempenho. |
| Priorização por destaque | Clientes em destaque e interesse por veículo ajudam a identificar oportunidades. | Clientes e veículos. | Ao decidir foco comercial. |
| Feedback semântico por cor | Cores são combinadas com texto, evitando depender somente da cor. | Badges e cards. | Para usuários com limitações de percepção cromática. |
| Responsividade | Layouts usam grids, flexbox e dimensões responsivas. | Telas principais e modais. | Em resoluções diferentes. |
| Acessibilidade básica | Inputs possuem labels ou `aria-label`, botões têm texto, foco e semântica de componentes. | Formulários, filtros e tabelas. | Ao navegar por teclado ou leitor de tela. |
| Contraste visual | Texto escuro sobre fundo claro e badges com fundos suaves preservam legibilidade. | Toda a UI autenticada. | Durante leitura prolongada. |
| Legibilidade | Tipografia hierárquica diferencia título, subtítulo, corpo, valor e ajuda. | Cards, tabelas e modais. | Em leitura rápida e detalhada. |
| Espaçamento consistente | Margens e gaps padronizados reduzem sensação de ruído. | Cards, filtros e modais. | Ao interpretar blocos visuais. |
| Continuidade visual | Divisórias e alinhamentos conduzem a leitura de linhas e colunas. | Tabelas e dashboards. | Ao percorrer registros. |
| Similaridade | Elementos com função parecida têm aparência parecida. | Badges, cards, botões e selects. | Ao aprender um padrão e reutilizá-lo. |
| Figura-fundo | Cards brancos sobre fundo claro separam áreas de trabalho sem excesso decorativo. | Clientes, leads e veículos. | Ao distinguir conteúdo de fundo. |
| Proximidade | Título e subtítulo, valor e legenda, status e descrição ficam agrupados. | Cards e tabelas. | Ao associar informações. |
| Alinhamento | Colunas, valores, ações e textos seguem eixos previsíveis. | Tabelas e widgets. | Ao comparar registros. |
| Consistência de modais | Modais seguem estética única para criação, edição, detalhes e exclusão. | Clientes e veículos. | Ao executar fluxos concentrados. |
| Minimização de distrações | Notificações e elementos não essenciais foram removidos do CRM quando não faziam parte do escopo. | Shell e páginas internas. | Durante operação sem sistema de notificações. |
| Persistência de navegação | Sidebar permanece disponível durante o uso. | Layout autenticado. | Ao trocar de módulo. |
| Estado vazio e carregamento | Skeletons e mensagens aparecem quando dados ainda não estão disponíveis. | Listas e consultas. | Durante carregamento ou ausência de dados. |
| Paginação | Listas grandes são divididas para evitar sobrecarga e melhorar desempenho percebido. | Clientes, leads e veículos. | Ao navegar por muitos registros. |
| Busca global contextual | Busca por nome, e-mail, CPF, placa, modelo ou VIN conforme domínio da página. | Clientes, leads e veículos. | Ao localizar registros específicos. |
| Filtros contextuais | Filtros variam de acordo com o domínio, como status, origem, loja e responsável. | Clientes e leads. | Ao refinar a listagem. |
| Ordenação | Ordenação permite mudar o critério de leitura sem alterar os dados. | Clientes, leads e veículos. | Ao priorizar recentes, interesse ou status. |
| Segurança perceptível | Campos bloqueados e regras visuais indicam restrições de edição. | Modais de veículos e clientes. | Ao editar dados sensíveis. |
| Consistência entre dados e UI | Métricas e listas usam dados reais vindos do backend, evitando mock visual enganoso. | Clientes, leads e veículos. | Ao tomar decisões operacionais. |

### 4.2 Heurísticas de Nielsen aplicadas

As heurísticas de Nielsen aparecem de forma prática no sistema:

- **Visibilidade do status do sistema:** badges, estados de carregamento, mensagens de erro e métricas informam o que está acontecendo.
- **Correspondência com o mundo real:** a linguagem segue o vocabulário de CRM e loja de veículos.
- **Controle e liberdade:** filtros podem ser removidos, modais podem ser cancelados e ações críticas pedem confirmação.
- **Consistência e padrões:** páginas seguem composição semelhante, com header, métricas, filtros, conteúdo principal e ações.
- **Prevenção de erros:** validações, selects e confirmações reduzem entradas inválidas e ações acidentais.
- **Reconhecimento em vez de memorização:** menus, labels e ícones deixam opções visíveis.
- **Flexibilidade e eficiência:** busca, filtros, ordenação e paginação aceleram tarefas de usuários frequentes.
- **Design estético e minimalista:** elementos desnecessários foram removidos, como chamadas promocionais e ações duplicadas.
- **Ajuda no reconhecimento de erros:** erros aparecem com texto próximo ao contexto.
- **Ajuda e documentação contextual:** subtítulos e microcopy explicam o significado de blocos sem exigir manual externo.

## 5 Aplicação por tela e funcionalidade

### 5.1 App Shell e navegação lateral

A navegação principal do Quantum CRM usa uma sidebar fixa com agrupamento por área: dashboards, workspace e administração. Esse padrão favorece arquitetura da informação, localização espacial e persistência de navegação. O usuário não precisa retornar a uma página inicial para trocar de módulo.

Conceitos aplicados:

- arquitetura da informação;
- navegação global persistente;
- reconhecimento por ícones;
- agrupamento semântico;
- consistência;
- orientação espacial;
- redução de carga cognitiva.

Onde foi implementado:

- layout autenticado em `/app`;
- componente de sidebar da aplicação;
- rotas de dashboards, clientes, leads, negociações, veículos, lojas, equipes, usuários e relatórios.

### 5.2 Tela de veículos

A tela de veículos foi refatorada para funcionar como catálogo operacional. A página possui cards de métricas, filtros por loja e status, alternância entre visualização em cards e tabela, imagens referenciais de veículos, badges de status, preço com indicação de relação à média, interesse por leads e tempo parado em estoque.

Conceitos aplicados:

- visualização alternativa conforme tarefa;
- comparação tabular;
- feedback semântico por cor;
- hierarquia de informação;
- escaneabilidade;
- reconhecimento visual por imagem;
- indicadores derivados;
- prevenção de sobrecarga visual;
- consistência de ações por menu;
- affordance de alternância entre modos.

Como foi implementado:

- cards de métricas no topo mostram totais por status;
- modo Cards prioriza reconhecimento visual do veículo;
- modo Tabela prioriza comparação operacional;
- miniaturas de veículos usam imagem referencial ou placeholder;
- status possui cor e subtítulo;
- interesse mostra quantidade de leads e sinal visual;
- tempo parado apresenta dias no estoque;
- ações foram concentradas no menu de três pontos.

Quando aparece:

- ao consultar estoque;
- ao comparar veículos disponíveis, reservados, vendidos ou inativos;
- ao identificar veículos com maior interesse comercial;
- ao editar, atualizar imagem, inativar ou excluir registros.

### 5.3 Tela de clientes

A tela de clientes foi organizada com métricas superiores, tabela operacional, filtros, paginação e widgets analíticos no rodapé. Os widgets de origem, localização e clientes em destaque apoiam decisões de relacionamento.

Conceitos aplicados:

- dashboard operacional;
- tabela densa e escaneável;
- filtros contextuais;
- paginação;
- chips de status arredondados;
- visualização por ranking;
- gráficos de distribuição;
- uso de logos ou ícones para canais;
- agrupamento por blocos;
- consistência de CTA.

Como foi implementado:

- cards superiores resumem clientes, negociações, clientes ativos e retenção;
- tabela mostra cliente, contato, documento, negociações, última atividade, status e ações;
- status ativo/inativo usa badge com texto e ponto colorido;
- botão "Ver detalhes" foi removido quando a mesma ação já existia no menu;
- paginação centralizada mostra sequência de páginas;
- seletor de itens por página usa múltiplos de 6;
- "Clientes por origem" usa ícones de canal e barras;
- "Clientes por localização" usa gráfico de rosca e distribuição por loja;
- "Clientes em destaque" usa ranking e destaque visual no maior valor.

Quando aparece:

- ao consultar carteira de clientes;
- ao filtrar por loja ou status;
- ao avaliar canais que mais geram clientes;
- ao abrir detalhe, editar ou excluir cliente por menu.

### 5.4 Tela de leads

A tela de leads foi redesenhada para centralizar o processo de entrada, interação e conversão de oportunidades. A composição utiliza métricas superiores, filtros operacionais, lista de leads, resumo de funil e distribuição por origem.

Conceitos aplicados:

- funil de conversão;
- lista operacional;
- indicadores de progresso;
- filtros por status, origem, loja e responsável;
- ordenação;
- visualização de dados;
- minimização de elementos desnecessários;
- consistência com clientes e veículos;
- remoção de redundância de ação;
- alinhamento e proporção visual.

Como foi implementado:

- cards superiores mostram total de leads, interação, conversão, leads em atenção e taxa de conversão;
- filtro de data foi removido da UI principal por excesso de largura e baixa prioridade visual;
- lista de leads mostra identificação, status, cliente, origem, responsável, última atividade e ações;
- "Ver detalhes" foi removido da linha, pois o menu de três pontos já contém a ação;
- funil foi desenhado com blocos trapezoidais para representar queda entre etapas;
- texto do funil foi alinhado ao centro vertical das formas;
- gráfico de origem usa distribuição por canais.

Quando aparece:

- ao acompanhar novos leads;
- ao filtrar oportunidades por origem, loja, status ou responsável;
- ao avaliar conversão e interação;
- ao abrir, editar, reatribuir, converter ou excluir lead.

### 5.5 Modais de criação, edição, detalhes e exclusão

Os modais seguem estética padronizada com cabeçalho, ícone contextual, seções internas, inputs com borda, blocos explicativos, rodapé com ações e confirmação para operações destrutivas.

Conceitos aplicados:

- foco da atenção;
- redução de contexto visual;
- consistência entre fluxos;
- hierarquia de formulário;
- prevenção de erro;
- affordance de campos editáveis e bloqueados;
- ação primária e secundária;
- confirmação para exclusão/inativação;
- microcopy orientada ao domínio.

Como foi implementado:

- modais de veículos e clientes usam o mesmo padrão visual;
- edição de veículo mostra status operacional;
- inativação fica disponível no contexto adequado;
- campos bloqueados indicam restrição;
- ações destrutivas usam tom visual de alerta;
- botões de cancelar e salvar têm hierarquia distinta.

Quando aparece:

- ao criar novo cliente, lead ou veículo;
- ao editar dados cadastrais;
- ao visualizar detalhes;
- ao confirmar exclusões ou inativações.

### 5.6 Dashboards

Os dashboards operacional e analítico representam dados por indicadores, gráficos e filtros temporais. A intenção é apoiar decisão gerencial, não apenas listar registros.

Conceitos aplicados:

- visualização de dados;
- tomada de decisão;
- filtros temporais;
- resumo executivo;
- densidade informacional;
- consistência de cards;
- comparação entre categorias;
- feedback por métricas.

Como foi implementado:

- métricas são agrupadas em cards;
- gráficos mostram distribuição, desempenho e evolução;
- filtros temporais permitem recortes analíticos;
- dados são buscados por contratos específicos do backend.

Evolução planejada na Sprint 3 (padronização UX):

- paleta única pastel ancorada em `--brand-accent`, documentada em [`docs/agile/sprint-3-design-system.md`](../agile/sprint-3-design-system.md);
- KPIs compartilham componente `KpiCard` com mesma intensidade cromática;
- gráficos seguem regras por tipo (barra única, performance por meta, brand de origem) em vez de arco-íris por série;
- modais de “ver detalhes” no dashboard analítico concentram leitura sem navegação desnecessária;
- conforto visual priorizado sobre variedade de cores vibrantes.

Quando aparece:

- ao avaliar desempenho comercial;
- ao acompanhar conversão;
- ao comparar períodos e responsáveis;
- ao identificar gargalos operacionais.

## 6 Relação com leis e princípios clássicos de IHC

### 6.1 Lei de Hick

A Lei de Hick indica que o tempo de decisão aumenta conforme o número de opções disponíveis. No Quantum CRM, isso influenciou a remoção de ações redundantes. Por exemplo, botões "Ver detalhes" foram retirados quando o menu de três pontos já concentrava a mesma ação, reduzindo competição visual na tabela.

### 6.2 Lei de Fitts

A Lei de Fitts relaciona tempo de clique ao tamanho e distância do alvo. A aplicação usa botões com área confortável, CTAs destacados no topo e menus posicionados na própria linha do registro. Isso reduz deslocamento do cursor e facilita ações repetitivas.

### 6.3 Princípios de Gestalt

Os princípios de Gestalt aparecem em:

- **proximidade:** dados relacionados agrupados em cards e linhas;
- **similaridade:** badges e botões semelhantes têm funções semelhantes;
- **continuidade:** tabelas usam linhas e colunas para guiar o olhar;
- **figura-fundo:** cards brancos se destacam do fundo cinza-claro;
- **fechamento:** bordas e containers indicam blocos completos de informação;
- **região comum:** filtros, listas e gráficos ficam dentro de áreas delimitadas.

### 6.4 Modelo mental

O sistema respeita o modelo mental de um CRM: primeiro o usuário identifica clientes e leads, depois acompanha negociações e veículos, e por fim consulta indicadores. Essa organização torna a interface previsível.

### 6.5 Carga cognitiva

A redução de carga cognitiva ocorre pela separação de informações em blocos, uso de labels claras, cores semânticas, filtros contextuais e modais focados. O usuário não precisa interpretar uma tela única com todas as possibilidades ao mesmo tempo.

## 7 Acessibilidade e responsividade

A acessibilidade foi tratada como requisito básico de qualidade de interface. O sistema utiliza contraste adequado, labels textuais, botões com texto ou ícones reconhecíveis, navegação por componentes semânticos e feedback visual acompanhado de texto.

Medidas aplicadas:

- uso de texto junto de cores para status;
- `aria-label` em campos que precisam de descrição;
- inputs e selects com foco visível;
- botões com área clicável adequada;
- redução de dependência exclusiva de cor;
- contraste entre texto e fundo;
- estrutura previsível de títulos e seções;
- layout responsivo com grid e flexbox.

A responsividade aparece principalmente nas páginas de clientes, leads e veículos, que usam grids adaptáveis, tabelas com containers e cards com dimensões controladas. A intenção é preservar legibilidade e evitar sobreposição de elementos.

## 8 Considerações finais

O Quantum CRM aplica conceitos de UI/UX de forma prática e integrada ao domínio do produto. A interface não busca apenas aparência visual, mas suporte real ao fluxo de trabalho comercial: localizar registros, interpretar status, comparar oportunidades, tomar decisões e executar ações com segurança.

As refatorações das telas de veículos, clientes e leads consolidaram uma linguagem visual comum para o sistema. Métricas no topo, filtros próximos da lista, ações concentradas em menus, modais padronizados e gráficos auxiliares formam uma experiência coerente. A remoção de elementos redundantes ou promocionais também reforça o foco operacional do produto.

Como evolução futura, recomenda-se realizar testes de usabilidade com usuários reais, coletar métricas de tempo de tarefa, registrar pontos de atrito e validar a interface com critérios formais de acessibilidade, como WCAG. Ainda assim, o estado atual já demonstra aplicação ampla de princípios de Interação Humano-Computador no desenvolvimento do ABP.

## 9 Referências

KRUG, Steve. **Não me faça pensar: atualizado**. Rio de Janeiro: Alta Books, 2014.

NIELSEN, Jakob. **Usability Engineering**. San Francisco: Morgan Kaufmann, 1993.

NIELSEN, Jakob; MOLICH, Rolf. **Heuristic evaluation of user interfaces**. In: Proceedings of the SIGCHI Conference on Human Factors in Computing Systems. New York: ACM, 1990.

NORMAN, Donald A. **O design do dia a dia**. Rio de Janeiro: Rocco, 2006.

PREECE, Jennifer; ROGERS, Yvonne; SHARP, Helen. **Design de interação: além da interação humano-computador**. Porto Alegre: Bookman, 2013.

SHNEIDERMAN, Ben; PLAISANT, Catherine; COHEN, Maxine; JACOBS, Steven; ELMQVIST, Niklas. **Designing the User Interface: Strategies for Effective Human-Computer Interaction**. 6. ed. Boston: Pearson, 2016.

W3C. **Web Content Accessibility Guidelines (WCAG) 2.1**. World Wide Web Consortium, 2018.
