import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class DialogEditBase extends Vue {

  @Prop({ type: String, default: 'span' })
  public readonly tag!: string;

  @Prop({ type: String, default: 'Edit value' })
  public readonly title!: string;

  @Prop({ type: String })
  public readonly message!: string;

  @Prop({ type: Object, default: () => ({}) })
  public readonly dialogProps!: Record<string, any>;

  @Prop({ type: Object, default: () => ({}) })
  public readonly tagProps!: Record<string, any>;

  @Prop({ type: [Array, Object, String] })
  public readonly tagClass!: string[] | Record<string, string> | string;
}
