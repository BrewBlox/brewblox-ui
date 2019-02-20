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
  },
})
export default class WizardTaskMaster extends Vue {
  $q: any;
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

  executePrepared() {
    Promise
      .all(this.actions.map(func => () => func(this.$store, this.config)))
      .then(() => {
        this.$q.notify({ type: 'positive', message: `Done!` });
        this.close();
      })
      .catch((e) => this.$q.notify(`Failed to execute actions: ${e.message()}`));
  }

  created() {
    this.tasks = [...this.$props.initialTasks];
    this.nextTask();
  }

  close() {
    this.$emit('close');
  }
}
</script>

<template>
  <div class="widget-modal">
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
