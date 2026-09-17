import { useState } from "react";

import { WidgetBody, WidgetControls } from "@/components/ui/Widget";
import { Icon } from "@/components/ui/Icon";
import { useLanguage } from "@/i18n";

export function Calculator({
  display: savedDisplay = "0",
  onConfigChange,
  onDelete,
}) {
  const { language, t } = useLanguage();
  const [display, setDisplay] = useState(savedDisplay);
  const [shouldResetDisplay, setShouldResetDisplay] = useState(false);
  const [history, setHistory] = useState([]);

  function inputDigit(digit) {
    if (shouldResetDisplay || display === "Error") {
      updateDisplay(digit);
      setShouldResetDisplay(false);
      return;
    }

    if (display === "0") {
      updateDisplay(digit);
      return;
    }

    const lastCharacter = getLastCharacter(display);

    if (lastCharacter === ")") {
      updateDisplay(`${display} * ${digit}`);
      return;
    }

    updateDisplay(`${display}${digit}`);
  }

  function inputDecimal() {
    if (shouldResetDisplay || display === "Error") {
      updateDisplay("0.");
      setShouldResetDisplay(false);
      return;
    }

    if (getLastNumber(display).includes(".")) return;

    const lastCharacter = getLastCharacter(display);

    if (isOperator(lastCharacter) || lastCharacter === "(") {
      updateDisplay(`${display}0.`);
      return;
    }

    updateDisplay(`${display}.`);
  }

  function inputPercent() {
    const lastNumber = getLastNumber(display);
    if (!lastNumber) return;

    const expressionBeforeNumber = display.slice(
      0,
      display.length - lastNumber.length,
    );
    const previousOperator = getLastOperator(expressionBeforeNumber);
    const previousValue = getLeftSideValue(expressionBeforeNumber);
    const numberValue = Number(lastNumber);
    let percentageValue = numberValue / 100;

    if (
      (previousOperator === "+" || previousOperator === "-") &&
      previousValue !== null
    ) {
      percentageValue = previousValue * (numberValue / 100);
    }

    updateDisplay(replaceLastNumber(display, String(percentageValue)));
    setShouldResetDisplay(true);
  }

  function inputParentheses() {
    const openCount = countMatches(display, "(");
    const closeCount = countMatches(display, ")");
    const lastCharacter = getLastCharacter(display);
    const shouldOpen =
      display === "0" ||
      shouldResetDisplay ||
      isOperator(lastCharacter) ||
      lastCharacter === "(";

    if (shouldOpen) {
      updateDisplay(
        display === "0" || shouldResetDisplay ? "(" : `${display}(`,
      );
      setShouldResetDisplay(false);
      return;
    }

    if (openCount > closeCount) {
      updateDisplay(`${display})`);
      return;
    }

    updateDisplay(`${display} * (`);
  }

  function chooseOperator(nextOperator) {
    if (display === "Error") return;

    const lastCharacter = getLastCharacter(display);

    if (isOperator(lastCharacter)) {
      updateDisplay(`${display.trim().slice(0, -1)}${nextOperator}`);
      return;
    }

    if (lastCharacter === "(") return;

    updateDisplay(`${display} ${nextOperator} `);
    setShouldResetDisplay(false);
  }

  function calculate() {
    try {
      const normalizedExpression = closeMissingParentheses(display);
      const result = evaluateExpression(normalizedExpression);

      if (!Number.isFinite(result)) {
        updateDisplay("Error");
        ("");
        setShouldResetDisplay(true);
        return;
      }

      const formattedExpression = formatExpression(normalizedExpression);
      const formattedResult = formatResult(result);

      setHistory((currentHistory) => [
        {
          id: crypto.randomUUID(),
          expression: formattedExpression,
          result: formattedResult,
        },
        ...currentHistory,
      ]);

      formattedExpression;
      updateDisplay(formattedResult);
      setShouldResetDisplay(true);
    } catch {
      updateDisplay("Error");
      ("");
      setShouldResetDisplay(true);
    }
  }

  function formatExpression(expression) {
    return expression
      .replaceAll("*", "×")
      .replaceAll("/", "÷")
      .replace(/\s+/g, "");
  }

  function getOperatorIconName(operator) {
    const operatorIcons = {
      "*": "x",
      "×": "x",
      "/": "divide",
      "÷": "divide",
      "+": "plus",
      "-": "minus",
    };

    return operatorIcons[operator];
  }

  function renderDisplayValue(
    value,
    iconSize = 20,
    iconClassName = "text-whie",
  ) {
    if (value === "Error") {
      return <span>{t("error")}</span>;
    }

    return value.split("").map((character, index) => {
      const iconName = getOperatorIconName(character);

      if (!iconName) {
        const localizedCharacter =
          language === "pt" && character === "." ? "," : character;
        return <span key={`${character}-${index}`}>{localizedCharacter}</span>;
      }

      return (
        <Icon
          key={`${character}-${index}`}
          name={iconName}
          size={iconSize}
          strokeWidth={2}
          className={iconClassName}
        />
      );
    });
  }

  function clearCalculator() {
    updateDisplay("0");
    ("");
    setShouldResetDisplay(false);
  }

  function deleteLastDigit() {
    if (shouldResetDisplay) {
      updateDisplay("0");
      ("");
      setShouldResetDisplay(false);
      return;
    }

    if (display === "Error") {
      updateDisplay("0");
      ("");
      return;
    }

    if (display.length === 1) {
      updateDisplay("0");
      return;
    }

    updateDisplay(display.trimEnd().slice(0, -1).trimEnd() || "0");
  }

  function updateDisplay(nextDisplay) {
    setDisplay(nextDisplay);
    onConfigChange?.({ display: nextDisplay });
  }

  function countMatches(value, match) {
    return value.split(match).length - 1;
  }

  function getLastCharacter(value) {
    return value.trim().at(-1);
  }

  function isOperator(value) {
    return ["+", "-", "*", "/"].includes(value);
  }

  function getLastNumber(value) {
    return value.match(/\d+(\.\d*)?$/)?.[0] ?? "";
  }

  function replaceLastNumber(value, nextNumber) {
    return value.replace(/\d+(\.\d*)?$/, nextNumber);
  }

  function getLastOperator(value) {
    return value.match(/[+\-*/]\s*$/)?.[0]?.trim() ?? null;
  }

  function getLeftSideValue(expressionBeforeNumber) {
    const leftSideExpression = expressionBeforeNumber
      .replace(/[+\-*/]\s*$/, "")
      .trim();
    if (!leftSideExpression) return null;

    try {
      return evaluateExpression(closeMissingParentheses(leftSideExpression));
    } catch {
      return null;
    }
  }

  function closeMissingParentheses(expression) {
    const missingParentheses =
      countMatches(expression, "(") - countMatches(expression, ")");

    if (missingParentheses <= 0) return expression;

    return `${expression}${")".repeat(missingParentheses)}`;
  }

  function evaluateExpression(expression) {
    const tokens = tokenizeExpression(expression);
    let index = 0;

    if (tokens.length === 0) throw new Error("Empty expression");

    function parseExpression() {
      let value = parseTerm();

      while (tokens[index] === "+" || tokens[index] === "-") {
        const currentOperator = tokens[index];
        index += 1;
        const nextValue = parseTerm();

        if (currentOperator === "+") value += nextValue;
        if (currentOperator === "-") value -= nextValue;
      }

      return value;
    }

    function parseTerm() {
      let value = parseFactor();

      while (tokens[index] === "*" || tokens[index] === "/") {
        const currentOperator = tokens[index];
        index += 1;
        const nextValue = parseFactor();

        if (currentOperator === "*") value *= nextValue;
        if (currentOperator === "/") value /= nextValue;
      }

      return value;
    }

    function parseFactor() {
      const token = tokens[index];

      if (token === undefined) throw new Error("Missing value");

      if (token === "-") {
        index += 1;
        return -parseFactor();
      }

      if (token === "(") {
        index += 1;
        const value = parseExpression();

        if (tokens[index] !== ")") {
          throw new Error("Missing closing parenthesis");
        }

        index += 1;
        return value;
      }

      if (token === ")") throw new Error("Unexpected closing parenthesis");

      index += 1;
      const numberValue = Number(token);

      if (Number.isNaN(numberValue)) throw new Error("Invalid number");

      return numberValue;
    }

    const result = parseExpression();

    if (index < tokens.length) {
      throw new Error("Invalid expression");
    }

    return result;
  }

  function tokenizeExpression(expression) {
    return expression.match(/\d+(\.\d*)?|\.\d+|[()+\-*/]/g) ?? [];
  }

  function formatResult(result) {
    return String(Number.parseFloat(result.toFixed(7)));
  }

  const button = `
    aspect-square
    !rounded-full
    flex
    items-center
    justify-center
    border-0
    text-white
  `;

  function getDisplayFontSize(value) {
    const length = value.replaceAll(" ", "").length;

    if (length >= 11) return "text-xl";
    if (length >= 9) return "text-2xl";
    if (length >= 8) return "text-3xl";

    return "text-3xl";
  }

  const utilityButton =
    "!border !border-slate-600 !bg-slate-600/70 hover:!bg-slate-500";
  const operatorButton =
    "!border !border-orange-400 !bg-orange-400/80 hover:!bg-orange-300";
  const equalButton =
    "!border !border-slate-600 !bg-slate-600/70 hover:!bg-slate-500";

  return (
    <WidgetBody
      hFull={false}
      top={
        <div
          className={`
            flex
            justify-end
            mr-2
            overflow-hidden
            ${getDisplayFontSize(display)}
          `}
        >
          <div className="grid h-7.5">
            <span
              className="
                flex
                items-center
                justify-end
            "
            >
              {renderDisplayValue(display)}
            </span>
            <span
              className="
                flex
                items-center
                gap-[0.1rem]
                justify-end
                text-lg
                text-gray-300/90
              "
            >
              {/* {renderDisplayValue(expressionLabel, 14, "text-gray-300/90")} */}
            </span>
          </div>
        </div>
      }
      middlePosition="top"
      middle={
        <div
          className="
            flex
            flex-col
            gap-4
            h-full
          "
        >
          <div
            className="
              grid
              grid-cols-4
              gap-1
            "
          >
            <button
              onClick={clearCalculator}
              className={`clickable ${button} ${utilityButton}`}
            >
              AC
            </button>
            <button
              onClick={inputParentheses}
              className={`clickable ${button} ${utilityButton}`}
            >
              <Icon name="parentheses" className="text-white" />
            </button>
            <button
              onClick={inputPercent}
              className={`clickable ${button} ${utilityButton}`}
            >
              %
            </button>
            <button
              onClick={() => chooseOperator("/")}
              className={`clickable ${button} ${operatorButton}`}
            >
              <Icon name="divide" className="text-white" />
            </button>

            <button
              onClick={() => inputDigit("7")}
              className={`clickable ${button}`}
            >
              7
            </button>
            <button
              onClick={() => inputDigit("8")}
              className={`clickable ${button}`}
            >
              8
            </button>
            <button
              onClick={() => inputDigit("9")}
              className={`clickable ${button}`}
            >
              9
            </button>
            <button
              onClick={() => chooseOperator("*")}
              className={`clickable ${button} ${operatorButton}`}
            >
              <Icon name="x" className="text-white" />
            </button>

            <button
              onClick={() => inputDigit("4")}
              className={`clickable ${button}`}
            >
              4
            </button>
            <button
              onClick={() => inputDigit("5")}
              className={`clickable ${button}`}
            >
              5
            </button>
            <button
              onClick={() => inputDigit("6")}
              className={`clickable ${button}`}
            >
              6
            </button>

            <button
              onClick={() => chooseOperator("-")}
              className={`clickable ${button} ${operatorButton}`}
            >
              <Icon name="minus" className="text-white" />
            </button>
            <button
              onClick={() => inputDigit("1")}
              className={`clickable ${button}`}
            >
              1
            </button>
            <button
              onClick={() => inputDigit("2")}
              className={`clickable ${button}`}
            >
              2
            </button>
            <button
              onClick={() => inputDigit("3")}
              className={`clickable ${button}`}
            >
              3
            </button>
            <button
              onClick={() => chooseOperator("+")}
              className={`clickable ${button} ${operatorButton}`}
            >
              <Icon name="plus" className="text-white" />
            </button>
            <button
              onClick={() => inputDigit("0")}
              className={`clickable ${button}`}
            >
              0
            </button>
            <button onClick={inputDecimal} className={`clickable ${button}`}>
              {language === "pt" ? "," : "."}
            </button>
            <button onClick={deleteLastDigit} className={`clickable ${button}`}>
              <Icon name="delete" className="text-white" />
            </button>
            <button
              onClick={calculate}
              className={`clickable ${button} ${equalButton}`}
            >
              <Icon name="equal" className="text-white" />
            </button>
          </div>
          <div
            className="
              p-1.75
              text-sm
              h-full
              paper-texture
              rounded
              overflow-auto
            "
          >
            {history.map((calculation) => (
              <div
                key={calculation.id}
                className="
                  flex
                  text-[1.43rem]
                  font-['Indie_Flower',cursive]
                  space-x-2
                "
              >
                <span
                  className="
                  flex
                text-gray-800
                "
                >
                  {renderDisplayValue(calculation.expression, 14, "")}{" "}
                  <span className="pl-2">=</span>
                </span>
                <span className="text-gray-900/50">{calculation.result}</span>
              </div>
            ))}
          </div>
        </div>
      }
      bottom={
        <WidgetControls>
          <WidgetControls.Delete onClick={onDelete} />
        </WidgetControls>
      }
    />
  );
}
