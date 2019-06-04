import Vue from 'vue';
import { Component } from 'vue-property-decorator';

@Component({
  props: {
    serviceId: {
      type: String,
      required: true,
    },
    blockId: {
      type: String,
      required: true,
    },
    value: {
      required: true,
    },
    editable: {
      type: Boolean,
      default: false,
    },
  },
})
export default class ValEdit extends Vue {
  public get field() {
    return this.$props.value;
  }

  public set field(val: any) {
    this.$emit('input', val);
  }

  public saveField(val: any) {
    this.$emit('input', val);
  }

  public callAndSaveField(func: (v: any) => void) {
    return (v: any) => { func(v); this.$emit('input', this.field); };
  }
}
