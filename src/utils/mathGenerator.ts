import { GameSettings, QuestionItem } from '../types';

function toSorobanDigit(val: number) {
  const upper = val >= 5 ? 1 : 0;
  const lower = val % 5;
  return { upper, lower };
}

function isDirectOperation(currentDigit: number, operandDigit: number, isAddition: boolean): boolean {
  const curr = toSorobanDigit(currentDigit);
  const op = toSorobanDigit(Math.abs(operandDigit));

  if (isAddition) {
    if (curr.upper + op.upper > 1) return false;
    if (curr.lower + op.lower > 4) return false;
    return (currentDigit + operandDigit) <= 9;
  } else {
    if (curr.upper - op.upper < 0) return false;
    if (curr.lower - op.lower < 0) return false;
    return (currentDigit - operandDigit) >= 0;
  }
}

function isFriendOf5Operation(currentDigit: number, operandDigit: number, isAddition: boolean): boolean {
  const curr = toSorobanDigit(currentDigit);
  const opVal = Math.abs(operandDigit);

  if (isAddition) {
    if (curr.upper === 1) return false; // 5 bead already down
    if (opVal === 4 && curr.lower >= 1) return true;
    if (opVal === 3 && curr.lower >= 2) return true;
    if (opVal === 2 && curr.lower >= 3) return true;
    if (opVal === 1 && curr.lower === 4) return true;
    return false;
  } else {
    if (curr.upper === 0) return false; // 5 bead is not down
    if (opVal === 4 && curr.lower <= 3) return true;
    if (opVal === 3 && curr.lower <= 2) return true;
    if (opVal === 2 && curr.lower <= 1) return true;
    if (opVal === 1 && curr.lower === 0) return true;
    return false;
  }
}

