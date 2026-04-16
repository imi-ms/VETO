export const delimiters = [';', ',', '\t', '|'] as const;
export type Delimiter = string | typeof delimiters[number];

export type DelimiterMode = 'AUTO' | 'COMMA' | 'SEMICOLON' | 'TAB' | 'VERTICAL_BAR';

export interface IDelimiterMode {
  type: DelimiterMode
  label: string
  value: Delimiter
}

export class DelimiterModes {
  static readonly AUTO: IDelimiterMode = {type: 'AUTO', label: 'Auto detect', value: ''};
  static readonly COMMA: IDelimiterMode = {type: 'COMMA', label: ',', value: ','};
  static readonly SEMICOLON: IDelimiterMode = {type: 'SEMICOLON', label: ';', value: ';'};
  static readonly TAB: IDelimiterMode = {type: 'TAB', label: '\\t', value: '\t'};
  static readonly VERTICAL_BAR: IDelimiterMode = {type: 'VERTICAL_BAR', label: '|', value: '|'};

  static getDelimiterMode(type: DelimiterMode): IDelimiterMode {
    return DelimiterModes[type];
  }
}

export const linebreaks = ['\r', '\n', '\r\n', ''] as const
export type Linebreak = typeof linebreaks[number];

export const quoteChars = ['"', "'"] as const;
export type QuoteChar = typeof quoteChars[number];

export const fileEncodings = ['UTF-8'] as const;
export type FileEncoding = typeof fileEncodings[number];
