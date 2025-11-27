/* ===================================
   CONFIGURAÇÕES E VARIÁVEIS GLOBAIS
=================================== */

// Campos do formulário
const campos = [
  "total", "solucionadas", "identificadas", "anonimas", "sigilosas",
  "presencial", "formulario", "email", "app", "sei", "telefone",
  "eouv", "ouvidorsus", "denuncia", "reclamacao", "elogio",
  "solicitacao", "sugestao"
];

// Perguntas da sessão de gestão
const perguntasGestao = [
  { id: 'plano_acao', texto: 'A unidade possui plano de ação formalizado para tratar as demandas da ouvidoria?' },
  { id: 'reunioes_periodicas', texto: 'São realizadas reuniões periódicas para discutir os relatórios da ouvidoria?' },
  { id: 'devolutiva_usuarios', texto: 'A unidade realiza devolutiva aos usuários sobre as providências adotadas?' },
  { id: 'indicadores_acompanhados', texto: 'Há indicadores de ouvidoria monitorados mensalmente pela gestão?' },
  { id: 'responsavel_definido', texto: 'Existe responsável formal designado para acompanhar as demandas da ouvidoria?' },
  { id: 'capacitacao_equipe', texto: 'A equipe recebe capacitação periódica sobre atendimento ao usuário e ouvidoria?' },
  { id: 'protocolo_atendimento', texto: 'Existe protocolo padronizado para tratamento de manifestações?' },
  { id: 'prazo_resposta', texto: 'Os prazos de resposta às demandas são cumpridos regularmente?' },
  { id: 'sistema_informatizado', texto: 'A unidade utiliza sistema informatizado para gestão das manifestações?' },
  { id: 'divulgacao_ouvidoria', texto: 'Há divulgação ativa dos canais de ouvidoria para usuários e servidores?' }
];

// Credenciais das unidades
const credenciais = {
  "Hospital Regional Alto Sertão": "123",
  "Hospital Dr.Daniel Houly": "123",
  "Hemoal Arapiraca": "123",
  "Hemoal Maceió": "123",
  "Hospital Geral Eestado": "123",
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

/* ===================================
   INICIALIZAÇÃO
=================================== */

// Criar campos do formulário ao carregar a página
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

/* ===================================
   AUTENTICAÇÃO E NAVEGAÇÃO
=================================== */

// Fazer login
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

  // Verificar credenciais
  if (credenciais[unidade] && credenciais[unidade] === senha) {
    unidadeAtual = unidade;

    // Ocultar tela de login
    document.getElementById('loginScreen').style.display = 'none';

    if (unidade === "Admin") {
      // Mostrar painel administrativo
      document.getElementById('adminScreen').style.display = 'block';
      gerarGraficosAdmin();
    } else {
      // Mostrar painel da unidade
      document.getElementById('unidadeScreen').style.display = 'block';
      document.getElementById('titulo-unidade').textContent = unidade;

      // Configurar evento de mudança de mês
      const mesInput = document.getElementById('mesReferencia');
      mesInput.addEventListener('change', preencherCamposExistentes);

      // Definir mês atual como padrão
      const hoje = new Date();
      const mesAtual = hoje.toISOString().slice(0, 7);
      mesInput.value = mesAtual;
      preencherCamposExistentes();
    }
  } else {
    alert("Senha incorreta ou unidade inválida!");
  }
}

// Fazer logout
function logout() {
  if (!confirm("Deseja realmente sair do sistema?")) {
    return;
  }

  // Destruir gráficos
  if (graficoPizza) {
    graficoPizza.destroy();
    graficoPizza = null;
  }
  if (graficoBarra) {
    graficoBarra.destroy();
    graficoBarra = null;
  }
  if (graficoComparativo) {
    graficoComparativo.destroy();
    graficoComparativo = null;
  }
  if (graficoEvolucao) {
    graficoEvolucao.destroy();
    graficoEvolucao = null;
  }

  // Limpar campos
  document.getElementById('senhaInput').value = '';
  document.getElementById('unidadeSelect').value = '';
  document.getElementById('mesReferencia').value = '';
  campos.forEach(c => {
    const input = document.getElementById(c);
    if (input) input.value = '';
  });

  // Ocultar todas as telas
  document.getElementById('unidadeScreen').style.display = 'none';
  document.getElementById('adminScreen').style.display = 'none';
  document.getElementById('gestorScreen').style.display = 'none';

  // Mostrar tela de login
  document.getElementById('loginScreen').style.display = 'flex';

  // Resetar estado
  unidadeAtual = '';
}

/* ===================================
   GERENCIAMENTO DE DADOS - UNIDADE
=================================== */

