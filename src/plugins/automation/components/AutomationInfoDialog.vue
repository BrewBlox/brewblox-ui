<script lang="ts">
import isString from 'lodash/isString';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { findById } from '@/helpers/functional';

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

  pretty({ impl }: HasImpl): string {
    return allSpecs[impl.type].pretty(impl);
  }

  nextTitle(transition: AutomationTransition): string {
    return isString(transition.next)
      ? findById(this.value.steps, transition.next)?.title ?? 'Unknown step'
      : transition.next
        ? '[Next Step]'
        : '[Process Exit]';
  }

  prettyList(values: HasImpl[]): string {
    return values.map(v => this.pretty(v)).join('\n');
  }

  get templateString(): string {
    return this.value
      .steps
      .map(step => ([
        '>>> Preconditions',
        step.preconditions.map(v => this.pretty(v)),
        '>>> Actions',
        step.actions.map(v => this.pretty(v)),
        '>>> Transitions',
        step.transitions.map(t => ([
          `>>> >>> ${this.nextTitle(t)}`,
          t.conditions.map(v => this.pretty(v)),
        ])),
      ]))
      .flat(3)
      .join('\n');
  }

  save(): void {
    this.onDialogOk();
  }
}
</script>

<template>
  <q-dialog
    ref="dialog"
    no-backdrop-dismiss
    @hide="onDialogHide"
    @keyup.enter="save"
  >
    <DialogCard v-bind="{title, message, html}">
      <q-expansion-item
        v-for="step in value.steps"
        :key="step.id"
        :label="step.title"
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
                To step {{ nextTitle(trans) }} if...
              </div>
              <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
              <div class="listed">{{ prettyList(trans.conditions) }}</div>
            </div>
          </div>
        </div>
      </q-expansion-item>
      <!-- <div style="white-space: pre-line">
        {{ templateString }}
      </div> -->
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
