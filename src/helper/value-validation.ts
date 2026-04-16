import { State } from "@/types/State";

export function hasConflict(state: State, rowIndex: number, attributeName: string, valueIndex: number | null): boolean {
  const values = valueIndex !== null
                 ? [state.data[rowIndex].currentData.attributes[attributeName][valueIndex]]
                 : state.data[rowIndex].currentData.attributes[attributeName];
  const text = state.data[rowIndex].text;

  for (const valueData of values) {
    // If all values are null, no conflict
    if (valueData.start === null && valueData.end === null && (valueData.value === null)) {
      continue;
    }

    if (valueData.start === null || valueData.end === null || valueData.start < 0 || valueData.end >= text.length) {
      return true;
    } else if (valueData.value !== text.substring(valueData.start, valueData.end + 1)) {
      return true;
    }
  }

  return false;
}

/**
 * Validates if in the given state the value of the attribute in the given row matches the validation regex specified in the column metadata.
 * @param state The current app state.
 * @param rowIndex The index of the row to be validated.
 * @param attributeName The attribute to be validated.
 * @param valueIndex The index of the value to be validated, or null if the attribute has only one value.
 */
export function hasValidationRegExConflict(state: State, rowIndex: number, attributeName: string, valueIndex: number | null): boolean {
  const validationRegEx = state.columnData.attributes[attributeName].validationRegEx;
  if (validationRegEx === null) {
    // Valid if no validation regex is set
    return false;
  }

  const values = valueIndex !== null
                 ? [state.data[rowIndex].currentData.attributes[attributeName][valueIndex]]
                 : state.data[rowIndex].currentData.attributes[attributeName];

  const regex = new RegExp("^" + validationRegEx + "$");

  for (const valueData of values) {
    const value = valueData.value ?? "";
    const matches = value.match(regex);
    if (matches === null) {
      return true;
    }
  }

  return false;
}

export function hasMissingValues(state: State, rowIndex: number, attributeName: string, valueIndex: number | null): boolean {
  const attributeData = state.data[rowIndex].currentData.attributes[attributeName];

  if (valueIndex !== null) {
    return attributeData[valueIndex].value === null;
  }

  for (const valueData of attributeData) {
    if (valueData.value === null) {
      return true;
    }
  }

  return false;
}

export function hasEmptyValues(state: State, rowIndex: number, attributeName: string, valueIndex: number | null): boolean {
  const attributeData = state.data[rowIndex].currentData.attributes[attributeName];

  if (valueIndex !== null) {
    return attributeData[valueIndex].value !== null && attributeData[valueIndex].value!.trim() === '';
  }

  for (const valueData of attributeData) {
    if (valueData.value !== null && valueData.value.trim() === '') {
      return true;
    }
  }

  return false;
}
