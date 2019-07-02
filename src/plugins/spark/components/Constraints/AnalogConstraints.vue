<script lang="ts">
import { Dialog } from 'quasar';
import { Component } from 'vue-property-decorator';

import { BalancerLink } from '@/helpers/units/KnownLinks';

import { constraintLabels } from '../../helpers';
import ConstraintsBase, { EditableConstraint } from './ConstraintsBase';

@Component
export default class AnalogConstraints extends ConstraintsBase {
  get constraintOptions() {
    return [...constraintLabels].map(([k, v]) => ({ label: v, value: k }));
  }

  label(k: string) {
    return constraintLabels.get(k);
  }

  editableValue(editable: EditableConstraint) {
    return editable.key === 'balanced'
      ? editable.value.granted
      : editable.value;
  }

  createConstraint(key: string, value: any = null): EditableConstraint {
    switch (key) {
      case 'balanced':
        return {
          key,
          value: {
            balancerId: new BalancerLink(value),
            granted: 0,
            id: 0,
          },
          limiting: false,
        };
      default:
        return {
          key,
          value: 0,
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
      <q-item v-for="(editable, idx) in constraints" :key="idx" dark dense>
        <template v-if="readonly">
          <q-item-section :class="{ limiting: editable.limiting }">{{ label(editable.key) }}</q-item-section>
          <q-item-section>{{ editableValue(editable) | round }}</q-item-section>
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
              v-if="editable.key === 'balanced'"
              :service-id="serviceId"
              :value="editable.value.balancerId"
              title="Balancer"
              @input="v => { editable.value.balancerId = v; saveConstraints() }"
            />
            <InputField
              v-else
              :value="editable.value"
              title="Constraint value"
              type="number"
              @input="v => { editable.value = v; saveConstraints() }"
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
