<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useContext } from '@/composables';
import { HOST } from '@/const';
import { findById } from '@/utils/collections';
import { createDialog } from '@/utils/dialog';
import { shortDateString } from '@/utils/quantity';

import AutomationInfoDialog from './AutomationInfoDialog.vue';
import AutomationJumpDialog from './AutomationJumpDialog.vue';
import { settableStates } from './const';
import { useAutomationStore } from './store';
import {
  AutomationProcess,
  AutomationStatus,
  AutomationStepResult,
  AutomationTask,
  AutomationTemplate,
} from './types';

interface ProcessDisplay {
  proc: AutomationProcess;
  status: string;
  history: string;
  tasks: AutomationTask[];
  error: string | null;
}

export default defineComponent({
  name: 'AutomationWidget',
  setup() {
    const automationStore = useAutomationStore();
    const { context } = useContext.setup();

    const automationAvailable = computed<boolean>(
      () => automationStore.available,
    );

    const templates = computed<AutomationTemplate[]>(
      () => automationStore.templates,
    );

    const tasks = computed<AutomationTask[]>(() => automationStore.tasks);

    function processHistory(proc: AutomationProcess): AutomationStepResult[] {
      return [...proc.results].reverse().slice(0, 10);
    }

    function resultStatus(
      proc: AutomationProcess,
      res: AutomationStepResult | undefined,
    ): string {
      if (!res) {
        return 'No results yet';
      }
      const step = proc.steps.find((v) => v.id === res.stepId);
      if (!step) {
        return 'No associated step';
      }
      return `Step ${step.title} is in the ${
        res.phase
      } phase since ${shortDateString(res.date)}.`;
    }

    function historyStatus(
      proc: AutomationProcess,
      results: AutomationStepResult[],
    ): string {
      const stepTitle = (id: string | null): string =>
        findById(proc.steps, id)?.title ?? 'Unknown';
      return results
        .reverse()
        .map(
          (res) =>
            `${shortDateString(res.date)} | ${stepTitle(res.stepId)} | ${
              res.phase
            } ${res.error ?? ''}`,
        )
        .join('\n');
    }

    const processes = computed<ProcessDisplay[]>(() =>
      automationStore.processes.map((proc) => {
        const recent: AutomationStepResult[] = processHistory(proc);
        return {
          proc,
          status: resultStatus(proc, recent[0]),
          history: historyStatus(proc, recent),
          tasks: automationStore.tasks.filter((v) => v.processId === proc.id),
          error: null,
        };
      }),
    );

    function startEditor(): void {
      window.open(`${HOST}/automation-ui`, '_blank');
    }

    function init(template: AutomationTemplate): void {
      automationStore.initProcess(template);
    }

    function edit(template: AutomationTemplate): void {
      window.open(`${HOST}/automation-ui/${template.id}`, '_blank');
    }

    function show(value: AutomationTemplate | AutomationProcess): void {
      createDialog({
        component: AutomationInfoDialog,
        componentProps: {
          modelValue: value,
          title: `Automation process '${value.title}'`,
          message: 'A running process is not editable.',
          initialStepId:
            'results' in value
              ? value.results[value.results.length - 1]?.stepId
              : null,
        },
      });
    }

    function jump(proc: AutomationProcess): void {
      const processId = proc.id;
      createDialog({
        component: AutomationJumpDialog,
        componentProps: {
          processId,
        },
      }).onOk((stepId) => automationStore.jumpProcess({ processId, stepId }));
    }

    function removeProcess(proc: AutomationProcess): void {
      automationStore.removeProcess(proc);
    }

    function quickStatusIcon(task: AutomationTask): string {
      return task.status === 'Finished' ? 'mdi-sync' : 'mdi-check-all';
    }

    function quickStatusValue(task: AutomationTask): AutomationStatus {
      return task.status === 'Finished' ? 'Active' : 'Finished';
    }

    function changeTaskStatus(
      task: AutomationTask,
      status: AutomationStatus,
    ): void {
      if (status !== task.status) {
        automationStore.saveTask({ ...task, status });
      }
    }

    function removeTask(task: AutomationTask): void {
      automationStore.removeTask(task);
    }

    return {
      settableStates,
      context,
      automationAvailable,
      templates,
      tasks,
      processes,
      startEditor,
      init,
      edit,
      show,
      jump,
      removeProcess,
      quickStatusIcon,
      quickStatusValue,
      changeTaskStatus,
      removeTask,
    };
  },
});
</script>

