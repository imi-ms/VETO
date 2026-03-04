<template>

  <!-- Popup for result of auto fix -->
  <Popup ref="autoFixResult" id="autoFixResultModal" header="Result of auto fix" width="30%" :hide-close-button="true"
         :hide-confirm-button="false">
    <template #popup-body>
      <div>
        Number of conflicts that could be fixed: {{ fixResult.numberFixed }}
      </div>
      <div>
        Number of conflicts that could not be fixed: {{ fixResult.numberNotFixed }}
      </div>
    </template>
  </Popup>

  <!-- Popup for manuel fix -->
  <Popup ref="fixValue" id="fixValueModal" header="Fix value and indices" width="30%" :hide-close-button="false"
         :hide-confirm-button="true">
    <template #popup-body>

      <!-- Current values -->
      <div class="border-2 border-bottom pb-2">
        <div class="mb-2">Current Values:</div>
        <div>
          <span class="me-4">value: {{ fixMatch.currentValue }}</span>
          <span class="me-4">start: {{ fixMatch.currentStart }}</span>
          <span>end: {{ fixMatch.currentEnd }}</span>
        </div>
      </div>

      <!-- Value of start and end pos -->
      <div class="border-2 border-bottom pb-2">
        <div class="mb-2">Set the value using the start and end indices:</div>
        <div v-if="fixMatch.valueOfIndices === null" class="mb-2">No valid start and end indices</div>
        <div v-else class="mb-2">
          <span>{{ fixMatch.valueOfIndicesPre }}</span>
          <span :style="{'background-color': fixMatch.color}" style="color: white;">{{ fixMatch.valueOfIndices }}</span>
          <span>{{ fixMatch.valueOfIndicesPost }}</span>
        </div>
        <span class="veto-action-button">
          <button type="button" class="veto-neutral veto-size-fit" :disabled="fixMatch.valueOfIndices === null"
                  data-bs-dismiss="modal" @click="setValue(fixMatch)">Set value
          </button>
        </span>
      </div>

      <!-- Occurrences of value -->
      <div class="pt-2 h-100">
        <div>Set the start and end indices using the value:</div>
        <div v-if="fixMatch.occurrences.length === 0" class="mb-2">No matching values found</div>
        <div v-else class="mb-2 border-top border-1 h-100" style="overflow-y: auto; max-height: 40vh;">
          <ul class="ps-0" style="list-style: none;">
            <li v-for="(occurrence, index) in fixMatch.occurrences" class="d-flex border-bottom border-1">
              <div style="flex: 0 0 auto; margin: auto;">
                <input type="radio" name="fix" v-model="occurrenceIndex" v-bind:value="index" style="margin-right: 4px;"
                       @click="enableSetIndicesButton"/>
              </div>
              <div style="flex: 1 1 auto;">
                <div>
                  <span>start: {{ occurrence.start }}, end: {{ occurrence.end }}</span>
                </div>
                <div style="">
                  <span>{{ occurrence.pre }}</span>
                  <span :style="{'background-color': fixMatch.color}"
                        style="color: white;">{{ occurrence.value }}</span>
                  <span>{{ occurrence.post }}</span>
                </div>
              </div>
              <div class="veto-action-button" style="flex: 0 0 auto; margin: auto;">
                <button class="veto-neutral veto-size-05" @click="$emit('scrollToPosition', occurrence)"
                        data-bs-dismiss="modal" style=" height: 30px;">
                  <font-awesome-icon :icon="['fas', 'magnifying-glass']"></font-awesome-icon>
                </button>
              </div>
            </li>
          </ul>
        </div>
        <span class="veto-action-button">
          <button ref="setIndicesButton" type="button" class="veto-neutral veto-size-fit" data-bs-dismiss="modal"
                  disabled="disabled" @click="setIndices">Set indices
          </button>
        </span>
      </div>
    </template>
  </Popup>

  <!-- Popup for attribute settings -->
  <Popup ref="attributeSettings" id="attributeSettingsModal" header="Attribute Settings" width="30%"
         :hide-close-button="false" :hide-confirm-button="false" @confirm="onConfirmAttributeSettings();">
    <template #popup-body>

      <div class="veto-group">

        <div class="veto-input">
          <label class="veto-input-label">Color highlighting annotations in the text</label>
          <div class="input-group">
            <label for="attributeSettingsColorInput" class="input-group-text">Annotation Color</label>
            <span class="input-group-text justify-content-center flex-fill">
              <input id="attributeSettingsColorInput" type="color" v-model="attributeSettingsData.cache.color">
            </span>
          </div>
        </div>

        <div class="veto-input">
          <label class="veto-input-label">Regular Expression for validating annotations</label>

          <div class="veto-multiline-input">

            <div class="input-group">
              <label for="attributeSettingsRegEx" class="input-group-text">Regular Expression</label>
              <input id="attributeSettingsRegEx" type="text" class="form-control" placeholder=".*"
                     v-model="attributeSettingsData.cache.validationRegEx" @input="updateHighlightRegexTest();">
            </div>

            <div class="input-group">
              <label for="attributeSettingsRegExTest" class="input-group-text">Test Input</label>
              <div class="form-control rounded-start-0 randimi-regex-control">
                <div class="form-control border-0 rounded-start-0 h-100 randimi-overlapping">
                  <span class="randimi-regex-highlight randimi-regex-highlight-decline randimi-regex-highlight-all"></span>
                  <span class="randimi-regex-highlight randimi-regex-highlight-accept randimi-regex-highlight-all"></span>
                </div>
                <div style="display: flex;" class="form-control border-0 rounded-start-0 randimi-overlapping">
                  <span class="randimi-regex-highlight randimi-regex-highlight-decline randimi-decline-1"></span>
                  <span class="randimi-regex-highlight randimi-regex-highlight-accept randimi-accept"></span>
                  <span class="randimi-regex-highlight randimi-regex-highlight-decline randimi-decline-2"></span>
                </div>
                <input id="attributeSettingsRegExTest" type="text"
                       class="form-control border-0 rounded-0 randimi-overlapping randimi-regex-text"
                       @input="updateHighlightRegexTest();"/>
              </div>
            </div>

          </div>

        </div>

      </div>

    </template>
  </Popup>

  <!-- Table with header -->
  <div id="vetoTable" class="h-100 veto-border" style="flex-flow: column; display: flex;">

    <!-- Header with settings -->
    <div id="vetoTableHeader" class="border-bottom rounded-top" style="flex: 0 1 auto;">
      <div class="veto-container-row">

        <!-- Show/ hide filter settings -->
        <span class="veto-container-item veto-action-button veto-action-button-anno">
          <button class="veto-neutral" title="Filter optionen"
                  @click="toggleFilter()">
            <font-awesome-icon :icon="['fas', 'filter']" size="xl"></font-awesome-icon>
          </button>
          <span :style="{'display': numberFilter() === 0 ? 'none' : 'block'}">
            <span>{{ numberFilter() }}</span>
          </span>
        </span>

        <!-- Auto Fix -->
        <span class="veto-container-item veto-action-button">
          <button class="veto-size-2 veto-neutral" title="Fix all unambiguous conflicts"
                  @click="autoFixAll">Auto fix</button>
        </span>

        <!-- Delete current cell -->
        <span v-if="!columnData.containsMultiValueAttributes" class="veto-container-item veto-action-button">
          <button :disabled=!hasFieldSelected class="veto-neutral"
                  title="Delete current cell" @click="deleteCurrentCell">
            <font-awesome-icon :icon="['fas', 'trash']" size="xl"></font-awesome-icon>
          </button>
        </span>

        <!-- Deselect current cell -->
        <span v-if="!columnData.containsMultiValueAttributes" class="veto-container-item veto-action-button">
          <button :disabled=!hasFieldSelected class="veto-neutral" title="Deselect current cell"
                  @click="deselectCurrentCell">
            <font-awesome-icon :icon="['fas', 'check']" size="2xl"></font-awesome-icon>
          </button>
        </span>

          <!-- Text size -->
        <span class="veto-container-item veto-input" title="Font size">
          <label for="fontSize" class="form-label me-1">
            <font-awesome-icon icon="fa-text-height" class="align-bottom"></font-awesome-icon>
          </label>
          <span class="veto-size-25">
            <Multiselect id="fontSize"
                         v-model="fontSize"
                         :options="Object.values(FontSize)"
                         label="label"
                         track-by="type"
                         :searchable="false"
                         :allow-empty="false"
                         :multiple="false"
                         :show-labels="false"/>
          </span>
        </span>
        <div class="ms-auto d-flex">

          <!-- Multi value sorting -->
          <span v-if="columnData.containsMultiValueAttributes" title="Value Order"
                class="veto-container-item veto-input d-flex">
            <label for="valueOrder" class="form-label me-1">
              <font-awesome-icon icon="fa-arrow-down-short-wide" class="align-bottom"
                                 v-if="vetoStore.currentValueOrder.type === 'ID'"></font-awesome-icon>
              <font-awesome-icon icon="fa-arrow-down-1-9" class="align-bottom"
                                 v-if="vetoStore.currentValueOrder.type === 'END' || vetoStore.currentValueOrder.type === 'START'"></font-awesome-icon>
              <font-awesome-icon icon="fa-arrow-down-a-z" class="align-bottom"
                                 v-if="vetoStore.currentValueOrder.type === 'VALUE'"></font-awesome-icon>
            </label>
            <span class="veto-size-35">
              <Multiselect id="valueOrder"
                           v-model="vetoStore.currentValueOrder"
                           :options="Object.values(ValueOrder)"
                           label="label"
                           track-by="type"
                           :searchable="false"
                           :allow-empty="false"
                           :multiple="false"
                           :show-labels="false"/>
            </span>
          </span>

          <!-- Toggle multi-value attributes -->
          <span class="veto-container-item veto-action-button">
            <button :disabled="hasMultipleValues" @click="switchMultiValueView"
                    :class="{'veto-active': columnData.containsMultiValueAttributes, 'veto-inactive': !columnData.containsMultiValueAttributes}"
                    :title="columnData.containsMultiValueAttributes ? 'Disable multi-value view' : 'Enable multi-value view'">
              <font-awesome-icon :icon="['fas', 'list']" size="2xl"></font-awesome-icon>
            </button>
          </span>
        </div>
      </div>

      <!-- Filter settings -->
      <div id="filterSettings" class="veto-container-row" style="display: none;">

        <!-- Column filter settings -->
        <div id="columnFilterSettings" class="veto-container-row border-top border-1">

          <!-- Search term -->
          <span class="veto-container-item veto-input">
            <input type="text" class="form-control" placeholder="Filter Columns" title="Filter Columns"
                   v-model="columnFilter.term">
            <span v-if="columnFilter.term" @click="columnFilter.term = ''" class="veto-input-clear" title="Clear">
              <font-awesome-icon icon="fa-xmark"></font-awesome-icon>
            </span>
          </span>

          <!-- Toggle attributes -->
          <span class="veto-container-item veto-action-button">
            <button class="veto-size-3"
                    :class="{'veto-active': columnFilter.showAttributes, 'veto-inactive': !columnFilter.showAttributes}"
                    :title="columnFilter.showAttributes ? 'Hide Attributes' : 'Show Attributes'"
                    @click="columnFilter.showAttributes = !columnFilter.showAttributes;">
              <span>Annotations</span>
            </button>
          </span>

          <!-- Toggle meta-attributes -->
          <span class="veto-container-item veto-action-button">
            <button class="veto-size-3"
                    :class="{'veto-active': columnFilter.showMetaAttributes, 'veto-inactive': !columnFilter.showMetaAttributes}"
                    :title="columnFilter.showMetaAttributes ? 'Hide Meta-Attributes' : 'Show Meta-Attributes'"
                    @click="columnFilter.showMetaAttributes = !columnFilter.showMetaAttributes;">
              <span>Meta-Attributes</span>
            </button>
          </span>

          <!-- Number filtered columns -->
          <span class="my-auto veto-container-item">
            {{
              columnsFiltered.length
            }} / {{
              Object.keys(columnData.attributes).length + Object.keys(columnData.validMetaAttributes).length
            }} {{
              Object.keys(columnData.attributes).length + Object.keys(columnData.validMetaAttributes).length === 1 ? 'Column' : 'Columns'
            }}
          </span>
        </div> <!-- End column filter settings -->

        <!-- Row filter settings -->
        <div id="rowFilterSettings" class="veto-container-row border-top border-1 w-100">

          <!-- Search term -->
          <span class="veto-container-item veto-input">
          <input type="text" class="form-control" placeholder="Filter Rows" title="Filter Rows"
                 v-model="rowFilter.term">
          <span v-if="rowFilter.term" @click="rowFilter.term = ''" class="veto-input-clear" title="Clear">
            <font-awesome-icon icon="fa-xmark"></font-awesome-icon>
          </span>
        </span>

          <!-- Toggle conflicts -->
          <span class="veto-container-item veto-action-button">
          <button :class="{'veto-active': rowFilter.showConflicts, 'veto-inactive': !rowFilter.showConflicts}"
                  :title="rowFilter.showConflicts ? 'Hide Conflicts' : 'Show Conflicts'"
                  @click="rowFilter.showConflicts = !rowFilter.showConflicts;">
            <font-awesome-icon :icon="['fas', 'circle-exclamation']" size="xl"></font-awesome-icon>
          </button>
        </span>

          <!-- Toggle empty -->
          <span class="veto-container-item veto-action-button">
          <button :class="{'veto-active': rowFilter.showEmpty, 'veto-inactive': !rowFilter.showEmpty}"
                  :title="rowFilter.showEmpty ? 'Hide Empty' : 'Show Empty'"
                  @click="rowFilter.showEmpty = !rowFilter.showEmpty;">
            <font-awesome-icon :icon="['fab', 'creative-commons-zero']" size="xl"></font-awesome-icon>
          </button>
        </span>

          <!-- Toggle missing -->
          <span class="veto-container-item veto-action-button">
          <button :class="{'veto-active': rowFilter.showMissing, 'veto-inactive': !rowFilter.showMissing}"
                  :title="rowFilter.showMissing ? 'Hide Missing' : 'Show Missing'"
                  @click="rowFilter.showMissing = !rowFilter.showMissing;">
            <font-awesome-icon :icon="['fas', 'circle-question']" size="xl"></font-awesome-icon>
          </button>
        </span>

          <!-- Toggle valid -->
          <span class="veto-container-item veto-action-button">
          <button :class="{'veto-active': rowFilter.showValid, 'veto-inactive': !rowFilter.showValid}"
                  :title="rowFilter.showValid ? 'Hide Valid' : 'Show Valid'"
                  @click="rowFilter.showValid = !rowFilter.showValid;">
                  ok
          </button>
        </span>

          <!-- Toggle checked -->
          <span class="veto-container-item veto-action-button">
          <button :class="{'veto-active': rowFilter.showChecked, 'veto-inactive': !rowFilter.showChecked}"
                  :title="rowFilter.showChecked ? 'Hide Checked' : 'Show Checked'"
                  @click="rowFilter.showChecked = !rowFilter.showChecked;">
            <font-awesome-icon :icon="['fas', 'check']" size="2xl"></font-awesome-icon>
          </button>
        </span>

          <!-- Toggle unchecked -->
          <span class="veto-container-item veto-action-button">
          <button :class="{'veto-active': rowFilter.showUnchecked, 'veto-inactive': !rowFilter.showUnchecked}"
                  :title="rowFilter.showUnchecked ? 'Hide Unchecked' : 'Show Unchecked'"
                  @click="rowFilter.showUnchecked = !rowFilter.showUnchecked;">
            <font-awesome-icon :icon="['fas', 'xmark']" size="2xl"></font-awesome-icon>
          </button>
        </span>

          <!-- Number filtered rows -->
          <span class="my-auto veto-container-item">
            {{ rowsFiltered.length }} / {{ currentData.length }} {{ currentData.length === 1 ? 'Row' : 'Rows' }}
          </span>
        </div> <!-- End row filter settings -->
      </div> <!-- End filter settings -->

    </div>

    <!-- Table -->
    <div id="resizeableWrapper" class="overflow-auto" style="display: flex"
         :style="{'flex': columnData.containsMultiValueAttributes ? '0 0 auto' : '1 1 auto'}">
      <div id="tableWrapper" class="overflow-auto" :style="{'font-size': fontSize.fontSize}"
           :class="{'resizable': columnData.containsMultiValueAttributes,
                  'not-resizable': !columnData.containsMultiValueAttributes,
                 }">
        <table class="veto-table text-center mb-0 sticky-table-head">
          <thead>
          <tr class="align-text-top">

            <!-- Index -->
            <th class="col-index" scope="col">Index</th>

            <!-- Actions -->
            <th class="col-actions" scope="col">Actions</th>

            <!-- Attributes -->
            <template v-for="(value, columnName) in columnData.attributes">
              <th v-if="columnsFiltered.includes(columnName as string)" scope="col" class="attribute-column">

                <font-awesome-icon :icon="['fa', 'gear']"
                                   :style="{'color': value.color }"
                                   class="veto-attribute-icon veto-attribute-icon-button"
                                   title="Open attribute settings"
                                   @click="openAttributeSettingsModal(columnName)">
                </font-awesome-icon>

                <span v-if="columnName.length < 35" class="ms-1" style="overflow-wrap: break-word;">{{ columnName }}
                </span>
                <span v-else class="ms-1 veto-wrap-text">
                  <span :id="'column-name-short' + columnName" class="base" @mouseover="showLongText($event, 'column-name-full' + columnName)"
                        @mouseout="hideLongText($event, 'column-name-short' + columnName, 'column-name-full' + columnName)">
                    {{ wrapLongText(columnName, 35) }}
                  </span>
                  <span :id="'column-name-full' + columnName" class="hover" style="display: none;"
                        @mouseout="hideLongText($event,'column-name-short' + columnName, 'column-name-full' + columnName)">{{ columnName }}</span>
                </span>
              </th>
            </template>

            <!-- Meta-attributes -->
            <template v-for="(value, columnName) in columnData.validMetaAttributes">
              <th v-if="columnsFiltered.includes(columnName as string)" scope="col" class="attribute-column">
                <span class="veto-attribute-icon veto-attribute-icon-type">
                  {{ value.type.charAt(0) }}
                </span>
                <span v-if="columnName.length < 35" class="ms-1" style="overflow-wrap: break-word;">{{ columnName }}
                </span>
                <span v-else class="ms-1 veto-wrap-text">
                  <span :id="'column-name-short' + columnName" class="base" @mouseover="showLongText($event, 'column-name-full' + columnName)"
                        @mouseout="hideLongText($event, 'column-name-short' + columnName, 'column-name-full' + columnName)">
                    {{ wrapLongText(columnName, 35) }}
                  </span>
                  <span :id="'column-name-full' + columnName" class="hover" style="display: none;"
                        @mouseout="hideLongText($event,'column-name-short' + columnName, 'column-name-full' + columnName)">{{ columnName }}</span>
                </span>
              </th>
            </template>
          </tr>
          </thead>
          <tbody id="metadataTableBody">
          <template v-for="(rowData, rowIndex) in currentData">
            <tr v-if="rowsFiltered.includes(rowIndex)" @click="selectRow(rowIndex)"
                :class="{'veto-table-row-selected': rowIndex === currentRow}">

              <!-- Index -->
              <td class="col-rowIndex align-middle">
                <span>{{ rowIndex + 1 }}</span>
              </td>

              <!-- Actions -->
              <td class="col-actions p-0">
                <div class="d-flex">
                <span v-if="rowData.currentData.checked" class="veto-container-item veto-action-button">
                  <button class="veto-icon-2xl veto-active" title="Mark as checked" @click="checkRow(rowIndex, false)">
                    <font-awesome-icon :icon="['fas', 'check']" size="2xl"></font-awesome-icon>
                  </button>
                </span>
                  <span v-else class="veto-container-item veto-action-button">
                  <button class="veto-icon-2xl veto-inactive" title="Mark as checked" @click="checkRow(rowIndex, true)">
                    <font-awesome-icon :icon="['fas', 'xmark']" size="2xl"></font-awesome-icon>
                  </button>
                </span>
                  <span class="veto-container-item veto-action-button">
                  <button class="veto-icon-lg veto-neutral" title="Undo" @click="undo(rowIndex)"
                          :disabled="!vetoStore.hasChanges(rowIndex)">
                    <font-awesome-icon icon="fa-rotate-left" size="lg"></font-awesome-icon>
                  </button>
                </span>
                </div>
              </td>

              <!-- Attributes -->
              <template v-for="(columnName, columnIndex) in Object.keys(columnData.attributes)" :key="columnIndex">
                <td v-if="columnsFiltered.includes(columnName as string)" :id="rowIndex +'_' + columnName"
                    :ref="getCellRef(rowIndex, columnName)"
                    class="text-start p-0 attribute-column"
                    :class="{'veto-table-cell-selected': rowIndex === currentRow && columnName === currentField
                                         && !vetoStore.columnData.containsMultiValueAttributes,
                           'veto-table-cell-selected-2': rowIndex === currentRow && columnName === currentField
                                      && vetoStore.columnData.containsMultiValueAttributes,
                          }"
                    @dblclick="selectField(columnName)" @mousedown.prevent>
                  <div class="p-2 veto-table-body-cell">

                    <!-- Symbols for conflicts -->
                    <span
                      v-if="!columnData.containsMultiValueAttributes && vetoStore.notMatching(rowIndex, columnName, 0)"
                      class="me-1" title="Value does not match the start and end indices"
                      @click="openFixModal(rowIndex, columnName, 0)">
                      <font-awesome-icon icon="fa-circle-exclamation" :color="vetoColorScheme.error"></font-awesome-icon>
                    </span>
                    <span
                      v-else-if="columnData.containsMultiValueAttributes && vetoStore.notMatching(rowIndex, columnName, null)"
                      class="me-1" title="Some values have conflicts">
                      <font-awesome-icon icon="fa-circle-exclamation" :color="vetoColorScheme.error"></font-awesome-icon>
                    </span>

                    <!-- Symbol for RegEx validation -->
                    <span
                      v-if="!columnData.containsMultiValueAttributes && vetoStore.hasValidationRegExConflict(rowIndex, columnName, 0)"
                      class="me-1" title="Value does not match the specified regular expression">
                      <font-awesome-icon icon="fa-circle-exclamation" :color="vetoColorScheme.warning"></font-awesome-icon>
                    </span>
                    <span
                      v-else-if="columnData.containsMultiValueAttributes && vetoStore.hasValidationRegExConflict(rowIndex, columnName, null)"
                      class="me-1" title="Some values do not match the specified regular expression">
                      <font-awesome-icon icon="fa-circle-exclamation" :color="vetoColorScheme.warning"></font-awesome-icon>
                    </span>

                    <!-- Symbol for missing values -->
                    <span
                      v-if="!columnData.containsMultiValueAttributes && vetoStore.hasMissingValues(rowIndex, columnName, 0)"
                      class="me-1" title="Value is missing">
                      <font-awesome-icon icon="fa-circle-question" :color="vetoColorScheme.warning"></font-awesome-icon>
                    </span>
                    <span
                      v-else-if="columnData.containsMultiValueAttributes && vetoStore.hasMissingValues(rowIndex, columnName, null)"
                      class="me-1" title="Some values are missing">
                      <font-awesome-icon icon="fa-circle-question" :color="vetoColorScheme.warning"></font-awesome-icon>
                    </span>

                    <!-- Symbol for empty values -->
                    <span
                      v-if="!columnData.containsMultiValueAttributes && vetoStore.hasEmptyValues(rowIndex, columnName, 0)"
                      class="me-1" title="Value is empty or contains only spaces">
                      <font-awesome-icon :icon="['fab', 'creative-commons-zero']" :color="vetoColorScheme.warning"></font-awesome-icon>
                    </span>
                    <span
                      v-else-if="columnData.containsMultiValueAttributes && vetoStore.hasEmptyValues(rowIndex, columnName, null)"
                      class="me-1" title="Some values are empty or contain only spaces">
                      <font-awesome-icon :icon="['fab', 'creative-commons-zero']" :color="vetoColorScheme.warning"></font-awesome-icon>
                    </span>

                    <!-- Values -->
                    <template v-for="(valueData, valueIndex) in data[rowIndex].currentData.attributes[columnName]">
                      <template v-if="valueIndex < 3">
                        <span v-if="valueIndex >= 1">{{ vetoStore.columnData.formatSpecificAttribs.VALUE_DELIMITER.value + ' ' }}</span>
                        <span v-html="formatValue(valueData.value)"></span>
                      </template>
                      <template v-if="valueIndex === 3">
                        <span>{{ vetoStore.columnData.formatSpecificAttribs.VALUE_DELIMITER.value + ' ' }}</span>
                        <span><em>+{{ data[rowIndex].currentData.attributes[columnName].length - 3 }}</em></span>
                      </template>
                    </template>
                  </div>
                </td>
              </template>
              <!-- Meta attributes -->
              <template v-for="(metaData, columnName) in columnData.validMetaAttributes">
                <td v-if="columnsFiltered.includes(columnName as string)"
                    class="text-start align-middle p-2 attribute-column">
                  <template v-for="(valueData, valueIndex) in data[rowIndex].currentData.metaAttributes[columnName]">

                    <!-- One value -->
                    <template v-if="data[rowIndex].currentData.metaAttributes[columnName].length === 1">
                      <div style="display: flex; height: 100%;">

                        <!-- Symbol for missing values -->
                        <span v-if="valueData.value === null"
                              class="my-auto me-1" title="Value is missing">
                          <font-awesome-icon icon="fa-circle-question" :color="vetoColorScheme.warning"></font-awesome-icon>
                        </span>

                        <!-- Enum -->
                        <template v-if="metaData.type === MetaAttributeType.ENUM">

                          <!-- Symbol for invalid value -->
                          <span v-if="!validateMetaAttribute(valueData.value, metaData)"
                                class="my-auto me-1"
                                :title="`Value '${valueData.value}' does not match any of the specified values`">
                            <font-awesome-icon icon="fa-circle-exclamation" :color="vetoColorScheme.error"></font-awesome-icon>
                          </span>

                          <span class="veto-input w-100">
                            <select class="form-select"
                                    @change="vetoStore.updateMetaAttribute({ rowIndex, attributeName: columnName as string, valueIndex, value: ($event.target! as HTMLInputElement).value })"
                                    :value="valueData.value">
                              <template v-if="valueData.value !== null && !metaData.values.includes(valueData.value)">
                                <option disabled>{{ valueData.value }}</option>
                              </template>
                              <template v-for="option in metaData.values">
                                <option>{{ option }}</option>
                              </template>
                            </select>
                          </span>
                        </template>

                        <!-- Number -->
                        <template v-else-if="metaData.type === MetaAttributeType.NUMBER">
                          <!-- Symbol for invalid value -->
                          <span v-if="!validateMetaAttribute(valueData.value, metaData)"
                                class="my-auto me-1"
                                :title="`Value '${valueData.value}' is not a valid number`">
                            <font-awesome-icon icon="fa-circle-exclamation" :color="vetoColorScheme.error"></font-awesome-icon>
                          </span>

                          <input type="number" :value="valueData.value" :placeholder="valueData.value !== null ? valueData.value : ''"
                                 @change="vetoStore.updateMetaAttribute({ rowIndex, attributeName: columnName as string, valueIndex, value: ($event.target! as HTMLInputElement).value })"
                                 class="form-control">
                        </template>

                        <!-- Text -->
                        <template v-else-if="metaData.type === MetaAttributeType.TEXT">
                          <!-- Symbol for empty value -->
                          <span v-if="valueData.value !== null && valueData.value.trim() === ''"
                                class="my-auto me-1"
                                :title="`Value '${valueData.value}' is empty`">
                            <font-awesome-icon :icon="['fab', 'creative-commons-zero']"
                                               :color="vetoColorScheme.warning"></font-awesome-icon>
                          </span>

                          <textarea type="text" :value="valueData.value" rows="1"
                                    @change="vetoStore.updateMetaAttribute({ rowIndex, attributeName: columnName as string, valueIndex, value: ($event.target! as HTMLInputElement).value })"
                                    class="form-control"/>
                        </template>
                      </div>
                    </template>

                    <!-- TODO Multiple values -->
                    <template v-else>
                      <template v-if="valueIndex < 3">
                        <span v-if="valueIndex >= 1">{{ vetoStore.columnData.formatSpecificAttribs.VALUE_DELIMITER + ' ' }}</span>
                        <span v-html="formatValue(valueData.value)"></span>
                      </template>
                      <template v-if="valueIndex === 3">
                        <span>{{ vetoStore.columnData.formatSpecificAttribs.VALUE_DELIMITER + ' ' }}</span>
                        <span><em>+{{ data[rowIndex].currentData.attributes[columnName].length - 3 }}</em></span>
                      </template>
                    </template>
                  </template>
                </td>
              </template>
            </tr>
          </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Multiple values -->
    <div id="multiValueWrapper" class="border-top border-3 "
         style="display: flex; flex-flow: column; overflow-y: hidden; flex: 1 1 auto; overflow-wrap: break-word;">

      <!-- Multiple values header -->
      <div id="multiValueHeader" class="border-bottom border-2" style="flex: 0 0 auto;">
        <div class="veto-container-row">
          <div class="veto-container-item my-auto">
            <span v-if="currentField !== null">
              Values for Row '{{ currentRow }}' and column '
              <span class="veto-wrap-text">
                <span id="column-name-short" @mouseover="showLongText($event, 'column-name-full')"
                      @mouseout="hideLongText($event, 'column-name-short', 'column-name-full')">
                  {{ wrapLongText(currentField, 20) }}
                </span>
                <span id="column-name-full" class="hover" style="display: none;"
                      @mouseout="hideLongText($event,'column-name-short', 'column-name-full')">{{ currentField }}</span>
              </span>
              '
            </span>
            <span v-else>
              Please select a field to see all values
            </span>
          </div>
          <div class="ms-auto d-flex">
            <span class="veto-container-item veto-action-button">
              <button :disabled="currentField === null" class="veto-neutral" title="Add cell"
                      @click="addCell">
                <font-awesome-icon :icon="['fas', 'plus']" size="xl"></font-awesome-icon>
              </button>
            </span>
            <span class="veto-container-item veto-action-button">
              <button :disabled="currentValueIndex === null" class="veto-neutral" title="Delete current cell"
                      @click="deleteCurrentCell">
                <font-awesome-icon :icon="['fas', 'trash']" size="xl"></font-awesome-icon>
              </button>
            </span>
            <span class="veto-container-item veto-action-button">
              <button :disabled=!hasFieldSelected class="veto-neutral" title="Deselect current cell"
                      @click="deselectCurrentCell">
                <font-awesome-icon :icon="['fas', 'check']" size="2xl"></font-awesome-icon>
              </button>
            </span>
          </div>
        </div>
      </div>

      <!-- Multiple values list -->
      <div class="veto-multi-value-list">
        <template v-if="currentField !== null"
                  v-for="(valueData, valueIndex) in data[currentRow].currentData.attributes[currentField]">
          <div class="valueBox"
               style="min-width: calc(100% / 3.2); padding-left: 0.5rem; overflow-y: auto; text-wrap: wrap; flex: 1"
               :class="{ 'veto-table-cell-selected': valueIndex === vetoStore.currentValueIndex,
                         'rounded-inner-bottom': currentNumberOfValues <= 3,
                       }"
               @dblclick="selectValue(valueIndex)" @mousedown.prevent>

            <!-- Symbol for conflicts -->
            <span v-if="vetoStore.notMatching(currentRow, currentField, valueIndex)" class="me-1 align-middle"
                  title="Value does not match the start and end indices"
                  @click="openFixModal(currentRow, currentField, valueIndex)">
              <font-awesome-icon icon="fa-circle-exclamation" :color="vetoColorScheme.error"></font-awesome-icon>
            </span>

            <!-- Symbol for RegEx validation -->
            <span v-if="vetoStore.hasValidationRegExConflict(currentRow, currentField, valueIndex)"
              class="me-1" title="Value does not match the specified regular expression">
              <font-awesome-icon icon="fa-circle-exclamation" :color="vetoColorScheme.warning"></font-awesome-icon>
            </span>

            <!-- Symbol for missing values -->
            <span v-if="vetoStore.hasMissingValues(currentRow, currentField, valueIndex)"
                  class="me-1" title="Value is missing">
                <font-awesome-icon icon="fa-circle-question" :color="vetoColorScheme.warning"></font-awesome-icon>
            </span>

            <!-- Symbol for empty values -->
            <span v-if="vetoStore.hasEmptyValues(currentRow, currentField, valueIndex)"
                  class="me-1" title="Value is empty or contains only spaces">
                <font-awesome-icon :icon="['fab', 'creative-commons-zero']" :color="vetoColorScheme.warning"></font-awesome-icon>
            </span>

            <span v-html="formatValue(valueData.value)"></span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import Popup from "@/components/Popup.vue";
