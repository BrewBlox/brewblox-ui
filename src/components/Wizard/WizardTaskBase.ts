import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';

export type WizardAction = (config: any) => Promise<void>;

@Component
export default class WizardTaskBase extends Vue {
  public busyExecuting: boolean = false;

  @Prop({ type: Object, required: true })
  protected readonly config!: any;

  @Prop({ type: Array, required: true })
  protected readonly actions!: WizardAction[];

  @Prop({ type: Array, required: true })
  protected readonly tasks!: string[];

  @Emit('update:config')
  protected updateConfig<T>(config: T = this.config): T {
    return { ...config };
  }

  @Emit('update:actions')
  protected pushAction(action: WizardAction): WizardAction[] {
    return [...this.actions, action];
  }

  @Emit('update:actions')
  protected pushActions(actions: WizardAction[]): WizardAction[] {
    return [...this.actions, ...actions];
  }

  @Emit('update:tasks')
  protected pushTask(task: string): string[] {
    return [...this.tasks, task];
  }

  @Emit('update:tasks')
  protected pushTasks(tasks: string[]): string[] {
    return [...this.tasks, ...tasks];
  }

  @Emit()
  protected back(): void { }

  @Emit()
  public next(): void { }

  @Emit()
  protected cancel(): void { }

  @Emit()
  protected finish(): void { }

  public async executePrepared() {
    try {
      // We're intentionally waiting for each async function
      // Actions may be async, but may have dependencies
      this.busyExecuting = true;
      for (let func of this.actions) {
        await func(this.config);
      }
      this.$q.notify({
        color: 'positive',
        icon: 'mdi-check-all',
        message: 'Done!',
      });
    } catch (e) {
      this.$q.notify({
        color: 'negative',
        icon: 'error',
        message: `Failed to execute actions: ${e.message}`,
      });
    }
    this.busyExecuting = false;
  }
}
