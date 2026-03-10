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

// Captura a tentativa de busca (botao Buscar ou tecla Enter).
searchForm.addEventListener("submit", (event) => {
  // Impede reload da pagina causado pelo comportamento padrao do form.
  event.preventDefault();

  // Le o valor digitado e remove espacos extras no inicio/fim.
  const searchTerm = searchInput.value.trim();

  // Valida campo vazio: interrompe fluxo e nao executa busca.
  if (!searchTerm) {
    console.warn("Busca vazia. Digite um termo antes de buscar.");
    return;
  }

  // Nesta sprint, apenas confirma no console que a captura funcionou.
  console.log(`search: ${searchTerm}`);

  
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
