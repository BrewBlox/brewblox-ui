import Component from 'vue-class-component';
import ItemBase from './ItemBase';

@Component({
  props: {
    config: {
      type: Object,
      required: true,
    },
    onChangeConfig: {
      type: Function,
      default: () => (id: string, config: Object) => { },
    },
    cols: {
      type: Number,
      required: false,
    },
    rows: {
      type: Number,
      required: false,
    },
  },
})
export default class WidgetBase extends ItemBase { }
