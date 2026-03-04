/**
 * This file contains functions that are necessary for importing and exporting
 * table-like file formats like csv and xlsx
 */


import Data, { DataAttributePart } from "@/types/Data";
import MetaData, { MetaAttributeType } from "@/types/MetaData";
import { ExportOptions, ImportOptions, ImportReturn } from "./veto-files";
import { IDelimiterMode } from "@/types/FileData";
import { buildMetaAttributeColumnName } from "@/helper/meta-attributes";
import { addAttributeToMetaData, filterExportData, getVetoText } from "./file-functions";
import { AttributeValidationObject } from "@/types/ImportSummary";

/**
 * This Interface associates a column name with the columns content in the table row it represents.
 * It also matches with the data structure used by the csv parser library and must therefore not be changed
 */
export interface TableRowContent {
    [columnName: string]: string | number | boolean | null
}

type AttributeColumnType = "TEXT" | "OLD" | "CHECK" | "VALUE" | "START" | "END" | "META";
type AttribColumnType = "VALUE" | "START" | "END";
interface AttributeColumnPrefix {
  prefix: string
  type: AttributeColumnType
}

type CellHandler = (cellValue: string, data: Data, meta: MetaData, errors: Array<string>) => Promise<void>;

//  List of further types of columns containing information about a special attribute with their 'types' that indicates to which field in a Data object the content a column belongs to
export const attributeColumnPrefixes: Array<AttributeColumnPrefix>  = [
    { prefix: 'veto_text', type: "TEXT"},
    { prefix: 'veto_check', type: "CHECK"},
    { prefix: 'veto_attr_value', type: "VALUE"},
    { prefix: 'veto_attr_old', type: "OLD"},
    { prefix: 'veto_attr_start', type: "START"},
    { prefix: 'veto_attr_end', type: "END"},
    { prefix: 'veto_meta', type: "META"}
];

/**
 * Function that concatenates the data of the given attribute part for the VETO_ATTR_OLD column.
 * @param data Data to concatenate.
 * @param delimiter Delimiter for separating value and indices of one annotation.
 * @returns The concatenated value.
 */
function concatenateOld(data: DataAttributePart, delimiter: IDelimiterMode): string {
  if (data.start === null && data.end === null && data.value === null) {
    return "";
  } else {
    return `${data.value ?? ''}${delimiter.value}${data.start ?? ''}${delimiter.value}${data.end ?? ''}`;
  }
}

function concatenateValues(parts: Array<string | null> | Array<number | null>, valueDelimiter: IDelimiterMode): string {
    let ret: string = "";
    let firstEntry: boolean = true;
    for(let part of parts) {
        if(firstEntry) firstEntry = false;
        else ret += valueDelimiter.value;

        if (part != null)
        {
          ret += part.toString();
        }
    }
    return ret;
}

/**
 * This function converts the data and the meta data into an actual table structure that can be written into a table file format like csv and xlsx.
 * @param meta Meta Data Object
 * @param data Array of Data that must be parsed into the table format
 * @param options Contains additional options for exporting
 * @returns
 */
