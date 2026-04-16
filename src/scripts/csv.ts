import MetaData, { getDefaultMetaData } from "@/types/MetaData"
import Data from "@/types/Data"
import { FileConverter,  ImportOptions, ImportReturn, ExportOptions, ExportReturn, getFilenameWithoutExtension } from "./veto-files";
import Papa, {ParseResult, UnparseConfig} from "papaparse";
import {attributeColumnPrefixes, getTableByData, parseTable} from "./tables";
import {DelimiterModes, Linebreak, QuoteChar} from "@/types/FileData";

export default class CsvFileConverter implements FileConverter {
  toFile(meta: MetaData, data: Data[], options: ExportOptions): ExportReturn {
    const table = getTableByData(meta, data, options);

    const config: UnparseConfig = {
        delimiter: meta.formatSpecificAttribs.CSV_FILE_DELIMITER.value,
        quoteChar: meta.formatSpecificAttribs.QUOTE_CHAR,
        newline: meta.formatSpecificAttribs.LINE_BREAK
    };

    let csv: string;
    if (table.body.length === 0) {
      csv = Papa.unparse([table.head], config);
    } else {
      csv = Papa.unparse(table.body, config);
    }

    return {fileContent: csv, errors: []}; // TODO: Implement error detection on csv export
  }


    async fromFile(file: File, options: ImportOptions): Promise<ImportReturn> {
        const meta: MetaData = getDefaultMetaData(getFilenameWithoutExtension(file.name));

        const results = await this.parseFile(file, options);

        // Handle the parse results
        const header: Array<string> = results.meta.fields!;

        // Since 'header' is true in the given config object, results.data must be an array of objects of data keyed by the field name
        const csvRows = results.data as Array<{[columnName: string]: string}>;
        meta.formatSpecificAttribs.CSV_FILE_DELIMITER = Object.values(DelimiterModes).find(value => value.value === results.meta.delimiter);
        meta.formatSpecificAttribs.LINE_BREAK = results.meta.linebreak as Linebreak;
        meta.formatSpecificAttribs.QUOTE_CHAR = options.csvQuoteChar as QuoteChar;
        meta.formatSpecificAttribs.VALUE_DELIMITER = options.valueDelimiter!;

        const result: ImportReturn = { data: [], meta: meta, errors: [], attributeValidation: {}, hasCheckColumn: false };
        await parseTable(result, header, csvRows, options);

        return result;
    }

  /**
   * Returns the column names of the given CSV file.
   * @param file The CSV file.
   * @param options The import options.
   * @returns The column names of the CSV file.
   */
  public async getColumnNames(file: File, options: ImportOptions): Promise<Array<string>> {
    const importResult = await this.parseFile(file, options);
    return importResult.meta.fields!;
  }

  /**
   * Parses the given file into a CSV file.
   * @param file The CSV file.
   * @param options Import options.
   * @returns The parse result.
   */
  private async parseFile(file: File, options: ImportOptions): Promise<ParseResult<any>> {
    const fileContent: string = await file.text();

    // Parse the csv file
    return Papa.parse<any>(fileContent, {
      delimiter: options.csvDelimiter!.value,
      header: true,
      newline: options.csvLinebreak !== '' ? options.csvLinebreak : undefined,
      quoteChar: options.csvQuoteChar,
      skipEmptyLines: true,
      worker: false,
      download: false
    });
  }

}
