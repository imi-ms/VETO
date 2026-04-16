import {DelimiterModes, IDelimiterMode, Linebreak, QuoteChar} from "./FileData";
import { Color } from "@/types/Color";

/**
 * Describes the structure of the table
 */
export default interface MetaData {
    fileName: string                    // Specifies the name of the file
    textColumnName?: string
    attributes: ValidAttributeData,
    containsMultiValueAttributes: boolean,
    nextId: number,
    usingExternalTextFiles: boolean,
    formatSpecificAttribs: {
        CSV_FILE_DELIMITER: IDelimiterMode, // For csv
        LINE_BREAK: Linebreak,              // For csv
        VALUE_DELIMITER: IDelimiterMode     // For csv and xlsx
        QUOTE_CHAR: QuoteChar;              // For json and csv
        XLSX_CREATOR?: string               // For xlsx, indicates the original creator of the xlsx file
    }
    otherColumns: Array<string>             // specifies a list of additional columns that were specified in a file but are not being processed by Veto

    validMetaAttributes: ValidMetaAttributeData
}

/**
 * This function returns a new MetaData object that is initialized with default values
 * @param fileName Name of the file
 * @returns New MetaData object
 */
export function getDefaultMetaData(fileName: string): MetaData{
    return {
        fileName: fileName,
        attributes: {},
        containsMultiValueAttributes: false,
        nextId: 0,
        usingExternalTextFiles: false,
        formatSpecificAttribs: {
            CSV_FILE_DELIMITER: DelimiterModes.getDelimiterMode('COMMA'),
            LINE_BREAK: '\r\n',
            VALUE_DELIMITER: DelimiterModes.getDelimiterMode('SEMICOLON'),
            QUOTE_CHAR: '"',
        },
        otherColumns: [],
        validMetaAttributes: {}
    };
}

export enum AttributeType {
    ATTRIBUTE,
    META_ATTRIBUTE,
}

export enum MetaAttributeType {
    ENUM = "ENUM",
    NUMBER = "NUMBER",
    TEXT = "TEXT",
}

export interface ValidAttribute {
  /**
   * Specifies the color of the annotation.
   */
  color: string
  /**
   * Regular expression for validating the annotation value.
   */
  validationRegEx: string | null
}

export interface ValidAttributeData {
    [attributeName: string]: ValidAttribute
}

export interface ValidMetaAttribute {
    type: MetaAttributeType
    values: string[]
}

export interface ValidMetaAttributeData {
    [attributeName: string]: ValidMetaAttribute
}
