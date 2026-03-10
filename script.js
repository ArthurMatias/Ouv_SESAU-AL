// Campos do formulário da unidade
const campos = [
  "total", "solucionadas", "identificadas", "andamento", "finalizadas",
  "anonimas", "sigilosas", "presencial", "formulario", "email", "app",
  "sei", "telefone", "eouv", "ouvidorsus", "denuncia",
  "reclamacao", "elogio", "solicitacao", "sugestao", "dados"
];

// Perguntas da sessão de gestão (checkbox)
const perguntasGestao = [
  { id: 'plano_acao', texto: 'Há plano de ação para as demandas?' },
  { id: 'reunioes_periodicas', texto: 'Há reuniões periódicas?' },
  { id: 'devolutiva_usuarios', texto: 'Há devolutivas aos usuários das providências adotadas?' },
  { id: 'indicadores_acompanhados', texto: 'Há indicadores mensais de monitoramento?' },
  { id: 'responsavel_definido', texto: 'Há responsável formal designado as demandas?' },
  { id: 'capacitacao_equipe', texto: 'Há capacitação periódicas?' },
  { id: 'protocolo_atendimento', texto: 'Há protocolos padronizados?' },
  { id: 'prazo_resposta', texto: 'Há prazos de resposta às demandas?' },
  { id: 'sistema_informatizado', texto: 'Utiliza sistema informatizado para gestão das manifestações?' },
  { id: 'divulgacao_ouvidoria', texto: 'Há divulgação ativa dos canais?' },
  { id: 'infra_ouvidoria', texto: 'Boa infraestrutura da ouvidoria?' },
  { id: 'infra_unidade', texto: 'Boa infraestrutura da unidade?' }
];

// Credenciais das unidades
const credenciais = {
  "Hospital Regional Alto Sertão": "123",
  "Hospital Dr.Daniel Houly": "123",
  "Hemoal Arapiraca": "123",
  "Hemoal Maceió": "123",
  "Hospital Geral do Estado": "123",
  "Hospital da Mulher": "123",
  "Hospital do Coração": "123",
  "Hospital Metropolitano": "123",
  "Hospital Regional da Mata": "123",
  "Hospital da criança": "123",
  "Hospital Ib Gatto Falcão": "123",
  "Ouvidoria de Palmeira dos Indios": "123",
  "Ouvidoria de São José da Laje": "123",
  "Ouvidoria Arapiraca": "123",
  "Ouvidoria Atalaia": "123",
  "Ouvidoria de São Miguel dos Campos": "123",
  "Ouvidoria Teotônio Vilela": "123",
  "Ouvidoria União dos Palmares": "123",
  "Maceió": "123",
  "Paulo Jacinto": "123",
  "Boca da Mata": "123",
  "São José da Tapera": "123",
  "Dois Riachos": "123",
  "Inhapi": "123",
  "Coruripe": "123",
  "Ouvidoria Sesau": "123",
  "Admin": "admin123"
};

// Variáveis de estado
let unidadeAtual = '';
let graficoPizza = null;
let graficoBarra = null;
let graficoComparativo = null;
let graficoEvolucao = null;

// Armazena todas as linhas da tabela admin para filtro
let todasLinhasAdmin = [];

/*INICIALIZAÇÃO*/
function criarCampos() {
  const div = document.getElementById('formCampos');
  campos.forEach(c => {
    const group = document.createElement('div');
    group.className = 'form-group';

    const label = document.createElement('label');
    label.textContent = formatarNomeCampo(c);
    label.setAttribute('for', c);

    const input = document.createElement('input');
    input.type = 'number';
    input.id = c;
    input.min = '0';
    input.placeholder = '0';

    group.appendChild(label);
    group.appendChild(input);
    div.appendChild(group);
  });
}

