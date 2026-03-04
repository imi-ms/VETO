import { defineStore } from 'pinia'
import { HighlightDict } from "@/types/HighlightDict";
import Data, { DataAttributePart, MetaAttributeData } from '@/types/Data';
import { AppSettings, ChangeAction, Changelog, RowChangelog, State } from "@/types/State";
import MetaData, { MetaAttributeType } from "@/types/MetaData";
import { FixData } from '@/types/FixData';
import { Occurrence } from '@/types/Occurrence';
import { IValueOrder, ValueOrder } from '@/types/ValueOrder';
import { KeyboardAction } from "@/types/KeyboardAction";
import { hasConflict, hasEmptyValues, hasMissingValues, hasValidationRegExConflict } from '@/helper/value-validation';
import { AnnotationColorScheme } from "@/types/AnnotationColorScheme";
import { DelimiterModes } from "@/types/FileData";
import { TrimGroup, TrimState } from "@/types/TrimGroup";

export const useVetoStore = defineStore("veto", {
 state: (): State => ({
  appSettings: getDefaultSettings(),
   columnData: {
    fileName: 'VETO-example',
    usingExternalTextFiles: false,
    containsMultiValueAttributes: false,
    nextId: 4,
    attributes: {
      'File Import': {color: '#BB0000', validationRegEx: null},
      'Validation': {color: '#0000BB', validationRegEx: null},
      'File Export': {color: '#BBBB00', validationRegEx: null},
      'Try it out': {color: '#00BB00', validationRegEx: null},
    },
    formatSpecificAttribs: {
      CSV_FILE_DELIMITER: DelimiterModes.getDelimiterMode("COMMA"),
      LINE_BREAK: '\r\n',
      QUOTE_CHAR: '"',
      VALUE_DELIMITER: DelimiterModes.getDelimiterMode("SEMICOLON"),
    },
    otherColumns: [ "description" ],
    validMetaAttributes: {
      'VETO Occurrences': {type: MetaAttributeType.NUMBER, values: ['b', 'a'] },
     },
   },
   data: [
     {
       currentData: {
         attributes: {
           'File Import': [
             {value: 'File Import', start: 0, end: 10, id: 0},
           ],
           'Validation': [
             {value: 'Validation', start: 1499, end: 1508, id: 1},
           ],
           'File Export': [
             {value: 'File Export', start: 2050, end: 2060, id: 2},
           ],
           'Try it out': [
             {value: 'double click me', start: 1768, end: 1782, id: 3},
           ],
         },
         checked: false,
         metaAttributes: {
           'VETO Occurrences': [{ id: 4, value: '13' },],
         },
       },
       changelogBase: {
         // In the initial data, old, has to be the same as attributes
         checked: false,
         attributes: {
           'File Import': [
             {value: 'File Import', start: 0, end: 10, id: 0},
           ],
           'Validation': [
             {value: 'Validation', start: 1499, end: 1508, id: 1},
           ],
           'File Export': [
             {value: 'File Export', start: 2050, end: 2060, id: 2},
           ],
           'Try it out': [
             {value: 'double click me', start: 1768, end: 1782, id: 3},
           ],
         },
         metaAttributes: {
           'VETO Occurrences': [{ id: 4, value: '13' },],
         },
       },
       oldData: {
         // In the initial data, old, has to be the same as attributes
         checked: false,
         attributes: {
           'File Import': [
             {value: 'File Import', start: 0, end: 10, id: 0},
           ],
           'Validation': [
             {value: 'Validation', start: 1499, end: 1508, id: 1},
           ],
           'File Export': [
             {value: 'File Export', start: 2050, end: 2060, id: 2},
           ],
           'Try it out': [
             {value: 'double click me', start: 1768, end: 1782, id: 3},
           ],
         },
         metaAttributes: {
           'VETO Occurrences': [{ id: 4, value: '13' },],
         },
       },
       otherColumns: {
         description: 'This is a column without VETO prefix'
       },
       text: "File Import:\r\n" +
             "VETO supports the import of different file structures and types. " +
             "When selecting tabular files without VETO's column prefixes, columns containing the text and attributes must be manually selected during import. " +
             "This is especially useful for creating annotations from scratch or if meta information like positions and the validation status are not of importance. " +
             "The annotated text can also be uploaded in separate text files, by selecting 'Separate Text Files' instead of 'Single File'. " +
             "In this case, the text column must contain the name of the corresponding file.\r\n" +
             "For importing a file containing meta information, the column names must follow VETO's naming conventions. " +
           "The column containing the analyzed text/file names must have the prefix VETO_TEXT_. " +
           "An attribute of the name 'x' requires at least either a VETO_ATTR_VALUE_x column or the VETO_ATTR_START_x and VETO_ATTR_END_x columns. " +
           "These contain the annotated value, the start position and the end position of the value in the provided text respectively. " +
           "If the file is missing the value or the positions, a red exclamation mark will appear in the cell of the value. " +
           "Clicking the exclamation mark opens a popup providing options for automatically setting the missing data. " +
           "Optionally the file can contain the column VETO_CHECK to mark, if the row has been validated beforehand. " +
           "The column VETO_ATTR_OLD_x, that VETO adds during the export, will be ignored. " +
           "An example file can be obtained by exporting the initial project.\r\n" +
           "\r\n" +
           "Validation:\r\n" +
           "To show the corresponding text of an entry, click on the row. " +
           "The value of an attribute can be changed, by making a double click on the cell. " +
           "This highlights the cell green and the value can now be modified by selecting the new value in the text area. " +
           "The double click mentioned above also jumps to the current selected text. " +
           "The start and end positions will be adjusted automatically.\r\n" +
           "In order to set the VETO_CHECK value, click on the first button in the 'Actions' column. " +
           "The second button undoes the last change made to that row.\r\n" +
           "\r\n" +
           "File Export:" +
           "\r\n" +
           "The result can be exported by clicking on the 'Export' button at the top of the page. " +
           "You can include all columns, only VETO columns or only non VETO columns in the export. " +
           "VETO columns are all columns with prefixes as described in the 'File Import' section. " +
           "The option 'Without VETO columns' removes the start and end positions of each attribute and only exports the value and text columns. " +
           "Therefore the file's structure corresponds to the tabular format first mentioned in the 'File Import' section.",
       textLineBreak: '\r\n',
     },
   ],
   currentRow: 0,
   currentField: null,
   currentValueIndex: null,
   currentValueOrder: ValueOrder.ID,
   changelog: {
     changes: {},
     exportedAllChanges: true,
     fileName: 'VETO-example.csv',
   },
   changelogSaved: true
 }),
 getters: {
   isCellSelected(): boolean {
     return this.currentValueIndex !== null;
   },
   exportedAllChanges(state) {
     return state.changelog.exportedAllChanges;
   },
   hasChanges: (state: State) => (index: number): boolean => {
     const rowChangelog = state.changelog.changes[index];
     return rowChangelog && rowChangelog.length > 0;
   },
   notMatching: (state: State) => (rowIndex: number, attributeName: string, valueIndex: number | null): boolean => {
     return hasConflict(state, rowIndex, attributeName, valueIndex);
   },
   hasValidationRegExConflict: (state: State) => (rowIndex: number, attributeName: string, valueIndex: number | null): boolean => {
     return hasValidationRegExConflict(state, rowIndex, attributeName, valueIndex);
   },
   hasMissingValues: (state: State) => (rowIndex: number, attributeName: string, valueIndex: number | null): boolean => {
    return hasMissingValues(state, rowIndex, attributeName, valueIndex);
   },
   hasEmptyValues: (state: State) => (rowIndex: number, attributeName: string, valueIndex: number | null): boolean => {
    return hasEmptyValues(state, rowIndex, attributeName, valueIndex);
   },
   hasMultipleValues: (state: State) => (): boolean => {
     for (const rowData of state.data) {
       for (const attributeData of Object.values(rowData.currentData.attributes)) {
          if (attributeData.length > 1) {
            return true;
          }
       }
     }
     return false;
   },
   highlightColor: (state: State) => (attributeName: string): string => {
    return state.columnData.attributes[attributeName].color;
   },
   highlightMarks(state): HighlightDict {
     if (state.currentRow < 0) {
       return [];
     }

     let res = [] as HighlightDict;
     const attributes = state.data[state.currentRow].currentData.attributes;
     for (const [attributeName, obj] of Object.entries(state.columnData.attributes)) {
       const currentAttributeData = attributes[attributeName];
        currentAttributeData.forEach((valueData, valueIndex) => {
         if (valueData.start !== null && valueData.end !== null && valueData.start <= valueData.end) {
           res.push({
             start: valueData.start,
             end: valueData.end,
             color: obj.color,
             attributeName: attributeName,
             valueIndex: valueIndex,
           });
         }
        });
     }
     return res;
   },
 },
 actions: {
   addCell(): number | null {
     if (!this.columnData.containsMultiValueAttributes) {
       console.error("Unable to add value! File does not allows multiple values!");
       return null;
     }

     if (this.currentField === null) {
       console.error("Unable to add value! No attribute selected!")
       return null;
     }

     const attributeData = this.data[this.currentRow].currentData.attributes[this.currentField];
     attributeData.push({start: null, end: null, value: null, id: this.columnData.nextId});

     const change = {
       action: ChangeAction.ADD,
       attributeName: this.currentField,
       check: null,
       end: null,
       id: this.columnData.nextId,
       metaValue: null,
       start: null,
       valueIndex: null,
     } as RowChangelog;

     addChange(this, change, this.currentRow);

     this.columnData.nextId += 1;

     return attributeData.length - 1;
   },
   deselectCurrentCell() {
      if (this.columnData.containsMultiValueAttributes) {
        this.updateCurrentValueIndex(null);
      } else {
        this.updateCurrentField(null);
      }
   },
   deleteCurrentCell() {
     if (this.currentField === null) {
       console.error("Unable to delete field! No column selected!");
       return;
     }

     if (this.currentValueIndex === null) {
       console.error("Unable to delete field! No value selected!");
       return;
     }

     const attributeData = this.data[this.currentRow].currentData.attributes[this.currentField];
     const valueData = attributeData[this.currentValueIndex];

     if (attributeData.length <= 1) {
       // The last value should not be deleted
       valueData.end = null;
       valueData.start = null;
       valueData.value = null;
     } else {
       attributeData.splice(this.currentValueIndex, 1);
     }

     const change = {
       action: ChangeAction.DELETE,
       attributeName: this.currentField,
       check: null,
       end: null,
       id: valueData.id,
       metaValue: null,
       start: null,
       valueIndex: this.currentValueIndex,
     } as RowChangelog;
     addChange(this, change, this.currentRow);
   },
   selectNextCell() {
     if (this.currentField === null || this.currentValueIndex === null) {
       // Currently, no cell is selected
       return;
     }

     // Check if we can select the next value
     if (this.columnData.containsMultiValueAttributes
         && this.currentValueIndex + 1 < this.data[this.currentRow].currentData.attributes[this.currentField].length) {
       this.updateCurrentValueIndex(this.currentValueIndex + 1);
       return;
     }

     // Check if we can select the next column
     const validColumns = Object.keys(this.columnData.attributes);
     const nextColumn = validColumns.at(validColumns.indexOf(this.currentField) + 1);
     if (nextColumn !== undefined) {
       this.updateCurrentField(nextColumn);
       this.updateCurrentValueIndex(0);
       return;
     }

     // Check if we can select the next row
     if (this.currentRow + 1 < this.data.length) {
       this.updateCurrentRow(this.currentRow + 1);
       this.updateCurrentField(validColumns[0]);
       this.updateCurrentValueIndex(0);
       return;
     }

     // Cannot select the next cell, because the current cell is the last one
     this.deselectCurrentCell();
   },
   switchMultiValueView() {
     if (this.columnData.containsMultiValueAttributes) {
       if (this.hasMultipleValues()) {
         console.error("Cannot disable multi-value view, if a cell contains multiple values!");
         return;
       }
       this.columnData.containsMultiValueAttributes = false;

       if (this.currentValueIndex === null) {
         this.updateCurrentField(null);
       }
     } else {
       this.columnData.containsMultiValueAttributes = true;
     }
   },
   updateFile(payload: {columnData: MetaData, data: Array<Data>}) {
     this.currentRow = payload.data.length > 0 ? 0 : -1;
     this.currentField = null;
     this.currentValueIndex = null;
     this.currentValueOrder = ValueOrder.ID;

     this.columnData = payload.columnData;
     this.data = payload.data;

     this.changelog = {
       changes: {},
       exportedAllChanges: true,
       fileName: payload.columnData.fileName,
     };
   },
   applyChangelog(changelog: Changelog) {
     this.changelog = changelog;

     for (const [index, rowChangelog] of Object.entries(changelog.changes)) {
       const dataRow = this.data[parseInt(index)];
       applyChangelog(dataRow, this.columnData, rowChangelog);
     }

     this.sortValues(this.currentValueOrder);
   },
    sortValues(valueOrder: IValueOrder) {
      if (!this.columnData.containsMultiValueAttributes) {
        return;
      }

      let currentValueData = null
      if (this.currentField !== null && this.currentValueIndex !== null) {
        currentValueData = this.data[this.currentRow].currentData.attributes[this.currentField][this.currentValueIndex];
      }

      for (const dataRow of this.data) {
        for (const attributeData of Object.values(dataRow.currentData.attributes)) {
          attributeData.sort(valueOrder.sortFunction);
        }
      }

      if (currentValueData && this.currentField !== null) {
        for (const [valueDataIndex, valueData] of Object.entries(this.data[this.currentRow].currentData.attributes[this.currentField])) {
          if (currentValueData == valueData) {
            this.updateCurrentValueIndex(parseInt(valueDataIndex));
            break;
          }
        }
      }
    },
   undo(index: number) {
     this.changelog.changes[index].pop();
     applyChangelog(this.data[index], this.columnData, this.changelog.changes[index]);

     this.changelog.exportedAllChanges = true;
     for (const rowChangelog of Object.values(this.changelog.changes))
       if (rowChangelog.length > 0) {
         this.changelog.exportedAllChanges = false;
         break;
       }
     this.changelogSaved = saveChangelog(this.changelog);

     if (this.hasMultipleValues() && !this.columnData.containsMultiValueAttributes) {
       this.switchMultiValueView();
     }
     this.sortValues(this.currentValueOrder);
   },
   updateAppSettings(appSettings: AppSettings) {
     const oldColorScheme = this.appSettings.annotationColorScheme;

     this.appSettings = appSettings;

     if (oldColorScheme !== appSettings.annotationColorScheme) {
       this.updateColors();
     }
   },
   updateColors() {
    const colors = AnnotationColorScheme.getColorScheme(this.appSettings.annotationColorScheme).scheme;
    let attributeIndex = 0;
    for (const attribute of Object.values(this.columnData.attributes)) {
      attribute.color = colors[attributeIndex % colors.length];
      attributeIndex += 1;
    }
   },
   updateColor(payload: {attributeName: string, value: string}) {
     this.columnData.attributes[payload.attributeName].color = payload.value;
   },
   updateCurrentRow(index: number) {
     if (this.currentRow !== index) {
       this.currentRow = index
       this.currentField = null;
       this.currentValueIndex = null;
     }
   },
   updateCurrentField(name: string | null) {
      this.currentField = name;
      if (name === null) {
        this.currentValueIndex = null;
      } else {
        this.currentValueIndex = 0;
      }
   },
   updateCurrentValueIndex(valueIndex: number | null) {
    this.currentValueIndex = valueIndex;
   },
   updateFieldData(payload: {start: number, end: number}) {
    if (this.currentField === null || this.currentValueIndex === null) {
      return;
    }

     const currentAttribute = this.data[this.currentRow].currentData.attributes[this.currentField][this.currentValueIndex]

     // Create the changelog entry
     if (currentAttribute.end === payload.end && currentAttribute.start === payload.start) {
       return;
     }

     const change = {
       action: ChangeAction.UPDATE,
       attributeName: this.currentField,
       check: null,
       end: currentAttribute.end !== payload.end ? payload.end : null,
       id: currentAttribute.id,
       metaValue: null,
       start: currentAttribute.start !== payload.start ? payload.start : null,
       valueIndex: this.currentValueIndex,
     } as RowChangelog

     addChange(this, change, this.currentRow);

     // Update the attribute
     currentAttribute.end = payload.end;
     currentAttribute.start = payload.start;
     currentAttribute.value = this.data[this.currentRow].text.substring(payload.start, payload.end + 1);
   },
   updateValue(fixMatch: FixData) {
     const attributeName = fixMatch.attributeName;
     const rowIndex = fixMatch.rowIndex;
     const currentAttribute = this.data[fixMatch.rowIndex].currentData.attributes[fixMatch.attributeName][fixMatch.valueIndex];

     const change = {
       action: ChangeAction.UPDATE,
       attributeName: attributeName,
       check: null,
       end: currentAttribute.end,
       id: currentAttribute.id,
       metaValue: null,
       start: currentAttribute.start,
       valueIndex: fixMatch.valueIndex,
     } as RowChangelog

     addChange(this, change, rowIndex);

     // Update the attribute
     currentAttribute.value = fixMatch.valueOfIndices;
   },
   updateIndices(payload: {occurrence: Occurrence, fixMatch: FixData}) {
     const attributeName = payload.fixMatch.attributeName;
     const rowIndex = payload.fixMatch.rowIndex;
     const valueIndex = payload.fixMatch.valueIndex;
     const start = payload.occurrence.start;
     const end = payload.occurrence.end;
     const value = payload.occurrence.value;

     const currentAttribute = this.data[rowIndex].currentData.attributes[attributeName][valueIndex];

     const change = {
       action: ChangeAction.UPDATE,
       attributeName: attributeName,
       check: null,
       end: currentAttribute.end !== end ? end : null,
       id: currentAttribute.id,
       metaValue: null,
       start: currentAttribute.start !== start ? start : null,
       valueIndex: valueIndex
     } as RowChangelog;

     addChange(this, change, rowIndex);

     // Update the attribute
     currentAttribute.end = end;
     currentAttribute.start = start;
     // Value ca be different if spaces are ignored
     currentAttribute.value = value;
   },
   updateCheckAll(payload: {index: number, value: boolean}) {
     // Create the changelog entry
     const change = {
       action: ChangeAction.CHECK,
       attributeName: null,
       check: payload.value,
       end: null,
       id: null,
       metaValue: null,
       start: null,
       valueIndex: null,
     } as RowChangelog

     addChange(this, change, payload.index);

     // Update the attributes
     checkRow(this.data[payload.index], payload.value);
   },
   updateMetaAttribute(payload: {rowIndex: number, attributeName: string, valueIndex: number, value: string}) {
     const metaAttribute = this.data[payload.rowIndex].currentData.metaAttributes[payload.attributeName][payload.valueIndex];

     // Create the changelog entry
     const change = {
       action: ChangeAction.UPDATE_META,
       attributeName: payload.attributeName,
       check: null,
       end: null,
       id: metaAttribute.id,
       metaValue: payload.value,
       start: null,
       valueIndex: payload.valueIndex,
     } as RowChangelog

     addChange(this, change, payload.rowIndex);

     // Update the meta attribute
     metaAttribute.value = payload.value;
   },
   toggleCheckAll(index: number) {
    const newValue: boolean = this.data[index].currentData.checked == null ? true : !this.data[index].currentData.checked;
    this.updateCheckAll({index: index, value: newValue});
   },
   updateExportedChanges(value: boolean) {
     this.changelog.exportedAllChanges = value;
     this.changelogSaved = saveChangelog(this.changelog);
   },
    // Select the cell in the VetoTable that is over the current cell
    selectUpperRow() {
      // Go up only if the user has selected a cell and this cell is not in the first row
      if(this.currentField != '' && this.currentRow > 0 ) {
        this.currentRow--;
      }
    },
    // Select the cell in the VetoTable that is under the current cell
    selectLowerRow() {
      // Ensure that there is a valid the cell under the cell that is currently selected
      if(this.currentField != '' && this.currentRow < this.data.length - 1) {
        this.currentRow++;
      }
    },
    // Select the right-sided cell next to the current selected cell in the VetoTable
    selectColumnToTheRight() {
      // Find the right field by first iterating through the list until the current cell is found. Then choose the cell after that cell
      let fieldToTheRight: string = '';
      let prev: string | null = null;
      for (let current in this.columnData.attributes) {
        if(prev === this.currentField) {
          fieldToTheRight = current;
          break;
        }

        prev = current;
      }

      if(fieldToTheRight != '') {
        this.currentField = fieldToTheRight;
      }
    },
    // Select the left-sided cell next to the current selected cell in the VetoTable
    selectColumnToTheLeft() {
      if(this.currentField == '') return;

      let fieldToTheLeft: string | null = this.currentField;
      for(let current in this.columnData.attributes) {
        if(current == this.currentField) break;
        fieldToTheLeft = current;
      }
      this.currentField = fieldToTheLeft;
    }
 },
});

