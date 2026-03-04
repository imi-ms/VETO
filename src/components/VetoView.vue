<template>
  <!-- Popup for notification that the last value has been edited -->
  <Popup ref="notProceedingPopup" id="notProceedingPopup" header="Edited the last value" width="30%" :hide-close-button="true">
    <template #popup-body>
      Cannot proceed to the next value because you edited the last value.
    </template>
  </Popup>

  <!-- View -->
  <div id="vetoView" class="h-100 d-flex flex-column border border-3 rounded" style="height: 100%">

    <!-- Header -->
    <div class="border-bottom border-2 rounded-top">
      <div v-if="hasTouchScreen()" class="mt-1 w-100 d-inline-block text-center veto-action-button">
        <button title="Highlight the selected text" @touchstart="textSelected" :disabled=!hasFieldSelected
                class="veto-size-2 veto-neutral">Set Value
        </button>
      </div>

      <!-- Top row for settings -->
      <div class="veto-container-row">
        <!-- Line wrapping -->
        <span class="veto-container-item veto-action-button">
          <button :class="{'veto-active': wrap, 'veto-inactive': !wrap}"
                  @click="wrap = !wrap" title="Wrap long lines">
            <font-awesome-icon icon="fa-share" rotation="180" size="xl" class="align-bottom"></font-awesome-icon>
          </button>
        </span>

        <!-- Text alignment -->
        <div class="veto-container-item veto-input">
          <label for="textAlignment" class="form-label me-1">
            <font-awesome-icon icon="fa-align-center" class="align-bottom"
                               v-if="textAlignment == 'center'"></font-awesome-icon>
            <font-awesome-icon icon="fa-align-justify" class="align-bottom"
                               v-if="textAlignment == 'justify'"></font-awesome-icon>
            <font-awesome-icon icon="fa-align-left" class="align-bottom"
                               v-if="textAlignment == 'left'"></font-awesome-icon>
            <font-awesome-icon icon="fa-align-right" class="align-bottom"
                               v-if="textAlignment == 'right'"></font-awesome-icon>
          </label>
          <span class="veto-size-25">
            <Multiselect id="textAlignment"
                         v-model="textAlignment"
                         :options="Object.keys(textAlignments)"
                         :custom-label="(id: string) => textAlignments[id]"
                         :searchable="false"
                         :allow-empty="false"
                         :multiple="false"
                         :show-labels="false"/>
          </span>
        </div>

        <!-- Line height -->
        <span class="veto-container-item veto-input" title="Line gap">
          <label for="lineGap" class="form-label me-1">
            <font-awesome-icon icon="fa-arrows-left-right-to-line" rotation="90"
                               class="align-bottom"></font-awesome-icon>
          </label>
          <span class="veto-size-2">
            <Multiselect id="lineGap"
                         v-model="lineGap"
                         :options="Object.keys(lineGaps)"
                         :custom-label="(id: string) => lineGaps[id]"
                         :searchable="false"
                         :allow-empty="false"
                         :multiple="false"
                         :show-labels="false"/>
          </span>
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

        <!-- Search term -->
        <div class="veto-container-row-r">
          <span class="ms-auto veto-container-item veto-input">
            <input type="text" class="form-control veto-size-35" placeholder="Search" v-model="searchTerm"
                   @input="search()" :style="{'border-color': keepSearchActive ? highlightColor : ''}">
            <span v-if="searchTerm" @click="clearSearch()" class="veto-input-clear">
              <font-awesome-icon icon="fa-xmark"></font-awesome-icon>
            </span>
        </span>
        </div>
      </div>

      <!-- Bottom row for search result -->
      <div class="veto-container-row">
        <div v-if="searchResult !== null" class="veto-container-row-r">
          <!-- Number search results -->
          <span v-if="searchResult.startIndices.length > 0" class="veto-container-item my-auto">
            {{ searchResult.currentResult + 1 }} / {{
              searchResult.startIndices.length
            }} {{ searchResult.startIndices.length === 1 ? 'Match' : 'Matches' }}
          </span>
          <span v-else class="veto-container-item my-auto">No Matches</span>

          <!-- Go to previous -->
          <span class="veto-container-item veto-action-button">
            <button class="veto-neutral" :disabled="searchResult.currentResult <= 0" @click="scrollToPreviousSearchResult()">
              <font-awesome-icon :icon="['fas', 'circle-arrow-left']" size="xl"></font-awesome-icon>
            </button>
          </span>

          <!-- Go to next -->
          <span class="veto-container-item veto-action-button">
            <button class="veto-neutral" :disabled="searchResult.currentResult >= searchResult.startIndices.length - 1" @click="scrollToNextSearchResult()">
              <font-awesome-icon :icon="['fas', 'circle-arrow-right']" size="xl"></font-awesome-icon>
            </button>
          </span>
        </div>
      </div>
    </div>

    <!-- Text -->
    <div class="overflow-auto p-2 flex-fill" @mouseup="textSelected($event)" :style="{'text-align': textAlignment + ' !important'}">
      <div style="position: relative;">
        <!-- Highlights of values -->
        <span class="w-100" :class="fontSize + '-font'" style="position: absolute; left: 0; top: 0;"
              :style="viewStyle()" v-html="textWithHighlight"></span>
        <!-- Highlights of search result -->
        <span class="w-100 veto-overlapped" id="searchHighlighting" style="z-index: 1;"
              :style="viewStyle()"></span>
        <!-- Text for selection. Spans below cannot be interacted with -->
        <span class="w-100 veto-overlapped" ref="viewParagraph" :class="fontSize + '-font'" style="z-index: 2;"
              :style="viewStyle()" v-html="currentText"></span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { HighlightDict } from "@/types/HighlightDict";
