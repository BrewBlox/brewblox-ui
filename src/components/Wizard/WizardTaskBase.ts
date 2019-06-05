import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';

export type WizardAction = (config: any) => Promise<void>;

@Component
export default class WizardTaskBase extends Vue {

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
  protected cancel(): void { }

  @Emit()
  protected finish(): void { }
}