import Data from "@/types/Data";
import {useVetoStore} from "@/store";
import {mapStores} from "pinia";
import MetaData, { AttributeType, MetaAttributeType } from "@/types/MetaData";
import { FixData } from "@/types/FixData";
import { Occurrence } from "@/types/Occurrence";
import { IValueOrder, ValueOrder } from "@/types/ValueOrder";
import { validateMetaAttribute } from "@/helper/meta-attributes";
import { hasConflict, hasEmptyValues, hasMissingValues } from "@/helper/value-validation";
import { VetoColorScheme, VetoColorSchemeType } from "@/types/VetoColorScheme";
import { FontSize } from "@/types/FontSize";


export default defineComponent({
  name: 'VetoTable',
  components: {Popup, FontAwesomeIcon},
  emits: ['scrollToPosition'],
  data() {
    return {
      AttributeType,
      attributeSettingsData: {
        attributeName: '',
        cache: {
          color: '',
          validationRegEx: null as string | null,
        },
      },
      columnFilter: {
        showAttributes: false,
        showMetaAttributes: false,
        term: '',
      },
      columnsFiltered: [] as Array<string>,
      fixMatch: {
        attributeName: '',
        color: '',
        currentEnd: null,
        currentStart: null,
        currentValue: null,
        rowIndex: -1,
        occurrences: [],
        valueIndex: -1,
        valueOfIndices: '',
        valueOfIndicesPre: '',
        valueOfIndicesPost: '',
      } as FixData,
      fixResult: {
        numberFixed: 0,
        numberNotFixed: 0,
      },
      fontSize: FontSize.MEDIUM,
      FontSize,
      occurrenceIndex: -1,
      rowFilter: {
        visible: false,
        term: '',
        showChecked: false,
        showConflicts: false,
        showEmpty: false,
        showMissing: false,
        showUnchecked: false,
        showValid: false,
      },
      rowsFiltered: [] as Array<number>,
      ValueOrder,
    }
  },
  mounted() {
    this.filterColumns();
    this.calculateTableHeight();

    window.addEventListener('resize', () => {
      this.calculateTableHeight();
    });
  },
  methods: {
    validateMetaAttribute,
    calculateTableHeight() {
      const resizableWrap = document.getElementById('resizeableWrapper')!;

      if (this.vetoStore.columnData.containsMultiValueAttributes) {
        document.getElementById('multiValueWrapper')!.style.display = "flex";

        const multiValueHeaderHeight = document.getElementById('multiValueHeader')!.offsetHeight;
        const baseHeight = document.getElementById('vetoTable')!.offsetHeight;
        const tableHeaderHeight = document.getElementById('vetoTableHeader')!.offsetHeight;
        const borderHeight = 6;

        resizableWrap.style.maxHeight = (baseHeight - (tableHeaderHeight + multiValueHeaderHeight + borderHeight)) + "px";

      } else {
        document.getElementById('multiValueWrapper')!.style.display = "none";

        resizableWrap.style.maxHeight = "";
        document.getElementById('tableWrapper')!.style.height = "";
      }
    },
    onImport() {
      this.resetFilter();
      this.filterColumns();

      this.calculateTableHeight();
    },
    toggleFilter() {
      this.rowFilter.visible = !this.rowFilter.visible;
      document.getElementById('filterSettings')!.style.display = this.rowFilter.visible ? '' : 'none';
      this.calculateTableHeight();
    },
    filterColumn(columnName: string, attributeType: AttributeType) {
      if (this.columnFilter.term !== '' && !columnName.toLowerCase().includes(this.columnFilter.term.toLowerCase())) {
        return false;
      }

      if ((this.columnFilter.showAttributes && this.columnFilter.showMetaAttributes)
          || (!this.columnFilter.showAttributes && !this.columnFilter.showMetaAttributes)) {
        return true;
      }

      if (this.columnFilter.showAttributes && attributeType === AttributeType.ATTRIBUTE) {
        return true;
      }

      if (this.columnFilter.showMetaAttributes && attributeType === AttributeType.META_ATTRIBUTE) {
        return true;
      }

      return false;
    },
    filterColumns() {
      this.columnsFiltered = [];

      for (const attributeName of Object.keys(this.vetoStore.columnData.attributes)) {
        if (this.filterColumn(attributeName, AttributeType.ATTRIBUTE)) {
          this.columnsFiltered.push(attributeName);
        }
      }

      for (const attributeName of Object.keys(this.vetoStore.columnData.validMetaAttributes)) {
        if (this.filterColumn(attributeName, AttributeType.META_ATTRIBUTE)) {
          this.columnsFiltered.push(attributeName);
        }
      }

      if (this.currentField !== null && !this.columnsFiltered.includes(this.currentField)) {
        this.deselectCurrentCell();
      }

      this.filterRows();
    },
    filterRow(rowNumber: number, rowData: Data): boolean {

      if (!this.containsTerm(rowData)) {
        return false;
      }

      // If no filter is active or all filters are active, only the search term must be contained
      if ((!this.rowFilter.showChecked && !this.rowFilter.showConflicts && !this.rowFilter.showEmpty
           && !this.rowFilter.showMissing && !this.rowFilter.showUnchecked && !this.rowFilter.showValid)
          || (this.rowFilter.showConflicts && this.rowFilter.showEmpty && this.rowFilter.showMissing && this.rowFilter.showValid)
          || (this.rowFilter.showChecked && this.rowFilter.showUnchecked)) {
        return true;
      }

      // If checked and unchecked rows are active, all rows match
      const isRowChecked = rowData.currentData.checked
      if (isRowChecked && this.rowFilter.showChecked || !isRowChecked && this.rowFilter.showUnchecked) {
        return true;
      }

      // Look for conflicts, empty or missing values
      let hasRowConflicts = false;
      let hasRowEmptyValues = false;
      let hasRowMissingValues = false;

      for (const attributeName in this.columnData.attributes) {
        if (!this.columnsFiltered.includes(attributeName)) {
          continue;
        }

        for (let valueIndex = 0; valueIndex < this.data[rowNumber].currentData.attributes[attributeName].length; ++valueIndex) {
          if (hasConflict(this.vetoStore.$state, rowNumber, attributeName, valueIndex)) {
            hasRowConflicts = true;
          }
          if (hasEmptyValues(this.vetoStore.$state, rowNumber, attributeName, valueIndex)) {
            hasRowEmptyValues = true;
          }
          if (hasMissingValues(this.vetoStore.$state, rowNumber, attributeName, valueIndex)) {
            hasRowMissingValues = true;
          }
        }
      }

      for (const [attributeName, data] of Object.entries(this.columnData.validMetaAttributes)) {
        if (!this.columnsFiltered.includes(attributeName)) {
          continue;
        }

        const values = this.data[rowNumber].currentData.metaAttributes[attributeName]
        for (const value of values) {
          if (!validateMetaAttribute(value.value, data)) {
            hasRowConflicts = true;
          }
          if (value.value === null) {
            hasRowMissingValues = true;
          } else if (value.value.trim() === '') {
            hasRowEmptyValues = true;
          }
        }
      }

      if (this.rowFilter.showConflicts && hasRowConflicts) {
        return true;
      }
      if (this.rowFilter.showEmpty && hasRowEmptyValues) {
        return true;
      }
      if (this.rowFilter.showMissing && hasRowMissingValues) {
        return true;
      }

      if (this.rowFilter.showValid && (!hasRowConflicts && !hasRowEmptyValues && !hasRowMissingValues)) {
        return true;
      }

      // No filter matched
      return false;
    },
    filterRows() {
      this.rowsFiltered = [];

      this.currentData.forEach((rowData, rowNumber) => {
        if (this.filterRow(rowNumber, rowData)) {
          this.rowsFiltered.push(rowNumber);
        }
      });

      if (!this.rowsFiltered.includes(this.currentRow)) {
        this.deselectCurrentCell();
      }
    },
    containsTerm(data: Data): boolean {
      if (this.rowFilter.term === '') {
        return true;
      }

      const termLower = this.rowFilter.term.toLowerCase();

      // Search in attributes
      for (const [name, attribute] of Object.entries(data.currentData.attributes)) {
        if (!this.columnsFiltered.includes(name)) {
          continue;
        }

        for (const valueData of attribute) {
          const value = valueData.value;
          if (value !== null) {
            const formattedValue = value.toLowerCase().replace(/(\r\n|\r|\n|\x0B|\x0C|\u0085|\u2028|\u2029)/g, " ");
            if (formattedValue.includes(termLower)) {
              return true;
            }
          }
        }
      }

      // Search in meta-attributes
      for (const [name, attribute] of Object.entries(data.currentData.metaAttributes)) {
        if (!this.columnsFiltered.includes(name)) {
          continue;
        }

        for (const valueData of attribute) {
          const value = valueData.value;
          if (value !== null) {
            const formattedValue = value.toLowerCase().replace(/(\r\n|\r|\n|\x0B|\x0C|\u0085|\u2028|\u2029)/g, " ");
            if (formattedValue.includes(termLower)) {
              return true;
            }
          }
        }
      }

      return false;
    },
    numberFilter(): number {
      let numberFilter = 0;

      // Row filter
      if (this.rowFilter.term) {
        numberFilter += 1;
      }
      if (this.rowFilter.showChecked) {
        numberFilter += 1;
      }
      if (this.rowFilter.showConflicts) {
        numberFilter += 1;
      }
      if (this.rowFilter.showEmpty) {
        numberFilter += 1;
      }
      if (this.rowFilter.showMissing) {
        numberFilter += 1;
      }
      if (this.rowFilter.showUnchecked) {
        numberFilter += 1;
      }
      if (this.rowFilter.showValid) {
        numberFilter += 1;
      }

      // Column filter
      if (this.columnFilter.term) {
        numberFilter += 1;
      }
      if (this.columnFilter.showAttributes) {
        numberFilter += 1;
      }
      if (this.columnFilter.showMetaAttributes) {
        numberFilter += 1;
      }

      return numberFilter;
    },
    resetFilter() {
      this.columnFilter.term = '';
      this.columnFilter.showAttributes = false;
      this.columnFilter.showMetaAttributes = false;

      this.rowFilter.term = '';
      this.rowFilter.showChecked = false;
      this.rowFilter.showConflicts = false;
      this.rowFilter.showEmpty = false;
      this.rowFilter.showMissing = false;
      this.rowFilter.showUnchecked = false;
      this.rowFilter.showValid = false;
    },
    enableSetIndicesButton() {
      (this.$refs['setIndicesButton'] as HTMLButtonElement).disabled = false;
    },
    checkRow(index: number, value: boolean) {
      this.vetoStore.updateCheckAll({index, value: value});
    },
    formatValue(value: string | null): string {
      if (value === null) {
        return '';
      }

      return value.replace(/(\r\n|\r|\n|\x0B|\x0C|\u0085|\u2028|\u2029)/g, '<br>');
    },
    selectRow(index: number) {
      this.vetoStore.updateCurrentRow(index);
    },
    selectField(attributeName: string) {
      this.vetoStore.updateCurrentField(attributeName);
    },
    selectValue(valueIndex: number) {
      this.vetoStore.updateCurrentValueIndex(valueIndex);
    },
    undo(index: number) {
      this.vetoStore.undo(index);
    },
    colorChange(event: InputEvent, attributeName: string) {
      if (!event.target) {
        return;
      }
      const target = event.target as HTMLInputElement
      this.vetoStore.updateColor({attributeName: attributeName, value: target.value});
    },
    openAttributeSettingsModal(attributeName: string) {
      this.attributeSettingsData.attributeName = attributeName;

      // Update cached settings
      this.attributeSettingsData.cache.color = this.columnData.attributes[attributeName].color;
      this.attributeSettingsData.cache.validationRegEx = this.columnData.attributes[attributeName].validationRegEx;

      // Update RegEx highlighting
      const testInput = document.getElementById('attributeSettingsRegExTest') as HTMLInputElement;
      this.highlightRegexTest(this.attributeSettingsData.cache.validationRegEx ?? "", testInput);

      (this.$refs['attributeSettings'] as typeof Popup).open();
    },
    onConfirmAttributeSettings() {
      const attributeName = this.attributeSettingsData.attributeName;

      if (this.attributeSettingsData.cache.color !== this.columnData.attributes[attributeName].color) {
        this.vetoStore.updateColor({attributeName: attributeName, value: this.attributeSettingsData.cache.color});
      }

      this.columnData.attributes[attributeName].validationRegEx = this.attributeSettingsData.cache.validationRegEx;
    },
    openFixModal(rowIndex: number, attributeName: string, valueIndex: number) {
      this.fixMatch = this.createFixData(rowIndex, attributeName, valueIndex);

      (this.$refs['setIndicesButton'] as HTMLButtonElement).disabled = true;
      const radio = document.querySelector('input[name="fix"]:checked');
      if (radio) {
        (radio as HTMLInputElement).checked = false;
      }

      (this.$refs['fixValue'] as typeof Popup).open();
    },
    createFixData(rowIndex: number, attributeName: string, valueIndex: number): FixData {
      const fixData = {} as FixData;

      const rowData = this.vetoStore.data[rowIndex];
      const attributeData = rowData.currentData.attributes[attributeName][valueIndex];
      const text = rowData.text;

      const occurrences = [];

      if (attributeData.value !== null) {
        const textLower = text.toLowerCase();
        const valueLower = attributeData.value.toLowerCase();

        let currentStart = -1;
        let valueIndex = 0;
        let textIndex = 0;
        let isPreviousCharacterNumberOrLetter = false;

        // Iterate through the text
        while(textIndex < textLower.length) {
          const textCharacter = textLower.at(textIndex);
          const valueCharacter = valueLower.at(valueIndex);

          if (this.vetoStore.appSettings.matchEntireWord && valueIndex === 0 && isPreviousCharacterNumberOrLetter) {
            // If the entire word must match and the previous character is not part of the value but a letter or number,
            // continue looking
            textIndex += 1;
          } else if (textCharacter === valueCharacter || (this.vetoStore.appSettings.ignoreDifferenceWhitespace && isWhitespace(textCharacter) && isWhitespace(valueCharacter))) {
            // The current character matches the character at the current position of the value

            if (valueIndex === 0) {
              // Found the start of the value, so set start index
              currentStart = textIndex;
            }

            if (valueIndex === valueLower.length - 1) {
              // Found the entire word
              if (!this.vetoStore.appSettings.matchEntireWord || !isNumberOrLetter(textLower.at(textIndex + 1))) {
                // Check whether the word in the text is finished if the entire word must match
                // Word in text is longer than the value we are looking for
                const pre = text.substring(Math.max(0, currentStart - 20), currentStart);
                const value = text.substring(currentStart, textIndex + 1);
                const post = text.substring(textIndex + 1, Math.min(text.length, textIndex + 1 + 20));

                occurrences.push({start: currentStart, end: textIndex, pre, value, post});
              }

              textIndex = currentStart + 1;
              currentStart = -1;
              valueIndex = 0;
            } else {
              // Look for the rest of the word
              textIndex += 1;
              valueIndex += 1;
            }

          } else if (this.vetoStore.appSettings.ignoreSpaces && textLower.at(textIndex) === " "
                     || this.vetoStore.appSettings.ignoreTabs && textLower.at(textIndex) === "\t"
                     || this.vetoStore.appSettings.ignoreLineBreaks && isLineBreak(textLower.at(textIndex))) {
            // If the character is a space or a line break and the respective character should be ignored, keep looking
            textIndex += 1;
          } else {
            // Characters do not match
            textIndex += 1;
            currentStart = -1;
            valueIndex = 0;
          }
          isPreviousCharacterNumberOrLetter = isNumberOrLetter(textLower.at(textIndex - 1));
        }
      }

      fixData.attributeName = attributeName;
      fixData.color = this.vetoStore.columnData.attributes[attributeName].color;
      fixData.currentEnd = attributeData.end;
      fixData.currentStart = attributeData.start;
      fixData.currentValue = attributeData.value;
      fixData.rowIndex = rowIndex;
      fixData.occurrences = occurrences;
      fixData.valueIndex = valueIndex;

      if (attributeData.start !== null && attributeData.end !== null && attributeData.start >= 0 && attributeData.end < text.length && attributeData.start < attributeData.end) {

        fixData.valueOfIndices = text.substring(attributeData.start, attributeData.end + 1);
        fixData.valueOfIndicesPre = text.substring(Math.max(0, attributeData.start - 20), attributeData.start);
        fixData.valueOfIndicesPost = text.substring(attributeData.end + 1, Math.min(text.length, attributeData.end + 1 + 20));
      } else {
        fixData.valueOfIndices = null;
        fixData.valueOfIndicesPre = '';
        fixData.valueOfIndicesPost = '';
      }

      return fixData;
    },
    setValue(fixData: FixData) {
      this.vetoStore.updateValue(fixData);
    },
    setIndices() {
      if (this.occurrenceIndex === -1) {
        console.error("Indices could not be set, because no option is checked!");
        return;
      }
      const occurrence = this.fixMatch.occurrences[this.occurrenceIndex];
      this.setIndices2(this.fixMatch, occurrence);
      this.occurrenceIndex = -1;
    },
    setIndices2(fixData: FixData, occurrence: Occurrence) {
      this.vetoStore.updateIndices({occurrence: occurrence, fixMatch: fixData});
    },
    autoFixAll() {
      this.fixResult.numberFixed = 0;
      this.fixResult.numberNotFixed = 0;

      for (let rowIndex = 0; rowIndex < this.vetoStore.data.length; ++rowIndex) {
        for (const [attributeName, attributeData] of Object.entries(this.vetoStore.data[rowIndex].currentData.attributes)) {
          attributeData.forEach((_, valueIndex) => {
            if (this.vetoStore.notMatching(rowIndex, attributeName, valueIndex)) {
              const fixData = this.createFixData(rowIndex, attributeName, valueIndex);
              if (fixData.valueOfIndices !== null && fixData.occurrences.length === 0) {
                this.setValue(fixData);
                this.fixResult.numberFixed += 1;
              } else if (fixData.valueOfIndices === null && fixData.occurrences.length === 1) {
                const occurrence = fixData.occurrences[0];
                this.setIndices2(fixData, occurrence);
                this.fixResult.numberFixed += 1;
              } else {
                this.fixResult.numberNotFixed += 1;
              }
            }
          });
        }
      }
      (this.$refs['autoFixResult'] as typeof Popup).open();
    },
    addCell() {
      this.vetoStore.addCell();
    },
    scrollToCell(rowNumber: number, fieldName: string | null) {
      if(fieldName === null)
        return;

      const refName: string = this.getCellRef(rowNumber, fieldName);
      const tableCellElement: HTMLTableCellElement = (this.$refs[refName] as Array<any>)[0] as HTMLTableCellElement;
      tableCellElement.scrollIntoView({ behavior: 'smooth', block: "center", inline: "center" });
    },
    getCellRef(rowIndex: number, columnName: string) {
      return `${rowIndex}_${columnName}_Ref`;
    },
    deselectCurrentCell() {
      this.vetoStore.deselectCurrentCell();
    },
    deleteCurrentCell() {
      this.vetoStore.deleteCurrentCell();
      this.vetoStore.deselectCurrentCell();
    },
    switchMultiValueView() {
      this.vetoStore.switchMultiValueView();
      this.calculateTableHeight();
    },
    wrapLongText(text: string, threshold: number): string {
      if (text.length < threshold) {
        return text;
      }
      return text.substring(0, threshold) + '...';
    },
    showLongText(event: MouseEvent, relatedId: string) {
      const relatedElement = document.getElementById(relatedId)!;
      if (event.relatedTarget === relatedElement) {
        return;
      }
      relatedElement.style.display = '';
    },
    hideLongText(event: MouseEvent, baseId: string, relatedId: string) {
      const target = (event.target as HTMLElement);
      const related = (event.relatedTarget as HTMLElement);

      if (target.id === relatedId && related.id !== baseId) {
        target.style.display = 'none';
      } else if (target.id === baseId && related.id !== relatedId) {
        document.getElementById(relatedId)!.style.display = 'none';
      }
    },

    /**
     * Updates the highlighting of the RegEx test input.
     */
    updateHighlightRegexTest() {
      const regexInput = document.getElementById("attributeSettingsRegEx") as HTMLInputElement;
      const testInput = document.getElementById("attributeSettingsRegExTest") as HTMLInputElement;
      if (regexInput && testInput) {
        this.highlightRegexTest(regexInput, testInput);
      }
    },

    /**
     * Adds highlighting to the given RegEx test input.
     * @param {HTMLInputElement | regexInput} regexInput Input element or value of the regex.
     * @param {HTMLInputElement} testInput Input element of the RegEx test value.
     */
    highlightRegexTest(regexInput: HTMLInputElement | string, testInput: HTMLInputElement) {
      const testValue = testInput.value;
      let regexString = regexInput instanceof HTMLInputElement ? regexInput.value : regexInput;

      if (regexString === "") {
        regexString = ".*";
      }

      let matches;
      try {
        const regex = new RegExp(regexString);
        matches = testValue.match(regex);
      } catch (e) {
        matches = null;
      }

      const highlightDiv = testInput.previousElementSibling!;
      const highlightAllDiv = highlightDiv.previousElementSibling!;

      const declineAllSpan = highlightAllDiv.querySelector('.randimi-regex-highlight-decline') as HTMLSpanElement;
      const acceptAllSpan = highlightAllDiv.querySelector('.randimi-regex-highlight-accept') as HTMLSpanElement;
      declineAllSpan.style.width = '';
      acceptAllSpan.style.width = '';

      if (matches === null) {
        if (testValue === "") {
          declineAllSpan.style.width = '100%';
        }

        highlightDiv.querySelector('.randimi-decline-1')!.innerHTML = testValue;
        highlightDiv.querySelector('.randimi-accept')!.innerHTML = "";
        highlightDiv.querySelector('.randimi-decline-2')!.innerHTML = "";
      } else {
        if (testValue === "") {
          acceptAllSpan.style.width = '100%';
        }

        const decline = testValue.split(matches[0]);
        if (decline.length === 0) {
          decline.push("");
          decline.push("");
        } else if (decline.length === 1) {
          decline.push("");
        } else if (decline.length > 2) {
          for (let i = 2; i < decline.length; ++i) {
            decline[1] += matches[0] + decline[i];
          }
        }

        highlightDiv.querySelector('.randimi-decline-1')!.innerHTML = decline[0];
        highlightDiv.querySelector('.randimi-accept')!.innerHTML = matches[0];
        highlightDiv.querySelector('.randimi-decline-2')!.innerHTML = decline[1];
      }
    },


  },
  computed: {
    MetaAttributeType() {
      return MetaAttributeType
    },
    ...mapStores(useVetoStore),
    currentData: function (): Array<Data> {
      return this.vetoStore.data;
    },
    data: function (): Array<Data> {
      return this.vetoStore.data;
    },
    columnData: function (): MetaData {
      return this.vetoStore.columnData;
    },
    currentRow: function (): number {
      return this.vetoStore.currentRow;
    },
    currentField: function (): string | null {
      return this.vetoStore.currentField;
    },
    currentValueIndex: function (): number | null {
      return this.vetoStore.currentValueIndex;
    },
    currentNumberOfValues: function (): number {
      if (this.currentField === null) {
        return 0;
      }
      return this.data[this.currentRow].currentData.attributes[this.currentField].length;
    },
    currentValueOrder: function (): IValueOrder | null {
      return this.vetoStore.currentValueOrder;
    },
    hasFieldSelected: function (): boolean {
      return this.vetoStore.currentValueIndex !== null;
    },
    hasMultipleValues: function (): boolean {
      return this.vetoStore.hasMultipleValues();
    },
    vetoColorScheme(): VetoColorSchemeType {
      return VetoColorScheme.getVetoColorScheme(this.vetoStore.appSettings.vetoColorScheme).scheme;
    },
  },
  watch: {
    currentRow(newRow: number) {
      this.scrollToCell(newRow, this.currentField);
    },
    currentField(newField: string | null) {
      this.scrollToCell(this.currentRow, newField);
    },
    currentValueOrder: function (newValue: IValueOrder) {
      this.vetoStore.sortValues(newValue);
    },
    columnFilter: {
      handler() {
        this.filterColumns();
      },
      deep: true,
    },
    rowFilter: {
      handler() {
        this.filterRows();
      },
      deep: true,
    },
  },
});