export function getDefaultSettings(): AppSettings {
  return {
    afterLabelingAction: "NOTHING",
    annotationColorScheme: 'RAINBOW',
    vetoColorScheme: 'DEFAULT',
    highlightColor: '#d47400',
    ignoreDifferenceWhitespace: false,
    ignoreLineBreaks: false,
    ignoreTabs: false,
    ignoreSpaces: false,
    keepSearchFocus: true,
    trimGroups: {
      [TrimGroup.BRACES]: TrimState.TRIM,
      [TrimGroup.DASHES]: TrimState.IGNORE,
      [TrimGroup.LETTERS]: TrimState.IGNORE,
      [TrimGroup.LOGOGRAMS] : TrimState.IGNORE,
      [TrimGroup.MATH_SYMBOLS]: TrimState.IGNORE,
      [TrimGroup.NUMBERS]: TrimState.IGNORE,
      [TrimGroup.PUNCTUATION]: TrimState.TRIM,
      [TrimGroup.QUOTES]: TrimState.TRIM,
      [TrimGroup.UNITS]: TrimState.EXPAND,
      [TrimGroup.WHITESPACES]: TrimState.TRIM,
    },
    matchEntireWord: true,
    keyboardActions: {
      [KeyboardAction.MOVE_LEFT]: "ArrowLeft",
      [KeyboardAction.MOVE_RIGHT]: "ArrowRight",
      [KeyboardAction.MOVE_UP]: "ArrowUp",
      [KeyboardAction.MOVE_DOWN]: "ArrowDown",
      [KeyboardAction.TOGGLE_VALIDATION]: "Enter",
      [KeyboardAction.DELETE]: "Delete",
      [KeyboardAction.EXIT]: "Escape"
    }
  }
}

