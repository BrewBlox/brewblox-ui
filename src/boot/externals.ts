import { boot } from 'quasar/wrappers';
import VueJsonPretty from 'vue-json-pretty';
import draggable from 'vuedraggable';

export default boot(({ app }) => {
  app.component('Draggable', draggable);
  app.component('VueJsonPretty', VueJsonPretty);
});