function isLineBreak(character: string | undefined): boolean {
  return character === '\r' || character === '\n' || character === '\r\n';
}

function isWhitespace(character: string | undefined): boolean {
  return character === ' ' || isLineBreak(character) || character === '\t';
}

function isNumberOrLetter(character: string | undefined): boolean {
  if (character === undefined) {
    return false;
  }

  // Check for number
  const utf16CharCode = character.toLowerCase().charCodeAt(0);
  if (48 <= utf16CharCode && utf16CharCode <= 57) {
    return true;
  }
  // Check for lower case letter
  if (97 <= utf16CharCode && utf16CharCode <= 122) {
    return true;
  }
  return false;
}
</script>

<style scoped>

#vetoTable {
  box-shadow: rgba(99, 99, 99, 0.2) 0 2px 8px 0;
}

.sticky-table-head {
  border-collapse: separate;
  border-spacing: 0;
}

.sticky-table-head thead {
  background-color: var(--veto-color-background);
  position: sticky;
  top: 0;
  z-index: 2;
}

.sticky-table-head > thead > tr > * {
  border-bottom: 2px solid var(--veto-color-border);
}

.sticky-table-head > tbody > :first-child > * {
  border-top: 0;
}

.col-index {
  width: 58px;
}

.col-actions {
  width: 105px;
}