function addChange(state: State, change: RowChangelog, rowIndex: number) {
  // Create a new RowChangelog for the current row if no one exists yet
  if (!state.changelog.changes.hasOwnProperty(rowIndex)) {
    state.changelog.changes[rowIndex] = [];
  }

  // Save the AttributeChangelog
  state.changelog.changes[rowIndex].push(change);
  state.changelog.exportedAllChanges = false;
  state.changelogSaved = saveChangelog(state.changelog);
}

function checkRow(dataRow: Data, isChecked: boolean) {
  dataRow.currentData.checked = isChecked
}

function applyChangelog(dataRow: Data, metadata: MetaData, changelogs: RowChangelog[]) {

  // Restore old row
  for (const [attributeName, attributeData] of Object.entries(dataRow.changelogBase.attributes)) {
    const oldData = [] as DataAttributePart[];
    for (const oldValueData of attributeData) {
      oldData.push({
        value: oldValueData.value,
        start: oldValueData.start,
        end: oldValueData.end,
        id: oldValueData.id,
      });
    }

    dataRow.currentData.attributes[attributeName] = oldData;
  }

  // Meta attributes
  for (const [attributeName, attributeData] of Object.entries(dataRow.changelogBase.metaAttributes)) {
    const oldData = [] as MetaAttributeData[];
    for (const oldValueData of attributeData) {
      oldData.push({
        value: oldValueData.value,
        id: oldValueData.id,
      });
    }

    dataRow.currentData.metaAttributes[attributeName] = oldData;
  }
  dataRow.currentData.checked = dataRow.changelogBase.checked;

  // Apply changelog
  for (const rowChangelog of changelogs) {
    switch (rowChangelog.action) {
      case ChangeAction.ADD: {
        if (rowChangelog.attributeName === null || rowChangelog.id === null) {
          console.error("Unable to apply changelog! Attribute name or id is null!");
          continue;
        }

        const attributeData = dataRow.currentData.attributes[rowChangelog.attributeName];
        attributeData.push({start: null, end: null, value: null, id: rowChangelog.id});

        break;
      }
      case ChangeAction.CHECK: {
        if(rowChangelog.check === null) {
          console.error("Unable to apply changelog! Check value is not set!");
          continue;
        }

        checkRow(dataRow, rowChangelog.check);

        break;
      }
      case ChangeAction.DELETE: {
        if (rowChangelog.attributeName === null || rowChangelog.valueIndex === null || rowChangelog.id === null) {
          console.error("Unable to apply changelog! Attribute name, value index or id is null!");
          continue;
        }

        const attributeData = dataRow.currentData.attributes[rowChangelog.attributeName];
        const valueData = getValueDataById(attributeData, rowChangelog.id);

        if (valueData === null) {
          console.error("Unable to apply changelog! No value with id found!");
          continue;
        }

        if (attributeData.length <= 1) {
          // The last value should not be deleted
          valueData.end = null;
          valueData.start = null;
          valueData.value = null;
        } else {
          attributeData.splice(rowChangelog.valueIndex, 1);
        }

        break;
      }
      case ChangeAction.UPDATE: {
        if (rowChangelog.attributeName === null || rowChangelog.valueIndex === null || rowChangelog.id === null) {
          console.error("Unable to apply changelog! Attribute name, value index or id is null!");
          continue;
        }

        const attributeData = dataRow.currentData.attributes[rowChangelog.attributeName];
        const valueData = getValueDataById(attributeData, rowChangelog.id);

        if (valueData === null) {
          console.error(`Unable to apply changelog! No value with id ${rowChangelog.id} found!`);
          continue;
        }

        let valueChange = false;
        if (rowChangelog.end !== null) {
          valueData.end = rowChangelog.end;
          valueChange = true;
        }
        if (rowChangelog.start !== null) {
          valueData.start = rowChangelog.start;
          valueChange = true;
        }
        if (valueChange) {
          if (valueData.start === null || valueData.end === null) {
            console.error("Unable to apply changelog! Could not set value, because of invalid indices!");
            continue;
          }
          valueData.value = dataRow.text.substring(valueData.start, valueData.end + 1);
        }

        break;
      }
      case ChangeAction.UPDATE_META: {
        if (rowChangelog.attributeName === null || rowChangelog.valueIndex === null || rowChangelog.id === null) {
          console.error("Unable to apply changelog! Attribute name, value index or id is null!");
          continue;
        }

        if (rowChangelog.metaValue === null) {
          console.error("Unable to apply changelog! Value for meta attribute is null!");
          continue;
        }

        const attributeData = dataRow.currentData.metaAttributes[rowChangelog.attributeName];
        const valueData = getMetaValueDataById(attributeData, rowChangelog.id);

        if (valueData === null) {
          console.error(`Unable to apply changelog! No value with id ${rowChangelog.id} found!`);
          continue;
        }

        valueData.value = rowChangelog.metaValue;
      }
      default: {
        console.error(`Unhandled ChangeAction '${rowChangelog.action}' when applying change log!`);
      }
    }
  }
}

function getValueDataById(data: DataAttributePart[], id: number): DataAttributePart | null {
  for (const attributeData of Object.values(data)) {
    if (attributeData.id === id) {
      return attributeData;
    }
  }

  return null;
}

function getMetaValueDataById(data: MetaAttributeData[], id: number): MetaAttributeData | null {
  for (const attributeData of Object.values(data)) {
    if (attributeData.id === id) {
      return attributeData;
    }
  }

  return null;
}

function saveChangelog(changelog: Changelog): boolean {
  try {
    localStorage.setItem("VETO.changelog", JSON.stringify(changelog));
  } catch (e) {
    return false;
  }
  return true;
}
