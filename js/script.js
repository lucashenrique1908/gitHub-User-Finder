// Teste simples para confirmar que o JS foi carregado na pagina.
console.log("JavaScript carregado com sucesso.");

// Referencias dos elementos principais da interface.
const searchForm = document.querySelector(".search-form");
const searchInput = document.getElementById("search-input");
const historyContainer = document.getElementById("history-container");
const historyList = document.getElementById("history-list");
const resultsContainer = document.getElementById("results-container");

// Configuracoes do historico salvo no navegador.
const HISTORY_STORAGE_KEY = "github-user-finder-history";
const MAX_HISTORY_ITEMS = 5;

// Carrega historico salvo no localStorage (ou inicia vazio).
function loadSavedSearches() {
  try {
    const rawHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    const parsedHistory = JSON.parse(rawHistory || "[]");

    return Array.isArray(parsedHistory) ? parsedHistory : [];
  } catch (error) {
    console.error("Erro ao carregar historico salvo:", error);
    return [];
  }
}

// Estado em memoria do historico, sincronizado com localStorage.
const savedSearches = loadSavedSearches();

// Persiste o historico atual no navegador.
function persistHistory() {
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(savedSearches));
}

// Adiciona uma nova busca, remove duplicados e limita para ultimas 5.
function addSearchToHistory(term) {
  const normalizedTerm = term.toLowerCase();
  const existingIndex = savedSearches.findIndex(
    (item) => item.toLowerCase() === normalizedTerm
  );

  // Se ja existe no historico, remove para recolocar no topo.
  if (existingIndex !== -1) {
    savedSearches.splice(existingIndex, 1);
  }

  // Insere a busca mais recente no inicio da lista.
  savedSearches.unshift(term);

  // Mantem apenas as ultimas N buscas definidas.
  if (savedSearches.length > MAX_HISTORY_ITEMS) {
    savedSearches.length = MAX_HISTORY_ITEMS;
  }

  persistHistory();
}

// Monta visualmente a lista de historico no container.
function renderHistory() {
  historyList.innerHTML = "";

  savedSearches.forEach((term) => {
    const item = document.createElement("li");
    item.textContent = term;
    item.dataset.term = term;
    historyList.appendChild(item);
  });
}

// Mostra historico apenas se existir conteudo salvo.
function showHistoryIfAllowed() {
  if (savedSearches.length > 0) {
    historyContainer.classList.remove("hidden");
  }
}

// Esconde historico quando clicar fora da area de busca.
function hideHistory() {
  historyContainer.classList.add("hidden");
}

// Executa o fluxo completo de busca para reutilizar no submit e no clique do historico.
async function executeSearch(term) {
  // Valida campo vazio: interrompe fluxo e nao executa busca.
  if (!term) {
    console.warn("Busca vazia. Digite um termo antes de buscar.");
    return;
  }

  // Salva a busca, atualiza historico visual e mostra container quando permitido.
  addSearchToHistory(term);
  renderHistory();
  showHistoryIfAllowed();

  // Chama a API com o termo digitado e recebe usuarios encontrados.
  const users = await searchUsers(term);

  // Mostra retorno no console para validar antes de evoluir UI.
  console.log(users);

  // Exibe cards dinamicos na tela com os usuarios da busca.
  renderUsers(users);
}

// Funcao de busca: recebe termo, consulta API e retorna lista limitada de usuarios.
async function searchUsers(term) {
  // Monta URL com encode para evitar problemas com espacos/caracteres especiais.
  const url = `https://api.github.com/search/users?q=${encodeURIComponent(term)}`;

  // Faz requisicao HTTP para o endpoint oficial de busca de usuarios do GitHub.
  const response = await fetch(url);

  // Se a API responder erro HTTP, interrompe com mensagem clara.
  if (!response.ok) {
    throw new Error(`Falha na API GitHub: ${response.status}`);
  }

  // Converte resposta JSON em objeto JavaScript.
  const data = await response.json();

  // Extrai apenas a lista de usuarios e limita para no maximo 8 resultados.
  const users = (data.items || []).slice(0, 8);
  return users;
}

// Renderiza a lista de usuarios no container de resultados.
function renderUsers(users) {
  // Limpa resultados antigos antes de inserir novos cards.
  resultsContainer.innerHTML = "";

  // Se nao houver usuarios, mostra um aviso simples.
  if (users.length === 0) {
    resultsContainer.innerHTML = "<p>Nenhum usuario encontrado.</p>";
    return;
  }

  // Cria um card para cada usuario retornado pela API.
  users.forEach((user) => {
    const card = document.createElement("article");
    card.className = "user-card";

    // Campos usados: avatar, username (login) e link do perfil.
    card.innerHTML = `
      <img src="${user.avatar_url}" alt="Avatar de ${user.login}">
      <div>
        <h3>${user.login}</h3>
        <a href="${user.html_url}" target="_blank" rel="noopener noreferrer">Ver perfil</a>
      </div>
    `;

    // Insere card no container principal de resultados.
    resultsContainer.appendChild(card);
  });
}

// Captura a tentativa de busca (botao Buscar ou tecla Enter).
searchForm.addEventListener("submit", async (event) => {
  // Impede reload da pagina causado pelo comportamento padrao do form.
  event.preventDefault();

  // Le o valor digitado e remove espacos extras no inicio/fim.
  const searchTerm = searchInput.value.trim();

  try {
    // Dispara o fluxo completo de busca.
    await executeSearch(searchTerm);
  } catch (error) {
    // Log de erro para facilitar debug durante desenvolvimento.
    console.error("Erro ao buscar usuarios:", error);
  } finally {
    // Limpa o input apos clicar em Buscar ou pressionar Enter.
    searchInput.value = "";
  }
});

// Render inicial do historico.
renderHistory();

// Exibe historico ao focar no input de busca.
searchInput.addEventListener("focus", showHistoryIfAllowed);

// Permite clicar em um item do historico para pesquisar novamente.
historyList.addEventListener("click", async (event) => {
  const clickedItem = event.target.closest("li");

  if (!clickedItem) {
    return;
  }

  const selectedTerm = clickedItem.dataset.term || clickedItem.textContent.trim();

  try {
    await executeSearch(selectedTerm);
    searchInput.value = "";
    hideHistory();
  } catch (error) {
    console.error("Erro ao pesquisar termo do historico:", error);
  }
});

// Controle global para esconder historico ao clicar fora da busca.
document.addEventListener("click", (event) => {
  const clickedInsideSearch = event.target.closest(".search-section");

  if (!clickedInsideSearch) {
    hideHistory();
  }
});
