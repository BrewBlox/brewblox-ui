<script lang="ts">
import { Dialog } from 'quasar';
import { Component } from 'vue-property-decorator';

import { Unit } from '@/helpers/units';
import { MutexLink } from '@/helpers/units/KnownLinks';

import { digitalConstraintLabels } from '../../helpers';
import ConstraintsBase, { EditableConstraint } from './ConstraintsBase';

@Component
export default class DigitalConstraints extends ConstraintsBase {
  get constraintOptions() {
    return [...digitalConstraintLabels].map(([k, v]) => ({ label: v, value: k }));
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
  <q-list dark dense>
    <q-item dark>
      <q-item-section>Constraint Type</q-item-section>
      <q-item-section>Constraint Value</q-item-section>
      <q-item-section class="col-1" />
    </q-item>
    <q-separator dark inset />
    <q-item
      v-for="(editable, idx) in constraints"
      :key="idx"
      :class="editable.limiting ? 'limiting' : ''"
      dark
    >
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
    </q-item>
    <q-item dark class="q-mt-md">
      <q-item-section />
      <q-item-section class="col-auto">
        <q-btn icon="add" round outline @click="addConstraint">
          <q-tooltip>Add constraint</q-tooltip>
        </q-btn>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<style scoped>
.limiting {
  color: orange;
}
</style>