function formatarNomeCampo(campo) {
  const nomes = {
    'total': 'Total de Demandas',
    'solucionadas': 'Demandas Solucionadas',
    'identificadas': 'Demandas Identificadas',
    'Andamento':'Demandas em Andamento',
    'Finalizadas':'Demandas Finalizadas',
    'anonimas': 'Demandas Anônimas',
    'sigilosas': 'Demandas Sigilosas',
    'presencial': 'Presencial',
    'formulario': 'Formulário',
    'email': 'E-mail',
    'app': 'Aplicativo',
    'sei': 'SEI',
    'telefone': 'Telefone',
    'eouv': 'e-Ouv',
    'ouvidorsus': 'OuvidorSUS',
    'denuncia': 'Denúncia',
    'reclamacao': 'Reclamação',
    'elogio': 'Elogio',
    'solicitacao': 'Solicitação',
    'sugestao': 'Sugestão',
    'dados':'Insuficiencia de Dados'
  };
  return nomes[campo] || campo.charAt(0).toUpperCase() + campo.slice(1);
}

document.addEventListener('DOMContentLoaded', function() {
  criarCampos();
});

/*AUTENTICAÇÃO E NAVEGAÇÃO*/
function fazerLogin() {
  const unidade = document.getElementById('unidadeSelect').value;
  const senha = document.getElementById('senhaInput').value.trim();

  if (!unidade) { alert("Por favor, selecione uma unidade."); return; }
  if (!senha) { alert("Por favor, digite a senha."); return; }

  if (credenciais[unidade] && credenciais[unidade] === senha) {
    unidadeAtual = unidade;
    document.getElementById('loginScreen').style.display = 'none';

    if (unidade === "Admin") {
      document.getElementById('adminScreen').style.display = 'block';
      gerarGraficosAdmin();
    } else {
      document.getElementById('unidadeScreen').style.display = 'block';
      document.getElementById('titulo-unidade').textContent = unidade;

      const mesInput = document.getElementById('mesReferencia');
      mesInput.addEventListener('change', preencherCamposExistentes);

      const hoje = new Date();
      const mesAtual = hoje.toISOString().slice(0, 7);
      mesInput.value = mesAtual;
      preencherCamposExistentes();
    }
  } else {
    alert("Senha incorreta ou unidade inválida!");
  }
}

function logout() {
  if (!confirm("Deseja realmente sair do sistema?")) return;

  if (graficoPizza) { graficoPizza.destroy(); graficoPizza = null; }
  if (graficoBarra) { graficoBarra.destroy(); graficoBarra = null; }
  if (graficoComparativo) { graficoComparativo.destroy(); graficoComparativo = null; }
  if (graficoEvolucao) { graficoEvolucao.destroy(); graficoEvolucao = null; }

  document.getElementById('senhaInput').value = '';
  document.getElementById('unidadeSelect').value = '';
  const mesRef = document.getElementById('mesReferencia');
  if (mesRef) mesRef.value = '';
  campos.forEach(c => {
    const input = document.getElementById(c);
    if (input) input.value = '';
  });

  document.getElementById('unidadeScreen').style.display = 'none';
  document.getElementById('adminScreen').style.display = 'none';
  document.getElementById('gestorScreen').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';

  unidadeAtual = '';
}

/*DADOS - UNIDADE*/
function preencherCamposExistentes() {
  const mes = document.getElementById('mesReferencia').value;
  if (!mes) return;

  const json = JSON.parse(localStorage.getItem('dadosOuvidoria') || '{}');
  const dados = json[unidadeAtual]?.[mes];

  if (dados) {
    campos.forEach(c => {
      const input = document.getElementById(c);
      if (input) input.value = dados[c] || 0;
    });
    gerarGraficos();
  } else {
    campos.forEach(c => {
      const input = document.getElementById(c);
      if (input) input.value = '';
    });
    if (graficoPizza) { graficoPizza.destroy(); graficoPizza = null; }
    if (graficoBarra) { graficoBarra.destroy(); graficoBarra = null; }
  }
}

function salvarDados() {
  const mes = document.getElementById('mesReferencia').value;
  if (!mes) { alert("Por favor, selecione o mês de referência."); return; }

  const dados = {};
  campos.forEach(c => {
    const input = document.getElementById(c);
    dados[c] = Number(input.value) || 0;
  });

  const json = JSON.parse(localStorage.getItem('dadosOuvidoria') || '{}');
  if (!json[unidadeAtual]) json[unidadeAtual] = {};
  json[unidadeAtual][mes] = dados;
  localStorage.setItem('dadosOuvidoria', JSON.stringify(json));

  alert("Dados salvos com sucesso!");
  gerarGraficos();
}

