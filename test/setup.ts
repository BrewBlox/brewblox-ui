import { config } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import {
  Cookies,
  Dialog,
  LocalStorage,
  Meta,
  Notify,
  Quasar,
  SessionStorage,
} from 'quasar';
import { beforeEach } from 'vitest';
import { createApp } from 'vue';

const app = createApp({});
const pinia = createPinia();
app.use(pinia);

// Install Quasar in every mounted component, with the plugins used by the app
config.global.plugins.push([
  Quasar,
  { plugins: { Cookies, Dialog, LocalStorage, Meta, Notify, SessionStorage } },
]);

beforeEach(() => {
  setActivePinia(pinia);
});
