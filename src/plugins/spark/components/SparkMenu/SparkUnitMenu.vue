<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import serviceStore from '@/store/services';
import { units, unitAlternatives } from '../../store/getters';
import { UserUnits } from '../../state';
import { saveUnits, fetchAll } from '../../store/actions';
import { spaceCased } from '@/helpers/functional';


@Component({
  props: {
    serviceId: {
      type: String,
      required: true,
    },
  },
})
export default class SparkUnitMenu extends Vue {
  $q: any;
  spaceCased = spaceCased;

  get service() {
    return serviceStore.serviceById(this.$props.serviceId);
  }

  get units(): UserUnits {
    return units(this.$store, this.service.id);
  }

  get unitAlternatives() {
    return unitAlternatives(this.$store, this.service.id);
  }

  unitAlternativeOptions(name: string): string[] {
    return (this.unitAlternatives[name] || [])
      .map(val => ({ label: val, value: val }));
  }

  saveUnits(vals: UserUnits = this.units) {
    saveUnits(this.$store, this.service.id, vals)
      .catch(reason => this.$q.notify({
        icon: 'error',
        color: 'negative',
        message: `Failed to change unit: ${reason}`,
      }));
  }

  mounted() {
    fetchAll(this.$store, this.service);
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
