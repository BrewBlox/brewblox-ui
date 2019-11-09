<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';
import { SetpointProfileBlock } from './types';

@Component
export default class SetpointProfileBasic extends BlockCrudComponent {
  readonly block!: SetpointProfileBlock;
}
</script>

<template>
  <q-card dark v-bind="$attrs">
    <slot name="toolbar" />
    <slot name="warnings" />
    <div class="col">
      <slot name="graph" />
    </div>
  </q-card>
</template>