import { useVetoStore } from "@/store"
import { mapStores } from "pinia";
import Data from "@/types/Data";
import MetaData from "@/types/MetaData";
import Popup from "@/components/Popup.vue";
import { Occurrence } from "@/types/Occurrence";
import { Color } from "@/types/Color";
import { FontSize } from "@/types/FontSize";
import { calculateIndices } from "@/helper/utility";
import { TrimGroup, TrimGroups, TrimState } from "@/types/TrimGroup";

interface SearchResult {
  currentResult: number
  startIndices: number[]
}

interface TagMetadata {
  attributeName: string
  index: string
  position: number
  start: boolean
}

interface HighlightMetadata {
  color: string
  contained: string[]
  current: number
  included: string[]
  max: number
  open: boolean
  split: boolean
}

type LineGap = 'auto' | 'fixed'

type Part = 'left' | 'complete' | 'center' | 'right'

type TextAlignment = 'left' | 'center' | 'right' | 'justify'

// Has to be outside the component, otherwise the text will be recalculated every time this changes
let highlightedTag = null as string | null;

export default defineComponent({
  name: 'VetoView',
  components: {Popup},
  data() {
    return {
      fontSize: FontSize.MEDIUM,
      FontSize,
      lineGap: 'auto' as LineGap,
      lineGaps: {
        'auto': 'Auto',
        'fixed': 'Fixed',
      },
      lineHeight: 0,
      maxNesting: 0,
      searchResult: null as SearchResult | null,
      searchTerm: '',
      textAlignment: 'left' as TextAlignment,
      textAlignments: {
        'left': 'Left',
        'center': 'Center',
        'right': 'Right',
        'justify': 'Justify',
      },
      wrap: true,
    }
  },
  watch: {
    currentField: function (newValue: string) {
      this.deselectOldTag();
      this.scrollToCurrentTag();
    },
    currentText() {
      this.search();
    },
    currentValueIndex: function (newValues: number) {
      this.deselectOldTag();
      this.scrollToCurrentTag();
    },
    highlightColor() {
      if (this.searchResult !== null) {
        this.search(this.searchResult.currentResult);
      }
    },
  },
  computed: {
    ...mapStores(useVetoStore),
    currentFile(): string {
      return this.vetoStore.columnData.fileName;
    },
    currentField(): string | null {
      return this.vetoStore.currentField;
    },
    currentRow(): number {
      return this.vetoStore.currentRow;
    },
    currentValueIndex(): number | null {
      return this.vetoStore.currentValueIndex;
    },
    data(): Array<Data> {
      return this.vetoStore.data;
    },
    columnData(): MetaData {
      return this.vetoStore.columnData;
    },
    hasFieldSelected: function (): boolean {
      return this.vetoStore.currentValueIndex !== null;
    },
    highlightColor(): Color {
      return this.vetoStore.appSettings.highlightColor;
    },
    highlightMarks(): HighlightDict {
      return this.vetoStore.highlightMarks;
    },
    keepSearchActive(): boolean {
      return this.vetoStore.appSettings.keepSearchFocus;
    },
    textWithHighlight(): string {
      return this.highlight();
    },
    currentText(): string {
       return this.currentRow >= 0 ? this.data[this.currentRow].text : "No row selected";
    }
  },
  mounted() {
    document.addEventListener('keydown', (event) => {
      if (!this.vetoStore.appSettings.keepSearchFocus) {
        return;
      }

      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.classList.contains('multiselect')) {
        return;
      }

      if (event.key === "Backspace") {
        this.searchTerm = this.searchTerm.slice(0, -1);
        this.search();
      } else if (event.key.length === 1) {
        this.searchTerm += event.key;
        this.search();
      }
    });
  },
  methods: {
    onImport() {
      this.clearSearch();
    },
    hasTouchScreen(): boolean {
      // @ts-ignore
      //return (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
      return window.matchMedia("(pointer: coarse)").matches;
    },
    viewStyle(): object {
      return {
        'font-size': this.fontSize.fontSize,
        'white-space': this.wrap ? 'pre-line' : 'pre',
        'overflow-wrap': this.wrap ? 'break-word' : 'normal',
        'line-height': `calc(${this.fontSize.fontSize} + 2px + ${this.lineHeight}rem)`,
      }
    },
    search(scrollToResult: number | null = 0, scrollToStartPos: number | null = null) {
      if (this.searchTerm === null || this.searchTerm === '') {
        this.searchResult = null;
        (document.getElementById('searchHighlighting') as HTMLElement).innerHTML = '';

        const searchSpan = document.getElementById("searchHighlighting");
        if (searchSpan) {
          searchSpan.scrollIntoView();
        }

        return;
      }

      const textLower = this.currentText.toLowerCase();
      const valueLower = this.searchTerm.toLowerCase();

      const startIndices = [];
      let startIndex = 0;
      let index = textLower.indexOf(valueLower, startIndex);
      while (index > -1) {
        startIndices.push(index);
        startIndex = index + 1;
        index = textLower.indexOf(valueLower, startIndex);
      }

      let text = this.currentText;
      for (let i = startIndices.length - 1; i >= 0; --i) {
        const start = startIndices[i];
        let end = start + this.searchTerm.length

        // Fix for overlapping search results
        if (i !== startIndices.length - 1 && end > startIndices[i + 1]) {
          end = startIndices[i + 1]
        }

        const blinking = (scrollToResult !== null && i === scrollToResult) || scrollToStartPos === start;
        const tagString = this.openTag(this.highlightColor, 'search-' + i, 0, "complete", blinking ? 'blinking' : '');

        text = text.substring(0, start) + tagString + text.substring(start, end) + "</span>" + text.substring(end)
      }

      this.searchResult = { currentResult: -1, startIndices };
      (document.getElementById('searchHighlighting') as HTMLElement).innerHTML = text;

      if (startIndices.length === 0) {
        const searchSpan = document.getElementById("searchHighlighting");
        if (searchSpan) {
          searchSpan.scrollIntoView();
        }
      } else if(scrollToResult !== null) {
        this.scrollToSearchResult(scrollToResult);
      } else if (scrollToStartPos !== null) {
        for (const [index, startPosition] of Object.entries(this.searchResult.startIndices)) {
          if (startPosition === scrollToStartPos) {
            this.scrollToSearchResult(index);
            break;
          }
        }
      }
    },
    clearSearch() {
      this.searchTerm = "";
      this.search(null);
    },
    scrollToPreviousSearchResult() {
      if (this.searchResult === null) {
        return;
      }

      let target = this.searchResult.currentResult;
      if (this.searchResult.currentResult > 0) {
        target -= 1;
      }

      this.scrollToSearchResult(target);
    },
    scrollToNextSearchResult() {
      if (this.searchResult === null) {
        return;
      }

      let target = this.searchResult.currentResult;
      if (this.searchResult.currentResult < this.searchResult.startIndices.length - 1) {
        target += 1;
      }

      this.scrollToSearchResult(target);
    },
    scrollToSearchResult(index: number | string) {
      if (this.searchResult === null) {
        return;
      }

      const currentElement = document.getElementById(`highlight-search-${this.searchResult.currentResult}`);
      if (currentElement) {
        currentElement.classList.remove("blinking");
      }

      if (typeof index === 'string') {
        index = parseInt(index)
      }
      this.searchResult.currentResult = index;

      const element = document.getElementById(`highlight-search-${index}`);
      if (element) {
        element.scrollIntoView();
        element.classList.add("blinking");
      }
    },
    scrollToOccurrence(occurrence: Occurrence) {
      this.searchTerm = occurrence.value;
      this.search(null, occurrence.start);
    },
    scrollToCurrentTag() {
      this.scrollToTag(this.currentField, this.currentValueIndex);
    },
    scrollToTag(attributeName: string | null, valueIndex: number | null) {
      if (attributeName === null || valueIndex === null) {
        const searchSpan = document.getElementById("searchHighlighting");
        if (searchSpan) {
          searchSpan.scrollTop = 0;
        }
        return;
      }
      const highlightIndex = attributeName + "." + valueIndex;
      const startElement = document.getElementById(`highlight-${highlightIndex}`);
      if (startElement) {
        startElement.scrollIntoView();

        const elements = document.querySelectorAll("span[data-index='" + highlightIndex + "']")
        elements.forEach(element => {
          if (this.vetoStore.columnData.containsMultiValueAttributes) {
            element.classList.add("highlighted");
            element.classList.add("blinking-highlighted");
          } else {
            element.classList.add("blinking");
          }
        });

        highlightedTag = highlightIndex;
      }
    },
    deselectOldTag() {
      if (highlightedTag === null) {
        return;
      }

      const elements = document.querySelectorAll("span[data-index='" + highlightedTag + "']")
      elements.forEach(element => {
        element.classList.remove("highlighted");
        element.classList.remove("blinking");
        element.classList.remove("blinking-highlighted");
      });

      highlightedTag = null;
    },
    setLineGap() {
      if (this.lineGap == 'auto') {
        this.lineHeight = (this.maxNesting + 1) * 0.5;
      } else {
        this.lineHeight = 0.5;
      }
    },
    textSelected(event: MouseEvent | TouchEvent) {
      //row is selected
      if (this.currentField !== null && this.currentValueIndex !== null && window.getSelection()?.toString() != '') {
        let start, end;
        let range, priorRange;
        //code from https://stackoverflow.com/questions/7991474/calculate-position-of-selected-text-javascript-jquery
        if (typeof window.getSelection() != "undefined") {
          range = window.getSelection()!.getRangeAt(0);
          priorRange = range.cloneRange();
          priorRange.selectNodeContents((this.$refs.viewParagraph as HTMLSpanElement));
          priorRange.setEnd(range.startContainer, range.startOffset);

          const textLinebreak = this.data[this.currentRow].textLineBreak;
          const result = calculateIndices(priorRange, range, textLinebreak);

          start = result.start;
          end = result.end;
        } else if (typeof document.getSelection() != "undefined" && document.getSelection()?.type != "Control") { //Needed? Must be equal undefined?
          // @ts-ignore
          range = document.getSelection()!.createRange();
          // @ts-ignore
          priorRange = document.body.createTextRange();
          priorRange.moveToElementText(this.$refs.viewParagraph);
          priorRange.setEndPoint("EndToStart", range);

          const textLinebreak = this.data[this.currentRow].textLineBreak;
          const result = calculateIndices(priorRange, range, textLinebreak);

          start = result.start;
          end = result.end;
        }

        //clear selection
        window.getSelection()!.removeAllRanges();

        if (start == undefined || end == undefined) {
          console.error("Could not get selected range!");
          return;
        }

        // Collect trim/completion patterns
        const trimPatterns = [];
        const includePatterns = [];
        for (const [trimGroup, state] of Object.entries(this.vetoStore.appSettings.trimGroups)) {
          const pattern = TrimGroups[(trimGroup as TrimGroup)].pattern;
          if (pattern == null) {
            continue;
          }

          if (state === TrimState.TRIM) {
            trimPatterns.push(pattern.source)
          } else if (state === TrimState.EXPAND) {
            includePatterns.push(pattern.source)
          }
        }

        // Trim RegEx annotations
        if (trimPatterns.length > 0) {
          const trimPattern = "(" + trimPatterns.join("|") + ")";

          const selected = this.data[this.currentRow].text.substring(start, end);

          const trimLeading = this.trimStartByRegex(selected, new RegExp(trimPattern));
          start += selected.length - trimLeading.length;

          const trimTrailing = this.trimEndByRegex(trimLeading, new RegExp(trimPattern));
          end -= trimLeading.length - trimTrailing.length
        }

        // Trim units
        if (this.vetoStore.appSettings.trimGroups[TrimGroup.UNITS] === TrimState.TRIM) {
          const selected = this.data[this.currentRow].text.substring(start, end);

          const lastNumber = selected.match(NUMBER_REGEX);
          if (lastNumber !== null) {
            const lastNumberPos = selected.lastIndexOf(lastNumber[0]);
            const lastNumberEnd = lastNumberPos + lastNumber[0].length;

            const text = this.data[this.currentRow].text;
            const unitLength = testUnit(text, start + lastNumberEnd);

            if (unitLength > 0 && start + lastNumberEnd + unitLength > end) {
              end = start + lastNumberEnd;
            }
          }
        }

        // Complete RegEx annotations
        if (includePatterns.length > 0) {
          const next = this.data[this.currentRow].text.substring(end);
          const nextMatch = next.match(new RegExp("^(" + includePatterns.join("|") + ")+", 'gu'));
          if (nextMatch !== null) {
            end += nextMatch[0].length;
          }
          const previous = this.data[this.currentRow].text.substring(0, start);
          const previousMatch = previous.match(new RegExp("(" + includePatterns.join("|") + ")+$", 'gu'));
          if (previousMatch !== null) {
            start -= previousMatch[0].length;
          }
        }

        // Include units in numeric annotations
        if (this.vetoStore.appSettings.trimGroups[TrimGroup.UNITS] === TrimState.EXPAND) {
          const selected = this.data[this.currentRow].text.substring(start, end);

          const lastNumber = selected.match(NUMBER_REGEX);
          if (lastNumber !== null) {
            const lastNumberPos = selected.lastIndexOf(lastNumber[0]);
            const lastNumberEnd = lastNumberPos + lastNumber[0].length;

            const text = this.data[this.currentRow].text;
            const unitLength = testUnit(text, start + lastNumberEnd);

            const newEnd = start + lastNumberEnd + unitLength;
            if (unitLength > 0 && newEnd > end) {
              end = newEnd;
            }
          }
        }

        //update storage
        this.vetoStore.updateFieldData({
          start: start,
          end: end - 1
        });

        // If the control key is pressed, a new value will be created
        let afterLabelingAction = this.vetoStore.appSettings.afterLabelingAction;
        if (this.vetoStore.columnData.containsMultiValueAttributes && event.ctrlKey) {
          const valueIndex = this.vetoStore.addCell();

          if (valueIndex === null) {
            // This should never happen
            // because we are checking if we have an attribute selected at the beginning of this function
            return;
          }

          // New cell should be selected
          this.vetoStore.updateCurrentValueIndex(valueIndex);
          afterLabelingAction = 'NOTHING';
        }

        //take actions according to configuration after an attribute has been (re-)labeled
        if (afterLabelingAction === 'DESELECT'){
          // Automatically deselect the attribute currently selected
          this.vetoStore.deselectCurrentCell();

          // Sort values afterwards
          this.vetoStore.sortValues(this.vetoStore.currentValueOrder);
        } else if (afterLabelingAction === 'PROCEED') {
          // Select the field to the right of the current field.
          // If the current field is in right edge, it will be deselected
          this.vetoStore.selectNextCell();
          this.vetoStore.sortValues(this.vetoStore.currentValueOrder);

          if (!this.vetoStore.isCellSelected) {
            // Show a popup if there are no other values available
            (this.$refs['notProceedingPopup'] as typeof Popup).open();
          }

        } else if (afterLabelingAction === 'NOTHING') {
          // Reselect the current selection after sorting
          this.vetoStore.sortValues(this.vetoStore.currentValueOrder);
        } else {
          console.error(`Unhandled action after labeling: '${this.vetoStore.appSettings.afterLabelingAction}'`);
        }
      }
    },
    /**
     * Trims characters matching a regex pattern from the start of a string.
     * @param str The string to trim.
     * @param pattern The regex pattern to match characters to remove.
     * @returns The trimmed string.
     */
    trimStartByRegex(str: string, pattern: RegExp): string {
      const match = str.match(new RegExp(`^(${pattern.source})+`, 'gu'));
      return match ? str.substring(match[0].length) : str;
    },
    /**
     * Trims characters matching a regex pattern from the end of a string.
     * @param str The string to trim.
     * @param pattern The regex pattern to match characters to remove.
     * @returns The trimmed string.
     */
    trimEndByRegex(str: string, pattern: RegExp): string {
      const match = str.match(new RegExp(`(${pattern.source})+$`, 'gu'));
      return match ? str.substring(0, str.length - match[0].length) : str;
    },
    highlight(): string {
      const dicts: HighlightDict = this.highlightMarks;

      // Create a list with all wall start and end tags
      const tags: TagMetadata[] = [];
      for (const dict of dicts) {
        if (dict.start < 0 || dict.end > this.currentText.length) {
          continue;
        }
        const tagIndex = dict.attributeName + '.' + dict.valueIndex;
        tags.push({attributeName: dict.attributeName, index: tagIndex, start: true, position: dict.start});
        tags.push({attributeName: dict.attributeName, index: tagIndex, start: false, position: dict.end + 1});
      }

      if (tags.length <= 0) {
        return this.currentText;
      }

      // Sort the list by position and start
      tags.sort((a, b) => {
        if (a.position < b.position) {
          return -1
        } else if (a.position > b.position) {
          return 1
        } else {
          if (a.start === b.start) {
            return 0
          } else if (a.start) {
            return 1
          } else {
            return -1
          }
        }
      });

      // Sort start tags with the same position by the order of the corresponding end tags
      const endOrder = [];
      let lastPosition = -1;
      let lastPositionAnchor = -1;
      for (let i = tags.length - 1; i >= 0; --i) {
        const tag = tags[i];
        if (tag.start) {
          if (tag.position === lastPosition) {
            for (const startOrderElement of endOrder) {
              if (startOrderElement === tag.index) {
                break;
              } else if (startOrderElement === tags[i + 1].index) {
                const tagTmp = tags[i];
                tags[i] = tags[i + 1];
                tags[i + 1] = tagTmp;
                i = lastPositionAnchor;
                break;
              }
            }
          } else {
            lastPositionAnchor = i;
          }
          lastPosition = tag.position;
        } else {
          endOrder.push(tag.index);
          lastPosition = -1;
        }
      }

      // Sort end tags with the same position by the order of the corresponding start tags
      const startOrder = [];
      lastPosition = -1;
      lastPositionAnchor = -1;
      for (let i = 0; i < tags.length; ++i) {
        const tag = tags[i];
        if (tag.start) {
          startOrder.push(tag.index);
          lastPosition = -1;
        } else {
          if (tag.position === lastPosition) {
            for (const startOrderElement of startOrder) {
              if (startOrderElement === tag.index) {
                break;
              } else if (startOrderElement === tags[i - 1].index) {
                const tagTmp = tags[i];
                tags[i] = tags[i - 1];
                tags[i - 1] = tagTmp;
                i = lastPositionAnchor;
                break;
              }
            }
          } else {
            lastPositionAnchor = i;
          }
          lastPosition = tag.position;
        }
      }

      // Calculate the size of each entry and find conflicting tags
      const metadata: { [indexString: string]: HighlightMetadata } = {}
      for (let i = tags.length - 1; i >= 0; --i) {
        const tag = tags[i];
        if (tag.start) {
          metadata[tag.index].open = false;
          for (const entry in metadata) {
            const meta = metadata[entry];
            if (meta.open && meta.included.includes(tag.index)) {
              meta.current -= 1;
              meta.included = meta.included.filter(a => a !== tag.index)
            }
          }
        } else {
          let increased = {} as { [key: string]: number };
          let toBeIncreased = {} as { [key: string]: number };

          for (const entryKey in metadata) {
            const meta = metadata[entryKey];
            if (meta.open) {
              meta.current += 1;

              if (meta.max < meta.current) {
                meta.max = meta.current;
                increased[entryKey] = meta.max;
              }

              meta.included.push(tag.index);
              meta.contained.push(tag.index);
            }
          }

          while (Object.keys(increased).length > 0) {
            for (const entryKey in metadata) {
              const meta = metadata[entryKey];
                for (const increasedEntryKey in increased) {
                  if (meta.contained.includes(increasedEntryKey)) {
                    toBeIncreased[entryKey] = Math.max(increased[increasedEntryKey] + 1, toBeIncreased.hasOwnProperty(entryKey) ? toBeIncreased[entryKey] : 0);
                  }
              }

            }
            increased = {};
            for (const entryKey in toBeIncreased) {
              const meta = metadata[entryKey];
              if (meta.open) {
                if (meta.current < toBeIncreased[entryKey]) {
                  meta.current = toBeIncreased[entryKey];
                  if (meta.max < meta.current) {
                    meta.max = meta.current;
                    increased[entryKey] = meta.max;
                  }
                }
              } else {
                if (meta.max < toBeIncreased[entryKey]) {
                  meta.max = toBeIncreased[entryKey];
                  increased[entryKey] = meta.max;
                }
              }
            }
            toBeIncreased = {};
          }

          const color = this.vetoStore.highlightColor(tag.attributeName);
          metadata[tag.index] = {color: color, contained: [], current: 0, max: 0, open: true, included: [], split: false};
        }
      }

      // Insert start and end tags
      let text = this.currentText;
      let maxNesting = 0;
      for (let i = tags.length - 1; i >= 0; --i) {
        const tag = tags[i];
        const meta = metadata[tag.index];
        maxNesting = Math.max(maxNesting, meta.max);

        let tagString = '';
        if (tag.start) {
          for (const index in meta.included) {
            tagString += endTag();
          }
          tagString += this.openTag(meta.color, tag.index, meta.max, meta.split ? 'left' : 'complete');
          for (const index of meta.included) {
            const splitIndexMeta = metadata[index];
            let part: Part | null = null;
            if (splitIndexMeta.split) {
              part = 'center';
            } else {
              splitIndexMeta.split = true;
              part = 'right';
            }
            tagString += this.openTag(splitIndexMeta.color, index, metadata[index].max, part);
          }
        } else {
          tagString = endTag();
        }
        text = [text.slice(0, tag.position), tagString, text.slice(tag.position)].join('');
      }

      this.maxNesting = maxNesting;
      this.setLineGap();

      return text;

      function endTag() {
        return '</span>'
      }
    },
    openTag(color: string, index: string, size: number, part: Part, classNames: string = ''): string {
      const idString = part == 'complete' || part == 'left' ? ` id="highlight-${index}"` : ''

      const padding = (size + 1) * 0.25;

      let classStyle;
      switch (part) {
        case 'complete':
          classStyle = `rounded`
          break;
        case 'left':
          classStyle = `rounded-start`
          break;
        case 'center':
          classStyle = ``
          break;
        case 'right':
          classStyle = `rounded-end`
          break;
        default:
          break;
      }

      if (index == highlightedTag && this.vetoStore.columnData.containsMultiValueAttributes) {
        classStyle += " highlighted";
      }

      if (classNames) {
        classStyle += ' ' + classNames;
      }

      return `<span${idString} class="${classStyle}" style="color: white; background-color: ${color}; padding-top: ${padding}rem !important; padding-bottom: ${padding}rem !important;" data-index="${index}">`;
    }
  }
});

