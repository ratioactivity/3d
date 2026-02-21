window.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("calculator-form");
  const incomeInput = document.getElementById("income");
  const housingInput = document.getElementById("housing");
  const utilitiesInput = document.getElementById("utilities");
  const foodInput = document.getElementById("food");
  const totalExpensesEl = document.getElementById("total-expenses");
  const remainingBalanceEl = document.getElementById("remaining-balance");
  const totalOutputEl = document.getElementById("total-output");
  const baseFilamentCostEl = document.getElementById("base-filament-cost");
  const insuranceAmountEl = document.getElementById("insurance-amount");
  const totalFilamentCostEl = document.getElementById("total-filament-cost");

  const spoolRowsEl = document.getElementById("spool-rows");
  const addSpoolButton = document.getElementById("add-spool-button");
  const spoolSelectionEl = document.getElementById("spool-selection");
  const pricePerGramInput = document.getElementById("price-per-gram");
  const filamentGramsInput = document.getElementById("filament-grams");

  const parseNumericValue = (value) => {
    const parsedValue = Number.parseFloat(value);
    if (Number.isFinite(parsedValue)) {
      return parsedValue;
    }

    return 0;
  };

  const formatCurrency = (value) => {
    return `$${value.toFixed(2)}`;
  };

  const getInsuranceRate = (grams) => {
    const safeGrams = Math.max(0, grams);
    const tenGramBracket = Math.ceil(safeGrams / 10);
    const boundedBracket = Math.max(1, Math.min(10, tenGramBracket));

    return boundedBracket * 0.05;
  };

  const calculateFilamentBreakdown = (grams, pricePerGram) => {
    const insuranceRate = getInsuranceRate(grams);
    const baseFilamentCost = grams * pricePerGram;
    const insuranceAmount = baseFilamentCost * insuranceRate;
    const totalFilamentCost = baseFilamentCost + insuranceAmount;

    return { baseFilamentCost, insuranceAmount, totalFilamentCost };
  };

  const getSpoolData = (spoolRow) => {
    const spoolNameInput = spoolRow.querySelector(".spool-name-input");
    const spoolCostInput = spoolRow.querySelector(".spool-cost-input");
    const spoolName = spoolNameInput?.value.trim() || "Unnamed spool";
    const spoolCost = parseNumericValue(spoolCostInput?.value ?? "");
    const pricePerGram = spoolCost / 1000;

    return { spoolName, pricePerGram };
  };

  const refreshSpoolSelection = () => {
    if (!spoolSelectionEl || !spoolRowsEl) {
      return;
    }

    const previousValue = spoolSelectionEl.value;
    spoolSelectionEl.innerHTML = "";

    const manualOption = document.createElement("option");
    manualOption.value = "";
    manualOption.textContent = "Manual entry";
    spoolSelectionEl.appendChild(manualOption);

    const spoolRows = Array.from(spoolRowsEl.querySelectorAll(".spool-row"));
    spoolRows.forEach((spoolRow, index) => {
      const { spoolName, pricePerGram } = getSpoolData(spoolRow);
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = `${spoolName} (${pricePerGram.toFixed(4)}/g)`;
      spoolSelectionEl.appendChild(option);
    });

    if (previousValue && spoolSelectionEl.querySelector(`option[value="${previousValue}"]`)) {
      spoolSelectionEl.value = previousValue;
    } else {
      spoolSelectionEl.value = "";
    }

    spoolSelectionEl.dispatchEvent(new Event("change"));
  };

  const updateSpoolRowPrice = (spoolRow) => {
    const spoolCostInput = spoolRow.querySelector(".spool-cost-input");
    const spoolPriceOutput = spoolRow.querySelector(".spool-price-output");
    const spoolCost = parseNumericValue(spoolCostInput?.value ?? "");
    const pricePerGram = spoolCost / 1000;

    if (spoolPriceOutput) {
      spoolPriceOutput.textContent = `$${pricePerGram.toFixed(4)}/g`;
    }

    refreshSpoolSelection();
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

    spoolNameInput.addEventListener("input", () => {
      refreshSpoolSelection();
    });

    removeButton.addEventListener("click", () => {
      spoolRow.remove();
      refreshSpoolSelection();
    });

    spoolRow.append(spoolNameLabel, spoolNameInput, spoolCostLabel, spoolCostInput, spoolPriceLine, removeButton);
    spoolRowsEl.appendChild(spoolRow);
    refreshSpoolSelection();
  };

  if (spoolSelectionEl && pricePerGramInput) {
    spoolSelectionEl.addEventListener("change", () => {
      const selectedIndex = parseNumericValue(spoolSelectionEl.value);
      const hasSelection = spoolSelectionEl.value !== "";

      if (!hasSelection || !spoolRowsEl) {
        pricePerGramInput.readOnly = false;
        return;
      }

      const spoolRows = Array.from(spoolRowsEl.querySelectorAll(".spool-row"));
      const selectedSpool = spoolRows.at(selectedIndex);

      if (selectedSpool) {
        const { pricePerGram } = getSpoolData(selectedSpool);
        pricePerGramInput.value = pricePerGram.toFixed(4);
        pricePerGramInput.readOnly = true;
      }
    });
  }

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
      const grams = parseNumericValue(filamentGramsInput?.value ?? "");
      const pricePerGram = parseNumericValue(pricePerGramInput?.value ?? "");

      const totalExpenses = housing + utilities + food;
      const remainingBalance = income - totalExpenses;

      const { baseFilamentCost, insuranceAmount, totalFilamentCost } = calculateFilamentBreakdown(grams, pricePerGram);

      if (totalExpensesEl) {
        totalExpensesEl.textContent = formatCurrency(totalExpenses);
      }

      if (remainingBalanceEl) {
        remainingBalanceEl.textContent = formatCurrency(remainingBalance);
      }

      if (baseFilamentCostEl) {
        baseFilamentCostEl.textContent = formatCurrency(baseFilamentCost);
      }

      if (insuranceAmountEl) {
        insuranceAmountEl.textContent = formatCurrency(insuranceAmount);
      }

      if (totalFilamentCostEl) {
        totalFilamentCostEl.textContent = formatCurrency(totalFilamentCost);
      }

      if (totalOutputEl) {
        totalOutputEl.textContent = formatCurrency(remainingBalance + totalFilamentCost);
      }
    });
  }

  console.log("✅ script validated");
});
