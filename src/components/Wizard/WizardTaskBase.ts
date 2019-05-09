import Vue from 'vue';
import Component from 'vue-class-component';

export type WizardAction = (config: any) => Promise<void>;

// emits:
// - cancel
// - finish
// - update:config
// - update:actions
// - update:tasks

@Component({
  props: {
    config: {
      type: Object,
      required: true,
    },
    actions: {
      type: Array,
      required: true,
    },
    tasks: {
      type: Array,
      required: true,
    },
  },
})
export default class WizardTaskBase extends Vue {
  protected $q: any;

  protected get stagedConfig(): any {
    return this.$props.config;
  }

  protected get stagedActions(): WizardAction[] {
    return this.$props.actions;
  }

  protected get stagedTasks(): string[] {
    return this.$props.tasks;
  }

  protected updateConfig<T>(config: T = this.stagedConfig): void {
    this.$emit('update:config', { ...config });
  }

  protected pushAction(action: WizardAction): void {
    this.$emit('update:actions', [...this.$props.actions, action]);
  }

  protected pushActions(actions: WizardAction[]): void {
    this.$emit('update:actions', [...this.$props.actions, ...actions]);
  }

  protected pushTask(task: string): void {
    this.$emit('update:tasks', [...this.$props.tasks, task]);
  }

  protected pushTasks(tasks: string[]): void {
    this.$emit('update:tasks', [...this.$props.tasks, ...tasks]);
  }

  protected cancel(): void {
    this.$emit('cancel');
  }

  protected finish(): void {
    this.$emit('finish');
  }
}
