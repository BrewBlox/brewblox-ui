import { Component, Prop } from 'vue-property-decorator';

import ItemBase from '../ItemBase';

@Component
export default class FormBase extends ItemBase {
  @Prop({ type: Boolean, default: false })
  public readonly embedded!: boolean;
}
