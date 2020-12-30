import { QDialog } from 'quasar';
import Vue from 'vue';
import { Component, Prop, Ref } from 'vue-property-decorator';

import { WidgetContext } from '@/store/features';

@Component
export default class DialogBase extends Vue {
  public readonly _uid!: number;

  // These must be included as q-dialog props
  // If `noRouteDismiss` is not set, the dialog will disappear immediately
  public dialogProps = {
    noRouteDismiss: true,
    noBackdropDismiss: true,
  };

  @Ref()
  public readonly dialog!: QDialog;

  @Prop({ type: String, default: '' })
  public readonly title!: string;

  @Prop({ type: String, default: '' })
  public readonly message!: string;

  @Prop({ type: Boolean, default: false })
  public readonly html!: boolean;

  public get hashId(): string {
    return `.${this._uid}.`;
  }

  public created(): void {
    this.setupRouteHash();
  }

  public beforeDestroy(): void {
    this.teardownRouteHash();
  }

  public get context(): WidgetContext {
    return {
      container: 'Dialog',
      size: 'Fixed',
      mode: 'Basic',
    };
  }

  // We want the dialog to be part of the navigation stack.
  // This lets mobile users close dialogs by using the back button.
  // This requires two actions on startup:
  // - Push a new page with unique ID in hash when dialog opens.
  // - If back button is pressed, the ID disappears from hash -> close dialog.
  private async setupRouteHash(): Promise<void> {
    const hash = `${this.$route.hash}${this.hashId}`;
    await this.$router
      .push({ hash })
      .catch(() => { });
    await this.$nextTick();
    this.$watch('$route', (newRoute: DialogBase['$route']) => {
      if (!newRoute.hash.includes(this.hashId)) {
        this.hide();
      }
    });
  }

  // Dialogs can be closed manually, or by using the back button.
  // If closed manually, we need to clean up the current route.
  // Dialogs are not guaranteed to be closed in a LIFO order.
  private teardownRouteHash(): void {
    const { hash } = this.$route;

    if (hash.endsWith(this.hashId)) {
      // Dialog was last to be opened - we can go back to undo the stack push.
      this.$router.back();
    }
    else if (hash.includes(this.hashId)) {
      // Dialog was not last to be opened.
      // We want to clear the dialog ID,
      // but can't remove a page from the middle of the navigation stack.
      // This means we'll have a bit of junk left on the stack after last dialog is closed.
      // It's not optimal, but usually won't be noticed by users.
      //
      // Ideally, we'd want to remove duplicate pages from the navigation stack,
      // but for security/privacy reasons we can't inspect the stack before calling `router.back()`.
      this.$router.replace({ hash: hash.replaceAll(this.hashId, '') });
    }
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