export function getTableByData(meta: MetaData, data: Data[], options: ExportOptions): {
  head: string[],
  body: Array<TableRowContent>
} {
    /**
     * The first part of the function generates an array of columns for the table structure.
     * Each entry will also contain a callback function that maps a Data object to a string value that can be used a a cell content for the Data object.
     *
     * The second part of the function iterates over all loaded Data objects and adds a row by calling the callback functions for each column.
     */

    // Build an array of columns to be included in the table. Each entry contains the name of the column and a callback function to map a
    // record in the VETO Table into a value for this specific column.
    let columns: Array<{columnName: string, valueByData: (data: Data) => string}> = [];

    // Add an entry for the text column which must contain the annotated text or its file name
    const textColumnName: string = meta.textColumnName ? meta.textColumnName : "text";
    const textColumnTitle = options.columnsToBeExported === "ONLY_ATTRIBS" ? textColumnName : "VETO_TEXT_" + textColumnName;
    columns.push({columnName: textColumnTitle, valueByData: (data: Data) => meta.usingExternalTextFiles ? data.externalTextFileName! : data.text});

    // Attributes
    Object.keys(meta.attributes).forEach((attribute) => {
        switch(options.columnsToBeExported) {
            case "ALL":
            case "ONLY_VETO":
                columns.push({columnName: `VETO_ATTR_VALUE_${attribute}`, valueByData: (data: Data) => concatenateValues(data.currentData.attributes[attribute].map(p => p.value), meta.formatSpecificAttribs.VALUE_DELIMITER!)});
                columns.push({
                columnName: `VETO_ATTR_OLD_${attribute}`,
                valueByData: (data: Data) => {
                  const oldValues = data.oldData.attributes[attribute].map(p => concatenateOld(p, meta.formatSpecificAttribs.CSV_FILE_DELIMITER));
                  return concatenateValues(oldValues, meta.formatSpecificAttribs.VALUE_DELIMITER!)
                }
              });
                columns.push({columnName: `VETO_ATTR_START_${attribute}`, valueByData: (data: Data) => concatenateValues(data.currentData.attributes[attribute].map(p => p.start), meta.formatSpecificAttribs.VALUE_DELIMITER!)});
                columns.push({columnName: `VETO_ATTR_END_${attribute}`, valueByData: (data: Data) => concatenateValues(data.currentData.attributes[attribute].map(p => p.end), meta.formatSpecificAttribs.VALUE_DELIMITER!)});
                break;
            case "ONLY_ATTRIBS":
                columns.push({columnName: attribute, valueByData: (data: Data) => concatenateValues( data.currentData.attributes[attribute].map(p => p.value), meta.formatSpecificAttribs.VALUE_DELIMITER!)});
                break;
        }
    });

    // Meta-Attributes
    Object.keys(meta.validMetaAttributes).forEach((metaAttribute) => {
        switch(options.columnsToBeExported) {
            case "ALL":
            case "ONLY_VETO":
                const columnName = buildMetaAttributeColumnName(metaAttribute, meta.validMetaAttributes[metaAttribute]);

                columns.push({columnName: columnName, valueByData: (data: Data) => concatenateValues(data.currentData.metaAttributes[metaAttribute].map(p => p.value), meta.formatSpecificAttribs.VALUE_DELIMITER!)});

              columns.push({
                columnName: `VETO_META_OLD_${metaAttribute}`,
                valueByData: (data: Data) => {
                  const oldValues = data.oldData.metaAttributes[metaAttribute].map(p => p.value);
                  return concatenateValues(oldValues, meta.formatSpecificAttribs.VALUE_DELIMITER!)
                }
              });
                break;
            case "ONLY_ATTRIBS":
                columns.push({columnName: metaAttribute, valueByData: (data: Data) => concatenateValues( data.currentData.metaAttributes[metaAttribute].map(p => p.value), meta.formatSpecificAttribs.VALUE_DELIMITER!)});
                break;
        }
    });

    // Veto Check (indicates if a record has been validated as 'checked' in the Veto Table)
    if(options.columnsToBeExported !== "ONLY_ATTRIBS") {
        columns.push({columnName: "VETO_CHECK", valueByData: (data: Data) => data.currentData.checked.toString()});
    }

    // Other columns
    if (options.columnsToBeExported !== 'ONLY_VETO') {
        for (const attributeName of meta.otherColumns) {
            columns.push({columnName: attributeName, valueByData: (data: Data) => data.otherColumns[attributeName]});
        }
    }

    const dataToBeExported: Array<Data> = filterExportData(data, options);

    const head = columns.map(column => column.columnName);
    const body = dataToBeExported.map(d => {
        let obj: TableRowContent = {};
        columns.forEach((column) => {
            obj[column.columnName] = column.valueByData(d);
        })
        return obj;
    });

    return {head, body};
}

