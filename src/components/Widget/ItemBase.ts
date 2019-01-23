import { displayNameById } from '@/store/features/getters';
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
  props: {
    type: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    onChangeId: {
      type: Function,
      required: false,
    },
    onDelete: {
      type: Function,
      required: false,
    },
    onCopy: {
      type: Function,
      required: false,
    },
    onMove: {
      type: Function,
      required: false,
    },
  },
})
export default class ItemBase extends Vue {
  $q: any;

  get widgetId() {
    return this.$props.id;
  }

  get displayName() {
    return displayNameById(this.$store, this.$props.type);
  }
}
