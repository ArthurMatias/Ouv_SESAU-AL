const campos = [
  "total", "solucionadas", "identificadas", "anonimas", "sigilosas",
  "presencial", "formulario", "email", "app", "sei", "telefone",
  "eouv", "ouvidorsus", "denuncia", "reclamacao", "elogio",
  "solicitacao", "sugestao"
];

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
  "Ouvidoria de Palmeira dos Indios": "123",
  "Ouvidoria de São José da Laje": "123",
  "Ouvidoria Arapiraca": "123",
  "Ouvidoria Atalaia": "123",
  "Ouvidoria de São Miguel dos Campos": "123",
  "Ouvidoria Teotônio Vilela": "123",
  "Ouvidoria União dos Palmares": "123",
  "Hospital da criança": "123",
  "Hospital Ib Gatto Falcão": "123",
  "Admin": "admin123"
};


let unidadeAtual = '';
let graficoPizza = null;
let graficoBarra = null;
let graficoComparativo = null;
let graficoEvolucao = null;

function criarCampos() {
  const div = document.getElementById('formCampos');
  campos.forEach(c => {
    const label = document.createElement('label');
    label.textContent = c.charAt(0).toUpperCase() + c.slice(1) + ':';
    const input = document.createElement('input');
    input.type = 'number';
    input.id = c;
    div.appendChild(label);
    div.appendChild(input);
  });
}
criarCampos();

function fazerLogin() {
  const unidade = document.getElementById('unidadeSelect').value;
  const senha = document.getElementById('senhaInput').value.trim();

  if (!unidade) return alert("Selecione uma unidade.");
  if (!senha) return alert("Digite a senha.");

  if (credenciais[unidade] && credenciais[unidade] === senha) {
    unidadeAtual = unidade;
    document.getElementById('loginModal').style.display = 'none';

    if (unidade === "Admin") {
      document.getElementById('adminPanel').style.display = 'block';
      gerarGraficosAdmin();
    } else {
      document.getElementById('app').style.display = 'block';
      document.getElementById('titulo-unidade').textContent = "Unidade: " + unidade;
      document.getElementById('mesReferencia').addEventListener('change', preencherCamposExistentes);
    }
  } else {
    alert("Senha incorreta ou unidade inválida!");
  }
}

function preencherCamposExistentes() {
  const mes = document.getElementById('mesReferencia').value;
  const json = JSON.parse(localStorage.getItem('dadosOuvidoria') || '{}');
  const dados = json[unidadeAtual]?.[mes];

  if (dados) {
    campos.forEach(c => {
      document.getElementById(c).value = dados[c] || 0;
    });
    gerarGraficos();
  } else {
    campos.forEach(c => document.getElementById(c).value = '');
    if (graficoPizza) graficoPizza.destroy();
    if (graficoBarra) graficoBarra.destroy();
  }
}

function salvarDados() {
  const mes = document.getElementById('mesReferencia').value;
  if (!mes) return alert("Selecione o mês de referência.");
  
  const dados = {};
  campos.forEach(c => dados[c] = Number(document.getElementById(c).value) || 0);

  const json = JSON.parse(localStorage.getItem('dadosOuvidoria') || '{}');
  if (!json[unidadeAtual]) json[unidadeAtual] = {};
  json[unidadeAtual][mes] = dados;
  localStorage.setItem('dadosOuvidoria', JSON.stringify(json));
  
  alert("Dados salvos com sucesso!");
  gerarGraficos();
}

function limparDadosMes() {
  const mes = document.getElementById('mesReferencia').value;
  if (!mes) return alert("Selecione o mês que deseja limpar.");

  const json = JSON.parse(localStorage.getItem('dadosOuvidoria') || '{}');
  if (!json[unidadeAtual] || !json[unidadeAtual][mes]) {
    return alert("Não há dados salvos para este mês.");
  }

  if (!confirm(`Tem certeza que deseja apagar os dados do mês ${mes}?`)) return;

  delete json[unidadeAtual][mes];
  localStorage.setItem('dadosOuvidoria', JSON.stringify(json));

  campos.forEach(c => document.getElementById(c).value = '');
  if (graficoPizza) graficoPizza.destroy();
  if (graficoBarra) graficoBarra.destroy();

  alert("Dados do mês removidos com sucesso!");
}