/**
 * This function checks for every given attribute name if all necessary columns have been specified
 * @param attribValidationData object providing the necessary information for every attribute name
 * @param errors Array of errors the function can add error messages to
 * @returns true if and only if all attributes in attribValidationData have all necessary columns
 */
function addMissingAttributeColumnsErrors(attribValidationData: AttributeValidationObject, errors: Array<string>): boolean {
    let valid = true;
    for(const attribName of Object.keys(attribValidationData)) {
        const obj = attribValidationData[attribName];
        if (!(obj.VETO_ATTR_VALUE || (obj.VETO_ATTR_START && obj.VETO_ATTR_END))) {
            valid = false;

            let message = 'The file is missing the "VETO_ATTR_VALUE" column or ';
            if (!obj.VETO_ATTR_START && !obj.VETO_ATTR_END) {
              message += "the VETO_ATTR_START";

              if (!obj.VETO_ATTR_END) {
                message += ' and the "VETO_ATTR_END"';
              }

              message += " column";

            } else {
              message += 'the "VETO_ATTR_END" column';
            }
            message += ` for the attribute "${attribName}"`;
            errors.push(message);
        }
    }

    return valid;
}

/**
 * This function iterates over column names of the header and finds out if the header is valid or contains errors
 * @param columns Array of column names
 * @param importReturn Result of the import
 * @returns a filtered array containing only the valid headers
 */
function validateHeader(columns: Array<string>, importOptions: ImportOptions, importReturn: ImportReturn): Array<string> {
    const previousFields: Set<string> = new Set();

    let foundVetoTextColumn: boolean = false;

    // This object saves for every attribute if the necessary columns have occured already
    importReturn.attributeValidation = {};

    const validColumnNames: Array<string> = [];

    if (importOptions.hasVetoColumns) {
      columns.forEach(columnName => {
        const lowerCaseColumnName: string = columnName.toLowerCase();

        let valid: boolean = true;

        if(columnName.trim() === "") {
          importReturn.errors.push(`Column names must not be empty`);
          valid = false;
        }

        if(previousFields.has(lowerCaseColumnName)) {
          importReturn.errors.push(`The file contains multiple columns with the name "${columnName}"`);
          valid = false;
        }

        // Iterate over the list of possible prefixes for the column names. If the prefix is found, proceed according to the type of prefix
        attributeColumnPrefixes.forEach(current => {
          if(lowerCaseColumnName.startsWith(current.prefix)) {
            switch(current.type)  {
              case "CHECK":
                importReturn.hasCheckColumn = true;
                break;
              case "TEXT":
                foundVetoTextColumn = true;
              case "OLD":
              case "VALUE":
              case "START":
              case "END":
                if(columnName.length === current.prefix.length) {
                  importReturn.errors.push(`The column ${columnName} consist of the prefix only.`);
                  valid = false;
                }

                // if the current column belongs to an attribute, save that the current type of column already occured
                if(current.type !== "TEXT"){
                  const attribName: string = columnName.substring(current.prefix.length + 1); // the attribute name is behind the prefix and the '_'.
                  if(!importReturn.attributeValidation.hasOwnProperty(attribName)) {
                    importReturn.attributeValidation[attribName] = {
                      VETO_ATTR_OLD: false,
                      VETO_ATTR_VALUE: false,
                      VETO_ATTR_START: false,
                      VETO_ATTR_END: false,
                    };
                  }

                  switch(current.type) {
                    case "OLD":
                      importReturn.attributeValidation[attribName].VETO_ATTR_OLD = true;
                      break;
                    case "VALUE":
                      importReturn.attributeValidation[attribName].VETO_ATTR_VALUE = true;
                      break;
                    case "START":
                      importReturn.attributeValidation[attribName].VETO_ATTR_START = true;
                      break
                    case "END":
                      importReturn.attributeValidation[attribName].VETO_ATTR_END = true;
                      break;
                  }
                }
                break;
              case "META":
                if (lowerCaseColumnName.startsWith("veto_meta_old")) {
                  if(columnName.length === "veto_meta_old".length) {
                    importReturn.errors.push(`The column ${columnName} consist of the prefix only.`);
                    valid = false;
                  }
                } else {
                  /**
                   * Example for a meta column name: VETO_META_ENUM_attributeName__enum1__enum2__enum3
                   */
                  const parts = columnName.split("_");
                  if (parts.length < 4) {
                    importReturn.errors.push("Meta attribute must contain at least a type and a name!");
                    valid = false;
                  }
                }
                break;
            }
          }
        });

        previousFields.add(lowerCaseColumnName);

        // If columnName is valid, add it to the array of valid column names
        if(valid) validColumnNames.push(columnName);
      });
    } else {
      columns.forEach(columnName => {
        if (columnName === importOptions.textColumn) {
          foundVetoTextColumn = true;
        } else if (importOptions.attributeColumns.includes(columnName)) {
          importReturn.attributeValidation[columnName] = {
            VETO_ATTR_OLD: false,
            VETO_ATTR_VALUE: true,
            VETO_ATTR_START: false,
            VETO_ATTR_END: false,
          };
        }

        validColumnNames.push(columnName);
      });
    }

    if(!foundVetoTextColumn) {
        importReturn.errors.push("No text column found!");
    }

    addMissingAttributeColumnsErrors(importReturn.attributeValidation, importReturn.errors);

    return validColumnNames;
}

