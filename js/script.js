// Teste simples para confirmar que o JS foi carregado na pagina.
console.log("JavaScript carregado com sucesso.");

// Referencias dos elementos principais da interface.
const searchForm = document.querySelector(".search-form");
const searchInput = document.getElementById("search-input");
const historyContainer = document.getElementById("history-container");
const historyList = document.getElementById("history-list");

// Dados de teste para simular buscas salvas (Sprint 6 vai evoluir isso).
const savedSearches = ["java", "joao", "python"];

// Monta visualmente a lista de historico no container.
function renderHistory() {
  historyList.innerHTML = "";

  savedSearches.forEach((term) => {
    const item = document.createElement("li");
    item.textContent = term;
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

// Captura a tentativa de busca (botao Buscar ou tecla Enter).
searchForm.addEventListener("submit", async (event) => {
  // Impede reload da pagina causado pelo comportamento padrao do form.
  event.preventDefault();

  // Le o valor digitado e remove espacos extras no inicio/fim.
  const searchTerm = searchInput.value.trim();

  // Valida campo vazio: interrompe fluxo e nao executa busca.
  if (!searchTerm) {
    console.warn("Busca vazia. Digite um termo antes de buscar.");
    return;
  }

  try {
    // Chama a API com o termo digitado e recebe usuarios encontrados.
    const users = await searchUsers(searchTerm);

    // Nesta sprint, apenas valida no console os usuarios retornados.
    console.log(users);
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

// Controle global para esconder historico ao clicar fora da busca.
document.addEventListener("click", (event) => {
  const clickedInsideSearch = event.target.closest(".search-section");

  if (!clickedInsideSearch) {
    hideHistory();
  }
});
