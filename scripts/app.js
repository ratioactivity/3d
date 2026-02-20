window.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("calculator-form");
  const incomeInput = document.getElementById("income");
  const housingInput = document.getElementById("housing");
  const utilitiesInput = document.getElementById("utilities");
  const foodInput = document.getElementById("food");
  const totalExpensesEl = document.getElementById("total-expenses");
  const remainingBalanceEl = document.getElementById("remaining-balance");
  const totalOutputEl = document.getElementById("total-output");

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const income = Number(incomeInput?.value || 0);
      const housing = Number(housingInput?.value || 0);
      const utilities = Number(utilitiesInput?.value || 0);
      const food = Number(foodInput?.value || 0);

      const totalExpenses = housing + utilities + food;
      const remainingBalance = income - totalExpenses;

      if (totalExpensesEl) {
        totalExpensesEl.textContent = `$${totalExpenses.toFixed(2)}`;
      }

      if (remainingBalanceEl) {
        remainingBalanceEl.textContent = `$${remainingBalance.toFixed(2)}`;
      }

      if (totalOutputEl) {
        totalOutputEl.textContent = `$${remainingBalance.toFixed(2)}`;
      }
    });
  }

  console.log("✅ script validated");
});
