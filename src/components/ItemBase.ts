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
    title: {
      type: String,
      required: true,
    },
    volatile: {
      type: Boolean,
      default: false,
    },
    onChangeTitle: {
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
  protected $q: any; // inserted by quasar

  protected get widgetId(): string {
    return this.$props.id;
  }

  protected get widgetTitle(): string {
    return this.$props.title;
  }

  protected get displayName(): string {
    return displayNameById(this.$store, this.$props.type);
  }
}
