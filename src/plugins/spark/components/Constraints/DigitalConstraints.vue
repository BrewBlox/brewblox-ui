<script lang="ts">
import { Dialog } from 'quasar';
import { Component } from 'vue-property-decorator';

import { Unit } from '@/helpers/units';
import { MutexLink } from '@/helpers/units/KnownLinks';

import { constraintLabels } from '../../helpers';
import ConstraintsBase, { EditableConstraint } from './ConstraintsBase';

@Component
export default class DigitalConstraints extends ConstraintsBase {
  get constraintOptions() {
    return [...constraintLabels].map(([k, v]) => ({ label: v, value: k }));
  }

  label(k: string) {
    return constraintLabels.get(k);
  }

  createConstraint(key: string, value: any = null): EditableConstraint {
    switch (key) {
      case 'mutex':
        return {
          key,
          value: new MutexLink(value),
          limiting: false,
        };
      default:
        return {
          key,
          value: new Unit(0, 'second'),
          limiting: false,
        };
    }
  }

  addConstraint() {
    Dialog.create({
      title: 'Add constraint',
      dark: true,
      cancel: true,
      options: {
        type: 'checkbox',
        model: [],
        items: this.constraintOptions,
      },
    })
      .onOk(keys => {
        this.constraints.push(...keys.map(this.createConstraint));
        this.saveConstraints();
      });
  }
}
</script>

<template>
  <div>
    <q-item-label v-if="constraints.length !== 0 && readonly" caption>Constraints</q-item-label>
    <q-list dark dense>
      <q-item v-if="!readonly" dark>
        <q-item-section>Constraint Type</q-item-section>
        <q-item-section>Constraint Value</q-item-section>
        <q-item-section class="col-1" />
      </q-item>
      <q-separator v-if="!readonly" dark inset />
      <q-item v-for="(editable, idx) in constraints" :key="idx" dark>
        <template v-if="readonly">
          <q-item-section :class="{ limiting: editable.limiting }">{{ label(editable.key) }}</q-item-section>
          <q-item-section>
            <LinkField
              v-if="editable.key === 'mutex'"
              :service-id="serviceId"
              :value="editable.value"
              readonly
            />
            <TimeUnitField v-else :value="editable.value" readonly />
          </q-item-section>
        </template>
        <template v-else>
          <q-item-section>
            <SelectField
              :value="editable.key"
              :options="constraintOptions"
              clearable
              title="Constraint type"
              @input="k => { constraints[idx] = createConstraint(k); saveConstraints() }"
            />
          </q-item-section>
          <q-item-section>
            <LinkField
              v-if="editable.key === 'mutex'"
              :service-id="serviceId"
              :value="editable.value"
              title="Mutex"
              @input="v => { editable.value = v; saveConstraints(); }"
            />
            <TimeUnitField
              v-else
              :value="editable.value"
              title="Constraint value"
              @input="v => { editable.value = v; saveConstraints(); }"
            />
          </q-item-section>
          <q-item-section class="col-1">
            <q-btn icon="delete" flat round @click="removeConstraint(idx); saveConstraints();">
              <q-tooltip>Remove constraint</q-tooltip>
            </q-btn>
          </q-item-section>
        </template>
      </q-item>
      <q-item v-if="!readonly" dark class="q-mt-md">
        <q-item-section />
        <q-item-section class="col-auto">
          <q-btn icon="add" fab outline @click="addConstraint">
            <q-tooltip>Add constraint</q-tooltip>
          </q-btn>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<style scoped>
.limiting {
  color: red;
}
</style>