/**
 * This function assumes that a given cell value from the table file contains a boolean value that it will parse and return.
 * @param cellValue Value of the cell
 * @param options Further import options
 * @param columnName The name of the column. It it required for creating a proper error message.
 * @param errors Array of error messages in which the function can add further errors
 * @returns The parsed boolean value or undefined
 */
function getBoolFromTextCell(cellValue: string, options: ImportOptions, columnName: string, errors: Array<string>): boolean  {
  if (cellValue === undefined || cellValue === null || cellValue === "") {
    return false;
  }
    const lowerCaseCellContent = cellValue.toLowerCase();
    if(lowerCaseCellContent === "true") {
        return true;
    } else if(lowerCaseCellContent === "false") {
        return false;
    } else {
        errors.push(`The value of the field "${columnName}" must be true or false but was "${cellValue}".`);
        return false;
    }
}

function splitMultiValues(cellValue: string, valueDelimiter: IDelimiterMode | null): Array<string> {
    let stringValues: string[] = [];

    // Make stringValues an array of all values for the indices in stringValue
    if (valueDelimiter !== null) {
        stringValues = cellValue.split(valueDelimiter.value);
    } else {
        stringValues = [cellValue]; // If no valueDelimiter is specified, assume that the stringValue is the only value
    }

    return stringValues;
}

/**
 * This function splits a string of indices separated by a delimiter and returns and array of these numbers
 * Example: "1;2;3", ';' -> [1, 2, 3]
 * @param cellValue string value to be split
 * @param columnName name of the column that the callValue belongs to. Required for generating more precise error messages
 * @param errors Arrays of errors in which the function can add new errors to
 * @param valueDelimiter delimiter which is being used to split the string
 * @returns array of numbers. If an error occurred, the function will return an empty array
 */
function splitIndices(cellValue: string, columnName: string, errors: Array<string>, valueDelimiter: IDelimiterMode | null): Array<number | null> {
  const stringValues: string[] = splitMultiValues(cellValue, valueDelimiter); // If no valueDelimiter is specified, this function will return an array with just the cellValue

    let invalidValues: boolean = false;
    let numericValues: Array<number | null> = [];
    stringValues.forEach(s => {
        if(s.trim().length === 0) {
          // If the current part is an empty string, define value as missing and insert a null-value instead
          numericValues.push(null);
          return;
        }

        const numericValue: number = parseInt(s, 10);
        if(isNaN(numericValue)) {
            if(valueDelimiter !== undefined) {
                errors.push(`A value of the field "${columnName}" must contain numbers separated by the delimiter "${valueDelimiter}" but was "${cellValue}".`);
            } else {
                errors.push(`A value of the field "${columnName}" was "${cellValue}" which could not be parsed into a list of numbers. No Delimiter was specified.`)
            }

            invalidValues = true;
        } else numericValues.push(numericValue);
    });
    return !invalidValues ? numericValues : [];
}

