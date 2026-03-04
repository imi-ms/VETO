<template>
  <div :id='id' class="modal fade" :style="'z-index: ' + zIndex + ';'" tabindex="-1">
    <div class="modal-dialog" :style="'overflow-y: initial !important; min-width: ' + width + ';'">
      <div class="modal-content">
        <div class="modal-header veto-background-highlight">
          <h3 class="m-auto">{{header}}</h3>
        </div>
        <div class="modal-body veto-background" style="max-height: 75vh; overflow-y: auto;">
          <slot name="popup-body" />
        </div>
        <div class="modal-footer veto-background-highlight">
          <slot name="popup-footer" />

          <div class="veto-action-button">
            <button v-if="actionButtonVisible" type="button" class="veto-size-fit veto-neutral" @click="$emit('action')" :disabled="actionButtonDisabled">
              {{ actionButtonLabel }}
            </button>
          </div>

          <div class="veto-container-row-r">
            <span class="veto-container-item veto-action-button">
              <button type="button" class="veto-neutral veto-size-fit"
                      :style="'display:' + (hideCloseButton ? 'none' : 'block')"
                      data-bs-dismiss="modal"
                      @click="$emit('discard')">Discard
              </button>
            </span>
            <span class="veto-container-item veto-action-button">
              <button v-if="!hideConfirmButton" type="button" class="veto-neutral veto-size-fit" :data-bs-dismiss="confirmButtonClosing ? 'modal' : false"
                     @click="$emit('confirm')" :disabled="confirmButtonDisabled"> {{ confirmButtonLabel }}
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
// @ts-ignore
import {Modal} from "bootstrap";

export default defineComponent({
  name: "Popup",
  props: {
    actionButtonLabel: {
      default: "Action",
      type: String,
    },
    actionButtonVisible: {
      default: false,
      type: Boolean
    },
    actionButtonDisabled: {
      default: false,
      type: Boolean,
    },
    confirmButtonDisabled: {
      default: false,
      type: Boolean,
    },
    confirmButtonLabel: {
      default: "Confirm",
      type: String,
    },
    confirmButtonClosing: {
      default: true,
      type: Boolean,
    },
    enableClose: {
      default: false,
      type: Boolean,
    },
    header: {
      type: String,
    },
    hideCloseButton: {
      default: false,
      type: Boolean,
    },
    hideConfirmButton: {
      default: false,
      type: Boolean,
    },
    id: {
      default: "popup",
      type: String,
    },
    width: {
      default: "80%",
      type: String,
    },
    zIndex: {
      default: 1055,
      type: Number,
    },
  },
  emits: ['action', 'close', 'confirm', 'discard'],
  data() {
    return {
      modal: Modal,
    }
  },
  mounted() {
    document.getElementById(this.id)!!.addEventListener("hidden.bs.modal", event => {
      const abc = (document.querySelector(".modal-backdrop") as HTMLElement);
      if (abc) {
        abc.style.zIndex = "1000";
      }
      this.$emit('close');
    });
  },
  methods: {
    close() {
      this.modal.hide();
    },
    open() {
      const options = {
        backdrop: this.enableClose ? true : 'static',
        keyboard: true,
      };
      this.modal = new Modal(document.getElementById(this.id), options);
      this.modal.show();

      document.getElementsByClassName("modal-backdrop")[0].style.zIndex = this.zIndex - 1;
    },
  }
});
</script>
