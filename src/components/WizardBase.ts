import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';


@Component
export default class WizardBase extends Vue {

  @Prop({ type: String, required: false })
  public readonly activeDashboardId!: string;

  public back(): void {
    this.$emit('back');
  }

  public close(): void {
    this.$emit('close');
  }

  public done(output?: any): void {
    this.$emit('done', output);
  }

  public setDialogTitle(title: string): void {
    this.$emit('title', title);
  }
}