/**
 * This function takes an attribute name as an argument and returns an array with the corresponding attribute parts.
 * If no such array exists already, the function will add an entry.
 * @param attribName Name of the attribute
 * @param data Data Object in which the the attribute must be found
 * @returns Array of DataAttributeParts
 */
function findAttributeByName(attribName: string, data: Data): Array<DataAttributePart> {
    if(!Object.hasOwn(data.currentData.attributes, attribName)) {
        data.currentData.attributes[attribName] = [];   // Create new array of AttributeParts
    }

    return data.currentData.attributes[attribName];
}

/**
 * This function handles a cell value that belongs to an attribute column (like VETO_ATTRIB_VALUE or VETO_ATTRIB_START) and writes its single containing values into a corresponding field in the Data object
 * @param attribColumnType Indicates the type of attribute column
 * @param cellValue The content of the cell
 * @param attribName Name of the attribute this cells column belongs to
 * @param columnName Name of the cells column
 * @param data Data object the value must be parsed into
 * @param meta Meta Data object
 * @param valueDelimiter Delimiter separating the single values inside the cellValue
 * @param errors List of errors
 */
function handleAttributesColumn(attribColumnType: AttribColumnType, cellValue: string, attribName: string, columnName: string, data: Data, meta: MetaData, valueDelimiter: IDelimiterMode | null, errors: Array<string>) {
    // List of continuous attribute parts, that have already been created from a different column value associated with the same attribute
    const attribParts: Array<DataAttributePart> = findAttributeByName(attribName, data);
    const isInitialAttributePart: boolean = attribParts.length === 0;   // Indicates if a list of annotationParts has already been created or not

    // List of different values from this attribute
    let values: Array<string> | Array<number | null>;

    // Based the type of the attribute column, parse the cellValue in different ways
    switch(attribColumnType) {
        case "VALUE":
            values = splitMultiValues(cellValue, valueDelimiter);   // String array
            break;
        case "START":
        case "END":
            values = splitIndices(cellValue, columnName, errors, valueDelimiter);   // Number array
            break;
    }

    // An attribute has multiple columns (for content, start and end indices, etc.)
    // After splitting the single values in the cell, ensure that possible previous columns of this attribute had the same number of single values
    if(isInitialAttributePart) {
        // For every determined value: Add a corresponding AttributePart. If the values-array is empty, ensure that the loop is being run at least once.
        // This ensures that every attribute has at least one value, even if that value is empty
        for(let valueIndex: number = 0; valueIndex < values.length || valueIndex === 0; valueIndex += 1) {
            attribParts.push({ id: meta.nextId, value: null, start: null, end: null}); // Actual values will be added at the end of the function
            meta.nextId += 1;
        }
    } else {
      // If the array of this attribute is already initialized, assume that a previous cell value (from a different column, but associated to the same attribute)
      // has already created all the attribute parts.

      if(attribParts.length !== values.length) {
        // In order to insert the different multi values we must assume that all associated columns (VETO_ATTRIB_VALUE, ..._START, ..._END) have exactly the same number of multi-values
        // If this is not the case create an error message.
        errors.push(`The cell "${cellValue}" of column "${columnName}" contains ${values.length}
            different values but a different cell for this attribute contains ${attribParts.length} different values.`);
        return;
      }
    }

    for(const i in attribParts) {
      switch(attribColumnType) {
          case "VALUE":
              attribParts[i].value = values[i] as string;
              break;
          case "START":
              attribParts[i].start = values[i] as number;
              break;
          case "END":
              attribParts[i].end = values[i] as number;
              break;
      }
    }

    if (values.length > 1) {
      meta.containsMultiValueAttributes = true;
    }
}

