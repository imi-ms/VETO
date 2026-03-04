import { createApp } from 'vue'
import App from './App.vue'
import VuePapaParse from 'vue-papa-parse'
import { Multiselect } from 'vue-multiselect';
import {createPinia} from "pinia"

import {library} from "@fortawesome/fontawesome-svg-core"
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome"
import {
    faAlignCenter,
    faAlignJustify,
    faAlignLeft,
    faAlignRight,
    faArrowDown19,
    faArrowDownShortWide,
    faArrowDownAZ,
    faArrowsLeftRightToLine,
    faCheck,
    faCircleArrowDown,
    faCircleArrowLeft,
    faCircleArrowRight,
    faCircleArrowUp,
    faCircleExclamation,
    faCircleQuestion,
    faFilter,
    faGear,
    faList,
    faMagnifyingGlass,
    faPlus,
    faShare,
    faTextHeight,
    faRotateLeft,
    faXmark,
    faSquare,
    faTrash
} from "@fortawesome/free-solid-svg-icons"
import { faCreativeCommonsZero } from "@fortawesome/free-brands-svg-icons"

library.add(
    faAlignCenter,
    faAlignJustify,
    faAlignLeft,
    faAlignRight,
    faArrowDown19,
    faArrowDownShortWide,
    faArrowDownAZ,
    faArrowsLeftRightToLine,
    faCheck,
    faCircleArrowDown,
    faCircleArrowLeft,
    faCircleArrowRight,
    faCircleArrowUp,
    faCircleExclamation,
    faCircleQuestion,
    faFilter,
    faGear,
    faList,
    faMagnifyingGlass,
    faPlus,
    faShare,
    faTextHeight,
    faRotateLeft,
    faXmark,
    faSquare,
    faTrash,

    faCreativeCommonsZero,
)

import 'bootstrap/dist/css/bootstrap.min.css'
import "vue-multiselect/dist/vue-multiselect.css";
import './assets/css/style.css'
import './assets/css/veto-buttons.css'
import './assets/css/veto-colors.css'
import './assets/css/veto-container.css'
import './assets/css/veto-inputs.css'
import './assets/css/veto-sizes.css'

import '@/assets/css/json-highlighting.css';
import hljs from 'highlight.js/lib/core';
import jsonHighlight from 'highlight.js/lib/languages/javascript';
import hljsVuePlugin from "@highlightjs/vue-plugin";

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(hljsVuePlugin)

hljs.registerLanguage('json', jsonHighlight);
app.use(VuePapaParse)

app.component('Multiselect', Multiselect)
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')
