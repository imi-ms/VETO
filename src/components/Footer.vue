<template>
  <Popup ref="aboutPopup" id="AboutPopupModal" header="Imprint" width="30%" :hide-close-button="true">
    <template #popup-body>

      <p>
        University of Münster<br/>
        Faculty of Medicine<br/>
        Albert-Schweitzer-Campus 1, Bldg. D3<br/>
        Tel.: +49 251 83 52263<br/>
        Fax: +49 251 83 55004<br/>
        E-Mail: <a href="mailto:dekanmed@ukmuenster.de">dekanmed@ukmuenster.de</a>
      </p>

      <p>
        The Medical Faculty is an institution of the University of Münster.
        The University of Münster is a public corporation and, at the same time, an institution of the state of North
        Rhine-Westphalia.
        It is represented by its Rector, Prof. Dr. Susanne Menzel-Riedl.
      </p>

      <p>
        <b>Responsible supervisory authority:</b><br/>
        Ministerium für Kultur und Wissenschaft des Landes Nordrhein-Westfalen<br/>
        Völklinger Straße 49<br/>
        40221 Düsseldorf<br/>
      </p>

      <p><b>VAT identification number: DE 126118759</b></p>

      <p>
        Editorially responsible according to § 55 Abs. 2 (Interstate Broadcasting Agreement, RStV):<br/>
        Dean of the Faculty of Medicine<br/>
        University of Münster<br/>
        Prof. Dr. Frank Ulrich Müller<br/>
        Tel.: +49 251 83 52263<br/>
        Fax: +49 251 83 55004<br/>
        E-Mail: <a href="mailto:dekanmed@ukmuenster.de">dekanmed@ukmuenster.de</a><br/>
        Albert-Schweitzer-Campus 1, Geb. D3<br/>
        48149 Münster
      </p>

      <p>
        This legal notice applies to the information provided on the central website managed by the administration and
        Rectorate of the University of Münster which is accessible via the URL
        <a href="https://www.uni-muenster.de">www.uni-muenster.de</a> and is designated by "© University of Münster".
        The editorial responsibility for all the other pages on this Internet server lies with the offices or persons
        who have created and published the respective pages.
      </p>
    </template>
  </Popup>
  <footer class="veto-background-highlight border-top border-1 veto-footer">
    <div id="footer-flexbox">
      <div class="centered footer-col footer-col-left">
        <div class="footer-logo-wrap">
          <img v-if="isDarkMode" src="@/assets/IMI-Logo-white-eng.png" class="logo footer-logo" alt="IMI-Logo">
          <img v-else src="@/assets/IMI-Logo-grad-eng.png" class="logo footer-logo" alt="IMI-Logo">
        </div>
        <span class="ms-1 copyright-top">
          <span class="me-1">&copy;</span>
          <span v-text="copyrightText"/>
        </span>
      </div>
      <div class="text-center footer-col footer-col-version">
        Version: {{ appVersion }}
      </div>
      <div class="text-end footer-col footer-col-right">
        <button id="imprint" class="veto-nav-button" @click="showAboutPopup()">Imprint</button>
      </div>
      <div class="footer-mobile-row">
        <span class="copyright-bottom">
          <span class="me-1">&copy;</span>
          <span v-text="copyrightText"/>
        </span>
      </div>
    </div>
  </footer>
</template>

<script lang="ts">
import { useVetoStore } from "@/store";
import {defineComponent} from "vue";
import Popup from "@/components/Popup.vue";

export default defineComponent({
  name: "Footer",
  components: {
    Popup
  },
  data() {
    const store = useVetoStore();
    return {
      appVersion: APP_VERSION,
      vetoStore: store,
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
    },
    isDarkMode(): boolean {
      return this.vetoStore.appSettings.vetoColorScheme === "DARK";
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

  .veto-footer {
    align-items: center;
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--veto-color-background-highlight) 92%, #ffffff 8%) 0%,
      color-mix(in srgb, var(--veto-color-background-highlight) 78%, var(--veto-color-background) 22%) 100%
    );
    border-top-color: var(--veto-color-border) !important;
    box-shadow: 0 -8px 24px -22px rgba(15, 23, 42, 0.65);
    display: flex;
    height: 3.18rem;
    padding: 0 !important;
  }

  .footer-col {
    align-items: center;
    display: flex;
    width: calc(100% * (2 / 5));
  }

  .footer-col-version {
    align-items: center;
    color: var(--veto-color-font-highlight);
    display: flex;
    font-size: 0.9rem;
    font-weight: 600;
    height: 2.05rem;
    justify-content: center;
    line-height: 1;
    max-width: 8rem;
    width: calc(100% * (1 / 5));
  }

  .footer-col-right {
    align-items: center;
    display: flex;
    justify-content: flex-end;
    line-height: 1;
  }
  @media screen and (max-width: 500px) {
    .centered {
      flex-wrap: wrap;
    }
  }

  .copyright-top {
    align-items: center;
    display: inline-flex;
    height: 2.05rem;
    line-height: 1;
  }

  .copyright-bottom {
    align-items: center;
    display: inline-flex;
    height: 2.05rem;
    line-height: 1;
    margin-left: auto;
    margin-right: auto;
    width: fit-content;
    display: none;
  }

  .footer-mobile-row {
    display: none;
    width: 100%;
  }

  @media screen and (max-width: 727px) {
    .veto-footer {
      height: auto;
      min-height: 3.18rem;
    }
    .copyright-top {
      display: none;
    }
    .footer-mobile-row {
      display: block;
    }
    .copyright-bottom {
      display: inline-flex;
    }
  }

  .footer-logo-wrap {
    overflow: hidden;
    min-width: fit-content;
  }

  .footer-logo {
    display: block;
    height: 2.56rem;
    margin-top: -0.14rem;
    width: auto;
    object-fit: contain;
  }

  #footer-flexbox {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: center;
    min-height: 100%;
    width: 100%;
    padding-left: 12px;
    padding-right: 12px;
  }

  @media screen and (max-width: 727px) {
    #footer-flexbox {
      flex-wrap: wrap;
    }
  }

</style>
