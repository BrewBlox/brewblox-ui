<script lang="ts">
import BlockForm from '@/plugins/spark/components/BlockForm';
import Component from 'vue-class-component';

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
    <BlockFormToolbar v-if="!$props.embedded" v-bind="$props" :block="block"/>
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
      <q-expansion-item default-opened group="modal" icon="mdi-cube" label="Block Settings">
        <BlockSettings v-bind="$props" :presets-data="presets()"/>
      </q-expansion-item>
    </q-card-section>
  </q-card>
</template>
