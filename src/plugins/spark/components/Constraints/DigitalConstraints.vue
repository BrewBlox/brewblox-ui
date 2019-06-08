<script lang="ts">
import { Dialog } from 'quasar';
import { Component } from 'vue-property-decorator';

import { Unit } from '@/helpers/units';
import { MutexLink } from '@/helpers/units/KnownLinks';

import Constraints from './Constraints';

@Component
export default class DigitalConstraints extends Constraints {
  get constraintOptions() {
    return [...this.labels()].map(([k, v]) => ({ label: v, value: k }));
  }

  labels() {
    return new Map([
      ['minOff', 'Minimum OFF time'],
      ['minOn', 'Minimum ON time'],
      ['mutex', 'Mutually exclusive'],
    ]);
  }

  label(k: string) {
    return this.labels().get(k);
  }

  fieldType(key: string) {
    switch (key) {
      case 'minOff':
      case 'minOn':
        return 'UnitField';
      case 'mutex':
        return 'LinkField';
      default:
        return null;
    }
  }

  createConstraint(key: string, value: any = null) {
    switch (key) {
      case 'mutex':
        return { key, value: new MutexLink(value) };
      default:
        return { key, value: new Unit(0, 'second') };
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
      .onOk(keys => keys
        .forEach(key => {
          this.constraints.push(this.createConstraint(key));
          this.saveConstraints();
        }));
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
        <q-item-section class="col-1"/>
      </q-item>
      <q-separator v-if="!readonly" dark inset/>
      <q-item v-for="(cinfo, idx) in constraints" :key="idx" dark>
        <template v-if="readonly">
          <q-item-section :class="{ limiting: cinfo.limiting }">{{ label(cinfo.key) }}</q-item-section>
          <q-item-section>{{ cinfo.value | unit }}</q-item-section>
        </template>
        <template v-else>
          <q-item-section>
            <SelectField
              :value="cinfo.key"
              :options="constraintOptions"
              clearable
              title="Constraint type"
              @input="k => { constraints[idx] = createConstraint(k); saveConstraints() }"
            />
          </q-item-section>
          <q-item-section>
            <component
              :is="fieldType(cinfo.key)"
              :service-id="serviceId"
              :value="cinfo.value"
              title="Constraint value"
              type="number"
              @input="v => { cinfo.value = v; saveConstraints(); }"
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
        <q-item-section/>
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
