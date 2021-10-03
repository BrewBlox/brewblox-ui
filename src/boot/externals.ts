import { createPinia } from 'pinia';
import PortalVue from 'portal-vue';
import { boot } from 'quasar/wrappers';
import draggable from 'vuedraggable';

export default boot(({ app }) => {
  app.component('Draggable', draggable);
  app.use(PortalVue);
  app.use(createPinia());
});
