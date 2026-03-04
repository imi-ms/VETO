<template>
  <Popup ref="settingsPopup" :id="id" header="Settings" @confirm="save()"
         action-button-label="Set to default" :action-button-visible="true" @action="resetAppSettings()"
         :confirm-button-disabled="!cachedSettingsValid" :action-button-disabled="changesAreOnDefault" confirm-button-label="Save">
      <template #popup-body >
        <div class="veto-group">

          <!-- General settings -->
          <div class="veto-group-head">
            General Settings
          </div>
          <div class="form-group">
            <label for="afterLabelingModeInput" class="form-label">Automatic actions after labeling</label>
            <Multiselect  id="afterLabelingModeInput"
                          v-model="cachedAppSettings.afterLabelingAction"
                          :options="afterLabelingMode.map((o) => o.id)"
                          :custom-label="(id: string) => afterLabelingMode.find((o) => o.id === id)?.label"
                          :searchable="false"
                          :allow-empty="false"
                          :multiple="false"
                          :show-labels="false"/>
          </div>

          <!-- Veto colors -->
          <div class="form-group">
            <label for="vetoColorScheme" class="form-label">Colors of the user interface</label>
            <Multiselect  id="vetoColorScheme"
                          v-model="cachedAppSettings.vetoColorScheme"
                          :options="Object.keys(vetoColorScheme)"
                          :searchable="false"
                          :allow-empty="false"
                          :multiple="false"
                          :show-labels="false">
              <template #singleLabel="props">
                <div class="dropdown-row">
                  <div class="dropdown-column">
                    {{ vetoColorScheme.getVetoColorScheme(props.option).name }}
                  </div>
                  <div class="dropdown-column">
                    <template v-for="color in vetoColorScheme.getVetoColorScheme(props.option).scheme">
                      <font-awesome-icon :icon="['fas', 'square']" :color="color" />
                    </template>
                  </div>
                </div>
              </template>
              <template #option="props">
                <div class="dropdown-row">
                  <div class="dropdown-column">
                    {{ vetoColorScheme.getVetoColorScheme(props.option).name }}
                  </div>
                  <div class="dropdown-column">
                    <template v-for="color in vetoColorScheme.getVetoColorScheme(props.option).scheme">
                      <font-awesome-icon :icon="['fas', 'square']" :color="color" />
                    </template>
                  </div>
                </div>
              </template>
            </Multiselect>
          </div>

          <!-- Annotation colors -->
          <div class="form-group">
            <label for="annotationColorScheme" class="form-label">Default color scheme for annotations</label>
            <Multiselect  id="annotationColorScheme"
                          v-model="cachedAppSettings.annotationColorScheme"
                          :options="Object.keys(annotationColorScheme)"
                          :searchable="false"
                          :allow-empty="false"
                          :multiple="false"
                          :show-labels="false">
              <template #singleLabel="props">
                <div class="dropdown-row">
                  <div class="dropdown-column">
                    {{ annotationColorScheme.getColorScheme(props.option).name }}
                  </div>
                  <div class="dropdown-column">
                    <template v-for="color in annotationColorScheme.getColorScheme(props.option).scheme">
                      <font-awesome-icon :icon="['fas', 'square']" :color="color" />
                    </template>
                  </div>
                </div>
              </template>
              <template #option="props">
                <div class="dropdown-row">
                  <div class="dropdown-column">
                    {{ annotationColorScheme.getColorScheme(props.option).name }}
                  </div>
                  <div class="dropdown-column">
                    <template v-for="color in annotationColorScheme.getColorScheme(props.option).scheme">
                      <font-awesome-icon :icon="['fas', 'square']" :color="color" />
                    </template>
                  </div>
                </div>
              </template>
            </Multiselect>
          </div>

          <!-- Highlight color -->
          <div class="form-group">
            <label for="highlightColor" class="form-label">Highlight color for search results</label>
            <div>
              <input id="highlightColor" type="color" v-model="cachedAppSettings.highlightColor">
            </div>
          </div>

          <div class="form-check">
            <input id="keepSearchFocus" type="checkbox" class="form-check-input"
                   v-model="cachedAppSettings.keepSearchFocus"/>
            <label for="keepSearchFocus" class="form-check-label">Keep search input active (Disable to add more keyboard shortcut options)</label>
          </div>
        </div>

        <!-- Trimming -->
        <div class="veto-group">
          <div class="veto-group-head">Trimming and Expansion Settings</div>

          <table>
            <tr v-for="[key, group] of Object.entries(TrimGroups)" :key="key">
              <td><label style="padding-right: 2rem;">{{ group.label }}</label></td>

              <td style="padding-right: 2rem;">
                  {{group.example}}
              </td>

              <td v-for="trimState of Object.keys(TrimState)" class="form-check form-check-inline"
                  style="margin-right: 2rem;">
                <input :id="key + '-' + trimState" :name="key" :value="trimState" type="radio"
                       :checked="cachedAppSettings.trimGroups[key] === trimState" class="form-check-input"
                       @input="toggleTrimGroup(key, trimState)"/>
                <label :for="key + '-' + trimState" class="form-check-label">
                  {{ TrimStates[trimState].label }}
                </label>
              </td>
            </tr>

          </table>
        </div>

        <!-- Conflict resolution settings -->
        <div class="veto-group">
          <div class="veto-group-head">
            Conflict Resolution Settings
          </div>
          <div class="form-check">
            <label for="ignoreSpaces" class="form-check-label">Ignore spaces in the text when looking for values</label>
            <input id="ignoreSpaces" v-model="cachedAppSettings.ignoreSpaces" type="checkbox" class="form-check-input" />
          </div>
          <div class="form-check">
            <label for="ignoreTabs" class="form-check-label">Ignore tabs in the text when looking for values</label>
            <input id="ignoreTabs" v-model="cachedAppSettings.ignoreTabs" type="checkbox" class="form-check-input" />
          </div>
          <div class="form-check">
            <label for="ignoreLineBreaks" class="form-check-label">Ignore line breaks in the text when looking for values</label>
            <input id="ignoreLineBreaks" v-model="cachedAppSettings.ignoreLineBreaks" type="checkbox" class="form-check-input" />
          </div>
          <div class="form-check">
            <label for="ignoreDifferenceWhitespace" class="form-check-label">Don't differentiate between whitespaces when looking for values</label>
            <input id="ignoreDifferenceWhitespace" v-model="cachedAppSettings.ignoreDifferenceWhitespace" type="checkbox" class="form-check-input" />
          </div>
          <div class="form-check">
            <label for="matchEntireWord" class="form-check-label">Match the entire word when looking for values</label>
            <input id="matchEntireWord" v-model="cachedAppSettings.matchEntireWord" type="checkbox" class="form-check-input" />
          </div>
        </div>
        <div class="veto-group">
          <div class="veto-group-head">
            Keyboard Settings
          </div>

          <div style="margin-bottom: 1rem; margin-top: .5rem;">
            <span v-for="(k, index) of conflictingKeyboardAssignations.keys()" :key="index" style="display: block;" class="invalid-settings-message">
              <font-awesome-icon :icon="['fas', 'xmark']" class="icon" size="lg"/>
              <span>The key "{{k}}" has been associated to more than one action: {{ getActionListString(k) }} </span>
            </span>
            <div v-for="(key, index) of conflictingKeys.values()" :key="index" class="invalid-settings-message">
              <font-awesome-icon :icon="['fas', 'xmark']" class="icon" size="lg"/>
              <span>The key "{{ key }}" can't be used as a shortcut if "Keep search input active" is enabled</span>
            </div>
          </div>

          <div v-for="(keyboardAction, index) of Object.keys(KeyboardAction)" class="input-group mb-3 key-selector"
               :class="{'invalid-key-selector': conflictingKeyboardActions.includes(keyboardAction) || conflictingKeys.has(cachedAppSettings.keyboardActions[keyboardAction])}"
               :key="index">
            <label :for="keyboardAction" class="input-group-text">{{ getTitleByKeyboardAction(keyboardAction) }}</label>
            <span class="veto-form-multiselect">
              <Multiselect :id="keyboardAction"
                           v-model="cachedAppSettings.keyboardActions[keyboardAction]"
                           :options="validKeys.filter((key: KeyboardOption) => !cachedAppSettings.keepSearchFocus || !key.conflicts).map((key: KeyboardOption) => key.key)"
                           :custom-label="(option: string) => validKeys.find((key: KeyboardOption) => key.key === option)?.keySymbol"
                           :searchable="true"
                           :allow-empty="false"
                           :multiple="false"
                           :show-labels="false"/>
            </span>
          </div>
        </div>
      </template>
    </Popup>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import Popup from "@/components/Popup.vue";
