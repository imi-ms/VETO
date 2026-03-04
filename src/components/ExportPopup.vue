<template>
    <Popup ref="exportPopup" :id="id" header="Export file" confirm-button-label="Export" @confirm="download()">
      <template #popup-body>
            <div class="mb-2">

              <label for="downloadColumnModeInput" class="form-label">Select columns to export</label>
              <span class="veto-form-multiselect">
                  <Multiselect id="downloadColumnModeInput"
                               v-model="selectedDownloadColumnMode"
                               :options="['ALL', 'ONLY_VETO', 'ONLY_ATTRIBS']"
                               :customLabel="value => value === 'ALL' ? 'All columns' : (value === 'ONLY_VETO' ? 'Only VETO columns' : 'Without VETO columns')"
                               :searchable="false"
                               :allow-empty="false"
                               :multiple="false"
                               :show-labels="false"/>
              </span>

              <label for="downloadRowModeInput" class="form-label">Select rows to export</label>
              <span class="veto-form-multiselect">
                  <Multiselect id="downloadRowModeInput"
                               v-model="selectedDownloadRowMode"
                               :options="['ALL_ROWS', 'ONLY_CHECKED', 'ONLY_UNCHECKED']"
                               :customLabel="value => value === 'ALL_ROWS' ? 'All rows' : (value === 'ONLY_CHECKED' ? 'Only checked rows' : 'Only unchecked rows')"
                               :searchable="false"
                               :allow-empty="false"
                               :multiple="false"
                               :show-labels="false"/>
              </span>

              <label for="downloadModeInput" class="form-label">Select data format</label>
              <span class="veto-form-multiselect">
                  <Multiselect id="downloadModeInput"
                               v-model="selectedDownloadFormat"
                               :options="['CSV', 'JSON', 'XLSX']"
                               :customLabel="value => value === 'CSV' ? 'CSV (.csv)' : (value === 'JSON' ? 'JSON (.json)' : 'XLSX (.xlsx)')"
                               :searchable="false"
                               :allow-empty="false"
                               :multiple="false"
                               :show-labels="false"/>
              </span>

              <template v-if="hasMultiValueView && selectedDownloadFormat !== 'JSON'">
                <label for="delimiter" class="form-label">Value Delimiter</label>
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
              </template>
            </div>
      </template>
    </Popup>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { DownloadColumnMode, DownloadFormat, DownloadRowMode } from "@/types/DownloadMode";
import Popup from "@/components/Popup.vue";
import Data from "@/types/Data";
import {useVetoStore} from "@/store"
import {mapStores} from "pinia";
import MetaData from "@/types/MetaData";
import { exportFile } from "@/scripts/veto-files";
import {DelimiterMode, DelimiterModes, IDelimiterMode} from "@/types/FileData";

interface DownloadRow {
  textColumnValue: string,
  attributes: {
    [attributeName: string]: Array<{
      value: string,
      oldValue?: string,
      start?: number,
      end?: number
    }>
  }
  additionalColumns: {
    [columnName: string]: null | string | number | boolean
  },
  metaAttributes: {
    [attributeName: string]: Array<{
      value: string
      oldValue?: string
    }>
  }
}

interface VetoJsonRow {
  text?: string,
  path?: string,
  attributes: {
    [attributeName: string]: Array<{
      value: string,
      old: string,
      start: number,
      end: number
    } | string>
  }
  additionalFields?: {
    [columnName: string]: null | string | number | boolean
  }
}

export default defineComponent({
  name: "ExportPopup",
  props: ["id"],
  emits: ['close'],
  components: {
    Popup
  },
  data() {
    return {
      availableDownloadColumnModes: {
        'ALL': {label: 'All columns'},
        'ONLY_VETO': {label: 'Only VETO columns'},
        'ONLY_ATTRIBS': {label: 'Without VETO columns'},
      },
      availableDownloadRowModes: {
        'ALL_ROWS': {label: 'All rows'},
        'ONLY_CHECKED': {label: 'Only checked rows'},
        'ONLY_UNCHECKED': {label: 'Only unchecked rows'},
      },
      availableDownloadFormats: {
        'CSV': {label: 'CSV (.csv)'},
        'JSON': {label: 'JSON (.json)'},
      },
      delimiterModes: DelimiterModes,
      selectedValueDelimiter: DelimiterModes.getDelimiterMode("SEMICOLON"),
      selectedDownloadColumnMode: 'ALL' as DownloadColumnMode,
      selectedDownloadRowMode: 'ALL_ROWS' as DownloadRowMode,
      selectedDownloadFormat: "CSV" as DownloadFormat
    }
  },
  methods: {
    open() {
      this.selectedValueDelimiter = this.columnData.formatSpecificAttribs.VALUE_DELIMITER;
      (this.$refs['exportPopup'] as typeof Popup).open();
    },
    download() {
      exportFile(this.columnData, this.currentData, this.selectedDownloadFormat, this.selectedDownloadColumnMode);
      // Mark changes as exported
      this.vetoStore.updateExportedChanges(true);
    }
  },
  computed: {
    ...mapStores(useVetoStore),
    data(): Array<Data> {
      return this.vetoStore.data;
    },
    columnData(): MetaData {
      return this.vetoStore.columnData;
    },
    currentData: function (): Array<Data> {
      return this.vetoStore.data;
    },
    hasMultiValueView: function(): boolean {
      return this.vetoStore.columnData.containsMultiValueAttributes;
    },
    currentColumnData: function (): MetaData {
      return this.vetoStore.columnData;
    },
  },
});
</script>
