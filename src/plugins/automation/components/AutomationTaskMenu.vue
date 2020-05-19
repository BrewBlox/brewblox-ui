<script lang="ts">
import { uid } from 'quasar';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { AutomationStatus, AutomationTask } from '../shared-types';
import { automationStore } from '../store';


@Component
export default class AutomationTaskMenu extends Vue {

  get tasks(): AutomationTask[] {
    return automationStore.tasks;
  }

  procTitle(task: AutomationTask): string {
    return automationStore.processById(task.processId ?? null)?.title ?? '<no process>';
  }

  changeTaskStatus(task: AutomationTask, status: AutomationStatus): void {
    automationStore.saveTask({ ...task, status });
  }

  add(): void {
    automationStore.createTask({
      id: uid(),
      ref: 'user',
      status: 'Created',
      createdBy: 'User',
      title: 'User task',
      message: 'Hello I am task',
    });
  }

  removeTask(task: AutomationTask): void {
    automationStore.removeTask(task);
  }
}
</script>

<template>
  <q-menu content-class="bordered">
    <q-scroll-area class="menu-area">
      <div class="q-gutter-sm q-pa-sm">
        <div class="text-h6 text-secondary">
          Automation tasks
        </div>
        <div v-if="tasks.length === 0">
          No tasks
        </div>
        <div v-for="task in tasks" :key="task.id" class="row q-gutter-x-sm">
          <div class="col-grow q-item--dark">
            <q-item-label caption>
              {{ procTitle(task) }}
            </q-item-label>
            {{ task.title }}
          </div>
          <q-btn
            v-if="task.createdBy === 'User'"
            round
            outline
            size="sm"
            class="self-center"
            icon="clear"
            @click="removeTask(task)"
          >
            <q-tooltip>Remove task</q-tooltip>
          </q-btn>
          <q-btn
            v-if="task.status === 'Finished'"
            round
            outline
            size="sm"
            class="self-center"
            icon="mdi-sync"
            @click="changeTaskStatus(task, 'Active')"
          >
            <q-tooltip>Mark task as active</q-tooltip>
          </q-btn>
          <q-btn
            v-else
            round
            outline
            size="sm"
            class="self-center"
            icon="mdi-check"
            @click="changeTaskStatus(task, 'Finished')"
          >
            <q-tooltip>Mark task as finished</q-tooltip>
          </q-btn>
        </div>
      </div>
    </q-scroll-area>
    <div class="row justify-end q-pa-sm">
      <q-btn
        flat
        dense
        color="secondary"
        icon="add"
        label="New task"
        @click="add"
      />
    </div>
  </q-menu>
</template>

<style lang="sass" scoped>
.menu-area
  height: 500px
  max-height: 60vh
  min-width: 250px
</style>
