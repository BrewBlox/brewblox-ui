<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';
import { SetpointProfileBlock } from '@/plugins/spark/types';

@Component
export default class SetpointProfileBasic
  extends BlockCrudComponent<SetpointProfileBlock> {
}
</script>

<template>
  <div class="fit column">
    <div class="col-auto">
      <slot name="warnings" />
    </div>
    <div class="col full-width">
      <slot name="graph" />
    </div>
  </div>
</template>
