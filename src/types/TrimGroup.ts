/**
 * Available trim groups.
 */
export enum TrimGroup {
  BRACES = "BRACES",
  DASHES = "DASHES",
  LETTERS = "LETTERS",
  LOGOGRAMS = "LOGOGRAMS",
  MATH_SYMBOLS = "MATH_SYMBOLS",
  NUMBERS = "NUMBERS",
  PUNCTUATION = "PUNCTUATION",
  QUOTES = "QUOTES",
  UNITS = "UNITS",
  WHITESPACES = "WHITESPACES",
}

/**
 * Attributes for trim groups.
 */
export interface ITrimGroup {
  /**
   * Pattern to be matched.
   * Null indicates custom handling.
   */
  pattern: RegExp | null,
  /**
   * Label shown in the settings.
   */
  label: string,

  /**
   * Example characters contained in the trim group.
   */
  example: string,
}

/**
 * Definition of all trim groups.
 */
export const TrimGroups: {[key in TrimGroup]: ITrimGroup} = {
  BRACES: {pattern: /[{\[()\]}]/, label: "Braces", example: "{ [ ( ) ] }"},
  DASHES: {pattern: /[\/|_—–]/, label: "Dashes and Slashes", example: "\\ / | _ — –"},
  LETTERS: {pattern: /\p{L}/gu, label: "Letters", example: "a-z A-Z ä é ..."},
  LOGOGRAMS: {pattern: /[#$€%&@§^`~°]/, label: "Logograms", example: "# $ € % & @ § ^ ` ~ °"},
  MATH_SYMBOLS: {pattern: /[<>*+=±×÷]/, label: "Math Symbols", example: "< > * + = ± × ÷"},
  NUMBERS: {pattern: /[0-9]/, label: "Numbers", example: "0-9"},
  PUNCTUATION: {pattern: /[.,;:!?¿¡…]/, label: "Punctuation", example: ". , ; : ! ? ¿ ¡ …"},
  QUOTES: {pattern: /[„“”‚‘’'"]/, label: "Quotes", example: " „ “ ” ‚ ‘ ’ ' \""},
  UNITS: {pattern: null, label: "Units after Numbers", example: "h m/s cm³"},
  WHITESPACES: {pattern: /\s/, label: "Whitespaces", example: "Space Tab Linebreak"},
}

/**
 * Defines the handling of trim groups.
 */
export enum TrimState {
  EXPAND = "EXPAND",
  IGNORE = "IGNORE",
  TRIM = "TRIM",
}

export interface ITrimState {
  /**
   * Label shown in the settings.
   */
  label: string;
}

/**
 * Definition of all trim states.
 */
export const TrimStates: { [key in TrimState]: ITrimState } = {
  EXPAND: {label: "Expand"},
  IGNORE: {label: "Unchanged"},
  TRIM: {label: "Trim"},
}
