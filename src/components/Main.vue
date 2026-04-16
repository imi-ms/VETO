<template>
  <div class="main-wrapper">
    <div class="main" style="height: 100%; width: 100%"
         :style="{'min-height': isMultiValueView ? '400px' : '300px'}">
      <a id="top"></a>
      <div class="veto-table-wrapper">
        <VetoTable ref="vetoTable"  @scrollToPosition="scrollToPosition"></VetoTable>
      </div>
      <div class="veto-scroll-buttons">
        <div class="veto-action-button">
          <button class="veto-neutral" onclick="document.getElementById('top').scrollIntoView()">
            <font-awesome-icon :icon="['fas', 'circle-arrow-up']" size="xl"></font-awesome-icon>
          </button>
        </div>
        <div class="veto-action-button">
          <button class="veto-neutral" onclick="document.getElementById('bottom').scrollIntoView()">
            <font-awesome-icon :icon="['fas', 'circle-arrow-down']" size="xl"></font-awesome-icon>
          </button>
        </div>
      </div>
      <div class="veto-view-wrapper">
        <VetoView ref="vetoView"></VetoView>
      </div>
      <a id="bottom"></a>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import VetoTable from "@/components/VetoTable.vue";
import VetoView from "@/components/VetoView.vue";
import {useVetoStore} from "@/store";
import { Occurrence } from "@/types/Occurrence";

export default defineComponent({
  name: "Main",
  components: {VetoTable, VetoView},
  computed: {
    isMultiValueView: function (): boolean {
      return useVetoStore().columnData.containsMultiValueAttributes;
    },
  },
  methods: {
    onImport() {
      (this.$refs['vetoTable'] as typeof VetoTable).onImport();
      (this.$refs['vetoView'] as typeof VetoTable).onImport();
    },
    scrollToPosition(occurrence: Occurrence) {
      (this.$refs['vetoView'] as typeof VetoView).scrollToOccurrence(occurrence);
    }
  }
});
</script>

<style scoped>

.main-wrapper {
  height: 100%;
  background: var(--veto-color-canvas);
  padding: 0.22rem;
}

.main {
  background: var(--veto-color-canvas);
  display: flex;
  flex-flow: row nowrap;
  overflow: hidden;
}

.veto-table-wrapper {
  border-right: none;
  flex: 0 1 auto;
  height: 100%;
  min-width: calc(326px + 6px + 2rem);
  overflow: auto;
  padding: 0.32rem;
  resize: horizontal;
  width: 50%;
  background: transparent;
  box-shadow: none;
  scrollbar-gutter: stable;
}

.veto-table-wrapper::-webkit-resizer {
  background-color: color-mix(in srgb, var(--veto-color-pane-table) 70%, var(--veto-color-border) 30%);
  background:
    linear-gradient(135deg, transparent 52%, color-mix(in srgb, var(--veto-color-font) 55%, var(--veto-color-border) 45%) 52%, color-mix(in srgb, var(--veto-color-font) 55%, var(--veto-color-border) 45%) 60%, transparent 60%),
    linear-gradient(135deg, transparent 66%, color-mix(in srgb, var(--veto-color-font) 45%, var(--veto-color-border) 55%) 66%, color-mix(in srgb, var(--veto-color-font) 45%, var(--veto-color-border) 55%) 74%, transparent 74%),
    linear-gradient(135deg, transparent 80%, color-mix(in srgb, var(--veto-color-font) 38%, var(--veto-color-border) 62%) 80%, color-mix(in srgb, var(--veto-color-font) 38%, var(--veto-color-border) 62%) 88%, transparent 88%);
  background-position: right bottom;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  border-radius: 0 0 var(--veto-radius-sm) 0;
}

.veto-table-wrapper::-webkit-scrollbar-corner {
  background: color-mix(in srgb, var(--veto-color-pane-table) 74%, var(--veto-color-border) 26%);
}

.veto-view-wrapper {
  flex: 1 0 auto;
  flex-basis: calc(326px + 6px + 2rem);
  height: 100%;
  padding: 0.32rem;
  background: transparent;
}
.veto-scroll-buttons > :first-child {
  margin-right: .5rem;
}

.veto-scroll-buttons {
  display: none;
}
@media screen and (max-width: 727px) {
  .veto-scroll-buttons {
    align-items: center;
    display: flex;
    flex-direction: row;
    margin: auto;
  }
  .main {
    flex-flow: row wrap;
  }
  .main-wrapper {
    padding: 0.16rem;
  }
  .veto-table-wrapper {
    border: none;
    height: calc(100% - 42px);
    min-width: 100%;
    padding: 0.22rem 0.22rem 0.12rem 0.22rem;
    resize: none;
    width: 100% !important;
  }
  .veto-view-wrapper {
    flex-basis: 100%;
    height: calc(100% - 42px);
    padding: 0.12rem 0.22rem 0.22rem 0.22rem;
  }
}


</style>
