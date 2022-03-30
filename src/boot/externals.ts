import { createPinia } from 'pinia';
import PortalVue from 'portal-vue';
import { boot } from 'quasar/wrappers';
import vuedraggable from 'vuedraggable';

export default boot(({ app }) => {
  app.component('VueDraggable', vuedraggable);
  app.use(PortalVue);
  app.use(createPinia());
});
