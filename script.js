// 1. Importações do Firebase (Versão Modular via CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, deleteField, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 2. Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDGUlf-k9RZysy06wIzgByPYQ56mC5N8hE",
  authDomain: "ouvidoria-sesau.firebaseapp.com",
  projectId: "ouvidoria-sesau",
  storageBucket: "ouvidoria-sesau.firebasestorage.app",
  messagingSenderId: "841726846829",
  appId: "1:841726846829:web:d472df350e00f4562e5c64",
  measurementId: "G-EFJV01Y6YV"
};

// 3. Inicialização
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Configurações de Negócio ---
const campos = [
  "total", "solucionadas", "identificadas", "anonimas", "sigilosas",
  "presencial", "formulario", "email", "app", "sei", "telefone",
  "eouv", "ouvidorsus", "denuncia", "reclamacao", "elogio",
  "solicitacao", "sugestao"
];

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

const credenciais = {
  "Hospital Regional Alto Sertão": "123", "Hospital Dr.Daniel Houly": "123", "Hemoal Arapiraca": "123", "Hemoal Maceió": "123",
  "Hospital Geral do Estado": "123", "Hospital da Mulher": "123", "Hospital do Coração": "123", "Hospital Metropolitano": "123",
  "Hospital Regional da Mata": "123", "Hospital da criança": "123", "Hospital Ib Gatto Falcão": "123", "Ouvidoria de Palmeira dos Indios": "123",
  "Ouvidoria de São José da Laje": "123", "Ouvidoria Arapiraca": "123", "Ouvidoria Atalaia": "123", "Ouvidoria de São Miguel dos Campos": "123",
  "Ouvidoria Teotônio Vilela": "123", "Ouvidoria União dos Palmares": "123", "Maceió": "123", "Paulo Jacinto": "123",
  "Boca da Mata": "123", "São José da Tapera": "123", "Dois Riachos": "123", "Inhapi": "123", "Coruripe": "123", "Admin": "admin123"
};

const municipios = {
  "Hospital Regional Alto Sertão": "Delmiro Gouveia",
  "Hospital Dr.Daniel Houly": "Arapiraca",
  "Hemoal Arapiraca": "Arapiraca",
  "Hemoal Maceió": "Maceió",
  "Hospital Geral do Estado": "Maceió",
  "Hospital da Mulher": "Maceió",
  "Hospital do Coração": "Maceió",
  "Hospital Metropolitano": "Maceió",
  "Hospital Regional da Mata": "União dos Palmares",
  "Hospital da criança": "Maceió",
  "Hospital Ib Gatto Falcão": "Rio Largo",
  "Ouvidoria de Palmeira dos Indios": "Palmeira dos Índios",
  "Ouvidoria de São José da Laje": "São José da Laje",
  "Ouvidoria Arapiraca": "Arapiraca",
  "Ouvidoria Atalaia": "Atalaia",
  "Ouvidoria de São Miguel dos Campos": "São Miguel dos Campos",
  "Ouvidoria Teotônio Vilela": "Teotônio Vilela",
  "Ouvidoria União dos Palmares": "União dos Palmares",
  "Maceió": "Maceió",
  "Paulo Jacinto": "Paulo Jacinto",
  "Boca da Mata": "Boca da Mata",
  "São José da Tapera": "São José da Tapera",
  "Dois Riachos": "Dois Riachos",
  "Inhapi": "Inhapi",
  "Coruripe": "Coruripe"
};

let unidadeAtual = '';
let graficoPizza = null, graficoBarra = null, graficoComparativo = null, graficoEvolucao = null;

/* --- INICIALIZAÇÃO DE INTERFACE --- */
function criarCampos() {
  const div = document.getElementById('formCampos');
  if (!div) return;
  div.innerHTML = '';
  campos.forEach(c => {
    const group = document.createElement('div');
    group.className = 'form-group';
    group.innerHTML = `<label for="${c}">${formatarNomeCampo(c)}</label>
                       <input type="number" id="${c}" min="0" placeholder="0">`;
    div.appendChild(group);
  });
}

