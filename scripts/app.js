window.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("calculator-form");
  const incomeInput = document.getElementById("income");
  const housingInput = document.getElementById("housing");
  const utilitiesInput = document.getElementById("utilities");
  const foodInput = document.getElementById("food");
  const totalExpensesEl = document.getElementById("total-expenses");
  const remainingBalanceEl = document.getElementById("remaining-balance");
  const totalOutputEl = document.getElementById("total-output");

  const spoolRowsEl = document.getElementById("spool-rows");
  const addSpoolButton = document.getElementById("add-spool-button");

  const parseNumericValue = (value) => {
    const parsedValue = Number.parseFloat(value);
    if (Number.isFinite(parsedValue)) {
      return parsedValue;
    }

    return 0;
  };

  const updateSpoolRowPrice = (spoolRow) => {
    const spoolCostInput = spoolRow.querySelector(".spool-cost-input");
    const spoolPriceOutput = spoolRow.querySelector(".spool-price-output");
    const spoolCost = parseNumericValue(spoolCostInput?.value ?? "");
    const pricePerGram = spoolCost / 1000;

    if (spoolPriceOutput) {
      spoolPriceOutput.textContent = `$${pricePerGram.toFixed(4)}/g`;
    }
  };

  const createSpoolRow = () => {
    if (!spoolRowsEl) {
      return;
    }

    const spoolRow = document.createElement("div");
    spoolRow.className = "spool-row";

    const spoolNameLabel = document.createElement("label");
    spoolNameLabel.textContent = "Spool name/color (optional)";

    const spoolNameInput = document.createElement("input");
    spoolNameInput.type = "text";
    spoolNameInput.className = "spool-name-input";
    spoolNameInput.placeholder = "e.g. Red PLA";

    const spoolCostLabel = document.createElement("label");
    spoolCostLabel.textContent = "Spool cost";

    const spoolCostInput = document.createElement("input");
    spoolCostInput.type = "number";
    spoolCostInput.className = "spool-cost-input";
    spoolCostInput.placeholder = "0";

    const spoolPriceLine = document.createElement("p");
    spoolPriceLine.textContent = "Price per gram: ";

    const spoolPriceOutput = document.createElement("span");
    spoolPriceOutput.className = "spool-price-output";
    spoolPriceOutput.textContent = "$0.0000/g";
    spoolPriceLine.appendChild(spoolPriceOutput);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "remove-spool-button";
    removeButton.textContent = "Remove";

    spoolCostInput.addEventListener("input", () => {
      updateSpoolRowPrice(spoolRow);
    });

    removeButton.addEventListener("click", () => {
      spoolRow.remove();
    });

    spoolRow.append(spoolNameLabel, spoolNameInput, spoolCostLabel, spoolCostInput, spoolPriceLine, removeButton);
    spoolRowsEl.appendChild(spoolRow);
  };

  if (addSpoolButton) {
    addSpoolButton.addEventListener("click", () => {
      createSpoolRow();
    });
  }

  if (spoolRowsEl && spoolRowsEl.children.length === 0) {
    createSpoolRow();
  }

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const income = parseNumericValue(incomeInput?.value ?? "");
      const housing = parseNumericValue(housingInput?.value ?? "");
      const utilities = parseNumericValue(utilitiesInput?.value ?? "");
      const food = parseNumericValue(foodInput?.value ?? "");

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