// Preencher campos com dados existentes
function preencherCamposExistentes() {
  const mes = document.getElementById('mesReferencia').value;
  if (!mes) return;

  const json = JSON.parse(localStorage.getItem('dadosOuvidoria') || '{}');
  const dados = json[unidadeAtual]?.[mes];

  if (dados) {
    // Preencher campos
    campos.forEach(c => {
      const input = document.getElementById(c);
      if (input) {
        input.value = dados[c] || 0;
      }
    });
    gerarGraficos();
  } else {
    // Limpar campos se não houver dados
    campos.forEach(c => {
      const input = document.getElementById(c);
      if (input) {
        input.value = '';
      }
    });

    // Destruir gráficos
    if (graficoPizza) {
      graficoPizza.destroy();
      graficoPizza = null;
    }
    if (graficoBarra) {
      graficoBarra.destroy();
      graficoBarra = null;
    }
  }
}

// Salvar dados
function salvarDados() {
  const mes = document.getElementById('mesReferencia').value;

  if (!mes) {
    alert("Por favor, selecione o mês de referência.");
    return;
  }

  // Coletar dados dos campos
  const dados = {};
  campos.forEach(c => {
    const input = document.getElementById(c);
    dados[c] = Number(input.value) || 0;
  });

  // Salvar no localStorage
  const json = JSON.parse(localStorage.getItem('dadosOuvidoria') || '{}');
  if (!json[unidadeAtual]) {
    json[unidadeAtual] = {};
  }
  json[unidadeAtual][mes] = dados;
  localStorage.setItem('dadosOuvidoria', JSON.stringify(json));

  alert("Dados salvos com sucesso!");
  gerarGraficos();
}

// Limpar dados do mês
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

  // Remover dados do mês
  delete json[unidadeAtual][mes];
  localStorage.setItem('dadosOuvidoria', JSON.stringify(json));

  // Limpar campos
  campos.forEach(c => {
    const input = document.getElementById(c);
    if (input) {
      input.value = '';
    }
  });

  // Destruir gráficos
  if (graficoPizza) {
    graficoPizza.destroy();
    graficoPizza = null;
  }
  if (graficoBarra) {
    graficoBarra.destroy();
    graficoBarra = null;
  }

  alert("Dados do mês removidos com sucesso!");
}

/* ===================================
   GRÁFICOS - UNIDADE
=================================== */

// Gerar gráficos da unidade
function gerarGraficos() {
  const mes = document.getElementById('mesReferencia').value;
  if (!mes) return;

  const json = JSON.parse(localStorage.getItem('dadosOuvidoria') || '{}');
  const dados = json[unidadeAtual]?.[mes];

  if (!dados) return;

  // Gráfico de Pizza
  gerarGraficoPizza(dados);

  // Gráfico de Barras (evolução mensal)
  gerarGraficoBarra();
}

// Gráfico de Pizza
function gerarGraficoPizza(dados) {
  const ctx = document.getElementById('graficoPizza');
  if (!ctx) return;

  const labels = campos.map(c => formatarNomeCampo(c));
  const valores = campos.map(c => dados[c] || 0);

  // Destruir gráfico anterior
  if (graficoPizza) {
    graficoPizza.destroy();
  }

  // Criar novo gráfico
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
            font: {
              size: 11
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.label || '';
              if (label) {
                label += ': ';
              }
              label += context.parsed;
              return label;
            }
          }
        }
      }
    }
  });
}

// Gráfico de Barras (evolução mensal)
function gerarGraficoBarra() {
  const ctx = document.getElementById('graficoBarra');
  if (!ctx) return;

  const json = JSON.parse(localStorage.getItem('dadosOuvidoria') || '{}');
  const dadosUnidade = json[unidadeAtual];

  if (!dadosUnidade) return;

  const meses = Object.keys(dadosUnidade).sort();
  const totais = meses.map(m => dadosUnidade[m].total || 0);

  // Destruir gráfico anterior
  if (graficoBarra) {
    graficoBarra.destroy();
  }

  // Criar novo gráfico
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
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

/* ===================================
   GRÁFICOS - ADMINISTRADOR
=================================== */

// Gerar gráficos administrativos
function gerarGraficosAdmin() {
  const json = JSON.parse(localStorage.getItem('dadosOuvidoria') || '{}');
  const unidades = Object.keys(json).filter(u => u !== 'Admin');

  if (unidades.length === 0) {
    alert("Não há dados cadastrados ainda.");
    return;
  }

  // Gráfico Comparativo
  gerarGraficoComparativo(json, unidades);

  // Gráfico de Evolução
  gerarGraficoEvolucao(json, unidades);
}

// Gráfico Comparativo (total por unidade)
function gerarGraficoComparativo(json, unidades) {
  const ctx = document.getElementById('graficoComparativo');
  if (!ctx) return;

  // Calcular total por unidade (soma de todos os meses)
  const totaisUnidades = unidades.map(u => {
    const meses = Object.values(json[u] || {});
    return meses.reduce((soma, m) => soma + (m.total || 0), 0);
  });

  // Destruir gráfico anterior
  if (graficoComparativo) {
    graficoComparativo.destroy();
  }

  // Criar novo gráfico
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
        x: {
          beginAtZero: true
        }
      }
    }
  });
}

