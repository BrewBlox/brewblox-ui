import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';

@Component
export default class ValEdit extends Vue {
  @Prop({ type: String, required: true })
  public readonly serviceId!: string;

  @Prop({ type: String, required: true })
  public readonly blockId!: string;

  @Prop({ type: Boolean, default: false })
  public readonly editable!: boolean;

  @Prop({ required: true })
  public readonly value!: any;

  @Emit('input')
  public saveField(val: any) {
    return val;
  }

  public get field() {
    return this.value;
  }

  public set field(val: any) {
    this.saveField(val);
  }

  public callAndSaveField(func: (v: any) => void) {
    return (v: any) => { func(v); this.saveField(this.field); };
  }
}