const SI_UNITS = [
  // Base SI units
  "s", "m", "g", "A", "K", "mol", "cd",
  // Area
  "m²",
  // Data/Information
  "B", "bit",
  // Electricity
  "V", "Ω", "F", "S",
  // Energy
  "J", "Wh","cal", "Gy", "Sv",
  // Luminosity
  "lm", "lx",
  // Magnetic
  "Wb", "T", "H",
  // Pressure
  "Pa", "bar",
  // Radioactivity
  "Bq",
  // Temperature
  "°C", "K",
  // Volume
  "m³", "l", "L",
  // Other
  "kat", "W", "A", "Hz", "N",
];

const SI_PREFIXES = [
  "Q", "R", "Y", "Z", "E", "P", "T", "G", "M", "k", "h", "da", "", "d", "c", "m", "µ", "n", "p", "f", "a", "z", "y", "r", "q"
];

const UNITS = [
  // length
  "ft", "in", "yd", "mi", "pc", "AU",
  // area
  "ha", "ft²", "in²", "acre", "a",
  // volume
  "gal", "qt", "pt", "fl oz",
  // mass/weight
  "t", "lb", "oz", "ton", "u",
  // time
  "a", "yr", "mo", "wk", "d", "h", "std", "min", "sek",
  // temperature
  "°F",
  // speed
  "mph", "kn",
  // Energy
  "eV",
  // percentage and ratios
  "%", "‰", "ppth", "ppm", "ppb", "pptr",
  // pressure
  "psi", "atm", "mmHg",
  // power
  "hp",
  // amount of substance
  "eq", "Eq", "meq", "mEq", "µq",
  // pH
  "pH",
];

