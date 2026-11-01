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

        if (i === 0) {
          // First number: pick values that allow Friends of 5 formulas in the next step
          if (numDigits === 1) {
            const starterDigits = [1, 2, 3, 4, 5, 6, 7, 8];
            const pick = starterDigits[Math.floor(Math.random() * starterDigits.length)];
            operands.push(pick);
            currentVal = pick;
          } else {
            let startValStr = '';
            for (let d = 0; d < numDigits; d++) {
              const digitCandidates = d === 0 ? [1, 2, 3, 4, 5, 6, 7, 8] : [0, 1, 2, 3, 4, 5, 6, 7, 8];
              startValStr += digitCandidates[Math.floor(Math.random() * digitCandidates.length)].toString();
            }
            const startVal = Math.max(minValForDigits(numDigits), parseInt(startValStr, 10));
            operands.push(startVal);
            currentVal = startVal;
          }
          continue;
        }

        const isLastStep = i === numOperands - 1;
        const mustBeFriend5 = !hasFriendOf5Occurred && isLastStep;

        if (numDigits === 1) {
          const f5AddCandidates: number[] = [];
          const f5SubCandidates: number[] = [];
          const dirAddCandidates: number[] = [];
          const dirSubCandidates: number[] = [];

          for (let cand = 1; cand <= 9; cand++) {
            if (isFriendOf5Operation(currentVal, cand, true)) f5AddCandidates.push(cand);
            else if (isDirectOperation(currentVal, cand, true)) dirAddCandidates.push(cand);

            if (currentVal >= cand) {
              if (isFriendOf5Operation(currentVal, cand, false)) f5SubCandidates.push(-cand);
              else if (isDirectOperation(currentVal, cand, false)) dirSubCandidates.push(-cand);
            }
          }

          const allF5 = [...f5AddCandidates, ...f5SubCandidates];
          const allDir = [...dirAddCandidates, ...dirSubCandidates];

          let pick: number | null = null;
          // Heavily prioritize Friend of 5 formula, and enforce it on last step if not occurred yet
          if (allF5.length > 0 && (!hasFriendOf5Occurred || Math.random() < 0.75)) {
            pick = allF5[Math.floor(Math.random() * allF5.length)];
            hasFriendOf5Occurred = true;
          } else if (!mustBeFriend5 && allDir.length > 0) {
            pick = allDir[Math.floor(Math.random() * allDir.length)];
          } else if (allF5.length > 0) {
            pick = allF5[Math.floor(Math.random() * allF5.length)];
            hasFriendOf5Occurred = true;
          }

          if (pick === null) {
            ok = false;
            break;
          }

          operands.push(pick);
          currentVal += pick;
        } else {
          // Multi-digit Friends of 5: assemble digit-by-digit without 10-carries
          let operandFound = false;
          const tryAdditionFirst = Math.random() > 0.5 || currentVal < minValForDigits(numDigits);
          const modesToTry = tryAdditionFirst ? ['add', 'sub'] : ['sub', 'add'];

          for (const mode of modesToTry) {
            if (operandFound) break;
            const isAdd = mode === 'add';
            if (!isAdd && currentVal < minValForDigits(numDigits)) continue;

            const currStr = currentVal.toString().padStart(numDigits, '0');
            for (let attempt = 0; attempt < 25; attempt++) {
              let opStr = '';
              let stepHasF5 = false;
              let possible = true;

              for (let d = 0; d < numDigits; d++) {
                const cDigit = parseInt(currStr[d] || '0', 10);
                const f5Digits: number[] = [];
                const dirDigits: number[] = [];

                for (let v = 0; v <= 9; v++) {
                  if (d === 0 && v === 0 && numDigits > 1) continue;
                  if (isFriendOf5Operation(cDigit, v, isAdd)) f5Digits.push(v);
                  else if (isDirectOperation(cDigit, v, isAdd)) dirDigits.push(v);
                }

                let chosenDigit: number | null = null;
                if (f5Digits.length > 0 && (!hasFriendOf5Occurred || Math.random() < 0.65)) {
                  chosenDigit = f5Digits[Math.floor(Math.random() * f5Digits.length)];
                  stepHasF5 = true;
                } else if (dirDigits.length > 0) {
                  chosenDigit = dirDigits[Math.floor(Math.random() * dirDigits.length)];
                } else if (f5Digits.length > 0) {
                  chosenDigit = f5Digits[Math.floor(Math.random() * f5Digits.length)];
                  stepHasF5 = true;
                } else {
                  possible = false;
                  break;
                }

                opStr += chosenDigit.toString();
              }

              if (possible && opStr.length === numDigits) {
                const parsedVal = parseInt(opStr, 10);
                if (parsedVal > 0) {
                  const finalVal = isAdd ? parsedVal : -parsedVal;
                  if (currentVal + finalVal >= 0 && (!mustBeFriend5 || stepHasF5 || hasFriendOf5Occurred)) {
                    operands.push(finalVal);
                    currentVal += finalVal;
                    if (stepHasF5) hasFriendOf5Occurred = true;
                    operandFound = true;
                    break;
                  }
                }
              }
            }
          }

          if (!operandFound) {
            ok = false;
            break;
          }
        }
      }

      // Strictly verify that a Friend of 5 formula actually occurred!
      if (ok && operands.length === numOperands && currentVal >= 0 && hasFriendOf5Occurred) {
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

  // Guaranteed authentic fallbacks if retry limit reached
  if (mathMode === 'friends_of_5') {
    const f5List = [
      [4, 1], [3, 2], [2, 3], [1, 4],
      [4, 2], [3, 3], [2, 4], [4, 3],
      [3, 4], [4, 4],
      [5, -1], [5, -2], [5, -3], [5, -4],
      [6, -2], [6, -3], [6, -4],
      [7, -3], [7, -4],
      [8, -4],
    ];
    const picked = f5List[Math.floor(Math.random() * f5List.length)];
    return {
      id,
      numbers: picked,
      answer: picked[0] + picked[1],
      modeExplanation: 'Friends of 5 formulas',
    };
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
