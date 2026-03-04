<template>
  <Popup ref="loosingChangesPopup" id="loosingChangesModal" header="Warning - Unsaved Changes" width="30%"
         @confirm="onConfirm">
    <template #popup-body>
      <span>Do you want to change the input file settings? Some changes will get lost.</span>
    </template>
  </Popup>
  <Popup ref="restoreChangesPopup" id="restoreChangesModal" header="Changes Found" width="30%" @confirm="restore">
    <template #popup-body>
      <span>There are local changes that have not been exported last time. Should they be restored?</span>
    </template>
  </Popup>
  <Popup :id='id' ref="importPopup" header="Import your files into VETO" :zIndex="1052"  @confirm="onUploadClicked"
         :confirm-button-closing="false" confirm-button-label="Import">
    <template #popup-body>

      <ul class="nav nav-tabs mb-2" id="importPopupTab" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active" id="import-tab" data-bs-toggle="tab" data-bs-target="#import-tab-pane"
                  type="button" role="tab" aria-controls="import-tab-pane" aria-selected="true">Import new file
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="summary-tab" data-bs-toggle="tab" data-bs-target="#summary-tab-pane"
                  type="button" role="tab" aria-controls="summary-tab-pane" aria-selected="false">Summary of the last
            import
          </button>
        </li>
      </ul>
      <div class="tab-content" id="importPopupContent">
        <div class="tab-pane fade show active" id="import-tab-pane" role="tabpanel" aria-labelledby="import-tab"
             tabindex="0">

          <!-- Import Form -->
          <form>
            <div class="veto-group">
              <div class="veto-group-head">File Selection</div>

              <div class="veto-input">
                <label class="veto-input-label">
                  Are the texts contained in a single file together with the attributes or in separate text files?
                </label>

                <div class="input-group">
                  <label for="uploadMode" class="input-group-text">File structure</label>
                  <span class="veto-form-multiselect">
                    <Multiselect id="uploadMode"
                                 v-model="selectedUploadMode"
                                 :options="Object.keys(uploadModes)"
                                 :custom-label="(labelId: string) => uploadModes[labelId]"
                                 :searchable="false"
                                 :allow-empty="false"
                                 :multiple="false"
                                 :show-labels="false"/>
                  </span>
                </div>
              </div>

              <div class="veto-input">
                <label class="veto-input-label">
                  Upload your {{ selectedUploadMode === 'SINGLE' ? 'file' : 'files' }}
                </label>

                <div class="input-group">
                  <label class="input-group-text" for="fileInput">Attribute file</label>
                  <input @change="onSelectedFileChanged()" class="form-control btn-secondary" id="fileInput" type="file"
                         ref="metadata" accept=".csv, .json, .xlsx"/>

                  <label for="sampleInput" class="input-group-text"
                         :style="{'display': selectedUploadMode === 'SINGLE' ? 'none' : 'block'}">
                    Text files (*.csv, *.txt, *.xml, *.json)
                  </label>
                  <input @change="onExternalTextFileChanged()" id="sampleInput" class="form-control btn-secondary"
                         type="file" ref="sample"
                         :style="{'display': selectedUploadMode === 'SINGLE' ? 'none' : 'block'}"
                         accept=".csv, .txt, .xml, .json" multiple/>
                </div>

                <div id="noFileSelectedError" class="veto-input-error" style="display: none;">No attribute file
                  selected!
                </div>
                <div id="unsupportedFileTypeError" class="veto-input-error" style="display: none;">File type is not
                  supported!
                </div>
                <div id="noExternalTextFilesSelectedError" class="veto-input-error"
                     style="display: none;">No text files selected!
                </div>
              </div>

            </div>
            <div class="veto-group">
              <div class="veto-group-head">File Content</div>

              <template v-if="currentFile == null">
                <div style="text-align: center; font-style: italic">Select a file for more settings</div>
              </template>

              <div v-if="currentFile != null && showFileOptions()" class="veto-input">
                <label class="veto-input-label">Specify the file format</label>
                <div class="input-group">

                  <template v-if="showFileOption('QUOTE_CHAR')">
                    <label for="quoteChar" class="input-group-text">Quote Char</label>
                    <span class="veto-form-multiselect">
                      <Multiselect id="quoteChar"
                                   v-model="selectedQuoteChar"
                                   :options="quoteChars"
                                   :searchable="false"
                                   :allow-empty="false"
                                   :multiple="false"
                                   :show-labels="false"
                                   @select="onFileSettingsChanges()"/>
                    </span>
                  </template>
                  <template v-if="showFileOption('DELIMITER')">
                    <label for="delimiter" class="input-group-text">Delimiter</label>
                    <span class="veto-form-multiselect">
                      <Multiselect id="delimiter"
                                   v-model="selectedDelimiter"
                                   :options="Object.values(delimiterModes)"
                                   label="label"
                                   track-by="type"
                                   :searchable="false"
                                   :allow-empty="false"
                                   :multiple="false"
                                   :show-labels="false"
                                   @select="onFileSettingsChanges()"/>
                    </span>
                  </template>
                  <template v-if="showFileOption('LINE_BREAK')">
                    <label for="lineBreak" class="input-group-text">Line Break</label>
                    <span class="veto-form-multiselect">
                      <Multiselect id="lineBreak"
                                   v-model="selectedLinebreak"
                                   :options="Object.keys(lineBreakModes)"
                                   :custom-label="(lineBreakModeId: string) => lineBreakModes[lineBreakModeId].label"
                                   :searchable="false"
                                   :allow-empty="false"
                                   :multiple="false"
                                   :show-labels="false"
                                   @select="onFileSettingsChanges()"/>
                    </span>
                  </template>
                  <template v-if="showFileOption('ENCODING')">
                    <label for="fileEncoding" class="input-group-text">Encoding</label>
                    <span class="veto-form-multiselect">
                      <Multiselect id="fileEncoding"
                                   v-model="selectedFileEncoding"
                                   :options="Object.keys(fileEncodings)"
                                   :custom-label="(fileEncodingId: string) => fileEncodings[fileEncodingId].label"
                                   :searchable="false"
                                   :allow-empty="false"
                                   :multiple="false"
                                   :show-labels="false"/>
                    </span>
                  </template>
                </div>
              </div>

              <template v-if="!selectedHasVetoColumns">
                <div class="veto-input">

                  <label class="veto-input-label">
                    <span class="text-warning">
                      The selected file does not contain VETO columns!
                    </span>
                    <span>
                      Specify which column contains the text to be annotated and which columns should be imported as attributes
                    </span>
                  </label>

                  <div class="input-group">
                    <label for="textColumn" class="input-group-text">Text column</label>
                    <span class="veto-form-multiselect">
                      <Multiselect id="textColumn" v-model="selectedTextColumn" :options="currentFileColumns"
                                   :allow-empty="true" :searchable="true" :multiple="false"
                                   @select="onTextColumnSelected($event)">
                      </Multiselect>
                    </span>
                    <label for="attributeColumns" class="input-group-text">Attribute columns</label>
                    <span class="veto-form-multiselect">
                      <Multiselect id="attributeColumns" v-model="selectedAttributeColumns"
                                   :options="currentFileColumns"
                                   :allow-empty="true" :searchable="true" :multiple="true"
                                   @select="onAttributeColumnSelected($event)">
                      </Multiselect>
                    </span>
                  </div>

                  <div id="noTextColumnSelectedError" class="veto-input-error" style="display: none;">
                    No text column selected!
                  </div>
                  <div id="noAttributeColumnsSelectedError" class="veto-input-error" style="display: none;">
                    No attribute columns selected!
                  </div>
                </div>
              </template>

              <template v-if="showFileOption('VALUE_DELIMITER')">
                <label class="veto-input-label">Configure handling of multiple values</label>
                <div class="input-group veto-input">
                  <label for="multipleValues" class="input-group-text">Look for multiple values</label>
                  <div class="input-group-text input-group-check">
                    <input v-model="selectedMultipleValues" id="multipleValues" type="checkbox"
                           class="form-check-input mt-0">
                  </div>

                  <label for="delimiter" class="input-group-text">Value Delimiter</label>
                  <span class="veto-form-multiselect">
                    <Multiselect id="delimiter"
                                 v-model="selectedValueDelimiter"
                                 :options="Object.values(delimiterModes).filter(value => value.type !== 'AUTO')"
                                 label="label"
                                 track-by="type"
                                 :searchable="false"
                                 :allow-empty="false"
                                 :multiple="false"
                                 :show-labels="false"/>
                  </span>
                </div>
              </template>
            </div>
          </form>

        </div>

        <div class="tab-pane fade" id="summary-tab-pane" role="tabpanel" aria-labelledby="summary-tab" tabindex="0">
          <VetoImportSummary :import-summary="importSummary"/>
        </div>
      </div>

    </template>
  </Popup>
