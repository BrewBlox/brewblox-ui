<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

import { spaceCased } from '@/helpers/functional';
import sparkStore from '@/plugins/spark/store';
import { UserUnits } from '@/plugins/spark/types';
import serviceStore from '@/store/services';


@Component({
  props: {
    serviceId: {
      type: String,
      required: true,
    },
  },
})
export default class SparkUnitMenu extends Vue {
  spaceCased = spaceCased;

  get service() {
    return serviceStore.serviceById(this.$props.serviceId);
  }

  get units(): UserUnits {
    return sparkStore.units(this.service.id) || {};
  }

  unitAlternativeOptions(name: string): { label: string; value: any }[] {
    return (sparkStore.unitAlternatives(this.service.id)[name] || [])
      .map(v => ({ label: v, value: v }));
  }

  saveUnits(vals: UserUnits = this.units) {
    sparkStore.saveUnits([this.service.id, vals])
      .catch(reason => this.$q.notify({
        icon: 'error',
        color: 'negative',
        message: `Failed to change unit: ${reason}`,
      }));
  }

  mounted() {
    sparkStore.fetchAll(this.service.id);
  }
}
</script>

<template>
  <q-card dark class="widget-modal">
    <FormToolbar>
      <q-item-section>
        <q-item-label>{{ service.id }}</q-item-label>
        <q-item-label caption>Unit preferences</q-item-label>
      </q-item-section>
    </FormToolbar>

    <q-card-section>
      <q-item dark>
        <q-item-section v-for="(val, name) in units" :key="name">
          <q-item-label caption>{{ `${spaceCased(name)} unit` }}</q-item-label>
          <SelectPopupEdit
            :field="val"
            :change="v => { units[name] = v; saveUnits(); }"
            :options="unitAlternativeOptions(name)"
            :label="`Preferred ${spaceCased(name)} unit`"
            tag="span"
          />
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
