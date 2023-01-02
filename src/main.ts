import '@/css/app.sass';
import builder from '@/plugins/builder';
import history from '@/plugins/history';
import misc from '@/plugins/misc';
import quickstart from '@/plugins/quickstart';
import spark from '@/plugins/spark';
import tilt from '@/plugins/tilt';
import wizardry from '@/plugins/wizardry';
import router from '@/router';
import { startup } from '@/startup';
import { useDashboardStore } from '@/store/dashboards';
import { useServiceStore } from '@/store/services';
import { useSidebarStore } from '@/store/sidebar';
import { useSystemStore } from '@/store/system';
import { useWidgetStore } from '@/store/widgets';
import { DenseKey, NowKey, TouchKey } from '@/symbols';
import { globRegister } from '@/utils/component-ref';
import '@quasar/extras/material-icons/material-icons.css';
import '@quasar/extras/mdi-v4/mdi-v4.css';
import '@quasar/extras/roboto-font/roboto-font.css';
import { createPinia } from 'pinia';
import PortalVue from 'portal-vue';
import {
  Cookies,
  Dialog,
  LocalStorage,
  Meta,
  Notify,
  Quasar,
  QuasarPluginOptions,
  Screen,
  SessionStorage,
} from 'quasar';
import { computed, createApp, ref } from 'vue';
import vuedraggable from 'vuedraggable';
// Assumes your root component is App.vue
// and placed in same folder as main.js
import App from './App.vue';

const quasarOpts: Partial<QuasarPluginOptions> = {
  plugins: {
    Cookies,
    Dialog,
    LocalStorage,
    Meta,
    Notify,
    SessionStorage,
  },

  config: {
    dark: true,
    notify: { message: '', color: 'info' },
    brand: {
      dark: '#282c34',
      'dark-bright': '#454c59',
    },
  },
};

const app = createApp(App);

// External components
app.component('VueDraggable', vuedraggable);

// External plugins
app.use(PortalVue);
app.use(createPinia());
app.use(Quasar, quasarOpts);

// Local plugins
app.use(router);
app.use(wizardry);
app.use(history);
app.use(spark);
app.use(tilt);
app.use(builder);
app.use(quickstart);
app.use(misc);

// Local components
globRegister(app, import.meta.glob('./components/**/*.vue', { eager: true }));

// Register objects that require a post-startup callback
startup.add(useSystemStore());
startup.add(useServiceStore());
startup.add(useDashboardStore());
startup.add(useWidgetStore());
startup.add(useSidebarStore());

// Global values
const dense = computed<boolean>(() => Screen.lt.md);
const touch = ref<boolean>(document.body.classList.contains('touch'));
const now = ref<Date>(new Date());
setInterval(() => (now.value = new Date()), 10 * 1000);

// Provide globals to all components
app.provide(DenseKey, dense);
app.provide(TouchKey, touch);
app.provide(NowKey, now);

// You must have a <div id="q-app"></div> in your index.html
app.mount('#q-app');