/**
 * This function writes the value of meta attribute column into the corresponding field in a specified data object
 * @param cellValue value of the given column in row
 * @param attribName name of the meta attribute
 * @param data data object where the data must be written into
 * @param meta meta data object providing the next field id to be used
 * @param errors list of errors the function could add errors to
 */
function handleMetaAttributesColumn(cellValue: string | null, attribName: string, data: Data, meta: MetaData, errors: Array<string>) {
  if (cellValue == '') {
    cellValue = null;
  }

    data.currentData.metaAttributes[attribName] = [];

    data.currentData.metaAttributes[attribName].push({id: meta.nextId, value: cellValue});

    meta.nextId += 1;
}

/**
 * Parses a cell of the VETO_OLD column.
 * Adds the parsed data to the given Data object.
 * Adds errors to the given array if the cell could not be parsed.
 * @param cellValue Value of the cell.
 * @param attribName Name of the attribute.
 * @param columnName Name of the column.
 * @param data Data to be written.
 * @param errors Array of errors to be written in case of an error.
 * @param oldDelimiter Delimiter for separating value and indices of one annotation.
 * @param valueDelimiter Delimiter for separating multiple annotations of the attribute.
 */
function handleOldColumn(cellValue: string, attribName: string, columnName: string, data: Data, errors: Array<string>, oldDelimiter: IDelimiterMode, valueDelimiter: IDelimiterMode | null) {
  data.oldData.attributes[attribName] = [];

  const values = splitMultiValues(cellValue, valueDelimiter);
  for (const value of values) {
    doHandleOldColumn(value, attribName, columnName, data, errors, oldDelimiter);
  }
}

/**
 * Parses the old of one annotation in the VETO_OLD column.
 * Adds the parsed data to the given Data object.
 * Adds errors to the given array if the cell could not be parsed.
 * @param cellValue The old value of one annotation.
 * @param attribName Name of the attribute.
 * @param columnName Name of the column.
 * @param data Data to be written.
 * @param errors Array of errors to be written in case of an error.
 * @param oldDelimiter Delimiter for separating value and indices of one annotation.
 */
function doHandleOldColumn(cellValue: string, attribName: string, columnName: string, data: Data, errors: Array<string>, oldDelimiter: IDelimiterMode) {
  if (cellValue.length === 0) {
    data.oldData.attributes[attribName].push({id: -1, value: null, start: null, end: null});
    return;
  }

  const stringValues = splitMultiValues(cellValue, oldDelimiter);

  if (stringValues.length < 3) {
    errors.push(`The old column of "${columnName}" must contain a string value, a start and an end index separated by the delimiter "${oldDelimiter.value}" but was "${cellValue}".`);
    return
  }

  let oldValue = stringValues.slice(0, -2).join(oldDelimiter.value);

  let invalidValues = false;

  let oldStart;
  const oldStartString = stringValues[stringValues.length - 2];
  if (oldStartString === '') {
    oldStart = null;
  } else {
    oldStart = parseInt(oldStartString, 10);
    if(isNaN(oldStart)) {
      errors.push(`The old column of "${columnName}" must contain a start index at the second position.`);
      invalidValues = true;
    }
  }

  let oldEnd;
  const oldEndString = stringValues[stringValues.length - 1];
  if (oldEndString === '') {
    oldEnd = null;
  } else {
    oldEnd = parseInt(oldEndString, 10);
    if(isNaN(oldEnd)) {
      errors.push(`The old column of "${columnName}" must contain a start index at the second position.`);
      invalidValues = true;
    }
  }

  if (invalidValues) {
    return;
  }

  data.oldData.attributes[attribName].push({id: -1, value: oldValue, start: oldStart, end: oldEnd});
}

