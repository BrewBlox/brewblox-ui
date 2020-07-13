import VueJsonPretty from 'vue-json-pretty';
import draggable from 'vuedraggable';

export default ({ Vue }): void => {
  Vue.component('draggable', draggable);
  Vue.component('VueJsonPretty', VueJsonPretty);
};
