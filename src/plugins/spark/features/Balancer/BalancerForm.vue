<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockForm from '@/plugins/spark/components/BlockForm';

@Component
export default class BalancerForm extends BlockForm {
  defaultData() {
    return {
      clients: [],
    };
  }

  presets() {
    return [];
  }

  created() {
    this.block; // ensure getter is evaluated
  }
}
</script>

<template>
  <q-card dark class="widget-modal">
    <WidgetFormToolbar v-if="!embedded" v-bind="$props"/>
    <q-card-section>
      <q-item dark>
        <q-item-section>
          <q-item-label caption>Note</q-item-label>
          <span>
            To power balance multiple analog actuators,
            set a balanced constraint on them with this block as target.
          </span>
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
