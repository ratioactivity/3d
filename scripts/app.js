window.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("calculator-form");
  var spoolRowsEl = document.getElementById("spool-rows");
  var addSpoolButton = document.getElementById("add-spool-button");

  var printingHoursInput = document.getElementById("printing-hours");
  var hoursCostInput = document.getElementById("hours-cost");
  var additionalLaborInput = document.getElementById("additional-labor");
  var customsEnabledInput = document.getElementById("customs-enabled");
  var customsEstimateInput = document.getElementById("customs-estimate");
  var roundingRuleInput = document.getElementById("rounding-rule");

  var pricePerGramUsedEl = document.getElementById("price-per-gram-used");
  var baseFilamentCostEl = document.getElementById("base-filament-cost");
  var insuranceRateAmountEl = document.getElementById("insurance-rate-amount");
  var totalFilamentCostEl = document.getElementById("total-filament-cost");
  var hoursCostOutputEl = document.getElementById("hours-cost-output");
  var additionalLaborOutputEl = document.getElementById("additional-labor-output");
  var customsEstimateOutputEl = document.getElementById("customs-estimate-output");
  var rawSubtotalOutputEl = document.getElementById("raw-subtotal-output");
  var roundedFinalTotalOutputEl = document.getElementById("rounded-final-total-output");
  var totalOutputEl = document.getElementById("total-output");
  var rewardContainerEl = document.getElementById("reward-container");
  var rewardImageEl = document.getElementById("reward-image");

  var rewardAssets = [
    "assets/roach.gif",
    "assets/blahaj.gif",
    "assets/cat.gif",
    "assets/paste.gif",
    "assets/fishman.png",
    "assets/fox.png",
  ];
  var rewardHideTimeoutId = null;

  var parseNumericValue = function (value) {
    var normalizedValue = String(value === undefined || value === null ? "" : value).trim();
    if (normalizedValue === "") {
      return 0;
    }

    var parsedValue = parseFloat(normalizedValue);
    if (isFinite(parsedValue)) {
      return Math.max(0, parsedValue);
    }

    return 0;
  };

  var formatCurrency = function (value) {
    return "$" + value.toFixed(2);
  };

  var showInlineMessage = function (inputEl, message, tone) {
    if (!inputEl || !inputEl.parentNode) {
      return;
    }

    var messageEl = inputEl.nextElementSibling;
    if (!messageEl || !messageEl.classList.contains("inline-input-message")) {
      messageEl = document.createElement("p");
      messageEl.className = "inline-input-message";
      inputEl.parentNode.insertBefore(messageEl, inputEl.nextSibling);
    }

    messageEl.textContent = message;
    messageEl.classList.remove("is-help", "is-error");
    messageEl.classList.add(tone === "error" ? "is-error" : "is-help");
  };

  var clearInlineMessage = function (inputEl) {
    if (!inputEl) {
      return;
    }

    var messageEl = inputEl.nextElementSibling;
    if (messageEl && messageEl.classList.contains("inline-input-message")) {
      messageEl.remove();
    }
  };

  var validateNonNegativeField = function (inputEl) {
    if (!inputEl) {
      return true;
    }

    var rawValue = String(inputEl.value || "").trim();
    if (rawValue === "") {
      clearInlineMessage(inputEl);
      return true;
    }

    var parsedValue = parseFloat(rawValue);
    if (!isFinite(parsedValue)) {
      showInlineMessage(inputEl, "Please enter a valid number.", "error");
      return false;
    }

    if (parsedValue < 0) {
      showInlineMessage(inputEl, "Value cannot be negative. It will be treated as 0.", "error");
      return false;
    }

    clearInlineMessage(inputEl);
    return true;
  };

  var validateSpoolRowPair = function (spoolRow) {
    var spoolCostInput = spoolRow.querySelector(".spool-cost-input");
    var spoolGramsInput = spoolRow.querySelector(".spool-grams-input");
    var spoolCost = parseNumericValue(spoolCostInput ? spoolCostInput.value : "");
    var spoolGrams = parseNumericValue(spoolGramsInput ? spoolGramsInput.value : "");

    if (spoolGrams > 0 && spoolCost === 0 && spoolCostInput) {
      showInlineMessage(spoolCostInput, "Add spool cost to price used grams accurately.", "help");
      return false;
    }

    if (spoolCostInput) {
      clearInlineMessage(spoolCostInput);
    }

    return true;
  };

  var validateAllNumericFields = function () {
    var isValid = true;

    isValid = validateNonNegativeField(printingHoursInput) && isValid;
    isValid = validateNonNegativeField(additionalLaborInput) && isValid;

    if (customsEnabledInput && customsEnabledInput.checked) {
      isValid = validateNonNegativeField(customsEstimateInput) && isValid;
    } else {
      clearInlineMessage(customsEstimateInput);
    }

    if (spoolRowsEl) {
      var spoolRows = Array.prototype.slice.call(spoolRowsEl.querySelectorAll(".spool-row"));
      spoolRows.forEach(function (spoolRow) {
        var spoolCostInput = spoolRow.querySelector(".spool-cost-input");
        var spoolGramsInput = spoolRow.querySelector(".spool-grams-input");

        isValid = validateNonNegativeField(spoolCostInput) && isValid;
        isValid = validateNonNegativeField(spoolGramsInput) && isValid;
        isValid = validateSpoolRowPair(spoolRow) && isValid;
      });
    }

    return isValid;
  };

  var getInsuranceRate = function (grams) {
    var safeGrams = Math.max(0, grams);
    var tenGramBracket = Math.ceil(safeGrams / 10);
    var boundedBracket = Math.max(1, Math.min(10, tenGramBracket));

    return boundedBracket * 0.05;
  };

  var applyRoundingRule = function (amount, roundingRule) {
    if (roundingRule === "up") {
      return Math.ceil(amount);
    }

    if (roundingRule === "down") {
      return Math.floor(amount);
    }

    return Math.round(amount);
  };

  var calculateFilamentBreakdown = function (totalGrams, baseFilamentCost) {
    var insuranceRate = getInsuranceRate(totalGrams);
    var insuranceAmount = baseFilamentCost * insuranceRate;
    var totalFilamentCost = baseFilamentCost + insuranceAmount;
    var pricePerGramUsed = totalGrams > 0 ? baseFilamentCost / totalGrams : 0;

    return {
      pricePerGramUsed: pricePerGramUsed,
      baseFilamentCost: baseFilamentCost,
      insuranceRate: insuranceRate,
      insuranceAmount: insuranceAmount,
      totalFilamentCost: totalFilamentCost,
    };
  };

  var getHoursCost = function () {
    var hours = parseNumericValue(printingHoursInput ? printingHoursInput.value : "");
    var hoursCost = hours * 1;

    return hoursCost;
  };

  var updateHoursCostField = function () {
    var hoursCost = getHoursCost();

    if (hoursCostInput) {
      hoursCostInput.value = hoursCost.toFixed(2);
    }
  };

  var updateCustomsState = function () {
    if (!customsEstimateInput) {
      return;
    }

    var customsEnabled = Boolean(customsEnabledInput && customsEnabledInput.checked);
    customsEstimateInput.disabled = !customsEnabled;

    if (!customsEnabled) {
      clearInlineMessage(customsEstimateInput);
    }
  };

  var updateSpoolRowPrice = function (spoolRow) {
    var spoolCostInput = spoolRow.querySelector(".spool-cost-input");
    var spoolPriceOutput = spoolRow.querySelector(".spool-price-output");
    var spoolCost = parseNumericValue(spoolCostInput ? spoolCostInput.value : "");
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
    spoolCostInput.min = "0";
    spoolCostInput.step = "0.01";

    var spoolGramsLabel = document.createElement("label");
    spoolGramsLabel.textContent = "Grams used in piece";

    var spoolGramsInput = document.createElement("input");
    spoolGramsInput.type = "number";
    spoolGramsInput.className = "spool-grams-input";
    spoolGramsInput.placeholder = "0";
    spoolGramsInput.step = "0.01";
    spoolGramsInput.min = "0";

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
      validateNonNegativeField(spoolCostInput);
      validateSpoolRowPair(spoolRow);
      updateSpoolRowPrice(spoolRow);
    });

    spoolGramsInput.addEventListener("input", function () {
      validateNonNegativeField(spoolGramsInput);
      validateSpoolRowPair(spoolRow);
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

    var spoolRows = Array.prototype.slice.call(spoolRowsEl.querySelectorAll(".spool-row"));
    var totals = spoolRows.reduce(function (accumulator, spoolRow) {
      var spoolCostInput = spoolRow.querySelector(".spool-cost-input");
      var spoolGramsInput = spoolRow.querySelector(".spool-grams-input");
      var spoolCost = parseNumericValue(spoolCostInput ? spoolCostInput.value : "");
      var spoolGrams = parseNumericValue(spoolGramsInput ? spoolGramsInput.value : "");
      var pricePerGram = spoolCost / 1000;

      return {
        totalGrams: accumulator.totalGrams + spoolGrams,
        baseFilamentCost: accumulator.baseFilamentCost + spoolGrams * pricePerGram,
      };
    }, { totalGrams: 0, baseFilamentCost: 0 });

    return totals;
  };

  var hideRewardAsset = function () {
    if (rewardContainerEl) {
      rewardContainerEl.hidden = true;
      rewardContainerEl.setAttribute("aria-hidden", "true");
    }

    if (rewardImageEl) {
      rewardImageEl.removeAttribute("src");
    }
  };

  var showRandomRewardAsset = function () {
    if (!rewardContainerEl || !rewardImageEl || rewardAssets.length === 0) {
      return;
    }

    var randomIndex = Math.floor(Math.random() * rewardAssets.length);
    var randomAsset = rewardAssets[randomIndex];
    var displayDuration = 2000 + Math.floor(Math.random() * 2001);

    rewardImageEl.src = randomAsset;
    rewardContainerEl.hidden = false;
    rewardContainerEl.setAttribute("aria-hidden", "false");

    if (rewardHideTimeoutId !== null) {
      clearTimeout(rewardHideTimeoutId);
    }

    rewardHideTimeoutId = window.setTimeout(function () {
      hideRewardAsset();
      rewardHideTimeoutId = null;
    }, displayDuration);
  };

  if (addSpoolButton) {
    addSpoolButton.addEventListener("click", function () {
      createSpoolRow();
    });
  }

  if (printingHoursInput) {
    printingHoursInput.addEventListener("input", function () {
      validateNonNegativeField(printingHoursInput);
      updateHoursCostField();
    });
  }

  if (additionalLaborInput) {
    additionalLaborInput.addEventListener("input", function () {
      validateNonNegativeField(additionalLaborInput);
    });
  }

  if (customsEnabledInput) {
    customsEnabledInput.addEventListener("change", function () {
      updateCustomsState();
      validateAllNumericFields();
    });
  }

  if (customsEstimateInput) {
    customsEstimateInput.addEventListener("input", function () {
      validateNonNegativeField(customsEstimateInput);
    });
  }

  if (spoolRowsEl && spoolRowsEl.children.length === 0) {
    createSpoolRow();
  }

  updateHoursCostField();
  updateCustomsState();

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      validateAllNumericFields();

      var spoolTotals = getSpoolTotals();
      var filamentBreakdown = calculateFilamentBreakdown(spoolTotals.totalGrams, spoolTotals.baseFilamentCost);
      var hoursCost = getHoursCost();
      var additionalLabor = parseNumericValue(additionalLaborInput ? additionalLaborInput.value : "");
      var customsEstimate = customsEnabledInput && customsEnabledInput.checked
        ? parseNumericValue(customsEstimateInput ? customsEstimateInput.value : "")
        : 0;
      var rawTotal = filamentBreakdown.totalFilamentCost + hoursCost + additionalLabor + customsEstimate;
      var roundingRule = roundingRuleInput ? roundingRuleInput.value : "nearest";
      var finalTotal = applyRoundingRule(rawTotal, roundingRule);

      if (hoursCostInput) {
        hoursCostInput.value = hoursCost.toFixed(2);
      }

      if (pricePerGramUsedEl) {
        pricePerGramUsedEl.textContent = "$" + filamentBreakdown.pricePerGramUsed.toFixed(4);
      }

      if (baseFilamentCostEl) {
        baseFilamentCostEl.textContent = formatCurrency(filamentBreakdown.baseFilamentCost);
      }

      if (insuranceRateAmountEl) {
        insuranceRateAmountEl.textContent = (filamentBreakdown.insuranceRate * 100).toFixed(2) + "% / " + formatCurrency(filamentBreakdown.insuranceAmount);
      }

      if (totalFilamentCostEl) {
        totalFilamentCostEl.textContent = formatCurrency(filamentBreakdown.totalFilamentCost);
      }

      if (hoursCostOutputEl) {
        hoursCostOutputEl.textContent = formatCurrency(hoursCost);
      }

      if (additionalLaborOutputEl) {
        additionalLaborOutputEl.textContent = formatCurrency(additionalLabor);
      }

      if (customsEstimateOutputEl) {
        customsEstimateOutputEl.textContent = formatCurrency(customsEstimate);
      }

      if (rawSubtotalOutputEl) {
        rawSubtotalOutputEl.textContent = formatCurrency(rawTotal);
      }

      if (roundedFinalTotalOutputEl) {
        roundedFinalTotalOutputEl.textContent = formatCurrency(finalTotal);
      }

      if (totalOutputEl) {
        totalOutputEl.textContent = formatCurrency(finalTotal);
      }

      showRandomRewardAsset();
    });
  }

  console.log("✅ script validated");
});