.resizable {
  min-width: 100%;
  resize: vertical;
  max-height: 100%;
  flex: 0 1 auto;
}

.not-resizable {
  flex: 1 1 auto;
}

.valueBox:hover {
  background-color: var(--veto-color-hover);
}

.attribute-column {
  min-width: 12.5em;
  max-width: 12.5em;
}

.rounded-inner-bottom:first-child {
  border-radius: 0 0 0 4px;
}

.rounded-inner-bottom:last-child {
  border-radius: 0 0 4px 0;
}

.rounded-inner-bottom:only-child {
  border-radius: 0 0 4px 4px;
}

.veto-border {
  border: 3px solid var(--veto-color-border);
  border-radius: 6px;
}

.veto-icon-2xl {
  font-size: 16px !important;
}
.veto-icon-lg {
  font-size: 20px !important;
}

.veto-attribute-icon {
  display: inline-block;
  height: 1.2rem;
  width: 1.2rem;
  position: relative;
  vertical-align: middle;
}

.veto-attribute-icon-button:hover {
  cursor: pointer;
}

.veto-attribute-icon-type {
  border: 1px solid var(--veto-color-font) !important;
  border-radius: 50%;
  -moz-border-radius: 50%;
  -webkit-border-radius: 50%;
  font-size: 12px;
}

