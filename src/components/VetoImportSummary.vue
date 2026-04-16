<template>
  <div v-if="importSummary.hasImport">

    <!-- Legend -->
    <div class="veto-summary-legend border-bottom">
      <div class="veto-summary-legend-item">
        <div class="veto-summary-legend-item-color veto-summary-legend-item-color-success"></div>
        <div>No errors occurred / Column is present </div>
      </div>
      <div class="veto-summary-legend-item">
        <div class="veto-summary-legend-item-color veto-summary-legend-item-color-warning"></div>
        <div>Column is missing, but was automatically added during the import</div>
      </div>
      <div class="veto-summary-legend-item">
        <div class="veto-summary-legend-item-color veto-summary-legend-item-color-error"></div>
        <div>Errors occurred / Column is missing and must be present before the import</div>
      </div>
    </div>

    <!-- File -->
    <div>File:</div>
    <div class="veto-summary-item-list veto-input-success">
      <font-awesome-icon :icon="['fas', 'check']" :fixedWidth="true"></font-awesome-icon>
      <span class="veto-summary-item-text">{{ importSummary.filename }}</span>
    </div>

    <!-- Errors -->
    <div>Errors:</div>
    <div class="veto-summary-item-list">
      <div v-if="importSummary.errors.length > 0" class="veto-input-error">
        <!-- List of errors -->
        <div v-for="(error) in importSummary.errors">
          <font-awesome-icon icon="fa-xmark" :fixedWidth="true"></font-awesome-icon>
          <span class="veto-summary-item-text">{{ error }}</span>
        </div>
      </div>
      <div v-else class="veto-input-success">
        <!-- Placeholder when no errors -->
        <font-awesome-icon :icon="['fas', 'check']" :fixedWidth="true"></font-awesome-icon>
        <span class="veto-summary-item-text">No Errors</span>
      </div>
    </div>

    <!-- Text column -->
    <div>Text Column:</div>
    <div class="veto-summary-item-list">
        <span v-if="importSummary.textColumn !== null" class="veto-input-success">
          <font-awesome-icon :icon="['fas', 'check']" :fixedWidth="true"></font-awesome-icon>
          <span class="veto-summary-item-text">{{ importSummary.textColumn }}</span>
        </span>
      <span v-else class="veto-input-error">
          <font-awesome-icon icon="fa-xmark" :fixedWidth="true"></font-awesome-icon>
          <span class="veto-summary-item-text">Missing</span>
        </span>
    </div>

    <!-- Check Column -->
    <div>Check Column:</div>
    <div class="veto-summary-item-list">
        <span v-if="importSummary.hasCheckColumn" class="veto-input-success">
          <font-awesome-icon :icon="['fas', 'check']" :fixedWidth="true"></font-awesome-icon>
          <span class="veto-summary-item-text">Found</span>
        </span>
      <span v-else class="veto-input-warning">
          <font-awesome-icon icon="fa-xmark" :fixedWidth="true"></font-awesome-icon>
          <span class="veto-summary-item-text">Missing</span>
        </span>
    </div>

    <!-- Attributes -->
    <div>Attributes:</div>
    <div class="veto-summary-item-list">

      <div v-if="Object.keys(importSummary.attributes).length > 0">
        <!-- List of attributes-->
        <table class="veto-summary-table">
          <tr v-for="(attribute, name) in importSummary.attributes">
            <td>
              <span v-if="hasAttributeNecessaryColumns(attribute)" class="veto-input-success">
                <font-awesome-icon :icon="['fas', 'check']" :fixedWidth="true"></font-awesome-icon>
                <span class="veto-summary-item-text">{{ name }}:</span>
              </span>
              <span v-else class="veto-input-error">
                <font-awesome-icon :icon="['fas', 'xmark']" :fixedWidth="true"></font-awesome-icon>
                <span class="veto-summary-item-text">{{ name }}:</span>
              </span>
            </td>
            <td v-for="(valid, column) in attribute">
              <span v-if="valid" class="veto-input-success">
                <font-awesome-icon :icon="['fas', 'check']" :fixedWidth="true"></font-awesome-icon>
                <span class="veto-summary-item-text">{{ column }}</span>
              </span>
              <span v-else class="veto-input-warning">
                <font-awesome-icon icon="fa-xmark" :fixedWidth="true"></font-awesome-icon>
                <span class="veto-summary-item-text">{{ column }}</span>
              </span>
            </td>
          </tr>
        </table>
      </div>

      <div v-else class="veto-input-success">
        <!-- Placeholder when no attributes-->
        <font-awesome-icon :icon="['fas', 'check']" :fixedWidth="true"></font-awesome-icon>
        <span class="veto-summary-item-text">No attributes</span>
      </div>
    </div>

    <!-- Meta-Attributes -->
    <div>Meta-Attributes:</div>
    <div class="veto-summary-item-list">

      <div v-if="importSummary.metaAttributes.length > 0">
        <!-- List of meta attributes-->
        <div v-for="name in importSummary.metaAttributes">
          <span class="veto-input-success">
            <font-awesome-icon :icon="['fas', 'check']" :fixedWidth="true"></font-awesome-icon>
            <span class="veto-summary-item-text">{{ name }}</span>
          </span>
        </div>
      </div>

      <div v-else class="veto-input-success">
        <!-- Placeholder when no meta attributes-->
        <font-awesome-icon :icon="['fas', 'check']" :fixedWidth="true"></font-awesome-icon>
        <span class="veto-summary-item-text">No meta attributes</span>
      </div>
    </div>

    <!-- Additional Columns -->
    <div>Additional columns:</div>
    <div class="veto-summary-item-list">

      <div v-if="importSummary.otherColumns.length > 0">
        <!-- List of additional columns -->
        <div v-for="columnName in importSummary.otherColumns" class="veto-input-success">
          <font-awesome-icon :icon="['fas', 'check']" :fixedWidth="true"></font-awesome-icon>
          <span class="veto-summary-item-text">{{ columnName }}</span>
        </div>
      </div>

      <div v-else class="veto-input-success">
        <!-- Placeholder when no additional columns -->
        <font-awesome-icon :icon="['fas', 'check']" :fixedWidth="true"></font-awesome-icon>
        <span class="veto-summary-item-text">No additional columns</span>
      </div>
    </div>
  </div>
  <div v-else>
    No previous import found
  </div>
</template>

<script lang="ts">
import { AttributeValidationData } from "@/types/ImportSummary";
import { defineComponent } from 'vue'

export default defineComponent({
  name: "VetoImportSummary",
  props: ['importSummary'],
  methods: {
    hasAttributeNecessaryColumns(attribute: AttributeValidationData) {
      return attribute.VETO_ATTR_VALUE || (attribute.VETO_ATTR_START && attribute.VETO_ATTR_END);
    },
  },
});
</script>

<style scoped>
.veto-summary-legend {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--veto-color-border);
}

.veto-summary-legend-item {
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.veto-summary-legend-item-color {
  border-radius: 20%;
  height: 0.8rem;
  width: 0.8rem;
}

.veto-summary-legend-item-color-error {
  background-color: var(--veto-color-error);
}

.veto-summary-legend-item-color-success {
  background-color: var(--veto-color-success);
}

.veto-summary-legend-item-color-warning {
  background-color: var(--veto-color-warning);
}

.veto-summary-item-list {
  margin-left: 1rem;
}

.veto-summary-item-text {
  margin-left: 0.3rem;
}

.veto-summary-table > tr > td {
  padding-left: 0.5rem;
}
</style>
