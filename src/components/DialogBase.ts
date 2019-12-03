import Vue from 'vue';
import { Component, Prop, Ref } from 'vue-property-decorator';


@Component
export default class DialogBase extends Vue {
  @Ref()
  public readonly dialog!: any;

  @Prop({ type: String, default: '' })
  public readonly title!: string;

  @Prop({ type: String, default: '' })
  public readonly message!: string;

  @Prop({ type: Boolean, default: false })
  public readonly html!: boolean;

  // following method is REQUIRED
  // (don't change its name --> "show")
  public show(): void {
    this.dialog.show();
  }

  // following method is REQUIRED
  // (don't change its name --> "hide")
  public hide(): void {
    this.dialog.hide();
  }

  public onDialogHide(): void {
    // required to be emitted
    // when QDialog emits "hide" event
    this.$emit('hide');
  }

  public onDialogOk(...arg: any[]): void {
    // on OK, it is REQUIRED to
    // emit "ok" event (with optional payload)
    // before hiding the QDialog
    this.$emit('ok', ...arg);

    // then hiding dialog
    this.hide();
  }

  public onDialogCancel(): void {
    // we just need to hide dialog
    this.hide();
  }
}
