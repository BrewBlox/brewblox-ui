<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

import { SetpointProfileBlock } from './types';

@Component
export default class SetpointProfileBasic
  extends BlockCrudComponent<SetpointProfileBlock> {
}
</script>

<template>
  <div class="fit column">
    <slot name="warnings" />
    <div class="col">
      <slot name="graph" />
    </div>
  </div>
</template>
