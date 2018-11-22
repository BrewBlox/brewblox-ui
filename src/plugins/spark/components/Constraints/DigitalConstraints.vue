<script lang="ts">
import Component from 'vue-class-component';
import Constraints from './Constraints';
import { MutexLink } from '@/helpers/units/KnownLinks';

@Component({
  props: {
    readonly: {
      type: Boolean,
      default: false,
    },
  },
})
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

  label(k : string) {
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
        return { key, value: 0 };
    }
  }
}
</script>

<template>
  <div class="column gutter-y-xs">

    <div v-for="(cinfo, idx) in constraints" :key="idx">
      <div :class="{row: true, limiting: cinfo.limiting}" v-if="readonly">
        <span class="col">{{ label(cinfo.key) }}</span>
        <span class="col">{{ cinfo.value | unit }}</span>
      </div>
      <div class="row" v-else>
        <SelectPopupEdit clearable class="col-8" label="Constraint type" :options="constraintOptions" :field="cinfo.key" :change="callAndSaveConstraints(k => constraints[idx] = createConstraint(k))" />
        <component :is="fieldType(cinfo.key)" class="col" label="Constraint value" type="number" :serviceId="serviceId" :field="cinfo.value" :change="callAndSaveConstraints(v => cinfo.value = v)" />
        <q-btn class="col-1" icon="delete" @click="removeConstraint(idx); saveConstraints();" />
      </div>
    </div>

    <div v-if="!readonly" class="row gutter-x-cs">
      <q-btn label="Add constraint">
        <q-popover>
          <q-list separator link>
            <q-item v-close-overlay v-for="opt in constraintOptions" :key="opt.value" @click.native="constraints.push(createConstraint(opt.value)); saveConstraints();">
              {{ opt.label }}
            </q-item>
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