function limparDadosMes() {
  const mes = document.getElementById('mesReferencia').value;
  if (!mes) { alert("Por favor, selecione o mês que deseja limpar."); return; }

  const json = JSON.parse(localStorage.getItem('dadosOuvidoria') || '{}');
  if (!json[unidadeAtual] || !json[unidadeAtual][mes]) {
    alert("Não há dados salvos para este mês.");
    return;
  }

  if (!confirm(`Tem certeza que deseja apagar todos os dados do mês ${mes}?`)) return;

  delete json[unidadeAtual][mes];
  localStorage.setItem('dadosOuvidoria', JSON.stringify(json));

  campos.forEach(c => {
    const input = document.getElementById(c);
    if (input) input.value = '';
  });

  if (graficoPizza) { graficoPizza.destroy(); graficoPizza = null; }
  if (graficoBarra) { graficoBarra.destroy(); graficoBarra = null; }

  alert("Dados do mês removidos com sucesso!");
}

/*GRÁFICOS - UNIDADE*/
function gerarGraficos() {
  const mes = document.getElementById('mesReferencia').value;
  if (!mes) return;

  const json = JSON.parse(localStorage.getItem('dadosOuvidoria') || '{}');
  const dados = json[unidadeAtual]?.[mes];
  if (!dados) return;

  gerarGraficoPizza(dados);
  gerarGraficoBarra();
}

function gerarGraficoPizza(dados) {
  const ctx = document.getElementById('graficoPizza');
  if (!ctx) return;

  const labels = campos.map(c => formatarNomeCampo(c));
  const valores = campos.map(c => dados[c] || 0);

  if (graficoPizza) graficoPizza.destroy();

  graficoPizza = new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data: valores,
        backgroundColor: [
          '#007B8F','#2CA58D','#E8C547','#E85F5C','#B2B1CF',
          '#71B48D','#A267AC','#6D597A','#355070','#B56576',
          '#EAAC8B','#89B0AE','#A1C181','#F4A261','#E07A5F',
          '#81B29A','#F2CC8F','#3D5A80'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { position: 'bottom', labels: { padding: 15, font: { size: 11 } } },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.label || '';
              if (label) label += ': ';
              label += context.parsed;
              return label;
            }
          }
        }
      }
    }
  });
}

function gerarGraficoBarra() {
  const ctx = document.getElementById('graficoBarra');
  if (!ctx) return;

  const json = JSON.parse(localStorage.getItem('dadosOuvidoria') || '{}');
  const dadosUnidade = json[unidadeAtual];
  if (!dadosUnidade) return;

  const meses = Object.keys(dadosUnidade).sort();
  const totais = meses.map(m => dadosUnidade[m].total || 0);

  if (graficoBarra) graficoBarra.destroy();

  graficoBarra = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: meses.map(m => formatarMes(m)),
      datasets: [{
        label: 'Total de Demandas',
        data: totais,
        backgroundColor: '#007B8F',
        borderColor: '#005f6a',
        borderWidth: 2,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { display: true, position: 'top' } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
    }
  });
}

/*GRÁFICOS - ADMIN*/
function gerarGraficosAdmin() {
  const json = JSON.parse(localStorage.getItem('dadosOuvidoria') || '{}');
  const unidades = Object.keys(json).filter(u => u !== 'Admin');

  if (unidades.length === 0) {
    alert("Não há dados cadastrados ainda.");
    return;
  }

  gerarGraficoComparativo(json, unidades);
  gerarGraficoEvolucao(json, unidades);
  gerarDocumentosAdmin();
}

function gerarGraficoComparativo(json, unidades) {
  const ctx = document.getElementById('graficoComparativo');
  if (!ctx) return;

  const totaisUnidades = unidades.map(u => {
    const meses = Object.values(json[u] || {});
    return meses.reduce((soma, m) => soma + (m.total || 0), 0);
  });

  if (graficoComparativo) graficoComparativo.destroy();

  graficoComparativo = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: unidades,
      datasets: [{
        label: 'Total de Demandas (Acumulado)',
        data: totaisUnidades,
        backgroundColor: [
          '#007B8F','#E85F5C','#2CA58D','#E8C547',
          '#B2B1CF','#71B48D','#A267AC','#6D597A',
          '#355070','#B56576','#EAAC8B','#89B0AE'
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      indexAxis: 'y',
      plugins: { legend: { display: true, position: 'top' } },
      scales: { x: { beginAtZero: true } }
    }
  });
}

