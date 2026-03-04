import MetaData from "@/types/MetaData"
import Data, {VetoData} from "@/types/Data"

import CsvFileConverter from "./csv"
import { DownloadColumnMode, DownloadFormat } from "@/types/DownloadMode"
import JsonFileConverter from "./json"
import { IDelimiterMode, Linebreak, QuoteChar } from "@/types/FileData"
import { AnnotationColorSchemeType } from "@/types/AnnotationColorScheme"
import XlsxFileConverter from "./xlsx"
import { AttributeValidationObject } from "@/types/ImportSummary";
import { findLinebreaks } from "@/helper/utility";

/**
 * This function takes a filename as an argument and removes its first extension at the end
 * @param filename Name of the file including the file extension at the end
 * @returns filename without the extension
 */
export function getFilenameWithoutExtension(filename: string ) {
    const lastIndex: number = filename.lastIndexOf('.');
    if(lastIndex < 0) return filename;
    return filename.substring(0, lastIndex);
}

/**
 * This function downloads a given Blob object
 * @param filename name of the file to be created
 * @param blob blob to be downloaded
 */
function downloadBlob(filename: string, blob: Blob) {
    // Remove incompatible characters
    const saveFileName = filename.replace(/\.[^/.]+$/, "");

    // Create a new DOM Element that provides a download link to the file
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("style", "none");
    downloadAnchorNode.setAttribute("download", saveFileName);

    document.body.appendChild(downloadAnchorNode);  // Required by Firefox

    // Create a new URL that is being associated with the Blob Object
    var url = window.URL.createObjectURL(blob);
    downloadAnchorNode.setAttribute("href", url);

    // Click the new DOM Element to trigger the download
    downloadAnchorNode.click();

    // Remove the DOM Element again
    downloadAnchorNode.remove();
    window.URL.revokeObjectURL(url);
}

export interface ExportOptions {
    columnsToBeExported: DownloadColumnMode
    rowsToBeExported: "ALL" | "ONLY_CHECKED" | "ONLY_UNCHECKED"
}

export interface ExportReturn {
    fileContent: any,
    errors: Array<string>
}

export interface ImportOptions {
    multipleFiles: boolean
    detectMultipleValue: boolean
    valueDelimiter: IDelimiterMode | null     // if undefined, the value delimiter must be found during parsing
    csvDelimiter: IDelimiterMode | undefined
    csvLinebreak: Linebreak | undefined
    csvQuoteChar: QuoteChar | undefined
    colorScheme: AnnotationColorSchemeType

    externalTextFiles?: Array<File>

    // Currently only used by CSV and XLSX files
    hasVetoColumns: boolean
    textColumn: null | string
    attributeColumns: Array<string>
}

export interface ImportReturn {
    attributeValidation: AttributeValidationObject
    meta: MetaData
    data: Array<Data>
    errors: Array<string>
    hasCheckColumn: boolean
}

interface FileConverter {
    toFile(meta: MetaData, data: Array<Data>, options: ExportOptions): Promise<ExportReturn>;
    fromFile(file: File, options: ImportOptions): Promise<ImportReturn>
}


export type { FileConverter };

const csvFileConverter: CsvFileConverter = new CsvFileConverter();
const jsonFileConverter: JsonFileConverter = new JsonFileConverter();
const xlsxFileConverter: XlsxFileConverter = new XlsxFileConverter();

export async function exportFile(meta: MetaData, data: Data[], fileFormat: DownloadFormat, columnMode: DownloadColumnMode) {
    const options: ExportOptions = {
        columnsToBeExported: columnMode,
        rowsToBeExported: "ALL"
    }

    let exportResult: ExportReturn | undefined = undefined;
    let exportFileExtension: string | undefined = undefined;
    let fileFormatString: string | undefined = undefined;

    switch(fileFormat) {
        case "CSV":
            exportFileExtension = ".csv";
            exportResult = csvFileConverter.toFile(meta, data, options);
            fileFormatString = "text/csv";
            break;
        case "JSON":
            exportFileExtension = ".json";
            exportResult = await jsonFileConverter.toFile(meta, data, options);
            fileFormatString = "application/json";
            break;
        case "XLSX":
            exportFileExtension = ".xlsx";
            exportResult = await xlsxFileConverter.toFile(meta, data, options);
            fileFormatString = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            break;
    }

    // Download the file content
    const blob = new Blob([exportResult.fileContent], {type: fileFormatString});
    const filenameBase = removePostfix(meta.fileName);
    const filename = filenameBase + "-verified-" + columnMode + exportFileExtension;
    downloadBlob(filename, blob);
}