</template>

<script lang="ts">
import VetoImportSummary from "@/components/VetoImportSummary.vue";
import {defineComponent} from "vue";

import Popup from "@/components/Popup.vue";
import {UploadFileOption, UploadFileType, UploadMode} from "@/types/UploadMode";
import {Changelog} from "@/types/State";
import {DelimiterModes, FileEncoding, Linebreak, QuoteChar, quoteChars} from "@/types/FileData";
import {useVetoStore} from "@/store";
import {mapStores} from "pinia";
import { AnnotationColorScheme, AnnotationColorSchemeType } from "@/types/AnnotationColorScheme";
import { ImportOptions } from "@/scripts/veto-files";
import { importFile } from "@/scripts/veto-files";
import { ImportReturn } from "@/scripts/veto-files";
import ImportSummary from "@/types/ImportSummary";
import CsvFileConverter from "@/scripts/csv";
import {attributeColumnPrefixes} from "@/scripts/tables";
import Multiselect from "vue-multiselect";
import XlsxFileConverter from "@/scripts/xlsx";
import {Tab} from "bootstrap";

type LinebreakMode = 'AUTO' | 'BOTH' | 'CARRIAGE_RETURN' | 'LINE_FEED';

export default defineComponent({
  name: "ImportPopup",
  props: ["id"],
  components: {
    Multiselect,
    VetoImportSummary,
    Popup
  },
  emits: ['import'],
  data() {
    return {
      currentFile: null as File | null,
      currentFileColumns: [] as Array<string>,
      delimiterModes: DelimiterModes,
      importSummary: {
        attributes: {
          "age": {
            VETO_ATTR_OLD: false,
            VETO_ATTR_END: true,
            VETO_ATTR_START: true,
            VETO_ATTR_VALUE: true,
          },
          "gender": {
            VETO_ATTR_OLD: true,
            VETO_ATTR_END: false,
            VETO_ATTR_START: true,
            VETO_ATTR_VALUE: false,
          },
        },
        errors: [],
        filename: "Initial Example",
        hasCheckColumn: false,
        hasImport: false,
        metaAttributes: [],
        otherColumns: [],
        textColumn: "text",
      } as ImportSummary,
      lineBreakModes: {
          'AUTO': {label: 'Auto detect', value: ''},
          'CARRIAGE_RETURN': {label: '\\r', value: '\r'},
          'LINE_FEED': {label: '\\n', value: '\n'},
          'BOTH': {label: '\\r\\n', value: '\r\n'},
      },
      fileEncodings: {
          'UTF-8': {label: 'UTF-8', value: 'UTF-8'},
      },
      quoteChars,
      selectedAttributeColumns: [] as string[],
      selectedDelimiter: DelimiterModes.getDelimiterMode('AUTO'),
      selectedHasVetoColumns: true,
      selectedLinebreak: 'AUTO' as LinebreakMode,
      selectedMultipleValues: true,
      selectedQuoteChar: '"' as QuoteChar,
      selectedFileEncoding: 'UTF-8' as FileEncoding,
      selectedUploadMode: 'SINGLE' as UploadMode | null,
      selectedTextColumn: null as string | null,
      selectedValueDelimiter: DelimiterModes.getDelimiterMode('SEMICOLON'),
      uploadModes: {
        'SINGLE': 'Single File',
        'SEPARATE': 'Separate Text Files',
      } as Record<string, string>,
    }
  },
  methods: {
    /**
     * Converts the current state of the import popup to an ImportOptions object.
     */
    getImportOptions(): ImportOptions {
      return {
        multipleFiles: this.selectedUploadMode === "SEPARATE",
        detectMultipleValue: this.selectedMultipleValues,
        valueDelimiter: this.selectedValueDelimiter,
        csvDelimiter: this.selectedDelimiter,
        csvLinebreak: this.selectedCsvLineBreak,
        csvQuoteChar: this.selectedQuoteChar,
        colorScheme: this.currentColorScheme,

        hasVetoColumns: this.selectedHasVetoColumns,
        textColumn: this.selectedTextColumn,
        attributeColumns: this.selectedAttributeColumns,
      };
    },
    // Wird von außen zum Öffnen des Popups aufgerufen
    open() {
      this.clearFileInputs();
      (this.$refs['importPopup'] as typeof Popup).open();
    },
    onSelectedFileChanged() {
      document.getElementById("noFileSelectedError")!.style.display = "none";

      const fileList: FileList | null = (this.$refs.metadata as HTMLInputElement).files;
      if (!fileList || fileList.length === 0) {
        return;
      }

      this.currentFile = fileList[0];

      this.updateColumns();
    },
    onExternalTextFileChanged() {
      document.getElementById("noExternalTextFilesSelectedError")!.style.display = "none";
    },
    async updateFile() {
      // Validate inputs
      let isInputInvalid = false;

      const fileList: FileList | null = (this.$refs.metadata as HTMLInputElement).files;
      if (!fileList || fileList.length === 0) {
        document.getElementById("noFileSelectedError")!.style.display = "";
        isInputInvalid = true;
      } else {
        document.getElementById("noFileSelectedError")!.style.display = "none";
      }

      const externalFileList: FileList | null = (this.$refs.sample as HTMLInputElement).files;
      if (this.selectedUploadMode === "SEPARATE") {
        if (!externalFileList || externalFileList.length === 0) {
          document.getElementById("noExternalTextFilesSelectedError")!.style.display = "";
          isInputInvalid = true;
        } else {
          document.getElementById("noExternalTextFilesSelectedError")!.style.display = "none";
        }
      }

      if (!this.selectedHasVetoColumns) {
        if (this.selectedTextColumn == null) {
          document.getElementById("noTextColumnSelectedError")!.style.display = "";
          isInputInvalid = true;
        } else {
          document.getElementById("noTextColumnSelectedError")!.style.display = "none";
        }
        if (this.selectedAttributeColumns.length === 0) {
          document.getElementById("noAttributeColumnsSelectedError")!.style.display = "";
          isInputInvalid = true;
        } else {
          document.getElementById("noAttributeColumnsSelectedError")!.style.display = "none";
        }
      }

      if (isInputInvalid) {
        return;
      }

      // Build the Options Object that the actual import function uses
      const importOptions = this.getImportOptions();

      if (this.selectedUploadMode === "SEPARATE") {
        importOptions.externalTextFiles = [];
        Array.from(externalFileList!).forEach(f => {
          importOptions.externalTextFiles!.push(f);
        });
      }

      const importReturn: ImportReturn | null = await importFile(fileList![0], importOptions);

      if (importReturn === null) {
        document.getElementById("unsupportedFileTypeError")!.style.display = '';
        return;
      }

      importReturn.meta.usingExternalTextFiles = importOptions.multipleFiles;

      this.importSummary = {
        attributes: importReturn.attributeValidation,
        errors: importReturn.errors,
        filename: importReturn.meta.fileName,
        hasCheckColumn: importReturn.hasCheckColumn,
        hasImport: true,
        metaAttributes: Object.keys(importReturn.meta.validMetaAttributes),
        otherColumns: importReturn.meta.otherColumns,
        textColumn: importReturn.meta.textColumnName?? null,
      };
      this.vetoStore.updateFile({
        columnData: importReturn.meta,
        data: importReturn.data
      });

      const oldChangelogString = localStorage.getItem("VETO.changelog");
      if (oldChangelogString) {
        const oldChangelog = JSON.parse(oldChangelogString) as Changelog;
        if (oldChangelog.fileName === fileList![0].name && !oldChangelog.exportedAllChanges) {
          (this.$refs['restoreChangesPopup'] as typeof Popup).open();
        }
      }

      new Tab("#summary-tab").show();

      this.$emit('import');
    },
    onConfirm() {
      this.updateFile();
    },
    clearFileInputs() {
      document.getElementById("noFileSelectedError")!.style.display = "none";
      document.getElementById("unsupportedFileTypeError")!.style.display = "none";
      document.getElementById("noExternalTextFilesSelectedError")!.style.display = "none";
      (document.getElementById("fileInput") as HTMLInputElement).value = "";
      (document.getElementById("sampleInput") as HTMLInputElement).value = "";

      this.currentFile = null;
      this.selectedHasVetoColumns = true;
      this.selectedTextColumn = null;
      this.selectedAttributeColumns = [];
    },
    restore() {
      const oldChangelogString = localStorage.getItem("VETO.changelog");
      if (oldChangelogString) {
        const oldChangelog = JSON.parse(oldChangelogString) as Changelog;
        this.vetoStore.applyChangelog(oldChangelog);
      }
    },
    onUploadClicked(){
      if (!this.exportedAllChanges) {
        (this.$refs['loosingChangesPopup'] as typeof Popup).open();
      } else {
        this.updateFile();
      }
    },
    showFileOptions(): boolean {
      switch (this.selectedFileType) {
        case "NONE":
        case "UNKNOWN":
        case "XLSX":
          return false;
        case "CSV":
        case "JSON":
          return true;
        default:
          return false;
      }
    },
    showFileOption(fileOption: UploadFileOption): boolean {
      const fileType: UploadFileType = this.selectedFileType;

      switch(fileType) {
        case "NONE":
        case "UNKNOWN":
          return false;
        case "CSV":
          switch(fileOption) {
            case "DELIMITER":
            case "QUOTE_CHAR":
            case "LINE_BREAK":
            case "VALUE_DELIMITER":
              return true;
            case "ENCODING":
              return false;
          }
        case "JSON":
          switch(fileOption) {
            case "ENCODING":
              return true;
            case "DELIMITER":
            case "QUOTE_CHAR":
            case "LINE_BREAK":
            case "VALUE_DELIMITER":
              return false;
          }
        case "XLSX":
          switch (fileOption) {
            case "VALUE_DELIMITER":
              return true;
            default:
              return false;
          }
        }
    },
    onFileSettingsChanges() {
      console.log("File settings changed");
      this.updateColumns();
    },
    onTextColumnSelected(value: string) {
      if (this.selectedAttributeColumns.includes(value)) {
        this.selectedAttributeColumns.splice(this.selectedAttributeColumns.indexOf(value), 1);
      }
    },
    onAttributeColumnSelected(value: string) {
      if (this.selectedTextColumn === value) {
        this.selectedTextColumn = null;
      }
    },
    updateColumns() {
      if (this.currentFile == null) {
        return;
      }

      this.selectedTextColumn = null;
      this.selectedAttributeColumns = [];

      switch (this.selectedFileType) {
        case "CSV":
          (new CsvFileConverter()).getColumnNames(this.currentFile, this.getImportOptions()).then(
            (columns) => {
              this.currentFileColumns = columns;
              this.selectedHasVetoColumns = columns.some(head => attributeColumnPrefixes.some(prefix => head.toLowerCase().startsWith(prefix.prefix)));
            }
          );
          break;
        case "XLSX":
          (new XlsxFileConverter()).getColumnNames(this.currentFile).then(
            (columns) => {
              this.currentFileColumns = columns;
              this.selectedHasVetoColumns = columns.some(head => attributeColumnPrefixes.some(prefix => head.toLowerCase().startsWith(prefix.prefix)));
            }
          )
          break
        default:
          this.currentFileColumns = [];
          this.selectedHasVetoColumns = true;
          break;
      }
    }
  },
  computed: {
    ...mapStores(useVetoStore),
    exportedAllChanges(): boolean {
      return this.vetoStore.exportedAllChanges;
    },
    currentColorScheme(): AnnotationColorSchemeType {
      return AnnotationColorScheme.getColorScheme(this.vetoStore.appSettings.annotationColorScheme).scheme;
    },
    selectedCsvLineBreak(): Linebreak {
      switch (this.selectedLinebreak) {
        case "AUTO":
          return '';
        case "BOTH":
          return '\r\n';
        case "CARRIAGE_RETURN":
          return '\r';
        case "LINE_FEED":
          return '\n';
      }
    },
    selectedFileType(): UploadFileType {
      if(this.currentFile == null) return "NONE";

      switch(this.currentFile.type) {
        case "application/json":
            return "JSON";
        case "text/csv": // For Chromium
        case "application/vnd.ms-excel": // For Firefox
          return "CSV";
        case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
          return "XLSX";
        default:
          return "UNKNOWN";
      }
    }
  }
});
</script>

<style scoped>
.form-control:not(:disabled):not([readonly])::file-selector-button {
  background-color: var(--veto-color-main);
  color: var(--veto-color-label);
}
.form-control:hover:not(:disabled):not([readonly])::file-selector-button {
  background-color: var(--veto-color-main-highlight);
}

.input-group-check {
  background-color: var(--veto-color-background);
}
</style>
