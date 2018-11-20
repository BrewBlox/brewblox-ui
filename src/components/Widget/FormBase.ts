import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
  props: {
    field: {
      type: Object,
      required: true,
    },
    change: {
      type: Function,
      required: true,
    },
  },
})
export default class FormBase extends Vue {
  cancelChanges() {
    // Should be overridden by child class
  }

  confirmChanges() {
    // Should be overridden by child class
  }

  created() {
    this.cancelChanges();
  }
}