function formatarNomeCampo(campo) {
  const nomes = { 'total': 'Total de Demandas', 'solucionadas': 'Demandas Solucionadas', 'identificadas': 'Identificadas', 'anonimas': 'Anônimas', 'sigilosas': 'Sigilosas', 'eouv': 'e-Ouv', 'ouvidorsus': 'OuvidorSUS' };
  return nomes[campo] || campo.charAt(0).toUpperCase() + campo.slice(1);
}

document.addEventListener('DOMContentLoaded', criarCampos);

/* --- AUTENTICAÇÃO --- */
window.fazerLogin = async function() {
  const unidade = document.getElementById('unidadeSelect').value;
  const senha = document.getElementById('senhaInput').value.trim();

  if (credenciais[unidade] === senha) {
    unidadeAtual = unidade;
    document.getElementById('loginScreen').style.display = 'none';
    if (unidade === "Admin") {
      document.getElementById('adminScreen').style.display = 'block';
      await window.gerarGraficosAdmin();
    } else {
      document.getElementById('unidadeScreen').style.display = 'block';
      document.getElementById('titulo-unidade').textContent = unidade;
      const mesInput = document.getElementById('mesReferencia');
      mesInput.addEventListener('change', window.preencherCamposExistentes);
      mesInput.value = new Date().toISOString().slice(0, 7);
      await window.preencherCamposExistentes();
    }
  } else { alert("Senha incorreta ou unidade inválida!"); }
};

window.logout = function() {
  if (confirm("Deseja realmente sair?")) {
    location.reload();
  }
};

/* --- DADOS DA UNIDADE (FIRESTORE) --- */
window.preencherCamposExistentes = async function() {
  const mes = document.getElementById('mesReferencia').value;
  if (!mes) return;

  try {
    const docSnap = await getDoc(doc(db, "dadosOuvidoria", unidadeAtual));
    if (docSnap.exists() && docSnap.data()[mes]) {
      const dados = docSnap.data()[mes];
      campos.forEach(c => document.getElementById(c).value = dados[c] || 0);
      gerarGraficosLocal(dados);
    } else {
      campos.forEach(c => document.getElementById(c).value = '');
      if (graficoPizza) graficoPizza.destroy();
      if (graficoBarra) graficoBarra.destroy();
    }
  } catch (e) { console.error("Erro ao buscar dados:", e); }
};

window.salvarDados = async function() {
  const mes = document.getElementById('mesReferencia').value;
  if (!mes) return alert("Selecione o mês!");

  const dados = {};
  campos.forEach(c => dados[c] = Number(document.getElementById(c).value) || 0);

  try {
    await setDoc(doc(db, "dadosOuvidoria", unidadeAtual), { [mes]: dados }, { merge: true });
    alert("Dados salvos com sucesso!");
    gerarGraficosLocal(dados);
  } catch (e) { console.error("Erro ao salvar:", e); }
};

window.limparDadosMes = async function() {
  const mes = document.getElementById('mesReferencia').value;
  if (!mes || !confirm(`Tem certeza que deseja apagar todos os dados de ${mes}?`)) return;

  try {
    await updateDoc(doc(db, "dadosOuvidoria", unidadeAtual), { [mes]: deleteField() });
    alert("Dados removidos!");
    location.reload();
  } catch (e) { console.error("Erro ao remover:", e); }
};

/* --- GRÁFICOS LOCAIS --- */
function gerarGraficosLocal(dados) {
  const ctxP = document.getElementById('graficoPizza');
  const ctxB = document.getElementById('graficoBarra');
  
  if (graficoPizza) graficoPizza.destroy();
  graficoPizza = new Chart(ctxP, {
    type: 'pie',
    data: {
      labels: campos.map(formatarNomeCampo),
      datasets: [{ data: campos.map(c => dados[c] || 0), backgroundColor: ['#007B8F', '#2CA58D', '#E8C547', '#E85F5C', '#B2B1CF', '#A267AC'] }]
    }
  });

  // Barra simples (Mês atual)
  if (graficoBarra) graficoBarra.destroy();
  graficoBarra = new Chart(ctxB, {
    type: 'bar',
    data: {
      labels: [formatarMes(document.getElementById('mesReferencia').value)],
      datasets: [{ label: 'Total', data: [dados.total || 0], backgroundColor: '#007B8F' }]
    }
  });
}

