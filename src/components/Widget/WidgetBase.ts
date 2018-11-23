import { displayNameById } from '@/store/features/getters';
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
  props: {
    id: {
      type: String,
      required: true,
    },
    onIdChange: {
      type: Function,
      default: () => (id: string, newId: string) => { },
    },
    type: {
      type: String,
      required: true,
    },
    config: {
      type: Object,
      required: true,
    },
    onConfigChange: {
      type: Function,
      default: () => (id: string, config: Object) => { },
    },
    cols: {
      type: Number,
      required: true,
    },
    rows: {
      type: Number,
      required: true,
    },
  },
})
export default class WidgetBase extends Vue {
  get widgetId() {
    return this.$props.id;
  }

  set widgetId(newId: string) {
    this.$props.onIdChange(this.widgetId, newId);
  }

  get displayName() {
    return displayNameById(this.$store, this.$props.type);
  }
}