function handleOldMetaAttributesColumn(cellValue: string, attribName: string, data: Data) {
  data.oldData.metaAttributes[attribName] = [];
  data.oldData.metaAttributes[attribName].push({id: -1, value: cellValue});
}

/**
 * This function returns a handler function that extracts information from a string and modifies a Data object in a fitting manner according to the column name
 * For example: A column starting with "veto_text_" is a text column and therefore every cell value from this column must be copied in the text field of the data object.
 * @param columnName Name of the column. Based on the column name, the returned function will insert a cell value in a corresponding way.
 * @param meta Meta data object that will be updated with further information about the column.
 * @param options Further options describing the way the returned functions has to behave
 * @returns Function that takes a cell value from a column with the given name and inserts its value into the a given Data object.
 */
function getCellHandler(columnName: string, meta: MetaData, options: ImportOptions): CellHandler {
  if (!options.hasVetoColumns) {
    // Columns have no prefixes and therefore are handled as attribute values or as the text column
    if (columnName === options.textColumn) {
      meta.textColumnName = columnName;
      return getTextCellHandler(options);
    } else if (options.attributeColumns.includes(columnName)) {
      addAttributeToMetaData(columnName, meta, options);
      return getAttrCellHandler(options, "VALUE" as AttribColumnType, columnName, columnName);
    } else {
      meta.otherColumns.push(columnName);
      return getOtherCellHandler(columnName);
    }
  }

    const lowerCaseColumnName = columnName.toLowerCase();

    let prefix: AttributeColumnPrefix | null = null;
    for(const currentPrefix of attributeColumnPrefixes) {
        if(lowerCaseColumnName.startsWith(currentPrefix.prefix)) {
            prefix = currentPrefix;
            break;
        }
    }

    if(prefix === null) {
        // if the cell name does not start with one of the specified prefixes, assume that the column has no deeper purpose.
        // Its values must be cached for a later export so these information will not get lost.
        meta.otherColumns.push(columnName);
        return getOtherCellHandler(columnName);
    }


    // If the current column starts with one of the prefixes, add the attribute name to the meta object if necessary and return a proper cell handler
    const afterPrefix = columnName.substring(prefix.prefix.length + 1); // get the content after the prefix and the '_'
    switch(prefix.type) {
        case "OLD":
          if(!Object.hasOwn(meta.attributes, afterPrefix)) {
            addAttributeToMetaData(afterPrefix, meta, options);
          }
          return async (cellValue: string, data: Data, meta: MetaData, errors: Array<string>) => {
            handleOldColumn(cellValue, afterPrefix, columnName, data, errors, meta.formatSpecificAttribs.CSV_FILE_DELIMITER, options.valueDelimiter);
          }
        case "META":
          const parts = afterPrefix.split("_");
          const attributeName = parts[1];

          if (lowerCaseColumnName.startsWith("veto_meta_old")) {

            return async (cellValue: string, data: Data, meta: MetaData, errors: Array<string>) => {
              handleOldMetaAttributesColumn(cellValue, attributeName, data);
            }
          } else {
            const type = parts[0] as MetaAttributeType;

            switch (type) {
              case(MetaAttributeType.ENUM):
                const enumValues = columnName.split("__");

                meta.validMetaAttributes[attributeName] = {type: MetaAttributeType.ENUM, values: enumValues.slice(1)};
                break;
              case(MetaAttributeType.NUMBER):
                meta.validMetaAttributes[attributeName] = {type: MetaAttributeType.NUMBER, values: []};
                break;
              case(MetaAttributeType.TEXT):
                meta.validMetaAttributes[attributeName] = {type: MetaAttributeType.TEXT, values: []};
                break;
            }

            return async (cellValue: string, data: Data, meta: MetaData, errors: Array<string>) => {
              handleMetaAttributesColumn(cellValue, attributeName, data, meta, errors);
            }
          }
        case "TEXT":
            if(afterPrefix.length > 0) {
                meta.textColumnName = afterPrefix;
            }

            return getTextCellHandler(options);
        case "CHECK":
            return async (cellValue: string, data: Data, meta: MetaData, errors: Array<string>) => {
              data.currentData.checked = getBoolFromTextCell(cellValue, options, "VETO_CHECK", errors);
            }
        case "VALUE":
        case "START":
        case "END":
            // Register the attribute name of the current column as a new attribute in the meta data object if it does not exist there already
            if(!Object.hasOwn(meta.attributes, afterPrefix)) {
                addAttributeToMetaData(afterPrefix, meta, options);
            }

            return getAttrCellHandler(options, prefix.type, afterPrefix, columnName);
    }
}