<template>
  <Card>
    <template #toolbar>
      <WidgetToolbar>
        <template #actions>
          <ActionItem
            icon="settings"
            label="Editor"
            @click="startEditor"
          />
        </template>
      </WidgetToolbar>
    </template>

    <div class="widget-body column">
      <CardWarning v-if="!automationAvailable">
        <template #message> No automation service detected. </template>
      </CardWarning>
      <div class="col-grow text-h6 text-secondary">
        Running processes
        <q-tooltip>
          A process executes the steps in a template. <br />
          Closing the UI will not interrupt any processes.
        </q-tooltip>
      </div>
      <div
        v-for="pd in processes"
        :key="pd.proc.id"
        class="rounded-borders depth-1 q-pl-sm q-gutter-y-xs column"
      >
        <div class="row q-mt-none">
          <div class="col-grow self-center text-bold text-blue-grey-4">
            {{ pd.proc.title }}
          </div>
          <q-btn
            flat
            icon="mdi-information-outline"
            class="col-auto"
            @click="show(pd.proc)"
          >
            <q-tooltip>Show process steps</q-tooltip>
          </q-btn>
          <q-btn
            flat
            icon="mdi-fast-forward"
            class="col-auto"
            @click="jump(pd.proc)"
          >
            <q-tooltip>Jump to step</q-tooltip>
          </q-btn>
          <q-btn
            flat
            icon="clear"
            class="col-auto"
            @click="removeProcess(pd.proc)"
          >
            <q-tooltip>Close and remove process</q-tooltip>
          </q-btn>
        </div>
        <div class="text-italic q-pr-sm">
          {{ pd.status }}
          <q-tooltip>
            <div
              class="monospace darkish"
              style="white-space: pre-line"
            >
              {{ pd.history || 'No history available' }}
            </div>
          </q-tooltip>
        </div>
        <div
          v-if="pd.error"
          class="text-negative q-pr-sm"
        >
          {{ pd.error }}
        </div>
        <div
          v-for="task in tasks"
          :key="task.id"
          class="row q-mr-sm q-mb-sm"
        >
          <div class="col-grow self-center q-pl-sm text-italic">
            {{ task.title }} ({{ task.ref }}) {{ task.status }}
          </div>
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

      <div class="text-h6 text-secondary">
        Available templates
        <q-tooltip>
          Templates are the blueprints for processes. <br />
          You can use the automation editor to create or change templates.
        </q-tooltip>
      </div>
      <div
        v-for="template in templates"
        :key="template.id"
        class="rounded-borders depth-1 q-pl-sm row items-center"
      >
        <div class="col-grow">
          {{ template.title }}
        </div>
        <q-btn
          flat
          icon="mdi-settings"
          class="col-auto"
          @click="edit(template)"
        >
          <q-tooltip>Edit template</q-tooltip>
        </q-btn>
        <q-btn
          flat
          icon="mdi-play"
          class="col-auto"
          :disable="!automationAvailable"
          @click="init(template)"
        >
          <q-tooltip>Create process</q-tooltip>
        </q-btn>
      </div>

      <div class="text-h6 text-secondary">
        All tasks
        <q-tooltip>
          Tasks are used to coordinate manual actions. <br />
          Processes can create tasks, and wait for the user to mark them as
          finished.
        </q-tooltip>
      </div>
      <div
        v-for="task in tasks"
        :key="task.id"
        class="rounded-borders depth-1 q-pl-sm row items-center"
      >
        <div class="col-grow">
          {{ task.title }} ({{ task.ref }}) {{ task.status }}
        </div>
        <q-btn
          flat
          class="col-auto"
          icon="delete"
          @click="removeTask(task)"
        >
          <q-tooltip>Remove task</q-tooltip>
        </q-btn>
        <q-btn
          v-if="task.status === 'Finished'"
          flat
          class="col-auto"
          icon="mdi-sync"
          @click="changeTaskStatus(task, 'Active')"
        >
          <q-tooltip>Mark task as active</q-tooltip>
        </q-btn>
        <q-btn
          v-else
          flat
          class="col-auto"
          icon="mdi-check"
          @click="changeTaskStatus(task, 'Finished')"
        >
          <q-tooltip>Mark task as finished</q-tooltip>
        </q-btn>
      </div>
    </div>
  </Card>
</template>
