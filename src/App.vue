<template>
  <component :is="'style'">
    :root {
      --veto-color-active: {{ vetoColorScheme.active }};
      --veto-color-active-highlight: {{ vetoColorScheme.activeHighlight }};
      --veto-color-background: {{ vetoColorScheme.background }};
      --veto-color-background-highlight: {{ vetoColorScheme.backgroundHighlight }};
      --veto-color-border: {{ vetoColorScheme.border }};
      --veto-color-disabled: {{ vetoColorScheme.disabled }};
      --veto-color-error: {{ vetoColorScheme.error }};
      --veto-color-font: {{ vetoColorScheme.font }};
      --veto-color-font-highlight: {{ vetoColorScheme.fontHighlight }};
      --veto-color-focus: {{ vetoColorScheme.focus }};
      --veto-color-highlight: {{ vetoColorScheme.highlight }};
      --veto-color-inactive: {{ vetoColorScheme.inactive }};
      --veto-color-inactive-highlight: {{ vetoColorScheme.inactiveHighlight }};
      --veto-color-label: {{ vetoColorScheme.label }};
      --veto-color-main: {{ vetoColorScheme.main }};
      --veto-color-main-highlight: {{ vetoColorScheme.mainHighlight}};
      --veto-color-scrollbar: {{ vetoColorScheme.scrollbar }};
      --veto-color-scrollbar-background: {{ vetoColorScheme.scrollbarBackground }};
      --veto-color-success: {{ vetoColorScheme.success }};
      --veto-color-warning: {{ vetoColorScheme.warning }};
    }
  </component>
  <Popup ref="changelogNotSaved" id="changelogNotSavedModal" header="Warning - Changelog too big" :hide-close-button="true" width="30%">
    <template #popup-body>
      <div>
        The changelog is too big. Additional changes will not be saved into the local storage. Please download and upload the current data
      </div>
    </template>
  </Popup>
  <Popup ref="firstVisitPopup" id="firstVisitPopupModal" header="About Veto" :hide-close-button="true" width="30%">
    <template #popup-body>
      Welcome to VETO<br>
      <br>
      VETO is intended to support the development and testing of machine learning applications, specifically in the field of medical informatics. See <i>Help</i> for more information.
    </template>
  </Popup>
  <ImportPopup ref="importPopup" id="importPopupModal" @import="onImport()"/>
  <ExportPopup ref="exportPopup" id="exportPopupModal"/>
  <SettingsPopup ref="settingsPopup" id="settingsPopupModal"/>
  <HelpPopup ref="helpPopup" id="helpPopupModal"/>
  <div class="veto-main-grid veto-background veto-font">
    <div class="veto-main-grid-navbar">
      <nav style="z-index: 10; min-height: 100%" class="navbar navbar-expand-md navbar-light veto-background-highlight border-bottom border-3">
        <div class="container-fluid">
          <div class="navbar-brand" style="max-width: 70vw; width: 10%">
            <img src="./assets/veto_001.png" class="logo" alt="VETO" width="4896">
          </div>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarButtons"
                  aria-controls="navbarButtons" aria-expanded="false" aria-label="Toggle Buttons">
            <span class="navbar-toggler-icon "></span>
          </button>
          <div class="collapse navbar-collapse show" id="navbarButtons">
            <div class="ms-auto text-end">
              <ul class="navbar-nav">
                <li class="veto-nav-item" v-on:click="showImportPopup()"><a href="#">Import</a></li>
                <li class="veto-nav-item" v-on:click="showExportPopup()"><a href="#">Export</a></li>
                <li class="veto-nav-item" v-on:click="showSettingsPopup()"><a href="#">Settings</a></li>
                <li class="veto-nav-item" v-on:click="showHelpPopup()"><a href="#">Help</a></li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </div>
    <div class="veto-main-grid-content">
      <Main ref="main" style="height: 100%;"></Main>
    </div>
    <div class="veto-main-grid-footer">
      <Footer></Footer>
    </div>
  </div>
</template>

<script lang="ts">
import Main from "@/components/Main.vue";
import Popup from "@/components/Popup.vue";
import Footer from "@/components/Footer.vue";
import ImportPopup from "@/components/ImportPopup.vue"
import ExportPopup from "@/components/ExportPopup.vue"
import SettingsPopup from "@/components/SettingsPopup.vue"
import HelpPopup from "@/components/HelpPopup.vue"
import {defineComponent} from "vue";
// @ts-ignore
import {Collapse} from "bootstrap";
import {useVetoStore} from "./store";
import {AppSettings} from "@/types/State";
import MetaData from "./types/MetaData";
import Data from "./types/Data";
import { KeyboardAction } from "./types/KeyboardAction";
import { VetoColorScheme, VetoColorSchemeType } from "./types/VetoColorScheme";

