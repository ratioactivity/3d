window.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("calculator-form");
  var incomeInput = document.getElementById("income");
  var housingInput = document.getElementById("housing");
  var utilitiesInput = document.getElementById("utilities");
  var foodInput = document.getElementById("food");
  var totalExpensesEl = document.getElementById("total-expenses");
  var remainingBalanceEl = document.getElementById("remaining-balance");
  var totalOutputEl = document.getElementById("total-output");
  var baseFilamentCostEl = document.getElementById("base-filament-cost");
  var insuranceAmountEl = document.getElementById("insurance-amount");
  var totalFilamentCostEl = document.getElementById("total-filament-cost");

  var spoolRowsEl = document.getElementById("spool-rows");
  var addSpoolButton = document.getElementById("add-spool-button");

  var parseNumericValue = function (value) {
    var parsedValue = parseFloat(value);
    if (isFinite(parsedValue)) {
      return parsedValue;
    }

    return 0;
  };

  var formatCurrency = function (value) {
    return "$" + value.toFixed(2);
  };

  var getInsuranceRate = function (grams) {
    var safeGrams = Math.max(0, grams);
    var tenGramBracket = Math.ceil(safeGrams / 10);
    var boundedBracket = Math.max(1, Math.min(10, tenGramBracket));

    return boundedBracket * 0.05;
  };

  var calculateFilamentBreakdown = function (totalGrams, baseFilamentCost) {
    var insuranceRate = getInsuranceRate(totalGrams);
    var insuranceAmount = baseFilamentCost * insuranceRate;
    var totalFilamentCost = baseFilamentCost + insuranceAmount;

    return {
      baseFilamentCost: baseFilamentCost,
      insuranceAmount: insuranceAmount,
      totalFilamentCost: totalFilamentCost
    };
  };

  var removeLegacyFilamentCostSection = function () {
    var sections = document.querySelectorAll("section");
    for (var i = 0; i < sections.length; i += 1) {
      var heading = sections[i].querySelector("h2");
      if (heading && heading.textContent && heading.textContent.trim() === "Filament Cost Inputs") {
        if (sections[i].parentNode) {
          sections[i].parentNode.removeChild(sections[i]);
        }
      }
    }
  };

  var updateSpoolRowPrice = function (spoolRow) {
    var spoolCostInput = spoolRow.querySelector(".spool-cost-input");
    var spoolPriceOutput = spoolRow.querySelector(".spool-price-output");
    var spoolCostValue = spoolCostInput ? spoolCostInput.value : "";
    var spoolCost = parseNumericValue(spoolCostValue);
    var pricePerGram = spoolCost / 1000;

    if (spoolPriceOutput) {
      spoolPriceOutput.textContent = "$" + pricePerGram.toFixed(4) + "/g";
    }
  };

  var createSpoolRow = function () {
    if (!spoolRowsEl) {
      return;
    }

    var spoolRow = document.createElement("div");
    spoolRow.className = "spool-row";

    var spoolNameLabel = document.createElement("label");
    spoolNameLabel.textContent = "Spool name/color (optional)";

    var spoolNameInput = document.createElement("input");
    spoolNameInput.type = "text";
    spoolNameInput.className = "spool-name-input";
    spoolNameInput.placeholder = "e.g. Red PLA";

    var spoolCostLabel = document.createElement("label");
    spoolCostLabel.textContent = "Spool cost";

    var spoolCostInput = document.createElement("input");
    spoolCostInput.type = "number";
    spoolCostInput.className = "spool-cost-input";
    spoolCostInput.placeholder = "0";

    var spoolGramsLabel = document.createElement("label");
    spoolGramsLabel.textContent = "Grams used in piece";

    var spoolGramsInput = document.createElement("input");
    spoolGramsInput.type = "number";
    spoolGramsInput.className = "spool-grams-input";
    spoolGramsInput.placeholder = "0";
    spoolGramsInput.step = "0.01";

    var spoolPriceLine = document.createElement("p");
    spoolPriceLine.textContent = "Price per gram: ";

    var spoolPriceOutput = document.createElement("span");
    spoolPriceOutput.className = "spool-price-output";
    spoolPriceOutput.textContent = "$0.0000/g";
    spoolPriceLine.appendChild(spoolPriceOutput);

    var removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "remove-spool-button";
    removeButton.textContent = "Remove";

    spoolCostInput.addEventListener("input", function () {
      updateSpoolRowPrice(spoolRow);
    });

    removeButton.addEventListener("click", function () {
      if (spoolRow.parentNode) {
        spoolRow.parentNode.removeChild(spoolRow);
      }
    });

    spoolRow.appendChild(spoolNameLabel);
    spoolRow.appendChild(spoolNameInput);
    spoolRow.appendChild(spoolCostLabel);
    spoolRow.appendChild(spoolCostInput);
    spoolRow.appendChild(spoolGramsLabel);
    spoolRow.appendChild(spoolGramsInput);
    spoolRow.appendChild(spoolPriceLine);
    spoolRow.appendChild(removeButton);

    spoolRowsEl.appendChild(spoolRow);
  };

  var getSpoolTotals = function () {
    if (!spoolRowsEl) {
      return { totalGrams: 0, baseFilamentCost: 0 };
    }

    var spoolRows = spoolRowsEl.querySelectorAll(".spool-row");
    var totalGrams = 0;
    var baseFilamentCost = 0;

    for (var i = 0; i < spoolRows.length; i += 1) {
      var spoolCostInput = spoolRows[i].querySelector(".spool-cost-input");
      var spoolGramsInput = spoolRows[i].querySelector(".spool-grams-input");

      var spoolCost = parseNumericValue(spoolCostInput ? spoolCostInput.value : "");
      var spoolGrams = parseNumericValue(spoolGramsInput ? spoolGramsInput.value : "");
      var pricePerGram = spoolCost / 1000;

      totalGrams += spoolGrams;
      baseFilamentCost += spoolGrams * pricePerGram;
    }

    return { totalGrams: totalGrams, baseFilamentCost: baseFilamentCost };
  };

  removeLegacyFilamentCostSection();

  if (addSpoolButton) {
    addSpoolButton.addEventListener("click", function () {
      createSpoolRow();
    });
  }

  if (spoolRowsEl && spoolRowsEl.children.length === 0) {
    createSpoolRow();
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var income = parseNumericValue(incomeInput ? incomeInput.value : "");
      var housing = parseNumericValue(housingInput ? housingInput.value : "");
      var utilities = parseNumericValue(utilitiesInput ? utilitiesInput.value : "");
      var food = parseNumericValue(foodInput ? foodInput.value : "");

      var totalExpenses = housing + utilities + food;
      var remainingBalance = income - totalExpenses;

      var spoolTotals = getSpoolTotals();
      var filamentBreakdown = calculateFilamentBreakdown(spoolTotals.totalGrams, spoolTotals.baseFilamentCost);

      if (totalExpensesEl) {
        totalExpensesEl.textContent = formatCurrency(totalExpenses);
      }

      if (remainingBalanceEl) {
        remainingBalanceEl.textContent = formatCurrency(remainingBalance);
      }

      if (baseFilamentCostEl) {
        baseFilamentCostEl.textContent = formatCurrency(filamentBreakdown.baseFilamentCost);
      }

      if (insuranceAmountEl) {
        insuranceAmountEl.textContent = formatCurrency(filamentBreakdown.insuranceAmount);
      }

      if (totalFilamentCostEl) {
        totalFilamentCostEl.textContent = formatCurrency(filamentBreakdown.totalFilamentCost);
      }

      if (totalOutputEl) {
        totalOutputEl.textContent = formatCurrency(remainingBalance + filamentBreakdown.totalFilamentCost);
      }
    });
  }

  console.log("✅ script validated");
});