export async function importFile(file: File, options: ImportOptions): Promise<ImportReturn | null> {
  let importReturn: ImportReturn;
  switch (file.type) {
    case "application/json":
      importReturn = await jsonFileConverter.fromFile(file, options);
      break;
    case "text/csv": // For Chromium
    case "application/vnd.ms-excel": // For Firefox
      importReturn = await csvFileConverter.fromFile(file, options);
      break;
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      importReturn = await xlsxFileConverter.fromFile(file, options);
      break;
    default:
      console.error(`Opened unsupported file ${file.type}!`);
      return null;
  }

  // Correct empty values to null if the indices do not match an empty value
  for (const data of importReturn.data) {
    correctEmptyValues(data.changelogBase);
    correctEmptyValues(data.currentData);
    correctEmptyValues(data.oldData);
  }

  for (const data of importReturn.data) {
    // Copy the created attributes-field into the changelogBase-field
    data.changelogBase = JSON.parse(JSON.stringify(data.currentData));

    // Check if old data is present and if not write current data
    for(const [attributeName, attributeData] of Object.entries(data.currentData.attributes)) {
      if (!Object.hasOwn(data.oldData.attributes, attributeName)) {
        data.oldData.attributes[attributeName] = JSON.parse(JSON.stringify(attributeData));
      }
    }

    for(const [attributeName, attributeData] of Object.entries(data.currentData.metaAttributes)) {
      if (!Object.hasOwn(data.oldData.metaAttributes, attributeName)) {
        data.oldData.metaAttributes[attributeName] = JSON.parse(JSON.stringify(attributeData));
      }
    }
  }

  // Read linebreak of the data
  for (const data of importReturn.data) {
    if (data.text.includes("\r\n")) {
      data.textLineBreak = "\r\n";
    } else if(data.text.includes("\n")) {
      data.textLineBreak = "\n";
    } else if(data.text.includes("\r")) {
      data.textLineBreak = "\r";
    } else {
      data.textLineBreak = importReturn.meta.formatSpecificAttribs.LINE_BREAK;
    }
  }

  return importReturn;
}

function removePostfix(fileName: string): string {
  const parts = fileName.split("-");

  if (parts[parts.length - 2] === "verified") {
    return parts.slice(0, -2).join("-");
  } else {
    return fileName;
  }
}

/**
 * Correct empty values to null if the indices do not match an empty value.
 * @param data Data containing the values.
 */
function correctEmptyValues(data: VetoData) {
  for (const parts of Object.values(data.attributes)) {
    for (const part of parts) {
      if (part.value !== null && part.value.length === 0 && (part.start === null || part.end === null || part.start !== part.end + 1)) {
        part.value = null;
      }
    }
  }
}

/**
 * Changes the linebreak of all entries in the given data array to the given target linebreak.
 * Replaces the linebreak in the text and adapts the indices of the annotations.
 * @param data Array of Data to transform.
 * @param sourceLinebreak The original line break.
 * @param targetLinebreak The target line break.
 */
export function changeLinebreak(data: Array<Data>,
                                sourceLinebreak: Linebreak,
                                targetLinebreak: Linebreak): Array<Data> {
  if (sourceLinebreak === targetLinebreak) {
    return data;
  }

  const result = JSON.parse(JSON.stringify(data));

  for (const d of result) {
    changeLinebreakOfData(d, sourceLinebreak, targetLinebreak);
  }

  return result;
}

function changeLinebreakOfData(data: Data, sourceLinebreak: Linebreak, targetLinebreak: Linebreak) {
  transformIndicesForLinebreak(data.currentData, data.text, sourceLinebreak, targetLinebreak);
  transformIndicesForLinebreak(data.oldData, data.text, sourceLinebreak, targetLinebreak);
  transformIndicesForLinebreak(data.changelogBase, data.text, sourceLinebreak, targetLinebreak);
  transformTextLinebreak(data, sourceLinebreak, targetLinebreak);
}

function transformTextLinebreak(data: Data, sourceLinebreak: Linebreak, targetLinebreak: Linebreak) {
  if (sourceLinebreak === targetLinebreak) {
    return;
  }

  data.text = data.text.replaceAll(sourceLinebreak, targetLinebreak);
}

function transformIndicesForLinebreak(data: VetoData,
                                             text: string,
                                             sourceLinebreak: Linebreak,
                                             targetLinebreak: Linebreak) {
  if (sourceLinebreak === targetLinebreak) {
    return;
  }

  // Search for linebreaks in the text
  const linebreakIndices = findLinebreaks(text, sourceLinebreak);

  if (linebreakIndices.length === 0) {
    return;
  }

  const offsetPerLinebreak = targetLinebreak.length - sourceLinebreak.length;

  for (const parts of Object.values(data.attributes)) {
    for (const part of parts) {
      if (part.start) {
        const linebreaksBeforeStart = getUpperBound(linebreakIndices, part.start);
        part.start += offsetPerLinebreak * linebreaksBeforeStart;
      }
      if (part.end) {
        const linebreaksBeforeEnd = getUpperBound(linebreakIndices, part.end);
        part.end += offsetPerLinebreak * linebreaksBeforeEnd;
      }
    }
  }
}

function getUpperBound(indices: number[], index: number) {
  for (let i = 0; i < indices.length; ++i) {
    if (indices[i] > index) {
      return i;
    }
  }

  return indices.length;
}
