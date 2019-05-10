<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { WizardAction } from '@/components/Wizard/WizardTaskBase';


@Component({
  props: {
    initialTasks: {
      type: Array,
      required: true,
    },
    initialConfig: {
      type: Object,
      default: () => ({}),
    },
  },
})
export default class WizardTaskMaster extends Vue {
  busyExecuting: boolean = false;
  config: any = {};
  actions: WizardAction[] = [];
  tasks: string[] = [];

  currentTask: string | null = null;

  nextTask() {
    this.currentTask = this.tasks.pop() || null;
    if (!this.currentTask) {
      this.executePrepared();
    }
  }

  async executePrepared() {
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
    this.close();
  }

  created() {
    this.tasks = [...this.$props.initialTasks];
    this.config = { ...this.$props.initialConfig };
    this.nextTask();
  }

  close() {
    this.$emit('close');
  }
}
</script>

<template>
  <div>
    <div v-if="busyExecuting" style="width: 100%; height: 400px;">
      <q-spinner :size="50" class="absolute-center"/>
    </div>
    <component
      v-if="currentTask"
      :is="currentTask"
      :config.sync="config"
      :actions.sync="actions"
      :tasks.sync="tasks"
      @finish="nextTask"
      @cancel="close"
    />
  </div>
</template>