/* --- GESTÃO (FIRESTORE) --- */
window.abrirGestor = async function() {
  document.getElementById('unidadeScreen').style.display = 'none';
  document.getElementById('gestorScreen').style.display = 'block';
  document.getElementById('gestorUnidade').textContent = unidadeAtual;
  
  const container = document.getElementById('gestorPerguntas');
  container.innerHTML = '';
  perguntasGestao.forEach(p => {
    container.innerHTML += `
      <div class="checkbox-item" onclick="this.querySelector('input').click()">
        <input type="checkbox" id="${p.id}" onclick="event.stopPropagation()">
        <label for="${p.id}">${p.texto}</label>
      </div>`;
  });

  const mesGestao = document.getElementById('mesGestao');
  mesGestao.value = document.getElementById('mesReferencia').value || new Date().toISOString().slice(0, 7);
  mesGestao.onchange = window.carregarGestaoExistente;
  await window.carregarGestaoExistente();
};

window.carregarGestaoExistente = async function() {
  const mes = document.getElementById('mesGestao').value;
  if (!mes) return;

  const docSnap = await getDoc(doc(db, "dadosGestao", unidadeAtual));
  const dados = docSnap.exists() ? docSnap.data()[mes] : null;

  perguntasGestao.forEach(p => {
    const input = document.getElementById(p.id);
    if (input) input.checked = dados ? !!dados[p.id] : false;
  });
};

window.salvarGestao = async function() {
  const mes = document.getElementById('mesGestao').value;
  if (!mes) return alert("Selecione o mês!");

  const dados = {};
  perguntasGestao.forEach(p => dados[p.id] = document.getElementById(p.id).checked ? 1 : 0);
  
  try {
    await setDoc(doc(db, "dadosGestao", unidadeAtual), { [mes]: dados }, { merge: true });
    alert("Sessão de gestão salva!");
  } catch (e) { console.error(e); }
};

window.voltarParaUnidade = () => {
  document.getElementById('gestorScreen').style.display = 'none';
  document.getElementById('unidadeScreen').style.display = 'block';
};

/* --- ADMIN --- */
window.gerarGraficosAdmin = async function() {
  const snapOuv = await getDocs(collection(db, "dadosOuvidoria"));
  const dOuv = {};
  snapOuv.forEach(d => dOuv[d.id] = d.data());

  const unidades = Object.keys(dOuv);
  const ctxC = document.getElementById('graficoComparativo');
  
  if (graficoComparativo) graficoComparativo.destroy();
  graficoComparativo = new Chart(ctxC, {
    type: 'bar',
    data: {
      labels: unidades,
      datasets: [{ 
        label: 'Total Acumulado', 
        data: unidades.map(u => Object.values(dOuv[u]).reduce((acc, m) => acc + (m.total || 0), 0)),
        backgroundColor: '#007B8F'
      }]
    },
    options: { indexAxis: 'y' }
  });

  await renderizarTabelaAdmin();
};

async function renderizarTabelaAdmin() {
  const [snapOuv, snapGes] = await Promise.all([
    getDocs(collection(db, "dadosOuvidoria")),
    getDocs(collection(db, "dadosGestao"))
  ]);

  const dOuv = {}; snapOuv.forEach(d => dOuv[d.id] = d.data());
  const dGes = {}; snapGes.forEach(d => dGes[d.id] = d.data());

  const container = document.getElementById('unidadesDocs');
  let html = `
    <div class="admin-table-wrapper">
      <table class="admin-table">
        <thead>
          <tr><th>Unidade</th><th>Mês</th><th>Total</th><th>Status Gestão</th></tr>
        </thead>
        <tbody>`;

  Object.keys(dOuv).forEach(u => {
    Object.keys(dOuv[u]).forEach(m => {
      const temGestao = (dGes[u] && dGes[u][m]) ? '<span class="badge-sim">Preenchido</span>' : '<span class="badge-nao">Pendente</span>';
      html += `<tr><td>${u}</td><td>${formatarMes(m)}</td><td>${dOuv[u][m].total}</td><td>${temGestao}</td></tr>`;
    });
  });

  html += '</tbody></table></div>';
  container.innerHTML = html;
}

