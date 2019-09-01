<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';
import { spaceCased } from '@/helpers/functional';
import { prettify } from '@/helpers/units';
import { sparkStore } from '@/plugins/spark/store';
import { UserUnits } from '@/plugins/spark/types';


@Component
export default class SparkUnitMenu extends DialogBase {
  spaceCased = spaceCased;

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  get units(): UserUnits {
    return sparkStore.units(this.serviceId) || {};
  }

  unitAlternativeOptions(name: string): { label: string; value: any }[] {
    return (sparkStore.unitAlternatives(this.serviceId)[name] || [])
      .map(v => ({ label: prettify(v), value: v }));
  }

  saveUnits(vals: UserUnits = this.units): void {
    sparkStore.saveUnits([this.serviceId, vals])
      .catch(reason => this.$q.notify({
        icon: 'error',
        color: 'negative',
        message: `Failed to change unit: ${reason}`,
      }));
  }

  mounted(): void {
    sparkStore.fetchAll(this.serviceId);
  }
}
</script>

<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide">
    <q-card dark class="widget-modal">
      <DialogToolbar @close="onDialogHide">
        <q-item-section>
          <q-item-label>{{ serviceId }}</q-item-label>
          <q-item-label caption>
            Unit preferences
          </q-item-label>
        </q-item-section>
      </DialogToolbar>

      <q-card-section>
        <q-item dark>
          <q-item-section v-for="(val, name) in units" :key="name">
            <q-item-label caption>
              {{ `${spaceCased(name)} unit` }}
            </q-item-label>
            <SelectField
              :value="val"
              :options="unitAlternativeOptions(name)"
              :title="`Preferred ${spaceCased(name)} unit`"
              @input="v => { units[name] = v; saveUnits(); }"
            />
          </q-item-section>
        </q-item>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