function gerarGraficos() {
  const mes = document.getElementById('mesReferencia').value;
  if (!mes) return;
  const json = JSON.parse(localStorage.getItem('dadosOuvidoria') || '{}');
  const dados = json[unidadeAtual]?.[mes];
  if (!dados) return;

  const ctxP = document.getElementById('graficoPizza');
  const ctxB = document.getElementById('graficoBarra');
  const labels = Object.keys(dados);
  const valores = Object.values(dados);

  if (graficoPizza) graficoPizza.destroy();
  if (graficoBarra) graficoBarra.destroy();

  graficoPizza = new Chart(ctxP, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data: valores,
        backgroundColor: [
          '#007B8F','#2CA58D','#E8C547','#E85F5C','#B2B1CF','#71B48D','#A267AC',
          '#6D597A','#355070','#B56576','#EAAC8B','#89B0AE','#A1C181','#F4A261'
        ]
      }]
    },
    options: { plugins: { legend: { position: 'right' } } }
  });

  const todosMeses = Object.entries(json[unidadeAtual]);
  const meses = todosMeses.map(([m]) => m);
  const totais = todosMeses.map(([m, d]) => d.total);

  graficoBarra = new Chart(ctxB, {
    type: 'bar',
    data: {
      labels: meses,
      datasets: [{
        label: 'Total de Demandas',
        data: totais,
        backgroundColor: '#007B8F'
      }]
    },
    options: { responsive: true }
  });
}

// 🔹 Geração de gráficos do ADMIN
function gerarGraficosAdmin() {
  const json = JSON.parse(localStorage.getItem('dadosOuvidoria') || '{}');
  const unidades = Object.keys(json);

  if (graficoComparativo) graficoComparativo.destroy();
  if (graficoEvolucao) graficoEvolucao.destroy();

  // Total por unidade (soma de todos os meses)
  const totaisUnidades = unidades.map(u => {
    const meses = Object.values(json[u] || {});
    return meses.reduce((soma, m) => soma + (m.total || 0), 0);
  });

  const ctx1 = document.getElementById('graficoComparativo');
  graficoComparativo = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: unidades,
      datasets: [{
        label: 'Total de Demandas (acumulado)',
        data: totaisUnidades,
        backgroundColor: ['#007B8F','#E85F5C','#2CA58D','#E8C547']
      }]
    },
    options: { responsive: true }
  });

  // Evolução mensal por unidade
  const ctx2 = document.getElementById('graficoEvolucao');
  const mesesUnicos = [...new Set(unidades.flatMap(u => Object.keys(json[u] || {})))].sort();
  const datasets = unidades.map((u, i) => {
    const dados = mesesUnicos.map(m => json[u]?.[m]?.total || 0);
    const cor = ['#007B8F','#E85F5C','#2CA58D','#E8C547'][i % 4];
    return { label: u, data: dados, borderColor: cor, backgroundColor: cor + '66', fill: false };
  });

  graficoEvolucao = new Chart(ctx2, {
    type: 'line',
    data: { labels: mesesUnicos, datasets },
    options: { responsive: true }
  });
}

// 🔹 Exporta dados gerais de todas as unidades
function exportarGeral() {
  const json = JSON.parse(localStorage.getItem('dadosOuvidoria') || '{}');
  const linhas = [];

  for (let unidade in json) {
    for (let mes in json[unidade]) {
      linhas.push({ Unidade: unidade, Mês: mes, ...json[unidade][mes] });
    }
  }

  if (linhas.length === 0) return alert("Não há dados registrados.");

  const ws = XLSX.utils.json_to_sheet(linhas);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Ouvidoria Geral");
  XLSX.writeFile(wb, "Ouvidoria_Geral.xlsx");
}

// 🔹 Exportação individual
function exportarXLS() {
  const json = JSON.parse(localStorage.getItem('dadosOuvidoria') || '{}');
  if (!json[unidadeAtual]) return alert("Nenhum dado para exportar.");

  const linhas = [];
  for (let mes in json[unidadeAtual]) {
    linhas.push({ Unidade: unidadeAtual, Mês: mes, ...json[unidadeAtual][mes] });
  }
  const ws = XLSX.utils.json_to_sheet(linhas);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Ouvidoria");
  XLSX.writeFile(wb, `ouvidoria_${unidadeAtual}.xls`);
}

// 🔹 Logout - retorna ao login
function logout() {
  if (!confirm("Deseja realmente sair?")) return;

  // Oculta todas as telas
  document.getElementById('app').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'none';

  // Mostra o modal de login
  document.getElementById('loginModal').style.display = 'flex';

  // Limpa campos e estado
  unidadeAtual = '';
  document.getElementById('senhaInput').value = '';
  document.getElementById('unidadeSelect').value = '';
  document.getElementById('mesReferencia').value = '';

  // Destrói gráficos abertos
  if (graficoPizza) graficoPizza.destroy();
  if (graficoBarra) graficoBarra.destroy();
  if (graficoComparativo) graficoComparativo.destroy();
  if (graficoEvolucao) graficoEvolucao.destroy();
}
