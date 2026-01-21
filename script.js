// Campos do formulário da unidade
const campos = [
  "total", "solucionadas", "identificadas", "anonimas", "sigilosas",
  "presencial", "formulario", "email", "app", "sei", "telefone",
  "eouv", "ouvidorsus", "denuncia", "reclamacao", "elogio",
  "solicitacao", "sugestao"
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
  "Admin": "admin123"
};

// Variáveis de estado
let unidadeAtual = '';
let graficoPizza = null;
let graficoBarra = null;
let graficoComparativo = null;
let graficoEvolucao = null;

/*INICIALIZAÇÃO*/
// Criar campos numéricos da unidade
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

// Formatar nome do campo para exibição
function formatarNomeCampo(campo) {
  const nomes = {
    'total': 'Total de Demandas',
    'solucionadas': 'Demandas Solucionadas',
    'identificadas': 'Demandas Identificadas',
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
    'sugestao': 'Sugestão'
  };
  return nomes[campo] || campo.charAt(0).toUpperCase() + campo.slice(1);
}

// Inicializar ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
  criarCampos();
});

/*AUTENTICAÇÃO E NAVEGAÇÃO*/
function fazerLogin() {
  const unidade = document.getElementById('unidadeSelect').value;
  const senha = document.getElementById('senhaInput').value.trim();

  if (!unidade) {
    alert("Por favor, selecione uma unidade.");
    return;
  }

  if (!senha) {
    alert("Por favor, digite a senha.");
    return;
  }

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
  if (!confirm("Deseja realmente sair do sistema?")) {
    return;
  }

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
  if (!mes) {
    alert("Por favor, selecione o mês de referência.");
    return;
  }

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
  if (!mes) {
    alert("Por favor, selecione o mês que deseja limpar.");
    return;
  }

  const json = JSON.parse(localStorage.getItem('dadosOuvidoria') || '{}');

  if (!json[unidadeAtual] || !json[unidadeAtual][mes]) {
    alert("Não há dados salvos para este mês.");
    return;
  }

  if (!confirm(`Tem certeza que deseja apagar todos os dados do mês ${mes}?`)) {
    return;
  }

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
      labels: labels,
      datasets: [{
        data: valores,
        backgroundColor: [
          '#007B8F', '#2CA58D', '#E8C547', '#E85F5C', '#B2B1CF',
          '#71B48D', '#A267AC', '#6D597A', '#355070', '#B56576',
          '#EAAC8B', '#89B0AE', '#A1C181', '#F4A261', '#E07A5F',
          '#81B29A', '#F2CC8F', '#3D5A80'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            font: { size: 11 }
          }
        },
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
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 }
        }
      }
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
          '#007B8F', '#E85F5C', '#2CA58D', '#E8C547',
          '#B2B1CF', '#71B48D', '#A267AC', '#6D597A',
          '#355070', '#B56576', '#EAAC8B', '#89B0AE'
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
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        x: { beginAtZero: true }
      }
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
    '#007B8F', '#E85F5C', '#2CA58D', '#E8C547',
    '#B2B1CF', '#71B48D', '#A267AC', '#6D597A',
    '#355070', '#B56576', '#EAAC8B', '#89B0AE'
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
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            padding: 15,
            font: { size: 11 }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 }
        }
      }
    }
  });
}