/* --- EXPORTAÇÃO CONSOLIDADA (OUVIDORIA + GESTÃO) --- */
window.exportarGeral = async function() {
  try {
    const [snapOuv, snapGes] = await Promise.all([
      getDocs(collection(db, "dadosOuvidoria")),
      getDocs(collection(db, "dadosGestao"))
    ]);

    const dGes = {};
    snapGes.forEach(d => dGes[d.id] = d.data());

    const linhas = [];
    snapOuv.forEach(docOuv => {
      const unidade = docOuv.id;
      const mesesOuv = docOuv.data();

      Object.keys(mesesOuv).forEach(mes => {
        const dadosOuv = mesesOuv[mes];
        const dadosGes = (dGes[unidade] && dGes[unidade][mes]) ? dGes[unidade][mes] : {};

        const linha = {
          'Unidade': unidade,
          'Unidade da Federação e Município': municipios[unidade] || "",
          'Mês': mes,
          ...dadosOuv
        };

        perguntasGestao.forEach(p => {
          const val = dadosGes[p.id];
          linha[p.texto] = val === 1 ? "Sim" : (val === 0 ? "Não" : "N/D");
        });
        linhas.push(linha);
      });
    });

    if (linhas.length === 0) return alert("Sem dados.");
    
    const ws = XLSX.utils.json_to_sheet(linhas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Geral");
    XLSX.writeFile(wb, `Ouvidoria_Gestao_Consolidado.xlsx`);
  } catch (e) { console.error(e); }
};

window.exportarXLS = async function() {
  if (!unidadeAtual) return;
  const [docOuv, docGes] = await Promise.all([
    getDoc(doc(db, "dadosOuvidoria", unidadeAtual)),
    getDoc(doc(db, "dadosGestao", unidadeAtual))
  ]);

  const dOuv = docOuv.exists() ? docOuv.data() : {};
  const dGes = docGes.exists() ? docGes.data() : {};
  const linhas = Object.keys(dOuv).map(mes => {
    const l = {
      Unidade: unidadeAtual,
      "Unidade da Federação e Município": municipios[unidadeAtual] || "",
      Mês: mes,
      ...dOuv[mes]
    };
    perguntasGestao.forEach(p => {
      const v = (dGes[mes] && dGes[mes][p.id]);
      l[p.texto] = v === 1 ? "Sim" : (v === 0 ? "Não" : "N/D");
    });
    return l;
  });

  const ws = XLSX.utils.json_to_sheet(linhas);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Unidade");
  XLSX.writeFile(wb, `Relatorio_${unidadeAtual}.xlsx`);
};

window.exportarGestaoXLS = async function() {
  if (!unidadeAtual) return;
  const docGes = await getDoc(doc(db, "dadosGestao", unidadeAtual));
  const dGes = docGes.exists() ? docGes.data() : {};

  const linhas = Object.keys(dGes).map(mes => {
    const l = {
      Unidade: unidadeAtual,
      "Unidade da Federação e Município": municipios[unidadeAtual] || "",
      Mês: mes
    };
    perguntasGestao.forEach(p => {
      const v = dGes[mes][p.id];
      l[p.texto] = v === 1 ? "Sim" : (v === 0 ? "Não" : "N/D");
    });
    return l;
  });

  if (linhas.length === 0) return alert("Sem dados de gestão para exportar.");

  const ws = XLSX.utils.json_to_sheet(linhas);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Gestão");
  XLSX.writeFile(wb, `Gestao_${unidadeAtual}.xlsx`);
};

function formatarMes(mes) {
  if(!mes) return "";
  const [ano, mesNum] = mes.split('-');
  const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return `${meses[parseInt(mesNum) - 1]}/${ano}`;
}