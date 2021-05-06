import { boot } from 'quasar/wrappers';
import draggable from 'vuedraggable';

export default boot(({ app }) => {
  app.component('Draggable', draggable);
});