function gerarGraficoEvolucao(json, unidades) {
  const ctx = document.getElementById('graficoEvolucao');
  if (!ctx) return;

  const mesesUnicos = [...new Set(
    unidades.flatMap(u => Object.keys(json[u] || {}))
  )].sort();

  const cores = [
    '#007B8F','#E85F5C','#2CA58D','#E8C547',
    '#B2B1CF','#71B48D','#A267AC','#6D597A',
    '#355070','#B56576','#EAAC8B','#89B0AE'
  ];

  const datasets = unidades.map((u, i) => {
    const dados = mesesUnicos.map(m => json[u]?.[m]?.total || 0);
    const cor = cores[i % cores.length];
    return {
      label: u,
      data: dados,
      borderColor: cor,
      backgroundColor: cor + '33',
      borderWidth: 2,
      tension: 0.3,
      fill: false
    };
  });

  if (graficoEvolucao) graficoEvolucao.destroy();

  graficoEvolucao = new Chart(ctx, {
    type: 'line',
    data: {
      labels: mesesUnicos.map(m => formatarMes(m)),
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: true, position: 'bottom', labels: { padding: 15, font: { size: 11 } } }
      },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
    }
  });
}

/*DOCUMENTOS ADMIN - TABELA MELHORADA*/
function gerarDocumentosAdmin() {
  const jsonOuvidoria = JSON.parse(localStorage.getItem('dadosOuvidoria') || '{}');
  const jsonGestao = JSON.parse(localStorage.getItem('dadosGestao') || '{}');
  const container = document.getElementById('unidadesDocs');
  container.innerHTML = '';

  // Monta todas as linhas globais para busca
  todasLinhasAdmin = [];

  Object.keys(jsonOuvidoria).filter(u => u !== 'Admin').forEach(unidade => {
    const meses = Object.keys(jsonOuvidoria[unidade] || {}).sort();
    meses.forEach(mes => {
      const dadosOuvidoria = jsonOuvidoria[unidade][mes];
      const dadosGestao = (jsonGestao[unidade] && jsonGestao[unidade][mes]) || {};
      todasLinhasAdmin.push({ unidade, mes, dadosOuvidoria, dadosGestao });
    });
  });

  if (todasLinhasAdmin.length === 0) {
    container.innerHTML = '<p style="color: var(--text-light); padding: 16px;">Nenhum dado disponível.</p>';
    return;
  }

  // Barra de busca + filtros
  const searchWrapper = document.createElement('div');
  searchWrapper.className = 'admin-search-wrapper';
  searchWrapper.innerHTML = `
    <div class="admin-search-bar">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input type="text" id="adminSearchInput" placeholder="Buscar por unidade, mês ou qualquer valor..." autocomplete="off">
    </div>
    <div class="admin-filter-row">
      <div class="admin-filter-group">
        <label>Unidade</label>
        <select id="filterUnidade">
          <option value="">Todas</option>
          ${[...new Set(todasLinhasAdmin.map(r => r.unidade))].sort().map(u => `<option value="${u}">${u}</option>`).join('')}
        </select>
      </div>
      <div class="admin-filter-group">
        <label>Mês</label>
        <select id="filterMes">
          <option value="">Todos</option>
          ${[...new Set(todasLinhasAdmin.map(r => r.mes))].sort().map(m => `<option value="${m}">${formatarMes(m)}</option>`).join('')}
        </select>
      </div>
      <div class="admin-filter-group">
        <label>Gestão</label>
        <select id="filterGestao">
          <option value="">Todos</option>
          <option value="com">Com dados de gestão</option>
          <option value="sem">Sem dados de gestão</option>
        </select>
      </div>
      <div class="admin-result-count" id="adminResultCount"></div>
    </div>
  `;
  container.appendChild(searchWrapper);

  // Tabela única consolidada
  const tableWrapper = document.createElement('div');
  tableWrapper.className = 'admin-table-wrapper';

  const tabela = document.createElement('table');
  tabela.className = 'admin-table';
  tabela.id = 'adminMainTable';

  const colunasCampos = ['total', 'solucionadas', 'identificadas', 'anonimas', 'sigilosas'];
  const colunasGestao = perguntasGestao.map(p => p.id);
  const labelsCampos = colunasCampos.map(c => formatarNomeCampo(c));
  const labelsGestao = perguntasGestao.map(p => {
    // Versão curta das perguntas para cabeçalho
    const mapa = {
      plano_acao: 'Plano de Ação',
      reunioes_periodicas: 'Reuniões',
      devolutiva_usuarios: 'Devolutiva',
      indicadores_acompanhados: 'Indicadores',
      responsavel_definido: 'Responsável',
      capacitacao_equipe: 'Capacitação',
      protocolo_atendimento: 'Protocolo',
      prazo_resposta: 'Prazo Resposta',
      sistema_informatizado: 'Sistema',
      divulgacao_ouvidoria: 'Divulgação',
      infra_ouvidoria: 'Infra. Ouvidoria',
      infra_unidade: 'Infra. Unidade'
    };
    return mapa[p.id] || p.id;
  });

  // Cabeçalho com tooltip nas perguntas de gestão
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th class="th-sticky th-unidade" data-sort="unidade">Unidade <span class="sort-icon">↕</span></th>
      <th class="th-sticky th-mes" data-sort="mes">Mês <span class="sort-icon">↕</span></th>
      ${labelsCampos.map((l, i) => `<th data-sort="${colunasCampos[i]}">${l} <span class="sort-icon">↕</span></th>`).join('')}
      <th class="th-divider" colspan="${labelsGestao.length}">Gestão</th>
    </tr>
    <tr class="thead-sub">
      <th class="th-sticky th-unidade"></th>
      <th class="th-sticky th-mes"></th>
      ${labelsCampos.map(() => `<th></th>`).join('')}
      ${labelsGestao.map((l, i) => `<th title="${perguntasGestao[i].texto}">${l}</th>`).join('')}
    </tr>
  `;
  tabela.appendChild(thead);

  const tbody = document.createElement('tbody');
  tbody.id = 'adminTbody';
  tabela.appendChild(tbody);

  tableWrapper.appendChild(tabela);
  container.appendChild(tableWrapper);

  // Rodapé com contagem
  const footer = document.createElement('div');
  footer.className = 'admin-table-footer';
  footer.id = 'adminTableFooter';
  container.appendChild(footer);

  renderizarLinhas(todasLinhasAdmin);

  // Eventos de busca/filtro
  document.getElementById('adminSearchInput').addEventListener('input', filtrarTabela);
  document.getElementById('filterUnidade').addEventListener('change', filtrarTabela);
  document.getElementById('filterMes').addEventListener('change', filtrarTabela);
  document.getElementById('filterGestao').addEventListener('change', filtrarTabela);

  // Ordenação por clique no cabeçalho
  tabela.querySelectorAll('th[data-sort]').forEach(th => {
    th.style.cursor = 'pointer';
    th.addEventListener('click', () => sortTabela(th.dataset.sort));
  });

  filtrarTabela(); // atualiza contagem inicial
}

let sortConfig = { key: null, asc: true };

function sortTabela(key) {
  if (sortConfig.key === key) {
    sortConfig.asc = !sortConfig.asc;
  } else {
    sortConfig.key = key;
    sortConfig.asc = true;
  }
  filtrarTabela();
}

function filtrarTabela() {
  const busca = (document.getElementById('adminSearchInput')?.value || '').toLowerCase();
  const filterUnidade = document.getElementById('filterUnidade')?.value || '';
  const filterMes = document.getElementById('filterMes')?.value || '';
  const filterGestao = document.getElementById('filterGestao')?.value || '';

  let linhas = todasLinhasAdmin.filter(row => {
    if (filterUnidade && row.unidade !== filterUnidade) return false;
    if (filterMes && row.mes !== filterMes) return false;
    if (filterGestao === 'com' && Object.keys(row.dadosGestao).length === 0) return false;
    if (filterGestao === 'sem' && Object.keys(row.dadosGestao).length > 0) return false;

    if (busca) {
      const textoLinha = [
        row.unidade,
        formatarMes(row.mes),
        ...Object.values(row.dadosOuvidoria).map(String),
        ...perguntasGestao.map(p => row.dadosGestao[p.id] ? 'sim' : 'não')
      ].join(' ').toLowerCase();
      if (!textoLinha.includes(busca)) return false;
    }

    return true;
  });

  // Ordenação
  if (sortConfig.key) {
    linhas = linhas.slice().sort((a, b) => {
      let va, vb;
      if (sortConfig.key === 'unidade') { va = a.unidade; vb = b.unidade; }
      else if (sortConfig.key === 'mes') { va = a.mes; vb = b.mes; }
      else { va = a.dadosOuvidoria[sortConfig.key] || 0; vb = b.dadosOuvidoria[sortConfig.key] || 0; }

      if (typeof va === 'number') return sortConfig.asc ? va - vb : vb - va;
      return sortConfig.asc ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }

  renderizarLinhas(linhas);

  const count = document.getElementById('adminResultCount');
  if (count) count.textContent = `${linhas.length} registro${linhas.length !== 1 ? 's' : ''} encontrado${linhas.length !== 1 ? 's' : ''}`;

  const footer = document.getElementById('adminTableFooter');
  if (footer) footer.textContent = `Exibindo ${linhas.length} de ${todasLinhasAdmin.length} registros`;
}

function renderizarLinhas(linhas) {
  const tbody = document.getElementById('adminTbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const colunasCampos = ['total', 'solucionadas', 'identificadas', 'anonimas', 'sigilosas'];

  if (linhas.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 2 + colunasCampos.length + perguntasGestao.length;
    td.className = 'empty-state';
    td.innerHTML = `
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <p>Nenhum resultado encontrado</p>
    `;
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  linhas.forEach((row, idx) => {
    const tr = document.createElement('tr');
    tr.className = idx % 2 === 0 ? 'row-even' : 'row-odd';

    const hasGestao = Object.keys(row.dadosGestao).length > 0;

    tr.innerHTML = `
      <td class="td-unidade td-sticky"><span class="unidade-badge">${row.unidade}</span></td>
      <td class="td-mes td-sticky2"><span class="mes-badge">${formatarMes(row.mes)}</span></td>
      ${colunasCampos.map(c => {
        const val = row.dadosOuvidoria[c] || 0;
        const cls = c === 'total' ? 'td-total' : '';
        return `<td class="td-num ${cls}">${val}</td>`;
      }).join('')}
      ${perguntasGestao.map(p => {
        if (!hasGestao) return `<td class="td-gestao td-empty">—</td>`;
        const val = row.dadosGestao[p.id];
        return `<td class="td-gestao ${val ? 'td-sim' : 'td-nao'}">${val ? '<span class="badge-sim">Sim</span>' : '<span class="badge-nao">Não</span>'}</td>`;
      }).join('')}
    `;
    tbody.appendChild(tr);
  });
}

/*GESTÃO - NAVEGAÇÃO E PERGUNTAS*/
function abrirGestor() {
  if (!unidadeAtual || unidadeAtual === 'Admin') {
    alert('Sessão de gestão disponível apenas para unidades.');
    return;
  }

  document.getElementById('unidadeScreen').style.display = 'none';
  document.getElementById('gestorScreen').style.display = 'block';
  document.getElementById('gestorUnidade').textContent = unidadeAtual;

  criarPerguntasGestao();

  const mesInputGestao = document.getElementById('mesGestao');
  if (!mesInputGestao.value) {
    const hoje = new Date();
    mesInputGestao.value = hoje.toISOString().slice(0, 7);
  }

  mesInputGestao.onchange = carregarGestaoExistente;
  carregarGestaoExistente();
}

function voltarParaUnidade() {
  document.getElementById('gestorScreen').style.display = 'none';
  document.getElementById('unidadeScreen').style.display = 'block';
}

function criarPerguntasGestao() {
  const container = document.getElementById('gestorPerguntas');
  if (!container) return;

  container.innerHTML = '';

  perguntasGestao.forEach(p => {
    const item = document.createElement('div');
    item.className = 'checkbox-item';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = p.id;

    const label = document.createElement('label');
    label.setAttribute('for', p.id);
    label.textContent = p.texto;

    item.appendChild(input);
    item.appendChild(label);
    container.appendChild(item);

    item.addEventListener('click', function(e) {
      if (e.target !== input) input.checked = !input.checked;
    });
  });
}

function carregarGestaoExistente() {
  const mes = document.getElementById('mesGestao').value;
  if (!mes) return;

  const json = JSON.parse(localStorage.getItem('dadosGestao') || '{}');
  const dados = json[unidadeAtual]?.[mes];

  perguntasGestao.forEach(p => {
    const input = document.getElementById(p.id);
    if (input) input.checked = false;
  });

  if (!dados) return;

  perguntasGestao.forEach(p => {
    const input = document.getElementById(p.id);
    if (input) input.checked = !!dados[p.id];
  });
}

function salvarGestao() {
  if (!unidadeAtual || unidadeAtual === 'Admin') {
    alert('Unidade inválida para salvar gestão.');
    return;
  }

  const mes = document.getElementById('mesGestao').value;
  if (!mes) { alert('Por favor, selecione o mês de referência da gestão.'); return; }

  const dados = {};
  perguntasGestao.forEach(p => {
    const input = document.getElementById(p.id);
    dados[p.id] = input && input.checked ? 1 : 0;
  });

  const json = JSON.parse(localStorage.getItem('dadosGestao') || '{}');
  if (!json[unidadeAtual]) json[unidadeAtual] = {};
  json[unidadeAtual][mes] = dados;
  localStorage.setItem('dadosGestao', JSON.stringify(json));

  alert('Sessão de gestão salva com sucesso!');
}

function exportarGestaoXLS() {
  const json = JSON.parse(localStorage.getItem('dadosGestao') || '{}');

  if (!json[unidadeAtual]) { alert('Não há sessão de gestão salva para esta unidade.'); return; }

  const mes = document.getElementById('mesGestao').value;
  if (!mes) { alert('Por favor, selecione o mês de referência para exportar.'); return; }

  const dados = json[unidadeAtual][mes];
  if (!dados) { alert('Não há sessão de gestão salva para este mês.'); return; }

  const linha = { 'Unidade': unidadeAtual, 'Mês': mes };
  perguntasGestao.forEach(p => { linha[p.texto] = dados[p.id] ? 'Sim' : 'Não'; });

  const ws = XLSX.utils.json_to_sheet([linha]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Gestao');
  XLSX.writeFile(wb, `Gestao_${unidadeAtual.replace(/\s+/g, '_')}_${mes}.xlsx`);
}

/*EXPORTAÇÃO*/
function exportarXLS() {
  const json = JSON.parse(localStorage.getItem('dadosOuvidoria') || '{}');
  if (!json[unidadeAtual]) { alert("Não há dados para exportar."); return; }

  const linhas = [];
  for (let mes in json[unidadeAtual]) {
    linhas.push({ 'Unidade': unidadeAtual, 'Mês': mes, ...json[unidadeAtual][mes] });
  }

  if (linhas.length === 0) { alert("Não há dados para exportar."); return; }

  const ws = XLSX.utils.json_to_sheet(linhas);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Ouvidoria");
  XLSX.writeFile(wb, `Ouvidoria_${unidadeAtual.replace(/\s+/g, '_')}.xlsx`);
}

function exportarGeral() {
  const json = JSON.parse(localStorage.getItem('dadosOuvidoria') || '{}');
  const linhas = [];

  for (let unidade in json) {
    if (unidade === 'Admin') continue;
    for (let mes in json[unidade]) {
      linhas.push({ 'Unidade': unidade, 'Mês': mes, ...json[unidade][mes] });
    }
  }

  if (linhas.length === 0) { alert("Não há dados registrados no sistema."); return; }

  const ws = XLSX.utils.json_to_sheet(linhas);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Ouvidoria Geral");

  const hoje = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Ouvidoria_Geral_${hoje}.xlsx`);
}

/*UTILITÁRIOS*/
function formatarMes(mes) {
  const [ano, mesNum] = mes.split('-');
  const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return `${meses[parseInt(mesNum) - 1]}/${ano}`;
}