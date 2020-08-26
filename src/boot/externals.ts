import VueJsonPretty from 'vue-json-pretty';
import draggable from 'vuedraggable';

export default ({ Vue }): void => {
  Vue.component('draggable', draggable);
  Vue.component('vue-json-pretty', VueJsonPretty);
};
