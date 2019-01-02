<script lang="ts">
import { Unit } from '@/helpers/units';
import { MutexLink } from '@/helpers/units/KnownLinks';
import Component from 'vue-class-component';
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
        return 'UnitPopupEdit';
      case 'mutex':
        return 'LinkPopupEdit';
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
}
</script>

<template>
  <div class="column gutter-y-xs">
    <div v-for="(cinfo, idx) in constraints" :key="idx">
      <div v-if="readonly" :class="{row: true, limiting: cinfo.limiting}">
        <span class="col">{{ label(cinfo.key) }}</span>
        <span class="col">{{ cinfo.value | unit }}</span>
      </div>
      <div v-else class="row">
        <SelectPopupEdit
          :options="constraintOptions"
          :field="cinfo.key"
          :change="callAndSaveConstraints(k => constraints[idx] = createConstraint(k))"
          clearable
          class="col-8"
          label="Constraint type"
        />
        <component
          :is="fieldType(cinfo.key)"
          :service-id="serviceId"
          :field="cinfo.value"
          :change="callAndSaveConstraints(v => cinfo.value = v)"
          class="col"
          label="Constraint value"
          type="number"
        />
        <q-btn class="col-1" icon="delete" @click="removeConstraint(idx); saveConstraints();"/>
      </div>
    </div>
    <div v-if="!readonly" class="row gutter-x-cs">
      <q-btn label="Add constraint">
        <q-popover>
          <q-list separator link="">
            <q-item
              v-close-overlay
              v-for="opt in constraintOptions"
              :key="opt.value"
              @click.native="constraints.push(createConstraint(opt.value)); saveConstraints();"
            >{{ opt.label }}</q-item>
          </q-list>
        </q-popover>
      </q-btn>
    </div>
  </div>
</template>

<style scoped>
.limiting {
  color: red;
}
</style>
