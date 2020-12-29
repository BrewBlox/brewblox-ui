import Vue from 'vue';
import { Component, Prop, Ref, Watch } from 'vue-property-decorator';

import { WidgetContext } from '@/store/features';

@Component
export default class DialogBase extends Vue {
  public readonly _uid!: number;

  public dialogProps = {
    noRouteDismiss: true,
    noBackdropDismiss: true,
  };

  @Ref()
  public readonly dialog!: any;

  @Prop({ type: String, default: '' })
  public readonly title!: string;

  @Prop({ type: String, default: '' })
  public readonly message!: string;

  @Prop({ type: Boolean, default: false })
  public readonly html!: boolean;

  @Watch('$route')
  public async onRouteChange(): Promise<void> {
    await this.$nextTick();
    if (!this.$route.hash.includes(this.hashId)) {
      this.hide();
    }
  }

  public get hashId(): string {
    return `.${this._uid}.`;
  }

  public created(): void {
    const hash = `${this.$route.hash}${this.hashId}`;
    this.$router
      .push({ hash })
      .catch(() => { });
  }

  public beforeDestroy(): void {
    const { hash } = this.$route;

    if (hash.endsWith(this.hashId)) {
      this.$router.back();
    }
    else if (hash.includes(this.hashId)) {
      this.$router.replace({ hash: hash.replaceAll(this.hashId, '') });
    }
  }

  public get context(): WidgetContext {
    return {
      container: 'Dialog',
      size: 'Fixed',
      mode: 'Basic',
    };
  }

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
