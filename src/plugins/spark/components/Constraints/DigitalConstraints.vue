<script lang="ts">
import { MutexLink } from '@/helpers/units/KnownLinks';
import Component from 'vue-class-component';
import Constraints from './Constraints';

@Component
export default class DigitalConstraints extends Constraints {
  get constraintOptions() {
    return [
      'minOff',
      'minOn',
      'mutex',
    ]
      .map(v => ({ label: v, value: v }));
  }

  fieldType(key: string) {
    switch (key) {
      case 'minOff':
      case 'minOn':
        return 'InputPopupEdit';
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

    <div v-for="(cinfo, idx) in constraints" :key="idx" class="row gutter-x-xs">
      <SelectPopupEdit clearable class="col-4" label="Constraint type" :options="constraintOptions" :field="cinfo.key" :change="callAndSaveConstraints(k => constraints[idx] = createConstraint(k))" />
      <component :is="fieldType(cinfo.key)" class="col" label="Constraint value" type="number" :serviceId="serviceId" :field="cinfo.value" :change="callAndSaveConstraints(v => cinfo.value = v)" />
      <q-btn class="col-1" icon="delete" @click="removeConstraint(idx); saveConstraints();" />
    </div>

    <div class="row gutter-x-cs">
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
</style>