function generateSingleQuestion(id: number, settings: GameSettings): QuestionItem {
  const { mathMode, digits1, digits2, numOperands } = settings;
  const operands: number[] = [];

  const maxValForDigits = (d: number) => Math.pow(10, d) - 1;
  const minValForDigits = (d: number) => (d === 1 ? 1 : Math.pow(10, d - 1));

  let attempts = 0;
  while (attempts < 100) {
    operands.length = 0;
    attempts++;

    if (mathMode === 'simple') {
      let currentVal = 0;
      let ok = true;

      for (let i = 0; i < numOperands; i++) {
        const numDigits = i === 0 ? digits1 : (i % 2 === 1 ? digits2 : digits1);
        const validNextNumbers: number[] = [];

        if (numDigits === 1) {
          for (let candidate = 1; candidate <= 9; candidate++) {
            if (isDirectOperation(currentVal, candidate, true)) {
              validNextNumbers.push(candidate);
            }
          }
          if (currentVal > 0) {
            for (let candidate = 1; candidate <= 9; candidate++) {
              if (isDirectOperation(currentVal, candidate, false)) {
                validNextNumbers.push(-candidate);
              }
            }
          }
        } else {
          let candAdd = 0;
          let candSub = 0;
          let canAdd = true;
          let canSub = currentVal >= minValForDigits(numDigits);

          const currentStr = currentVal.toString().padStart(numDigits, '0');
          let addDigits = '';
          let subDigits = '';

          for (let d = 0; d < numDigits; d++) {
            const cDigit = parseInt(currentStr[d] || '0', 10);
            const possibleAddDigits: number[] = [];
            const possibleSubDigits: number[] = [];

            for (let v = 0; v <= 9; v++) {
              if (isDirectOperation(cDigit, v, true)) possibleAddDigits.push(v);
              if (isDirectOperation(cDigit, v, false)) possibleSubDigits.push(v);
            }

            if (possibleAddDigits.length === 0) canAdd = false;
            else {
              addDigits += possibleAddDigits[Math.floor(Math.random() * possibleAddDigits.length)].toString();
            }

            if (possibleSubDigits.length === 0) canSub = false;
            else {
              subDigits += possibleSubDigits[Math.floor(Math.random() * possibleSubDigits.length)].toString();
            }
          }

          if (canAdd && parseInt(addDigits, 10) > 0) {
            candAdd = parseInt(addDigits, 10);
            validNextNumbers.push(candAdd);
          }
          if (canSub && parseInt(subDigits, 10) > 0 && currentVal - parseInt(subDigits, 10) >= 0) {
            candSub = -parseInt(subDigits, 10);
            validNextNumbers.push(candSub);
          }
        }

        if (validNextNumbers.length === 0) {
          ok = false;
          break;
        }

        let pick: number;
        const subCandidates = validNextNumbers.filter(n => n < 0);
        const addCandidates = validNextNumbers.filter(n => n > 0);

        if (currentVal >= (maxValForDigits(numDigits) * 0.75) && subCandidates.length > 0 && Math.random() < 0.7) {
          pick = subCandidates[Math.floor(Math.random() * subCandidates.length)];
        } else if (addCandidates.length > 0) {
          pick = addCandidates[Math.floor(Math.random() * addCandidates.length)];
        } else {
          pick = validNextNumbers[Math.floor(Math.random() * validNextNumbers.length)];
        }

        operands.push(pick);
        currentVal += pick;
      }

      if (ok && operands.length === numOperands && currentVal >= 0) {
        return {
          id,
          numbers: operands,
          answer: operands.reduce((a, b) => a + b, 0),
          modeExplanation: 'Simple (Direct formulas)',
        };
      }
    } else if (mathMode === 'friends_of_5') {
      let currentVal = 0;
      let ok = true;
      let hasFriendOf5Occurred = false;

      for (let i = 0; i < numOperands; i++) {
        const numDigits = i === 0 ? digits1 : (i % 2 === 1 ? digits2 : digits1);
        const validNextNumbers: { val: number; isFriend5: boolean }[] = [];

        if (numDigits === 1) {
          for (let candidate = 1; candidate <= 9; candidate++) {
            if (isFriendOf5Operation(currentVal, candidate, true)) {
              validNextNumbers.push({ val: candidate, isFriend5: true });
            } else if (isDirectOperation(currentVal, candidate, true)) {
              validNextNumbers.push({ val: candidate, isFriend5: false });
            }
          }
          if (currentVal > 0) {
            for (let candidate = 1; candidate <= 9; candidate++) {
              if (isFriendOf5Operation(currentVal, candidate, false)) {
                validNextNumbers.push({ val: -candidate, isFriend5: true });
              } else if (isDirectOperation(currentVal, candidate, false)) {
                validNextNumbers.push({ val: -candidate, isFriend5: false });
              }
            }
          }
        } else {
          for (let tryCount = 0; tryCount < 20; tryCount++) {
            const min = minValForDigits(numDigits);
            const max = maxValForDigits(numDigits);
            const cand = Math.floor(min + Math.random() * (max - min + 1));
            const lastDigitCand = cand % 10;
            const lastDigitCurr = currentVal % 10;

            if (isFriendOf5Operation(lastDigitCurr, lastDigitCand, true)) {
              validNextNumbers.push({ val: cand, isFriend5: true });
              break;
            }
            if (currentVal > cand && isFriendOf5Operation(lastDigitCurr, lastDigitCand, false)) {
              validNextNumbers.push({ val: -cand, isFriend5: true });
              break;
            }
          }
          if (validNextNumbers.length === 0) {
            const cand = Math.floor(minValForDigits(numDigits) + Math.random() * (maxValForDigits(numDigits) - minValForDigits(numDigits) + 1));
            validNextNumbers.push({ val: cand, isFriend5: false });
          }
        }

        if (validNextNumbers.length === 0) {
          ok = false;
          break;
        }

        const f5Candidates = validNextNumbers.filter(item => item.isFriend5);
        let selected: { val: number; isFriend5: boolean };
        if (f5Candidates.length > 0 && (!hasFriendOf5Occurred || Math.random() < 0.6)) {
          selected = f5Candidates[Math.floor(Math.random() * f5Candidates.length)];
          hasFriendOf5Occurred = true;
        } else {
          selected = validNextNumbers[Math.floor(Math.random() * validNextNumbers.length)];
          if (selected.isFriend5) hasFriendOf5Occurred = true;
        }

        operands.push(selected.val);
        currentVal += selected.val;
      }

      if (ok && operands.length === numOperands && currentVal >= 0) {
        return {
          id,
          numbers: operands,
          answer: operands.reduce((a, b) => a + b, 0),
          modeExplanation: 'Friends of 5 formulas',
        };
      }
    } else {
      // Standard / Mixed
      let runningSum = 0;
      for (let j = 0; j < numOperands; j++) {
        const useDigits1 = j < Math.floor(numOperands / 2);
        const digits = digits1 === digits2 ? digits1 : (useDigits1 ? digits1 : digits2);
        const min = minValForDigits(digits);
        const max = maxValForDigits(digits);
        const num = Math.floor(min + Math.random() * (max - min + 1));
        operands.push(num);
        runningSum += num;
      }

      const subtractionCount = numOperands > 4 ? 2 : 1;
      const usedIndexes = new Set<number>();
      for (let s = 0; s < subtractionCount; s++) {
        const subIndex = 1 + Math.floor(Math.random() * (numOperands - 1));
        if (!usedIndexes.has(subIndex)) {
          usedIndexes.add(subIndex);
          const sumBefore = operands.slice(0, subIndex).reduce((a, b) => a + b, 0);
          if (sumBefore > 2) {
            const maxSub = Math.min(operands[subIndex], sumBefore - 1);
            const subNum = Math.floor(1 + Math.random() * Math.max(1, maxSub));
            operands[subIndex] = -subNum;
          }
        }
      }

      const answer = operands.reduce((a, b) => a + b, 0);
      if (answer >= 0) {
        return {
          id,
          numbers: operands,
          answer,
          modeExplanation: 'Standard formulas',
        };
      }
    }
  }

  const fallback = [
    Math.floor(minValForDigits(digits1) + Math.random() * (maxValForDigits(digits1) - minValForDigits(digits1) + 1)),
    Math.floor(minValForDigits(digits2) + Math.random() * (maxValForDigits(digits2) - minValForDigits(digits2) + 1)),
  ];
  return {
    id,
    numbers: fallback,
    answer: fallback[0] + fallback[1],
    modeExplanation: 'Practice Problem',
  };
}

export function generateAllQuestions(settings: GameSettings): QuestionItem[] {
  const list: QuestionItem[] = [];
  for (let i = 0; i < settings.numQuestions; i++) {
    list.push(generateSingleQuestion(i + 1, settings));
  }
  return list;
}