.veto-attribute-icon-type:hover {
  cursor: default;
}

.veto-multiline-input > .input-group:not(:last-child) * {
  border-bottom: 0;
  border-bottom-left-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}

.veto-multiline-input > .input-group:not(:first-child) * {
  border-top-left-radius: 0 !important;
  border-top-right-radius: 0 !important;
}

.veto-table {
  border-color: var(--veto-color-border);
  vertical-align: middle;
  width: 100%;
}

.veto-table > thead > tr > th {
  vertical-align: middle;
}

.veto-table > thead > tr > th > span {
  vertical-align: text-top;
}

.veto-table > tbody > tr:hover {
  background-color: var(--veto-color-hover);
}

.veto-table > * > * > * {
  border-width: 1px;
  padding: 0.5rem;
}

.veto-table > tbody > tr > td > * > * {
  font-size: 1em !important;
}
.veto-table > tbody > tr > td > * > * > select {
  font-size: 1em !important;
}

.veto-table > * > * :first-child:not(input, select, textarea) {
  border-left-width: 0;
}

.veto-table > * > * :last-child:not(input, select, textarea) {
  border-right-width: 0;
}

.veto-table > tbody :last-child > td {
  border-bottom: 2px solid var(--veto-color-border);
}

.veto-table-row-selected > td {
  background-color: var(--veto-color-highlight);
}

