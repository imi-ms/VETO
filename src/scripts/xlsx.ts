import Data from "@/types/Data";
import MetaData, { getDefaultMetaData } from "@/types/MetaData";
import {
  ExportOptions,
  ExportReturn,
  FileConverter,
  ImportOptions,
  ImportReturn,
  getFilenameWithoutExtension,
  changeLinebreak
} from "./veto-files";
import ExcelJS, { Workbook, Worksheet } from "exceljs"
import { TableRowContent, getTableByData, parseTable } from "./tables";

/**
 * Returns a Workbook with a single empty sheet
 * @param meta Meta Object providing important information
 * @returns Workbook with a single empty sheet
 */
function initXlsxWorkbook(meta: MetaData): Workbook {
    const workbook = new ExcelJS.Workbook();

    const username: string = "Veto";
    workbook.creator = meta.formatSpecificAttribs.XLSX_CREATOR ? meta.formatSpecificAttribs.XLSX_CREATOR : username;
    workbook.lastModifiedBy = username;

    const currentDate: Date = new Date();
    workbook.created = currentDate;
    workbook.modified = currentDate;
    workbook.lastPrinted = currentDate;

    workbook.properties.date1904 = true;

    workbook.views = [
        {
          x: 0, y: 0, width: 10000, height: 20000,
          firstSheet: 0, activeTab: 1, visibility: 'visible'
        }
    ];

    // Initialize the new workbook with a single empty worksheet
    const sheet = workbook.addWorksheet('Veto');

    return workbook;
}

export default class XlsxFileConverter implements FileConverter {
    async toFile(meta: MetaData, data: Data[], options: ExportOptions): Promise<ExportReturn> {
        // Transform the linebreaks to \n,
        // because the library will otherwise export \n linebreaks which will invalidate the indices.
        const transformedData = changeLinebreak(data, meta.formatSpecificAttribs.LINE_BREAK, "\n");

        const workbook = initXlsxWorkbook(meta);
        const sheet = workbook.worksheets[0];

        const table = getTableByData(meta, transformedData, options);
        const rows: Array<TableRowContent> = table.body;

        // Write the header
        const columns: Array<string> = table.head;
        const columnMetaInfo = []; // Contains Excel-specific meta information about each column like the width of a column
        for(let i = 0; i < columns.length; i += 1) {
            const column = columns[i];

            // Add the length of the column name as the width of the corresponding column
            columnMetaInfo.push({  width: column.length });

            sheet.getRow(1).getCell(i + 1).value = column;
        }
        sheet.columns = columnMetaInfo; // Add all colum meta infos at once or an error occures

        // Write the rows
        for(let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
            for(let columnIndex = 0; columnIndex < columns.length; columnIndex += 1) {
                const columnName = columns[columnIndex];
                const cellContent = rows[rowIndex][columnName];
                sheet.getRow(rowIndex + 2).getCell(columnIndex + 1).value = cellContent;
            }
        }

        let buffer = await workbook.xlsx.writeBuffer();
        return {fileContent: buffer, errors: [] };
    }
    async fromFile(file: File, options: ImportOptions): Promise<ImportReturn> {
        // Init results
        const errors: Array<string> = [];
        const meta: MetaData = getDefaultMetaData(getFilenameWithoutExtension(file.name));
        const data: Array<Data> = [];

        // Parse the file into a xlsx workbook
        const fileContent = await file.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(fileContent);

        // Ensure that there is exactly one worksheet in the workbook
        switch(workbook.worksheets.length) {
            case 0:
                errors.push("Invalid number of worksheets: The file does not contain any worksheets!");
                return {data, meta, errors, attributeValidation: {}, hasCheckColumn: false};
            case 1:
                break;
            default:
                errors.push("Invalid number of worksheets: The file contains more than one worksheet!");
                return {data, meta, errors, attributeValidation: {}, hasCheckColumn: false};
        }

        const sheet: Worksheet = workbook.worksheets[0];

        const [firstColumnIndex, firstRowIndex] = this.findTableStart(sheet);

        // Iterate over every column name in the first row
        const columnNames = this.doGetColumnNames(sheet, firstRowIndex, firstColumnIndex);

        // Store the content of the files into an array of the intended data structure
        const rows: Array<{[content: string]: string }> = [];
        let rowIsEmpty: boolean = false;
        for(let rowIndex = firstRowIndex + 1; !rowIsEmpty; rowIndex++) {
            rowIsEmpty = true;
            const newRow: {[content: string]: string } = {};
            for(let columnIndex = 0; columnIndex < columnNames.length; columnIndex++) {
                const columnName: string = columnNames[columnIndex];
                const columnContent: string = sheet.getRow(rowIndex).getCell(columnIndex + 1).text;
                newRow[columnName] = columnContent;

                if(columnContent.trim() !== '') rowIsEmpty = false;     // If the cell contains any string content mark this row as non-empty

            }
            if(!rowIsEmpty) {
                rows.push(newRow);
            }
        }

        const result: ImportReturn = { data: [], meta: meta, errors: [], attributeValidation: {}, hasCheckColumn: false };
        await parseTable(result, columnNames, rows, options);

        return result;
    }

  /**
   * Returns the column names of the given XLSX file.
   * @param file The XLSX file.
   * @returns The column names of the CSV file.
   */
  public async getColumnNames(file: File): Promise<Array<string>> {
    // Parse the file into a XLSX workbook
    const fileContent = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileContent);

    // Ensure that there is exactly one worksheet in the workbook
    if (workbook.worksheets.length !== 1) {
      return [];
    }

    const sheet: Worksheet = workbook.worksheets[0];

    const [firstColumnIndex, firstRowIndex] = this.findTableStart(sheet);
    return this.doGetColumnNames(sheet, firstRowIndex, firstColumnIndex);
  }

  /**
   * Extracts the columns names from the given sheet starting at the given indices.
   * @param sheet The sheet to extract the column names from.
   * @param firstRowIndex The index of the first row to extract the column names from.
   * @param firstColumnIndex The index of the first column to extract the column names from.
   * @returns The column names of the sheet.
   */
  private doGetColumnNames(sheet: Worksheet, firstRowIndex: number, firstColumnIndex: number): Array<string> {
    const columnNames: Array<string> = [];
    let currentColumn: string | undefined;
    let columnIndex = firstColumnIndex;
    while(true) {
      currentColumn = sheet.getRow(firstRowIndex).getCell(columnIndex).text;
      if(currentColumn.trim() === '')
        break;
      columnNames.push(currentColumn);
      columnIndex += 1
    }

    return columnNames;
  }

  /**
   * Finds the first cell that is not empty in the given sheet.
   * @param sheet The sheet to search in.
   * @returns The indices (column and row) of the first cell that is not empty.
   */
  private findTableStart(sheet: Worksheet) {
    let firstColumnIndex: number = -1;   // Denotes the first column that is not empty
    let firstRowIndex: number = -1;      // Denotes the first row that is not empty
    const maxFirstIndex: number = 10;

    // Find the first cell that is not empty; Look from left to right until the limit is reached and continue in the row below
    for(let rowIndex = 1; rowIndex <= maxFirstIndex && firstRowIndex === -1; rowIndex += 1) {
      for(let columnIndex = 1; columnIndex <= maxFirstIndex && firstColumnIndex === -1; columnIndex += 1) {
        if(sheet.getRow(rowIndex + 1).getCell(columnIndex).text.trim() !== '') {
          firstColumnIndex = columnIndex;
          firstRowIndex = rowIndex;
        }
      }
    }

    return [firstColumnIndex, firstRowIndex];
  }

}