export async function parseTable(result: ImportReturn,
                                 header: Array<string>,
                                 rows: Array<{ [columnName: string]: string }>,
                                 options: ImportOptions
): Promise<void> {
    // The n-th entry of this array provides a handler function that takes the content of a cell of a column and writes its content
    // in a corresponding manner into a given Data object. Must be applied with the cells of the n-th column.
    const cellHandlers: Array<CellHandler> = [];

  // Remove all invalid columns from the header. The function will also push error messages the error list
    const filteredHeader = validateHeader(header, options, result);

    if(filteredHeader.length === 0) return;

    filteredHeader.forEach(columnName => {
        cellHandlers.push(getCellHandler(columnName, result.meta, options));
    });

    // Iterate over every row and thereby, create a new Data object to be added to the end result
    for (const row of rows) {
      const newData: Data = {
        currentData: {
          attributes: {},
          checked: false,
          metaAttributes: {},
        },
        changelogBase: {
          attributes: {},
          checked: false,
          metaAttributes: {},
        },
        oldData: {
          attributes: {},
          checked: false,
          metaAttributes: {},
        },
        otherColumns: {},
        text: "",
        textLineBreak: "",
      };


        for(let i in filteredHeader) {
            // The name of the current column
            const columnName = filteredHeader[i];

            // The function that modifies the Data object being generated in a manner of the current column object
            const columnFunction = cellHandlers[i];

            // The content of the current cell
            const cellContent = row[columnName];

            // Add the cell content to the new data object in an appropriate manner according to the type of column
            await columnFunction(cellContent, newData, result.meta, result.errors);
        }

        result.data.push(newData);
    }
}

/**
 * Returns the cell handler for the text columns.
 * @param options Import options.
 * @returns Cell handler for the text columns.
 */
function getTextCellHandler(options: ImportOptions): CellHandler {
  return async (cellValue: string, data: Data, meta: MetaData, errors: Array<string>) => {
    const text: string | undefined = await getVetoText(cellValue, options, errors);
    data.text = text !== undefined ? text : '';
  };
}

/**
 * Returns the cell handler for attribute columns.
 * @param options The import options.
 * @param type The type of the attribute column.
 * @param afterPrefix The attribute name without the VETO prefix.
 * @param columnName The complete column name.
 * @returns Cell handler for attribute columns.
 */
function getAttrCellHandler(options: ImportOptions, type: AttribColumnType, afterPrefix: string, columnName: string): CellHandler {
  return async (cellValue: string, data: Data, meta: MetaData, errors: Array<string>) => {
    handleAttributesColumn(type, cellValue, afterPrefix, columnName, data, meta, options.valueDelimiter, errors);
  }
}

/**
 * Returns the cell handler for columns not containing annotations or meta-attributes.
 * @param columnName The complete column name.
 * @returns Cell handler for columns not containing annotations or meta-attributes.
 */
function getOtherCellHandler(columnName: string): CellHandler {
  return async (cellValue: string, data: Data, meta: MetaData, errors: Array<string>) => {
    data.otherColumns[columnName] = cellValue;
  };
}
