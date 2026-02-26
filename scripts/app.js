window.addEventListener("DOMContentLoaded", function () {
  var spoolRowsEl = document.getElementById("spool-rows");
  var addSpoolButton = document.getElementById("add-spool-button");

  var parseNumericValue = function (value) {
    var parsedValue = parseFloat(value);
    if (isFinite(parsedValue)) {
      return parsedValue;
    }

    return 0;
  };

  var updateSpoolRowPrice = function (spoolRow) {
    var spoolCostInput = spoolRow.querySelector(".spool-cost-input");
    var spoolPriceOutput = spoolRow.querySelector(".spool-price-output");
    var spoolCost = parseNumericValue(spoolCostInput ? spoolCostInput.value : "");
    var pricePerGram = spoolCost / 1000;

    if (spoolPriceOutput) {
      spoolPriceOutput.textContent = "$" + pricePerGram.toFixed(4) + "/g";
    }

    refreshSpoolSelection();
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
    refreshSpoolSelection();
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

  console.log("✅ script validated");
});