const NUMBER_REGEX = /(\d+([.,/]\d+)?)/g

function testUnit(text: string, end: number, prependSpace: boolean = true): number {
  for (let unit of SI_UNITS) {
    for (let prefix of SI_PREFIXES) {
      const result = doTestUnit(prefix + unit, text, end, prependSpace);
      if (result !== 0) {
        return result;
      }
    }
  }

  for (let unit of UNITS) {
    const result = doTestUnit(unit, text, end, prependSpace);
    if (result !== 0) {
      return result;
    }
  }

  return 0;
}

function doTestUnit(unit: string, text: string, end: number, prependSpace: boolean) {
  if (prependSpace) {
    unit = " " + unit;
  }
  const candidate = text.substring(end, end + unit.length);
  if (candidate === unit) {
    const nextChar = text.charAt(end + unit.length);

    let nextUnit = 0
    if (nextChar === "/") {
      nextUnit = testUnit(text, end + unit.length + 1, false);

      if (nextUnit !== 0) {
        // Add 1 for the slash
        nextUnit += 1;
      }
    }

    if (!/\p{L}|\p{No}/gu.test(nextChar)) {
      return nextUnit + unit.length;
    }
  }

  return 0;
}

</script>

<style scoped>

#vetoView {
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
}

.small-font {
    font-size: 12px;
}

.medium-font {
    font-size: 16px;
}

.large-font {
    font-size: 20px;
}

.veto-overlapped {
  color: rgba(0, 0, 0, 0);
  left: 0;
  position: absolute;
  top: 0;
}
</style>
