// Teste simples para confirmar que o JS foi carregado.
console.log("JavaScript carregado com sucesso.");

// Referencias dos elementos principais da busca e do historico.
const searchInput = document.getElementById("search-input");
const historyContainer = document.getElementById("history-container");
const historyList = document.getElementById("history-list");

// Dados de teste para simular buscas salvas (Sprint 6 vai evoluir isso).
const savedSearches = ["java", "joao", "python"];

// Monta a lista visual do historico no container.
function renderHistory() {
  historyList.innerHTML = "";

  savedSearches.forEach((term) => {
    const item = document.createElement("li");
    item.textContent = term;
    historyList.appendChild(item);
  });
}

// Regra de exibicao: so mostrar no foco do input e quando houver historico.
function showHistoryIfAllowed() {
  if (savedSearches.length > 0) {
    historyContainer.classList.remove("hidden");
  }
}

// Esconde o historico quando clicar fora da area de busca.
function hideHistory() {
  historyContainer.classList.add("hidden");
}

renderHistory();

searchInput.addEventListener("focus", showHistoryIfAllowed);

document.addEventListener("click", (event) => {
  const clickedInsideSearch = event.target.closest(".search-section");

  if (!clickedInsideSearch) {
    hideHistory();
  }
});