/*DOCUMENTOS ADMIN*/
function gerarDocumentosAdmin() {
  const jsonOuvidoria = JSON.parse(localStorage.getItem('dadosOuvidoria') || '{}');
  const jsonGestao = JSON.parse(localStorage.getItem('dadosGestao') || '{}');
  const container = document.getElementById('unidadesDocs');
  container.innerHTML = '';

  Object.keys(jsonOuvidoria).filter(u => u !== 'Admin').forEach(unidade => {
    const divUnidade = document.createElement('div');
    divUnidade.innerHTML = `<h3>${unidade}</h3>`;

    const tabela = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    // Cabeçalho da tabela
    const trHead = document.createElement('tr');
    trHead.innerHTML = `
      <th>Mês</th>
      <th>Total</th>
      <th>Solucionadas</th>
      <th>Identificadas</th>
      <th>Anônimas</th>
      <th>Sigilosas</th>
      ${perguntasGestao.map(p => `<th>${p.texto}</th>`).join('')}
    `;
    thead.appendChild(trHead);

    // Dados mensais
    const meses = Object.keys(jsonOuvidoria[unidade] || {}).sort();
    meses.forEach(mes => {
      const tr = document.createElement('tr');
      const dadosOuvidoria = jsonOuvidoria[unidade][mes];
      const dadosGestao = (jsonGestao[unidade] && jsonGestao[unidade][mes]) || {};

      tr.innerHTML = `
        <td>${formatarMes(mes)}</td>
        <td>${dadosOuvidoria.total || 0}</td>
        <td>${dadosOuvidoria.solucionadas || 0}</td>
        <td>${dadosOuvidoria.identificadas || 0}</td>
        <td>${dadosOuvidoria.anonimas || 0}</td>
        <td>${dadosOuvidoria.sigilosas || 0}</td>
        ${perguntasGestao.map(p => `<td>${dadosGestao[p.id] ? 'Sim' : 'Não'}</td>`).join('')}
      `;
      tbody.appendChild(tr);
    });

    tabela.appendChild(thead);
    tabela.appendChild(tbody);
    divUnidade.appendChild(tabela);
    container.appendChild(divUnidade);
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
    const mesAtual = hoje.toISOString().slice(0, 7); // AAAA-MM
    mesInputGestao.value = mesAtual;
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
      if (e.target !== input) {
        input.checked = !input.checked;
      }
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
  if (!mes) {
    alert('Por favor, selecione o mês de referência da gestão.');
    return;
  }

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

  if (!json[unidadeAtual]) {
    alert('Não há sessão de gestão salva para esta unidade.');
    return;
  }

  const mes = document.getElementById('mesGestao').value;
  if (!mes) {
    alert('Por favor, selecione o mês de referência para exportar.');
    return;
  }

  const dados = json[unidadeAtual][mes];
  if (!dados) {
    alert('Não há sessão de gestão salva para este mês.');
    return;
  }

  const linha = {
    'Unidade': unidadeAtual,
    'Mês': mes
  };

  perguntasGestao.forEach(p => {
    const valor = dados[p.id] ? 'Sim' : 'Não';
    linha[p.texto] = valor;
  });

  const ws = XLSX.utils.json_to_sheet([linha]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Gestao');

  const nomeArquivo = `Gestao_${unidadeAtual.replace(/\s+/g, '_')}_${mes}.xlsx`;
  XLSX.writeFile(wb, nomeArquivo);
}

/*EXPORTAÇÃO - UNIDADE E GERAL*/
function exportarXLS() {
  const json = JSON.parse(localStorage.getItem('dadosOuvidoria') || '{}');

  if (!json[unidadeAtual]) {
    alert("Não há dados para exportar.");
    return;
  }

  const linhas = [];

  for (let mes in json[unidadeAtual]) {
    const dadosMes = json[unidadeAtual][mes];
    linhas.push({
      'Unidade': unidadeAtual,
      'Mês': mes,
      ...dadosMes
    });
  }

  if (linhas.length === 0) {
    alert("Não há dados para exportar.");
    return;
  }

  const ws = XLSX.utils.json_to_sheet(linhas);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Ouvidoria");

  const nomeArquivo = `Ouvidoria_${unidadeAtual.replace(/\s+/g, '_')}.xlsx`;
  XLSX.writeFile(wb, nomeArquivo);
}

function exportarGeral() {
  const json = JSON.parse(localStorage.getItem('dadosOuvidoria') || '{}');
  const linhas = [];

  for (let unidade in json) {
    if (unidade === 'Admin') continue;

    for (let mes in json[unidade]) {
      const dadosMes = json[unidade][mes];
      linhas.push({
        'Unidade': unidade,
        'Mês': mes,
        ...dadosMes
      });
    }
  }

  if (linhas.length === 0) {
    alert("Não há dados registrados no sistema.");
    return;
  }

  const ws = XLSX.utils.json_to_sheet(linhas);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Ouvidoria Geral");

  const hoje = new Date().toISOString().slice(0, 10);
  const nomeArquivo = `Ouvidoria_Geral_${hoje}.xlsx`;
  XLSX.writeFile(wb, nomeArquivo);
}

/*UTILITÁRIOS*/
function formatarMes(mes) {
  const [ano, mesNum] = mes.split('-');
  const meses = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];
  return `${meses[parseInt(mesNum) - 1]}/${ano}`;
}