export default defineComponent({
  name: 'App',
  data() {
    let store = useVetoStore();
    return {
      vetoStore: store
    }
  },
  components: {
    Main,
    Popup,
    Footer,
    ImportPopup,
    ExportPopup,
    SettingsPopup,
    HelpPopup
  },
  computed: {
    appSettings(): AppSettings {
      return this.vetoStore.appSettings;
    },
    changelogSaved: function (): boolean {
      return this.vetoStore.changelogSaved;
    },
    columnData(): MetaData {
      return this.vetoStore.columnData;
    },
    currentRow(): number {
      return this.vetoStore.currentRow;
    },
    currentField(): string | null  {
      return this.vetoStore.currentField;
    },
    data(): Array<Data> {
      return this.vetoStore.data;
    },
    vetoColorScheme(): VetoColorSchemeType {
      return VetoColorScheme.getVetoColorScheme(this.vetoStore.appSettings.vetoColorScheme).scheme;
    }
  },
  mounted() {
    window.addEventListener("beforeunload", (event) => {
      if (!this.vetoStore.exportedAllChanges) {
        event.preventDefault();
      }
    });

    const collapse = new Collapse(document.getElementById('navbarButtons'));

    // Invalidate local storage if breaking version
    let storageVersion = localStorage.getItem("VETO.version");
    const breakingVersion = storageVersion === null
      ? true
      : APP_VERSION.split(".")[0] !== storageVersion.split(".")[0];

    if (breakingVersion) {
      localStorage.removeItem("VETO.appSettings");
      localStorage.removeItem("VETO.changelog");
      localStorage.removeItem("VETO.visitedFlag");
    }

    localStorage.setItem("VETO.version", APP_VERSION);

    // Add Support for using the keyboard
    window.addEventListener('keydown', (event) => {
      if(this.currentField == null) return;

      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.classList.contains('multiselect')) {
        return;
      }

      const actionToKey = this.vetoStore.appSettings.keyboardActions;

      switch(event.key) {
        case actionToKey[KeyboardAction.MOVE_UP]:
          this.vetoStore.selectUpperRow();
          event.preventDefault();
          break;
        case actionToKey[KeyboardAction.MOVE_DOWN]:
          this.vetoStore.selectLowerRow();
          event.preventDefault();
          break;
        case actionToKey[KeyboardAction.MOVE_LEFT]:
          this.vetoStore.selectColumnToTheLeft();
          event.preventDefault();
          break;
        case actionToKey[KeyboardAction.MOVE_RIGHT]:
          this.vetoStore.selectColumnToTheRight();
          event.preventDefault();
          break;
        case actionToKey[KeyboardAction.DELETE]:
          this.vetoStore.deleteCurrentCell();
          event.preventDefault();
          break;
        case actionToKey[KeyboardAction.EXIT]:
          this.vetoStore.deselectCurrentCell();
          event.preventDefault();
          break;
        case actionToKey[KeyboardAction.TOGGLE_VALIDATION]:
          this.vetoStore.toggleCheckAll(this.vetoStore.currentRow);
          event.preventDefault();
          break;
        default:
          break;
      }
    });

     // Check if the site has been loaded before
     let visitedFlag = localStorage.getItem("VETO.visitedFlag");
     if(visitedFlag === null){
        localStorage.setItem("VETO.visitedFlag", "");   // mark that the site has been loaded before
        (this.$refs['firstVisitPopup'] as typeof Popup).open();
     }

     let appSettings = localStorage.getItem("VETO.appSettings") ;
     if (appSettings !== null) {
        this.vetoStore.updateAppSettings(JSON.parse(appSettings));
     }
  },
  watch: {
    changelogSaved(newValue: boolean, oldValue: boolean) {
      if (oldValue && !newValue) {
        (this.$refs['changelogNotSaved'] as typeof Popup).open();
      }
    },
    appSettings: {
      handler(newValue: AppSettings) {
        localStorage.setItem("VETO.appSettings", JSON.stringify(newValue));
      },
      deep: true,
    },
  },
  methods: {
    onImport() {
      (this.$refs['main'] as typeof Main).onImport()
    },
    showSettingsPopup(){
      (this.$refs['settingsPopup'] as typeof Popup).open();
    },
    showImportPopup(){
      (this.$refs['importPopup'] as typeof Popup).open();
    },
    showExportPopup(){
      (this.$refs['exportPopup'] as typeof Popup).open();
    },
    showHelpPopup(){
      (this.$refs['helpPopup'] as typeof Popup).open();
    }
  }
});
</script>

<style scoped>

img {
  max-width: calc(min(40vw, 270px));
}

.navbar-toggler {
  background-color: var(--veto-color-background-highlight);
}

.veto-main-grid {
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: auto 1fr auto;

  height: 100vh;
  max-height: 100vh;
  min-width: calc(300px);
  overflow: hidden;
}

.veto-main-grid-navbar {
 grid-row:1;
}

.veto-main-grid-content {
  grid-row: 2;
  height: 100%;
  overflow: auto;
  width: 100%;
}

.veto-main-grid-footer {
  grid-row: 3;
}
</style>
