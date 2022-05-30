<script lang="ts">
import { PropType, defineComponent } from 'vue';

import { useDialog } from '@/composables';
import {
  BlockPatchImpl,
  BlockValueImpl,
  JSApplyImpl,
  JSCheckImpl,
  TaskEditImpl,
  TaskStatusImpl,
  TimeAbsoluteImpl,
  TimeElapsedImpl,
  WebhookImpl,
} from '@/shared-types';
import { shortDateString } from '@/utils/formatting';
import { matchesType } from '@/utils/objects';
import { durationString } from '@/utils/quantity';

import {
  AutomationImpl,
  AutomationTemplate,
  AutomationTransition,
} from './types';
import { nextTitle } from './utils';

type CompareOperator = BlockValueImpl['operator'];

interface OperatorOption extends SelectOption<CompareOperator> {
  desc: string;
}

export const operatorSymbols: OperatorOption[] = [
  { label: '==', value: 'eq', desc: 'Equal to' },
  { label: '!=', value: 'ne', desc: 'Not equal to' },
  { label: '<', value: 'lt', desc: 'Less than' },
  { label: '=<', value: 'le', desc: 'Less than or equal to' },
  { label: '>=', value: 'ge', desc: 'More than or equal to' },
  { label: '>', value: 'gt', desc: 'More than' },
];

const operator = (impl: BlockValueImpl): string =>
  operatorSymbols.find((op) => op.value === impl.operator)?.label ?? '???';

const prettifiers: Record<string, (impl: AutomationImpl) => string> = {
  BlockPatch: (impl) =>
    matchesType<BlockPatchImpl>('BlockPatch', impl)
      ? `Edit block '${impl.blockId}'`
      : `Invalid data: type=${impl.type}`,
  BlockValue: (impl) =>
    matchesType<BlockValueImpl>('BlockValue', impl)
      ? `${impl.blockId} '${impl.key}' ${operator(impl)} ${impl.value}`
      : `Invalid data: type=${impl.type}`,
  JSApply: (impl) =>
    matchesType<JSApplyImpl>('JSApply', impl)
      ? 'Scripted action is applied'
      : `Invalid data: type=${impl.type}`,
  JSCheck: (impl) =>
    matchesType<JSCheckImpl>('JSCheck', impl)
      ? 'Scripted condition is checked'
      : `Invalid data: type=${impl.type}`,
  TaskEdit: (impl) =>
    matchesType<TaskEditImpl>('TaskEdit', impl)
      ? `Edit task with ref '${impl.ref || '<not set>'}'`
      : `Invalid data: type=${impl.type}`,
  TaskStatus: (impl) =>
    matchesType<TaskStatusImpl>('TaskStatus', impl)
      ? `Task with ref '${impl.ref}' must be ${impl.status}`
      : `Invalid data: type=${impl.type}`,
  TimeAbsolute: (impl) =>
    matchesType<TimeAbsoluteImpl>('TimeAbsolute', impl)
      ? `Current date/time must be past ${shortDateString(impl.time)}`
      : `Invalid data: type=${impl.type}`,
  TimeElapsed: (impl) =>
    matchesType<TimeElapsedImpl>('TimeElapsed', impl)
      ? `Step must have been active for ${durationString(impl.duration)}`
      : `Invalid data: type=${impl.type}`,
  Webhook: (impl) =>
    matchesType<WebhookImpl>('Webhook', impl)
      ? `Send HTTP ${impl.method} request to ${impl.url}`
      : `Invalid data: type=${impl.type}`,
};

interface HasImpl {
  impl: AutomationImpl;
}

export default defineComponent({
  name: 'AutomationInfoDialog',
  props: {
    ...useDialog.props,
    modelValue: {
      type: Object as PropType<AutomationTemplate>,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    initialStepId: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
  },
  emits: [...useDialog.emits],
  setup(props) {
    const { dialogRef, dialogProps, onDialogHide, onDialogOK, onDialogCancel } =
      useDialog.setup();

    function pretty({ impl }: HasImpl): string {
      return prettifiers[impl.type]?.(impl) ?? 'Unknown';
    }

    function prettyList(values: HasImpl[]): string {
      return values.map(pretty).join('\n');
    }

    function nextStepTitle(transition: AutomationTransition): string {
      return nextTitle(props.modelValue, transition);
    }

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogOK,
      onDialogCancel,
      pretty,
      prettyList,
      nextStepTitle,
    };
  },
});
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogProps"
    @hide="onDialogHide"
    @keyup.enter="onDialogOK"
  >
    <DialogCard v-bind="{ title, message, html }">
      <q-expansion-item
        v-for="step in modelValue.steps"
        :key="step.id"
        :label="step.title"
        :default-opened="step.id === initialStepId"
        header-class="text-secondary"
        header-style="font-size: 120%"
        group="steps"
      >
        <div class="q-pl-md">
          <div class="q-pl-sm step-data">
            <div>Preconditions</div>
            <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
            <div class="listed">{{ prettyList(step.preconditions) }}</div>
            <div>Actions</div>
            <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
            <div class="listed">{{ prettyList(step.actions) }}</div>
            <div>Transitions</div>
            <div
              v-for="trans in step.transitions"
              :key="trans.id"
              class="step-data"
            >
              <div>To step {{ nextStepTitle(trans) }} if...</div>
              <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
              <div class="listed">{{ prettyList(trans.conditions) }}</div>
            </div>
          </div>
        </div>
      </q-expansion-item>
      <template #actions>
        <q-btn
          flat
          label="OK"
          color="primary"
          @click="onDialogOK"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>

<style
  lang="sass"
  scoped
>
.pre-line
  white-space: pre-line

.step-data > div:nth-child(odd)
  font-weight: bold

.step-data > div:nth-child(even)
  padding-left: 10px
  padding-bottom: 5px

.listed
  white-space: pre-line
</style>
