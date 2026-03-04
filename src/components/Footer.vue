<template>
  <Popup ref="aboutPopup" id="AboutPopupModal" header="About" width="30%" :hide-close-button="true">
    <template #popup-body>
      Universität Münster<br>
      Schlossplatz 2, 48149 Münster<br>
      Telephone: +49 (251) 83-0<br>
      Fax: +49 (251) 83-3 20 90<br>
      E-mail: <a href="mailto:verwaltung@uni-muenster.de">verwaltung@uni-muenster.de</a><br>
      <br>
      The University of Münster is a statutory body and an institution of the Land of North Rhine-Westphalia. It is represented by the Rector, Professor Dr. Johannes Wessels.<br>
      <br>
      Turnover tax identification number: DE 126118759<br>
      <br>
      Edited in accordance with §5 TMG by:<br>
      Prof. Dr. Dominik Heider<br>
      Institute of Medical Informatics<br>
      Albert-Schweizer-Campus 1, Building A11<br>
      48149 Münster, Germany<br>
      Telephone: +49 (251) 83-55262<br>
      E-mail: <a href="mailto:imi@uni-muenster.de">imi@uni-muenster.de</a>
    </template>
  </Popup>
  <footer class="veto-background-highlight border-top border-3 p-1" style="display: block; padding-bottom: 20px;">
    <div id="footer-flexbox">
      <div class="centered" style="width: calc(100% * (2/5));">
        <div >
          <img src="@/assets/imi-logo.png" class="logo" alt="IMI-Logo">
        </div>
        <span class="ms-1 copyright-top">
          <span class="me-1">&copy;</span>
          <span v-text="copyrightText"/>
        </span>
      </div>
      <div class="text-center" style="width: calc(100% * (1/5)); max-width: 8rem;">
        Version: {{ appVersion }}
      </div>
      <div class="text-end" style="width: calc(100% * (2/5));">
        <span class="veto-nav-item" v-on:click="showAboutPopup()"><a  id="imprint" href="#">Imprint</a></span>
      </div>
      <div style="width: 100%;">
        <span class="copyright-bottom">
          <span class="me-1">&copy;</span>
          <span v-text="copyrightText"/>
        </span>
      </div>
    </div>
  </footer>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import Popup from "@/components/Popup.vue";

export default defineComponent({
  name: "Footer",
  components: {
    Popup
  },
  data() {
    return {
      appVersion: APP_VERSION,
    }
  },
  methods: {
    showAboutPopup(){
      (this.$refs['aboutPopup'] as typeof Popup).open();
    },
  },
  computed: {
    copyrightText: function() {
      return `2023 - ${new Date().getFullYear()} Institute of Medical Informatics, University of Münster`
    }
  },
});
</script>

<style scoped>
  .centered {
    height: 100%;
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
  }
  @media screen and (max-width: 500px) {
    .centered {
      flex-wrap: wrap;
    }
  }

  .copyright-top {
    display: block;
  }

  .copyright-bottom {
    margin-left: auto;
    margin-right: auto;
    width: fit-content;
    display: none;
  }

  @media screen and (max-width: 727px) {
    .copyright-top {
      display: none;
    }
    .copyright-bottom {
      display: block;
    }
  }

  img {
    width: 100px;
    height: auto;
    object-fit: contain;
  }

  #footer-flexbox {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    padding-left: 12px;
    padding-right: 12px;
  }

  #imprint {
    text-decoration: none;
    color: var(--veto-color-font);
    font-size: 2em;
    font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
    opacity: 0.6;
  }

</style>
