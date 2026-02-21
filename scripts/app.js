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

  const calculateFilamentBreakdown = (totalGrams, baseFilamentCost) => {
    const insuranceRate = getInsuranceRate(totalGrams);
    const insuranceAmount = baseFilamentCost * insuranceRate;
    const totalFilamentCost = baseFilamentCost + insuranceAmount;

    return { baseFilamentCost, insuranceAmount, totalFilamentCost };
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

    const spoolGramsLabel = document.createElement("label");
    spoolGramsLabel.textContent = "Grams used in piece";

    const spoolGramsInput = document.createElement("input");
    spoolGramsInput.type = "number";
    spoolGramsInput.className = "spool-grams-input";
    spoolGramsInput.placeholder = "0";
    spoolGramsInput.step = "0.01";

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

    spoolRow.append(
      spoolNameLabel,
      spoolNameInput,
      spoolCostLabel,
      spoolCostInput,
      spoolGramsLabel,
      spoolGramsInput,
      spoolPriceLine,
      removeButton,
    );
    spoolRowsEl.appendChild(spoolRow);
  };

  const getSpoolTotals = () => {
    if (!spoolRowsEl) {
      return { totalGrams: 0, baseFilamentCost: 0 };
    }

    const spoolRows = Array.from(spoolRowsEl.querySelectorAll(".spool-row"));
    const totals = spoolRows.reduce(
      (accumulator, spoolRow) => {
        const spoolCostInput = spoolRow.querySelector(".spool-cost-input");
        const spoolGramsInput = spoolRow.querySelector(".spool-grams-input");
        const spoolCost = parseNumericValue(spoolCostInput?.value ?? "");
        const spoolGrams = parseNumericValue(spoolGramsInput?.value ?? "");
        const pricePerGram = spoolCost / 1000;

        return {
          totalGrams: accumulator.totalGrams + spoolGrams,
          baseFilamentCost: accumulator.baseFilamentCost + spoolGrams * pricePerGram,
        };
      },
      { totalGrams: 0, baseFilamentCost: 0 },
    );

    return totals;
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

      const { totalGrams, baseFilamentCost } = getSpoolTotals();
      const { insuranceAmount, totalFilamentCost } = calculateFilamentBreakdown(totalGrams, baseFilamentCost);

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
