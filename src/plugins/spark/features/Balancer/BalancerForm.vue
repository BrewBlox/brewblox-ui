<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockForm from '@/plugins/spark/components/BlockForm';

import { BalancerBlock } from './types';

@Component
export default class BalancerForm extends BlockForm {
  readonly block!: BalancerBlock;
}
</script>

<template>
  <q-card dark class="widget-modal">
    <WidgetFormToolbar v-if="!embedded" v-bind="$props" v-on="$listeners"/>
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
