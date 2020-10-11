import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class FieldBase extends Vue {
  public fieldSlots = [
    'prepend',
    'append',
    'before',
    'after',
    'error',
    'hint',
    'counter',
    'loading',
  ];

  @Prop({ type: String, default: 'span' })
  public readonly tag!: string;

  @Prop({ type: String, default: 'Edit value' })
  public readonly title!: string;

  @Prop({ type: String, required: false })
  public readonly label!: string;

  @Prop({ type: String })
  public readonly message!: string;

  @Prop({ type: Boolean, default: false })
  public readonly html!: boolean;

  @Prop({ type: String, required: false })
  public readonly tooltip!: string;

  @Prop({ type: Boolean, default: false })
  public readonly readonly!: boolean;

  @Prop({ type: Object, default: () => ({}) })
  public readonly dialogProps!: Mapped<any>;

  @Prop({ type: Object, default: () => ({}) })
  public readonly tagProps!: Mapped<any>;

  @Prop({ type: [Array, Object, String], default: '' })
  public readonly tagClass!: string[] | Mapped<string> | string;

  @Prop({ type: [Array, Object, String], default: '' })
  public readonly tagStyle!: string[] | Mapped<string> | string;

  @Prop({ type: Array, default: () => [] })
  public readonly rules!: InputRule[];
}
