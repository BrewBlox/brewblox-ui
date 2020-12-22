<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';

import { nextTitle } from '../helpers';
import { allSpecs } from '../impl/specs';
import {
  AutomationImpl,
  AutomationTemplate,
  AutomationTransition,
} from '../types';


interface HasImpl {
  impl: AutomationImpl;
}

@Component
export default class AutomationInfoDialog extends DialogBase {

  @Prop({ type: Object, required: true })
  public readonly value!: AutomationTemplate;

  @Prop({ type: String, required: true })
  public readonly title!: string;

  @Prop({ type: String, required: false })
  public readonly initialStepId!: string | undefined;

  pretty({ impl }: HasImpl): string {
    return allSpecs[impl.type].pretty(impl);
  }

  prettyList(values: HasImpl[]): string {
    return values.map(v => this.pretty(v)).join('\n');
  }

  nextStepTitle(transition: AutomationTransition): string {
    return nextTitle(this.value, transition);
  }

  save(): void {
    this.onDialogOk();
  }
}
</script>

<template>
  <q-dialog
    ref="dialog"
    v-bind="dialogProps"
    @hide="onDialogHide"
    @keyup.enter="save"
  >
    <DialogCard v-bind="{title, message, html}">
      <q-expansion-item
        v-for="step in value.steps"
        :key="step.id"
        :label="step.title"
        :default-opened="step.id === initialStepId"
        header-class="text-secondary"
        header-style="font-size: 120%"
        group="steps"
      >
        <div class="q-pl-md">
          <div class="q-pl-sm step-data">
            <div>
              Preconditions
            </div>
            <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
            <div class="listed">{{ prettyList(step.preconditions) }}</div>
            <div>
              Actions
            </div>
            <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
            <div class="listed">{{ prettyList(step.actions) }}</div>
            <div>
              Transitions
            </div>
            <div
              v-for="trans in step.transitions"
              :key="trans.id"
              class="step-data"
            >
              <div>
                To step {{ nextStepTitle(trans) }} if...
              </div>
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
          @click="save"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>

<style lang="sass" scoped>
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
