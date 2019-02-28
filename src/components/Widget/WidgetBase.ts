import Component from 'vue-class-component';
import ItemBase from '../ItemBase';

@Component({
  props: {
    config: {
      type: Object,
      required: true,
    },
    onChangeConfig: {
      type: Function,
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars*/
      default: () => (id: string, config: Record<string, any>) => { },
    },
    pos: {
      type: Object, // XYPosition
      required: false,
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
