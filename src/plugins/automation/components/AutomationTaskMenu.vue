<script lang="ts">
import { uid } from 'quasar';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { settableStates } from '../getters';
import { automationStore } from '../store';
import { AutomationStatus, AutomationTask } from '../types';


@Component
export default class AutomationTaskMenu extends Vue {
  settableStates = settableStates;

  get tasks(): AutomationTask[] {
    return automationStore.tasks;
  }

  procTitle(task: AutomationTask): string {
    return automationStore.processById(task.processId ?? null)?.title ?? '<no process>';
  }

  changeTaskStatus(task: AutomationTask, status: AutomationStatus): void {
    if (status !== task.status) {
      automationStore.saveTask({ ...task, status });
    }
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


  quickStatusIcon(task: AutomationTask): string {
    return task.status === 'Finished'
      ? 'mdi-sync'
      : 'mdi-check-all';
  }

  quickStatusValue(task: AutomationTask): AutomationStatus {
    return task.status === 'Finished'
      ? 'Active'
      : 'Finished';
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
            flat
            size="sm"
            class="self-center"
            icon="clear"
            @click="removeTask(task)"
          >
            <q-tooltip>Remove task</q-tooltip>
          </q-btn>
          <q-btn-dropdown
            split
            flat
            class="col-auto"
            :icon="quickStatusIcon(task)"
            @click="changeTaskStatus(task, quickStatusValue(task))"
          >
            <template #label>
              <q-tooltip>Mark task as {{ quickStatusValue(task) }}</q-tooltip>
            </template>
            <q-list>
              <q-item>
                <q-item-section class="fade-4 text-italic">
                  Mark task as...
                </q-item-section>
              </q-item>
              <ActionItem
                v-for="state in settableStates"
                :key="state.status"
                :label="state.status"
                :active="task.status === state.status"
                @click="changeTaskStatus(task, state.status)"
              />
            </q-list>
          </q-btn-dropdown>
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