import {AnnotationColorScheme} from "@/types/AnnotationColorScheme";
import {VetoColorScheme} from "@/types/VetoColorScheme";
import {getDefaultSettings, useVetoStore} from "@/store"
import { KeyboardAction, KeyboardOption, validKeys } from "@/types/KeyboardAction"
import { AppSettings } from "@/types/State";
import { TrimGroup, TrimGroups, TrimState, TrimStates } from "@/types/TrimGroup";

export default defineComponent({
  name: "SettingsPopup",
  props: ["id"],
  components: {
    Popup
  },
  data() {
    let store = useVetoStore();
    const cachedAppSettings = this.cloneAppSettings(store.appSettings);

    return {
      vetoStore: store,
      annotationColorScheme: AnnotationColorScheme,
      vetoColorScheme: VetoColorScheme,
      KeyboardAction: KeyboardAction,
      cachedAppSettings: cachedAppSettings,
      afterLabelingMode: [{id: "NOTHING",  label: "Nothing"},
                          {id: "DESELECT", label: "Deselect after labeling"},
                          {id: "PROCEED",  label: "Proceed with next cell after labeling"}],
      validKeys: validKeys,
    }
  },
  methods: {
    // Wird von außen zum Öffnen des Popups aufgerufen
    open() {
      this.cachedAppSettings = this.cloneAppSettings(this.vetoStore.appSettings);
      (this.$refs['settingsPopup'] as typeof Popup).open();
    },
    hasTouchScreen(): boolean {
      // @ts-ignore
      return window.matchMedia("(pointer: coarse)").matches;
    },
    cloneAppSettings(settings: AppSettings): AppSettings {
      return JSON.parse(JSON.stringify(settings));
    },
    toggleTrimGroup(key: TrimGroup, value: TrimState) {
      this.cachedAppSettings.trimGroups[key] = value;
    },
    getTitleByKeyboardAction(action: KeyboardAction): string {
      switch(action) {
        case KeyboardAction.MOVE_LEFT:
          return "Move left"
        case KeyboardAction.MOVE_RIGHT:
          return "Move right"
        case KeyboardAction.MOVE_UP:
          return "Move up"
        case KeyboardAction.MOVE_DOWN:
          return "Select lower cell";
        case KeyboardAction.EXIT:
          return "Deselect current cell";
        case KeyboardAction.TOGGLE_VALIDATION:
          return "Validate / Devalidate the selected row"
        case KeyboardAction.DELETE:
          return "Delete the selected cell"
        default:
          console.error(`The Keyboard acton '${action}' has no label for the settings`);
          return "";
      }
    },
    getActionListString(key: string): string {
      const actionNames: Array<string> = this.conflictingKeyboardAssignations.get(key)!.map(a => this.getTitleByKeyboardAction(a)).map(a => '"' + a + '"');
      let str: string = actionNames[0];
      for(let index = 1; index < actionNames.length; index++) {
        str += `, ${actionNames[index]}`;
      }
      return str;
    },
    save() {
      this.vetoStore.updateAppSettings(this.cloneAppSettings(this.cachedAppSettings));
    },
    resetAppSettings() {
      this.cachedAppSettings = getDefaultSettings();
    }
  },
  computed: {
    TrimStates() {
      return TrimStates;
    },
    TrimState() {
      return TrimState;
    },
    TrimGroups() {
      return TrimGroups;
    },
    appSettings(): AppSettings {
      return this.vetoStore.appSettings;
    },
    // Returns a map which associates every key that has multiple keyboard actions associated to it to an array of those conflicting keyboard actions
    conflictingKeyboardAssignations(): Map<string, Array<KeyboardAction>> {
      const conflictingKeys: Map<string, Array<KeyboardAction>> = new Map();
      const previousKeys: Map<string, KeyboardAction> = new Map();

      for(let action in this.cachedAppSettings.keyboardActions) {
        const key: string = this.cachedAppSettings.keyboardActions[action];

        if(conflictingKeys.has(key)) {
          conflictingKeys.get(key)!.push(action as KeyboardAction)
        } else if(previousKeys.has(key)) {
          const prevAction: KeyboardAction = previousKeys.get(key)!;
          conflictingKeys.set(key, [prevAction, action as KeyboardAction]);
        } else previousKeys.set(key, action as KeyboardAction);
      }

      return conflictingKeys;
    },
    conflictingKeyboardActions(): Array<KeyboardAction> {
      const arr: Array<KeyboardAction> = [];
      this.conflictingKeyboardAssignations.forEach(k => {
        k.forEach(a => arr.push(a));
      })
      return arr;
    },
    conflictingKeys(): Map<string, string> {
      const conflictingKeys: Map<string, string> = new Map();

      for(let action in this.cachedAppSettings.keyboardActions) {
        const key: string = this.cachedAppSettings.keyboardActions[action];
        const keyboardOption = validKeys.find(k => k.key === key);

        if (this.cachedAppSettings.keepSearchFocus && keyboardOption?.conflicts) {
          if (!conflictingKeys.has(key)) {
            conflictingKeys.set(key, keyboardOption.keySymbol);
          }
        }
      }

      return conflictingKeys;
    },
    cachedSettingsValid(): boolean {
      // Ensure that all keys that are mapped to not more than one action
      return this.conflictingKeyboardAssignations.size == 0 && this.conflictingKeys.size == 0;
    },
    changesAreOnDefault(): boolean {
      return JSON.stringify(this.cachedAppSettings) === JSON.stringify(getDefaultSettings());
    }
  },
});
</script>

<style scoped>

.key-selector {
  display: grid;
  grid-template-columns: auto 30%;
}

.invalid-key-selector {
  border: 1px solid;
  border-color: red;
}

.key-conflict {
  color: red;
}

.invalid-settings-message {
  margin-bottom: 10px;
}

.invalid-settings-message .icon {
  color: red;
  margin-right: 0.3rem;
}

.dropdown-column {
  float: left;
  width: 50%;
}

/* Clear floats after the columns */
.dropdown-row:after {
  content: "";
  display: table;
  clear: both;
}
</style>
