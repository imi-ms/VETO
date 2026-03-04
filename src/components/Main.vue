<template>
  <div id="abc" class="main-wrapper">
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
}

.main {
  display: flex;
  flex-flow: row nowrap;
}

.veto-table-wrapper {
  border-right: var(--veto-color-border) solid 3px;
  flex: 0 1 auto;
  height: 100%;
  min-width: calc(326px + 6px + 2rem);
  overflow: auto;
  padding: 1rem 1rem 1rem 1rem;
  resize: horizontal;
  width: 50%
}

.veto-view-wrapper {
  flex: 1 0 auto;
  flex-basis: calc(326px + 6px + 2rem);
  height: 100%;
  padding: 1rem 1rem 1rem 1rem;
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
  .veto-table-wrapper {
    border: none;
    height: calc(100% - 42px);
    min-width: 100%;
    padding: 1rem 1rem .5rem 1rem;
    resize: none;
    width: 100% !important;
  }
  .veto-view-wrapper {
    flex-basis: 100%;
    height: calc(100% - 42px);
    padding: .5rem 1rem 1rem 1rem;
  }
}


</style>