// Gráfico de Evolução Mensal
function gerarGraficoEvolucao(json, unidades) {
  const ctx = document.getElementById('graficoEvolucao');
  if (!ctx) return;

  // Obter todos os meses únicos
  const mesesUnicos = [...new Set(
    unidades.flatMap(u => Object.keys(json[u] || {}))
  )].sort();

  // Cores para cada unidade
  const cores = [
    '#007B8F', '#E85F5C', '#2CA58D', '#E8C547',
    '#B2B1CF', '#71B48D', '#A267AC', '#6D597A',
    '#355070', '#B56576', '#EAAC8B', '#89B0AE'
  ];

  // Criar datasets
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

  // Destruir gráfico anterior
  if (graficoEvolucao) {
    graficoEvolucao.destroy();
  }

  // Criar novo gráfico
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
            font: {
              size: 11
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

/* ===================================
   GESTÃO - NAVEGAÇÃO E PERGUNTAS
=================================== */

// Abrir tela de gestão
function abrirGestor() {
  if (!unidadeAtual || unidadeAtual === 'Admin') {
    alert('Sessão de gestão disponível apenas para unidades.');
    return;
  }
  
  document.getElementById('unidadeScreen').style.display = 'none';
  document.getElementById('gestorScreen').style.display = 'block';
  document.getElementById('gestorUnidade').textContent = unidadeAtual;

  criarPerguntasGestao();
  carregarGestaoExistente();
}

// Voltar para tela da unidade
function voltarParaUnidade() {
  document.getElementById('gestorScreen').style.display = 'none';
  document.getElementById('unidadeScreen').style.display = 'block';
}

// Criar perguntas de gestão com checkboxes
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

    // Permitir clicar em todo o item para marcar
    item.addEventListener('click', function(e) {
      if (e.target !== input) {
        input.checked = !input.checked;
      }
    });
  });
}

// Carregar dados de gestão existentes
function carregarGestaoExistente() {
  const json = JSON.parse(localStorage.getItem('dadosGestao') || '{}');
  const dados = json[unidadeAtual];
  
  if (!dados) return;

  perguntasGestao.forEach(p => {
    const input = document.getElementById(p.id);
    if (input) {
      input.checked = !!dados[p.id];
    }
  });
}

// Salvar sessão de gestão
function salvarGestao() {
  if (!unidadeAtual || unidadeAtual === 'Admin') {
    alert('Unidade inválida para salvar gestão.');
    return;
  }

  const dados = {};
  perguntasGestao.forEach(p => {
    const input = document.getElementById(p.id);
    dados[p.id] = input && input.checked ? 1 : 0;
  });

  const json = JSON.parse(localStorage.getItem('dadosGestao') || '{}');
  json[unidadeAtual] = dados;
  localStorage.setItem('dadosGestao', JSON.stringify(json));

  alert('Sessão de gestão salva com sucesso!');
}

// Exportar sessão de gestão para Excel
function exportarGestaoXLS() {
  const json = JSON.parse(localStorage.getItem('dadosGestao') || '{}');
  
  if (!json[unidadeAtual]) {
    alert('Não há sessão de gestão salva para esta unidade.');
    return;
  }

  const dados = json[unidadeAtual];

  // Monta objeto para Excel
  const linha = {
    'Unidade': unidadeAtual
  };

  perguntasGestao.forEach(p => {
    const valor = dados[p.id] ? 'Sim' : 'Não';
    linha[p.texto] = valor;
  });

  const ws = XLSX.utils.json_to_sheet([linha]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Gestao');

  const nomeArquivo = `Gestao_${unidadeAtual.replace(/\s+/g, '_')}.xlsx`;
  XLSX.writeFile(wb, nomeArquivo);
}

/* ===================================
   EXPORTAÇÃO DE DADOS
=================================== */

// Exportar dados da unidade para Excel
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

// Exportar dados gerais (admin)
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

/* ===================================
   UTILITÁRIOS
=================================== */

// Formatar mês para exibição
function formatarMes(mes) {
  const [ano, mesNum] = mes.split('-');
  const meses = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];
  return `${meses[parseInt(mesNum) - 1]}/${ano}`;
}
