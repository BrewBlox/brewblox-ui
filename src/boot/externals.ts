import VueSplit from 'vue-split-panel';
import draggable from 'vuedraggable';


export default ({ Vue }): void => {
  Vue.component('draggable', draggable);
  Vue.use(VueSplit);
};
