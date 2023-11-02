import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { createPinia, setActivePinia } from 'pinia';
import {
  Cookies,
  Dialog,
  LocalStorage,
  Meta,
  Notify,
  SessionStorage,
} from 'quasar';
import { beforeEach } from 'vitest';
import { createApp } from 'vue';

const app = createApp({});
const pinia = createPinia();
app.use(pinia);

installQuasarPlugin({
  plugins: { Cookies, Dialog, LocalStorage, Meta, Notify, SessionStorage },
});

beforeEach(() => {
  setActivePinia(pinia);
});
