<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { spaceCased } from '@/helpers/functional';
import { prettify } from '@/helpers/units';
import sparkStore from '@/plugins/spark/store';
import { UserUnits } from '@/plugins/spark/types';


@Component
export default class SparkUnitMenu extends Vue {
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

  saveUnits(vals: UserUnits = this.units) {
    sparkStore.saveUnits([this.serviceId, vals])
      .catch(reason => this.$q.notify({
        icon: 'error',
        color: 'negative',
        message: `Failed to change unit: ${reason}`,
      }));
  }

  mounted() {
    sparkStore.fetchAll(this.serviceId);
  }
}
</script>

<template>
  <q-card dark class="widget-modal">
    <FormToolbar>
      <q-item-section>
        <q-item-label>{{ serviceId }}</q-item-label>
        <q-item-label caption>Unit preferences</q-item-label>
      </q-item-section>
    </FormToolbar>

    <q-card-section>
      <q-item dark>
        <q-item-section v-for="(val, name) in units" :key="name">
          <q-item-label caption>{{ `${spaceCased(name)} unit` }}</q-item-label>
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
</template>
