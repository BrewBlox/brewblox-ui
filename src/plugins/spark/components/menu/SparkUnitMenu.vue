<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { spaceCased } from '@/helpers/functional';
import notify from '@/helpers/notify';
import { prettify } from '@/helpers/units';
import { userUnitChoices } from '@/plugins/spark/getters';
import { sparkStore } from '@/plugins/spark/store';
import { UserUnitKey, UserUnits } from '@/plugins/spark/types';


@Component
export default class SparkUnitMenu extends DialogBase {
  spaceCased = spaceCased;

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  get units(): UserUnits {
    return sparkStore.units(this.serviceId) ?? {};
  }

  unitAlternativeOptions(key: UserUnitKey): SelectOption[] {
    const values = userUnitChoices[key];
    return values.map(value => ({ value, label: prettify(value) }));
  }

  saveUnits(vals: UserUnits = this.units): void {
    sparkStore.saveUnits([this.serviceId, vals])
      .catch(e => notify.error(`Failed to change unit: ${e.message}`));
  }
}
</script>

<template>
  <q-dialog ref="dialog" :maximized="$dense" no-backdrop-dismiss @hide="onDialogHide">
    <CardWrapper v-bind="{context}">
      <template #toolbar>
        <DialogToolbar :title="serviceId" subtitle="Unit preferences" />
      </template>

      <q-card-section>
        <q-item>
          <q-item-section v-for="(val, name) in units" :key="name">
            <SelectField
              :value="val"
              :options="unitAlternativeOptions(name)"
              :title="`Preferred ${spaceCased(name)} unit`"
              :label="`${spaceCased(name)} unit`"
              @input="v => { units[name] = v; saveUnits(); }"
            />
          </q-item-section>
        </q-item>
      </q-card-section>
    </CardWrapper>
  </q-dialog>
</template>