.veto-table-cell-selected {
  border: 3px solid var(--veto-color-active-highlight) !important;
}

.veto-table-cell-selected-2 {
  border: 3px solid var(--veto-color-inactive-highlight) !important;
}

.veto-multi-value-list {
  display: flex;
  flex: 1 1 auto;
  overflow-x: auto;
  width: 100%;
}

.veto-multi-value-list > :not(:last-child) {
  border-right: 2px solid var(--veto-color-border);
}

.veto-column-name {
  overflow: hidden;
  word-break: break-all;
  display:block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.veto-column-name:hover {
  overflow: visible;
  white-space: normal;
  height: auto;
}

.veto-table-body-cell {
  max-height: 100px;
  overflow-x: hidden;
  overflow-y: auto;
  overflow-wrap: break-word;
}

.veto-wrap-text {
  position: relative;
}

.veto-wrap-text > .base {
  overflow-wrap: break-word;
}

.veto-wrap-text > .hover {
  background: var(--veto-color-background);
  border: 3px solid var(--veto-color-border);
  border-radius: 6px;
  box-shadow: 0 2px 4px 0 rgba(0,0,0,.28);
  display: block;
  left: 0;
  margin: -.3rem;
  max-width: 20rem;
  overflow: visible;
  padding: 0 .5rem;
  position: absolute;
  text-overflow: inherit;
  top: auto;
  white-space: normal;
  width: auto;
  word-wrap: break-word;
  z-index: 2;
}

/* Test input for regex fields from RandIMI */
.randimi-overlapping {
  background-color: transparent;
  left: 0;
  position: absolute;
  top: 0;
}

.randimi-regex-highlight-accept {
  background-color: var(--veto-color-success);
}

.randimi-regex-highlight-decline {
  background-color: var(--veto-color-error);
}

.randimi-regex-highlight {
  color: transparent;
  display: inline-block;
  overflow: hidden;
  white-space: pre-wrap;
}

.randimi-regex-control {
  background-color: var(--randimi-color-background-input);
}

.randimi-regex-text {
  color: var(--veto-color-font) !important;
  background: transparent !important;
}

.randimi-regex-highlight-all {
  height: 100%;
  width: 0;
}

</style>
