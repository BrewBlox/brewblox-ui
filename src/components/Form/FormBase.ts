import Component from 'vue-class-component';
import ItemBase from '../ItemBase';

@Component({
  props: {
    field: {
      type: Object,
      required: true,
    },
    onChangeField: {
      type: Function,
      required: false,
    },
    embedded: {
      type: Boolean,
      default: false,
    },
  },
})
export default class FormBase extends ItemBase { }
